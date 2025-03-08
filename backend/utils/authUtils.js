// Updated backend/utils/authUtils.js

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object from database
 * @param {String} expiresIn - Token expiration time (default: '24h')
 * @returns {String} JWT token
 */
const generateToken = (user, expiresIn = '24h') => {
  if (!user || !user._id) {
    throw new Error('Invalid user provided for token generation');
  }

  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name
  };

  if (!process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET environment variable is not set');
    throw new Error('JWT secret is not configured');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  if (!token) {
    console.error('No token provided for verification');
    return null;
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('WARNING: JWT_SECRET environment variable is not set');
      throw new Error('JWT secret is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Middleware to authenticate and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is missing' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { 
  generateToken, 
  verifyToken,
  authMiddleware
};