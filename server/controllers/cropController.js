const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Crop = require('../models/Crop');


exports.getUserBasicDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ _id: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.postCrop = [
  body('cropName').notEmpty().withMessage('Crop name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number').custom((value) => value >= 0).withMessage('Quantity must be non-negative'),
  body('price').isNumeric().withMessage('Price must be a number').custom((value) => value >= 0).withMessage('Price must be non-negative'),
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('type').isIn(['vegetables', 'fruits']).withMessage('Type must be "vegetables" or "fruits"'),
  body('farmerId').notEmpty().withMessage('Farmer ID is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cropName, quantity, price, imageUrl, type, farmerId } = req.body;

    try {
      // Validate farmerId
      const farmer = await User.findById(farmerId);
      if (!farmer || farmer.role !== 'farmer') {
        return res.status(400).json({ message: 'Invalid or non-farmer ID' });
      }

      // Create new crop entry
      const crop = new Crop({
        cropName,
        quantity,
        farmerName: farmer.name,
        price,
        imageUrl,
        type,
        farmerId
      });

      await crop.save();
      res.status(201).json({ message: 'Crop posted successfully', crop });
    } catch (err) {
      console.error('Error posting crop:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },
];