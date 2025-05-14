const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sign } = require('../utils/jwt');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { nickname, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nickname, passwordHash: hash });
    const token = sign({ userId: user._id, nickname: user.nickname });
    res.status(201).json({
      user: { id: user._id, nickname: user.nickname },
      token
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ nickname });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = sign({ userId: user._id, nickname: user.nickname });
    res.json({
      user: { id: user._id, nickname: user.nickname },
      token
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
