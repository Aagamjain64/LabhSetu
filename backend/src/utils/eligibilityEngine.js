// Personalized eligibility engine.
//
// Compares a normalized "user snapshot" (derived from the existing
// CitizenProfile model) against a scheme's structured `eligibility` rules
// and produces a transparent, field-by-field verdict. Nothing here creates
// or duplicates the User/CitizenProfile models — it only reads from them.

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

// Treats values like "All", "All States", "All Categories", "Any" as a
// wildcard meaning "no restriction on this field" rather than a literal
// value the user's profile must match.
const WILDCARD_TOKENS = new Set(['all', 'all_states', 'all_categories', 'any', 'na', 'n_a']);

function isWildcardList(list) {
  if (!list || list.length === 0) return true;
  return list.some((item) => WILDCARD_TOKENS.has(normalizeToken(item)));
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not provided';
  return `\u20B9${Number(value).toLocaleString('en-IN')}`;
}

// Builds a plain snapshot of the fields the eligibility engine understands
// from an existing CitizenProfile document (or plain object).
function buildUserSnapshot(profile) {
  if (!profile) return null;
  return {
    age: calculateAge(profile.personal?.dateOfBirth),
    gender: profile.personal?.gender || '',
    state: profile.location?.state || '',
    occupation: profile.economic?.occupation || '',
    income:
      typeof profile.economic?.annualFamilyIncome === 'number' ? profile.economic.annualFamilyIncome : null,
    category: profile.social?.category || '',
    education: profile.education?.educationLevel || '',
  };
}

function evaluateEligibility(scheme, snapshot) {
  const elig = scheme.eligibility || {};
  const matchedCriteria = [];
  const failedCriteria = [];
  const missingRequirements = [];
  const comparison = [];

  function record(field, label, required, actual, satisfied, message) {
    comparison.push({ field, label, required, actual, satisfied });
    if (satisfied) {
      matchedCriteria.push(label);
    } else {
      failedCriteria.push({ field, required, actual, message });
      missingRequirements.push(message);
    }
  }

  // Age
  if (elig.minAge !== null && elig.minAge !== undefined) {
    const min = elig.minAge ?? 0;
    const max = elig.maxAge ?? null;
    const requiredLabel = max ? `${min}\u2013${max} years` : `${min}+ years`;
    if (snapshot.age === null || snapshot.age === undefined) {
      record('age', 'Age', requiredLabel, 'Not provided', false,
        'Add your date of birth to your profile so we can check the age requirement.');
    } else {
      const satisfied = snapshot.age >= min && (max === null || snapshot.age <= max);
      record('age', 'Age', requiredLabel, `${snapshot.age} years`, satisfied,
        `Age must be ${max ? `between ${min} and ${max}` : `at least ${min}`} years.`);
    }
  }

  // Gender
  const genderList = (elig.gender || []).map(normalizeToken);
  const genderIsAll = isWildcardList(elig.gender);
  if (!genderIsAll) {
    const requiredLabel = elig.gender.join(', ');
    if (!snapshot.gender) {
      record('gender', 'Gender', requiredLabel, 'Not provided', false,
        'Add your gender to your profile to check this requirement.');
    } else {
      const satisfied = genderList.includes(normalizeToken(snapshot.gender));
      record('gender', 'Gender', requiredLabel, snapshot.gender, satisfied,
        `Gender must be one of: ${requiredLabel}.`);
    }
  }

  // State
  const stateList = (elig.states || []).map(normalizeToken);
  if (!isWildcardList(elig.states)) {
    const requiredLabel = elig.states.join(', ');
    if (!snapshot.state) {
      record('state', 'State', requiredLabel, 'Not provided', false,
        'Add your state to your profile to check this requirement.');
    } else {
      const satisfied = stateList.includes(normalizeToken(snapshot.state));
      record('state', 'State', requiredLabel, snapshot.state, satisfied,
        `You must reside in one of: ${requiredLabel}.`);
    }
  }

  // Occupation
  const occupationList = (elig.occupation || []).map(normalizeToken);
  if (!isWildcardList(elig.occupation)) {
    const requiredLabel = elig.occupation.join(', ');
    if (!snapshot.occupation) {
      record('occupation', 'Occupation', requiredLabel, 'Not provided', false,
        'Add your occupation to your profile to check this requirement.');
    } else {
      const satisfied = occupationList.includes(normalizeToken(snapshot.occupation));
      record('occupation', 'Occupation', requiredLabel, snapshot.occupation.replace(/_/g, ' '), satisfied,
        `Occupation must be: ${requiredLabel}.`);
    }
  }

  // Income
  const hasIncomeRule = (elig.minIncome && elig.minIncome > 0) || elig.maxIncome !== null && elig.maxIncome !== undefined;
  if (hasIncomeRule) {
    const min = elig.minIncome || 0;
    const max = elig.maxIncome ?? null;
    const requiredLabel = max !== null
      ? `Maximum ${formatCurrency(max)}${min ? ` (min ${formatCurrency(min)})` : ''}`
      : `Minimum ${formatCurrency(min)}`;
    if (snapshot.income === null || snapshot.income === undefined) {
      record('income', 'Annual Family Income', requiredLabel, 'Not provided', false,
        'Add your annual family income to your profile to check this requirement.');
    } else {
      const satisfied = snapshot.income >= min && (max === null || snapshot.income <= max);
      record('income', 'Annual Family Income', requiredLabel, formatCurrency(snapshot.income), satisfied,
        max !== null
          ? `Annual family income must be ${formatCurrency(max)} or less.`
          : `Annual family income must be at least ${formatCurrency(min)}.`);
    }
  }

  // Social category
  const categoryList = (elig.categories || []).map(normalizeToken);
  if (!isWildcardList(elig.categories)) {
    const requiredLabel = elig.categories.join(', ');
    if (!snapshot.category) {
      record('category', 'Social Category', requiredLabel, 'Not provided', false,
        'Add your social category to your profile to check this requirement.');
    } else {
      const satisfied = categoryList.includes(normalizeToken(snapshot.category));
      record('category', 'Social Category', requiredLabel, snapshot.category.toUpperCase(), satisfied,
        `Social category must be one of: ${requiredLabel}.`);
    }
  }

  // Education
  const educationList = (elig.education || []).map(normalizeToken);
  if (!isWildcardList(elig.education)) {
    const requiredLabel = elig.education.join(', ');
    if (!snapshot.education) {
      record('education', 'Education Level', requiredLabel, 'Not provided', false,
        'Add your education level to your profile to check this requirement.');
    } else {
      const satisfied = educationList.includes(normalizeToken(snapshot.education));
      record('education', 'Education Level', requiredLabel, snapshot.education.replace(/_/g, ' '), satisfied,
        `Education level must be one of: ${requiredLabel}.`);
    }
  }

  const totalApplicable = matchedCriteria.length + failedCriteria.length;
  const matchScore = totalApplicable === 0 ? 100 : Math.round((matchedCriteria.length / totalApplicable) * 100);
  const eligible = failedCriteria.length === 0;

  return {
    eligible,
    matchedCriteria,
    failedCriteria,
    missingRequirements,
    comparison,
    matchScore,
    // Land ownership and other free-text requirements can't be verified from
    // the current CitizenProfile fields, so they are surfaced separately
    // instead of silently failing or passing the applicant.
    landRequired: Boolean(elig.landRequired),
    additionalRequirements: elig.additionalRequirements || [],
  };
}

module.exports = { buildUserSnapshot, evaluateEligibility, calculateAge, normalizeToken };