const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const authMiddleware = require('../middleware/auth');

router.post('/crop', authMiddleware(), cropController.postCrop);

module.exports = router;   