const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { normalizeMobile } = require('../utils/otp');

const router = express.Router();
const mobilePattern = /^[6-9]\d{9}$/;

router.post(
  '/send-otp',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 8,
    keyFn: (req) => `otp:${normalizeMobile(req.body?.mobile || req.ip)}`,
    message: 'Too many OTP requests for this number. Try again later.',
  }),
  [body('mobile').customSanitizer(normalizeMobile).matches(mobilePattern).withMessage('Enter a valid 10-digit Indian mobile number.')],
  authController.sendOtp
);

router.post(
  '/verify-otp',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyFn: (req) => `verify:${normalizeMobile(req.body?.mobile || req.ip)}`,
    message: 'Too many verification attempts. Please wait and try again.',
  }),
  [
    body('mobile').customSanitizer(normalizeMobile).matches(mobilePattern).withMessage('Enter a valid 10-digit Indian mobile number.'),
    body('otp').matches(/^\d{6}$/).withMessage('Enter the 6-digit OTP.'),
    body('fullName').optional().trim(),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email address.'),
  ],
  authController.verifyOtp
);

router.get('/me', requireAuth, authController.me);

module.exports = router;
