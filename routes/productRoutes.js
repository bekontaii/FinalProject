const express = require('express');
const { body } = require('express-validator');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category')
      .isIn(['clothes', 'gadgets', 'cosmetics'])
      .withMessage('Category must be clothes, gadgets, or cosmetics'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
  ],
  createProduct
);

router.get('/', protect, getProducts);

router.get('/:id', protect, getProductById);

router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  [
    body('name').optional().notEmpty(),
    body('category')
      .optional()
      .isIn(['clothes', 'gadgets', 'cosmetics'])
      .withMessage('Category must be clothes, gadgets, or cosmetics'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be >= 0'),
  ],
  updateProduct
);

router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;

