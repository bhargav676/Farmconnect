// routes/purchase.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware(['customer']), purchaseController.postPurchase);
router.get('/', authMiddleware(['customer']), purchaseController.getPurchases);

module.exports = router;