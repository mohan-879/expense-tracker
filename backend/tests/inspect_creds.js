const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({}).select('+password');
  console.log('=== USERS ===');
  for (const u of users) {
    console.log({
      email: u.email,
      username: u.username,
      role: u.role,
      phone: u.phone,
      updatedAt: u.updatedAt,
      createdAt: u.createdAt,
      passwordHash: u.password?.substring(0, 20) + '...',
    });
  }

  // Check audit logs
  console.log('\n=== RECENT AUDIT LOGS ===');
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
  for (const l of logs) {
    console.log(`[${l.createdAt.toISOString()}] ${l.action} by ${l.user}: ${l.details}`);
  }

  // Check possible passwords for admin & faculty
  const candidates = [
    'admin123', 'admin@123', 'Admin@123', 'Admin123', 'admin', 'password', '12345678', 'admin1234',
    'Mohan12@#', 'mohan123', 'Mohan@123', 'Mohan123', '9087516907',
    'faculty1', 'faculty@123', 'Faculty@123', 'Faculty1', 'faculty123', 'faculty',
    'finance1', 'treas123', 'member12'
  ];

  console.log('\n=== PASSWORD TEST FOR ADMIN ===');
  const adminUser = users.find(u => u.email === 'admin@clubfund.edu');
  for (const pass of candidates) {
    if (await adminUser.matchPassword(pass)) {
      console.log(`FOUND ADMIN PASSWORD: "${pass}"`);
    }
  }

  console.log('\n=== PASSWORD TEST FOR FACULTY ===');
  const facultyUser = users.find(u => u.email === 'faculty@clubfund.edu');
  for (const pass of candidates) {
    if (await facultyUser.matchPassword(pass)) {
      console.log(`FOUND FACULTY PASSWORD: "${pass}"`);
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
