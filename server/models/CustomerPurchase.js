const mongoose = require('mongoose');

const customerPurchaseSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (value) {
        const user = await mongoose.model('User').findById(value);
        return user && user.role === 'Customer';
      },
      message: 'Customer must be a valid user with the role "Customer"',
    },
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (value) {
        const user = await mongoose.model('User').findById(value);
        return user && user.role === 'Farmer';
      },
      message: 'Farmer must be a valid user with the role "Farmer"',
    },
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Assumes you have a Product model
        required: true,
      },
      name: {
        type: String,
        required: true, // Store product name for quick reference
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
      },
      unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Unit price cannot be negative'],
      },
      totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative'],
        validate: {
          validator: function (value) {
            return value === this.quantity * this.unitPrice;
          },
          message: 'Total price must equal quantity * unit price',
        },
      },
    },
  ],
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
    validate: {
      validator: function (value) {
        const sum = this.products.reduce((acc, product) => acc + product.totalPrice, 0);
        return value === sum;
      },
      message: 'Total amount must match the sum of product total prices',
    },
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery', 'Bank Transfer'],
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true,
  },
  orderNotes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

// Index for faster queries on customer and farmer
customerPurchaseSchema.index({ customer: 1, farmer: 1, purchaseDate: -1 });

module.exports = mongoose.model('CustomerPurchase', customerPurchaseSchema);