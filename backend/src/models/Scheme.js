const mongoose = require('mongoose');

// Structured eligibility rules for a scheme. Every field is optional/array-based
// so that a criterion with an empty list or null value simply means "no
// restriction on this field" and is skipped by the eligibility engine.
const eligibilitySchema = new mongoose.Schema(
  {
    minAge: { type: Number, default: null },
    maxAge: { type: Number, default: null },
    gender: { type: [String], default: ['All'] },
    states: { type: [String], default: ['All States'] },
    occupation: { type: [String], default: [] },
    minIncome: { type: Number, default: 0 },
    maxIncome: { type: Number, default: null },
    categories: { type: [String], default: [] },
    education: { type: [String], default: [] },
    landRequired: { type: Boolean, default: false },
    additionalRequirements: { type: [String], default: [] },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    // isDemo marks seed/placeholder schemes so the UI can flag them clearly.
    // Real schemes imported later should set this to false.
    isDemo: { type: Boolean, default: true },
    ministry: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '', index: true },
    description: { type: String, default: '' },
    benefits: { type: String, default: '' },
    eligibility: { type: eligibilitySchema, default: () => ({}) },
    documentsRequired: { type: [String], default: [] },
    applicationMode: { type: String, default: '' },
    applicationUrl: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastVerified: { type: String, default: '' },
    // When a scheme is created by a state-level admin, this is set to their
    // assigned state and locks the scheme to that state admin's ownership.
    // Left blank/null for schemes managed centrally by full admins.
    ownerState: { type: String, trim: true, default: '', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
