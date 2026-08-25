// Imports/reseeds the 10 demo schemes from src/data/schemes.json into MongoDB.
// Safe to re-run: it only removes existing demo schemes (isDemo: true) before
// inserting, so any real (isDemo: false) schemes added later are untouched.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const Scheme = require('../models/Scheme');

async function seed() {
  await connectDb();

  const dataPath = path.join(__dirname, '../data/schemes.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const schemes = JSON.parse(raw);

  const removed = await Scheme.deleteMany({ isDemo: true });
  const inserted = await Scheme.insertMany(schemes);

  process.stdout.write(
    `Removed ${removed.deletedCount} old demo scheme(s). Inserted ${inserted.length} demo scheme(s).\n`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  process.stderr.write(`Seeding demo schemes failed: ${error.message}\n`);
  process.exit(1);
});
