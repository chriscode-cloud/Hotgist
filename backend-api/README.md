# 🔥 HotGist Backend API

Express.js backend API for the HotGist social media application, providing endpoints for posts, reactions, and trending content.

## 🚀 Features

- **Posts Management**: Create and fetch posts with pagination
- **Reactions System**: Add, update, and remove reactions (🔥 😂 😱)
- **Trending Algorithm**: Get trending posts by reaction count and time
- **Firebase Integration**: Real-time data with Firestore
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Proper error responses and logging

## 📡 API Endpoints

### Posts

#### `POST /posts`
Create a new post.

**Request Body:**
```json
{
  "content": "This is my hot take! 🔥",
  "authorId": "user123",
  "imageUrl": "https://example.com/image.jpg" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "post123",
    "content": "This is my hot take! 🔥",
    "authorId": "user123",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "reactionCount": 0,
    "commentCount": 0
  }
}
```

#### `GET /posts`
Fetch all posts with pagination.

**Query Parameters:**
- `limit` (optional): Number of posts to fetch (default: 20, max: 100)
- `lastDocId` (optional): ID of the last post for pagination
- `orderBy` (optional): Field to order by (default: 'createdAt')
- `orderDirection` (optional): 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post123",
        "content": "This is my hot take! 🔥",
        "imageUrl": "https://example.com/image.jpg",
        "authorId": "user123",
        "author": {
          "uid": "user123",
          "displayName": "John Doe",
          "photoURL": "https://example.com/avatar.jpg"
        },
        "reactions": {
          "fire": 5,
          "laugh": 2,
          "shock": 1
        },
        "reactionCount": 8,
        "commentCount": 3,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "hasMore": true,
      "lastDocId": "post123",
      "limit": 20,
      "count": 1
    }
  }
}
```

#### `GET /posts/:id`
Get a single post by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "post123",
    "content": "This is my hot take! 🔥",
    "imageUrl": "https://example.com/image.jpg",
    "authorId": "user123",
    "author": {
      "uid": "user123",
      "displayName": "John Doe",
      "photoURL": "https://example.com/avatar.jpg"
    },
    "reactions": {
      "fire": 5,
      "laugh": 2,
      "shock": 1
    },
    "reactionCount": 8,
    "commentCount": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Reactions

#### `POST /reactions`
Add, update, or remove a reaction to a post.

**Request Body:**
```json
{
  "postId": "post123",
  "userId": "user456",
  "type": "fire" // "fire", "laugh", or "shock"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction added successfully",
  "data": {
    "postId": "post123",
    "userId": "user456",
    "action": "added", // "added", "updated", or "removed"
    "userReaction": "fire",
    "reactions": {
      "fire": 6,
      "laugh": 2,
      "shock": 1
    },
    "totalReactions": 9
  }
}
```

#### `GET /reactions/:postId`
Get all reactions for a specific post.

**Query Parameters:**
- `userId` (optional): Check if a specific user has reacted

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "post123",
    "reactions": {
      "fire": 5,
      "laugh": 2,
      "shock": 1
    },
    "totalReactions": 8,
    "userReaction": "fire", // null if userId not provided or no reaction
    "details": [
      {
        "id": "reaction123",
        "userId": "user456",
        "type": "fire",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### `DELETE /reactions/:postId`
Remove a user's reaction from a post.

**Request Body:**
```json
{
  "userId": "user456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction removed successfully",
  "data": {
    "postId": "post123",
    "userId": "user456",
    "reactions": {
      "fire": 4,
      "laugh": 2,
      "shock": 1
    },
    "totalReactions": 7
  }
}
```

### Trending

#### `GET /trending`
Get top trending posts by reaction count.

**Query Parameters:**
- `limit` (optional): Number of posts to fetch (default: 10, max: 50)
- `timeRange` (optional): Time range for trending calculation
  - `1h`: Last 1 hour
  - `24h`: Last 24 hours (default)
  - `7d`: Last 7 days
  - `30d`: Last 30 days

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post123",
        "content": "This is my hot take! 🔥",
        "imageUrl": "https://example.com/image.jpg",
        "authorId": "user123",
        "author": {
          "uid": "user123",
          "displayName": "John Doe",
          "photoURL": "https://example.com/avatar.jpg"
        },
        "reactions": {
          "fire": 15,
          "laugh": 5,
          "shock": 2
        },
        "reactionCount": 22,
        "commentCount": 8,
        "trendingScore": 2.5,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "metadata": {
      "timeRange": "24h",
      "limit": 10,
      "totalPosts": 50,
      "postsWithReactions": 35,
      "totalReactions": 150,
      "generatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

#### `GET /trending/users`
Get trending users by total reactions.

**Query Parameters:**
- `limit` (optional): Number of users to fetch (default: 10)
- `timeRange` (optional): Time range (24h, 7d, 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "user123",
        "postCount": 5,
        "totalReactions": 45,
        "totalComments": 12,
        "displayName": "John Doe",
        "photoURL": "https://example.com/avatar.jpg",
        "bio": "Hot take enthusiast"
      }
    ],
    "metadata": {
      "timeRange": "7d",
      "limit": 10,
      "totalUsers": 5,
      "generatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

## 🛠 Setup

### Prerequisites

- Node.js (v16 or higher)
- Firebase project with Firestore enabled
- Firebase service account key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Firestore Database
   - Generate a service account key
   - Update `.env` with your Firebase credentials

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY_ID`: Service account private key ID
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `FIREBASE_CLIENT_EMAIL`: Service account client email
- `FIREBASE_CLIENT_ID`: Service account client ID

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Go to Project Settings > Service Accounts
4. Generate new private key
5. Download the JSON file
6. Extract the required fields for your `.env` file

## 📊 Database Schema

### Posts Collection
```javascript
{
  content: string,
  authorId: string,
  imageUrl: string | null,
  createdAt: timestamp,
  updatedAt: timestamp,
  reactionCount: number,
  commentCount: number
}
```

### Reactions Collection
```javascript
{
  postId: string,
  userId: string,
  type: 'fire' | 'laugh' | 'shock',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Users Collection
```javascript
{
  displayName: string,
  photoURL: string | null,
  bio: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers
- **Error Handling**: No sensitive data in error responses

## 🚀 Deployment

### Environment Setup
1. Set all required environment variables
2. Ensure Firebase service account has proper permissions
3. Configure CORS for your frontend domain

### Platforms
- **Heroku**: Easy deployment with environment variables
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS deployment
- **AWS/GCP**: Cloud platform deployment

## 📈 Performance

- **Pagination**: Efficient data loading
- **Indexing**: Optimized Firestore queries
- **Caching**: Consider Redis for high-traffic scenarios
- **Rate Limiting**: Prevents API abuse

## 🧪 Testing

```bash
# Test endpoints using curl or Postman
curl -X GET http://localhost:3001/health
curl -X GET http://localhost:3001/trending
```

## 📝 License

MIT License - see LICENSE file for details.

---

Made with 🔥 by the HotGist Team
