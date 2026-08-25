const express = require('express');
const { body } = require('express-validator');
const { requireAuth, requireStateAdmin } = require('../middleware/auth');
const stateAdminController = require('../controllers/stateAdminController');

const router = express.Router();

router.use(requireAuth, requireStateAdmin);

router.get('/stats', stateAdminController.getStats);

router.get('/schemes', stateAdminController.listSchemes);
router.post(
  '/schemes',
  [body('schemeName').trim().notEmpty().withMessage('Scheme name is required.')],
  stateAdminController.createScheme
);
router.put(
  '/schemes/:id',
  [body('schemeName').trim().notEmpty().withMessage('Scheme name is required.')],
  stateAdminController.updateScheme
);
router.delete('/schemes/:id', stateAdminController.deleteScheme);

router.get('/users', stateAdminController.listUsers);
router.delete('/users/:id', stateAdminController.deleteUser);

module.exports = router;
