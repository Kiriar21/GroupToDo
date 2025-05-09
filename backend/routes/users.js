const express = require('express');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('nickname createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const { nickname } = req.query;
    if (!nickname) return res.json([]);
    const users = await User.find({ nickname: new RegExp(nickname, 'i') }).select('nickname');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;