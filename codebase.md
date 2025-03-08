# .gitignore

```
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
#  Usually these files are written by a python script from a template
#  before PyInstaller builds the exe, so as to inject date/other infos into it.
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
cover/

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
.pybuilder/
target/

# Jupyter Notebook
.ipynb_checkpoints

# IPython
profile_default/
ipython_config.py

# pyenv
#   For a library or package, you might want to ignore these files since the code is
#   intended to run in multiple environments; otherwise, check them in:
# .python-version

# pipenv
#   According to pypa/pipenv#598, it is recommended to include Pipfile.lock in version control.
#   However, in case of collaboration, if having platform-specific dependencies or dependencies
#   having no cross-platform support, pipenv may install dependencies that don't work, or not
#   install all needed dependencies.
#Pipfile.lock

# UV
#   Similar to Pipfile.lock, it is generally recommended to include uv.lock in version control.
#   This is especially recommended for binary packages to ensure reproducibility, and is more
#   commonly ignored for libraries.
#uv.lock

# poetry
#   Similar to Pipfile.lock, it is generally recommended to include poetry.lock in version control.
#   This is especially recommended for binary packages to ensure reproducibility, and is more
#   commonly ignored for libraries.
#   https://python-poetry.org/docs/basic-usage/#commit-your-poetrylock-file-to-version-control
#poetry.lock

# pdm
#   Similar to Pipfile.lock, it is generally recommended to include pdm.lock in version control.
#pdm.lock
#   pdm stores project-wide configurations in .pdm.toml, but it is recommended to not include it
#   in version control.
#   https://pdm.fming.dev/latest/usage/project/#working-with-version-control
.pdm.toml
.pdm-python
.pdm-build/

# PEP 582; used by e.g. github.com/David-OConnor/pyflow and github.com/pdm-project/pdm
__pypackages__/

# Celery stuff
celerybeat-schedule
celerybeat.pid

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# Pyre type checker
.pyre/

# pytype static type analyzer
.pytype/

# Cython debug symbols
cython_debug/

# PyCharm
#  JetBrains specific template is maintained in a separate JetBrains.gitignore that can
#  be found at https://github.com/github/gitignore/blob/main/Global/JetBrains.gitignore
#  and can be added to the global gitignore or merged into this file.  For a more nuclear
#  option (not recommended) you can uncomment the following to ignore the entire idea folder.
#.idea/

# PyPI configuration file
.pypirc

# Node modules
node_modules

```

# backend/controllers/interviewController.js

```js
// In InterviewController.js
// const { Configuration, OpenAIApi } = require("openai"); // Example using OpenAI
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

const getAgentResponse = async (req, res) => {
  try {
    const { question, userAnswer, country, visaType } = req.body;
    
    // Create prompt for the AI
    const prompt = `You are a visa officer for ${country} conducting an interview for a ${visaType} visa application. 
    The applicant was asked: "${question}" 
    They responded: "${userAnswer}"
    
    Provide feedback on this response. Consider:
    1. How well it addresses the question
    2. Any red flags or inconsistencies
    3. What could be improved
    4. How a real visa officer might react`;
    
    // const completion = await openai.createCompletion({
    //   model: "gpt-4", // or other appropriate model
    //   prompt: prompt,
    //   max_tokens: 300,
    //   temperature: 0.7,
    // });

    const result = await model.generateContent(prompt);
    res.json({ response: result.response.text().trim() });
    console.log(result.response.text());
    
    // res.json({ response: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error in AI response:', error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

// Implement the other controller functions similarly
const getPreInterviewTips = async (req, res) => {
  try {
    const { country, visaType } = req.query;

    // Define tips based on country and visa type
    const tipsData = {
      US: {
        F1: {
          general: [
            "Be prepared to explain your study plan and future goals clearly.",
            "Know how you will finance your education and living expenses.",
            "Demonstrate a strong connection to your home country.",
          ],
          specific: [
            "Clearly articulate your academic intentions.",
            "Be aware of the program and university details.",
            "Have your financial documents readily available.",
          ],
        },
        "B1/B2": {
          general: [
            "Clearly state the purpose of your visit.",
            "Provide evidence of sufficient funds.",
            "Prove that you will return to your home country.",
          ],
          specific: [
            "Be ready to explain your itinerary.",
            "Show ties to your home country.",
            "Have information about your host or accommodation.",
          ],
        },
      },
      CA: {
        student: {
          general: [
            "Clearly state your reasons for choosing to study in Canada.",
            "Be able to explain how your studies will benefit your future career.",
            "Provide evidence of sufficient funds for tuition and living expenses.",
          ],
          specific: [
            "Know details about the institution and program.",
            "Be aware of the city where your institution is located.",
            "Be ready to explain your plans after completing your studies.",
          ],
        },
      },
      UK: {
        student: {
          general: [
            "Clearly state why you want to study in the UK.",
            "Demonstrate that you have sufficient funds.",
            "Explain your plans after completing your course.",
          ],
          specific: [
            "Know the details of your chosen institution and course.",
            "Relate the course to your previous education or career goals.",
            "Be ready to explain your accommodation plans.",
          ],
        },
      },
    };

    if (tipsData[country] && tipsData[country][visaType]) {
      res.json(tipsData[country][visaType]);
    } else {
      res.status(404).json({ error: "Tips not found for the specified country and visa type." });
    }
  } catch (error) {
    console.error('Error getting pre-interview tips:', error);
    res.status(500).json({ error: "Failed to fetch pre-interview tips" });
  }
};

const getCommonMistakes = async (req, res) => {
  try {
    const { country, visaType } = req.query;
    // Define common mistakes based on country and visa type
    const mistakesData = {
        US: {
          F1: [
            "Not being able to clearly explain your study plans and goals.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Appearing overly focused on post-graduation work in the U.S.",
          ],
          "B1/B2": [
            "Inability to clearly state the purpose of the visit.",
            "Inadequate proof of funds or financial support.",
            "Failure to demonstrate ties to home country.",
            "Vague travel plans or itinerary.",
            "Inconsistencies in the provided information.",
            "Insufficient knowledge about the duration or purpose of the visit.",
          ],
        },
        CA: {
          student: [
            "Not being able to clearly explain your study plans.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Inconsistencies in the provided information.",
            "Appearing overly focused on post-graduation work in Canada.",
          ],
        },
        UK: {
          student: [
            "Not being able to clearly explain your study plans.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Inconsistencies in the provided information.",
            "Appearing overly focused on post-graduation work in the UK.",
          ],
        },
      };
    if(mistakesData[country] && mistakesData[country][visaType]){
        res.json(mistakesData[country][visaType]);
    }
    else{
        res.status(404).json({ error: "Common Mistakes not found for the specified country and visa type." });
    }
  } catch (error) {
    console.error('Error getting common mistakes:', error);
    res.status(500).json({ error: "Failed to fetch common mistakes" });
  }
};

module.exports = {
  getAgentResponse,
  getPreInterviewTips,
  getCommonMistakes
};

// // In MVP, we're mostly using the frontend mockAgentService for simplicity.
// // This controller is kept very basic, just to show backend structure if you want to expand later.

// const getAgentResponse = async (req, res) => {
//     // In a real app, this would call the GPT service (or in-house model)
//     // For MVP backend example, just echo back a simplified message
//     const { question, userAnswer } = req.body;
  
//     if (!question || !userAnswer) {
//       return res.status(400).json({ error: "Question and user response are required." });
//     }
  
//     const mockResponse = `[Mock Backend Response] -  Received question: "${question}" and your answer. Backend processing simulated.`;
  
//     res.json({ response: mockResponse });
//   };
  
//   module.exports = {
//     getAgentResponse,
//   };
```

# backend/models/User.js

```js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: { type: String, required: true, trim: true },
  picture: { type: String },
  password: { type: String }, // For local auth, optional
  countryOfOrigin: { type: String },
  visaType: { type: String },
  interviewDate: { type: Date },
  subscriptionStatus: { type: String, default: 'free' }, // free, basic, pro, premium
  interviewHistory: [{ // Interview history
    date: { type: Date, default: Date.now },
    country: { type: String },
    visaType: { type: String },
    questions: [{
      question: { type: String },
      answer: { type: String },
      feedback: { type: String },
      timeTaken: {type: Number}
    }],
    timeTakenForInterview: {type: Number},
  }],
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

```

# backend/package.json

```json
{
    "name": "visa-prep-backend",
    "version": "1.0.0",
    "description": "Backend for Visa Prep MVP",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "cors": "^2.8.5",
        "dotenv": "^16.4.7",
        "express": "^4.18.2",
        "google-auth-library": "^9.15.1"
    }
}

```

# backend/routes/authRoutes.js

```js
// Updated backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/authUtils');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// Verify Google token function
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
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

module.exports = router;
```

# backend/routes/interviewRoutes.js

```js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// InterviewRoutes.js - Update with new endpoints
router.post('/agent-response', interviewController.getAgentResponse);
router.get('/tips', interviewController.getPreInterviewTips);
router.get('/common-mistakes', interviewController.getCommonMistakes);
router.post('/save-history', async (req, res) => {
  try {
    const { country, visaType, interviewHistory } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const simplifiedHistory = interviewHistory.map(item => ({
      question: item.question,
      answer: item.userResponse,
      feedback: item.agentResponse,
    }));

    user.interviewHistory.push({
      country: country,
      visaType: visaType,
      questions: simplifiedHistory,
    });

    await user.save();

    res.status(200).json({ message: 'Interview history saved successfully', interviewHistory });
  } catch (error) {
    console.error('Error saving interview history:', error);
    res.status(500).json({ error: 'Failed to save interview history' });
  }
});
// ...
module.exports = router;
```

# backend/server.js

```js
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
```

# backend/utils/authUtils.js

```js
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
```

# database.xlsx

This is a binary file of the type: Excel Spreadsheet

# frontend/package.json

```json
{
    "name": "visa-prep-frontend",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@react-oauth/google": "^0.12.1",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-router-dom": "^7.2.0",
        "react-scripts": "^5.0.1"
    },
    "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
    },
    "eslintConfig": {
        "extends": [
            "react-app",
            "react-app/jest"
        ]
    },
    "browserslist": {
        "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ]
    }
}

```

# frontend/public/index.html

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#007bff" />
    <meta name="description" content="Visa Interview Prep App - Practice and prepare for your visa interview." />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>VisaCoach - Ace Your Visa Interview</title>
    <!-- Link to Google Fonts (you can change this if you prefer other fonts) -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">

</head>

<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>

</html>

```

# frontend/src/App.js

```js
import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import InterviewPage from './pages/InterviewPage';
import LandingPage from './pages/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import GoogleAuth from './components/GoogleAuth';
import ProfilePage from './components/ProfilePage';
import CountrySelect from './components/CountrySelect';
import Navbar from './components/Navbar'; // Create this component for consistent navigation

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      // Add token validation logic here
      // Consider adding a function to fetch user data with the token
      const validateToken = async () => {
        try {
          // Replace with your actual API endpoint
          const response = await fetch('/api/validate-token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token invalid
            handleLogout();
          }
        } catch (error) {
          console.error('Token validation error:', error);
        }
      };
      
      // validateToken();
    }
  }, [token]);

  const handleLoginSuccess = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);
  };

  // Protected route component
  const ProtectedRoute = () => {
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
  };

  // Authentication context value
  const authContextValue = {
    user,
    token,
    isLoggedIn,
    handleLoginSuccess,
    handleLogout
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <BrowserRouter>
        <div className="app-container">
          {/* Navbar will only show on routes other than landing page */}
          <Routes>
            <Route path="/" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>
          
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                <LandingPage 
                  onSelectCountry={handleCountrySelect} 
                  onSelectVisaType={handleVisaTypeSelect}
                  selectedCountry={selectedCountry}
                  selectedVisaType={selectedVisaType}
                />
              } 
            />
            <Route 
              path="/login" 
              element={
                isLoggedIn ? 
                <Navigate to="/interview" /> : 
                <Login onLoginSuccess={handleLoginSuccess} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isLoggedIn ? 
                <Navigate to="/interview" /> : 
                <Register onRegistrationSuccess={handleLoginSuccess} />
              } 
            />
            <Route
              path="/google"
              element={<GoogleAuth onLoginSuccess={handleLoginSuccess} />}
            />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route 
                path="/selection" 
                element={
                  <CountrySelect 
                    onSelectCountry={handleCountrySelect}
                    onSelectVisaType={handleVisaTypeSelect}
                    selectedCountry={selectedCountry}
                    selectedVisaType={selectedVisaType}
                  />
                } 
              />
              <Route 
                path="/interview" 
                element={
                  <InterviewPage 
                    selectedCountry={selectedCountry} 
                    selectedVisaType={selectedVisaType}
                  />
                } 
              />
              <Route path="/profile" element={<ProfilePage user={user} />} />
            </Route>
            
            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
```

# frontend/src/assets/icons/ai-feedback.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/anytime-anywhere.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/expert-guidance.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/logo-symbol.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/peace-of-mind.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/personalized-support.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/realistic-simulation.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/simplified-process.svg

This is a file of the type: SVG Image

# frontend/src/assets/icons/time-savings.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/600x400.png

This is a binary file of the type: Image

# frontend/src/assets/images/ai-analysis.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/DALL·E 2025-02-28 18.12.16 - A diverse group of people joyfully celebrating after receiving their visas. They are holding their passports open to show the visa pages, smiling, and.webp

This is a binary file of the type: Image

# frontend/src/assets/images/DALLE2025-02-2818.12.16-Adiversegroupofpeoplejoyfullycelebratingafterreceivingtheirvisas.Theyareholdingtheirpassportsopentoshowthevisapagessmilingand-ezgif.com-webp-to-jpg-converter.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/flags/au.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/flags/ca.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/flags/de.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/flags/logo-symbol.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/flags/uk.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/flags/us.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/hero-illustration.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/hero-image.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/hero-image1.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/interview-simulation.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/logo-symbol.svg

This is a file of the type: SVG Image

# frontend/src/assets/images/user-avatar-1.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/user-avatar-2.jpg

This is a binary file of the type: Image

# frontend/src/assets/images/user-avatar-3.jpg

This is a binary file of the type: Image

# frontend/src/components/AgentResponse.js

```js
import React from 'react';

function AgentResponse({ question, response }) {
  return (
    <div className="agent-response">
      <p><b>Visa Officer:</b> {question}</p>
      {response && <p><b>Your Response Feedback:</b> {response}</p>}
    </div>
  );
}

export default AgentResponse;
```

# frontend/src/components/CountrySelect.css

```css
/* CountrySelect.css */
@import url('https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/css/flag-icons.min.css');

.country-visa-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.form-title {
  color: #1e293b;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  position: relative;
}

.form-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-image: linear-gradient(90deg, #1e40af, #3b82f6);
  border-radius: 2px;
}

/* Country Selection */
.country-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.country-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.country-card:hover {
  transform: translateY(-4px);
  background-color: #f0f9ff;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
}

.country-card.selected {
  background-color: #ebf8ff;
  border-color: #3b82f6;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
}

.country-card.selected::before {
  content: '✓';
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 14px;
  color: #3b82f6;
}

.country-flag {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.country-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  text-align: center;
}

/* Visa Type Selection */
.visa-type-container {
  background-color: #f8f9fb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
}

.visa-type-container.expanded {
  max-height: 800px;
  opacity: 1;
  transform: translateY(0);
}

.visa-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  margin-right: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.visa-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.visa-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
}

.visa-type-card:hover {
  transform: translateY(-4px);
  border-color: #bfdbfe;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
}

.visa-type-card.selected {
  background-color: #ebf8ff;
  border-color: #3b82f6;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
}

.visa-type-card.selected::before {
  content: '✓';
  position: absolute;
  top: 5px;
  right: 8px;
  font-size: 14px;
  color: #3b82f6;
}

.visa-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.visa-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  text-align: center;
}

/* Info Tooltip */
.info-tooltip {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 400px;
  padding: 1rem 1.5rem;
  background-color: #1e293b;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.info-tooltip p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* Selection Summary */
.selection-summary {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f9ff;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  animation: fadeIn 0.5s ease;
}

.summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  margin-right: 0.75rem;
}

.summary-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.summary-details {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-country, .summary-visa {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-country span:first-child {
  font-size: 1.5rem;
}

.visa-icon-small {
  font-size: 1.25rem;
}

.ready-message {
  margin-top: 1rem;
  color: #3b82f6;
  font-weight: 600;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .country-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
  
  .visa-type-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .summary-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .country-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .visa-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .country-visa-container {
    padding: 1.5rem;
  }
}
```

# frontend/src/components/CountrySelect.js

```js
// CountrySelect.js
import React, { useState, useEffect } from 'react';
import './CountrySelect.css';

function CountrySelect({ onSelectCountry, onSelectVisaType, selectedCountry }) {
  const countries = [
    { 
      value: 'US', 
      label: 'United States', 
      flagCode: 'us',
      description: 'One of the most popular destinations for education, business, and tourism.'
    },
    { 
      value: 'CA', 
      label: 'Canada', 
      flagCode: 'ca',
      description: 'Known for its welcoming immigration policies and high quality of life.'
    },
    { 
      value: 'UK', 
      label: 'United Kingdom', 
      flagCode: 'gb',
      description: 'A global hub for education, business, and cultural experiences.'
    },
    { 
      value: 'AU', 
      label: 'Australia', 
      flagCode: 'au',
      description: 'Popular for its excellent universities and working holiday options.'
    },
    { 
      value: 'NZ', 
      label: 'New Zealand', 
      flagCode: 'nz',
      description: 'Known for its stunning landscapes and quality education system.'
    },
    { 
      value: 'DE', 
      label: 'Germany', 
      flagCode: 'de',
      description: 'Europe\'s economic powerhouse with many tuition-free universities.'
    },
    { 
      value: 'FR', 
      label: 'France', 
      flagCode: 'fr',
      description: 'Famous for its culture, cuisine, and education opportunities.'
    },
    { 
      value: 'JP', 
      label: 'Japan', 
      flagCode: 'jp',
      description: 'Combining traditional culture with cutting-edge technology and education.'
    }
  ];

  const visaTypes = {
    US: [
      { value: 'F1', label: 'F1 Student Visa', icon: '🎓', description: 'For academic students enrolled in US colleges, universities, or language programs' },
      { value: 'B1/B2', label: 'B1/B2 Tourist/Business Visa', icon: '✈️', description: 'For temporary visitors for business or pleasure' },
      { value: 'H1B', label: 'H1B Work Visa', icon: '💼', description: 'For specialty occupations requiring theoretical or technical expertise' },
      { value: 'O1', label: 'O1 Extraordinary Ability Visa', icon: '🌟', description: 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics' },
      { value: 'J1', label: 'J1 Exchange Visitor Visa', icon: '🔄', description: 'For approved exchange visitor programs' }
    ],
    CA: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For international students accepted by a Canadian educational institution' },
      { value: 'work', label: 'Work Permit', icon: '💼', description: 'For temporary foreign workers with valid job offers' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For temporary visitors for tourism or family visits' },
      { value: 'business', label: 'Business Visa', icon: '📊', description: 'For business meetings, conferences, or negotiations' },
      { value: 'express', label: 'Express Entry', icon: '🚀', description: 'For skilled workers seeking permanent residence' }
    ],
    UK: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at a UK educational institution' },
      { value: 'skilled', label: 'Skilled Worker Visa', icon: '💼', description: 'For qualified professionals with job offers' },
      { value: 'visitor', label: 'Standard Visitor Visa', icon: '✈️', description: 'For tourism, visiting family/friends, or business activities' },
      { value: 'startup', label: 'Start-up Visa', icon: '🚀', description: 'For entrepreneurs starting an innovative business' },
      { value: 'family', label: 'Family Visa', icon: '👪', description: 'For joining family members who are UK citizens or settled persons' }
    ],
    AU: [
      { value: 'student', label: 'Student Visa (Subclass 500)', icon: '🎓', description: 'For international students enrolled in Australian courses' },
      { value: 'work', label: 'Temporary Skill Shortage Visa', icon: '💼', description: 'For skilled workers with employer sponsorship' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For tourism, business visits, or family visits' },
      { value: 'working-holiday', label: 'Working Holiday Visa', icon: '🏄', description: 'For young adults wanting to work and travel in Australia' }
    ],
    NZ: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For international students accepted by NZ educational institutions' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For skilled workers with job offers' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For tourism or short business visits' }
    ],
    DE: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at German universities or language schools' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For qualified professionals with job offers' },
      { value: 'jobseeker', label: 'Job Seeker Visa', icon: '🔍', description: 'For qualified professionals seeking employment' }
    ],
    FR: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at French educational institutions' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For temporary workers with contracts' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For tourism or short-term visits' }
    ],
    JP: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at Japanese schools or universities' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For skilled workers in designated fields' },
      { value: 'tourist', label: 'Tourist Visa', icon: '✈️', description: 'For short-term visits for tourism' }
    ]
  };

  const [countrySelection, setCountrySelection] = useState(selectedCountry || '');
  const [visaTypeSelection, setVisaTypeSelection] = useState('');
  const [availableVisaTypes, setAvailableVisaTypes] = useState([]);
  const [visaTypeExpanded, setVisaTypeExpanded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState({ visible: false, content: '', type: '' });

  useEffect(() => {
    if (countrySelection) {
      setAvailableVisaTypes(visaTypes[countrySelection] || []);
    } else {
      setAvailableVisaTypes([]);
    }
    setVisaTypeSelection(''); // Reset visa type when country changes
  }, [countrySelection]);

  const handleCountryChange = (country) => {
    setCountrySelection(country);
    setVisaTypeExpanded(true);
  };

  const handleVisaTypeChange = (visaType) => {
    setVisaTypeSelection(visaType);
    
    // Only call the parent handlers when both values are selected
    if (countrySelection && visaType) {
      onSelectCountry(countrySelection);
      onSelectVisaType(visaType);
    }
  };

  const handleInfoHover = (content, type) => {
    setHoverInfo({ visible: true, content, type });
  };

  const handleInfoLeave = () => {
    setHoverInfo({ visible: false, content: '', type: '' });
  };

  const getSelectedCountryData = () => {
    return countries.find(c => c.value === countrySelection) || {};
  };

  const getSelectedVisaData = () => {
    return availableVisaTypes.find(v => v.value === visaTypeSelection) || {};
  };

  return (
    <div className="country-visa-container">
      <h2 className="form-title">Where are you going?</h2>
      
      <div className="country-grid">
        {countries.map((country) => (
          <div 
            key={country.value}
            className={`country-card ${countrySelection === country.value ? 'selected' : ''}`}
            onClick={() => handleCountryChange(country.value)}
            onMouseEnter={() => handleInfoHover(country.description, 'country')}
            onMouseLeave={handleInfoLeave}
          >
            <div className="country-flag">
              <span className={`fi fi-${country.flagCode}`}></span>
            </div>
            <span className="country-name">{country.label}</span>
          </div>
        ))}
      </div>
      
      {countrySelection && (
        <div className={`visa-type-container ${visaTypeExpanded ? 'expanded' : ''}`}>
          <h3 className="visa-section-title">
            <span className="section-number">2</span> Select Visa Type for {getSelectedCountryData().label}
          </h3>
          
          <div className="visa-type-grid">
            {availableVisaTypes.map((visa) => (
              <div 
                key={visa.value}
                className={`visa-type-card ${visaTypeSelection === visa.value ? 'selected' : ''}`}
                onClick={() => handleVisaTypeChange(visa.value)}
                onMouseEnter={() => handleInfoHover(visa.description, 'visa')}
                onMouseLeave={handleInfoLeave}
              >
                <div className="visa-icon">{visa.icon}</div>
                <span className="visa-name">{visa.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hoverInfo.visible && (
        <div className="info-tooltip">
          <p>{hoverInfo.content}</p>
        </div>
      )}

      {countrySelection && visaTypeSelection && (
        <div className="selection-summary">
          <div className="summary-header">
            <div className="summary-icon">✓</div>
            <h3>You've selected:</h3>
          </div>
          <div className="summary-details">
            <div className="summary-country">
              <span className={`fi fi-${getSelectedCountryData().flagCode}`}></span>
              <span>{getSelectedCountryData().label}</span>
            </div>
            <div className="summary-visa">
              <span className="visa-icon-small">{getSelectedVisaData().icon}</span>
              <span>{getSelectedVisaData().label}</span>
            </div>
          </div>
          <p className="ready-message">You're ready to begin your interview preparation!</p>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;
```

# frontend/src/components/GoogleAuth.js

```js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

function GoogleAuth({ onLoginSuccess, onLoginError }) {
  const handleLoginSuccess = async (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);

    try {
      // Send the token to the backend for verification
      const backendResponse = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        console.log('Backend verification successful:', data);
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        const errorData = await backendResponse.json();
        console.error('Backend verification failed:', errorData);
        onLoginError(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error('Error handling Google login:', error);
      onLoginError("Login failed");
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => {
          console.error('Google Login Failed');
          onLoginError("Login failed");
        }}
        useOneTap
      />
    </div>
  );
}

export default GoogleAuth;

```

# frontend/src/components/InterviewScreen.css

```css
/* InterviewScreen.css */
.interview-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.interview-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.interview-header h2 {
  color: #1e293b;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background-image: linear-gradient(90deg, #1e40af, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.interview-info {
  display: flex;
  gap: 10px;
  margin-left: auto;
  margin-right: 20px;
}

.badge {
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.country-badge {
  background-color: #ebf5ff;
  color: #1e40af;
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.visa-badge {
  background-color: #e6fffa;
  color: #0d9488;
  border: 1px solid rgba(13, 148, 136, 0.2);
}

.back-button {
  background-color: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-button:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #475569;
}

.interview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.conversation-history {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-height: 450px;
  overflow-y: auto;
  padding-right: 12px;
  scrollbar-width: thin;
}

.conversation-item {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agent-question,
.user-response,
.agent-feedback,
.welcome-message,
.current-question {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.user-response {
  flex-direction: row-reverse;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.agent-avatar {
  background-color: #e0f2fe;
  border: 2px solid #bae6fd;
}

.agent-avatar svg {
  color: #0284c7;
}

.user-avatar {
  background-color: #e0e7ff;
  border: 2px solid #c7d2fe;
}

.user-avatar svg {
  color: #4f46e5;
}

.message-bubble {
  max-width: 80%;
  padding: 16px;
  border-radius: 14px;
  position: relative;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.message-bubble:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.agent-bubble {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-top-left-radius: 4px;
}

.agent-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-left: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  transform: rotate(45deg);
  border-bottom-left-radius: 4px;
}

.user-bubble {
  background-color: #eef2ff;
  border-top-right-radius: 4px;
}

.user-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 16px;
  height: 16px;
  background-color: #eef2ff;
  border-right: 1px solid #eef2ff;
  border-bottom: 1px solid #eef2ff;
  transform: rotate(45deg);
  border-bottom-right-radius: 4px;
}

.feedback-bubble {
  background-color: #f0fdf4;
  border: 1px solid #d1fae5;
}

.feedback-bubble::before {
  background-color: #f0fdf4;
  border-left: 1px solid #d1fae5;
  border-bottom: 1px solid #d1fae5;
}

.message-bubble p {
  margin: 0;
  line-height: 1.6;
  color: #334155;
}

.question-text {
  font-weight: 500;
  color: #1e293b;
  font-size: 1.05rem;
}

.question-number {
  display: block;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.current-question-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px dashed #e2e8f0;
}

.user-input-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.textarea-container {
  position: relative;
  transition: all 0.2s ease;
}

.response-input {
  width: 100%;
  min-height: 100px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  line-height: 1.6;
}

.response-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.response-input::placeholder {
  color: #94a3b8;
}

.feedback-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 6px 0 0 0;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.button-group {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}

.submit-button,
.next-button,
.restart-button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
}

.submit-button {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.submit-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.next-button {
  background-color: #0d9488;
  color: white;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

.next-button:hover {
  background-color: #0f766e;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.3);
}

.next-button:active {
  transform: translateY(0);
}

/* Preparation Screen Styles */
.preparation-screen {
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.preparation-screen h3 {
  color: #1e293b;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  padding-bottom: 12px;
}

.preparation-screen h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-image: linear-gradient(90deg, #1e40af, #3b82f6);
  border-radius: 2px;
}

.prep-section {
  margin-bottom: 24px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.prep-section h4 {
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.prep-section h4 svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.confidence-slider {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  margin-bottom: 10px;
}

.slider-track input {
  position: absolute;
  top: -6px;
  left: 0;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.slider-progress {
  position: absolute;
  height: 100%;
  background-image: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 10px;
}

.confidence-value {
  text-align: center;
  font-weight: 600;
  color: #1e293b;
}

.concerns-checkboxes, .feedback-radios {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.custom-checkbox, .custom-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.custom-checkbox:hover, .custom-radio:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.custom-checkbox input, .custom-radio input {
  opacity: 0;
  position: absolute;
}

.checkmark, .radio-mark {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 2px solid #94a3b8;
  transition: all 0.2s ease;
}

.checkmark {
  border-radius: 4px;
}

.radio-mark {
  border-radius: 50%;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.custom-radio input:checked ~ .radio-mark {
  border-color: #3b82f6;
}

.custom-checkbox input:checked ~ .checkmark:after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-radio input:checked ~ .radio-mark:after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.prep-tips-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .prep-tips-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

.prep-tips {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tips-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  margin-bottom: 10px;
  padding-left: 24px;
  position: relative;
  line-height: 1.5;
}

.tips-list li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
}

.start-interview-button {
  background-color: #3b82f6;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 24px auto 0;
  display: block;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.start-interview-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

/* Interview Complete Styles */
.interview-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  position: relative;
}

.show-animation {
  animation: celebrationEffect 3s ease;
}

@keyframes celebrationEffect {
  0% { transform: scale(1); }
  10% { transform: scale(1.05); }
  20% { transform: scale(1); }
  30% { transform: scale(1.02); }
  40%, 100% { transform: scale(1); }
}

.completion-message {
  max-width: 600px;
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.completion-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.completion-icon {
  font-size: 2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.completion-message h3 {
  color: #1e293b;
  margin: 0;
  font-size: 1.75rem;
  background-image: linear-gradient(90deg, #1e40af, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.interview-summary {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
}

.summary-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.score-circle {
  width: 120px;
  height: 120px;
}

.score-circle svg {
  width: 100%;
  height: 100%;
}

.score-circle-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}

.score-circle-progress {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dasharray 1s ease;
}

.score-text {
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: bold;
  fill: #1e293b;
  text-anchor: middle;
}

.score-info {
  text-align: left;
}

.score-info h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.25rem;
  color: #1e293b;
}

.score-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.summary-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.summary-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1e293b;
  font-size: 1.1rem;
}

.summary-section ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.summary-section li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-section li svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.summary-section li:nth-child(1) svg {
  color: #3b82f6;
}

.summary-section li:nth-child(2) svg {
  color: #0d9488;
}

.completion-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  margin-bottom: 24px;
}

.restart-button, .prep-button {
  background-color: #3b82f6;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.restart-button:hover, .prep-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.restart-button svg, .prep-button svg {
  width: 18px;
  height: 18px;
}

.prep-button {
  background-color: #0d9488;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

.prep-button:hover {
  background-color: #0f766e;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.3);
}

.premium-offer {
  margin-top: 24px;
  padding: 20px;
  background-color: #fef3c7;
  border-radius: 12px;
  border: 1px dashed #f59e0b;
  position: relative;
  overflow: hidden;
}

.premium-offer::before {
  content: 'PRO';
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f59e0b;
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 4px;
}

.premium-offer h4 {
  color: #92400e;
  margin-top: 0;
  margin-bottom: 8px;
}

.premium-offer p {
  color: #92400e;
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.premium-button {
  background-color: #f59e0b;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.premium-button:hover {
  background-color: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

.premium-button svg {
  width: 18px;
  height: 18px;
}

/* Scrollbar styling */
.conversation-history::-webkit-scrollbar {
  width: 8px;
}

.conversation-history::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.conversation-history::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.conversation-history::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .interview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .interview-info {
    margin-left: 0;
    margin-right: 0;
  }
  
  .button-group {
    flex-direction: column;
    width: 100%;
  }
  
  .submit-button, .next-button {
    width: 100%;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .completion-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .restart-button, .prep-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .interview-container {
    padding: 16px;
  }
  
  .interview-header h2 {
    font-size: 1.5rem;
  }
  
  .summary-score {
    flex-direction: column;
  }
  
  .score-info {
    text-align: center;
  }
}
```

# frontend/src/components/InterviewScreen.js

```js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { aiInterviewService } from '../services/aiInterviewService.js';
import './InterviewScreen.css';

function InterviewScreen({ selectedCountry, selectedVisaType, onGoBack, userPlan }) {
  // State variables
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [agentResponse, setAgentResponse] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [preparationTips, setPreparationTips] = useState({general: [], specific: []});
  const [commonMistakes, setCommonMistakes] = useState([]);
  const [showPrep, setShowPrep] = useState(true);
  const [userConfidence, setUserConfidence] = useState(5);
  const [userNeeds, setUserNeeds] = useState([]);
  const [feedbackLevel, setFeedbackLevel] = useState('detailed');
  const [interviewStats, setInterviewStats] = useState({
    strongAreas: [],
    improvementAreas: [],
    overallScore: 0
  });
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Authentication related
  const { token, isLoggedIn } = useContext(UserContext) || { token: null, isLoggedIn: false };
  const navigate = useNavigate();
  
  const conversationEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Check authentication on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken && !token) {
      navigate('/login');
    }
  }, [navigate, token]);

  useEffect(() => {
    // Load questions based on country and visa type
    loadQuestions();
    
    // Load preparation tips and handle the Promise correctly
    async function fetchTips() {
      try {
        const tips = await aiInterviewService.getPreInterviewTips(selectedCountry, selectedVisaType);
        setPreparationTips(tips || {general: [], specific: []});
      } catch (error) {
        console.error("Error loading preparation tips:", error);
        // Check for authentication error
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setPreparationTips({general: [], specific: []});
        }
      }
    }
    
    // Load common mistakes and handle the Promise correctly
    async function fetchMistakes() {
      try {
        const mistakes = await aiInterviewService.getCommonMistakes(selectedCountry, selectedVisaType);
        setCommonMistakes(mistakes || []);
      } catch (error) {
        console.error("Error loading common mistakes:", error);
        // Check for authentication error
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setCommonMistakes([]);
        }
      }
    }
    
    fetchTips();
    fetchMistakes();
  }, [selectedCountry, selectedVisaType, navigate]);

  useEffect(() => {
    // Auto-scroll to the bottom of the conversation
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, agentResponse]);

  useEffect(() => {
    // Loading animation effect
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'inherit';
      textAreaRef.current.style.height = `${Math.max(textAreaRef.current.scrollHeight, 100)}px`;
    }
  }, [userResponse]);

  const loadQuestions = () => {
    // Enhanced question sets - organized by country and visa type
    const questionSets = {
      US: {
        F1: [
          "What are your plans after completing your studies in the US?",
          "Why did you choose to study in the United States instead of your home country or other countries?",
          "How will you finance your education and living expenses while in the US?",
          "What is your intended major of study and why did you choose this field?",
          "Have you researched your university's location? Where do you plan to stay?",
          "Can you describe your academic background and how it relates to your chosen field of study?",
          "Do you have family members currently in the United States?",
          "How will this degree help your career when you return to your home country?",
          "Have you taken the TOEFL or IELTS? What was your score?",
          "Have you been offered any scholarships or financial aid?",
          "What specific classes or projects are you looking forward to at your university?",
          "Have you traveled to the US before? If so, when and for what purpose?"
        ],
        'B1/B2': [
          "What is the purpose of your visit to the United States?",
          "How long do you plan to stay in the US?",
          "Where will you be staying during your visit?",
          "Have you visited the United States before?",
          "Who will you be visiting in the United States?",
          "What is your occupation in your home country?",
          "How will your responsibilities be handled while you're away?",
          "How are you financing this trip?",
          "What ties do you have to your home country that will ensure your return?",
          "Do you have family members in the United States?",
          "What places do you plan to visit during your stay?"
        ]
      },
      CA: {
        student: [
          "Why have you chosen to study in Canada?",
          "How will your studies in Canada benefit your future career?",
          "How do you plan to finance your studies and living expenses in Canada?",
          "Why did you choose this specific institution and program?",
          "What are your plans after completing your studies in Canada?",
          "Do you have family members currently in Canada?",
          "Have you researched the city where your institution is located?",
          "How does this program relate to your previous education or work experience?",
          "Have you applied for a Canadian study permit before?",
          "Do you plan to work part-time during your studies?",
          "How do educational options in Canada compare to those in your home country?"
        ]
      },
      UK: {
        student: [
          "Why do you want to study in the UK?",
          "How will you support yourself financially during your studies?",
          "What are your plans after completing your course in the UK?",
          "Why did you choose this specific institution and course?",
          "How does this course relate to your previous education?",
          "What are your career goals and how will this course help you achieve them?",
          "Have you previously studied or applied to study in the UK?",
          "Do you have family members currently in the UK?",
          "How will you accommodate yourself during your studies?",
          "Have you taken an English language test? What was your score?",
          "How do educational options in the UK compare to those in your home country?"
        ]
      }
    };

    // Set questions or default message
    if (questionSets[selectedCountry]?.[selectedVisaType]) {
      setInterviewQuestions(questionSets[selectedCountry][selectedVisaType]);
    } else {
      setInterviewQuestions([]);
      setAgentResponse("There are no questions available for this selection yet. Please choose another visa type or country.");
    }
  };

  const handleUserResponse = async () => {
    if (!userResponse.trim()) {
      setFeedbackMessage("Please provide an answer before continuing.");
      return;
    }

    setFeedbackMessage("");
    setIsLoading(true);
    
    // Add user's response to conversation history
    const newHistory = [...conversationHistory, {
      question: interviewQuestions[currentQuestionIndex],
      userResponse: userResponse,
      agentResponse: ""
    }];
    
    setConversationHistory(newHistory);

    try {
      // Get agent's response to user's answer
      const response = await aiInterviewService.getAgentResponse(
        interviewQuestions[currentQuestionIndex], 
        userResponse,
        selectedCountry,
        selectedVisaType
      );
      
      // Update history with agent's response
      newHistory[newHistory.length - 1].agentResponse = response;
      setConversationHistory(newHistory);
      setAgentResponse(response);
      
      // Update interview stats (this would be dynamic in a real implementation)
      updateInterviewStats(newHistory);
    } catch (error) {
      console.error("Error getting agent response:", error);
      
      // Check for authentication error
      if (error.response && error.response.status === 401) {
        // Token might be expired or invalid
        navigate('/login');
      } else {
        setAgentResponse("I'm having trouble processing your response. Let's continue to the next question.");
      }
    } finally {
      setIsLoading(false);
      setUserResponse(''); // Clear input field
    }
  };

  const updateInterviewStats = (history) => {
    // This is a placeholder for real implementation
    // In a real app, you'd analyze responses and provide meaningful feedback
    const strongAreas = ["Study plans", "Financial arrangements"];
    const improvementAreas = ["Post-graduation plans", "Ties to home country"];
    
    const totalQuestions = history.length;
    const overallScore = Math.min(95, 65 + (totalQuestions * 3)); // Just for demonstration
    
    setInterviewStats({
      strongAreas,
      improvementAreas,
      overallScore
    });
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= interviewQuestions.length) {
      setInterviewComplete(true);
      setAgentResponse("Thank you for completing the interview simulation. You can review your conversation history below.");
      saveInterviewHistory();
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setAgentResponse(''); // Clear agent response for next question
    }
  };

  const startInterview = () => {
    setShowPrep(false);
    setAgentResponse("Welcome to your visa interview simulation. I'll be asking you questions about your visa application. Please answer honestly as you would in a real interview.");
  };

  const saveInterviewHistory = async () => {
    try {
      const interviewData = {
        country: selectedCountry,
        visaType: selectedVisaType,
        interviewHistory: conversationHistory,
        stats: interviewStats
      };
  
      const result = await aiInterviewService.saveInterviewHistory(interviewData);
      console.log('Interview history saved:', result);
    } catch (error) {
      console.error('Error saving interview history:', error);
      // Check for authentication error - but don't redirect, just log it
      if (error.response && error.response.status === 401) {
        console.log('Authentication error when saving history');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserResponse();
    }
  };

  const handleNeedsChange = (need) => {
    if (userNeeds.includes(need)) {
      setUserNeeds(userNeeds.filter(n => n !== need));
    } else {
      setUserNeeds([...userNeeds, need]);
    }
  };

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const isInterviewOver = currentQuestionIndex >= interviewQuestions.length || interviewComplete;

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h2>Visa Interview Simulation</h2>
        <div className="interview-info">
          <span className="badge country-badge">{selectedCountry}</span>
          <span className="badge visa-badge">{selectedVisaType}</span>
        </div>
        <button className="back-button" onClick={onGoBack}>
          ← Back to Selection
        </button>
      </div>

      {showPrep ? (
        <div className="preparation-screen">
          <h3>Prepare for Your Interview</h3>
          
          <div className="prep-section">
            <h4>How confident are you about this interview?</h4>
            <div className="confidence-slider">
              <div className="slider-track">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={userConfidence}
                  onChange={(e) => setUserConfidence(parseInt(e.target.value))}
                />
                <div className="slider-progress" style={{width: `${(userConfidence-1) * 10}%`}}></div>
              </div>
              <div className="slider-labels">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
              <div className="confidence-value">Your confidence: {userConfidence}/10</div>
            </div>
          </div>
          
          <div className="prep-section">
            <h4>What are you most concerned about? (Select all that apply)</h4>
            <div className="concerns-checkboxes">
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('answering')}
                  onChange={() => handleNeedsChange('answering')}
                />
                <span className="checkmark"></span>
                Answering questions effectively
              </label>
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('documentation')}
                  onChange={() => handleNeedsChange('documentation')}
                />
                <span className="checkmark"></span>
                Required documentation
              </label>
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('english')}
                  onChange={() => handleNeedsChange('english')}
                />
                <span className="checkmark"></span>
                English language skills
              </label>
              <label className="custom-checkbox">
                <input 
                  type="checkbox" 
                  checked={userNeeds.includes('nervousness')}
                  onChange={() => handleNeedsChange('nervousness')}
                />
                <span className="checkmark"></span>
                Managing nervousness
              </label>
            </div>
          </div>
          
          <div className="prep-section">
            <h4>How detailed would you like the feedback to be?</h4>
            <div className="feedback-radios">
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="feedback" 
                  value="brief"
                  checked={feedbackLevel === 'brief'}
                  onChange={() => setFeedbackLevel('brief')}
                />
                <span className="radio-mark"></span>
                Brief (Just tell me if I'm on the right track)
              </label>
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="feedback" 
                  value="detailed"
                  checked={feedbackLevel === 'detailed'}
                  onChange={() => setFeedbackLevel('detailed')}
                />
                <span className="radio-mark"></span>
                Detailed (Provide specific suggestions)
              </label>
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="feedback" 
                  value="realistic"
                  checked={feedbackLevel === 'realistic'}
                  onChange={() => setFeedbackLevel('realistic')}
                />
                <span className="radio-mark"></span>
                Realistic (Minimal feedback, like a real interview)
              </label>
            </div>
          </div>
          
          <div className="prep-tips-container">
            <div className="prep-section prep-tips">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="8"></line>
                </svg>
                General Interview Tips
              </h4>
              <ul className="tips-list">
                {preparationTips.general.map((tip, index) => (
                  <li key={`general-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="prep-section prep-tips">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Specific Tips for {selectedCountry} {selectedVisaType} Visa
              </h4>
              <ul className="tips-list">
                {preparationTips.specific.map((tip, index) => (
                  <li key={`specific-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="prep-section prep-tips">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Common Mistakes to Avoid
              </h4>
              <ul className="tips-list">
                {commonMistakes.map((mistake, index) => (
                  <li key={`mistake-${index}`}>{mistake}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <button className="start-interview-button" onClick={startInterview}>
            Start Interview Simulation
          </button>
        </div>
      ) : (
        <div className="interview-content">
          {/* Conversation history */}
          <div className="conversation-history">
            {conversationHistory.map((item, index) => (
              <div className="conversation-item" key={index}>
                <div className="agent-question">
                  <div className="avatar agent-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="message-bubble agent-bubble">
                    <p className="question-text">{item.question}</p>
                  </div>
                </div>
                
                <div className="user-response">
                  <div className="message-bubble user-bubble">
                    <p>{item.userResponse}</p>
                  </div>
                  <div className="avatar user-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                
                {item.agentResponse && feedbackLevel !== 'realistic' && (
                  <div className="agent-feedback">
                    <div className="avatar agent-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="message-bubble agent-bubble feedback-bubble">
                      <p>{feedbackLevel === 'brief' 
                        ? item.agentResponse.split('.')[0] + '.' // Just the first sentence
                        : item.agentResponse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Render welcome message if it's the first question */}
            {agentResponse && conversationHistory.length === 0 && (
              <div className="welcome-message">
                <div className="avatar agent-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="message-bubble agent-bubble">
                  <p>{agentResponse}</p>
                </div>
              </div>
            )}
            
            {/* Current question */}
            {currentQuestion && !isInterviewOver && (
              <div className="current-question">
                <div className="avatar agent-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="message-bubble agent-bubble">
                  <p className="question-text">{currentQuestion}</p>
                  <span className="question-number">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
                </div>
              </div>
            )}
            
            <div ref={conversationEndRef} />
          </div>
          
          {/* Current question section */}
          {!isInterviewOver ? (
            <div className="user-input-section">
              <div className="textarea-container">
                <textarea
                  ref={textAreaRef}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="response-input"
                  disabled={isLoading}
                  rows="3"
                />
                
                {feedbackMessage && (
                  <p className="feedback-message">{feedbackMessage}</p>
                )}
              </div>
              
              <div className="button-group">
                <button 
                  className="submit-button"
                  onClick={handleUserResponse}
                  disabled={isLoading}
                >
                  {isLoading ? `Processing${loadingDots}` : "Submit Answer"}
                </button>
                
                {agentResponse && !isLoading && feedbackLevel !== 'realistic' && (
                  <button 
                    className="next-button"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < interviewQuestions.length - 1 ? "Next Question" : "Complete Interview"}
                  </button>
                )}
                
                {feedbackLevel === 'realistic' && !isLoading && userResponse.length === 0 && conversationHistory.length > 0 && (
                  <button 
                    className="next-button"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < interviewQuestions.length - 1 ? "Next Question" : "Complete Interview"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`interview-complete ${showAnimation ? 'show-animation' : ''}`}>
              <div className="completion-message">
                <div className="completion-header">
                  <div className="completion-icon">🎉</div>
                  <h3>Interview Simulation Complete</h3>
                </div>
                
                <p>You've completed all questions for this visa interview simulation.</p>
                
                <div className="interview-summary">
                  <div className="summary-score">
                    <div className="score-circle">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="score-circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="score-circle-progress"
                          strokeDasharray={`${interviewStats.overallScore}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="score-text">{interviewStats.overallScore}%</text>
                      </svg>
                    </div>
                    <div className="score-info">
                      <h4>Overall Performance</h4>
                      <p>Based on {conversationHistory.length} questions</p>
                    </div>
                  </div>
                  
                  <div className="summary-details">
                    <div className="summary-section">
                      <h4>Your Strengths</h4>
                      <ul>
                        {interviewStats.strongAreas.map((area, index) => (
                          <li key={index}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="summary-section">
                      <h4>Areas for Improvement</h4>
                      <ul>
                        {interviewStats.improvementAreas.map((area, index) => (
                          <li key={index}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="completion-actions">
                  <button className="restart-button" onClick={() => {
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setAgentResponse("Welcome back! Let's start the interview again.");
                    setInterviewComplete(false);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6"></path>
                      <path d="M1 20v-6h6"></path>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Restart Interview
                  </button>
                  
                  <button className="prep-button" onClick={() => {
                    setShowPrep(true);
                    setCurrentQuestionIndex(0);
                    setConversationHistory([]);
                    setInterviewComplete(false);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    Review Preparation Tips
                  </button>
                </div>
                
                <div className="premium-offer">
                  <h4>Want more detailed feedback?</h4>
                  <p>Upgrade to VisaCoach Premium for personalized feedback from immigration experts</p>
                  <button className="premium-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewScreen;
```

# frontend/src/components/Login.js

```js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import GoogleAuth from './GoogleAuth';
import logoSymbol from '../assets/images/logo-symbol.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { handleLoginSuccess } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // IMPORTANT: This is where we save the token
                localStorage.setItem('token', data.token);
                handleLoginSuccess(data.user, data.token);
                navigate('/interview');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
                        <span className="logo-text">VisaCoach</span>
                    </Link>
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your visa preparation</p>
                </div>
                
                <div className="social-auth">
                    <GoogleAuth 
                        onLoginSuccess={handleLoginSuccess}
                        buttonText="Sign in with Google"
                        className="btn btn-google"
                    />
                </div>
                
                <div className="auth-divider">
                    <span>or sign in with email</span>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter your email" 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password" 
                            required 
                        />
                    </div>
                    
                    <div className="form-options">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block">Sign In</button>
                    
                    {error && <p className="auth-error">{error}</p>}
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
```

# frontend/src/components/Navbar.js

```js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';

const Navbar = () => {
  const { isLoggedIn, handleLogout, user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <header className="app-navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </Link>
        </div>
        
        <nav className="navbar-navigation">
          {isLoggedIn ? (
            <>
              <Link to="/interview" className="nav-link">New Interview</Link>
              <Link to="/profile" className="nav-link">My Profile</Link>
              
              <div className="user-dropdown">
                <button className="dropdown-toggle">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/history" className="dropdown-item">Interview History</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-button">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
```

# frontend/src/components/ProfilePage.css

```css
/* ProfilePage.css - Optimized */

:root {
  --primary-color: #4F46E5;
  --primary-light: #EEF2FF;
  --primary-hover: #4338CA;
  --secondary-color: #10B981;
  --warning-color: #F59E0B;
  --danger-color: #EF4444;
  --text-dark: #1e293b;
  --text-medium: #475569;
  --text-light: #64748b;
  --text-lightest: #94a3b8;
  --bg-white: #ffffff;
  --bg-light: #f8f9fa;
  --bg-lighter: #f1f5f9;
  --border-light: #e1e4e8;
  --border-lighter: #cbd5e1;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition: all 0.2s ease;
}

/* Layout */
.profile-container {
  display: flex;
  min-height: calc(100vh - 70px);
  background-color: var(--bg-light);
}

/* Sidebar */
.profile-sidebar {
  width: 260px;
  background-color: var(--bg-white);
  border-right: 1px solid var(--border-light);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  margin-right: 0.75rem;
}

.sidebar-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  color: var(--text-light);
  font-weight: 500;
  transition: var(--transition);
  border: none;
  background-color: transparent;
  text-align: left;
  cursor: pointer;
}

.sidebar-nav-item:hover {
  background-color: var(--bg-lighter);
  color: var(--primary-color);
}

.sidebar-nav-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.sidebar-nav-item svg {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  stroke: currentColor;
}

.sidebar-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Main Content */
.profile-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Profile Info Section */
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 1.25rem;
}

.profile-title h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
}

.profile-membership {
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.upgrade-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
}

.upgrade-link:hover {
  text-decoration: underline;
}

/* Profile Stats */
.profile-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-light);
  font-size: 0.875rem;
}

/* Profile Details */
.profile-details {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

.profile-details h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-top: 0;
  margin-bottom: 1.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-light);
  font-weight: 500;
}

.detail-value {
  color: var(--text-dark);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan-limit {
  font-size: 0.875rem;
  color: var(--warning-color);
}

/* Interview History Section */
.interview-history {
  width: 100%;
}

.interview-progress {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

.chart-container {
  height: 300px;
}

.no-chart-data {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-lighter);
  border-radius: var(--radius-sm);
  color: var(--text-light);
}

.interview-table {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.interview-table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 0.75fr 1fr;
  background-color: var(--bg-lighter);
  padding: 1rem;
  font-weight: 600;
  color: var(--text-dark);
}

.interview-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 0.75fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.interview-row:last-child {
  border-bottom: none;
}

.score-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  display: inline-block;
}

.btn-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
}

.btn-link:hover {
  text-decoration: underline;
}

.no-interviews {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

/* Insights Section */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.insight-card {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.insight-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-top: 0;
  margin-bottom: 1rem;
}

.insight-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insight-list li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
}

.success-item::before {
  content: '✓';
  color: var(--secondary-color);
  font-weight: bold;
  margin-right: 0.5rem;
}

.improvement-item::before {
  content: '!';
  color: var(--warning-color);
  font-weight: bold;
  margin-right: 0.5rem;
}

/* Settings Section */
.settings-option {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin-right: 0.75rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-lighter);
  transition: var(--transition);
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition);
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(16px);
}

/* Documents Section */
.document-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.document-card {
  background-color: var(--bg-white);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 200px;
}

.document-card.empty {
  border: 2px dashed var(--border-lighter);
  background-color: var(--bg-lighter);
}

.document-icon {
  width: 48px;
  height: 48px;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.premium-document-upsell {
  background-color: var(--primary-light);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  grid-column: span 2;
}

/* Button & Link Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: var(--transition);
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-outline {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--border-lighter);
}

.btn-outline:hover {
  background-color: var(--bg-lighter);
  border-color: var(--border-light);
}

.btn-danger {
  color: var(--danger-color);
}

.btn-danger:hover {
  background-color: #FEF2F2;
  border-color: var(--danger-color);
}

.btn-block {
  width: 100%;
}

/* Loading Styles */
.loading-spinner {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-weight: 500;
}

/* Responsive styles */
@media (max-width: 992px) {
  .profile-container {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
    height: auto;
    position: static;
    padding: 1rem;
  }
  
  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .sidebar-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .profile-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .interview-table-header, 
  .interview-row {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .interview-cell:nth-child(3),
  .interview-cell:nth-child(5) {
    display: none;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin: 0 auto 1rem;
  }
}

@media (max-width: 576px) {
  .profile-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .interview-table-header, 
  .interview-row {
    grid-template-columns: 2fr 1fr;
  }
  
  .interview-cell:nth-child(4) {
    display: none;
  }
}
```

# frontend/src/components/ProfilePage.js

```js
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import logoSymbol from '../assets/images/logo-symbol.svg';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ProfilePage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, handleLogout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    completedCountries: [],
    improvementRate: 0
  });

  // Use useMemo to prevent recreation of mockInterviews on every render
  const mockInterviews = useMemo(() => [
    {
      id: 1,
      date: '2024-02-15',
      country: 'United States',
      visaType: 'B1/B2 Visitor Visa',
      score: 85,
      status: 'Completed',
      strengths: ['Clear purpose of visit', 'Strong financial documentation'],
      weaknesses: ['Insufficient ties to home country']
    },
    {
      id: 2,
      date: '2024-02-10',
      country: 'Canada',
      visaType: 'Study Permit',
      score: 78,
      status: 'Completed',
      strengths: ['Educational background relevance', 'Language proficiency'],
      weaknesses: ['Vague post-study plans', 'Financing explanation']
    },
    {
      id: 3,
      date: '2024-01-28',
      country: 'United Kingdom',
      visaType: 'Standard Visitor Visa',
      score: 92,
      status: 'Completed',
      strengths: ['Travel history', 'Return intentions', 'Financial stability'],
      weaknesses: ['Minor inconsistencies in timeline']
    }
  ], []);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (e) {
        console.error('Error fetching profile data:', e);
      } finally {
        setIsLoading(false);
      }
    };
  
    // Fetch interview history
    const fetchInterviews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/interviews/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          const interviewData = data.length > 0 ? data : mockInterviews;
          setInterviews(interviewData);
          calculateStats(interviewData);
        } else {
          setInterviews(mockInterviews);
          calculateStats(mockInterviews);
        }
      } catch (e) {
        console.error('Error fetching interview history:', e);
        setInterviews(mockInterviews);
        calculateStats(mockInterviews);
      }
    };
  
    if (token) {
      fetchUserData();
      fetchInterviews();
    }
  }, [token, mockInterviews]); // Include mockInterviews in dependencies since now it won't change

  // Calculate user statistics from interview data
  const calculateStats = (interviewData) => {
    if (!interviewData || interviewData.length === 0) {
      setStats({
        totalInterviews: 0,
        avgScore: 0,
        completedCountries: [],
        improvementRate: 0
      });
      return;
    }

    const totalInterviews = interviewData.length;
    
    // Average score calculation
    const avgScore = interviewData.reduce((sum, interview) => sum + interview.score, 0) / totalInterviews;
    
    // Unique countries
    const uniqueCountries = [...new Set(interviewData.map(interview => interview.country))];
    
    // Calculate improvement rate (comparing first and last interview scores)
    let improvementRate = 0;
    if (totalInterviews >= 2) {
      const firstInterview = interviewData[totalInterviews - 1];
      const lastInterview = interviewData[0];
      improvementRate = ((lastInterview.score - firstInterview.score) / firstInterview.score) * 100;
    }
    
    setStats({
      totalInterviews,
      avgScore: Math.round(avgScore * 10) / 10,
      completedCountries: uniqueCountries,
      improvementRate: Math.round(improvementRate)
    });
  };

  // Chart data for progress visualization
  const prepareChartData = () => {
    if (!interviews || interviews.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Interview Score',
          data: [],
          fill: false,
          backgroundColor: '#4F46E5',
          borderColor: '#4F46E5',
          tension: 0.1
        }]
      };
    }

    // Sort interviews by date (newest to oldest)
    const sortedInterviews = [...interviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      labels: sortedInterviews.map(interview => new Date(interview.date).toLocaleDateString()),
      datasets: [{
        label: 'Interview Score',
        data: sortedInterviews.map(interview => interview.score),
        fill: false,
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        tension: 0.1
      }]
    };
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const renderProfileContent = () => (
    <div className="profile-info">
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner-icon"></div>
          <span>Loading your profile data...</span>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="profile-avatar">
              {(userData?.name?.charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div className="profile-title">
              <h2>{userData?.name || user?.name || 'User'}</h2>
              <p className="profile-membership">
                <span className={`subscription-badge ${userData?.subscription || 'free'}`}>
                  {userData?.subscription || 'Free'} Plan
                </span>
                {(userData?.subscription !== 'Premium' && userData?.subscription !== 'premium') && (
                  <Link to="/upgrade" className="upgrade-link">
                    <span className="upgrade-icon">⭐</span>
                    Upgrade to Premium
                  </Link>
                )}
              </p>
            </div>
          </div>
          
          <div className="profile-stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalInterviews}</span>
              <span className="stat-label">Interviews Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.avgScore}%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.completedCountries.length}</span>
              <span className="stat-label">Countries Practiced</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%</span>
              <span className="stat-label">Improvement Rate</span>
            </div>
          </div>
          
          <div className="profile-details">
            <h3>Personal Information</h3>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData?.email || user?.email || 'Not available'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Plan</span>
              <span className="detail-value">
                {userData?.subscription || 'Free'}
                {userData?.subscription !== 'Premium' && userData?.subscription !== 'premium' && (
                  <span className="plan-limit">(1/3 interviews used)</span>
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Next Billing Date</span>
              <span className="detail-value">{userData?.nextBillingDate || 'N/A'}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => navigate('/interview')}>New Interview</button>
            <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
          </div>
        </>
      )}
    </div>
  );

  const renderInterviewsContent = () => (
    <div className="interview-history">
      <div className="interview-progress">
        <h3>Your Progress</h3>
        <div className="chart-container">
          {interviews.length > 1 ? (
            <div className="progress-chart">
              {/* Only render chart when data is ready */}
              {prepareChartData().labels.length > 0 && (
                <Line data={prepareChartData()} options={chartOptions} />
              )}
            </div>
          ) : (
            <div className="no-chart-data">
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>Complete more interviews to see your progress over time</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <h3>Interview History</h3>
      
      {interviews.length > 0 ? (
        <div className="interview-table">
          <div className="interview-table-header">
            <div className="interview-cell">Date</div>
            <div className="interview-cell">Country</div>
            <div className="interview-cell">Visa Type</div>
            <div className="interview-cell">Score</div>
            <div className="interview-cell">Actions</div>
          </div>
          
          {interviews.map(interview => (
            <div className="interview-row" key={interview.id}>
              <div className="interview-cell">{new Date(interview.date).toLocaleDateString()}</div>
              <div className="interview-cell">{interview.country}</div>
              <div className="interview-cell">{interview.visaType}</div>
              <div className="interview-cell">
                <div className="score-badge" style={{ backgroundColor: getScoreColor(interview.score) }}>
                  {interview.score}%
                </div>
              </div>
              <div className="interview-cell actions-cell">
                <button onClick={() => navigate(`/interview/review/${interview.id}`)} className="review-link">
                  Review
                </button>
                <button onClick={() => navigate('/interview')} className="retry-link">
                  Retry
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-interviews">
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>You haven't completed any interview sessions yet.</p>
            <button onClick={() => navigate('/interview')} className="btn btn-primary">
              Start Your First Interview
            </button>
          </div>
        </div>
      )}
      
      {interviews.length > 0 && (
        <div className="insights-section">
          <h3>Performance Insights</h3>
          
          <div className="insights-grid">
            <div className="insight-card">
              <h4>
                <span className="insight-icon success">✓</span>
                Strongest Areas
              </h4>
              <ul className="insight-list">
                {interviews.flatMap(interview => interview.strengths || [])
                  .reduce((acc, strength) => {
                    // Count occurrences of each strength
                    const existing = acc.find(s => s.name === strength);
                    if (existing) {
                      existing.count++;
                    } else {
                      acc.push({ name: strength, count: 1 });
                    }
                    return acc;
                  }, [])
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((strength, index) => (
                    <li key={index} className="success-item">{strength.name}</li>
                  ))
                }
              </ul>
            </div>
            
            <div className="insight-card">
              <h4>
                <span className="insight-icon warning">!</span>
                Areas for Improvement
              </h4>
              <ul className="insight-list">
                {interviews.flatMap(interview => interview.weaknesses || [])
                  .reduce((acc, weakness) => {
                    // Count occurrences of each weakness
                    const existing = acc.find(w => w.name === weakness);
                    if (existing) {
                      existing.count++;
                    } else {
                      acc.push({ name: weakness, count: 1 });
                    }
                    return acc;
                  }, [])
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((weakness, index) => (
                    <li key={index} className="improvement-item">{weakness.name}</li>
                  ))
                }
              </ul>
            </div>
            
            <div className="insight-card">
              <h4>
                <span className="insight-icon info">i</span>
                Recommended Practice
              </h4>
              <div className="recommendation">
                {interviews.length > 0 && (
                  <>
                    <p className="recommendation-text">
                      Based on your history, we recommend practicing:
                    </p>
                    <button onClick={() => {
                      navigate('/interview', { 
                        state: { 
                          country: interviews[0].country, 
                          visaType: interviews[0].visaType 
                        }
                      });
                    }} className="btn btn-secondary">
                      {interviews[0].country} - {interviews[0].visaType}
                    </button>
                    <p className="recommendation-reason">
                      Focus on strengthening your ties to home country explanation.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsContent = () => (
    <div className="profile-settings">
      <h3>Account Settings</h3>
      
      <div className="settings-section">
        <h4>Notification Preferences</h4>
        <div className="settings-option">
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
          <span>Email notifications for new features</span>
        </div>
        <div className="settings-option">
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
          <span>Interview reminders</span>
        </div>
        <div className="settings-option">
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider round"></span>
          </label>
          <span>Weekly progress reports</span>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Security</h4>
        <div className="settings-buttons">
          <button className="btn btn-outline">Change Password</button>
          <button className="btn btn-outline">Two-Factor Authentication</button>
        </div>
      </div>
      
      <div className="settings-section">
        <h4>Subscription Management</h4>
        {userData?.subscription === 'Premium' || userData?.subscription === 'premium' ? (
          <>
            <div className="current-plan">
              <div className="plan-info">
                <span className="plan-name">Premium Plan</span>
                <span className="plan-features">Unlimited interviews • Priority feedback • Expert tips</span>
              </div>
              <p><strong>Next Billing Date:</strong> {userData?.nextBillingDate || 'N/A'}</p>
            </div>
            <button className="btn btn-danger">Cancel Subscription</button>
          </>
        ) : (
          <div className="plan-upgrade-card">
            <div className="plan-badge">Recommended</div>
            <h5>Premium Plan</h5>
            <ul className="plan-features-list">
              <li>✓ Unlimited interview sessions</li>
              <li>✓ Advanced AI feedback</li>
              <li>✓ Document review & preparation</li>
              <li>✓ Priority support</li>
            </ul>
            <Link to="/upgrade" className="btn btn-primary btn-block">Upgrade to Premium</Link>
          </div>
        )}
      </div>
      
      <div className="settings-section">
        <h4>Data & Privacy</h4>
        <div className="settings-buttons">
          <button className="btn btn-outline">Download My Data</button>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );

  const renderDocumentsContent = () => (
    <div className="documents-section">
      <h3>Your Documents</h3>
      <p className="documents-intro">
        Upload and organize your visa application documents for easy reference during interviews.
      </p>
      
      <div className="document-list">
        <div className="document-card empty">
          <div className="document-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div className="document-upload">
            <p>Upload passport or ID</p>
            <button className="btn btn-outline btn-sm">Select File</button>
          </div>
        </div>
        
        {userData?.subscription === 'Premium' || userData?.subscription === 'premium' ? (
          <>
            <div className="document-card empty">
              <div className="document-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="document-upload">
                <p>Travel itinerary</p>
                <button className="btn btn-outline btn-sm">Select File</button>
              </div>
            </div>
            <div className="document-card empty">
              <div className="document-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="document-upload">
                <p>Financial statements</p>
                <button className="btn btn-outline btn-sm">Select File</button>
              </div>
            </div>
          </>
        ) : (
          <div className="premium-document-upsell">
            <div className="upsell-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.91 8.84L8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a1.93 1.93 0 0 0-.97 1.68v4.8a1.93 1.93 0 0 0 .97 1.68l3.65 1.9"></path>
                <path d="M22 17.5a2.5 2.5 0 0 1-2.5 2.5h-9a2.5 2.5 0 0 1 0-5h9a2.5 2.5 0 0 1 2.5 2.5Z"></path>
                <path d="M15 22v-9"></path>
              </svg>
            </div>
            <div className="upsell-content">
              <h4>Premium Feature</h4>
              <p>Upgrade to Premium for document storage, organization, and analysis to improve your interview preparation.</p>
              <Link to="/upgrade" className="btn btn-primary btn-sm">Upgrade Now</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'interviews':
        return renderInterviewsContent();
      case 'settings':
        return renderSettingsContent();
      case 'documents':
        return renderDocumentsContent();
      default:
        return renderProfileContent();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 80) return '#3B82F6'; // Blue
    if (score >= 70) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="sidebar-header">
          <img src={logoSymbol} alt="VisaCoach Logo" className="sidebar-logo" />
          <h3>My Account</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Interview History
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Documents
          </button>
          
          <button 
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
        </nav>
        
        <div className="sidebar-actions">
          <button onClick={() => navigate('/interview')} className="btn btn-primary btn-block">
            New Interview
          </button>
          
          {(userData?.subscription !== 'Premium' && userData?.subscription !== 'premium') && (
            <Link to="/upgrade" className="btn btn-premium btn-block">
              <span className="premium-icon">⭐</span>
              Upgrade to Premium
            </Link>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
```

# frontend/src/components/Register.js

```js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import GoogleAuth from './GoogleAuth';
import logoSymbol from '../assets/images/logo-symbol.svg';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLoginSuccess } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        handleLoginSuccess(data.user, data.token);
        navigate('/interview');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </Link>
          <h2>Create Your Account</h2>
          <p>Get started with VisaCoach to prepare for your visa interview</p>
        </div>
        
        <div className="social-auth">
          <GoogleAuth 
            onLoginSuccess={handleLoginSuccess}
            buttonText="Sign up with Google"
            className="btn btn-google"
          />
        </div>
        
        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm your password" 
              required 
            />
          </div>
          
          <div className="terms-agreement">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">Create Account</button>
          
          {error && <p className="auth-error">{error}</p>}
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

# frontend/src/components/UserInput.js

```js
import React, { useState } from 'react';

function UserInput({ onResponseSubmit }) {
  const [userResponse, setUserResponse] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onResponseSubmit(userResponse);
    setUserResponse(''); // Clear input after submit
  };

  const handleChange = (event) => {
    setUserResponse(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Type your response here..."
        value={userResponse}
        onChange={handleChange}
        rows="3"
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button type="submit">Submit Response</button>
    </form>
  );
}

export default UserInput;
```

# frontend/src/index.js

```js
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import './styles/index.css'; // Import global styles
import App from "./App";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Ensure this is set in .env

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
  );



```

# frontend/src/pages/InterviewPage.css

```css
/* InterviewPage.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --primary-lightest: #dbeafe;
  --secondary-color: #0d9488;
  --secondary-dark: #0f766e;
  --secondary-light: #5eead4;
  --accent-color: #f59e0b;
  --accent-dark: #d97706;
  --accent-light: #fcd34d;
  --text-dark: #1e293b;
  --text-medium: #475569;
  --text-light: #64748b;
  --text-lightest: #94a3b8;
  --background-light: #f8fafc;
  --background-white: #ffffff;
  --border-light: #e2e8f0;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Base Styles */
.interview-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: var(--text-dark);
  background-color: var(--background-light);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.interview-header {
  background-color: var(--background-white);
  border-bottom: 1px solid var(--border-light);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.logo:hover {
  transform: scale(1.02);
}

.logo-symbol {
  height: 2.5rem;
  width: auto;
}

.logo-text {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--text-dark);
  background-image: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-medium);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: var(--primary-lightest);
}

.plan-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--background-light);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.plan-icon {
  font-size: 1.125rem;
}

.plan-icon.free {
  color: var(--primary-light);
}

.plan-icon.premium {
  color: var(--accent-color);
}

.plan-icon.pro {
  color: #9333ea; /* Purple */
}

.interviews-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-lightest);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-dark);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.interviews-left.warning {
  background-color: #fff7ed;
  color: #c2410c;
  border-color: rgba(234, 88, 12, 0.2);
}

.interviews-left.critical {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: rgba(220, 38, 38, 0.2);
}

/* Main Content */
.interview-main {
  flex: 1;
  padding: 2rem 0 4rem;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
}

.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.animate-out {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

/* Premium Banner */
.premium-banner {
  margin-bottom: 2rem;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #fef3c7, #fef9c3);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(245, 158, 11, 0.2);
  position: relative;
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  position: relative;
  z-index: 1;
}

.banner-content:before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  z-index: -1;
  opacity: 0.5;
}

.banner-icon {
  font-size: 2rem;
  margin-right: 1.5rem;
  background-color: white;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  font-size: 1.25rem;
  color: var(--accent-dark);
  margin: 0 0 0.5rem;
}

.banner-text p {
  margin: 0;
  color: var(--text-medium);
  line-height: 1.5;
  font-size: 0.95rem;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1.5rem;
}

.btn-premium {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.btn-premium:hover {
  background-color: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-lightest);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-medium);
}

/* Selection Screen */
.selection-screen {
  animation: fadeIn 0.5s ease-out;
  scroll-margin-top: 5rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero-section {
  text-align: center;
  padding: 3rem 0 4rem;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.hero-section:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle at 70% 40%, var(--primary-lightest) 0%, transparent 70%);
  opacity: 0.5;
  z-index: -1;
}

.page-title {
  font-size: 2.75rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background-image: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  position: relative;
  display: inline-block;
}

.gradient-text:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background-image: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
  border-radius: 1.5px;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-medium);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
}

.stat-item {
  padding: 1rem 1.5rem;
  text-align: center;
  flex: 1;
  max-width: 150px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  position: relative;
  display: inline-block;
}

.stat-value:after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background-color: var(--primary-light);
  border-radius: 1px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-medium);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--border-light);
}

.btn-cta {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.btn-cta:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.selection-container {
  margin: 2rem 0 3rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

/* Interview Info Cards */
.interview-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.info-card {
  background-color: var(--background-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.info-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-image: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
}

.info-icon {
  width: 3rem;
  height: 3rem;
  background-color: var(--primary-lightest);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.info-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2.5;
}

.info-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.info-card p {
  color: var(--text-medium);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.info-features {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.info-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: var(--text-medium);
  font-size: 0.95rem;
}

.feature-icon {
  color: var(--primary-color);
  font-weight: 700;
}

.premium-feature {
  color: var(--accent-color);
}

.premium-tag {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background-color: var(--accent-light);
  color: var(--accent-dark);
  border-radius: 1rem;
  font-weight: 600;
  vertical-align: middle;
}

/* Testimonials */
.testimonials-section {
  margin-bottom: 4rem;
  padding: 3rem 0;
  background-color: var(--background-light);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.testimonials-section:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  z-index: 0;
}

.testimonials-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 3rem;
  color: var(--text-dark);
  position: relative;
  z-index: 1;
}

.testimonials-title:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-image: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
  border-radius: 1.5px;
}

.testimonials-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.testimonial-card {
  background-color: var(--background-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 2rem;
  position: relative;
  transition: transform var(--transition-fast);
}

.testimonial-card:hover {
  transform: translateY(-5px);
}

.testimonial-card:before {
  content: '"';
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-size: 4rem;
  color: var(--primary-lightest);
  font-family: Georgia, serif;
  line-height: 1;
  z-index: 0;
}

.testimonial-content {
  position: relative;
  z-index: 1;
  margin-bottom: 1.5rem;
}

.testimonial-content p {
  margin: 0;
  color: var(--text-medium);
  line-height: 1.6;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  background-color: var(--primary-lightest);
  color: var(--primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid var(--primary-light);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--text-dark);
}

.author-detail {
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Loading Screen */
.loading-screen {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background-color: var(--background-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

.loading-screen h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--text-dark);
  background-image: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.loading-icon {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.loading-icon svg {
  width: 100%;
  height: 100%;
}

.loading-details {
  width: 100%;
}

.loading-bar-container {
  width: 100%;
  height: 0.75rem;
  background-color: var(--background-light);
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-bar {
  height: 100%;
  background-image: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  border-radius: 1rem;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.loading-bar:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--background-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
}

.loading-step.complete {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}

.step-icon {
  font-size: 1.25rem;
}

.step-text {
  font-size: 0.95rem;
  color: var(--text-medium);
  font-weight: 500;
}

.loading-country-info {
  color: var(--text-medium);
  font-size: 1rem;
  margin: 0;
}

/* Footer */
.interview-footer {
  background-color: var(--background-white);
  border-top: 1px solid var(--border-light);
  padding: 3rem 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo-symbol {
  height: 2rem;
  width: auto;
}

.footer-logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-dark);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: var(--text-light);
  text-decoration: none;
  transition: color var(--transition-fast);
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.footer-social a {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-light);
  color: var(--text-light);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.footer-social a:hover {
  background-color: var(--primary-lightest);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.copyright {
  text-align: center;
  color: var(--text-lightest);
  font-size: 0.875rem;
  margin: 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

/* Floating Upgrade Button */
.floating-upgrade {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 99;
}

.upgrade-button {
  background-color: var(--accent-color);
  color: white;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.upgrade-button:hover {
  background-color: var(--accent-dark);
  transform: translateY(-2px);
}

.upgrade-icon {
  font-size: 1.25rem;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    flex-wrap: wrap;
  }
  
  .selection-container {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.25rem;
  }
  
  .page-subtitle {
    font-size: 1.125rem;
  }
  
  .header-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .plan-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .interviews-left {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .banner-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .banner-actions {
    margin-left: 0;
    margin-top: 1.5rem;
    width: 100%;
    justify-content: center;
  }
  
  .hero-section {
    padding: 2rem 0 3rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .stat-divider {
    display: none;
  }
  
  .stat-item {
    max-width: none;
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .section-number {
    margin: 0 auto;
  }
  
  .interview-info {
    grid-template-columns: 1fr;
  }
  
  .testimonials-container {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }
  
  .loading-container {
    flex-direction: column;
  }
  
  .floating-upgrade {
    bottom: 1rem;
    right: 1rem;
  }
  
  .upgrade-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .btn-cta {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
  
  .loading-screen {
    padding: 2rem 1rem;
  }
  
  .loading-screen h2 {
    font-size: 1.5rem;
  }
  
  .loading-steps {
    gap: 0.75rem;
  }
  
  .loading-step {
    padding: 0.75rem;
  }
  
  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .footer-social {
    width: 100%;
    justify-content: center;
  }
  
  .floating-upgrade {
    bottom: 1rem;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
  }
  
  .upgrade-button {
    width: 90%;
    justify-content: center;
  }
}
```

# frontend/src/pages/InterviewPage.js

```js
/* InterviewPage.js */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelect from '../components/CountrySelect';
import InterviewScreen from '../components/InterviewScreen';
import logoSymbol from '../assets/images/logo-symbol.svg';
import './InterviewPage.css';

function InterviewPage() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [userPlan, setUserPlan] = useState('free'); // 'free', 'premium', 'pro'
  const [interviewsLeft, setInterviewsLeft] = useState(3);
  const selectionRef = useRef(null);

  useEffect(() => {
    // Add animation class after component mounts
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    // If country and visa are selected, show a loading animation
    if (selectedCountry && selectedVisaType) {
      setIsLoading(true);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [selectedCountry, selectedVisaType]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);
    // Reset progress for loading animation
    setLoadingProgress(0);
  };

  const handleGoBack = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setSelectedCountry('');
      setSelectedVisaType('');
      setAnimateIn(true);
    }, 300);
  };

  const scrollToSelection = () => {
    if (selectionRef.current) {
      selectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToHome = () => {
    navigate('/');
  };
  
  const handleDismissBanner = () => {
    setShowPremiumBanner(false);
  };
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };
  
  const renderInterviewsLeftBadge = () => {
    return (
      <div className={`interviews-left ${interviewsLeft <= 1 ? 'critical' : interviewsLeft <= 2 ? 'warning' : ''}`}>
        <span className="interviews-icon">🎯</span>
        <span className="interviews-text">{interviewsLeft} {interviewsLeft === 1 ? 'interview' : 'interviews'} left today</span>
      </div>
    );
  };

  return (
    <div className="interview-page">
      <header className="interview-header">
        <div className="container header-container">
          <div className="logo" onClick={goToHome}>
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </div>
          <div className="header-actions">
            {userPlan === 'free' && renderInterviewsLeftBadge()}
            <div className="plan-badge">
              <span className={`plan-icon ${userPlan}`}>{userPlan === 'free' ? '🔹' : userPlan === 'premium' ? '⭐' : '🌟'}</span>
              <span className="plan-name">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan</span>
            </div>
            <button className="btn btn-outline" onClick={goToHome}>Dashboard</button>
          </div>
        </div>
      </header>

      <main className={`interview-main ${animateIn ? 'animate-in' : 'animate-out'}`}>
        <div className="container">
          {showPremiumBanner && userPlan === 'free' && (
            <div className="premium-banner">
              <div className="banner-content">
                <div className="banner-icon">✨</div>
                <div className="banner-text">
                  <h3>Upgrade to Premium</h3>
                  <p>Get unlimited interviews, expert feedback, and downloadable preparation guides.</p>
                </div>
                <div className="banner-actions">
                  <button className="btn btn-premium" onClick={handleUpgrade}>Upgrade Now</button>
                  <button className="btn-close" onClick={handleDismissBanner} aria-label="Close banner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-screen">
              <h2>Preparing Your Interview</h2>
              <div className="loading-container">
                <div className="loading-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <div className="loading-details">
                  <div className="loading-bar-container">
                    <div 
                      className="loading-bar" 
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <div className="loading-steps">
                    <div className={`loading-step ${loadingProgress >= 25 ? 'complete' : ''}`}>
                      <div className="step-icon">📋</div>
                      <div className="step-text">Loading visa requirements</div>
                    </div>
                    <div className={`loading-step ${loadingProgress >= 50 ? 'complete' : ''}`}>
                      <div className="step-icon">🔍</div>
                      <div className="step-text">Analyzing interview patterns</div>
                    </div>
                    <div className={`loading-step ${loadingProgress >= 75 ? 'complete' : ''}`}>
                      <div className="step-icon">🤖</div>
                      <div className="step-text">Setting up your interviewer</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="loading-country-info">Preparing {selectedVisaType} visa interview for {selectedCountry}...</p>
            </div>
          ) : !selectedCountry || !selectedVisaType ? (
            <div className="selection-screen" ref={selectionRef}>
              <div className="hero-section">
                <h1 className="page-title">Master Your <span className="gradient-text">Visa Interview</span></h1>
                <p className="page-subtitle">Practice with our AI-powered mock interviews tailored to your specific visa application</p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-value">95%</div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-value">10K+</div>
                    <div className="stat-label">Interviews Conducted</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-value">50+</div>
                    <div className="stat-label">Visa Types</div>
                  </div>
                </div>
                <button className="btn btn-cta" onClick={scrollToSelection}>Get Started Now</button>
              </div>
              
              <div className="selection-container">
                <div className="section-header">
                  <span className="section-number">1</span>
                  <h2 className="section-title">Select your destination & visa type</h2>
                </div>
                
                <CountrySelect
                  onSelectCountry={handleCountrySelect}
                  onSelectVisaType={handleVisaTypeSelect}
                  selectedCountry={selectedCountry}
                />
              </div>
              
              <div className="interview-info">
                <div className="info-card">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="8"></line>
                    </svg>
                  </div>
                  <h3>What to Expect</h3>
                  <p>Our AI will ask you realistic questions based on your selected visa type. Answer as you would in an actual interview for the most accurate feedback and guidance.</p>
                  <ul className="info-features">
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Country-specific questions</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Real interview scenarios</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Diplomatic officer simulation</span>
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3>How It Works</h3>
                  <p>You'll face 10-15 questions typical for your visa type. After each response, you'll receive instant AI feedback to help improve your answers.</p>
                  <ul className="info-features">
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Personalized feedback</span>
                    </li>
                    <li>
                      <span className="feature-icon">✓</span>
                      <span>Confidence assessment</span>
                    </li>
                    <li>
                      <span className="feature-icon premium-feature">
                        {userPlan === 'free' ? '⭐' : '✓'}
                      </span>
                      <span>
                        Response improvement suggestions
                        {userPlan === 'free' && <span className="premium-tag">Premium</span>}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="testimonials-section">
                <h3 className="testimonials-title">Success Stories</h3>
                <div className="testimonials-container">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>"After practicing with VisaCoach, I felt so much more confident in my actual interview. I got my student visa approved on the first try!"</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">MS</div>
                      <div className="author-info">
                        <div className="author-name">Maria S.</div>
                        <div className="author-detail">F1 Student Visa, USA</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>"I was nervous about my business visa interview, but the practice questions here were almost exactly what the officer asked me. Definitely worth it!"</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">RK</div>
                      <div className="author-info">
                        <div className="author-name">Rajiv K.</div>
                        <div className="author-detail">B1 Business Visa, UK</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <p>"The feedback on my answers helped me refine my responses and avoid common mistakes. Highly recommend for anyone preparing for a visa interview."</p>
                    </div>
                    <div className="testimonial-author">
                      <div className="author-avatar">JP</div>
                      <div className="author-info">
                        <div className="author-name">Julia P.</div>
                        <div className="author-detail">Working Holiday Visa, Australia</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <InterviewScreen
              selectedCountry={selectedCountry}
              selectedVisaType={selectedVisaType}
              onGoBack={handleGoBack}
              userPlan={userPlan}
            />
          )}
        </div>
      </main>

      <footer className="interview-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src={logoSymbol} alt="VisaCoach Logo" className="footer-logo-symbol" />
              <span className="footer-logo-text">VisaCoach</span>
            </div>
            <div className="footer-links">
              <a href="/about">About</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact Us</a>
            </div>
            <div className="footer-social">
              <a href="https://twitter.com/visacoach" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://facebook.com/visacoach" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/visacoach" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          <p className="copyright">© 2025 VisaCoach. All information is simulated for practice purposes only.</p>
        </div>
      </footer>

      {userPlan === 'free' && (
        <div className="floating-upgrade">
          <button className="upgrade-button" onClick={handleUpgrade}>
            <span className="upgrade-icon">⭐</span>
            <span>Upgrade to Premium</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;
```

# frontend/src/pages/LandingPage.css

```css
/* LandingPage.css */

/* General Styles */
body {
  font-family: 'Poppins', 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  /* color: #333; */
  color: #343a40;
  /* background-color: #f9f9f9; */
  background-color: #f8f9fa;
  overflow-x: hidden;
  line-height: 1.6;
}

.landing-page {
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  transition: background-color 0.3s ease;
  /* border: none; */
  border: 1px solid transparent;
  cursor: pointer;
  border-radius: 8px;
}

.btn-primary {
  background-color: #007bff; /* Example primary color */
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-outline-primary {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.btn-outline-primary:hover {
  background-color: #e7f3ff;
}

.btn-outline {
  background-color: transparent;
  color: #333;
  border: 2px solid #ccc;
}

.btn-outline:hover {
  background-color: #f0f0f0;
}

.btn-secondary {
  background-color: #6c757d; /* Example secondary color */
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.gradient-text {
  background: linear-gradient(45deg, #007bff, #6610f2); /* Example gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.with-shine {
  position: relative;
  overflow: hidden;
}

.with-shine::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  transition: left 0.5s ease;
}

.with-shine:hover::before {
  left: 100%;
}

/* Header */
.header {
  background-color: white;
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.logo-symbol {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
}

.header-actions {
  /* Styles for header actions if needed */
}

/* Hero Section */
.hero {
  background-color: #f0f8ff; /* Light background for hero */
  padding-top: 80px;
  padding-bottom: 120px;
  position: relative;
  overflow: hidden; /* To contain the wave */
}

.hero-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-content {
  flex: 1;
  padding-right: 40px;
}

.hero-title {
  font-size: 3.5rem;
  margin-bottom: 20px;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 30px;
  max-width: 500px;
}

.hero-stats {
  display: flex;
  margin-bottom: 30px;
}

.stat {
  margin-right: 30px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  display: block;
}

.stat-label {
  color: #777;
  display: block;
}

.hero-cta {
  margin-bottom: 30px;
}

.hero-cta-note {
  font-size: 0.9rem;
  color: #777;
  margin-top: 10px;
  text-align: center;
}

.country-flags {
  display: flex;
  align-items: center;
}

.country-flag {
  height: 25px;
  margin-right: 10px;
  border-radius: 3px;
}

.more-countries {
  color: #777;
  font-size: 0.9rem;
}

.hero-visual {
  flex: 1;
  position: relative;
}

.hero-illustration {
  max-width: 100%;
  height: auto;
  display: block; /* Remove extra space below image */
}

.demo-interview {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
  width: 300px;
}

.demo-interview-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.demo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #eee;
  color: #555;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
}

.demo-info {
  flex: 1;
}

.demo-officer {
  display: block;
  font-weight: bold;
}

.demo-type {
  display: block;
  font-size: 0.9rem;
  color: #777;
}

.demo-conversation {
  /* Conversation area styles */
}

.demo-exchange {
  margin-bottom: 15px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.demo-exchange.active {
  opacity: 1;
}

.demo-question {
  background-color: #e0f7fa;
  color: #00796b;
  padding: 10px 15px;
  border-radius: 25px 25px 5px 25px;
  margin-bottom: 8px;
  display: inline-block;
}

.question-prefix {
  font-weight: bold;
  margin-right: 5px;
}

.demo-answer {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 15px;
  border-radius: 25px 25px 25px 5px;
  display: inline-block;
}

.answer-prefix {
  font-weight: bold;
  margin-right: 5px;
}

.demo-feedback {
  background-color: #fff9c4;
  padding: 10px 15px;
  border-radius: 5px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #6b6112;
}

.feedback-score {
  font-weight: bold;
  margin-bottom: 5px;
}

.score {
  color: #ffc107; /* Example score color */
}

.demo-status {
  text-align: center;
  color: #777;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.typing-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #bbb;
  border-radius: 50%;
  margin: 0 2px;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 40%, 100% { opacity: 0.3; transform: translateY(0); }
  20% { opacity: 1; transform: translateY(-2px); }
}

.demo-controls {
  display: flex;
  justify-content: center;
}

.demo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ddd;
  border: none;
  margin: 0 5px;
  padding: 0;
  cursor: pointer;
  font-size: 0; /* Hide button text */
}

.demo-dot.active {
  background-color: #007bff;
}


.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0; /* Remove space below svg */
}

.hero-wave svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 120px; /* Adjust wave height */
}

.hero-wave .path {
  fill: #ffffff;
}

/* Features Section */
#features {
  padding: 100px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-tag {
  display: block;
  font-size: 1rem;
  color: #007bff;
  margin-bottom: 10px;
  font-weight: bold;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.section-subtitle {
  color: #555;
  max-width: 700px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.features-grid.in-view {
  opacity: 1;
  transform: translateY(0);
}

.feature-card {
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  text-align: center;
}

.feature-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #e7f3ff;
  color: #007bff;
}

.feature-icon svg {
  width: 30px;
  height: 30px;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.feature-description {
  color: #555;
}

.feature-showcase {
  display: flex;
  align-items: center;
  margin-top: 80px;
  gap: 40px;
}

.feature-showcase.reverse {
  flex-direction: row-reverse;
}

.feature-showcase-content {
  flex: 1;
}

.feature-showcase-content h3 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.feature-showcase-content p {
  color: #555;
  margin-bottom: 25px;
}

.feature-showcase-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.feature-showcase-list li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.feature-showcase-list li svg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  color: #007bff;
}

.feature-showcase-image {
  flex: 1;
}

.feature-showcase-image img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  display: block; /* Remove extra space below image */
}

/* Testimonials Section */
#testimonials {
  padding: 100px 0;
  background-color: #f9f9f9;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 60px;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.testimonials-grid.in-view {
  opacity: 1;
  transform: translateY(0);
}

.testimonial-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  padding: 30px;
}

.testimonial-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.testimonial-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 20px;
  object-fit: cover;
}

.testimonial-meta {
  flex: 1;
}

.testimonial-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.testimonial-journey {
  display: flex;
  align-items: center;
  color: #777;
  font-size: 0.9rem;
}

.testimonial-journey svg {
  width: 16px;
  height: 16px;
  margin: 0 5px;
  color: #777;
}

.testimonial-stars {
  display: flex;
  margin-bottom: 15px;
  color: #ffc107; /* Star color */
}

.testimonial-stars svg {
  width: 20px;
  height: 20px;
}

.testimonial-quote {
  color: #555;
  font-style: italic;
  quotes: "\201C""\201D""\2018""\2019";
}

.testimonial-quote:before {
  content: open-quote;
}

.testimonial-quote:after {
  content: close-quote;
}

.testimonials-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
  text-align: center;
}

.testimonials-stats .stat-card {
  padding: 20px;
}

.testimonials-stats .stat-number {
  font-size: 2rem;
  font-weight: bold;
  display: block;
}

.testimonials-stats .stat-label {
  color: #777;
  display: block;
}

/* Visa Types Section */
#visa-types {
  padding: 100px 0;
  background-color: white;
}

.visa-tabs {
  margin-top: 40px;
}

.tabs-header {
  display: flex;
  justify-content: center;
  border-bottom: 2px solid #eee;
  margin-bottom: 30px;
}

.tab-button {
  background-color: transparent;
  border: none;
  padding: 15px 25px;
  font-size: 1.1rem;
  cursor: pointer;
  color: #777;
  font-weight: bold;
  transition: color 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-button:hover {
  color: #555;
}

.tabs-content {
  /* Content for tabs will be handled by JS usually. Style the container */
}

.tab-content {
  display: none; /* Initially hide all tab contents. JS will show active one */
}

.tab-content.active {
  display: block;
}

.visa-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.visa-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Distribute space to push link to bottom */
}

.visa-card-header {
  margin-bottom: 20px;
}

.visa-country-flag {
  height: 30px;
  margin-bottom: 10px;
  border-radius: 3px;
}

.visa-card-header h4 {
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.visa-card p {
  color: #555;
  margin-bottom: 25px;
}

.visa-card-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  align-self: flex-end; /* Push link to the bottom of card */
}

.visa-card-link:hover {
  background-color: #0056b3;
}

.visa-types-cta {
  text-align: center;
  margin-top: 40px;
}

.visa-types-cta span {
  display: block;
  color: #777;
  margin-bottom: 20px;
}

/* Pricing Section */
.pricing {
  padding: 100px 0;
  background-color: #f0f8ff;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-top: 60px;
}

.pricing-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  overflow: hidden; /* For badge positioning */
}

.pricing-card.popular {
  transform: scale(1.05); /* Slightly bigger for popular plan */
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.pricing-card-badge {
  position: absolute;
  top: 20px;
  right: -30px;
  background-color: #ffc107;
  color: white;
  padding: 8px 40px;
  font-weight: bold;
  transform: rotate(45deg);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
}


.pricing-card-header {
  padding: 30px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.pricing-plan {
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.pricing-price {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
}

.pricing-price .price {
  /* Style for the number part of the price */
}

.pricing-price .period {
  font-size: 1rem;
  color: #777;
  margin-left: 5px;
}

.pricing-features {
  padding: 30px;
}

.pricing-features ul {
  list-style: none;
  padding: 0;
}

.pricing-features li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #555;
}

.pricing-features li svg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  color: #007bff;
}

.pricing-cta {
  padding: 30px;
  text-align: center;
}


/* Stats Section */
#stats {
  padding: 100px 0;
  background-color: #f9f9f9;
}

.stats-header {
  text-align: center;
  margin-bottom: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 60px;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.stats-grid.in-view {
  opacity: 1;
  transform: translateY(0);
}

.stats-grid .stat-card {
  text-align: center;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.stats-grid .stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  display: block;
}

.stats-grid .stat-label {
  color: #777;
  display: block;
}


/* Footer Section */
.footer {
  background-color: white;
  padding: 40px 0;
  border-top: 1px solid #eee;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.footer-logo-symbol {
  height: 30px;
  margin-right: 10px;
}

.footer-logo-text {
  font-size: 20px;
  font-weight: bold;
}

.footer-links {
  display: flex;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  margin-left: 20px;
  font-size: 0.9rem;
}

.footer-links a:hover {
  text-decoration: underline;
}

.footer-copyright {
  color: #777;
  font-size: 0.8rem;
}


/* Animations - Defined in JS, CSS just for initial state and transition */
.animate-on-scroll {
  /* Initial state and transition is handled in each section's grid/container style */
}


/* Responsive Design */
@media (max-width: 1000px) {
  .hero-container {
    flex-direction: column-reverse;
    text-align: center;
  }
  .hero-content {
    padding-right: 0;
    padding-bottom: 40px;
  }
  .hero-title {
    font-size: 3rem;
  }
  .hero-stats {
    justify-content: center;
  }
  .feature-showcase {
    flex-direction: column;
    text-align: center;
  }
  .feature-showcase.reverse {
    flex-direction: column;
  }
  .feature-showcase-image {
    order: -1; /* Put image above content in mobile view */
    margin-bottom: 30px;
  }
  .visa-tabs .tabs-header {
    flex-direction: column;
  }
  .visa-tabs .tab-button {
    border-bottom: none;
    border-right: none;
    border-left: none;
    border-top: 1px solid #eee;
    margin-bottom: 0;
    padding: 15px 20px; /* Adjust padding for mobile tabs */
    width: 100%;
    text-align: center;
  }
  .visa-tabs .tab-button:first-child {
    border-top: none; /* No top border for the first tab button */
  }
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
  .footer-links {
    flex-direction: column;
    margin-top: 20px;
  }
  .footer-links a {
    margin-left: 0;
    margin-bottom: 10px;
    display: block; /* Stack links vertically */
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.5rem;
  }
  .section-title {
    font-size: 2rem;
  }
  .pricing-grid {
    grid-template-columns: 1fr; /* Stack pricing cards on smaller screens */
  }
  .pricing-card.popular {
    transform: scale(1); /* Reset scale on mobile for popular card */
  }
  .pricing-card-badge {
    top: 10px;
    right: -20px;
    padding: 6px 30px;
  }
  .testimonials-stats {
      grid-template-columns: 1fr;
  }
}
```

# frontend/src/pages/LandingPage.js

```js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleAuth from '../components/GoogleAuth';
import { UserContext } from '../App';
import './LandingPage.css';

// Import images and illustrations
import heroIllustration from '../assets/images/hero-illustration.svg';
import logoSymbol from '../assets/images/logo-symbol.svg';
import userAvatar1 from '../assets/images/user-avatar-1.jpg';
import userAvatar2 from '../assets/images/user-avatar-2.jpg';
import userAvatar3 from '../assets/images/user-avatar-3.jpg';
import interviewSimulationImg from '../assets/images/interview-simulation.jpg';
import aiAnalysisImg from '../assets/images/ai-analysis.jpg';
import countryFlagUS from '../assets/images/flags/us.svg';
import countryFlagCA from '../assets/images/flags/ca.svg';
import countryFlagUK from '../assets/images/flags/uk.svg';
import countryFlagAU from '../assets/images/flags/au.svg';
import countryFlagDE from '../assets/images/flags/de.svg';

function LandingPage({ onSelectCountry, onSelectVisaType, selectedCountry, selectedVisaType }) {
  const navigate = useNavigate();
  const { isLoggedIn, handleLogout } = useContext(UserContext);
  const [isInView, setIsInView] = useState({
    features: false,
    testimonials: false,
    stats: false,
    "visa-types": false
  });
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [activeCountry, setActiveCountry] = useState('United States');
  const [activeVisaType, setActiveVisaType] = useState('B1/B2 Visitor Visa');

  // Demo conversation for the interactive demo
  const demoConversation = [
    {
      question: "Why do you want to visit the United States?",
      answer: "I'm attending a tech conference in San Francisco for 2 weeks and plan to visit some university campuses."
    },
    {
      question: "How will you fund your stay?",
      answer: "My company is sponsoring the trip, and I've saved $3,000 for personal expenses during my visit."
    },
    {
      question: "What ties do you have to your home country?",
      answer: "I have a permanent job at a software company, own property, and my family lives there."
    }
  ];

  const successStories = [
    {
      name: "Maria G.",
      avatar: userAvatar1,
      country: "Brazil",
      destination: "United States",
      quote: "VisaCoach helped me prepare for questions I never expected. My B1/B2 visa interview was a breeze!",
      rating: 5
    },
    {
      name: "Raj P.",
      avatar: userAvatar2,
      country: "India",
      destination: "Canada",
      quote: "After being rejected once, I used VisaCoach and got my study permit on the second try. The AI feedback was invaluable!",
      rating: 5
    },
    {
      name: "Liu W.",
      avatar: userAvatar3,
      country: "China",
      destination: "United Kingdom",
      quote: "The mock interviews felt so real that the actual interview seemed easy. Approved on my first try!",
      rating: 4
    }
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Auto rotate demo conversation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemoIndex(prev => (prev + 1) % demoConversation.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Tab switching functionality
  useEffect(() => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    const handleTabClick = (index) => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons[index].classList.add('active');
        tabContents[index].classList.add('active');
    }

    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => handleTabClick(index));
    });

    return () => {
        tabButtons.forEach((button, index) => {
            button.removeEventListener('click', () => handleTabClick(index));
          });
    }
  }, []);

  const handleCTAClick = () => {
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/register');
    }
  };

  const handleDashboardClick = () => {
    navigate('/profile');
  };

  //useCallback to memoize the handleVisaSelect function
  const handleVisaSelect = useCallback((country, visaType) => {
    setActiveCountry(country);
    setActiveVisaType(visaType);
    onSelectCountry(country);
    onSelectVisaType(visaType);
    
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/login');
    }
  },[isLoggedIn, navigate, onSelectCountry, onSelectVisaType]);

  const handleQuickStartInterview = () => {
    onSelectCountry(activeCountry);
    onSelectVisaType(activeVisaType);
    
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/login');
    }
  };

  // Fixed Google Auth success and error handlers
  const handleGoogleLoginSuccess = () => {
    handleVisaSelect(activeCountry, activeVisaType);
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google login error:", error);
    // Fallback to regular navigation
    handleVisaSelect(activeCountry, activeVisaType);
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </div>
          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-controls">
                <button onClick={handleDashboardClick} className="btn btn-outline">My Dashboard</button>
                <button onClick={handleLogout} className="btn btn-outline">Sign Out</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Sign In</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Nail Your</span> Visa Interview
            </h1>
            <p className="hero-subtitle">
              Our AI-powered coach prepares you for success with personalized mock interviews,
              real-time feedback, and expert guidance for your visa application.
            </p>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">97%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Visas Approved</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Countries</span>
              </div>
            </div>

            <div className="hero-cta">
              <button onClick={handleCTAClick} className="btn btn-primary with-shine">
                Start Practicing Now
              </button>
              <p className="hero-cta-note">Free for your first mock interview</p>
            </div>

            <div className="country-flags">
              <img src={countryFlagUS} alt="USA" className="country-flag" onClick={() => setActiveCountry('United States')} />
              <img src={countryFlagCA} alt="Canada" className="country-flag" onClick={() => setActiveCountry('Canada')} />
              <img src={countryFlagUK} alt="UK" className="country-flag" onClick={() => setActiveCountry('United Kingdom')} />
              <img src={countryFlagAU} alt="Australia" className="country-flag" onClick={() => setActiveCountry('Australia')} />
              <img src={countryFlagDE} alt="Germany" className="country-flag" onClick={() => setActiveCountry('Germany')} />
              <span className="more-countries">+45 more</span>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="demo-interview">
              <div className="demo-interview-header">
                <div className="demo-avatar">
                  <span>IO</span>
                </div>
                <div className="demo-info">
                  <span className="demo-officer">Immigration Officer</span>
                  <span className="demo-type">{activeVisaType}</span>
                </div>
              </div>

              <div className="demo-conversation">
                {demoConversation.map((exchange, index) => (
                  <div
                    key={index}
                    className={`demo-exchange ${index === activeDemoIndex ? 'active' : ''}`}
                  >
                    <div className="demo-question">
                      <span className="question-prefix">Q:</span>
                      {exchange.question}
                    </div>
                    <div className="demo-answer">
                      <span className="answer-prefix">A:</span>
                      {exchange.answer}
                    </div>
                    {index === activeDemoIndex && (
                      <div className="demo-feedback">
                        <div className="feedback-score">
                          <span className="score">8.5</span>/10
                        </div>
                        <div className="feedback-text">
                          Good answer! Add specific details about the conference name and dates.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="demo-status">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <div className="demo-controls">
                  {demoConversation.map((_, index) => (
                    <button
                      key={index}
                      className={`demo-dot ${index === activeDemoIndex ? 'active' : ''}`}
                      onClick={() => setActiveDemoIndex(index)}
                    />
                  ))}
                </div>
              </div>
              
              <button onClick={handleQuickStartInterview} className="btn btn-primary btn-quick-start">
                Try This Interview
              </button>
            </div>

            <img src={heroIllustration} alt="Visa interview preparation" className="hero-illustration" />
          </div>
        </div>

        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="features animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Prepare for Visa Success in 3 Simple Steps</h2>
            <p className="section-subtitle">
              Our AI-powered platform simulates real visa interviews, providing personalized
              feedback to maximize your chances of approval.
            </p>
          </div>

          <div className={`features-grid ${isInView.features ? 'in-view' : ''}`}>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="feature-title">1. Select Your Visa Type</h3>
              <p className="feature-description">
                Choose from 20+ visa types for 50+ countries, each with specialized question sets.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2z"></path>
                  <path d="M10 8h4"></path>
                  <path d="M10 12h4"></path>
                </svg>
              </div>
              <h3 className="feature-title">2. Practice With AI Officer</h3>
              <p className="feature-description">
                Face authentic questions from a virtual immigration officer in a realistic interview.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="feature-title">3. Get Expert Feedback</h3>
              <p className="feature-description">
                Receive immediate analysis of your answers with specific suggestions for improvement.
              </p>
            </div>
          </div>

          {/* Feature showcase */}
          <div className="feature-showcase">
            <div className="feature-showcase-content">
              <h3>Experience a Full Interview Simulation</h3>
              <p>
                Our AI conducts realistic interviews that adapt to your responses, just like a real immigration officer would.
              </p>
              <ul className="feature-showcase-list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Dynamic questioning based on your profile and answers
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Practice under time pressure like a real interview
                </li>
              </ul>
              <button onClick={handleCTAClick} className="btn btn-primary">
                Try a Free Interview
              </button>
            </div>
            <div className="feature-showcase-image">
              <img src={interviewSimulationImg} alt="Interview simulation" />
            </div>
          </div>

          <div className="feature-showcase reverse">
            <div className="feature-showcase-content">
              <h3>Get Comprehensive Answer Analysis</h3>
              <p>
                Our AI evaluates your responses on multiple dimensions and provides actionable feedback.
              </p>
              <ul className="feature-showcase-list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Content analysis: accuracy, completeness, relevance
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Red flag detection and suggestion removal
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Compare your answers with successful applicants
                </li>
              </ul>
              <button onClick={handleCTAClick} className="btn btn-primary">
                See Example Analysis
              </button>
            </div>
            <div className="feature-showcase-image">
              <img src={aiAnalysisImg} alt="AI analysis dashboard" />
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">
              Join thousands of travelers who secured their visas with confidence using VisaCoach.
            </p>
          </div>

          <div className={`testimonials-grid ${isInView.testimonials ? 'in-view' : ''}`}>
            {successStories.map((story, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img src={story.avatar} alt={story.name} className="testimonial-avatar" />
                  <div className="testimonial-meta">
                    <h4 className="testimonial-name">{story.name}</h4>
                    <div className="testimonial-journey">
                      <span>{story.country}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span>{story.destination}</span>
                    </div>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={i < story.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{story.quote}"</p>
              </div>
            ))}
          </div>

          <div className="testimonials-stats">
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Successful Applicants</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">97%</div>
              <div className="stat-label">Approval Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section id="visa-types" className="visa-types animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Visa Types</span>
            <h2 className="section-title">Prepare for Any Visa</h2>
            <p className="section-subtitle">
              VisaCoach offers specialized preparation for a wide range of visa types across multiple countries.
            </p>
          </div>

          <div className="visa-tabs">
            <div className="tabs-header">
              <button className="tab-button active">Tourist</button>
              <button className="tab-button">Student</button>
              <button className="tab-button">Work</button>
              <button className="tab-button">Family</button>
              <button className="tab-button">Business</button>
            </div>

            <div className="tabs-content">
              {/* Tourist Tab */}
              <div className="tab-content active">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'B1/B2 Visitor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>B1/B2 Visitor Visa</h4>
                    </div>
                    <p>For tourism, visiting family, or short business trips to the United States.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Standard Visitor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Standard Visitor Visa</h4>
                    </div>
                    <p>For tourism, visiting family, or attending short courses in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Temporary Resident Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Temporary Resident Visa</h4>
                    </div>
                    <p>For visits, tourism or business trips to Canada.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Visitor Visa (600)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Visitor Visa (600)</h4>
                    </div>
                    <p>For tourism, business visits, or family visits to Australia.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Student Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'F-1 Student Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>F-1 Student Visa</h4>
                    </div>
                    <p>For academic studies at US colleges, universities, and language programs.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Student Visa (Tier 4)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Student Visa (Tier 4)</h4>
                    </div>
                    <p>For studying at UK educational institutions for courses longer than 6 months.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Study Permit')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Study Permit</h4>
                    </div>
                    <p>For international students pursuing education at designated Canadian institutions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Student Visa (500)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Student Visa (500)</h4>
                    </div>
                    <p>For international students enrolled in courses at Australian educational institutions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Work Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'H-1B Work Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>H-1B Work Visa</h4>
                    </div>
                    <p>For specialized occupations requiring theoretical and practical application of knowledge.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Skilled Worker Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Skilled Worker Visa</h4>
                    </div>
                    <p>For qualified professionals with job offers from UK employers.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Work Permit')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Work Permit</h4>
                    </div>
                    <p>For temporary foreign workers with valid job offers from Canadian employers.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Temporary Skill Shortage (482)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Temporary Skill Shortage (482)</h4>
                    </div>
                    <p>For skilled workers sponsored by Australian businesses to fill critical positions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Family Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'K-1 Fiancé(e) Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>K-1 Fiancé(e) Visa</h4>
                    </div>
                    <p>For foreign-citizen fiancé(e)s of U.S. citizens to enter the United States for marriage.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Family Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Family Visa</h4>
                    </div>
                    <p>For joining family members who are settled in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Family Sponsorship')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Family Sponsorship</h4>
                    </div>
                    <p>For Canadian citizens and permanent residents to sponsor eligible family members.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Partner Visa (309/100)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Partner Visa (309/100)</h4>
                    </div>
                    <p>For partners of Australian citizens, permanent residents, or eligible New Zealand citizens.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Business Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'E-2 Treaty Investor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>E-2 Treaty Investor Visa</h4>
                    </div>
                    <p>For nationals of treaty countries investing substantial capital in a U.S. business.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Innovator Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Innovator Visa</h4>
                    </div>
                    <p>For experienced business people seeking to establish an innovative business in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Start-up Visa Program')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Start-up Visa Program</h4>
                    </div>
                    <p>For entrepreneurs with innovative business ideas seeking to immigrate to Canada.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Business Innovation (188)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Business Innovation (188)</h4>
                    </div>
                    <p>For business owners and investors seeking to own and manage a business in Australia.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/interview')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>
              </div>
            </div>
        </div>
        </section>

        <section className="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">
              Choose the plan that fits your needs and start preparing for success.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan">Free Trial</h3>
                <div className="pricing-price">
                  <span className="price">$0</span>
                </div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    1 complete mock interview
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Basic feedback
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Standard question sets
                  </li>
                </ul>
              </div>
              <div className="pricing-cta">
                <GoogleAuth
                  onLoginSuccess={handleGoogleLoginSuccess}
                  onLoginError={handleGoogleLoginError}
                  buttonText="Start Free Trial"
                  className="btn btn-outline-primary"
                />
              </div>
            </div>

            <div className="pricing-card popular">
              <div className="pricing-card-badge">Most Popular</div>
              <div className="pricing-card-header">
                <h3 className="pricing-plan">Standard</h3>
                <div className="pricing-price">
                  <span className="price">$29</span>
                  <span className="period">one-time</span>
                </div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    5 complete mock interviews
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced AI feedback
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Custom question sets
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Progress tracking
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Document checklists
                  </li>
                </ul>
              </div>
              <div className="pricing-cta">
                <GoogleAuth
                  onLoginSuccess={handleGoogleLoginSuccess}
                  onLoginError={handleGoogleLoginError}
                  buttonText="Get Started"
                  className="btn btn-primary"
                />
              </div>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan">Premium</h3>
                <div className="pricing-price">
                  <span className="price">$49</span>
                  <span className="period">one-time</span>
                </div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited mock interviews
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Premium AI feedback
                  </li>
                  <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Priority support
                  </li>
                   <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Personalized interview strategy session
                  </li>
                   <li>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Visa application review
                  </li>
                </ul>
              </div>
              <div className="pricing-cta">
                <GoogleAuth
                  onLoginSuccess={handleGoogleLoginSuccess}
                  onLoginError={handleGoogleLoginError}
                  buttonText="Go Premium"
                  className="btn btn-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="stats animate-on-scroll">
        <div className="container">
          <div className="stats-header section-header">
            <span className="section-tag">Stats</span>
            <h2 className="section-title">VisaCoach By The Numbers</h2>
            <p className="section-subtitle">
              Our impact is clear. VisaCoach is helping thousands achieve their travel dreams.
            </p>
          </div>

          <div className={`stats-grid ${isInView.stats ? 'in-view' : ''}`}>
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Visas Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">97%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Average User Rating</div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-logo">
            <img src={logoSymbol} alt="VisaCoach Logo" className="footer-logo-symbol" />
            <span className="footer-logo-text">VisaCoach</span>
          </div>
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-copyright">
            &copy; 2025 VisaCoach. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

```

# frontend/src/pages/oldLandingPage.js

```js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleAuth from '../components/GoogleAuth';
import { UserContext } from '../App';
import './LandingPage.css';

// Import images and illustrations
import heroIllustration from '../assets/images/hero-illustration.svg';
import logoSymbol from '../assets/images/logo-symbol.svg';
import userAvatar1 from '../assets/images/user-avatar-1.jpg';
import userAvatar2 from '../assets/images/user-avatar-2.jpg';
import userAvatar3 from '../assets/images/user-avatar-3.jpg';
import interviewSimulationImg from '../assets/images/interview-simulation.jpg';
import aiAnalysisImg from '../assets/images/ai-analysis.jpg';
import countryFlagUS from '../assets/images/flags/us.svg';
import countryFlagCA from '../assets/images/flags/ca.svg';
import countryFlagUK from '../assets/images/flags/uk.svg';
import countryFlagAU from '../assets/images/flags/au.svg';
import countryFlagDE from '../assets/images/flags/de.svg';

function LandingPage({ onSelectCountry, onSelectVisaType, selectedCountry, selectedVisaType }) {
  const navigate = useNavigate();
  const { isLoggedIn, handleLogout } = useContext(UserContext);
  const [isInView, setIsInView] = useState({
    features: false,
    testimonials: false,
    stats: false,
    "visa-types": false
  });
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [activeCountry, setActiveCountry] = useState('United States');
  const [activeVisaType, setActiveVisaType] = useState('B1/B2 Visitor Visa');

  // Demo conversation for the interactive demo
  const demoConversation = [
    {
      question: "Why do you want to visit the United States?",
      answer: "I'm attending a tech conference in San Francisco for 2 weeks and plan to visit some university campuses."
    },
    {
      question: "How will you fund your stay?",
      answer: "My company is sponsoring the trip, and I've saved $3,000 for personal expenses during my visit."
    },
    {
      question: "What ties do you have to your home country?",
      answer: "I have a permanent job at a software company, own property, and my family lives there."
    }
  ];

  const successStories = [
    {
      name: "Maria G.",
      avatar: userAvatar1,
      country: "Brazil",
      destination: "United States",
      quote: "VisaCoach helped me prepare for questions I never expected. My B1/B2 visa interview was a breeze!",
      rating: 5
    },
    {
      name: "Raj P.",
      avatar: userAvatar2,
      country: "India",
      destination: "Canada",
      quote: "After being rejected once, I used VisaCoach and got my study permit on the second try. The AI feedback was invaluable!",
      rating: 5
    },
    {
      name: "Liu W.",
      avatar: userAvatar3,
      country: "China",
      destination: "United Kingdom",
      quote: "The mock interviews felt so real that the actual interview seemed easy. Approved on my first try!",
      rating: 4
    }
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Auto rotate demo conversation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemoIndex(prev => (prev + 1) % demoConversation.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Tab switching functionality
  useEffect(() => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    const handleTabClick = (index) => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons[index].classList.add('active');
        tabContents[index].classList.add('active');
    }

    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => handleTabClick(index));
    });

    return () => {
        tabButtons.forEach((button, index) => {
            button.removeEventListener('click', () => handleTabClick(index));
          });
    }
  }, []);

  const handleCTAClick = () => {
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/register');
    }
  };

  const handleDashboardClick = () => {
    navigate('/profile');
  };

  //useCallback to memoize the handleVisaSelect function
  const handleVisaSelect = useCallback((country, visaType) => {
    setActiveCountry(country);
    setActiveVisaType(visaType);
    onSelectCountry(country);
    onSelectVisaType(visaType);
    
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/login');
    }
  }, [isLoggedIn, navigate, onSelectCountry, onSelectVisaType]);

  const handleQuickStartInterview = () => {
    onSelectCountry(activeCountry);
    onSelectVisaType(activeVisaType);
    
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/login');
    }
  };

  // Fixed Google Auth success and error handlers
  const handleGoogleLoginSuccess = () => {
    handleVisaSelect(activeCountry, activeVisaType);
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google login error:", error);
    // Fallback to regular navigation
    handleVisaSelect(activeCountry, activeVisaType);
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
            <span className="logo-text">VisaCoach</span>
          </div>
          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-controls">
                <button onClick={handleDashboardClick} className="btn btn-outline">My Dashboard</button>
                <button onClick={handleLogout} className="btn btn-outline">Sign Out</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Sign In</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Nail Your</span> Visa Interview
            </h1>
            <p className="hero-subtitle">
              Our AI-powered coach prepares you for success with personalized mock interviews,
              real-time feedback, and expert guidance for your visa application.
            </p>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">97%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Visas Approved</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Countries</span>
              </div>
            </div>

            <div className="hero-cta">
              <button onClick={handleCTAClick} className="btn btn-primary with-shine">
                Start Practicing Now
              </button>
              <p className="hero-cta-note">Free for your first mock interview</p>
            </div>

            <div className="country-flags">
              <img src={countryFlagUS} alt="USA" className="country-flag" onClick={() => setActiveCountry('United States')} />
              <img src={countryFlagCA} alt="Canada" className="country-flag" onClick={() => setActiveCountry('Canada')} />
              <img src={countryFlagUK} alt="UK" className="country-flag" onClick={() => setActiveCountry('United Kingdom')} />
              <img src={countryFlagAU} alt="Australia" className="country-flag" onClick={() => setActiveCountry('Australia')} />
              <img src={countryFlagDE} alt="Germany" className="country-flag" onClick={() => setActiveCountry('Germany')} />
              <span className="more-countries">+45 more</span>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="demo-interview">
              <div className="demo-interview-header">
                <div className="demo-avatar">
                  <span>IO</span>
                </div>
                <div className="demo-info">
                  <span className="demo-officer">Immigration Officer</span>
                  <span className="demo-type">{activeVisaType}</span>
                </div>
              </div>

              <div className="demo-conversation">
                {demoConversation.map((exchange, index) => (
                  <div
                    key={index}
                    className={`demo-exchange ${index === activeDemoIndex ? 'active' : ''}`}
                  >
                    <div className="demo-question">
                      <span className="question-prefix">Q:</span>
                      {exchange.question}
                    </div>
                    <div className="demo-answer">
                      <span className="answer-prefix">A:</span>
                      {exchange.answer}
                    </div>
                    {index === activeDemoIndex && (
                      <div className="demo-feedback">
                        <div className="feedback-score">
                          <span className="score">8.5</span>/10
                        </div>
                        <div className="feedback-text">
                          Good answer! Add specific details about the conference name and dates.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="demo-status">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <div className="demo-controls">
                  {demoConversation.map((_, index) => (
                    <button
                      key={index}
                      className={`demo-dot ${index === activeDemoIndex ? 'active' : ''}`}
                      onClick={() => setActiveDemoIndex(index)}
                    />
                  ))}
                </div>
              </div>
              
              <button onClick={handleQuickStartInterview} className="btn btn-primary btn-quick-start">
                Try This Interview
              </button>
            </div>

            <img src={heroIllustration} alt="Visa interview preparation" className="hero-illustration" />
          </div>
        </div>

        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="features animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Prepare for Visa Success in 3 Simple Steps</h2>
            <p className="section-subtitle">
              Our AI-powered platform simulates real visa interviews, providing personalized
              feedback to maximize your chances of approval.
            </p>
          </div>

          <div className={`features-grid ${isInView.features ? 'in-view' : ''}`}>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="feature-title">1. Select Your Visa Type</h3>
              <p className="feature-description">
                Choose from 20+ visa types for 50+ countries, each with specialized question sets.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2z"></path>
                  <path d="M10 8h4"></path>
                  <path d="M10 12h4"></path>
                </svg>
              </div>
              <h3 className="feature-title">2. Practice With AI Officer</h3>
              <p className="feature-description">
                Face authentic questions from a virtual immigration officer in a realistic interview.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="feature-title">3. Get Expert Feedback</h3>
              <p className="feature-description">
                Receive immediate analysis of your answers with specific suggestions for improvement.
              </p>
            </div>
          </div>

          {/* Feature showcase */}
          <div className="feature-showcase">
            <div className="feature-showcase-content">
              <h3>Experience a Full Interview Simulation</h3>
              <p>
                Our AI conducts realistic interviews that adapt to your responses, just like a real immigration officer would.
              </p>
              <ul className="feature-showcase-list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Dynamic questioning based on your profile and answers
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Practice under time pressure like a real interview
                </li>
              </ul>
              <button onClick={handleCTAClick} className="btn btn-primary">
                Try a Free Interview
              </button>
            </div>
            <div className="feature-showcase-image">
              <img src={interviewSimulationImg} alt="Interview simulation" />
            </div>
          </div>

          <div className="feature-showcase reverse">
            <div className="feature-showcase-content">
              <h3>Get Comprehensive Answer Analysis</h3>
              <p>
                Our AI evaluates your responses on multiple dimensions and provides actionable feedback.
              </p>
              <ul className="feature-showcase-list">
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Content analysis: accuracy, completeness, relevance
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Red flag detection and suggestion removal
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Compare your answers with successful applicants
                </li>
              </ul>
              <button onClick={handleCTAClick} className="btn btn-primary">
                See Example Analysis
              </button>
            </div>
            <div className="feature-showcase-image">
              <img src={aiAnalysisImg} alt="AI analysis dashboard" />
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">
              Join thousands of travelers who secured their visas with confidence using VisaCoach.
            </p>
          </div>

          <div className={`testimonials-grid ${isInView.testimonials ? 'in-view' : ''}`}>
            {successStories.map((story, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img src={story.avatar} alt={story.name} className="testimonial-avatar" />
                  <div className="testimonial-meta">
                    <h4 className="testimonial-name">{story.name}</h4>
                    <div className="testimonial-journey">
                      <span>{story.country}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span>{story.destination}</span>
                    </div>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={i < story.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{story.quote}"</p>
              </div>
            ))}
          </div>

          <div className="testimonials-stats">
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Successful Applicants</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">97%</div>
              <div className="stat-label">Approval Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Covered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section id="visa-types" className="visa-types animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Visa Types</span>
            <h2 className="section-title">Prepare for Any Visa</h2>
            <p className="section-subtitle">
              VisaCoach offers specialized preparation for a wide range of visa types across multiple countries.
            </p>
          </div>

          <div className="visa-tabs">
            <div className="tabs-header">
              <button className="tab-button active">Tourist</button>
              <button className="tab-button">Student</button>
              <button className="tab-button">Work</button>
              <button className="tab-button">Family</button>
              <button className="tab-button">Business</button>
            </div>

            <div className="tabs-content">
              {/* Tourist Tab */}
              <div className="tab-content active">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'B1/B2 Visitor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>B1/B2 Visitor Visa</h4>
                    </div>
                    <p>For tourism, visiting family, or short business trips to the United States.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Standard Visitor Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Standard Visitor Visa</h4>
                    </div>
                    <p>For tourism, visiting family, or attending short courses in the UK.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Temporary Resident Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Temporary Resident Visa</h4>
                    </div>
                    <p>For visits, tourism or business trips to Canada.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Visitor Visa (600)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Visitor Visa (600)</h4>
                    </div>
                    <p>For tourism, business visits, or family visits to Australia.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/selection')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Student Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'F-1 Student Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>F-1 Student Visa</h4>
                    </div>
                    <p>For academic studies at US colleges, universities, and language programs.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Student Visa (Tier 4)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Student Visa (Tier 4)</h4>
                    </div>
                    <p>For studying at UK educational institutions for courses longer than 6 months.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Study Permit')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Study Permit</h4>
                    </div>
                    <p>For international students pursuing education at designated Canadian institutions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Student Visa (500)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Student Visa (500)</h4>
                    </div>
                    <p>For international students enrolled in courses at Australian educational institutions.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>
                </div>

                <div className="visa-types-cta">
                  <span>We cover 50+ countries and 100+ visa types</span>
                  <button onClick={() => navigate('/selection')} className="btn btn-secondary">
                    Find Your Visa Type
                  </button>
                </div>
              </div>

              {/* Work Tab */}
              <div className="tab-content">
                <div className="visa-grid">
                  <div className="visa-card" onClick={() => handleVisaSelect('United States', 'H-1B Work Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
                      <h4>H-1B Work Visa</h4>
                    </div>
                    <p>For specialized occupations requiring theoretical and practical application of knowledge.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('United Kingdom', 'Skilled Worker Visa')}>
                    <div className="visa-card-header">
                      <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
                      <h4>Skilled Worker Visa</h4>
                    </div>
                    <p>For qualified professionals with job offers from UK employers.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Canada', 'Work Permit')}>
                    <div className="visa-card-header">
                      <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
                      <h4>Work Permit</h4>
                    </div>
                    <p>For temporary foreign workers with valid job offers from Canadian employers.</p>
                    <button className="visa-card-link">Prepare Now</button>
                  </div>

                  <div className="visa-card" onClick={() => handleVisaSelect('Australia', 'Temporary Skill Shortage (482)')}>
                    <div className="visa-card-header">
                      <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
                      <h4>Temporary Skill Shortage (482)</h4>
                    </div>
                    <p>For skilled workers sponsored by Australian businesses to fill critical positions.</p>
                    <button className="visa-card-link">Prepare Now</button>


                    

{/* // import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import GoogleAuth from '../components/GoogleAuth';
// import CountrySelect from '../components/CountrySelect';
// import { UserContext } from '../App'; // Import the UserContext
// import './LandingPage.css';

// // Import images and illustrations
// import heroIllustration from '../assets/images/hero-illustration.svg';
// import logoSymbol from '../assets/images/logo-symbol.svg';
// import userAvatar1 from '../assets/images/user-avatar-1.jpg';
// import userAvatar2 from '../assets/images/user-avatar-2.jpg';
// import userAvatar3 from '../assets/images/user-avatar-3.jpg';
// import interviewSimulationImg from '../assets/images/interview-simulation.jpg';
// import aiAnalysisImg from '../assets/images/ai-analysis.jpg';
// import countryFlagUS from '../assets/images/flags/us.svg';
// import countryFlagCA from '../assets/images/flags/ca.svg';
// import countryFlagUK from '../assets/images/flags/uk.svg';
// import countryFlagAU from '../assets/images/flags/au.svg';
// import countryFlagDE from '../assets/images/flags/de.svg';

// function LandingPage({ onSelectCountry, onSelectVisaType, selectedCountry, selectedVisaType }) { 
//   const navigate = useNavigate();
//   const { isLoggedIn, handleLoginSuccess, handleLogout } = useContext(UserContext);
//   const [isInView, setIsInView] = useState({
//     features: false,
//     testimonials: false,
//     stats: false,
//     "visa-types": false
//   });
//   const [activeDemoIndex, setActiveDemoIndex] = useState(0);

//   // Demo conversation for the interactive demo
//   const demoConversation = [
//     {
//       question: "Why do you want to visit the United States?",
//       answer: "I'm attending a tech conference in San Francisco for 2 weeks and plan to visit some university campuses."
//     },
//     {
//       question: "How will you fund your stay?",
//       answer: "My company is sponsoring the trip, and I've saved $3,000 for personal expenses during my visit."
//     },
//     {
//       question: "What ties do you have to your home country?",
//       answer: "I have a permanent job at a software company, own property, and my family lives there."
//     }
//   ];

//   const successStories = [
//     {
//       name: "Maria G.",
//       avatar: userAvatar1,
//       country: "Brazil",
//       destination: "United States",
//       quote: "VisaCoach helped me prepare for questions I never expected. My B1/B2 visa interview was a breeze!",
//       rating: 5
//     },
//     {
//       name: "Raj P.",
//       avatar: userAvatar2,
//       country: "India",
//       destination: "Canada",
//       quote: "After being rejected once, I used VisaCoach and got my study permit on the second try. The AI feedback was invaluable!",
//       rating: 5
//     },
//     {
//       name: "Liu W.",
//       avatar: userAvatar3,
//       country: "China",
//       destination: "United Kingdom",
//       quote: "The mock interviews felt so real that the actual interview seemed easy. Approved on my first try!",
//       rating: 4
//     }
//   ];

//   // Intersection Observer for animations
//   useEffect(() => {
//     const observerOptions = {
//       threshold: 0.2,
//     };

//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           setIsInView(prev => ({
//             ...prev,
//             [entry.target.id]: true
//           }));
//         }
//       });
//     }, observerOptions);

//     const sections = document.querySelectorAll('.animate-on-scroll');
//     sections.forEach(section => {
//       observer.observe(section);
//     });

//     return () => {
//       sections.forEach(section => {
//         observer.unobserve(section);
//       });
//     };
//   }, []); 

//   // Auto rotate demo conversation
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveDemoIndex(prev => (prev + 1) % demoConversation.length);
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   // Tab switching functionality
//   useEffect(() => {
//     const tabButtons = document.querySelectorAll('.tab-button');
//     const tabContents = document.querySelectorAll('.tab-content');

//     tabButtons.forEach((button, index) => {
//       button.addEventListener('click', () => {
//         // Remove active class from all buttons and contents
//         tabButtons.forEach(btn => btn.classList.remove('active'));
//         tabContents.forEach(content => content.classList.remove('active'));

//         // Add active class to clicked button and corresponding content
//         button.classList.add('active');
//         tabContents[index].classList.add('active');
//       });
//     });
//   }, []);

//   // Get visa type details based on selection
//   const getVisaTypeDetails = (country, visaType) => {
//     // This would be replaced with actual logic to fetch visa type details
//     return {
//       name: `${visaType} Visa`,
//       country: country
//     };
//   };

//   const handleStartInterview = (country, visaType) => {
//     if (isLoggedIn) {
//       onSelectCountry(country);
//       onSelectVisaType(visaType);
//       navigate('/interview');
//     } else {
//       navigate('/login');
//     }
//   };

//   // Handler for selecting a specific visa
//   const handleVisaSelect = (country, visaType) => {
//     onSelectCountry(country);
//     onSelectVisaType(visaType);
//     if (isLoggedIn) {
//       navigate('/interview');
//     } else {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="landing-page">
//       <header className="header">
//         <div className="container header-container">
//           <div className="logo">
//             <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
//             <span className="logo-text">VisaCoach</span>
//           </div>
//           <div className="header-actions">
//             {isLoggedIn ? (
//               <div className="user-controls">
//                 <Link to="/profile" className="btn btn-outline">My Profile</Link>
//                 <button onClick={handleLogout} className="btn btn-outline">Sign Out</button>
//               </div>
//             ) : (
//               <div className="auth-buttons">
//                 <Link to="/login" className="btn btn-outline">Sign In</Link>
//                 <Link to="/register" className="btn btn-primary">Register</Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>

//       <section className="hero">
//         <div className="container hero-container">
//           <div className="hero-content">
//             <h1 className="hero-title">
//               <span className="gradient-text">Nail Your</span> Visa Interview
//             </h1>
//             <p className="hero-subtitle">
//               Our AI-powered coach prepares you for success with personalized mock interviews,
//               real-time feedback, and expert guidance.
//             </p>

//             <div className="hero-stats">
//               <div className="stat">
//                 <span className="stat-number">97%</span>
//                 <span className="stat-label">Success Rate</span>
//               </div>
//               <div className="stat">
//                 <span className="stat-number">10K+</span>
//                 <span className="stat-label">Visas Approved</span>
//               </div>
//               <div className="stat">
//                 <span className="stat-number">50+</span>
//                 <span className="stat-label">Countries</span>
//               </div>
//             </div>

//             <div className="hero-cta">
//               {isLoggedIn ? (
//                 <button 
//                   onClick={() => navigate('/interview')} 
//                   className="btn btn-primary with-shine"
//                 >
//                   Start Practicing Now
//                 </button>
//               ) : (
//                 <Link to="/register" className="btn btn-primary with-shine">
//                   Start Practicing Now
//                 </Link>
//               )}
//               <p className="hero-cta-note">Free for your first mock interview</p>
//             </div>

//             <div className="country-flags">
//               <img src={countryFlagUS} alt="USA" className="country-flag" />
//               <img src={countryFlagCA} alt="Canada" className="country-flag" />
//               <img src={countryFlagUK} alt="UK" className="country-flag" />
//               <img src={countryFlagAU} alt="Australia" className="country-flag" />
//               <img src={countryFlagDE} alt="Germany" className="country-flag" />
//               <span className="more-countries">+45 more</span>
//             </div>
//           </div>
          
//           {/* Rest of JSX remains largely the same */}
//           <div className="hero-visual">
//             <div className="demo-interview">
//               {/* Demo interview content */}
//               <div className="demo-interview-header">
//                 <div className="demo-avatar">
//                   <span>IO</span>
//                 </div>
//                 <div className="demo-info">
//                   <span className="demo-officer">Immigration Officer</span>
//                   <span className="demo-type">B1/B2 Visitor Visa</span>
//                 </div>
//               </div>

//               <div className="demo-conversation">
//                 {demoConversation.map((exchange, index) => (
//                   <div
//                     key={index}
//                     className={`demo-exchange ${index === activeDemoIndex ? 'active' : ''}`}
//                   >
//                     <div className="demo-question">
//                       <span className="question-prefix">Q:</span>
//                       {exchange.question}
//                     </div>
//                     <div className="demo-answer">
//                       <span className="answer-prefix">A:</span>
//                       {exchange.answer}
//                     </div>
//                     {index === activeDemoIndex && (
//                       <div className="demo-feedback">
//                         <div className="feedback-score">
//                           <span className="score">8.5</span>/10
//                         </div>
//                         <div className="feedback-text">
//                           Good answer! Add specific details about the conference name and dates.
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="demo-status">
//                 <div className="typing-indicator">
//                   <span></span><span></span><span></span>
//                 </div>
//                 <div className="demo-controls">
//                   {demoConversation.map((_, index) => (
//                     <button
//                       key={index}
//                       className={`demo-dot ${index === activeDemoIndex ? 'active' : ''}`}
//                       onClick={() => setActiveDemoIndex(index)}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <img src={heroIllustration} alt="Visa interview preparation" className="hero-illustration" />
//           </div>
//         </div>

//         <div className="hero-wave">
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
//             <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
//           </svg>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="features animate-on-scroll">
//         {/* Features content */}
//         <div className="container">
//           <div className="section-header">
//             <span className="section-tag">Features</span>
//             <h2 className="section-title">How VisaCoach Works</h2>
//             <p className="section-subtitle">
//               Our AI-powered platform simulates real visa interviews, providing personalized
//               feedback to maximize your chances of approval.
//             </p>
//           </div>

//           <div className={`features-grid ${isInView.features ? 'in-view' : ''}`}>
//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                   <line x1="16" y1="2" x2="16" y2="6"></line>
//                   <line x1="8" y1="2" x2="8" y2="6"></line>
//                   <line x1="3" y1="10" x2="21" y2="10"></line>
//                 </svg>
//               </div>
//               <h3 className="feature-title">Choose Your Visa Type</h3>
//               <p className="feature-description">
//                 Select from 20+ visa types for 50+ countries, each with specialized question sets.
//               </p>
//             </div>

//             {/* Other feature cards */}
//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M21 2H3v16h5v4l4-4h5l4-4V2z"></path>
//                   <path d="M10 8h4"></path>
//                   <path d="M10 12h4"></path>
//                 </svg>
//               </div>
//               <h3 className="feature-title">Realistic Interview Simulation</h3>
//               <p className="feature-description">
//                 Face authentic questions from a virtual immigration officer in a realistic scenario.
//               </p>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
//                 </svg>
//               </div>
//               <h3 className="feature-title">AI-Powered Feedback</h3>
//               <p className="feature-description">
//                 Get immediate analysis of your answers with specific suggestions for improvement.
//               </p>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
//                   <line x1="4" y1="22" x2="4" y2="15"></line>
//                 </svg>
//               </div>
//               <h3 className="feature-title">Progress Tracking</h3>
//               <p className="feature-description">
//                 Monitor your improvement over time with detailed performance analytics.
//               </p>
//             </div>
//           </div>

//           {/* Feature showcase */}
//           <div className="feature-showcase">
//             <div className="feature-showcase-content">
//               <h3>Experience a Full Interview Simulation</h3>
//               <p>
//                 Our AI conducts realistic interviews that adapt to your responses, just like a real immigration officer would.
//               </p>
//               <ul className="feature-showcase-list">
//                 <li>
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="20 6 9 17 4 12"></polyline>
//                   </svg>
//                   Dynamic questioning based on your profile and answers
//                 </li>
//                 <li>
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="20 6 9 17 4 12"></polyline>
//                   </svg>
//                   Covers standard and unexpected challenging questions
//                 </li>
//                 <li>
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="20 6 9 17 4 12"></polyline>
//                   </svg>
//                   Practice under time pressure like a real interview
//                 </li>
//               </ul>
//               {isLoggedIn ? (
//                 <button 
//                   onClick={() => navigate('/interview')} 
//                   className="btn btn-primary"
//                 >
//                   Try a Free Interview
//                 </button>
//               ) : (
//                 <Link to="/register" className="btn btn-primary">
//                   Try a Free Interview
//                 </Link>
//               )}
//             </div>
//             <div className="feature-showcase-image">
//               <img src={interviewSimulationImg} alt="Interview simulation" />
//             </div>
//           </div>

//           <div className="feature-showcase reverse">
//             <div className="feature-showcase-content">
//               <h3>Get Comprehensive Answer Analysis</h3>
//               <p>
//                 Our AI evaluates your responses on multiple dimensions and provides actionable feedback.
//               </p>
//               <ul className="feature-showcase-list">
//                 <li>
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="20 6 9 17 4 12"></polyline>
//                   </svg>
//                   Content analysis: accuracy, completeness, relevance
//                 </li>
//                 <li>
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="20 6 9 17 4 12"></polyline>
//                   </svg>
//                   Red flag detection and suggestion removal
//                 </li>
//                 <li>
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polyline points="20 6 9 17 4 12"></polyline>
//                   </svg>
//                   Compare your answers with successful applicants
//                 </li>
//               </ul>
//               <GoogleAuth
//                 onLoginSuccess={handleStartInterview}
//                 onLoginError={handleStartInterview}
//                 buttonText="See Example Analysis"
//                 className="btn btn-primary"
//               />
//             </div>
//             <div className="feature-showcase-image">
//               <img src={aiAnalysisImg} alt="AI analysis dashboard" />
//             </div>
//           </div>
//         </div>
//       </section>

//       <section id="testimonials" className="testimonials animate-on-scroll">
//         <div className="container">
//           <div className="section-header">
//             <span className="section-tag">Testimonials</span>
//             <h2 className="section-title">Success Stories</h2>
//             <p className="section-subtitle">
//               Join thousands of travelers who secured their visas with confidence using VisaCoach.
//             </p>
//           </div>

//           <div className={`testimonials-grid ${isInView.testimonials ? 'in-view' : ''}`}>
//             {successStories.map((story, index) => (
//               <div key={index} className="testimonial-card">
//                 <div className="testimonial-header">
//                   <img src={story.avatar} alt={story.name} className="testimonial-avatar" />
//                   <div className="testimonial-meta">
//                     <h4 className="testimonial-name">{story.name}</h4>
//                     <div className="testimonial-journey">
//                       <span>{story.country}</span>
//                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                         <path d="M5 12h14M12 5l7 7-7 7" />
//                       </svg>
//                       <span>{story.destination}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="testimonial-stars">
//                   {[...Array(5)].map((_, i) => (
//                     <svg
//                       key={i}
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 24 24"
//                       fill={i < story.rating ? "currentColor" : "none"}
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     >
//                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//                     </svg>
//                   ))}
//                 </div>
//                 <p className="testimonial-quote">"{story.quote}"</p>
//               </div>
//             ))}
//           </div>

//           <div className="testimonials-stats">
//             <div className="stat-card">
//               <div className="stat-number">10,000+</div>
//               <div className="stat-label">Successful Applicants</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-number">97%</div>
//               <div className="stat-label">Approval Rate</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-number">50+</div>
//               <div className="stat-label">Countries Covered</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-number">4.8/5</div>
//               <div className="stat-label">Average Rating</div>
//             </div>
//           </div>
//         </div>
//       </section>

//     <section id="visa-types" className="visa-types animate-on-scroll">
//   <div className="container">
//     <div className="section-header">
//       <span className="section-tag">Visa Types</span>
//       <h2 className="section-title">Prepare for Any Visa</h2>
//       <p className="section-subtitle">
//         VisaCoach offers specialized preparation for a wide range of visa types across multiple countries.
//       </p>
//     </div>

//     <div className="visa-tabs">
//       <div className="tabs-header">
//         <button className="tab-button active">Tourist</button>
//         <button className="tab-button">Student</button>
//         <button className="tab-button">Work</button>
//         <button className="tab-button">Family</button>
//         <button className="tab-button">Business</button>
//       </div>

//       <div className="tabs-content">
//         {/* Tourist Tab */}
//         <div className="tab-content active">
//           <div className="visa-grid">
//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
//                 <h4>B1/B2 Visitor Visa</h4>
//               </div>
//               <p>For tourism, visiting family, or short business trips to the United States.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
//                 <h4>Standard Visitor Visa</h4>
//               </div>
//               <p>For tourism, visiting family, or attending short courses in the UK.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
//                 <h4>Temporary Resident Visa</h4>
//               </div>
//               <p>For visits, tourism or business trips to Canada.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
//                 <h4>Visitor Visa (600)</h4>
//               </div>
//               <p>For tourism, business visits, or family visits to Australia.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>
//           </div>

//           <div className="visa-types-cta">
//             <span>We cover 50+ countries and 100+ visa types</span>
//             <GoogleAuth
//               onLoginSuccess={handleStartInterview}
//               onLoginError={handleStartInterview}
//               buttonText="Find Your Visa Type"
//               className="btn btn-secondary"
//             />
//           </div>
//         </div>

//         {/* Student Tab */}
//         <div className="tab-content">
//           <div className="visa-grid">
//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
//                 <h4>F-1 Student Visa</h4>
//               </div>
//               <p>For academic studies at US colleges, universities, and language programs.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
//                 <h4>Student Visa (Tier 4)</h4>
//               </div>
//               <p>For studying at UK educational institutions for courses longer than 6 months.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
//                 <h4>Study Permit</h4>
//               </div>
//               <p>For international students pursuing education at designated Canadian institutions.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
//                 <h4>Student Visa (500)</h4>
//               </div>
//               <p>For international students enrolled in courses at Australian educational institutions.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>
//           </div>

//           <div className="visa-types-cta">
//             <span>We cover 50+ countries and 100+ visa types</span>
//             <GoogleAuth
//               onLoginSuccess={handleStartInterview}
//               onLoginError={handleStartInterview}
//               buttonText="Find Your Visa Type"
//               className="btn btn-secondary"
//             />
//           </div>
//         </div>

//         {/* Work Tab */}
//         <div className="tab-content">
//           <div className="visa-grid">
//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
//                 <h4>H-1B Work Visa</h4>
//               </div>
//               <p>For specialized occupations requiring theoretical and practical application of knowledge.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
//                 <h4>Skilled Worker Visa</h4>
//               </div>
//               <p>For qualified professionals with job offers from UK employers.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
//                 <h4>Work Permit</h4>
//               </div>
//               <p>For temporary foreign workers with valid job offers from Canadian employers.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
//                 <h4>Temporary Skill Shortage (482)</h4>
//               </div>
//               <p>For skilled workers sponsored by Australian businesses to fill critical positions.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>
//           </div>

//           <div className="visa-types-cta">
//             <span>We cover 50+ countries and 100+ visa types</span>
//             <GoogleAuth
//               onLoginSuccess={handleStartInterview}
//               onLoginError={handleStartInterview}
//               buttonText="Find Your Visa Type"
//               className="btn btn-secondary"
//             />
//           </div>
//         </div>

//         {/* Family Tab */}
//         <div className="tab-content">
//           <div className="visa-grid">
//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
//                 <h4>K-1 Fiancé(e) Visa</h4>
//               </div>
//               <p>For foreign-citizen fiancé(e)s of U.S. citizens to enter the United States for marriage.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
//                 <h4>Family Visa</h4>
//               </div>
//               <p>For joining family members who are settled in the UK.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
//                 <h4>Family Sponsorship</h4>
//               </div>
//               <p>For Canadian citizens and permanent residents to sponsor eligible family members.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
//                 <h4>Partner Visa (309/100)</h4>
//               </div>
//               <p>For partners of Australian citizens, permanent residents, or eligible New Zealand citizens.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>
//           </div>

//           <div className="visa-types-cta">
//             <span>We cover 50+ countries and 100+ visa types</span>
//             <GoogleAuth
//               onLoginSuccess={handleStartInterview}
//               onLoginError={handleStartInterview}
//               buttonText="Find Your Visa Type"
//               className="btn btn-secondary"
//             />
//           </div>
//         </div>

//         {/* Business Tab */}
//         <div className="tab-content">
//           <div className="visa-grid">
//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUS} alt="USA" className="visa-country-flag" />
//                 <h4>E-2 Treaty Investor Visa</h4>
//               </div>
//               <p>For nationals of treaty countries investing substantial capital in a U.S. business.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagUK} alt="UK" className="visa-country-flag" />
//                 <h4>Innovator Visa</h4>
//               </div>
//               <p>For experienced business people seeking to establish an innovative business in the UK.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagCA} alt="Canada" className="visa-country-flag" />
//                 <h4>Start-up Visa Program</h4>
//               </div>
//               <p>For entrepreneurs with innovative business ideas seeking to immigrate to Canada.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>

//             <div className="visa-card">
//               <div className="visa-card-header">
//                 <img src={countryFlagAU} alt="Australia" className="visa-country-flag" />
//                 <h4>Business Innovation (188)</h4>
//               </div>
//               <p>For business owners and investors seeking to own and manage a business in Australia.</p>
//               <a href="#" className="visa-card-link">Prepare Now</a>
//             </div>
//           </div>

//           <div className="visa-types-cta">
//             <span>We cover 50+ countries and 100+ visa types</span>
//             <GoogleAuth
//               onLoginSuccess={handleStartInterview}
//               onLoginError={handleStartInterview}
//               buttonText="Find Your Visa Type"
//               className="btn btn-secondary"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

//       <section className="pricing">
//         <div className="container">
//           <div className="section-header">
//             <span className="section-tag">Pricing</span>
//             <h2 className="section-title">Simple, Transparent Pricing</h2>
//             <p className="section-subtitle">
//               Choose the plan that fits your needs and start preparing for success.
//             </p>
//           </div>

//           <div className="pricing-grid">
//             <div className="pricing-card">
//               <div className="pricing-card-header">
//                 <h3 className="pricing-plan">Free Trial</h3>
//                 <div className="pricing-price">
//                   <span className="price">$0</span>
//                 </div>
//               </div>
//               <div className="pricing-features">
//                 <ul>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     1 complete mock interview
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Basic feedback
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Standard question sets
//                   </li>
//                 </ul>
//               </div>
//               <div className="pricing-cta">
//                 <GoogleAuth
//                   onLoginSuccess={handleStartInterview}
//                   onLoginError={handleStartInterview}
//                   buttonText="Start Free Trial"
//                   className="btn btn-outline-primary"
//                 />
//               </div>
//             </div>

//             <div className="pricing-card popular">
//               <div className="pricing-card-badge">Most Popular</div>
//               <div className="pricing-card-header">
//                 <h3 className="pricing-plan">Standard</h3>
//                 <div className="pricing-price">
//                   <span className="price">$29</span>
//                   <span className="period">one-time</span>
//                 </div>
//               </div>
//               <div className="pricing-features">
//                 <ul>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     5 complete mock interviews
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Advanced AI feedback
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Custom question sets
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Progress tracking
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Document checklists
//                   </li>
//                 </ul>
//               </div>
//               <div className="pricing-cta">
//                 <GoogleAuth
//                   onLoginSuccess={handleStartInterview}
//                   onLoginError={handleStartInterview}
//                   buttonText="Get Started"
//                   className="btn btn-primary"
//                 />
//               </div>
//             </div>

//             <div className="pricing-card">
//               <div className="pricing-card-header">
//                 <h3 className="pricing-plan">Premium</h3>
//                 <div className="pricing-price">
//                   <span className="price">$49</span>
//                   <span className="period">one-time</span>
//                 </div>
//               </div>
//               <div className="pricing-features">
//                 <ul>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Unlimited mock interviews
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Premium AI feedback
//                   </li>
//                   <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Priority support
//                   </li>
//                    <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Personalized interview strategy session
//                   </li>
//                    <li>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                     Visa application review
//                   </li>
//                 </ul>
//               </div>
//               <div className="pricing-cta">
//                 <GoogleAuth
//                   onLoginSuccess={handleStartInterview}
//                   onLoginError={handleStartInterview}
//                   buttonText="Go Premium"
//                   className="btn btn-primary"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section id="stats" className="stats animate-on-scroll">
//         <div className="container">
//           <div className="stats-header section-header">
//             <span className="section-tag">Stats</span>
//             <h2 className="section-title">VisaCoach By The Numbers</h2>
//             <p className="section-subtitle">
//               Our impact is clear. VisaCoach is helping thousands achieve their travel dreams.
//             </p>
//           </div>

//           <div className={`stats-grid ${isInView.stats ? 'in-view' : ''}`}>
//             <div className="stat-card">
//               <div className="stat-number">10,000+</div>
//               <div className="stat-label">Visas Approved</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-number">97%</div>
//               <div className="stat-label">Success Rate</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-number">50+</div>
//               <div className="stat-label">Countries Covered</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-number">4.8/5</div>
//               <div className="stat-label">Average User Rating</div>
//             </div>
//           </div>
//         </div>
//       </section>
      
//       <footer className="footer">
//         <div className="container footer-container">
//           <div className="footer-logo">
//             <img src={logoSymbol} alt="VisaCoach Logo" className="footer-logo-symbol" />
//             <span className="footer-logo-text">VisaCoach</span>
//           </div>
//           <div className="footer-links">
//             <a href="#">Terms of Service</a>
//             <a href="#">Privacy Policy</a>
//             <a href="#">Contact Us</a>
//           </div>
//           <div className="footer-copyright">
//             &copy; 2024 VisaCoach. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default LandingPage;*/}
```

# frontend/src/services/aiInterviewService.js

```js
// aiInterviewService.js
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const aiInterviewService = {
  async getAgentResponse(question, userAnswer, country, visaType) {
    try {
      const token = getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/api/interview/agent-response`, {
        question,
        userAnswer,
        country,
        visaType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  },
  
  async getPreInterviewTips(country, visaType) {
    try {
      const token = getAuthToken();
      
      const response = await axios.get(`${API_BASE_URL}/api/interview/tips?country=${country}&visaType=${visaType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting interview tips:', error);
      // Return fallback tips
      return {
        general: ["Answer truthfully", "Be concise", "Maintain eye contact"],
        specific: ["Know the purpose of your visa", "Be prepared to explain your ties to home"]
      };
    }
  },
  
  async getCommonMistakes(country, visaType) {
    try {
      const token = getAuthToken();
      
      const response = await axios.get(`${API_BASE_URL}/api/interview/common-mistakes?country=${country}&visaType=${visaType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting common mistakes:', error);
      return ["Being vague about plans", "Inconsistent answers"];
    }
  },
  
  async saveInterviewHistory(data) {
    try {
      const token = getAuthToken();
      
      const response = await axios.post(`${API_BASE_URL}/api/interview/save-history`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving interview history:', error);
      throw error;
    }
  }
};
```

# frontend/src/services/mockAgentService.js

```js
// EnhancedAgentService.js
export const enhancedAgentService = {
    async getAgentResponse(question, userAnswer, country, visaType) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Question categories for more organized feedback
      const questionCategories = {
        intentToReturn: ['plans after completing', 'after your studies', 'after completing your course'],
        studyChoice: ['Why did you choose', 'Why have you chosen'],
        finances: ['finance your', 'support yourself financially', 'living expenses'],
        academicBackground: ['academic background', 'relate to your chosen field'],
        familyTies: ['family members', 'ties to your home country'],
        careerPlans: ['help your career', 'benefit your future career'],
        visitPurpose: ['purpose of your visit', 'why do you want to visit']
      };
      
      // Find category of question
      let category = 'general';
      for (const [cat, keywords] of Object.entries(questionCategories)) {
        if (keywords.some(keyword => question.toLowerCase().includes(keyword.toLowerCase()))) {
          category = cat;
          break;
        }
      }
      
      // Analyze answer length
      const wordCount = userAnswer.split(/\s+/).filter(Boolean).length;
      let lengthFeedback = "";
      
      if (wordCount < 15) {
        lengthFeedback = "Your answer is quite brief. In a real interview, providing more details can help establish your case better.";
      } else if (wordCount > 150) {
        lengthFeedback = "Your answer is quite detailed, which is good, but try to be concise in a real interview as officers have limited time.";
      }
      
      // Country-specific feedback elements
      const countrySpecificTips = {
        US: {
          F1: " For US F1 visas, demonstrating strong ties to your home country is particularly important.",
          'B1/B2': " For B1/B2 visas, being clear about your specific plans and return date is crucial."
        },
        UK: {
          student: " UK student visa interviews often focus on your financial arrangements and course details."
        },
        CA: {
          student: " Canadian student visa officers look for how your studies fit into your long-term career plans."
        }
      };
      
      const countryTip = countrySpecificTips[country]?.[visaType] || "";
      
      // Category-specific feedback
      let feedback = "";
      
      switch(category) {
        case 'intentToReturn':
          if (userAnswer.toLowerCase().includes("return") && 
              (userAnswer.toLowerCase().includes("home") || userAnswer.toLowerCase().includes("country"))) {
            feedback = "Strong answer. You've clearly stated your intention to return to your home country, which addresses a key concern for visa officers.";
          } else {
            feedback = "Consider explicitly mentioning your plans to return to your home country. Immigration officers need to be convinced you don't intend to immigrate permanently.";
          }
          break;
          
        case 'studyChoice':
          const academicReasons = ["program", "university", "research", "faculty", "academic", "education", "quality", "ranking"];
          const mentionsAcademic = academicReasons.some(term => userAnswer.toLowerCase().includes(term));
          
          if (mentionsAcademic) {
            feedback = "Good approach highlighting academic reasons for your choice. This shows your focus is on education rather than immigration.";
          } else {
            feedback = "Try to emphasize specific academic reasons for choosing this country/institution. Mention program quality, faculty expertise, or research opportunities that aren't available elsewhere.";
          }
          break;
          
        case 'finances':
          const financialTerms = ["scholarship", "savings", "sponsor", "parents", "loan", "fund", "bank"];
          const mentionsFinances = financialTerms.some(term => userAnswer.toLowerCase().includes(term));
          
          if (mentionsFinances) {
            feedback = "Good job addressing your financial situation. Clear financial planning demonstrates you're a serious student who has prepared properly.";
          } else {
            feedback = "Be more specific about your financial arrangements. Officers need to know you can support yourself without unauthorized work.";
          }
          break;
          
        case 'careerPlans':
          if (userAnswer.toLowerCase().includes("career") || 
              userAnswer.toLowerCase().includes("job") || 
              userAnswer.toLowerCase().includes("profession")) {
            feedback = "Good connection between your studies and career goals. This helps establish that your educational plan makes sense.";
          } else {
            feedback = "Try to draw a clearer connection between this specific program and your career goals back home. This helps establish the logic of your educational plan.";
          }
          break;
          
        case 'visitPurpose':
          if (userAnswer.toLowerCase().includes("return") && userAnswer.toLowerCase().includes("days") || 
              userAnswer.toLowerCase().includes("weeks") || userAnswer.toLowerCase().includes("months")) {
            feedback = "Good job mentioning a specific timeframe and return plans, which addresses key concerns for visitor visas.";
          } else {
            feedback = "Be very specific about the length of your stay and your plans to return. For visitor visas, clear temporary intent is crucial.";
          }
          break;
          
        default:
          // General feedback based on confidence and clarity
          const hesitationWords = ["maybe", "probably", "i think", "possibly", "not sure", "um", "uh"];
          const soundsHesitant = hesitationWords.some(term => userAnswer.toLowerCase().includes(term));
          
          if (soundsHesitant) {
            feedback = "Try to sound more confident in your answers. Hesitation can sometimes be interpreted as uncertainty or dishonesty.";
          } else {
            feedback = "Good, clear response. Maintain this confident approach throughout your interview.";
          }
      }
      
      // Combine feedback elements
      return `${feedback}${lengthFeedback ? " " + lengthFeedback : ""}${countryTip}`;
    },
    
    getPreInterviewTips(country, visaType) {
      const generalTips = [
        "Answer truthfully and consistently with your application documents",
        "Speak clearly and confidently",
        "Be concise but thorough in your responses",
        "Maintain appropriate eye contact",
        "Dress professionally",
        "Bring all required documentation"
      ];
      
      const specificTips = {
        US: {
          F1: [
            "Be prepared to demonstrate strong ties to your home country",
            "Clearly articulate your study plans and how they relate to your career goals",
            "Be ready to explain how you'll finance your education",
            "Demonstrate knowledge about your chosen institution and program"
          ],
          'B1/B2': [
            "Have clear plans for your visit with specific dates",
            "Be prepared to show evidence of funds for your trip",
            "Demonstrate strong ties to your home country",
            "Have a clear intention to return after your visit"
          ]
        },
        UK: {
          student: [
            "Be prepared to discuss your chosen course in detail",
            "Demonstrate how this specific UK qualification will benefit your career",
            "Be ready to explain your financial arrangements clearly",
            "Show knowledge of UK student visa regulations"
          ]
        },
        CA: {
          student: [
            "Be prepared to explain why you chose Canada specifically",
            "Demonstrate knowledge of your institution and program",
            "Clearly explain your study-to-work plans if applicable",
            "Be ready to discuss your financial arrangements"
          ]
        }
      };
      
      return {
        general: generalTips,
        specific: specificTips[country]?.[visaType] || []
      };
    },
    
    getCommonMistakes(country, visaType) {
      const commonMistakes = [
        "Being vague about post-study plans",
        "Showing lack of knowledge about chosen institution",
        "Giving inconsistent answers compared to application documents",
        "Appearing unprepared or hesitant",
        "Mentioning unauthorized work intentions",
        "Failing to demonstrate financial capacity"
      ];
      
      return commonMistakes;
    }
  };
```

# frontend/src/styles/index.css

```css
/* src/styles/index.css */

/* General Styles */
body {
    font-family: 'Poppins', 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa; /* Light gray background */
    color: #343a40; /* Dark gray text */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

#root {
    width: 100%;
    max-width: 800px;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1,
h2 {
    color: #007bff; /* Primary blue color for headings */
    text-align: center;
    margin-bottom: 20px;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 30px;
}

p {
    line-height: 1.6;
}

button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

button:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
}

textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
}

select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
    font-family: inherit;
}

.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    border-top-color: #007bff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 10px;
    vertical-align: middle;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.agent-response {
    background-color: #f0f0f0;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.error-message {
    color: red;
    margin-bottom: 10px;
}

/* Add more styling as needed based on your components */
.app-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
```

# package.json

```json
{
    "name": "visa-prep-app",
    "version": "1.0.0",
    "description": "Visa Interview Prep App - Monorepo (Optional)",
    "scripts": {
        "start": "npm run start:env && concurrently \"npm run start:frontend\" \"npm run start:backend\"",
        "start:frontend": "cd frontend && npm start",
        "start:backend": "cd backend && node server.js",
        "start:env": "cp .env backend/.env"
    },
    "devDependencies": {
        "concurrently": "^9.1.2"
    },
    "dependencies": {
        "@google/generative-ai": "^0.23.0",
        "axios": "^1.8.1",
        "bcrypt": "^5.1.1",
        "jsonwebtoken": "^9.0.2",
        "mongoose": "^8.11.0",
        "react-chartjs-2": "^5.3.0"
    }
}

```

# README.md

```md
# visaCoach - Visa Interview Prep App

This application helps users prepare for their visa interviews through a simulated interview experience. It provides a basic interview flow with feedback and allows users to select a country and visa type. This is a Minimum Viable Product (MVP) version, with more features and improvements to come in the future.

## Features

*   **Simulated Visa Interview:** Users can go through a series of questions similar to what they might experience in a real visa interview.
*   **Country and Visa Type Selection:** Users can select the country and visa type for their simulated interview.
*   **Mock Feedback:** The app provides basic feedback on user responses, simulating what a visa officer might say.
* **Google Login**: Users can use their google account to login.

## Current Limitations (MVP)

*   **Mock Agent Service:** The feedback given by the "Visa Officer" is currently mocked. It is based on simple keyword matching and does not involve any real AI/GPT service.
*   **Limited Question Set:** The number of questions and scenarios are limited and hardcoded for the US F1 visa.
* **Basic Backend**: The backend only validates the google token.

## Technologies Used

*   **Frontend:**
    *   React (v19.0.0)
    *   React Router DOM (v6.22.2)
    * `@react-oauth/google` (v0.12.1)
    *   Create React App (react-scripts v5.0.1)
*   **Backend:**
    *   Node.js
    *   Express.js (v4.18.2)
    *   cors (v2.8.5)
    *   dotenv (v16.4.7)
    * `google-auth-library` (v9.15.1)
* **Other**
    * concurrently (v9.1.2)

## Setup and Run (Local Testing)

This project uses a monorepo structure to manage both the frontend and backend code within a single repository.

**Prerequisites**

*   Node.js and npm installed on your machine.
*   A Google Cloud Project with an OAuth 2.0 Client ID configured.
*   `.env` file in the project root with the following content:
    \`\`\`
    REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
    \`\`\`

**Installation**

1.  Clone the repository: `git clone <your-repo-url>`
2.  Navigate to the project root directory: `cd visaCoach`
3.  Install dependencies: `npm install`
4.  Navigate to the backend directory `cd backend`
5.  Install dependencies: `npm install`
6.  Go back to root directory `cd ..`

**Running the Development Servers**

1.  **Start the entire project:** From the project root directory, run:
    \`\`\`bash
    npm start
    \`\`\`

    This script will:
    *   Copy your `.env` file to the backend directory (`cp .env backend/.env`).
    *   Start the backend server using `cd backend && node server.js`.
    *   Start the frontend development server using `cd frontend && npm start`.
    *   Start the project concurrently, so you don't need to open multiple terminal window.

**Important Notes**

* Make sure your `.env` file (in the root) includes the right `REACT_APP_GOOGLE_CLIENT_ID` value.
* The backend runs on `http://localhost:5000`.
* The frontend will run on `http://localhost:3000`.
* **Google OAuth**: Make sure to go to your google account to add `http://localhost:3000` as an authorized Javascript origin.
* If you change the backend, you will need to restart the backend. If you change the front end, the server will restart automatically.

**Accessing the App**

*   Once both the frontend and backend servers are running, open your web browser and go to `http://localhost:3000`.

## Future Improvements

*   Integrate with a real GPT/AI service to provide more accurate and meaningful feedback.
*   Expand the set of questions and scenarios to cover a wider range of visa types and countries.
*   Add user profiles and history tracking.
*   Improve the UI/UX to be more engaging and user-friendly.
*   Add more tests.
* Improve error messages.
* Add more documentation.

## Contact

If you have any questions or suggestions, feel free to contact me.

## License

[Add your license here, e.g., MIT License]

```

