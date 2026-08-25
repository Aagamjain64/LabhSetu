const jwt = require('jsonwebtoken');

const ISSUER = 'labhsetu';
const AUDIENCE = 'labhsetu-citizen';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short');
  }
  return secret;
}

function signAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      mobile: user.mobile,
      typ: 'access',
    },
    getSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '10m',
      issuer: ISSUER,
      audience: AUDIENCE,
      subject: user._id.toString(),
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

module.exports = { signAccessToken, verifyAccessToken };
