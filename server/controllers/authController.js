const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Crop = require('../models/Crop');

exports.register = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Farmer', 'Customer', 'Admin']).withMessage('Invalid role'),
  body('farmLocation').optional().trim(),
  body('cropTypes').optional().trim(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, farmLocation, cropTypes } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'Customer';
      const userData = { name, email, password: hashedPassword, role: userRole };
      if (farmLocation && farmLocation.trim()) userData.farmLocation = farmLocation.trim();
      if (cropTypes && cropTypes.trim()) userData.cropTypes = cropTypes.trim();

      const user = new User(userData);
      await user.save();

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.status(201).json({ token, role: user.role, message: 'Registration successful' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },
];

exports.login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
        },
        message: 'Login successful',
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },
];

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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
      if (!farmer || farmer.role !== 'Farmer') {
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