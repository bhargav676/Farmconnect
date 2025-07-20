const User = require('../models/User');
const Farmer = require('../models/Farmer');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().populate('userId', 'name email');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFarmerById = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).populate('userId', 'name email');
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    farmer.status = 'approved';
    await farmer.save();
    res.json({ message: 'Farmer approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    farmer.status = 'rejected';
    await farmer.save();
    res.json({ message: 'Farmer rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};