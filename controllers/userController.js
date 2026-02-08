const { validationResult } = require('express-validator');
const User = require('../models/User');

const getProfile = async (req, res) => {
  return res.json(req.user);
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };

