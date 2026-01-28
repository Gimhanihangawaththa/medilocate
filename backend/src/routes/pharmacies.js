const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { authenticateToken, isPharmacyAdmin } = require('../middleware/auth');

// Public routes
router.get('/search', pharmacyController.searchPharmacies);
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:id', pharmacyController.getPharmacyById);

// Protected routes (pharmacy admin)
router.post('/', authenticateToken, isPharmacyAdmin, pharmacyController.addPharmacy);
router.get('/owner/my-pharmacy', authenticateToken, isPharmacyAdmin, pharmacyController.getOwnerPharmacy);
router.put('/:id', authenticateToken, isPharmacyAdmin, pharmacyController.updatePharmacy);
router.delete('/:id', authenticateToken, isPharmacyAdmin, pharmacyController.deletePharmacy);

module.exports = router;