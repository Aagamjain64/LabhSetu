const crypto = require('crypto');
const { translateDictionary } = require('../utils/libreTranslate');

const dictionaryCache = new Map();

function dictionaryHash(dictionary) {
  return crypto.createHash('sha1').update(JSON.stringify(dictionary)).digest('hex');
}

const FALLBACK_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

async function getLanguages(_req, res) {
  return res.json({ languages: FALLBACK_LANGUAGES });
}

async function translateUi(req, res, next) {
  try {
    const target = String(req.body?.target || '').trim().toLowerCase();
    const dictionary = req.body?.dictionary;
    if (!target) {
      return res.status(400).json({ message: 'A target language is required.' });
    }
    if (!dictionary || typeof dictionary !== 'object') {
      return res.status(400).json({ message: 'A source dictionary is required.' });
    }
    if (target === 'en') {
      return res.json({ target, dictionary });
    }

    const cacheKey = `${target}:${dictionaryHash(dictionary)}`;
    if (dictionaryCache.has(cacheKey)) {
      return res.json({ target, dictionary: dictionaryCache.get(cacheKey), cached: true });
    }

    const translated = await translateDictionary(dictionary, target);
    dictionaryCache.set(cacheKey, translated);
    return res.json({ target, dictionary: translated });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getLanguages, translateUi };
