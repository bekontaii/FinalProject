const express = require('express');
const {
  getAllProducts,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/products', protect, authorize('admin'), getAllProducts);

module.exports = router;

