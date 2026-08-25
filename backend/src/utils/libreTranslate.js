const googleTranslate = require('./googleTranslate');

function flatten(obj, prefix = '') {
  const out = {};
  Object.entries(obj).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, path));
    } else {
      out[path] = value;
    }
  });
  return out;
}

function unflatten(flat) {
  const result = {};
  Object.entries(flat).forEach(([path, value]) => {
    const parts = path.split('.');
    let cursor = result;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = value;
      } else {
        cursor[part] = cursor[part] || {};
        cursor = cursor[part];
      }
    });
  });
  return result;
}

function protectPlaceholders(text) {
  return String(text).replace(/\{(\w+)\}/g, '__PH_$1__');
}

function restorePlaceholders(text) {
  return String(text).replace(/__PH_(\w+)__/g, '{$1}');
}

async function translateDictionary(dictionary, target) {
  const flat = flatten(dictionary);
  const keys = Object.keys(flat);
  const unique = [];
  const indexByText = new Map();

  keys.forEach((key) => {
    const original = String(flat[key] ?? '');
    if (key === 'appName') return;
    const protectedText = protectPlaceholders(original);
    if (!indexByText.has(protectedText)) {
      indexByText.set(protectedText, unique.length);
      unique.push(protectedText);
    }
  });

  const translatedUnique = await googleTranslate.translateBatch(unique, target);

  const out = {};
  keys.forEach((key) => {
    const original = String(flat[key] ?? '');
    if (key === 'appName') {
      out[key] = original;
      return;
    }
    const protectedText = protectPlaceholders(original);
    const idx = indexByText.get(protectedText);
    out[key] = restorePlaceholders(translatedUnique[idx] ?? original);
  });

  return unflatten(out);
}

module.exports = {
  translateDictionary,
};
