const Scheme = require('../models/Scheme');
const CitizenProfile = require('../models/CitizenProfile');
const { buildUserSnapshot, evaluateEligibility } = require('../utils/eligibilityEngine');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilterQuery({ state, category, search }) {
  const and = [];

if (state) {
  and.push({
    $or: [
      { 'eligibility.states': { $regex: `^${escapeRegex(state)}$`, $options: 'i' } },
      { 'eligibility.states': { $regex: '^all', $options: 'i' } },
      { 'eligibility.states': { $size: 0 } },
    ],
  });
}

  if (category) {
    and.push({ category: { $regex: `^${escapeRegex(category)}$`, $options: 'i' } });
  }

  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    and.push({
      $or: [
        { schemeName: re },
        { category: re },
        { ministry: re },
        { description: re },
        { benefits: re },
        { 'eligibility.states': re },
        { 'eligibility.occupation': re },
      ],
    });
  }

  return and.length ? { $and: and } : {};
}

async function getUserSnapshot(userId) {
  if (!userId) return null;
  const profile = await CitizenProfile.findOne({ userId });
  if (!profile) return null;
  return buildUserSnapshot(profile);
}

function toCardResponse(scheme, eligibilityResult) {
  return {
    id: scheme._id,
    schemeName: scheme.schemeName,
    isDemo: scheme.isDemo,
    ministry: scheme.ministry,
    category: scheme.category,
    description: scheme.description,
    benefits: scheme.benefits,
    states: scheme.eligibility?.states?.length ? scheme.eligibility.states : ['All States'],
    applicationMode: scheme.applicationMode,
    eligibility: eligibilityResult
      ? {
          eligible: eligibilityResult.eligible,
          matchScore: eligibilityResult.matchScore,
          failedCount: eligibilityResult.failedCriteria.length,
        }
      : null,
  };
}

async function list(req, res, next) {
  try {
    const state = String(req.query.state || '').trim();
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim();

    const query = buildFilterQuery({ state, category, search });

    const [schemes, allSchemes, snapshot] = await Promise.all([
      Scheme.find(query).sort({ createdAt: 1 }).lean(),
      Scheme.find({}, 'category eligibility.states').lean(),
      getUserSnapshot(req.userId),
    ]);

    const stateSet = new Set();
const categorySet = new Set();
allSchemes.forEach((scheme) => {
  if (scheme.category) categorySet.add(scheme.category);
  (scheme.eligibility?.states || []).forEach((st) => {
    if (st && !/^all/i.test(st.trim())) {
      stateSet.add(st);
    }
  });
});

    const results = schemes.map((scheme) => {
      const eligibilityResult = snapshot ? evaluateEligibility(scheme, snapshot) : null;
      return toCardResponse(scheme, eligibilityResult);
    });

    return res.json({
      schemes: results,
      total: results.length,
      isAuthenticated: Boolean(req.userId),
      filterOptions: {
        states: [...stateSet].sort(),
        categories: [...categorySet].sort(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid scheme ID.' });
    }

    const scheme = await Scheme.findById(id).lean();
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found.' });
    }

    const snapshot = await getUserSnapshot(req.userId);
    const eligibilityResult = snapshot ? evaluateEligibility(scheme, snapshot) : null;

    return res.json({
      scheme,
      isAuthenticated: Boolean(req.userId),
      eligibility: eligibilityResult,
    });
  } catch (error) {
    return next(error);
  }
}

async function recommended(req, res, next) {
  try {
    const snapshot = await getUserSnapshot(req.userId);
    if (!snapshot) {
      return res.json({
        schemes: [],
        total: 0,
        message: 'Complete your profile to see personalized scheme recommendations.',
      });
    }

    const schemes = await Scheme.find({}).sort({ createdAt: 1 }).lean();
    const evaluated = schemes
      .map((scheme) => ({ scheme, result: evaluateEligibility(scheme, snapshot) }))
      .filter((item) => item.result.eligible)
      .sort((a, b) => b.result.matchScore - a.result.matchScore)
      .map(({ scheme, result }) => ({
        id: scheme._id,
        schemeName: scheme.schemeName,
        isDemo: scheme.isDemo,
        ministry: scheme.ministry,
        category: scheme.category,
        description: scheme.description,
        benefits: scheme.benefits,
        states: scheme.eligibility?.states?.length ? scheme.eligibility.states : ['All States'],
        matchScore: result.matchScore,
      }));

    return res.json({ schemes: evaluated, total: evaluated.length });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, getById, recommended };
