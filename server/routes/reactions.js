const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { addReaction, removeReaction } = require('../controllers/reactionsController'); // ✅ correct import

// Add a reaction
router.post('/', authenticateToken, addReaction);

// Remove a reaction
router.delete('/:reactionId', authenticateToken, removeReaction);

module.exports = router;



// Add or update reaction
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    
    // Validate reaction type
    const validTypes = ['fire', 'laugh', 'shock'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    // Check if post exists
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const userId = req.user.uid;
    
    // Check if user already has a reaction on this post
    const existingReactionSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!existingReactionSnapshot.empty) {
      // Update existing reaction
      const existingReaction = existingReactionSnapshot.docs[0];
      const existingData = existingReaction.data();
      
      if (existingData.type === type) {
        // Same reaction - remove it
        await existingReaction.ref.delete();
        
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
        
        res.json({
          message: 'Reaction removed',
          reactions,
          userReaction: null
        });
      } else {
        // Different reaction - update it
        await existingReaction.ref.update({
          type,
          updatedAt: new Date()
        });
        
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
        
        res.json({
          message: 'Reaction updated',
          reactions,
          userReaction: type
        });
      }
    } else {
      // Create new reaction
      await db.collection('reactions').add({
        postId,
        userId,
        type,
        createdAt: new Date()
      });
      
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
      
      res.json({
        message: 'Reaction added',
        reactions,
        userReaction: type
      });
    }
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Get reactions for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .get();
    
    const reactions = {
      fire: 0,
      laugh: 0,
      shock: 0
    };
    
    const reactionDetails = [];
    
    reactionsSnapshot.docs.forEach(reactionDoc => {
      const reactionData = reactionDoc.data();
      if (reactions[reactionData.type] !== undefined) {
        reactions[reactionData.type]++;
        reactionDetails.push({
          id: reactionDoc.id,
          ...reactionData
        });
      }
    });
    
    res.json({
      reactions,
      details: reactionDetails
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ error: 'Failed to get reactions' });
  }
});

// Remove reaction
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.uid;
    
    // Find and delete user's reaction
    const reactionSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (reactionSnapshot.empty) {
      return res.status(404).json({ error: 'Reaction not found' });
    }
    
    await reactionSnapshot.docs[0].ref.delete();
    
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
    
    res.json({
      message: 'Reaction removed',
      reactions,
      userReaction: null
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

module.exports = router;
