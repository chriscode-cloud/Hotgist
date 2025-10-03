# HotGist API Documentation

## Overview
HotGist is a lightweight, anonymous campus social platform that allows users to create and view posts within specific campus communities. The API provides endpoints for creating posts, retrieving posts (both general and campus-specific), liking posts, commenting on posts, and managing campus information.

## Base URL
```
http://localhost:3000
```

## Data Storage
The server uses a file-based storage system with JSON files:
- Posts are stored in `data/posts/` directory in campus-specific JSON files
- Campus information is stored in `data/campuses.json`
- All data is persisted directly to the filesystem without a database

## API Endpoints

### Posts

#### Create a New Post
**POST** `/api/posts`

Creates a new anonymous post in the system.

##### Request Body
```json
{
  "content": "string",          // Required: Post content (max 500 characters)
  "campus": "string",           // Optional: Campus ID (defaults to "General")
  "authorName": "string"        // Optional: Anonymous author name (defaults to "Anonymous")
}
```

##### Response Format
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "uuid",
    "content": "string",
    "campus": "string",
    "authorName": "string",
    "timestamp": "ISO 8601 date string",
    "likes": 0,
    "comments": []
  }
}
```

##### Example Request
```json
{
  "content": "What's happening at GCTU today?",
  "campus": "GCTU",
  "authorName": "Student123"
}
```

##### Example Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "What's happening at GCTU today?",
    "campus": "GCTU",
    "authorName": "Student123",
    "timestamp": "2023-10-01T12:00:00.000Z",
    "likes": 0,
    "comments": []
  }
}
```

#### Get Posts (Trending by Default)
**GET** `/api/posts[?campus=<campus_id>&limit=<number>&offset=<number>&trending=<boolean>]`

Retrieves posts with optional filtering and pagination. By default, returns trending posts from all campuses.

##### Query Parameters
- `campus`: Filter posts by specific campus (optional)
- `limit`: Maximum number of posts to return (default: 50, max: 100)
- `offset`: Number of posts to skip for pagination (default: 0)
- `trending`: If true, sort by popularity; if false, sort by timestamp (default: true)

##### Response Format
```json
{
  "success": true,
  "count": 0,              // Number of posts returned
  "total": 0,              // Total number of posts available
  "campus": "string",      // Campus filter applied (if any)
  "trending": true,        // Whether posts are sorted by trending
  "posts": [
    {
      "id": "uuid",
      "content": "string",
      "campus": "string",
      "authorName": "string",
      "timestamp": "ISO 8601 date string",
      "likes": 0,
      "comments": []
    }
  ]
}
```

##### Example Response
```json
{
  "success": true,
  "count": 2,
  "total": 42,
  "campus": "all",
  "trending": true,
  "posts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Great lecture today!",
      "campus": "UG",
      "authorName": "Anonymous",
      "timestamp": "2023-10-01T12:00:00.000Z",
      "likes": 15,
      "comments": []
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "content": "Campus event this weekend",
      "campus": "KNUST",
      "authorName": "Student456",
      "timestamp": "2023-10-01T11:00:00.000Z",
      "likes": 12,
      "comments": []
    }
  ]
}
```

#### Get a Specific Post
**GET** `/api/posts/{id}`

Retrieves a specific post by its ID.

##### Response Format
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "content": "string",
    "campus": "string",
    "authorName": "string",
    "timestamp": "ISO 8601 date string",
    "likes": 0,
    "comments": [
      {
        "id": "uuid",
        "content": "string",
        "authorName": "string",
        "timestamp": "ISO 8601 date string"
      }
    ]
  }
}
```

##### Example Response
```json
{
  "success": true,
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "What's happening at GCTU today?",
    "campus": "GCTU",
    "authorName": "Student123",
    "timestamp": "2023-10-01T12:00:00.000Z",
    "likes": 1,
    "comments": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "content": "Sounds interesting!",
        "authorName": "AnotherStudent",
        "timestamp": "2023-10-01T12:05:00.000Z"
      }
    ]
  }
}
```

#### Like a Post
**POST** `/api/posts/{id}/like`

Likes a post (increments like count).

##### Request Body
```json
{
  "userId": "string"        // Optional: User identifier for tracking likes
}
```

##### Response Format
```json
{
  "success": true,
  "message": "Post liked",
  "likesCount": 0
}
```

##### Example Response
```json
{
  "success": true,
  "message": "Post liked",
  "likesCount": 1
}
```

#### Add a Comment to a Post
**POST** `/api/posts/{id}/comment`

Adds a comment to a specific post.

##### Request Body
```json
{
  "content": "string",          // Required: Comment content (max 300 characters)
  "authorName": "string"        // Optional: Anonymous author name (defaults to "Anonymous")
}
```

##### Response Format
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "uuid",
    "content": "string",
    "authorName": "string",
    "timestamp": "ISO 8601 date string"
  }
}
```

##### Example Request
```json
{
  "content": "This is a great post!",
  "authorName": "Commenter123"
}
```

##### Example Response
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "content": "This is a great post!",
    "authorName": "Commenter123",
    "timestamp": "2023-10-01T12:05:00.000Z"
  }
}
```

### Campuses

#### Get All Campuses
**GET** `/api/campuses`

Retrieves all available campuses.

##### Response Format
```json
{
  "success": true,
  "campuses": [
    {
      "id": "string",
      "name": "string",
      "code": "string",
      "location": "string"
    }
  ]
}
```

##### Example Response
```json
{
  "success": true,
  "campuses": [
    {
      "id": "GCTU",
      "name": "Ghana Communication Technology University",
      "code": "GCTU",
      "location": "Accra"
    },
    {
      "id": "UG",
      "name": "University of Ghana",
      "code": "UG",
      "location": "Accra"
    }
  ]
}
```

#### Get Posts by Campus
**GET** `/api/campus/{campus}/posts[?limit=<number>&offset=<number>]`

Gets all posts for a specific campus, sorted by most recent first.

##### Query Parameters
- `limit`: Maximum number of posts to return (default: 50, max: 100)
- `offset`: Number of posts to skip for pagination (default: 0)

##### Response Format
```json
{
  "success": true,
  "campus": "string",
  "postsCount": 0,         // Total number of posts for this campus
  "count": 0,              // Number of posts returned
  "posts": [
    {
      "id": "uuid",
      "content": "string",
      "campus": "string",
      "authorName": "string",
      "timestamp": "ISO 8601 date string",
      "likes": 0,
      "comments": []
    }
  ]
}
```

##### Example Response
```json
{
  "success": true,
  "campus": "GCTU",
  "postsCount": 15,
  "count": 2,
  "posts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "What's happening at GCTU today?",
      "campus": "GCTU",
      "authorName": "Student123",
      "timestamp": "2023-10-01T12:00:00.000Z",
      "likes": 0,
      "comments": []
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "content": "Library hours extended",
      "campus": "GCTU",
      "authorName": "Anonymous",
      "timestamp": "2023-10-01T11:00:00.000Z",
      "likes": 3,
      "comments": []
    }
  ]
}
```

#### Get Trending Posts by Campus
**GET** `/api/campus/{campus}/trending[?limit=<number>&offset=<number>]`

Gets trending posts for a specific campus, sorted by popularity (likes + comments).

##### Query Parameters
- `limit`: Maximum number of posts to return (default: 50, max: 100)
- `offset`: Number of posts to skip for pagination (default: 0)

##### Response Format
```json
{
  "success": true,
  "campus": "string",
  "postsCount": 0,         // Total number of posts for this campus
  "count": 0,              // Number of posts returned
  "posts": [
    {
      "id": "uuid",
      "content": "string",
      "campus": "string",
      "authorName": "string",
      "timestamp": "ISO 8601 date string",
      "likes": 0,
      "comments": []
    }
  ]
}
```

### Health Check

#### Server Health
**GET** `/api/health`

Health check endpoint for monitoring server status.

##### Response Format
```json
{
  "success": true,
  "message": "HotGist API Server is running",
  "timestamp": "ISO 8601 date string",
  "version": "string",
  "uptime": 0,
  "memory": {},
  "posts": 0,
  "campuses": 0,
  "session": "string"
}
```

##### Example Response
```json
{
  "success": true,
  "message": "HotGist API Server is running",
  "timestamp": "2023-10-01T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 1234.56,
  "memory": {
    "rss": 4567890,
    "heapTotal": 3456789,
    "heapUsed": 2345678,
    "external": 1234567
  },
  "posts": 128,
  "campuses": 8,
  "session": "client-side only"
}
```

## Data Models

### Post
```json
{
  "id": "uuid",
  "content": "string",
  "campus": "string",
  "authorName": "string",
  "timestamp": "ISO 8601 date string",
  "likes": 0,
  "comments": [
    {
      "id": "uuid",
      "content": "string",
      "authorName": "string",
      "timestamp": "ISO 8601 date string"
    }
  ]
}
```

### Comment
```json
{
  "id": "uuid",
  "content": "string",
  "authorName": "string",
  "timestamp": "ISO 8601 date string"
}
```

### Campus
```json
{
  "id": "string",
  "name": "string",
  "code": "string",
  "location": "string"
}
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "string",
  "message": "string",
  "timestamp": "ISO 8601 date string"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input or missing required parameters
- `404`: Not Found - Requested resource does not exist
- `500`: Internal Server Error - Unexpected server error

## Authentication
The API does not require authentication. All operations are anonymous by design.

## Rate Limiting
There is currently no rate limiting implemented.

## Data Persistence
All data is stored in JSON files in the `data/` directory:
- `data/campuses.json`: Contains information about all campuses
- `data/posts/`: Directory containing campus-specific post files (e.g., GCTU.json, UG.json)

## Campus List
The server comes pre-configured with the following Ghanaian universities:
1. GCTU - Ghana Communication Technology University (Accra)
2. UG - University of Ghana (Accra)
3. KNUST - Kwame Nkrumah University of Science and Technology (Kumasi)
4. UCC - University of Cape Coast (Cape Coast)
5. UPSA - University of Professional Studies (Accra)
6. UENR - University of Energy and Natural Resources (Sunyani)
7. UMaT - University of Mines and Technology (Tarkwa)
8. UDS - University for Development Studies (Tamale)

## Trending Algorithm
Posts are considered "trending" based on a score calculated as:
```
trending_score = likes + comments_count
```

## API Usage Examples

### Creating a Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello campus!", "campus": "UG"}'
```

### Getting Trending Posts
```bash
curl http://localhost:3000/api/posts
```

### Getting Campus-Specific Posts
```bash
curl http://localhost:3000/api/campus/GCTU/posts
```

### Liking a Post
```bash
curl -X POST http://localhost:3000/api/posts/550e8400-e29b-41d4-a716-446655440000/like
```

### Adding a Comment to a Post
```bash
curl -X POST http://localhost:3000/api/posts/550e8400-e29b-41d4-a716-446655440000/comment \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!", "authorName": "A Commenter"}'
```

This documentation provides a comprehensive overview of the HotGist API, including all available endpoints, request/response formats, and data models.