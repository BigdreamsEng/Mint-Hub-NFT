// index.js
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your secret in production

// Update CORS to allow your specific frontend origin
app.use(cors({
  origin: 'http://172.20.10.3:8080', // Update to your frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Authentication Endpoint
app.post('/authenticate', (req, res) => {
    const { address, signature, message } = req.body;

    // Validate input
    if (!address || !signature || !message) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    try {
        // Log received values
        console.log('Received address:', address);
        console.log('Received signature:', signature);
        console.log('Received message:', message);

        // Recover the address from the signature using ethers v6
        const recoveredAddress = ethers.verifyMessage(message, signature);

        console.log('Recovered address:', recoveredAddress); // Log the recovered address

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            // Generate JWT
            const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Authentication error:', error); // Log the error for debugging
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Protected Route Example
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Protected route accessed with token:', token);

  if (!token) {
    console.log('No token provided.');
    return res.status(403).json({ message: 'No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.status(500).json({ message: 'Failed to authenticate token.' });
    }
    console.log('Token verified for user:', user.address);
    res.json({ message: `Hello, ${user.address}! This is protected data.` });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
