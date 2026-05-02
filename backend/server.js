const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let mongoConnectionPromise;
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      maxPoolSize: 5
    })
      .then(() => console.log("✅ Successfully connected to MongoDB!"))
      .catch((err) => {
        mongoConnectionPromise = null;
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  return mongoConnectionPromise;
};

const ensureDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      message: 'Database connection failed. Check MongoDB Atlas network access and MONGO_URI.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};

const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const billingRoutes = require('./routes/billingRoutes'); // NEW

app.use('/api/rooms', ensureDatabase, roomRoutes);
app.use('/api/auth', ensureDatabase, authRoutes); 
app.use('/api/users', ensureDatabase, userRoutes);
app.use('/api/maintenance', ensureDatabase, maintenanceRoutes);
app.use('/api/notifications', ensureDatabase, notificationRoutes);
app.use('/api/billing', ensureDatabase, billingRoutes); // NEW

app.get('/', (req, res) => {
  res.send("Hostel Management API is running!");
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;