const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const schemeController = require('../controllers/schemeController');

const router = express.Router();

// IMPORTANT: this specific route must be declared before '/:id' or Express
// would try to treat "recommended" as a scheme ID.
router.get('/recommended/me', requireAuth, schemeController.recommended);

router.get('/', optionalAuth, schemeController.list);
router.get('/:id', optionalAuth, schemeController.getById);

module.exports = router;
