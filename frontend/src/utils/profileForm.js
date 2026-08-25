export const DOCUMENT_KEYS = [
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

export function emptyProfile() {
  const documents = {};
  DOCUMENT_KEYS.forEach((key) => {
    documents[key] = { isAvailable: false };
  });
  return {
    personal: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
    },
    location: {
      state: '',
      district: '',
      city: '',
      village: '',
      pincode: '',
      residenceType: '',
    },
    social: {
      category: '',
      minorityStatus: '',
      disabilityStatus: '',
      disabilityType: '',
      disabilityPercentage: '',
      disabilityCertificateAvailable: '',
    },
    economic: {
      annualFamilyIncome: '',
      monthlyFamilyIncome: '',
      occupation: '',
      employmentStatus: '',
    },
    education: {
      educationLevel: '',
      currentStudent: '',
      course: '',
      institutionType: '',
    },
    documents,
  };
}

export function mergeProfile(apiProfile) {
  const base = emptyProfile();
  if (!apiProfile) return base;
  return {
    personal: {
      ...base.personal,
      ...apiProfile.personal,
      dateOfBirth: apiProfile.personal?.dateOfBirth
        ? String(apiProfile.personal.dateOfBirth).slice(0, 10)
        : '',
    },
    location: { ...base.location, ...apiProfile.location },
    social: {
      ...base.social,
      ...apiProfile.social,
      disabilityPercentage:
        apiProfile.social?.disabilityPercentage === null || apiProfile.social?.disabilityPercentage === undefined
          ? ''
          : apiProfile.social.disabilityPercentage,
    },
    economic: {
      ...base.economic,
      ...apiProfile.economic,
      annualFamilyIncome:
        apiProfile.economic?.annualFamilyIncome === null || apiProfile.economic?.annualFamilyIncome === undefined
          ? ''
          : apiProfile.economic.annualFamilyIncome,
      monthlyFamilyIncome:
        apiProfile.economic?.monthlyFamilyIncome === null || apiProfile.economic?.monthlyFamilyIncome === undefined
          ? ''
          : apiProfile.economic.monthlyFamilyIncome,
    },
    education: { ...base.education, ...apiProfile.education },
    documents: { ...base.documents, ...apiProfile.documents },
  };
}

export function toPayload(form) {
  const numOrNull = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  };
  return {
    personal: {
      ...form.personal,
      dateOfBirth: form.personal.dateOfBirth || null,
    },
    location: form.location,
    social: {
      ...form.social,
      disabilityPercentage: numOrNull(form.social.disabilityPercentage),
    },
    economic: {
      ...form.economic,
      annualFamilyIncome: numOrNull(form.economic.annualFamilyIncome),
      monthlyFamilyIncome: numOrNull(form.economic.monthlyFamilyIncome),
    },
    education: form.education,
    documents: form.documents,
  };
}

export function calculateAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : '';
}

export function mapOptions(dict) {
  return Object.entries(dict).map(([value, label]) => ({ value, label }));
}
