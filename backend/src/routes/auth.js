const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// User registration and login
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Admin registration and login
router.post('/admin/register', authController.registerPharmacyAdmin);
router.post('/admin/login', authController.loginAdmin);

module.exports = router;