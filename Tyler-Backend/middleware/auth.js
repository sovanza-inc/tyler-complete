const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided or invalid token format');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Add userId from payload
    req.userId = decoded.userId;
    console.log('User ID set:', req.userId);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
