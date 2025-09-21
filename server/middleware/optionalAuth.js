const admin = require('firebase-admin');

/**
 * Middleware for optional Firebase authentication.
 * If a token is provided, verify it and attach user to req.user.
 * If no token is provided, continue without throwing an error.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, proceed as guest
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null; // explicitly set user to null
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    next();
  } catch (error) {
    console.warn('Optional authentication failed. Continuing as guest:', error.message);
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;
