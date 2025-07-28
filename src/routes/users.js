const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const { query } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { user } = req;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
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

    const { firstName, lastName } = req.body;
    const { user } = req;

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      params.push(firstName);
      paramIndex++;
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      params.push(lastName);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    // Add user_id to params
    params.push(user.id);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, created_at, updated_at`,
      params,
    );

    const updatedUser = result.rows[0];

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
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

    const { currentPassword, newPassword } = req.body;
    const { user } = req;

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const currentPasswordHash = result.rows[0].password_hash;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, user.id],
    );

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const { user } = req;

    // Get payment links count
    const linksResult = await query(
      `SELECT 
        COUNT(*) as total_links,
        COUNT(CASE WHEN is_active = true AND (expires_at IS NULL OR expires_at > NOW()) THEN 1 END) as active_links,
        COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at <= NOW() THEN 1 END) as expired_links
       FROM payment_links 
       WHERE user_id = $1`,
      [user.id],
    );

    // Get transactions summary
    const transactionsResult = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN t.amount ELSE 0 END), 0) as total_amount
       FROM transactions t
       JOIN payment_links pl ON t.payment_link_id = pl.id
       WHERE pl.user_id = $1`,
      [user.id],
    );

    // Get recent transactions
    const recentTransactionsResult = await query(
      `SELECT 
        t.id, t.amount, t.currency, t.status, t.created_at,
        pl.link_id, pl.description
       FROM transactions t
       JOIN payment_links pl ON t.payment_link_id = pl.id
       WHERE pl.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [user.id],
    );

    // Get recent payment links
    const recentLinksResult = await query(
      `SELECT 
        id, link_id, amount, currency, description, 
        is_active, created_at, current_uses
       FROM payment_links 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [user.id],
    );

    const linksData = linksResult.rows[0];
    const transactionsData = transactionsResult.rows[0];

    res.json({
      success: true,
      data: {
        dashboard: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          },
          stats: {
            totalLinks: parseInt(linksData.total_links),
            activeLinks: parseInt(linksData.active_links),
            expiredLinks: parseInt(linksData.expired_links),
            totalTransactions: parseInt(transactionsData.total_transactions),
            completedTransactions: parseInt(transactionsData.completed_transactions),
            totalAmount: parseFloat(transactionsData.total_amount),
          },
          recentTransactions: recentTransactionsResult.rows.map(t => ({
            id: t.id,
            amount: t.amount,
            currency: t.currency,
            status: t.status,
            createdAt: t.created_at,
            linkId: t.link_id,
            description: t.description,
          })),
          recentLinks: recentLinksResult.rows.map(l => ({
            id: l.id,
            linkId: l.link_id,
            amount: l.amount,
            currency: l.currency,
            description: l.description,
            isActive: l.is_active,
            createdAt: l.created_at,
            currentUses: l.current_uses,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 