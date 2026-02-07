const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  [body('name').optional().notEmpty().withMessage('Name cannot be empty')],
  updateProfile
);

module.exports = router;

