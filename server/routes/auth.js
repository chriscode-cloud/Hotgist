const express = require('express');
const router = express.Router();

// Controllers
const { registerUser, loginUser } = require('../controllers/authController');

// Middleware
const authenticateToken = require('../middleware/authenticateToken');

// Firebase Admin
const admin = require('firebase-admin');
const db = admin.firestore();
const auth = admin.auth();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      message: 'User data fetched successfully',
      uid: req.user.uid,
      email: req.user.email,
      ...userDoc.data(),
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

/**
 * @route   POST /api/auth/profile
 * @desc    Create or update user profile
 */
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, photoURL, bio } = req.body;
    const userRef = db.collection('users').doc(req.user.uid);

    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      displayName: displayName || req.user.name || 'Anonymous User',
      photoURL: photoURL || req.user.picture || null,
      bio: bio || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.set(userData, { merge: true });

    res.json({
      message: 'Profile updated successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @route   GET /api/auth/user/:userId
 * @desc    Get user by ID (public endpoint, hides email)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.email; // Hide sensitive info

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account and all associated data
 */
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Prepare batch deletion
    const batch = db.batch();

    // Delete user's posts
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();

    postsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete user's comments
    const commentsSnapshot = await db.collection('comments')
      .where('authorId', '==', userId)
      .get();

    commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete user's reactions
    const reactionsSnapshot = await db.collection('reactions')
      .where('userId', '==', userId)
      .get();

    reactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Commit all batched deletes
    await batch.commit();

    // Delete user profile
    await db.collection('users').doc(userId).delete();

    // Delete user from Firebase Authentication
    await auth.deleteUser(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
