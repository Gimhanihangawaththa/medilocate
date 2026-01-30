const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require('./src/routes/auth');
const pharmaciesRoutes = require('./src/routes/pharmacies');
const medicinesRoutes = require('./src/routes/medicines');
const inventoryRoutes = require('./src/routes/inventory');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');
const { limiter } = require('./src/middleware/rateLimiter');

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:80', 'http://localhost:80'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/inventory', inventoryRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/medilocate')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Bind to ALL network interfaces (0.0.0.0) - crucial for Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT} and bound to all interfaces`);
  console.log(`📡 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;