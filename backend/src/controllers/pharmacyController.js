const Pharmacy = require('../models/Pharmacy');

// Add new pharmacy
exports.addPharmacy = async (req, res, next) => {
  try {
    const {
      name,
      registrationNumber,
      address,
      location,
      contact,
      operatingHours
    } = req.body;

    // Check if pharmacy already exists
    const existingPharmacy = await Pharmacy.findOne({ registrationNumber });
    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy with this registration number already exists'
      });
    }

    const pharmacy = new Pharmacy({
      name: name.trim(),
      registrationNumber: registrationNumber.trim(),
      address,
      location: {
        type: 'Point',
        coordinates: location.coordinates // [longitude, latitude]
      },
      contact,
      owner: req.user.userId, // From JWT token
      operatingHours: operatingHours || {}
    });

    await pharmacy.save();

    res.status(201).json({
      success: true,
      message: 'Pharmacy created successfully',
      data: pharmacy
    });
  } catch (error) {
    next(error);
  }
};

// Search pharmacies with geolocation
exports.searchPharmacies = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 5000, page = 1, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pharmacies = await Pharmacy.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'email phone');

    const total = await Pharmacy.countDocuments({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json({
      success: true,
      data: pharmacies,
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

// Get pharmacy by ID
exports.getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('owner', 'email phone');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.json({
      success: true,
      data: pharmacy
    });
  } catch (error) {
    next(error);
  }
};

// Update pharmacy
exports.updatePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user owns this pharmacy
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    if (pharmacy.owner.toString() !== req.user.userId && req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this pharmacy'
      });
    }

    // Handle location update
    if (req.body.location) {
      req.body.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates
      };
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pharmacy updated successfully',
      data: updatedPharmacy
    });
  } catch (error) {
    next(error);
  }
};

// Get all pharmacies
exports.getAllPharmacies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pharmacies = await Pharmacy.find({ isActive: true })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'email phone');

    const total = await Pharmacy.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: pharmacies,
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

// Delete pharmacy (soft delete)
exports.deletePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    if (pharmacy.owner.toString() !== req.user.userId && req.user.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this pharmacy'
      });
    }

    await Pharmacy.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Pharmacy deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get owner's own pharmacy
exports.getOwnerPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ 
      owner: req.user.userId,
      isActive: true 
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: true,
        data: null,
        message: 'No pharmacy found for this owner'
      });
    }

    res.json({
      success: true,
      data: pharmacy
    });
  } catch (error) {
    next(error);
  }
};
