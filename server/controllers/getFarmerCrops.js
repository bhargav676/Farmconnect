const mongoose = require('mongoose');
const CustomerPurchase = require('../models/CustomerPurchase');

exports.getFarmerDetailsAndPurchases = async (req, res) => {
  const { farmerId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', cropName } = req.query;

  try {
    // Validate farmerId format
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmer ID format' });
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ message: 'Page and limit must be positive integers' });
    }

    // Validate sortBy and sortOrder
    const validSortFields = ['createdAt', 'totalPrice', 'quantity'];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ message: `SortBy must be one of: ${validSortFields.join(', ')}` });
    }
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { farmerId };
    if (cropName) {
      query.cropName = cropName; // Filter by cropName if provided
    }

    // Fetch purchases with pagination and sorting
    const purchases = await CustomerPurchase.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Calculate total purchases for pagination
    const totalPurchases = await CustomerPurchase.countDocuments(query);

    // Generate summary statistics
    const summary = await CustomerPurchase.aggregate([
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
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPurchases / limitNum),
        totalPurchases,
        limit: limitNum,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching farmer purchases:', err);
    res.status(500).json({ message: 'Server error' });
  }
};