function toArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

// Builds a Scheme document payload from a request body. If `lockedState` is
// passed (state-admin flows), the eligibility.states and ownerState fields
// are forced to that single state regardless of what the client sent, so a
// state admin can never scope a scheme outside their own state.
function buildSchemePayload(body, lockedState) {
  const eligibility = body.eligibility || {};
  const payload = {
    schemeName: String(body.schemeName || '').trim(),
    isDemo: Boolean(body.isDemo),
    ministry: String(body.ministry || '').trim(),
    category: String(body.category || '').trim(),
    description: String(body.description || '').trim(),
    benefits: String(body.benefits || '').trim(),
    eligibility: {
      minAge: eligibility.minAge === '' || eligibility.minAge == null ? null : Number(eligibility.minAge),
      maxAge: eligibility.maxAge === '' || eligibility.maxAge == null ? null : Number(eligibility.maxAge),
      gender: toArray(eligibility.gender).length ? toArray(eligibility.gender) : ['All'],
      states: lockedState ? [lockedState] : toArray(eligibility.states).length ? toArray(eligibility.states) : ['All States'],
      occupation: toArray(eligibility.occupation),
      minIncome: eligibility.minIncome === '' || eligibility.minIncome == null ? 0 : Number(eligibility.minIncome),
      maxIncome: eligibility.maxIncome === '' || eligibility.maxIncome == null ? null : Number(eligibility.maxIncome),
      categories: toArray(eligibility.categories),
      education: toArray(eligibility.education),
      landRequired: Boolean(eligibility.landRequired),
      additionalRequirements: toArray(eligibility.additionalRequirements),
    },
    documentsRequired: toArray(body.documentsRequired),
    applicationMode: String(body.applicationMode || '').trim(),
    applicationUrl: String(body.applicationUrl || '').trim(),
    sourceUrl: String(body.sourceUrl || '').trim(),
    lastVerified: String(body.lastVerified || '').trim(),
    ownerState: lockedState || String(body.ownerState || '').trim(),
  };
  return payload;
}

// Checks whether a scheme's eligibility.states list covers a given state —
// either it's listed explicitly, or the scheme uses a wildcard like
// "All States"/"All" meaning it has no state restriction.
function schemeAppliesToState(scheme, state) {
  const list = scheme?.eligibility?.states;
  if (!Array.isArray(list) || list.length === 0) return true;
  const target = String(state || '').trim().toLowerCase();
  return list.some((item) => {
    const norm = String(item || '').trim().toLowerCase();
    return norm === target || norm.startsWith('all');
  });
}

module.exports = { toArray, buildSchemePayload, schemeAppliesToState };
