const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const pharmacyRoutes = require('./src/routes/pharmacies');
app.use('/api/pharmacies', pharmacyRoutes);

// Middleware - Configure CORS properly
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:80'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/medilocate')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Bind to ALL network interfaces (0.0.0.0) - crucial for Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} and bound to all interfaces`);
});