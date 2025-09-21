const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore, admin } = require('../config/firebase');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();
const db = getFirestore();

// Validation rules
const addReactionValidation = [
  body('postId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Post ID is required'),
  body('userId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('User ID is required'),
  body('type')
    .isIn(['fire', 'laugh', 'shock'])
    .withMessage('Reaction type must be one of: fire, laugh, shock')
];

// POST /reactions - Add reaction to a post
router.post('/', addReactionValidation, validateRequest, async (req, res) => {
  try {
    const { postId, userId, type } = req.body;

    // Check if post exists
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user already has a reaction on this post
    const existingReactionQuery = await db.collection('reactions')
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    let result;
    let message;

    if (!existingReactionQuery.empty) {
      // User already has a reaction
      const existingReaction = existingReactionQuery.docs[0];
      const existingType = existingReaction.data().type;

      if (existingType === type) {
        // Same reaction - remove it
        await existingReaction.ref.delete();
        result = { action: 'removed', type: null };
        message = 'Reaction removed successfully';
      } else {
        // Different reaction - update it
        await existingReaction.ref.update({
          type,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        result = { action: 'updated', type };
        message = 'Reaction updated successfully';
      }
    } else {
      // No existing reaction - add new one
      await db.collection('reactions').add({
        postId,
        userId,
        type,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      result = { action: 'added', type };
      message = 'Reaction added successfully';
    }

    // Get updated reaction counts for the post
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .get();

    const reactions = {
      fire: 0,
      laugh: 0,
      shock: 0
    };

    reactionsSnapshot.docs.forEach(reactionDoc => {
      const reactionData = reactionDoc.data();
      if (reactions[reactionData.type] !== undefined) {
        reactions[reactionData.type]++;
      }
    });

    // Update post reaction count
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    await db.collection('posts').doc(postId).update({
      reactionCount: totalReactions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message,
      data: {
        postId,
        userId,
        action: result.action,
        userReaction: result.type,
        reactions,
        totalReactions
      }
    });

  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to handle reaction',
      message: error.message
    });
  }
});

// GET /reactions/:postId - Get reactions for a specific post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query; // Optional: to check if user has reacted

    // Check if post exists
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Get all reactions for the post
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .get();

    const reactions = {
      fire: 0,
      laugh: 0,
      shock: 0
    };

    const reactionDetails = [];
    let userReaction = null;

    reactionsSnapshot.docs.forEach(reactionDoc => {
      const reactionData = reactionDoc.data();
      if (reactions[reactionData.type] !== undefined) {
        reactions[reactionData.type]++;
      }
      
      // Check if this is the user's reaction
      if (userId && reactionData.userId === userId) {
        userReaction = reactionData.type;
      }

      reactionDetails.push({
        id: reactionDoc.id,
        userId: reactionData.userId,
        type: reactionData.type,
        createdAt: reactionData.createdAt?.toDate() || new Date()
      });
    });

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      data: {
        postId,
        reactions,
        totalReactions,
        userReaction,
        details: reactionDetails
      }
    });

  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reactions',
      message: error.message
    });
  }
});

// DELETE /reactions/:postId - Remove user's reaction from a post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Find and delete user's reaction
    const userReactionQuery = await db.collection('reactions')
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (userReactionQuery.empty) {
      return res.status(404).json({
        success: false,
        error: 'Reaction not found'
      });
    }

    await userReactionQuery.docs[0].ref.delete();

    // Get updated reaction counts
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .get();

    const reactions = {
      fire: 0,
      laugh: 0,
      shock: 0
    };

    reactionsSnapshot.docs.forEach(reactionDoc => {
      const reactionData = reactionDoc.data();
      if (reactions[reactionData.type] !== undefined) {
        reactions[reactionData.type]++;
      }
    });

    // Update post reaction count
    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    await db.collection('posts').doc(postId).update({
      reactionCount: totalReactions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Reaction removed successfully',
      data: {
        postId,
        userId,
        reactions,
        totalReactions
      }
    });

  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove reaction',
      message: error.message
    });
  }
});

module.exports = router;
