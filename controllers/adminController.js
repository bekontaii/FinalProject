const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// GET /api/admin/products
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

// PUT /api/admin/products/:id/status
const updateProductStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = status;
    await product.save();

    return res.json(product);
  } catch (err) {
    console.error('Admin updateProductStatus error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllProducts, updateProductStatus };

