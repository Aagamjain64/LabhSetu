const buckets = new Map();

function rateLimit({ windowMs, max, keyFn, message }) {
  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const recent = (buckets.get(key) || []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({
        message: message || 'Too many attempts. Please wait and try again.',
      });
    }
    recent.push(now);
    buckets.set(key, recent);
    return next();
  };
}

module.exports = { rateLimit };
