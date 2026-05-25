// Updated backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/authUtils');

// Initialize Google OAuth client
const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(getGoogleClientId());

// Verify Google token function
const verifyGoogleToken = async (token) => {
  try {
    const googleClientId = getGoogleClientId();
    if (!googleClientId) {
      throw new Error('Google authentication is not configured');
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

// Google authentication route
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({ email, name, picture });
      await user.save();
    } else {
      user.lastLogin = Date.now();
      await user.save();
    }
    
    // Create a session token
    const sessionToken = generateToken(user);

    res.json({ 
      message: 'Google token verified', 
      token: sessionToken, 
      user: { 
        id: user._id,
        email, 
        name, 
        picture 
      } 
    });
  } catch (error) {
    console.error('Error handling Google login:', error);
    res.status(401).json({ error: error.message });
  }
});

// Local Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionToken = generateToken(user);
    res.json({ 
      token: sessionToken, 
      user: { 
        id: user._id,
        email: user.email, 
        name: user.name, 
        picture: user.picture 
      } 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Local Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = new User({ email, password, name });
    await newUser.save();

    const sessionToken = generateToken(newUser);
    res.status(201).json({ 
      message: 'User registered', 
      token: sessionToken, 
      user: { 
        id: newUser._id,
        email, 
        name 
      } 
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Authentication middleware for profile route
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

const deleteAuthenticatedAccount = async (userId) => {
  if (!userId) {
    return {
      status: 400,
      body: { error: 'User ID is missing from token' },
    };
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return {
      status: 404,
      body: { error: 'User not found' },
    };
  }

  return {
    status: 200,
    body: { message: 'Account deleted' },
  };
};

const buildAccountExport = (user, exportedAt = new Date().toISOString()) => {
  const account = typeof user.toObject === 'function' ? user.toObject() : user;
  const sessions = Array.isArray(account.interviewHistory) ? account.interviewHistory : [];

  const profile = {
    id: account._id ? String(account._id) : account.id,
    email: account.email,
    name: account.name,
    picture: account.picture,
    countryOfOrigin: account.countryOfOrigin,
    visaType: account.visaType,
    interviewDate: account.interviewDate,
    subscriptionStatus: account.subscriptionStatus,
    lastLogin: account.lastLogin,
    createdAt: account.createdAt,
  };

  return {
    exportedAt,
    profile: Object.fromEntries(
      Object.entries(profile).filter(([, value]) => value !== undefined && value !== null)
    ),
    sessionCount: sessions.length,
    sessions,
  };
};

const exportAuthenticatedAccount = async (userId) => {
  if (!userId) {
    return {
      status: 400,
      body: { error: 'User ID is missing from token' },
    };
  }

  const user = await User.findById(userId).select('-password');

  if (!user) {
    return {
      status: 404,
      body: { error: 'User not found' },
    };
  }

  return {
    status: 200,
    body: buildAccountExport(user),
  };
};

// GET user profile - with proper authentication
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from token' });
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const result = await exportAuthenticatedAccount(req.user.userId);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error exporting user account:', error);
    res.status(500).json({ error: 'Failed to export account data' });
  }
});

router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const result = await deleteAuthenticatedAccount(req.user.userId);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

router._test = {
  buildAccountExport,
  exportAuthenticatedAccount,
  deleteAuthenticatedAccount,
};

module.exports = router;
