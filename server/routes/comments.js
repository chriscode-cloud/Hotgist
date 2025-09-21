const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const optionalAuth = require('../middleware/optionalAuth');
const { db } = require('../config/firebase');

// ==================================
// Get comments for a specific post
// ==================================
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const snapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'asc')
      .get();

    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ==================================
// Add a comment (protected)
// ==================================
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const newComment = {
      postId,
      text: text.trim(),
      userId: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('comments').add(newComment);

    res.status(201).json({ id: docRef.id, ...newComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ==================================
// Delete a comment (protected)
// ==================================
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const commentDoc = await db.collection('comments').doc(commentId).get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    if (commentData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await db.collection('comments').doc(commentId).delete();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
