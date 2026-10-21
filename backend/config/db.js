const mongoose = require('mongoose');

let isConnecting = false;
let reconnectTimer = null;

const connectionOptions = {
  // Pool management
  maxPoolSize: 25,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,

  // Timeouts & Resilience
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  heartbeatFrequencyMS: 10000,

  // Auto-retry transient reads & writes
  retryWrites: true,
  retryReads: true,
};

const setupEventHandlers = () => {
  // Remove any pre-existing listeners to avoid memory leaks during reconnects
  mongoose.connection.removeAllListeners();

  mongoose.connection.on('connected', () => {
    console.log(`✅ [MongoDB] Connected successfully to host: ${mongoose.connection.host}`);
    console.log(`📦 [MongoDB] Active Database: ${mongoose.connection.name}`);
    isConnecting = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ [MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB] Disconnected from database.');
    handleDisconnection();
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [MongoDB] Reconnected to database successfully.');
  });

  // Handle process termination for graceful cleanup
  const gracefulExit = async () => {
    try {
      await mongoose.connection.close();
      console.log('🛑 [MongoDB] Connection closed through app termination');
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.once('SIGINT', gracefulExit);
  process.once('SIGTERM', gracefulExit);
};

const handleDisconnection = () => {
  // Only attempt manual reconnect if Mongoose is completely disconnected and not currently trying
  if (mongoose.connection.readyState === 0 && !isConnecting) {
    console.log('🔄 [MongoDB] Initiating automatic reconnection in 5 seconds...');
    if (reconnectTimer) clearTimeout(reconnectTimer);
    
    reconnectTimer = setTimeout(async () => {
      try {
        isConnecting = true;
        const mongoUri = process.env.MONGO_URI;
        if (mongoUri) {
          await mongoose.connect(mongoUri, connectionOptions);
        }
      } catch (err) {
        console.error(`❌ [MongoDB] Reconnect attempt failed: ${err.message}. Retrying...`);
        isConnecting = false;
        handleDisconnection();
      }
    }, 5000);
  }
};

const connectDB = async (retries = 5, delay = 3000) => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  setupEventHandlers();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      isConnecting = true;
      const conn = await mongoose.connect(mongoUri, connectionOptions);
      return conn;
    } catch (error) {
      isConnecting = false;
      console.error(`❌ [MongoDB] Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`⏳ [MongoDB] Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('💥 [MongoDB] All connection attempts failed. Check network or MongoDB Atlas status.');
        // Allow the app to stay alive so it can retry or let developers diagnose
        handleDisconnection();
      }
    }
  }
};

module.exports = connectDB;
