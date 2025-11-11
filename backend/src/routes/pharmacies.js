const express = require('express');
const Pharmacy = require('../models/Pharmacy');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all pharmacies
router.get('/', async (req, res) => {
  try {
    const { search, medicine } = req.query;
    let query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let pharmacies = await Pharmacy.find(query).populate('owner', 'username email');

    // Filter by medicine if specified
    if (medicine) {
      pharmacies = pharmacies.filter(pharmacy => 
        pharmacy.medicines.some(med => 
          med.name.toLowerCase().includes(medicine.toLowerCase())
        )
      );
    }

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching pharmacies',
      error: error.message
    });
  }
});

// Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('owner', 'username email');
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching pharmacy',
      error: error.message
    });
  }
});

// Create pharmacy (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, location, contact, medicines } = req.body;

    const pharmacy = new Pharmacy({
      name,
      address,
      location,
      contact,
      medicines,
      owner: req.user.id
    });

    await pharmacy.save();
    await pharmacy.populate('owner', 'username email');

    res.status(201).json({
      message: 'Pharmacy created successfully',
      pharmacy
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating pharmacy',
      error: error.message
    });
  }
});

// Update pharmacy (protected - owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if user owns the pharmacy
    if (pharmacy.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner', 'username email');

    res.json({
      message: 'Pharmacy updated successfully',
      pharmacy: updatedPharmacy
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating pharmacy',
      error: error.message
    });
  }
});

// Search medicines
router.get('/search/medicines', async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    const pharmacies = await Pharmacy.find({
      'medicines.name': { $regex: name, $options: 'i' },
      isActive: true
    }).populate('owner', 'username email');

    // Extract medicine details with pharmacy info
    const results = [];
    pharmacies.forEach(pharmacy => {
      pharmacy.medicines.forEach(medicine => {
        if (medicine.name.toLowerCase().includes(name.toLowerCase())) {
          results.push({
            medicine: medicine.name,
            quantity: medicine.quantity,
            price: medicine.price,
            pharmacy: {
              id: pharmacy._id,
              name: pharmacy.name,
              address: pharmacy.address,
              contact: pharmacy.contact
            }
          });
        }
      });
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: 'Error searching medicines',
      error: error.message
    });
  }
});

module.exports = router;