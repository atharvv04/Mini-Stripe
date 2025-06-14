const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const { query } = require('../database/connection');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /pay/:linkId
 * @desc    Get payment link details for public access
 * @access  Public
 */
router.get('/:linkId', async (req, res, next) => {
  try {
    const { linkId } = req.params;

    const result = await query(
      `SELECT 
        pl.id, pl.link_id, pl.amount, pl.currency, pl.description,
        pl.expires_at, pl.max_uses, pl.current_uses, pl.is_active,
        pl.created_at,
        u.first_name, u.last_name
       FROM payment_links pl
       JOIN users u ON pl.user_id = u.id
       WHERE pl.link_id = $1`,
      [linkId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment link not found',
      });
    }

    const paymentLink = result.rows[0];

    // Check if link is active
    if (!paymentLink.is_active) {
      return res.status(400).json({
        success: false,
        error: 'This payment link is inactive',
      });
    }

    // Check if link has expired
    if (paymentLink.expires_at && moment(paymentLink.expires_at).isBefore(moment())) {
      return res.status(400).json({
        success: false,
        error: 'This payment link has expired',
      });
    }

    // Check if link has reached max uses
    if (paymentLink.max_uses && paymentLink.current_uses >= paymentLink.max_uses) {
      return res.status(400).json({
        success: false,
        error: 'This payment link has reached its maximum usage limit',
      });
    }

    res.json({
      success: true,
      data: {
        paymentLink: {
          linkId: paymentLink.link_id,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          description: paymentLink.description,
          expiresAt: paymentLink.expires_at,
          maxUses: paymentLink.max_uses,
          currentUses: paymentLink.current_uses,
          createdAt: paymentLink.created_at,
          merchantName: `${paymentLink.first_name} ${paymentLink.last_name}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /pay/:linkId/process
 * @desc    Process a payment through the payment link
 * @access  Public
 */
router.post('/:linkId/process', [
  body('payerEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('payerName')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Payer name is required and must be less than 255 characters'),
  body('cardNumber')
    .isLength({ min: 13, max: 19 })
    .withMessage('Card number must be between 13 and 19 digits')
    .matches(/^\d+$/)
    .withMessage('Card number must contain only digits'),
  body('expiryMonth')
    .isInt({ min: 1, max: 12 })
    .withMessage('Expiry month must be between 1 and 12'),
  body('expiryYear')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Expiry year must be current year or later'),
  body('cvv')
    .isLength({ min: 3, max: 4 })
    .withMessage('CVV must be 3 or 4 digits')
    .matches(/^\d+$/)
    .withMessage('CVV must contain only digits'),
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
    const { payerEmail, payerName, cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    // Get payment link details
    const linkResult = await query(
      `SELECT 
        pl.id, pl.link_id, pl.amount, pl.currency, pl.description,
        pl.expires_at, pl.max_uses, pl.current_uses, pl.is_active
       FROM payment_links pl
       WHERE pl.link_id = $1`,
      [linkId],
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment link not found',
      });
    }

    const paymentLink = linkResult.rows[0];

    // Validate payment link status
    if (!paymentLink.is_active) {
      return res.status(400).json({
        success: false,
        error: 'This payment link is inactive',
      });
    }

    if (paymentLink.expires_at && moment(paymentLink.expires_at).isBefore(moment())) {
      return res.status(400).json({
        success: false,
        error: 'This payment link has expired',
      });
    }

    if (paymentLink.max_uses && paymentLink.current_uses >= paymentLink.max_uses) {
      return res.status(400).json({
        success: false,
        error: 'This payment link has reached its maximum usage limit',
      });
    }

    // Validate card expiry
    const currentDate = moment();
    const expiryDate = moment(`${expiryYear}-${expiryMonth.toString().padStart(2, '0')}-01`);
    if (expiryDate.isBefore(currentDate, 'month')) {
      return res.status(400).json({
        success: false,
        error: 'Card has expired',
      });
    }

    // Extract card brand from card number
    const cardBrand = getCardBrand(cardNumber);
    const cardLast4 = cardNumber.slice(-4);

    // Create transaction record
    const transactionId = uuidv4();
    const transactionResult = await query(
      `INSERT INTO transactions (
        id, payment_link_id, payer_email, payer_name, amount, currency,
        status, payment_method, card_last4, card_brand
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, status, created_at`,
      [
        transactionId,
        paymentLink.id,
        payerEmail,
        payerName,
        paymentLink.amount,
        paymentLink.currency,
        'processing',
        'card',
        cardLast4,
        cardBrand,
      ],
    );

    const transaction = transactionResult.rows[0];

    // Simulate bank API call
    const bankResponse = await simulateBankAPI({
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
    });

    // Update transaction with bank response
    await query(
      `UPDATE transactions 
       SET status = $1, bank_response_code = $2, bank_response_message = $3,
           failure_reason = $4, processed_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        bankResponse.status,
        bankResponse.responseCode,
        bankResponse.responseMessage,
        bankResponse.failureReason,
        transactionId,
      ],
    );

    // Update payment link usage count if successful
    if (bankResponse.status === 'completed') {
      await query(
        'UPDATE payment_links SET current_uses = current_uses + 1 WHERE id = $1',
        [paymentLink.id],
      );
    }

    logger.info(`Payment processed for link ${linkId}: ${bankResponse.status}`);

    res.json({
      success: true,
      message: bankResponse.status === 'completed' ? 'Payment processed successfully' : 'Payment failed',
      data: {
        transaction: {
          id: transaction.id,
          status: bankResponse.status,
          amount: paymentLink.amount,
          currency: paymentLink.currency,
          createdAt: transaction.created_at,
          processedAt: new Date(),
        },
        bankResponse: {
          responseCode: bankResponse.responseCode,
          responseMessage: bankResponse.responseMessage,
          failureReason: bankResponse.failureReason,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to determine card brand
 */
function getCardBrand(cardNumber) {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }

  return 'Unknown';
}

/**
 * Simulate bank API call
 */
async function simulateBankAPI(paymentData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simple mock logic for demo purposes
  const { cardNumber, cvv } = paymentData;

  // Simulate different failure scenarios
  const lastDigit = parseInt(cardNumber.slice(-1));
  const cvvLastDigit = parseInt(cvv.slice(-1));

  // 10% chance of failure for demo purposes
  if (lastDigit === 0) {
    return {
      status: 'failed',
      responseCode: 'DECLINED',
      responseMessage: 'Card declined by issuer',
      failureReason: 'Insufficient funds',
    };
  }

  // 5% chance of CVV failure
  if (cvvLastDigit === 0) {
    return {
      status: 'failed',
      responseCode: 'INVALID_CVV',
      responseMessage: 'Invalid security code',
      failureReason: 'Incorrect CVV',
    };
  }

  // 85% chance of success
  return {
    status: 'completed',
    responseCode: 'APPROVED',
    responseMessage: 'Transaction approved',
    failureReason: null,
  };
}

module.exports = router; 