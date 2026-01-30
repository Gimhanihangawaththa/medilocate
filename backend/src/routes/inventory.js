const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, isPharmacyAdmin } = require('../middleware/auth');

// Public routes
router.get('/search/availability', inventoryController.searchMedicineAvailability);
router.get('/:pharmacyId/medicines', inventoryController.getPharmacyInventory);

// Protected routes (pharmacy admin)
router.post('/:pharmacyId/medicines', authenticateToken, isPharmacyAdmin, inventoryController.addInventory);
router.get('/:pharmacyId', authenticateToken, isPharmacyAdmin, inventoryController.getPharmacyInventory);
router.put('/:pharmacyId/medicines/:inventoryId', authenticateToken, isPharmacyAdmin, inventoryController.updateInventory);
router.delete('/:pharmacyId/medicines/:inventoryId', authenticateToken, isPharmacyAdmin, inventoryController.removeInventory);

module.exports = router;
