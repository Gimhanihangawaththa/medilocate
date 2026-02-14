const Medicine = require('../models/Medicine');


exports.addMedicine = async (req, res, next) => {
  try {
    const { name, genericName, category, description, manufacturer, strength, unit, requiresPrescription } = req.body;


    const existingMedicine = await Medicine.findOne({ name: name.toLowerCase() });
    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Medicine already exists'
      });
    }

    const medicine = new Medicine({
      name: name.trim(),
      genericName: genericName?.trim(),
      category,
      description: description?.trim(),
      manufacturer: manufacturer?.trim(),
      strength: strength?.trim(),
      unit,
      requiresPrescription
    });

    await medicine.save();

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};


exports.searchMedicines = async (req, res, next) => {
  try {
    const { query, category, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const filter = {};


    if (query) {
      filter.$text = { $search: query };
    }


    if (category) {
      filter.category = category;
    }

    filter.isActive = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const medicines = await Medicine.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Medicine.countDocuments(filter);

    res.json({
      success: true,
      data: medicines,
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


exports.getAllMedicines = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const medicines = await Medicine.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Medicine.countDocuments(filter);

    res.json({
      success: true,
      data: medicines,
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


exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};


exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};


exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
