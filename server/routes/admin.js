const express = require('express');
const {
  getAllUsers,
  getAllFarmers,
  getFarmerById,
  approveFarmer,
  rejectFarmer
} = require('../controllers/adminController');

const auth = require('../middleware/auth');

const router = express.Router();

router.get('/users', auth(), getAllUsers); 
router.get('/farmers', auth(), getAllFarmers);
router.get('/farmer/:id', auth(), getFarmerById);
router.post('/farmer/:id/approve', auth(), approveFarmer);
router.post('/farmer/:id/reject', auth(), rejectFarmer);

module.exports = router;
