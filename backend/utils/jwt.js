const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRES_IN = '7d' } = process.env;
if (!JWT_SECRET) {
  throw new Error('⚠️ Missing JWT_SECRET in environment variables');
}

exports.sign = payload =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

exports.verify = token => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};