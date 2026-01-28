const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// Add medicine to pharmacy inventory
exports.addInventory = async (req, res, next) => {
  try {
    const { pharmacyId } = req.params;
    const { medicineId, medicineName, quantity, price, batchNumber, expiryDate, lowStockThreshold } = req.body;

    // Verify pharmacy exists and belongs to user
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    if (pharmacy.owner.toString() !== req.user.userId && req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage this pharmacy inventory'
      });
    }

    // Handle medicine - either use ID or create from name
    let medicine;
    if (medicineId) {
      medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }
    } else if (medicineName) {
      // Try to find medicine by name, or create it
      medicine = await Medicine.findOne({ name: { $regex: medicineName, $options: 'i' } });
      if (!medicine) {
        // Create new medicine
        medicine = new Medicine({
          name: medicineName,
          genericName: medicineName,
          category: 'Other',
          unit: 'tablet',
          description: 'Medicine added via inventory',
          manufacturer: 'Not specified'
        });
        await medicine.save();
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either medicineId or medicineName is required'
      });
    }

    // Check if inventory already exists
    let inventory = await Inventory.findOne({ pharmacy: pharmacyId, medicine: medicine._id });

    if (inventory) {
      return res.status(400).json({
        success: false,
        message: 'Medicine already in inventory for this pharmacy'
      });
    }

    inventory = new Inventory({
      pharmacy: pharmacyId,
      medicine: medicine._id,
      quantity,
      price,
      batchNumber,
      expiryDate,
      lowStockThreshold: lowStockThreshold || 5
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      message: 'Inventory added successfully',
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Update inventory (quantity, price, etc.)
exports.updateInventory = async (req, res, next) => {
  try {
    const { pharmacyId, inventoryId } = req.params;
    const { quantity, price, batchNumber, expiryDate, lowStockThreshold } = req.body;

    // Verify ownership
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || (pharmacy.owner.toString() !== req.user.userId && req.user.role !== 'system_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const inventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      {
        $set: {
          quantity,
          price,
          batchNumber,
          expiryDate,
          lowStockThreshold,
          lastRestocked: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Get pharmacy inventory
exports.getPharmacyInventory = async (req, res, next) => {
  try {
    const { pharmacyId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { pharmacy: pharmacyId };

    if (status) {
      filter.status = status; // 'in_stock', 'low_stock', 'out_of_stock'
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inventory = await Inventory.find(filter)
      .populate('medicine', 'name category genericName strength unit')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(filter);

    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search medicine availability across all pharmacies
exports.searchMedicineAvailability = async (req, res, next) => {
  try {
    const { medicineId, latitude, longitude, maxDistance = 5000, page = 1, limit = 20 } = req.query;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: 'Medicine ID is required'
      });
    }

    // Build filter
    const filter = { medicine: medicineId, status: { $ne: 'out_of_stock' } };

    let pharmacyFilter = { isActive: true };

    // Add geolocation filter if provided
    if (latitude && longitude) {
      pharmacyFilter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    // Get pharmacies with location filter
    const pharmacies = await Pharmacy.find(pharmacyFilter).select('_id');
    const pharmacyIds = pharmacies.map(p => p._id);

    filter.pharmacy = { $in: pharmacyIds };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const availability = await Inventory.find(filter)
      .populate('pharmacy', 'name address contact location rating')
      .populate('medicine', 'name category strength unit')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(filter);

    res.json({
      success: true,
      data: availability,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove medicine from pharmacy inventory
exports.removeInventory = async (req, res, next) => {
  try {
    const { pharmacyId, inventoryId } = req.params;

    // Verify ownership
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || (pharmacy.owner.toString() !== req.user.userId && req.user.role !== 'system_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const inventory = await Inventory.findByIdAndDelete(inventoryId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
