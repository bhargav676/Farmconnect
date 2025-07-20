const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Farmer = require('../models/Farmer');

exports.register = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['farmer', 'customer', 'admin']).withMessage('Invalid role'),
  body('farmerData.aadhaarNumber')
    .optional()
    .matches(/^\d{12}$/)
    .withMessage('Aadhaar number must be 12 digits'),
  body('farmerData.address').optional().notEmpty().withMessage('Address is required for farmers'),
  body('farmerData.state').optional().notEmpty().withMessage('State is required for farmers'),
  body('farmerData.district').optional().notEmpty().withMessage('District is required for farmers'),
  body('farmerData.villageMandal').optional().notEmpty().withMessage('Village/Mandal is required for farmers'),
  body('farmerData.pincode').optional().matches(/^\d{6}$/).withMessage('PIN code must be 6 digits'),
  body('farmerData.cropsGrown')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one crop is required for farmers'),
  body('farmerData.upiId')
    .optional()
    .matches(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)
    .withMessage('Invalid UPI ID format'),
  body('farmerData.landProofDocument').optional().notEmpty().withMessage('Land proof document is required for farmers'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, farmerData } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'customer'
      });
      await user.save();

      if (role === 'farmer') {
        const existingFarmer = await Farmer.findOne({ aadhaarNumber: farmerData.aadhaarNumber });
        if (existingFarmer) {
          await User.deleteOne({ _id: user._id }); // Rollback user creation
          return res.status(400).json({ message: 'Aadhaar number already registered' });
        }

        const farmer = new Farmer({
          userId: user._id,
          aadhaarNumber: farmerData.aadhaarNumber,
          address: farmerData.address,
          state: farmerData.state,
          district: farmerData.district,
          villageMandal: farmerData.villageMandal,
          pincode: farmerData.pincode,
          landSize: farmerData.landSize ? parseFloat(farmerData.landSize) : null,
          cropsGrown: farmerData.cropsGrown,
          irrigationAvailable: farmerData.irrigationAvailable,
          ownTransport: farmerData.ownTransport,
          upiId: farmerData.upiId,
          landProofDocument: farmerData.landProofDocument,
          latitude: farmerData.latitude ? parseFloat(farmerData.latitude) : null,
          longitude: farmerData.longitude ? parseFloat(farmerData.longitude) : null,
          status: 'pending'
        });
        await farmer.save();
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      res.status(201).json({ token, role: user.role, message: 'Registration successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
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
        expiresIn: '1h'
      });

      let farmerData = null;
      if (user.role === 'farmer') {
        farmerData = await Farmer.findOne({ userId: user._id });
      }

      res.json({
        token,
        role: user.role,
        message: 'Login successful',
        farmerStatus: farmerData ? farmerData.status : null
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let farmerData = null;
    if (user.role === 'farmer') {
      farmerData = await Farmer.findOne({ userId: user._id });
    }
    res.json({
      ...user.toObject(),
      farmerStatus: farmerData ? farmerData.status : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};