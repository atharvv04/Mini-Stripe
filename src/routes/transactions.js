const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, status, paymentLinkId } = req.query;

    const offset = (page - 1) * limit;
    const limitNum = parseInt(limit);

    // Build query conditions
    let whereConditions = ['pl.user_id = $1'];
    let params = [user.id];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`t.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (paymentLinkId) {
      whereConditions.push(`pl.link_id = $${paramIndex}`);
      params.push(paymentLinkId);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get transactions with payment link details
    const result = await query(
      `SELECT 
        t.id, t.payment_link_id, t.payer_email, t.payer_name,
        t.amount, t.currency, t.status, t.payment_method,
        t.card_last4, t.card_brand, t.bank_response_code,
        t.bank_response_message, t.failure_reason, t.processed_at,
        t.created_at, t.updated_at,
        pl.link_id, pl.description as payment_description
       FROM transactions t
       JOIN payment_links pl ON t.payment_link_id = pl.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limitNum, offset],
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM transactions t
       JOIN payment_links pl ON t.payment_link_id = pl.id
       ${whereClause}`,
      params,
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limitNum);

    const transactions = result.rows.map(transaction => ({
      id: transaction.id,
      paymentLinkId: transaction.payment_link_id,
      linkId: transaction.link_id,
      payerEmail: transaction.payer_email,
      payerName: transaction.payer_name,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.payment_method,
      cardLast4: transaction.card_last4,
      cardBrand: transaction.card_brand,
      bankResponseCode: transaction.bank_response_code,
      bankResponseMessage: transaction.bank_response_message,
      failureReason: transaction.failure_reason,
      processedAt: transaction.processed_at,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
      paymentDescription: transaction.payment_description,
    }));

    res.json({
      success: true,
      data: {
        transactions,
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
 * @route   GET /api/transactions/:transactionId
 * @desc    Get a specific transaction by ID
 * @access  Private
 */
router.get('/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { user } = req;

    const result = await query(
      `SELECT 
        t.id, t.payment_link_id, t.payer_email, t.payer_name,
        t.amount, t.currency, t.status, t.payment_method,
        t.card_last4, t.card_brand, t.bank_response_code,
        t.bank_response_message, t.failure_reason, t.processed_at,
        t.created_at, t.updated_at,
        pl.link_id, pl.description as payment_description,
        pl.amount as original_amount, pl.currency as original_currency
       FROM transactions t
       JOIN payment_links pl ON t.payment_link_id = pl.id
       WHERE t.id = $1 AND pl.user_id = $2`,
      [transactionId, user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    const transaction = result.rows[0];

    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          paymentLinkId: transaction.payment_link_id,
          linkId: transaction.link_id,
          payerEmail: transaction.payer_email,
          payerName: transaction.payer_name,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          paymentMethod: transaction.payment_method,
          cardLast4: transaction.card_last4,
          cardBrand: transaction.card_brand,
          bankResponseCode: transaction.bank_response_code,
          bankResponseMessage: transaction.bank_response_message,
          failureReason: transaction.failure_reason,
          processedAt: transaction.processed_at,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
          paymentDescription: transaction.payment_description,
          originalAmount: transaction.original_amount,
          originalCurrency: transaction.original_currency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary statistics for the authenticated user
 * @access  Private
 */
router.get('/summary', async (req, res, next) => {
  try {
    const { user } = req;
    const { period = '30' } = req.query; // days

    const daysAgo = parseInt(period);

    const result = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_amount,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END), 0) as average_amount
       FROM transactions t
       JOIN payment_links pl ON t.payment_link_id = pl.id
       WHERE pl.user_id = $1 AND t.created_at >= NOW() - INTERVAL '${daysAgo} days'`,
      [user.id],
    );

    const summary = result.rows[0];

    res.json({
      success: true,
      data: {
        summary: {
          period: `${daysAgo} days`,
          totalTransactions: parseInt(summary.total_transactions),
          completedTransactions: parseInt(summary.completed_transactions),
          failedTransactions: parseInt(summary.failed_transactions),
          pendingTransactions: parseInt(summary.pending_transactions),
          totalAmount: parseFloat(summary.total_amount),
          averageAmount: parseFloat(summary.average_amount),
          successRate: summary.total_transactions > 0 
            ? ((summary.completed_transactions / summary.total_transactions) * 100).toFixed(2)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 