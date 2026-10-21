const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to Database
connectDB().then(async () => {
  try {
    const Expense = require('./models/Expense');
    const User = require('./models/User');

    const leadershipUsers = await User.find({
      role: { $in: ['ADMIN', 'FACULTY_COORDINATOR', 'TREASURER'] },
    }).lean();
    const leadershipUserIds = leadershipUsers.map((u) => u._id);

    const pendingLeadershipExpenses = await Expense.find({
      user: { $in: leadershipUserIds },
      status: 'PENDING_TREASURER',
    });

    for (const exp of pendingLeadershipExpenses) {
      exp.status = 'TREASURER_APPROVED';
      exp.approvedAmount = exp.amount;
      exp.approvedBy = exp.user;
      exp.approvedAt = exp.createdAt || new Date();
      await exp.save();
    }

    // Ensure Admin users have designated phone number (9087516907)
    const adminPhone = process.env.ADMIN_PHONE || '9087516907';
    await User.updateMany(
      { role: 'ADMIN', $or: [{ phone: { $exists: false } }, { phone: '' }, { phone: '+91 9876543210' }] },
      { $set: { phone: adminPhone } }
    );
    console.log(`Verified Admin phone number is set to ${adminPhone}`);
  } catch (err) {
    console.error('Startup migration error:', err.message);
  }
});

const app = express();

// Security: Helmet for HTTP response headers (configured to allow cross-origin assets like images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Performance: Gzip/Brotli Compression for response bodies (speeds up GETs significantly)
app.use(compression());

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security: Sanitize against NoSQL injection
app.use(mongoSanitize());

// Security: Protect against HTTP Parameter Pollution
app.use(hpp());

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting: General API Limiter (Generous limit to avoid interrupting normal dashboard queries)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', apiLimiter);

// Auth Limiter: Protect login from brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes',
  },
});
app.use('/api/auth/login', authLimiter);

// Serve Static Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/sponsors', require('./routes/sponsorRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));

// Detailed Health check endpoint with DB state
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbState = mongoose.connection.readyState;

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    message: dbState === 1 ? 'ClubFund Backend API is healthy' : 'Database is not connected',
    database: {
      status: dbStates[dbState] || 'unknown',
      readyState: dbState,
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'none',
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date(),
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`ClubFund Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
