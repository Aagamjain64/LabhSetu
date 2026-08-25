function parseGoogleResponse(payload) {
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return '';
    }
  }
  if (Array.isArray(payload)) {
    if (typeof payload[0] === 'string') return payload.join('');
    if (Array.isArray(payload[0])) {
      return payload[0].map((item) => (Array.isArray(item) ? item[0] : item)).join('');
    }
  }
  if (payload && typeof payload === 'object' && payload['translated-text']) {
    return payload['translated-text'];
  }
  return '';
}

async function translateGoogle(text, target) {
  const url = new URL('https://clients5.google.com/translate_a/t');
  url.searchParams.set('client', 'dict-chrome-ex');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', target);
  url.searchParams.set('q', text);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Google translate ${response.status}`);
  return parseGoogleResponse(await response.text());
}

async function translateSimply(text, target) {
  const url = new URL('https://st.privacydev.net/api/translate');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('from', 'en');
  url.searchParams.set('to', target);
  url.searchParams.set('text', text);
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`SimplyTranslate ${response.status}`);
  const data = await response.json();
  return data['translated-text'] || data.translated_text || '';
}

async function translateOne(text, target) {
  const source = String(text || '');
  if (!source.trim()) return source;
  try {
    const translated = await translateGoogle(source, target);
    if (translated) return translated;
  } catch {
    // try next engine
  }
  try {
    const translated = await translateSimply(source, target);
    if (translated) return translated;
  } catch {
    // keep English if every engine fails
  }
  return source;
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function translateBatch(texts, target) {
  return mapPool(texts, 4, (text) => translateOne(text, target));
}

module.exports = { translateBatch };
