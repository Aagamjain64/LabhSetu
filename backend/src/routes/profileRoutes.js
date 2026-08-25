const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.use(requireAuth);

const optionalEnums = {
  gender: ['male', 'female', 'transgender', 'prefer_not_to_say', ''],
  maritalStatus: ['single', 'married', 'divorced', 'widowed', 'other', ''],
  residenceType: ['rural', 'urban', ''],
  category: ['general', 'obc', 'sc', 'st', 'other', ''],
  minorityStatus: ['yes', 'no', 'prefer_not_to_say', ''],
  disabilityStatus: ['yes', 'no', ''],
  occupation: [
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
  employmentStatus: ['employed', 'unemployed', 'student', 'self_employed', 'retired', ''],
  educationLevel: [
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
  currentStudent: ['yes', 'no', ''],
  institutionType: ['government', 'private', 'other', ''],
};

const profileValidators = [
  body('personal.gender').optional().isIn(optionalEnums.gender).withMessage('Choose a valid gender.'),
  body('personal.maritalStatus').optional().isIn(optionalEnums.maritalStatus).withMessage('Choose a valid marital status.'),
  body('location.pincode')
    .optional({ checkFalsy: true })
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits.'),
  body('location.residenceType').optional().isIn(optionalEnums.residenceType),
  body('social.category').optional().isIn(optionalEnums.category),
  body('social.minorityStatus').optional().isIn(optionalEnums.minorityStatus),
  body('social.disabilityStatus').optional().isIn(optionalEnums.disabilityStatus),
  body('social.disabilityPercentage')
    .optional({ nullable: true })
    .custom((value) => value === null || value === '' || (Number(value) >= 0 && Number(value) <= 100))
    .withMessage('Disability percentage must be between 0 and 100.'),
  body('economic.annualFamilyIncome')
    .optional({ nullable: true })
    .custom((value) => value === null || value === '' || Number(value) >= 0)
    .withMessage('Enter a valid annual family income.'),
  body('economic.occupation').optional().isIn(optionalEnums.occupation),
  body('economic.employmentStatus').optional().isIn(optionalEnums.employmentStatus),
  body('education.educationLevel').optional().isIn(optionalEnums.educationLevel),
  body('education.currentStudent').optional().isIn(optionalEnums.currentStudent),
  body('education.institutionType').optional().isIn(optionalEnums.institutionType),
];

router.get('/', profileController.getProfile);
router.post('/', profileValidators, profileController.createProfile);
router.put('/', profileValidators, profileController.updateProfile);
router.get('/documents', profileController.getDocuments);
router.put('/documents', profileController.updateDocuments);
router.get('/completion', profileController.getCompletion);

module.exports = router;
