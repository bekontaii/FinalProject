const { validationResult } = require('express-validator');
const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error('Admin getAllProducts error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllProducts };

