require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const interviewRoutes = require('./routes/interviewRoutes');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./utils/authUtils');
const User = require('./models/User');
const { getRuntimeConfig, validateRuntimeConfig } = require('./config/runtimeConfig');
const { createErrorHandler, createNotFoundHandler } = require('./middleware/errorHandlers');
const { createRequestLogger } = require('./middleware/requestLogger');
const { getHealthPayload } = require('./utils/health');

const app = express();
const startedAt = Date.now();
const config = getRuntimeConfig();
const validation = validateRuntimeConfig(config);

validation.warnings.forEach((warning) => console.warn(`[config warning] ${warning}`));

if (validation.errors.length) {
  validation.errors.forEach((error) => console.error(`[config error] ${error}`));
  process.exit(1);
}

app.set('trust proxy', 1);

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));
}

app.use(createRequestLogger({ enabled: config.requestLogging }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.json({ limit: config.jsonBodyLimit }));

// Improved Authentication Middleware
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is missing or invalid' });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Fixed route for api/profile
app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

app.get(['/live', '/api/live'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'visacoach-backend',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  const payload = getHealthPayload({ mongoose, config, startedAt });
  res.status(payload.status === 'ok' ? 200 : 503).json(payload);
});

app.get('/', (req, res) => {
  res.send('Visa Prep Backend MVP is running!');
});

app.use(createNotFoundHandler());
app.use(createErrorHandler());

app.listen(config.port, config.host, () => {
  console.log(`Server listening on http://${config.host}:${config.port}`);
});
