const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  farmerName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits'],
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmerDetails: {
    aadhaarNumber: { type: String },
    address: { type: String },
    state: { type: String },
    district: { type: String },
    villageMandal: { type: String },
    pincode: { type: String },
    landSize: { type: Number },
    cropsGrown: [{ type: String }],
    irrigationAvailable: { type: Boolean },
    ownTransport: { type: Boolean },
    upiId: { type: String },
    landProofDocument: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cropSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Crop', cropSchema);