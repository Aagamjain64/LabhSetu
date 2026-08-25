const { validationResult } = require('express-validator');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const CitizenProfile = require('../models/CitizenProfile');
const { buildSchemePayload } = require('../utils/schemePayload');

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

function myState(req) {
  return req.user.assignedState;
}

// ---------- Stats ----------

async function getStats(req, res, next) {
  try {
    const state = myState(req);
    const [ownedCount, profileMatches] = await Promise.all([
      Scheme.countDocuments({ ownerState: state }),
      CitizenProfile.find({ 'location.state': state }).select('userId'),
    ]);
    return res.json({
      state,
      schemes: ownedCount,
      ownedSchemes: ownedCount,
      users: profileMatches.length,
    });
  } catch (error) {
    return next(error);
  }
}

// ---------- Scoped scheme access ----------
// A state admin only ever sees and manages schemes they themselves created
// for their own state (ownerState === their state) — full add/edit/delete.
// Centrally-managed schemes (owned by no state, or by another state) are
// not visible here at all; that catalogue is handled by central_admin /
// admin via the central admin panel, so a state admin can never edit
// another state's or the centrally-managed scheme data.

async function listSchemes(req, res, next) {
  try {
    const state = myState(req);
    const search = String(req.query.search || '').trim();

    const query = { ownerState: state };
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ schemeName: re }, { category: re }, { ministry: re }];
    }
    const schemes = await Scheme.find(query).sort({ createdAt: -1 });
    return res.json({ schemes, total: schemes.length, state });
  } catch (error) {
    return next(error);
  }
}

async function createScheme(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const state = myState(req);
    const payload = buildSchemePayload(req.body, state);
    const scheme = await Scheme.create(payload);
    return res.status(201).json({ message: 'Scheme created.', scheme });
  } catch (error) {
    return next(error);
  }
}

async function updateScheme(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const state = myState(req);
    const { id } = req.params;

    const existing = await Scheme.findById(id);
    if (!existing || existing.ownerState !== state) {
      return res.status(404).json({ message: 'Scheme not found.' });
    }

    // A state admin can only ever edit schemes they own; the scheme stays
    // locked to their own state.
    const payload = buildSchemePayload(req.body, state);

    const scheme = await Scheme.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return res.json({ message: 'Scheme updated.', scheme });
  } catch (error) {
    return next(error);
  }
}

async function deleteScheme(req, res, next) {
  try {
    const state = myState(req);
    const { id } = req.params;

    const existing = await Scheme.findById(id);
    if (!existing || existing.ownerState !== state) {
      return res.status(404).json({ message: 'Scheme not found. You can only delete schemes you created for your own state.' });
    }

    await Scheme.deleteOne({ _id: id });
    return res.json({ message: 'Scheme deleted.' });
  } catch (error) {
    return next(error);
  }
}

// ---------- Scoped users (citizens whose profile.location.state matches) ----------

async function listUsers(req, res, next) {
  try {
    const state = myState(req);
    const search = String(req.query.search || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));

    const profiles = await CitizenProfile.find({ 'location.state': state }).select('userId');
    const userIds = profiles.map((p) => p.userId);

    const query = { _id: { $in: userIds }, role: 'citizen' };
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ fullName: re }, { mobile: re }, { email: re }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('fullName mobile email role createdAt'),
      User.countDocuments(query),
    ]);

    return res.json({
      users,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      state,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const state = myState(req);
    const { id } = req.params;

    const profile = await CitizenProfile.findOne({ userId: id });
    if (!profile || profile.location?.state !== state) {
      return res.status(404).json({ message: 'User not found in your state.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role !== 'citizen') {
      return res.status(403).json({ message: 'You can only remove citizen accounts.' });
    }

    await Promise.all([User.deleteOne({ _id: id }), CitizenProfile.deleteMany({ userId: id })]);
    return res.json({ message: 'User removed.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats,
  listSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  listUsers,
  deleteUser,
};
