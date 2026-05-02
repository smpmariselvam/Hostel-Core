const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User'); // Make sure this path is correct

const seedAdmin = async () => {
  try {
    // 1. Connect to your database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Check if an admin already exists to prevent duplicates
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (adminExists) {
      console.log('⚠️ Admin user already exists. Exiting...');
      process.exit();
    }

    // 3. Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    // 4. Create the Admin user
    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      contactNumber: '0000000000'
    });

    // 5. Save to database
    await adminUser.save();
    console.log('🎉 Admin user created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin');

    // 6. Disconnect and exit
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();