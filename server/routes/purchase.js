const express = require('express');
const router = express.Router();
const { getFarmerDetailsAndPurchases } = require('../controllers/getFarmerCrops');

// Route to get farmer details and purchased crops
router.get('/farmer/:farmerId', getFarmerDetailsAndPurchases);

module.exports = router;