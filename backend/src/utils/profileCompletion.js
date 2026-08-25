const DOCUMENT_KEYS = [
  'aadhaar',
  'janAadhaar',
  'rationCard',
  'bplCard',
  'incomeCertificate',
  'casteCertificate',
  'domicileCertificate',
  'disabilityCertificate',
  'birthCertificate',
  'residenceCertificate',
  'labourCard',
  'kisanCreditCard',
  'other',
];

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
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

function isPersonalComplete(personal = {}) {
  return (
    hasText(personal.firstName) &&
    hasText(personal.lastName) &&
    Boolean(personal.dateOfBirth) &&
    hasText(personal.gender) &&
    hasText(personal.maritalStatus)
  );
}

function isLocationComplete(location = {}) {
  const place = hasText(location.city) || hasText(location.village);
  return (
    hasText(location.state) &&
    hasText(location.district) &&
    place &&
    /^\d{6}$/.test(String(location.pincode || '')) &&
    hasText(location.residenceType)
  );
}

function isSocialComplete(social = {}) {
  if (!hasText(social.category) || !hasText(social.minorityStatus) || !hasText(social.disabilityStatus)) {
    return false;
  }
  if (social.disabilityStatus === 'yes') {
    const pct = social.disabilityPercentage;
    return (
      hasText(social.disabilityType) &&
      typeof pct === 'number' &&
      pct >= 0 &&
      pct <= 100 &&
      hasText(social.disabilityCertificateAvailable)
    );
  }
  return true;
}

function isEconomicComplete(economic = {}) {
  return (
    typeof economic.annualFamilyIncome === 'number' &&
    economic.annualFamilyIncome >= 0 &&
    hasText(economic.occupation) &&
    hasText(economic.employmentStatus)
  );
}

function isEducationComplete(education = {}) {
  if (!hasText(education.educationLevel) || !hasText(education.currentStudent)) {
    return false;
  }
  if (education.currentStudent === 'yes') {
    return hasText(education.course) && hasText(education.institutionType);
  }
  return true;
}

function isDocumentsComplete(documents = {}) {
  return DOCUMENT_KEYS.some((key) => documents[key] && documents[key].isAvailable === true);
}

function getProfileCompletion(profile) {
  const sections = {
    personal: isPersonalComplete(profile?.personal),
    location: isLocationComplete(profile?.location),
    social: isSocialComplete(profile?.social),
    economic: isEconomicComplete(profile?.economic),
    education: isEducationComplete(profile?.education),
    documents: isDocumentsComplete(profile?.documents),
  };
  const total = Object.keys(sections).length;
  const done = Object.values(sections).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);
  return { percent, sections, completedCount: done, totalSections: total };
}

function toPublicProfile(profile) {
  if (!profile) return null;
  const json = profile.toObject ? profile.toObject() : profile;
  return {
    id: json._id,
    userId: json.userId,
    personal: {
      ...json.personal,
      age: calculateAge(json.personal?.dateOfBirth),
    },
    location: json.location,
    social: json.social,
    economic: json.economic,
    education: json.education,
    documents: json.documents,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    completion: getProfileCompletion(json),
  };
}

module.exports = {
  DOCUMENT_KEYS,
  calculateAge,
  getProfileCompletion,
  toPublicProfile,
};
