const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Please log in to continue.' });
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId || payload.typ !== 'access') {
      return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'Session is no longer valid. Please log in again.' });
    }

    req.userId = user._id.toString();
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }
}

function requireRole(...allowedRoles) {
  return function checkRole(req, res, next) {
    const role = req.user?.role || 'citizen';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

const requireAdmin = requireRole('admin');
const requireStateAdmin = requireRole('state_admin');
// Scheme management (the central/global catalogue) is shared by the super
// admin and the central_admin role. User & role management stays admin-only.
const requireSchemeManager = requireRole('admin', 'central_admin');

module.exports = { requireAuth, requireRole, requireAdmin, requireStateAdmin, requireSchemeManager };
