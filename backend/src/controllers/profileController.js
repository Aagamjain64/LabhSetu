const { validationResult } = require('express-validator');
const CitizenProfile = require('../models/CitizenProfile');
const { DOCUMENT_KEYS, getProfileCompletion, toPublicProfile } = require('../utils/profileCompletion');
const { isValidStateDistrict } = require('../utils/indiaLocations');

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

function emptyProfile(userId) {
  return {
    userId,
    personal: {},
    location: {},
    social: {},
    economic: {},
    education: {},
    documents: {},
  };
}

async function getOrCreateProfile(userId) {
  let profile = await CitizenProfile.findOne({ userId });
  if (!profile) {
    profile = await CitizenProfile.create({ userId });
  }
  return profile;
}

function applySection(target, incoming, keys) {
  if (!incoming || typeof incoming !== 'object') return;
  keys.forEach((key) => {
    if (incoming[key] !== undefined) {
      target[key] = incoming[key];
    }
  });
}

function applyProfileUpdates(profile, body) {
  applySection(profile.personal, body.personal, ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus']);
  applySection(profile.location, body.location, ['state', 'district', 'city', 'village', 'pincode', 'residenceType']);
  applySection(profile.social, body.social, [
    'category',
    'minorityStatus',
    'disabilityStatus',
    'disabilityType',
    'disabilityPercentage',
    'disabilityCertificateAvailable',
  ]);
  applySection(profile.economic, body.economic, [
    'annualFamilyIncome',
    'monthlyFamilyIncome',
    'occupation',
    'employmentStatus',
  ]);
  applySection(profile.education, body.education, [
    'educationLevel',
    'currentStudent',
    'course',
    'institutionType',
  ]);

  if (profile.social.disabilityStatus !== 'yes') {
    profile.social.disabilityType = '';
    profile.social.disabilityPercentage = null;
    profile.social.disabilityCertificateAvailable = '';
  }

  if (profile.education.currentStudent !== 'yes') {
    profile.education.course = '';
    profile.education.institutionType = '';
  }

  if (body.documents && typeof body.documents === 'object') {
    DOCUMENT_KEYS.forEach((key) => {
      if (body.documents[key] && typeof body.documents[key].isAvailable === 'boolean') {
        profile.documents[key].isAvailable = body.documents[key].isAvailable;
      }
    });
  }
}

function validateLocationPair(location) {
  if (!location?.state || !location?.district) return null;
  if (!isValidStateDistrict(location.state, location.district)) {
    return 'Please choose a valid district for the selected state.';
  }
  return null;
}

async function getProfile(req, res, next) {
  try {
    const profile = await getOrCreateProfile(req.userId);
    return res.json({ profile: toPublicProfile(profile) });
  } catch (error) {
    return next(error);
  }
}

async function createProfile(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const existing = await CitizenProfile.findOne({ userId: req.userId });
    if (existing) {
      return res.status(409).json({ message: 'A profile already exists. Use update instead.' });
    }
    const locationError = validateLocationPair(req.body.location);
    if (locationError) {
      return res.status(400).json({ message: locationError });
    }
    const profile = await CitizenProfile.create(emptyProfile(req.userId));
    applyProfileUpdates(profile, req.body);
    await profile.save();
    return res.status(201).json({ message: 'Profile saved.', profile: toPublicProfile(profile) });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const locationError = validateLocationPair(req.body.location);
    if (locationError) {
      return res.status(400).json({ message: locationError });
    }
    const profile = await getOrCreateProfile(req.userId);
    applyProfileUpdates(profile, req.body);
    await profile.save();
    return res.json({ message: 'Profile updated.', profile: toPublicProfile(profile) });
  } catch (error) {
    return next(error);
  }
}

async function getDocuments(req, res, next) {
  try {
    const profile = await getOrCreateProfile(req.userId);
    return res.json({ documents: profile.documents });
  } catch (error) {
    return next(error);
  }
}

async function updateDocuments(req, res, next) {
  try {
    if (handleValidation(req, res)) return;
    const profile = await getOrCreateProfile(req.userId);
    DOCUMENT_KEYS.forEach((key) => {
      if (req.body[key] && typeof req.body[key].isAvailable === 'boolean') {
        profile.documents[key].isAvailable = req.body[key].isAvailable;
      }
    });
    await profile.save();
    return res.json({ message: 'Documents updated.', documents: profile.documents });
  } catch (error) {
    return next(error);
  }
}

async function getCompletion(req, res, next) {
  try {
    const profile = await getOrCreateProfile(req.userId);
    return res.json(getProfileCompletion(profile));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  getDocuments,
  updateDocuments,
  getCompletion,
};
