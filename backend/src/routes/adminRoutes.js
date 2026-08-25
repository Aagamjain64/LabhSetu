const express = require('express');
const { body } = require('express-validator');
const { requireAuth, requireAdmin, requireSchemeManager } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth);

// User & role management — admin (super admin) only.
router.get('/stats', requireAdmin, adminController.getStats);
router.get('/users', requireAdmin, adminController.listUsers);
router.patch(
  '/users/:id/role',
  requireAdmin,
  [
    body('role').isIn(adminController.ROLES).withMessage('Choose a valid role.'),
    body('assignedState').optional({ checkFalsy: true }).trim(),
  ],
  adminController.updateUserRole
);
router.delete('/users/:id', requireAdmin, adminController.deleteUser);

// Central scheme catalogue — admin AND central_admin.
router.get('/schemes', requireSchemeManager, adminController.listSchemes);
router.post(
  '/schemes',
  requireSchemeManager,
  [body('schemeName').trim().notEmpty().withMessage('Scheme name is required.')],
  adminController.createScheme
);
router.put(
  '/schemes/:id',
  requireSchemeManager,
  [body('schemeName').trim().notEmpty().withMessage('Scheme name is required.')],
  adminController.updateScheme
);
router.delete('/schemes/:id', requireSchemeManager, adminController.deleteScheme);

module.exports = router;
