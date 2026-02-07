const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// POST /api/products
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, category, price, inStock, imageUrl } = req.body;

  try {
    const product = await Product.create({
      name,
      description,
      category,
      price,
      inStock,
      imageUrl,
      owner: req.user._id,
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    let products;
    if (req.user.role === 'admin') {
      products = await Product.find().sort({ createdAt: -1 });
    } else if (req.user.role === 'seller') {
      products = await Product.find({ owner: req.user._id }).sort({
        createdAt: -1,
      });
    } else {
      // regular user sees only approved products
      products = await Product.find({ status: 'approved' }).sort({
        createdAt: -1,
      });
    }
    return res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    let query = { _id: req.params.id };

    if (req.user.role === 'seller') {
      query.owner = req.user._id;
    }

    if (req.user.role === 'user') {
      query.status = 'approved';
    }

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, category, price, inStock, imageUrl, status } =
      req.body;

    // Sellers can only modify their own products
    if (req.user.role === 'seller' && product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (inStock !== undefined) product.inStock = inStock;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    // Only admin can directly change status here
    if (status !== undefined && req.user.role === 'admin') {
      product.status = status;
    }

    await product.save();

    return res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (
      req.user.role === 'seller' &&
      product.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await product.deleteOne();
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

