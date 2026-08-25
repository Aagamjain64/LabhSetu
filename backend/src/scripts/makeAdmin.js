// One-time helper to promote a user to 'admin' by mobile number.
// Usage: npm run make:admin -- 9876543210
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const User = require('../models/User');
const { normalizeMobile } = require('../utils/otp');

async function run() {
  const rawMobile = process.argv[2];
  if (!rawMobile) {
    process.stderr.write('Usage: npm run make:admin -- <mobile-number>\n');
    process.exit(1);
  }

  await connectDb();
  const mobile = normalizeMobile(rawMobile);
  const user = await User.findOne({ mobile });

  if (!user) {
    process.stderr.write(`No user found with mobile ${mobile}. Register/login once first, then run this again.\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();

  process.stdout.write(`${user.fullName} (${user.mobile}) is now an admin.\n`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  process.stderr.write(`Failed to promote user: ${error.message}\n`);
  process.exit(1);
});
