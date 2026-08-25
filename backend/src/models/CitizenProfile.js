const mongoose = require('mongoose');

const documentStatusSchema = new mongoose.Schema(
  {
    isAvailable: { type: Boolean, default: false },
  },
  { _id: false }
);

const citizenProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personal: {
      firstName: { type: String, trim: true, maxlength: 80, default: '' },
      lastName: { type: String, trim: true, maxlength: 80, default: '' },
      dateOfBirth: { type: Date, default: null },
      gender: {
        type: String,
        enum: ['male', 'female', 'transgender', 'prefer_not_to_say', ''],
        default: '',
      },
      maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'other', ''],
        default: '',
      },
    },
    location: {
      state: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      village: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      residenceType: {
        type: String,
        enum: ['rural', 'urban', ''],
        default: '',
      },
    },
    social: {
      category: {
        type: String,
        enum: ['general', 'obc', 'sc', 'st', 'other', ''],
        default: '',
      },
      minorityStatus: {
        type: String,
        enum: ['yes', 'no', 'prefer_not_to_say', ''],
        default: '',
      },
      disabilityStatus: {
        type: String,
        enum: ['yes', 'no', ''],
        default: '',
      },
      disabilityType: { type: String, trim: true, default: '' },
      disabilityPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      disabilityCertificateAvailable: {
        type: String,
        enum: ['yes', 'no', ''],
        default: '',
      },
    },
    economic: {
      annualFamilyIncome: { type: Number, min: 0, default: null },
      monthlyFamilyIncome: { type: Number, min: 0, default: null },
      occupation: {
        type: String,
        enum: [
          'student',
          'farmer',
          'agricultural_labourer',
          'self_employed',
          'private_sector',
          'government_employee',
          'unemployed',
          'homemaker',
          'daily_wage_worker',
          'other',
          '',
        ],
        default: '',
      },
      employmentStatus: {
        type: String,
        enum: ['employed', 'unemployed', 'student', 'self_employed', 'retired', ''],
        default: '',
      },
    },
    education: {
      educationLevel: {
        type: String,
        enum: [
          'no_formal_education',
          'primary',
          'secondary',
          'higher_secondary',
          'diploma',
          'undergraduate',
          'postgraduate',
          'phd',
          'other',
          '',
        ],
        default: '',
      },
      currentStudent: {
        type: String,
        enum: ['yes', 'no', ''],
        default: '',
      },
      course: { type: String, trim: true, default: '' },
      institutionType: {
        type: String,
        enum: ['government', 'private', 'other', ''],
        default: '',
      },
    },
    documents: {
      aadhaar: { type: documentStatusSchema, default: () => ({}) },
      janAadhaar: { type: documentStatusSchema, default: () => ({}) },
      rationCard: { type: documentStatusSchema, default: () => ({}) },
      bplCard: { type: documentStatusSchema, default: () => ({}) },
      incomeCertificate: { type: documentStatusSchema, default: () => ({}) },
      casteCertificate: { type: documentStatusSchema, default: () => ({}) },
      domicileCertificate: { type: documentStatusSchema, default: () => ({}) },
      disabilityCertificate: { type: documentStatusSchema, default: () => ({}) },
      birthCertificate: { type: documentStatusSchema, default: () => ({}) },
      residenceCertificate: { type: documentStatusSchema, default: () => ({}) },
      labourCard: { type: documentStatusSchema, default: () => ({}) },
      kisanCreditCard: { type: documentStatusSchema, default: () => ({}) },
      other: { type: documentStatusSchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CitizenProfile', citizenProfileSchema);
