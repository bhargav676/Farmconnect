const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/auth');

router.post('/crop', authMiddleware(), cropController.postCrop);
router.get('/cropdata', authMiddleware(), cropController.getFarmerCrops);
router.put(
  '/:cropId',
  [
    authMiddleware(),
    body('quantity', 'Quantity is required and must be a positive number').isNumeric().toFloat().custom((value) => value > 0),
    body('price', 'Price is required and must be a positive number').isNumeric().toFloat().custom((value) => value > 0),
  ],
  cropController.updateCrop
);
router.delete('/:cropId', authMiddleware(), cropController.deleteCrop);

module.exports = router;   