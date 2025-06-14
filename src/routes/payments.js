const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const { query } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/payments/links
 * @desc    Create a new payment link
 * @access  Private
 */
router.post('/links', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date'),
  body('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max uses must be a positive integer'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { amount, currency = 'USD', description, expiresAt, maxUses } = req.body;
    const { user } = req;

    // Generate unique link ID
    const linkId = uuidv4().replace(/-/g, '').substring(0, 16);

    // Set expiry date if provided, otherwise use default
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = moment(expiresAt).toDate();
    } else {
      const defaultExpiryHours = parseInt(process.env.PAYMENT_LINK_EXPIRY_HOURS) || 24;
      expiryDate = moment().add(defaultExpiryHours, 'hours').toDate();
    }

    // Create payment link
    const result = await query(
      `INSERT INTO payment_links (
        user_id, link_id, amount, currency, description, 
        expires_at, max_uses, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, link_id, amount, currency, description, 
                expires_at, max_uses, current_uses, created_at`,
      [user.id, linkId, amount, currency, description, expiryDate, maxUses, true],
    );

    const paymentLink = result.rows[0];

    // Generate full payment URL
    const baseUrl = process.env.PAYMENT_LINK_BASE_URL || 'http://localhost:3000/pay';
    const paymentUrl = `${baseUrl}/${linkId}`;

    logger.info(`Payment link created by user ${user.id}: ${linkId}`);

    res.status(201).json({
      success: true,
      message: 'Payment link created successfully',
      data: {
        paymentLink: {
          id: paymentLink.id,
          linkId: paymentLink.link_id,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          description: paymentLink.description,
          expiresAt: paymentLink.expires_at,
          maxUses: paymentLink.max_uses,
          currentUses: paymentLink.current_uses,
          createdAt: paymentLink.created_at,
          paymentUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payments/links
 * @desc    Get all payment links for the authenticated user
 * @access  Private
 */
router.get('/links', async (req, res, next) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const limitNum = parseInt(limit);

    // Build query based on status filter
    let whereClause = 'WHERE pl.user_id = $1';
    let params = [user.id];
    let paramIndex = 2;

    if (status === 'active') {
      whereClause += ` AND pl.is_active = true AND (pl.expires_at IS NULL OR pl.expires_at > NOW())`;
    } else if (status === 'expired') {
      whereClause += ` AND (pl.expires_at IS NOT NULL AND pl.expires_at <= NOW())`;
    } else if (status === 'inactive') {
      whereClause += ` AND pl.is_active = false`;
    }

    // Get payment links with transaction count
    const result = await query(
      `SELECT 
        pl.id, pl.link_id, pl.amount, pl.currency, pl.description,
        pl.expires_at, pl.max_uses, pl.current_uses, pl.is_active,
        pl.created_at, pl.updated_at,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_collected
       FROM payment_links pl
       LEFT JOIN transactions t ON pl.id = t.payment_link_id
       ${whereClause}
       GROUP BY pl.id
       ORDER BY pl.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limitNum, offset],
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM payment_links pl
       ${whereClause}`,
      params,
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limitNum);

    // Generate payment URLs
    const baseUrl = process.env.PAYMENT_LINK_BASE_URL || 'http://localhost:3000/pay';
    const paymentLinks = result.rows.map(link => ({
      id: link.id,
      linkId: link.link_id,
      amount: link.amount,
      currency: link.currency,
      description: link.description,
      expiresAt: link.expires_at,
      maxUses: link.max_uses,
      currentUses: link.current_uses,
      isActive: link.is_active,
      createdAt: link.created_at,
      updatedAt: link.updated_at,
      transactionCount: parseInt(link.transaction_count),
      totalCollected: parseFloat(link.total_collected),
      paymentUrl: `${baseUrl}/${link.link_id}`,
    }));

    res.json({
      success: true,
      data: {
        paymentLinks,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payments/links/:linkId
 * @desc    Get a specific payment link by ID
 * @access  Private
 */
router.get('/links/:linkId', async (req, res, next) => {
  try {
    const { linkId } = req.params;
    const { user } = req;

    const result = await query(
      `SELECT 
        pl.id, pl.link_id, pl.amount, pl.currency, pl.description,
        pl.expires_at, pl.max_uses, pl.current_uses, pl.is_active,
        pl.created_at, pl.updated_at,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_collected
       FROM payment_links pl
       LEFT JOIN transactions t ON pl.id = t.payment_link_id
       WHERE pl.link_id = $1 AND pl.user_id = $2
       GROUP BY pl.id`,
      [linkId, user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment link not found',
      });
    }

    const link = result.rows[0];
    const baseUrl = process.env.PAYMENT_LINK_BASE_URL || 'http://localhost:3000/pay';

    res.json({
      success: true,
      data: {
        paymentLink: {
          id: link.id,
          linkId: link.link_id,
          amount: link.amount,
          currency: link.currency,
          description: link.description,
          expiresAt: link.expires_at,
          maxUses: link.max_uses,
          currentUses: link.current_uses,
          isActive: link.is_active,
          createdAt: link.created_at,
          updatedAt: link.updated_at,
          transactionCount: parseInt(link.transaction_count),
          totalCollected: parseFloat(link.total_collected),
          paymentUrl: `${baseUrl}/${link.link_id}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/payments/links/:linkId
 * @desc    Update a payment link
 * @access  Private
 */
router.put('/links/:linkId', [
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { linkId } = req.params;
    const { description, isActive } = req.body;
    const { user } = req;

    // Check if payment link exists and belongs to user
    const existingLink = await query(
      'SELECT id FROM payment_links WHERE link_id = $1 AND user_id = $2',
      [linkId, user.id],
    );

    if (existingLink.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment link not found',
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    // Add link_id and user_id to params
    params.push(linkId, user.id);

    const result = await query(
      `UPDATE payment_links 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE link_id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING id, link_id, amount, currency, description, 
                 expires_at, max_uses, current_uses, is_active, updated_at`,
      params,
    );

    const updatedLink = result.rows[0];

    logger.info(`Payment link updated by user ${user.id}: ${linkId}`);

    res.json({
      success: true,
      message: 'Payment link updated successfully',
      data: {
        paymentLink: {
          id: updatedLink.id,
          linkId: updatedLink.link_id,
          amount: updatedLink.amount,
          currency: updatedLink.currency,
          description: updatedLink.description,
          expiresAt: updatedLink.expires_at,
          maxUses: updatedLink.max_uses,
          currentUses: updatedLink.current_uses,
          isActive: updatedLink.is_active,
          updatedAt: updatedLink.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 