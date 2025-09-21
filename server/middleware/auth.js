const admin = require('firebase-admin');

/**
 * Firebase Authentication Middleware
 * Verifies the Firebase ID token sent in the Authorization header.
 * If valid, attaches the user info to req.user.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided or token format is invalid' });
    }

    // 2. Extract the token
    const token = authHeader.split(' ')[1];

    // 3. Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 4. Attach decoded token data to the request object
    req.user = decodedToken;

    // 5. Proceed to next middleware or route handler
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
