const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase BEFORE importing routes (routes use Firestore)
initializeFirebase();

// Import routes after Firebase is initialized
const postRoutes = require('./routes/posts');
const reactionRoutes = require('./routes/reactions');
const trendingRoutes = require('./routes/trending');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:19006',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/posts', postRoutes);
app.use('/reactions', reactionRoutes);
app.use('/trending', trendingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HotGist Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HotGist Backend API',
    version: '1.0.0',
    endpoints: {
      posts: {
        'POST /posts': 'Create a new post',
        'GET /posts': 'Fetch all posts'
      },
      reactions: {
        'POST /reactions': 'Add reaction to a post'
      },
      trending: {
        'GET /trending': 'Fetch top 10 trending posts by reaction count'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🔥 HotGist Backend API running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:19006'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
