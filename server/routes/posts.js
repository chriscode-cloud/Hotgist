const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const optionalAuth = require('../middleware/optionalAuth'); // ✅ Added
const { db } = require('../config/firebase');

// ===============================
// Get all posts with pagination
// ===============================
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, lastDocId } = req.query;
    let query = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (lastDocId) {
      const lastDoc = await db.collection('posts').doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const posts = [];

    for (const doc of snapshot.docs) {
      const postData = doc.data();

      // Get author information
      const authorDoc = await db.collection('users').doc(postData.authorId).get();
      const authorData = authorDoc.exists ? authorDoc.data() : null;

      // Get reaction counts
      const reactionsSnapshot = await db.collection('reactions')
        .where('postId', '==', doc.id)
        .get();

      const reactions = { fire: 0, laugh: 0, shock: 0 };
      reactionsSnapshot.docs.forEach(reactionDoc => {
        const reactionData = reactionDoc.data();
        if (reactions[reactionData.type] !== undefined) {
          reactions[reactionData.type]++;
        }
      });

      // Check if current user has reacted
      let userReaction = null;
      if (req.user) {
        const userReactionSnapshot = await db.collection('reactions')
          .where('postId', '==', doc.id)
          .where('userId', '==', req.user.uid)
          .limit(1)
          .get();

        if (!userReactionSnapshot.empty) {
          userReaction = userReactionSnapshot.docs[0].data().type;
        }
      }

      // Get comment count
      const commentsSnapshot = await db.collection('comments')
        .where('postId', '==', doc.id)
        .get();

      posts.push({
        id: doc.id,
        ...postData,
        author: authorData ? {
          uid: authorData.uid,
          displayName: authorData.displayName,
          photoURL: authorData.photoURL
        } : null,
        reactions,
        userReaction,
        commentCount: commentsSnapshot.size
      });
    }

    res.json({
      posts,
      hasMore: snapshot.docs.length === parseInt(limit),
      lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// ===============================
// Get single post
// ===============================
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    // Get author information
    const authorDoc = await db.collection('users').doc(postData.authorId).get();
    const authorData = authorDoc.exists ? authorDoc.data() : null;

    // Get reaction counts
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .get();

    const reactions = { fire: 0, laugh: 0, shock: 0 };
    reactionsSnapshot.docs.forEach(reactionDoc => {
      const reactionData = reactionDoc.data();
      if (reactions[reactionData.type] !== undefined) {
        reactions[reactionData.type]++;
      }
    });

    // Check if current user has reacted
    let userReaction = null;
    if (req.user) {
      const userReactionSnapshot = await db.collection('reactions')
        .where('postId', '==', postId)
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();

      if (!userReactionSnapshot.empty) {
        userReaction = userReactionSnapshot.docs[0].data().type;
      }
    }

    // Get comment count
    const commentsSnapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .get();

    res.json({
      id: postDoc.id,
      ...postData,
      author: authorData ? {
        uid: authorData.uid,
        displayName: authorData.displayName,
        photoURL: authorData.photoURL
      } : null,
      reactions,
      userReaction,
      commentCount: commentsSnapshot.size
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// ===============================
// Create new post (Protected)
// ===============================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Post content too long (max 1000 characters)' });
    }

    const postData = {
      content: content.trim(),
      imageUrl: imageUrl || null,
      authorId: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('posts').add(postData);

    // Fetch author info
    const authorDoc = await db.collection('users').doc(req.user.uid).get();
    const authorData = authorDoc.exists ? authorDoc.data() : null;

    res.status(201).json({
      id: docRef.id,
      ...postData,
      author: authorData ? {
        uid: authorData.uid,
        displayName: authorData.displayName,
        photoURL: authorData.photoURL
      } : null,
      reactions: { fire: 0, laugh: 0, shock: 0 },
      userReaction: null,
      commentCount: 0
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ===============================
// Update post (Protected)
// ===============================
router.put('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, imageUrl } = req.body;

    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    if (postData.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const updateData = {
      content: content.trim(),
      imageUrl: imageUrl || null,
      updatedAt: new Date()
    };

    await db.collection('posts').doc(postId).update(updateData);

    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// ===============================
// Delete post (Protected)
// ===============================
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    if (postData.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    const batch = db.batch();

    // Delete the post
    batch.delete(db.collection('posts').doc(postId));

    // Delete comments
    const commentsSnapshot = await db.collection('comments')
      .where('postId', '==', postId)
      .get();

    commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete reactions
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', postId)
      .get();

    reactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
