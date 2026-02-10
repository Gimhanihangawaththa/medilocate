const mongoose = require('mongoose');

// Medicine Schema (catalog of all medicines)
const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Medicine name must be at least 2 characters']
  },
  genericName: {
    type: String,
    trim: true,
    default: null
  },
  category: {
    type: String,
    enum: ['Antibiotic', 'Painkiller', 'Vitamin', 'Supplement', 'Antacid', 'Antihistamine', 'Other'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    default: null,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  manufacturer: {
    type: String,
    default: null
  },
  strength: {
    type: String,
    default: null
  },
  unit: {
    type: String,
    enum: ['mg', 'ml', 'g', 'mcg', 'tablet', 'capsule', 'injection', 'syrup'],
    required: [true, 'Unit is required']
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create text index for search
medicineSchema.index({ name: 'text', genericName: 'text', description: 'text' });
medicineSchema.index({ category: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
