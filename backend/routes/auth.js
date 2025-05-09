const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { nickname, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nickname, passwordHash: hash });
    req.session.userId = user._id;
    res.json({ user: { id: user._id, nickname: user.nickname } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res) => {
  const { nickname, password } = req.body;
  const user = await User.findOne({ nickname });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await user.verifyPassword(password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  req.session.userId = user._id;
  res.json({ user: { id: user._id, nickname: user.nickname } });
});

router.post('/logout', isAuthenticated, (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});

router.get('/session', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, userId: req.session.userId });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;