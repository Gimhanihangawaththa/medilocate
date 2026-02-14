const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

const authRoutes = require('./src/routes/auth');
const pharmaciesRoutes = require('./src/routes/pharmacies');
const medicinesRoutes = require('./src/routes/medicines');
const inventoryRoutes = require('./src/routes/inventory');

const errorHandler = require('./src/middleware/errorHandler');
const { limiter } = require('./src/middleware/rateLimiter');


app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://13.232.196.109:3000'
  ],
  credentials: true,
}));



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(limiter);


app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/inventory', inventoryRoutes);


app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


app.use(errorHandler);


mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/medilocate')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


  app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT} and bound to all interfaces`);
  console.log(`📡 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;