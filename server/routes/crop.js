const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/auth');
const nearbyCropController = require('../controllers/nearbyCropController')

router.post('/crop', authMiddleware(), cropController.postCrop);
router.get('/nearby-crops',nearbyCropController.getNearbyCrops);


module.exports = router;   