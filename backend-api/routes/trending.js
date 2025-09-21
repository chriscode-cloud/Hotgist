const express = require('express');
const { getFirestore } = require('../config/firebase');

const router = express.Router();
const db = getFirestore();

// GET /trending - Fetch top 10 trending posts by reaction count
router.get('/', async (req, res) => {
  try {
    const { limit = 10, timeRange = '24h' } = req.query;

    // Validate limit
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 posts

    // Calculate time range
    let timeFilter;
    const now = new Date();
    
    switch (timeRange) {
      case '1h':
        timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
    }

    // Get posts from the specified time range, ordered by reaction count
    let query = db.collection('posts')
      .where('createdAt', '>=', timeFilter)
      .orderBy('createdAt', 'desc')
      .orderBy('reactionCount', 'desc')
      .limit(limitNum * 2); // Get more to account for filtering

    const snapshot = await query.get();
    const posts = [];

    // Process each post
    for (const doc of snapshot.docs) {
      const postData = doc.data();
      
      // Skip posts with no reactions for trending
      if (postData.reactionCount === 0) continue;

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

      // Get detailed reaction counts
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

      // Calculate trending score (reactions per hour since creation)
      const createdAt = postData.createdAt?.toDate() || new Date();
      const hoursSinceCreation = Math.max(1, (now - createdAt) / (1000 * 60 * 60));
      const trendingScore = postData.reactionCount / hoursSinceCreation;

      posts.push({
        id: doc.id,
        content: postData.content,
        imageUrl: postData.imageUrl,
        authorId: postData.authorId,
        author: authorData,
        reactions,
        reactionCount: postData.reactionCount,
        commentCount: commentsSnapshot.size,
        trendingScore: Math.round(trendingScore * 100) / 100,
        createdAt: createdAt,
        updatedAt: postData.updatedAt?.toDate() || new Date()
      });
    }

    // Sort by trending score and limit results
    const trendingPosts = posts
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limitNum);

    // Get additional trending metrics
    const totalPosts = snapshot.size;
    const postsWithReactions = posts.length;
    const totalReactions = posts.reduce((sum, post) => sum + post.reactionCount, 0);

    res.json({
      success: true,
      data: {
        posts: trendingPosts,
        metadata: {
          timeRange,
          limit: limitNum,
          totalPosts,
          postsWithReactions,
          totalReactions,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending posts',
      message: error.message
    });
  }
});

// GET /trending/hashtags - Get trending hashtags (if implemented)
router.get('/hashtags', async (req, res) => {
  try {
    // This endpoint can be implemented if hashtags are added to posts
    res.json({
      success: true,
      message: 'Hashtag trending feature not yet implemented',
      data: {
        hashtags: []
      }
    });
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending hashtags',
      message: error.message
    });
  }
});

// GET /trending/users - Get trending users by total reactions
router.get('/users', async (req, res) => {
  try {
    const { limit = 10, timeRange = '7d' } = req.query;

    // Calculate time range
    let timeFilter;
    const now = new Date();
    
    switch (timeRange) {
      case '24h':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get posts from the time range
    const postsSnapshot = await db.collection('posts')
      .where('createdAt', '>=', timeFilter)
      .get();

    // Aggregate reactions by user
    const userStats = {};

    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();
      const authorId = postData.authorId;

      if (!userStats[authorId]) {
        userStats[authorId] = {
          userId: authorId,
          postCount: 0,
          totalReactions: 0,
          totalComments: 0
        };
      }

      userStats[authorId].postCount++;
      userStats[authorId].totalReactions += postData.reactionCount || 0;

      // Get comment count for this post
      const commentsSnapshot = await db.collection('comments')
        .where('postId', '==', postDoc.id)
        .get();
      userStats[authorId].totalComments += commentsSnapshot.size;
    }

    // Get user details and sort by total reactions
    const trendingUsers = [];
    for (const [userId, stats] of Object.entries(userStats)) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        trendingUsers.push({
          ...stats,
          displayName: userData.displayName || 'Anonymous',
          photoURL: userData.photoURL || null,
          bio: userData.bio || ''
        });
      }
    }

    const sortedUsers = trendingUsers
      .sort((a, b) => b.totalReactions - a.totalReactions)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        users: sortedUsers,
        metadata: {
          timeRange,
          limit: parseInt(limit),
          totalUsers: sortedUsers.length,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching trending users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending users',
      message: error.message
    });
  }
});

module.exports = router;
