const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// Like requireAuth, but never blocks the request. If a valid token is
// present, req.userId/req.user are populated so guest and logged-in users
// can share the same route (e.g. browsing schemes).
async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const payload = verifyAccessToken(token);
    if (!payload?.userId || payload.typ !== 'access') return next();

    const user = await User.findById(payload.userId);
    if (user) {
      req.userId = user._id.toString();
      req.user = user;
    }
    return next();
  } catch (_error) {
    return next();
  }
}

module.exports = { optionalAuth };
