const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const adminPhone = process.env.ADMIN_PHONE || '9087516907';
    
    // Update admin user phone
    const res = await User.updateMany(
      { role: 'ADMIN' },
      { $set: { phone: adminPhone } }
    );
    console.log(`Updated Admin users:`, res);

    const admins = await User.find({ role: 'ADMIN' });
    console.log('Admin Users in DB:');
    admins.forEach(a => {
      console.log(`- ${a.fullName} (${a.email}) => Phone: ${a.phone}`);
    });

    const allUsers = await User.find({}, 'fullName email role phone');
    console.log('\nAll System Users:');
    allUsers.forEach(u => {
      console.log(`- [${u.role}] ${u.fullName} (${u.email}) => Phone: ${u.phone || 'None'}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
};

run();
