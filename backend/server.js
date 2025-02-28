const express = require('express');
const cors = require('cors'); // Import cors
const interviewRoutes = require('./routes/interviewRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 5000; // Or any port you prefer

require('dotenv').config();

app.use(cors()); // Enable CORS for all routes (for MVP simplicity)
app.use(express.json()); // To parse JSON request bodies

app.use('/api/interview', interviewRoutes); // Mount interview routes
app.use('/api/auth', authRoutes); // Mount auth routes

app.get('/', (req, res) => {
  res.send('Visa Prep Backend MVP is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
