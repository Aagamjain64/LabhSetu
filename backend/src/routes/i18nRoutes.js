const express = require('express');
const { getLanguages, translateUi } = require('../controllers/i18nController');

const router = express.Router();

router.get('/languages', getLanguages);
router.post('/translate', translateUi);

module.exports = router;
