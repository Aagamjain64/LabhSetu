const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function otpMatches(otp, otpHash) {
  return bcrypt.compare(String(otp), otpHash);
}

function normalizeMobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function isValidIndianMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

module.exports = {
  generateOtp,
  hashOtp,
  otpMatches,
  normalizeMobile,
  isValidIndianMobile,
};
