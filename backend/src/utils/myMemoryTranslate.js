const LANG_ALIASES = {
  zh: 'zh-CN',
  pt: 'pt-PT',
  pa: 'pa-IN',
};

function mapLang(code) {
  return LANG_ALIASES[code] || code;
}

async function translateOne(text, target) {
  const source = String(text || '');
  if (!source.trim()) return source;

  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', source.slice(0, 450));
  url.searchParams.set('langpair', `en|${mapLang(target)}`);
  if (process.env.MYMEMORY_EMAIL) {
    url.searchParams.set('de', process.env.MYMEMORY_EMAIL);
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return source;
    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    const status = Number(data?.responseStatus);
    if (status !== 200 || !translated) return source;
    if (/^MYMEMORY WARNING/i.test(translated)) return source;
    return translated;
  } catch {
    return source;
  }
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
  return mapPool(texts, 3, (text) => translateOne(text, target));
}

module.exports = { translateBatch };
