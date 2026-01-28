const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is missing'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// Middleware to check if user is pharmacy admin
const isPharmacyAdmin = (req, res, next) => {
  if (req.user.role !== 'pharmacy_admin' && req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only pharmacy admins can access this resource'
    });
  }
  next();
};

// Middleware to check if user is system admin
const isSystemAdmin = (req, res, next) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only system admins can access this resource'
    });
  }
  next();
};

module.exports = { authenticateToken, isPharmacyAdmin, isSystemAdmin };