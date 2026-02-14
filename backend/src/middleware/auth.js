const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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


const isPharmacyAdmin = (req, res, next) => {
  if (req.user.role !== 'pharmacy_admin' && req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only pharmacy admins can access this resource'
    });
  }
  next();
};


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