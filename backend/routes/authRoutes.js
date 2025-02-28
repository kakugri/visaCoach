const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload(); // Get user info
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    // In a real app, you would check if a user exists and create them if not
    // For MVP, just send back the user info
    console.log("User Data:", { email, name, picture });
    res.json({ message: 'Google token verified', user: { email, name, picture } });
  } catch (error) {
    console.error('Error handling Google login:', error);
    res.status(401).json({ error: error.message }); // Respond with error details in JSON
  }
});

module.exports = router;
