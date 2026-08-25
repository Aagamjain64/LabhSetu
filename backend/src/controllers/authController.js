const { validationResult } = require('express-validator');
const User = require('../models/User');
const CitizenProfile = require('../models/CitizenProfile');
const OtpChallenge = require('../models/OtpChallenge');
const { signAccessToken } = require('../utils/jwt');
const { generateOtp, hashOtp, otpMatches, normalizeMobile } = require('../utils/otp');
const { sendOtpSms } = require('../utils/sms');

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 45 * 1000;
const MAX_ATTEMPTS = 5;

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map((item) => ({ field: item.path, message: item.msg })),
    });
  }
  return null;
}

function authResponse(user, isNewUser) {
  return {
    message: isNewUser ? 'Account created successfully.' : 'Logged in successfully.',
    token: signAccessToken(user),
    user: user.toSafeJSON(),
    isNewUser,
  };
}

async function sendOtp(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const mobile = normalizeMobile(req.body.mobile);

    const existingUser = await User.findOne({ mobile });
    const previous = await OtpChallenge.findOne({ mobile }).select('+otpHash');
    if (previous && Date.now() - new Date(previous.lastSentAt).getTime() < RESEND_GAP_MS) {
      const waitSec = Math.ceil(
        (RESEND_GAP_MS - (Date.now() - new Date(previous.lastSentAt).getTime())) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${waitSec} seconds before requesting another OTP.`,
        isNewUser: !existingUser,
      });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    await OtpChallenge.deleteMany({ mobile });
    await OtpChallenge.create({
      mobile,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      lastSentAt: new Date(),
    });

    let delivered = false;
    try {
      const sms = await sendOtpSms(mobile, otp);
      delivered = Boolean(sms.delivered);
    } catch {
      delivered = false;
    }

    const payload = {
      message: delivered
        ? 'OTP sent to your mobile number.'
        : 'OTP generated. Enter the 6-digit code to continue.',
      isNewUser: !existingUser,
      expiresInSeconds: OTP_TTL_MS / 1000,
    };

    if (!delivered && process.env.OTP_DEV_MODE === 'true') {
      payload.devOtp = otp;
    }

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const mobile = normalizeMobile(req.body.mobile);
    const otp = String(req.body.otp || '').trim();
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();

    const challenge = await OtpChallenge.findOne({ mobile }).select('+otpHash');
    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (challenge.attempts >= MAX_ATTEMPTS) {
      await OtpChallenge.deleteMany({ mobile });
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new OTP.' });
    }

    const matches = await otpMatches(otp, challenge.otpHash);
    if (!matches) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(401).json({
        message: 'Incorrect OTP. Please try again.',
        attemptsLeft: MAX_ATTEMPTS - challenge.attempts,
      });
    }

    await OtpChallenge.deleteMany({ mobile });

    let user = await User.findOne({ mobile });
    let isNewUser = false;
    if (!user) {
      if (fullName.length < 2) {
        return res.status(400).json({
          message: 'Please enter your full name to create an account.',
          isNewUser: true,
        });
      }
      const userDoc = {
        fullName,
        mobile,
        email: `${mobile}@users.labhsetu.local`,
        mobileVerifiedAt: new Date(),
      };
      if (email) userDoc.email = email;
      user = await User.create(userDoc);
      await CitizenProfile.create({ userId: user._id });
      isNewUser = true;
    } else {
      user.mobileVerifiedAt = new Date();
      if (fullName && fullName.length >= 2 && (!user.fullName || user.fullName === 'Citizen')) {
        user.fullName = fullName;
      }
      await user.save();
    }

    return res.json(authResponse(user, isNewUser));
  } catch (error) {
    return next(error);
  }
}

async function me(req, res) {
  return res.json({ user: req.user.toSafeJSON() });
}

module.exports = { sendOtp, verifyOtp, me };
