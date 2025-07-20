const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');

exports.getFarmerPurchases = async (req, res) => {
  const { farmerId } = req.params;

  try {
    // Validate farmerId format
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmer ID format' });
    }

    // Fetch all purchases for the farmerId
    const purchases = await Purchase.find({ farmerId });

    // Generate summary statistics
    const summary = await Purchase.aggregate([
      { $match: { farmerId: new mongoose.Types.ObjectId(farmerId) } },
      {
        $group: {
          _id: '$cropName',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' },
          purchaseCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Prepare response
    const response = {
      purchases: purchases.map(purchase => ({
        purchaseId: purchase._id,
        customerId: purchase.customerId,
        cropId: purchase.cropId,
        cropName: purchase.cropName,
        quantity: purchase.quantity,
        unit: purchase.unit,
        totalPrice: purchase.totalPrice,
        status: purchase.status,
        createdAt: purchase.createdAt,
      })),
      summary: summary.map(stat => ({
        cropName: stat._id,
        totalQuantity: stat.totalQuantity,
        totalRevenue: stat.totalRevenue,
        purchaseCount: stat.purchaseCount,
      })),
      totalPurchases: purchases.length,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching farmer purchases:', err);
    res.status(500).json({ message: 'Server error' });
  }
};