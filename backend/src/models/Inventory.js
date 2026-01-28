const mongoose = require('mongoose');

// Inventory Schema (Stock levels for each medicine at each pharmacy)
const inventorySchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy is required'],
    index: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Medicine is required'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  batchNumber: {
    type: String,
    default: null
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock'
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
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

// Create compound index for pharmacy-medicine lookup
inventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });
inventorySchema.index({ status: 1 });
inventorySchema.index({ expiryDate: 1 });

// Middleware to update status based on quantity
inventorySchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.lowStockThreshold) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
