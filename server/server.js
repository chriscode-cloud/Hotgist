/**
 * HotGist Server - Simple Campus Social Platform Backend
 *
 * This server provides API endpoints for the HotGist mobile app.
 * Simple file-based storage for posts and campuses with no authentication required.
 *
 * Author: HotGist Development Team
 * Version: 1.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// ==========================================
// SERVER CONFIGURATION
// ==========================================

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE SETUP
// ==========================================

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow requests from localhost (web development)
    if (origin.startsWith('http://localhost:') || 
        origin.startsWith('https://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow requests from Expo development server
    if (origin.includes('expo.dev') || origin.includes('exp.host')) {
      return callback(null, true);
    }
    
    // Allow requests from your local network IP
    if (origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }
    
    // For production, you might want to restrict this further
    // For now, we'll allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, you might want to be more restrictive
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// DATA STORAGE CONFIGURATION
// ==========================================

const POSTS_DIR = path.join(__dirname, 'data', 'posts');
const CAMPUSES_FILE = path.join(__dirname, 'data', 'campuses.json');

let campusPostsData = {};
let campusesData = { campuses: [] };

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Loads all persistent data from JSON files into memory
 * Initializes campuses and campus-specific posts data
 * Creates default files if they don't exist
 * 
 * @description This function is called once at server startup to load all data
 * @throws {Error} When unable to read or parse JSON files
 */
function loadPersistentData() {
  console.log('📂 Loading persistent data from files...');

  try {
    // Load campuses data
    if (fs.existsSync(CAMPUSES_FILE)) {
      const campusesContent = fs.readFileSync(CAMPUSES_FILE, 'utf8');
      if (campusesContent && campusesContent.trim()) {
        campusesData = JSON.parse(campusesContent);
        console.log(`✅ Loaded ${campusesData.campuses.length} campuses from file`);
      }
    } else {
      // Initialize with Ghanaian universities
      campusesData = {
        campuses: [
          { id: "GCTU", name: "Ghana Communication Technology University", code: "GCTU", location: "Accra" },
          { id: "UG", name: "University of Ghana", code: "UG", location: "Accra" },
          { id: "KNUST", name: "Kwame Nkrumah University of Science and Technology", code: "KNUST", location: "Kumasi" },
          { id: "UCC", name: "University of Cape Coast", code: "UCC", location: "Cape Coast" },
          { id: "UPSA", name: "University of Professional Studies", code: "UPSA", location: "Accra" },
          { id: "UENR", name: "University of Energy and Natural Resources", code: "UENR", location: "Sunyani" },
          { id: "UMaT", name: "University of Mines and Technology", code: "UMaT", location: "Tarkwa" },
          { id: "UDS", name: "University for Development Studies", code: "UDS", location: "Tamale" }
        ]
      };
      saveCampusesData();
      console.log('🆕 Created initial campuses file with Ghanaian universities');
    }

    // Load posts data for each campus
    loadAllCampusPosts();

  } catch (error) {
    console.error('❌ Error loading persistent data:', error);
  }
}

/**
 * Loads posts data for all campuses from individual JSON files
 * Creates empty post files for campuses that don't have any posts yet
 * 
 * @description Each campus has its own JSON file in the format: {campusId}.json
 * @throws {Error} When unable to read campus post files
 */
function loadAllCampusPosts() {
  console.log('📝 Loading campus-specific posts...');

  // Initialize campus posts data structure
  campusPostsData = {};

  // Load General posts first
  const generalFile = path.join(POSTS_DIR, 'General.json');
  if (fs.existsSync(generalFile)) {
    try {
      const generalContent = fs.readFileSync(generalFile, 'utf8');
      if (generalContent && generalContent.trim()) {
        campusPostsData['General'] = JSON.parse(generalContent);
        console.log(`✅ Loaded ${campusPostsData['General'].posts.length} general posts`);
      }
    } catch (error) {
      console.error('❌ Error loading general posts:', error);
    }
  }

  // Load posts for each campus
  campusesData.campuses.forEach(campus => {
    const campusFile = path.join(POSTS_DIR, `${campus.id}.json`);
    if (fs.existsSync(campusFile)) {
      try {
        const campusContent = fs.readFileSync(campusFile, 'utf8');
        if (campusContent && campusContent.trim()) {
          campusPostsData[campus.id] = JSON.parse(campusContent);
          console.log(`✅ Loaded ${campusPostsData[campus.id].posts.length} posts for ${campus.id}`);
        } else {
          campusPostsData[campus.id] = { posts: [] };
        }
      } catch (error) {
        console.error(`❌ Error loading posts for ${campus.id}:`, error);
        campusPostsData[campus.id] = { posts: [] };
      }
    } else {
      // Create empty posts file for campus if it doesn't exist
      campusPostsData[campus.id] = { posts: [] };
      saveCampusPosts(campus.id);
      console.log(`🆕 Created empty posts file for ${campus.id}`);
    }
  });

  const totalPosts = Object.values(campusPostsData).reduce((total, campusData) => total + campusData.posts.length, 0);
  console.log(`📊 Total posts loaded across all campuses: ${totalPosts}`);
}

/**
 * Saves posts data for a specific campus to its JSON file
 * Creates the posts directory if it doesn't exist
 * 
 * @param {string} campusId - The ID of the campus to save posts for
 * @description Saves data to server/data/posts/{campusId}.json
 * @throws {Error} When unable to write to file system
 */
function saveCampusPosts(campusId) {
  try {
    // Ensure posts directory exists
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    const campusFile = path.join(POSTS_DIR, `${campusId}.json`);
    const dataToSave = campusPostsData[campusId] || { posts: [] };

    fs.writeFileSync(campusFile, JSON.stringify(dataToSave, null, 2));
    console.log(`💾 Posts data saved for campus: ${campusId} (${dataToSave.posts.length} posts)`);
  } catch (error) {
    console.error(`❌ Error saving posts data for campus ${campusId}:`, error);
  }
}

/**
 * Saves campuses data to the campuses.json file
 * Creates the data directory if it doesn't exist
 * 
 * @description Saves university/college information to server/data/campuses.json
 * @throws {Error} When unable to write to file system
 */
function saveCampusesData() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CAMPUSES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(CAMPUSES_FILE, JSON.stringify(campusesData, null, 2));
    console.log('💾 Campuses data saved to file');
  } catch (error) {
    console.error('❌ Error saving campuses data:', error);
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Calculates an enhanced trending score for a post
 * Combines engagement metrics with time-based decay
 * 
 * @param {Object} post - The post object
 * @param {number} [post.likes=0] - Number of likes
 * @param {Array} [post.comments=[]] - Array of comments
 * @param {string} post.timestamp - Post creation timestamp
 * @returns {number} Trending score (higher = more trending)
 * 
 * Algorithm:
 * - Base score: likes + (comments * 2) [comments weighted higher]
 * - Time decay: exponential decay over 24 hours
 * - Recency boost: newer posts get slight advantage
 * - Engagement velocity: posts with recent activity score higher
 */
function calculateTrendingScore(post) {
  const now = new Date();
  const postTime = new Date(post.timestamp);
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  // Base engagement score (comments weighted more than likes)
  const likes = post.likes || 0;
  const commentCount = post.comments ? post.comments.length : 0;
  const baseScore = likes + (commentCount * 2);
  
  // Time decay factor (exponential decay over 24 hours)
  // Posts lose 50% relevance every 12 hours
  const decayFactor = Math.pow(0.5, ageInHours / 12);
  
  // Recency boost for very new posts (first 2 hours)
  const recencyBoost = ageInHours < 2 ? (2 - ageInHours) * 0.5 : 0;
  
  // Engagement velocity (recent comments boost score)
  let velocityBoost = 0;
  if (post.comments && post.comments.length > 0) {
    const recentComments = post.comments.filter(comment => {
      const commentAge = (now - new Date(comment.timestamp)) / (1000 * 60 * 60);
      return commentAge < 6; // Comments in last 6 hours
    });
    velocityBoost = recentComments.length * 1.5;
  }
  
  // Calculate final trending score
  const trendingScore = (baseScore + recencyBoost + velocityBoost) * decayFactor;
  
  // Minimum score to prevent negative values
  return Math.max(trendingScore, 0.1);
}

// ==========================================
// INITIALIZATION
// ==========================================

console.log('🚀 Starting HotGist Server...');
loadPersistentData();

// ==========================================
// API ROUTES
// ==========================================

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new anonymous post
 *     description: Creates a new post in the specified campus or general feed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 500
 *                 description: Post content (max 500 characters)
 *               campus:
 *                 type: string
 *                 description: Campus ID (defaults to 'General')
 *               authorName:
 *                 type: string
 *                 description: Anonymous author name (defaults to 'Anonymous')
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 * 
 * Creates a new post in the system
 * @param {Object} req.body - Post data
 * @param {string} req.body.content - Post content (required, max 500 chars)
 * @param {string} [req.body.campus='General'] - Target campus
 * @param {string} [req.body.authorName='Anonymous'] - Author name
 */
app.post('/api/posts', (req, res) => {
  try {
    const { content, campus = 'General', authorName } = req.body;

    // Input validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Post content is required and cannot be empty'
      });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({
        error: 'Post content must be less than 500 characters'
      });
    }

    // Validate campus if provided
    if (campus !== 'General') {
      const campusExists = campusesData.campuses.some(c => c.id === campus);
      if (!campusExists) {
        return res.status(400).json({
          error: 'Invalid campus selected'
        });
      }
    }

    // Initialize campus posts data if not exists
    if (!campusPostsData[campus]) {
      campusPostsData[campus] = { posts: [] };
    }

    // Create the new post
    const newPost = {
      id: uuidv4(),
      content: content.trim(),
      campus: campus,
      authorName: authorName || 'Anonymous',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    // Add post to the beginning of the array (newest first)
    campusPostsData[campus].posts.unshift(newPost);
    saveCampusPosts(campus);

    console.log(`✅ Anonymous post created at ${campus} (${newPost.id})`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({
      error: 'Internal server error occurred while creating post'
    });
  }
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get posts with filtering and pagination
 *     description: Retrieves posts with optional campus filtering, trending sort, and pagination
 *     parameters:
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *         description: Filter by campus ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip (pagination)
 *       - in: query
 *         name: trending
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Sort by engagement score instead of timestamp
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       500:
 *         description: Server error
 * 
 * Retrieves posts with optional campus filtering, pagination, and trending sort
 * @param {string} [req.query.campus] - Campus filter
 * @param {number} [req.query.limit=50] - Results limit
 * @param {number} [req.query.offset=0] - Pagination offset
 * @param {string} [req.query.trending='false'] - Sort by engagement
 */
app.get('/api/posts', (req, res) => {
  try {
    const { campus, limit = 50, offset = 0, trending = 'false' } = req.query;

    console.log(`📋 Posts request - campus: ${campus || 'all'}, limit: ${limit}, offset: ${offset}, trending: ${trending}`);

    let allPosts = [];

    // If specific campus requested, get posts from that campus only
    if (campus && campus !== 'all') {
      const campusData = campusPostsData[campus];
      if (campusData) {
        allPosts = [...campusData.posts];
        console.log(`🔍 Filtered to ${allPosts.length} posts for campus: ${campus}`);
      } else {
        allPosts = [];
      }
    } else {
      // Get posts from all campuses
      Object.keys(campusPostsData).forEach(campusId => {
        const campusData = campusPostsData[campusId];
        if (campusData && campusData.posts) {
          allPosts = allPosts.concat(campusData.posts.map(post => ({ ...post, campus: campusId })));
        }
      });
      console.log(`📋 Retrieved posts from all campuses (${allPosts.length} total)`);
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    let paginatedPosts = allPosts.slice(startIndex, endIndex);

    // Sort posts based on trending parameter
    if (trending === 'true') {
      // Enhanced trending algorithm with time decay
      paginatedPosts.sort((a, b) => {
        const scoreA = calculateTrendingScore(a);
        const scoreB = calculateTrendingScore(b);
        return scoreB - scoreA; // Higher score first (trending)
      });
      console.log(`🔥 Sorted ${paginatedPosts.length} posts by enhanced trending score`);
    } else {
      // Sort by timestamp (newest first)
      paginatedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      console.log(`🕐 Sorted ${paginatedPosts.length} posts by timestamp`);
    }

    console.log(`✅ Returning ${paginatedPosts.length} posts (${allPosts.length} total)`);

    res.json({
      success: true,
      count: paginatedPosts.length,
      total: allPosts.length,
      campus: campus || 'all',
      trending: trending === 'true',
      posts: paginatedPosts
    });

  } catch (error) {
    console.error('❌ Error retrieving posts:', error);
    res.status(500).json({
      error: 'Internal server error occurred while retrieving posts'
    });
  }
});

/**
 * GET /api/posts/:id
 * Retrieves a specific post by its ID
 */
app.get('/api/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the post across all campus data
    let foundPost = null;
    let foundCampus = null;

    for (const [campusId, campusData] of Object.entries(campusPostsData)) {
      const post = campusData.posts.find(p => p.id === id);
      if (post) {
        foundPost = post;
        foundCampus = campusId;
        break;
      }
    }

    if (!foundPost) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      post: {
        ...foundPost,
        campus: foundCampus
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving specific post:', error);
    res.status(500).json({
      error: 'Internal server error occurred while retrieving post'
    });
  }
});

/**
 * POST /api/posts/:id/like
 * Likes or unlikes a post
 */
app.post('/api/posts/:id/like', (req, res) => {
  try {
    const { id } = req.params;

    // Find the post across all campus data
    let targetPost = null;
    let targetCampus = null;
    let postIndex = -1;

    for (const [campusId, campusData] of Object.entries(campusPostsData)) {
      const index = campusData.posts.findIndex(p => p.id === id);
      if (index !== -1) {
        targetPost = campusData.posts[index];
        targetCampus = campusId;
        postIndex = index;
        break;
      }
    }

    if (!targetPost) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Simple like toggle (no user tracking)
    targetPost.likes = (targetPost.likes || 0) + 1;
    const action = 'liked';

    // Save the updated campus data
    campusPostsData[targetCampus].posts[postIndex] = targetPost;
    saveCampusPosts(targetCampus);

    console.log(`👍 Post ${action} in campus ${targetCampus} (anonymous like)`);

    res.json({
      success: true,
      message: `Post ${action}`,
      likesCount: targetPost.likes,
      isLiked: true
    });

  } catch (error) {
    console.error('❌ Error updating post like:', error);
    res.status(500).json({
      error: 'Internal server error occurred while updating like'
    });
  }
});

/**
 * @swagger
 * /api/posts/{id}/comment:
 *   post:
 *     summary: Add a comment to a post
 *     description: Adds an anonymous comment to the specified post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 300
 *                 description: Comment content (max 300 characters)
 *               authorName:
 *                 type: string
 *                 description: Comment author name (defaults to 'Anonymous')
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 * 
 * Adds a comment to a post
 * @param {string} req.params.id - Post ID
 * @param {Object} req.body - Comment data
 * @param {string} req.body.content - Comment content (required, max 300 chars)
 * @param {string} [req.body.authorName='Anonymous'] - Comment author
 */
app.post('/api/posts/:id/comment', (req, res) => {
  try {
    const { id } = req.params;
    const { content, authorName } = req.body;

    // Input validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Comment content is required and cannot be empty'
      });
    }

    if (content.trim().length > 300) {
      return res.status(400).json({
        error: 'Comment content must be less than 300 characters'
      });
    }

    // Find the post across all campus data
    let targetPost = null;
    let targetCampus = null;
    let postIndex = -1;

    for (const [campusId, campusData] of Object.entries(campusPostsData)) {
      const index = campusData.posts.findIndex(p => p.id === id);
      if (index !== -1) {
        targetPost = campusData.posts[index];
        targetCampus = campusId;
        postIndex = index;
        break;
      }
    }

    if (!targetPost) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Create the new comment
    const newComment = {
      id: uuidv4(),
      content: content.trim(),
      authorName: authorName || 'Anonymous',
      timestamp: new Date().toISOString()
    };

    // Add comment to the post
    if (!targetPost.comments) {
      targetPost.comments = [];
    }
    targetPost.comments.push(newComment);

    // Save the updated campus data
    campusPostsData[targetCampus].posts[postIndex] = targetPost;
    saveCampusPosts(targetCampus);

    console.log(`💬 Comment added to post in campus ${targetCampus}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('❌ Error adding comment to post:', error);
    res.status(500).json({
      error: 'Internal server error occurred while adding comment'
    });
  }
});

/**
 * GET /api/posts/{id}/comment
 * Gets all comments for a post
 */
app.get('/api/posts/:id/comment', (req, res) => {
  try {
    const { id } = req.params;

    // Find the post across all campus data
    let targetPost = null;

    for (const [campusId, campusData] of Object.entries(campusPostsData)) {
      const post = campusData.posts.find(p => p.id === id);
      if (post) {
        targetPost = post;
        break;
      }
    }

    if (!targetPost) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Return the comments
    res.json({
      success: true,
      comments: targetPost.comments || []
    });

  } catch (error) {
    console.error('❌ Error retrieving comments:', error);
    res.status(500).json({
      error: 'Internal server error occurred while retrieving comments'
    });
  }
});

/**
 * GET /api/campuses
 * Retrieves all available campuses
 */
app.get('/api/campuses', (req, res) => {
  try {
    console.log(`🏫 Campuses request - returning ${campusesData.campuses.length} campuses`);

    res.json({
      success: true,
      campuses: campusesData.campuses
    });

  } catch (error) {
    console.error('❌ Error retrieving campuses:', error);
    res.status(500).json({
      error: 'Internal server error occurred while retrieving campuses'
    });
  }
});

/**
 * GET /api/campus/:campus/posts
 * Gets all posts for a specific campus
 */
app.get('/api/campus/:campus/posts', (req, res) => {
  try {
    const { campus } = req.params;

    // Find the campus posts
    const campusData = campusPostsData[campus];
    if (!campusData) {
      return res.status(404).json({
        error: 'Campus not found'
      });
    }

    // Sort by timestamp (newest first)
    const sortedPosts = [...campusData.posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      campus: campus,
      postsCount: campusData.posts.length,
      posts: sortedPosts
    });

  } catch (error) {
    console.error('❌ Error retrieving campus posts:', error);
    res.status(500).json({
      error: 'Internal server error occurred while retrieving campus posts'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint for monitoring server status
 */
app.get('/api/health', (req, res) => {
  const healthInfo = {
    success: true,
    message: 'HotGist API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    posts: Object.values(campusPostsData).reduce((total, campusData) => total + campusData.posts.length, 0),
    campuses: campusesData.campuses.length,
    session: 'client-side only'
  };

  res.json(healthInfo);
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

/**
 * Global error handler middleware
 */
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  console.log(`❓ Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// SERVER STARTUP
// ==========================================

app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🌟 HotGist Anonymous Campus Social Platform');
  console.log('🚀 ========================================');
  console.log(`📡 Server listening on port: ${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}`);
  console.log('');
  console.log('📊 Data Storage:');
  console.log(`   📁 Posts: Campus-specific JSON files in ${POSTS_DIR}/`);
  console.log(`   🏫 Campuses: ${campusesData.campuses.length} loaded from ${CAMPUSES_FILE}`);
  console.log('   🔒 Authentication: None required (completely anonymous)');
  console.log('');
  console.log('🔗 API Documentation:');
  console.log(`   📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log('');
  console.log('🚀 Server ready to accept connections!');
  console.log('🚀 ========================================');
});

module.exports = app;