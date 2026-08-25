const { validationResult } = require('express-validator');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const CitizenProfile = require('../models/CitizenProfile');
const { buildSchemePayload } = require('../utils/schemePayload');
const { getStates } = require('../utils/indiaLocations');

const ROLES = ['citizen', 'moderator', 'state_admin', 'central_admin', 'admin'];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map((item) => ({ field: item.path, message: item.msg })),
    });
    return true;
  }
  return false;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------- Dashboard stats ----------

async function getStats(req, res, next) {
  try {
    const [totalUsers, totalAdmins, totalCentralAdmins, totalModerators, totalStateAdmins, totalSchemes, demoSchemes, recentUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'central_admin' }),
      User.countDocuments({ role: 'moderator' }),
      User.countDocuments({ role: 'state_admin' }),
      Scheme.countDocuments({}),
      Scheme.countDocuments({ isDemo: true }),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('fullName mobile role createdAt'),
    ]);

    return res.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        centralAdmins: totalCentralAdmins,
        moderators: totalModerators,
        stateAdmins: totalStateAdmins,
        citizens: totalUsers - totalAdmins - totalCentralAdmins - totalModerators - totalStateAdmins,
      },
      schemes: {
        total: totalSchemes,
        demo: demoSchemes,
        live: totalSchemes - demoSchemes,
      },
      recentUsers,
    });
  } catch (error) {
    return next(error);
  }
}

// ---------- User management ----------

async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();

    const query = {};
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ fullName: re }, { mobile: re }, { email: re }];
    }
    if (role && ROLES.includes(role)) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('fullName mobile email role mobileVerifiedAt createdAt'),
      User.countDocuments(query),
    ]);

    return res.json({
      users,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const { id } = req.params;
    const { role, assignedState } = req.body;

    if (id === req.userId) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    if (role === 'state_admin') {
      const states = getStates();
      if (!assignedState || !states.includes(assignedState)) {
        return res.status(400).json({ message: 'Choose a valid state or union territory for this state admin.' });
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    user.assignedState = role === 'state_admin' ? assignedState : '';
    await user.save();

    return res.json({ message: `Role updated to ${role}.`, user: user.toSafeJSON() });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await Promise.all([User.deleteOne({ _id: id }), CitizenProfile.deleteMany({ userId: id })]);
    return res.json({ message: 'User removed.' });
  } catch (error) {
    return next(error);
  }
}

// ---------- Scheme management ----------

async function listSchemes(req, res, next) {
  try {
    const search = String(req.query.search || '').trim();
    const ownerState = String(req.query.ownerState || '').trim();
    const query = {};
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ schemeName: re }, { category: re }, { ministry: re }];
    }
    if (ownerState === '__global__') {
      query.ownerState = '';
    } else if (ownerState) {
      query.ownerState = ownerState;
    }
    const schemes = await Scheme.find(query).sort({ createdAt: -1 });
    return res.json({ schemes, total: schemes.length });
  } catch (error) {
    return next(error);
  }
}

async function createScheme(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const payload = buildSchemePayload(req.body);
    const scheme = await Scheme.create(payload);
    return res.status(201).json({ message: 'Scheme created.', scheme });
  } catch (error) {
    return next(error);
  }
}

async function updateScheme(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const { id } = req.params;
    const payload = buildSchemePayload(req.body);
    const scheme = await Scheme.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found.' });
    }
    return res.json({ message: 'Scheme updated.', scheme });
  } catch (error) {
    return next(error);
  }
}

async function deleteScheme(req, res, next) {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findByIdAndDelete(id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found.' });
    }
    return res.json({ message: 'Scheme deleted.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats,
  listUsers,
  updateUserRole,
  deleteUser,
  listSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  ROLES,
};