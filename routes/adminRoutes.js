const express = require('express');
const { body } = require('express-validator');
const {
  getAllProducts,
  updateProductStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/products', protect, authorize('admin'), getAllProducts);

router.put(
  '/products/:id/status',
  protect,
  authorize('admin'),
  [
    body('status')
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Status must be pending, approved or rejected'),
  ],
  updateProductStatus
);

module.exports = router;

