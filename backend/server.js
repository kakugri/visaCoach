// Fix for backend/server.js - Authentication Middleware

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const interviewRoutes = require('./routes/interviewRoutes');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./utils/authUtils');

const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

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
app.use('/api/interview', authenticate, interviewRoutes);

app.get('/', (req, res) => {
  res.send('Visa Prep Backend MVP is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});