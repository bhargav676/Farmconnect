const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');

exports.postCrop = [
  body('cropName').notEmpty().withMessage('Crop name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number').custom((value) => value >= 0).withMessage('Quantity must be non-negative'),
  body('unit').isIn(['kg', 'dozen', 'unit']).withMessage('Unit must be "kg", "dozen", or "unit"'),
  body('price').isNumeric().withMessage('Price must be a number').custom((value) => value >= 0).withMessage('Price must be non-negative'),
  body('image').notEmpty().withMessage('Image URL is required'),
  body('type').isIn(['vegetables', 'fruits']).withMessage('Type must be "vegetables" or "fruits"'),
  body('farmerId').notEmpty().withMessage('Farmer ID is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cropName, quantity, unit, price, image, type, farmerId } = req.body;

    try {
      // Validate farmerId in User collection
      const user = await User.findById(farmerId);
      if (!user || user.role !== 'farmer') {
        return res.status(400).json({ message: 'Invalid or non-farmer ID' });
      }

      // Fetch farmer details from Farmer collection
      const farmer = await Farmer.findOne({ userId: farmerId });
      if (!farmer) {
        return res.status(400).json({ message: 'Farmer details not found' });
      }

      // Find or create Crop document
      let cropDoc = await Crop.findOne({ farmerId });
      if (!cropDoc) {
        cropDoc = new Crop({
          farmerId,
          farmerName: user.name,
          farmerDetails: {
            aadhaarNumber: farmer.aadhaarNumber,
            address: farmer.address,
            state: farmer.state,
            district: farmer.district,
            villageMandal: farmer.villageMandal,
            pincode: farmer.pincode,
            landSize: farmer.landSize,
            cropsGrown: farmer.cropsGrown,
            irrigationAvailable: farmer.irrigationAvailable,
            ownTransport: farmer.ownTransport,
            upiId: farmer.upiId,
            landProofDocument: farmer.landProofDocument,
            status: farmer.status,
            latitude: farmer.latitude,
            longitude: farmer.longitude,
          },
          crops: [],
        });
      }

      // Add new crop to crops array
      cropDoc.crops.push({
        name: cropName,
        unit,
        quantity,
        price,
        image,
        type,
      });

      // Save the document
      await cropDoc.save();
      res.status(201).json({ message: 'Crop posted successfully', crop: cropDoc.crops[cropDoc.crops.length - 1] });
    } catch (err) {
      console.error('Error posting crop:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },
];