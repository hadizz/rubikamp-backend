const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Bearer token jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking admin status', error: error.message });
  }
};

module.exports = {
  verifyToken,
  requireAdmin
}; 