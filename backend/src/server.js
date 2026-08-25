require('dotenv').config();
const { createApp } = require('./app');
const { connectDb } = require('./config/db');

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  await connectDb();
  const app = createApp();
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    // Intentionally no user data in logs.
    process.stdout.write(`LabhSetu API listening on port ${port}\n`);
  });
}

start().catch((error) => {
  process.stderr.write(`Failed to start API: ${error.message}\n`);
  process.exit(1);
});
