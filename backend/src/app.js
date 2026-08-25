const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const i18nRoutes = require('./routes/i18nRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const stateAdminRoutes = require('./routes/stateAdminRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { getStates, getDistricts } = require('./utils/indiaLocations');

function allowedOrigins() {
  const fromEnv = String(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(['http://localhost:5173', 'http://localhost:5174', ...fromEnv])];
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins().includes(origin)) return true;
  try {
    const url = new URL(origin);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, origin || true);
        }
        return callback(null, false);
      },
      credentials: false,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'labhsetu-api' });
  });

  app.get('/api/locations/states', (_req, res) => {
    res.json({ states: getStates() });
  });

  app.get('/api/locations/districts', (req, res) => {
    const state = String(req.query.state || '');
    res.json({ state, districts: getDistricts(state) });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/i18n', i18nRoutes);
  app.use('/api/schemes', schemeRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/state-admin', stateAdminRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: 'This resource was not found.' });
  });
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
