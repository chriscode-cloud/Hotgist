const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFirestore, admin } = require('../config/firebase');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();
const db = getFirestore();

// Validation rules
const createPostValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Post content must be between 1 and 1000 characters'),
  body('authorId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Author ID is required'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
];

// POST /posts - Create a new post
router.post('/', createPostValidation, validateRequest, async (req, res) => {
  try {
    const { content, authorId, imageUrl } = req.body;

    // Create post data
    const postData = {
      content: content.trim(),
      authorId,
      imageUrl: imageUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reactionCount: 0,
      commentCount: 0
    };

    // Add post to Firestore
    const docRef = await db.collection('posts').add(postData);

    // Get the created post with ID
    const createdPost = {
      id: docRef.id,
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: createdPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post',
      message: error.message
    });
  }
});

// GET /posts - Fetch all posts with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20, 
      lastDocId, 
      orderBy = 'createdAt', 
      orderDirection = 'desc' 
    } = req.query;

    // Validate limit
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 posts per request

    let query = db.collection('posts')
      .orderBy(orderBy, orderDirection)
      .limit(limitNum);

    // Handle pagination
    if (lastDocId) {
      const lastDoc = await db.collection('posts').doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const posts = [];

    // Process each post
    for (const doc of snapshot.docs) {
      const postData = doc.data();
      
      // Get author information
      let authorData = null;
      if (postData.authorId) {
        const authorDoc = await db.collection('users').doc(postData.authorId).get();
        if (authorDoc.exists) {
          authorData = {
            uid: authorData.id,
            displayName: authorDoc.data().displayName || 'Anonymous',
            photoURL: authorDoc.data().photoURL || null
          };
        }
      }

      // Get reaction counts
      const reactionsSnapshot = await db.collection('reactions')
        .where('postId', '==', doc.id)
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

      // Get comment count
      const commentsSnapshot = await db.collection('comments')
        .where('postId', '==', doc.id)
        .get();

      posts.push({
        id: doc.id,
        content: postData.content,
        imageUrl: postData.imageUrl,
        authorId: postData.authorId,
        author: authorData,
        reactions,
        reactionCount: Object.values(reactions).reduce((sum, count) => sum + count, 0),
        commentCount: commentsSnapshot.size,
        createdAt: postData.createdAt?.toDate() || new Date(),
        updatedAt: postData.updatedAt?.toDate() || new Date()
      });
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          hasMore: snapshot.docs.length === limitNum,
          lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
          limit: limitNum,
          count: posts.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      message: error.message
    });
  }
});

// GET /posts/:id - Get a single post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const postDoc = await db.collection('posts').doc(id).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const postData = postDoc.data();

    // Get author information
    let authorData = null;
    if (postData.authorId) {
      const authorDoc = await db.collection('users').doc(postData.authorId).get();
      if (authorDoc.exists) {
        authorData = {
          uid: authorDoc.id,
          displayName: authorDoc.data().displayName || 'Anonymous',
          photoURL: authorDoc.data().photoURL || null
        };
      }
    }

    // Get reaction counts
    const reactionsSnapshot = await db.collection('reactions')
      .where('postId', '==', id)
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

    // Get comment count
    const commentsSnapshot = await db.collection('comments')
      .where('postId', '==', id)
      .get();

    const post = {
      id: postDoc.id,
      content: postData.content,
      imageUrl: postData.imageUrl,
      authorId: postData.authorId,
      author: authorData,
      reactions,
      reactionCount: Object.values(reactions).reduce((sum, count) => sum + count, 0),
      commentCount: commentsSnapshot.size,
      createdAt: postData.createdAt?.toDate() || new Date(),
      updatedAt: postData.updatedAt?.toDate() || new Date()
    };

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post',
      message: error.message
    });
  }
});

module.exports = router;
