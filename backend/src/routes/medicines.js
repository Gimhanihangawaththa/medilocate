const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticateToken, isSystemAdmin, isPharmacyAdmin } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/search', searchLimiter, medicineController.searchMedicines);
router.get('/', medicineController.getAllMedicines);
router.get('/:id', medicineController.getMedicineById);

// Protected routes (admin only)
router.post('/', authenticateToken, isPharmacyAdmin, medicineController.addMedicine);
router.put('/:id', authenticateToken, isSystemAdmin, medicineController.updateMedicine);
router.delete('/:id', authenticateToken, isSystemAdmin, medicineController.deleteMedicine);

module.exports = router;
