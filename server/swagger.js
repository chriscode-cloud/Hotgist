const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'HotGist API',
    version: '1.0.0',
    description: '# 🚀 HotGist API\\n\\nA comprehensive, anonymous social networking API designed for university campus communities.\\n\\n## 🎆 Features\\n- 🎭 **Complete Anonymity**: No registration or authentication required\\n- 🏠 **Campus Communities**: Posts organized by university campuses\\n- 🔥 **Smart Trending**: Enhanced algorithm with time-decay and engagement scoring\\n- 👍 **Engagement System**: Like and comment on posts\\n- 💬 **Threaded Comments**: Full commenting system with real-time updates\\n- 📋 **File Storage**: Simple JSON-based persistence\\n\\n## 🚀 Quick Start\\n1. **Create a Post**: `POST /api/posts` with content and optional campus\\n2. **Browse Posts**: `GET /api/posts` with optional filtering and trending sort\\n3. **Engage**: Like posts with `POST /api/posts/{id}/like`\\n4. **Comment**: Add comments with `POST /api/posts/{id}/comment`\\n5. **Get Campus Info**: `GET /api/campuses` for available universities\\n\\n## 🏠 Supported Campuses\\n- GCTU (Ghana Communication Technology University)\\n- UG (University of Ghana)\\n- KNUST (Kwame Nkrumah University of Science and Technology)\\n- UCC (University of Cape Coast)\\n- UPSA (University of Professional Studies)\\n- UENR (University of Energy and Natural Resources)\\n- UMaT (University of Mines and Technology)\\n- UDS (University for Development Studies)\\n\\n## 🔍 API Usage\\nAll endpoints return JSON responses with a `success` boolean field. No authentication headers required - completely anonymous!',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Posts',
      description: 'Operations related to posts - create, read, like posts',
    },
    {
      name: 'Comments',
      description: 'Operations related to comments - add and retrieve comments',
    },
    {
      name: 'Campuses',
      description: 'Operations related to campuses and university information',
    },
    {
      name: 'Health',
      description: 'Health check and monitoring operations',
    },
  ],
  paths: {
    '/api/posts': {
      post: {
        tags: ['Posts'],
        summary: 'Create a new post',
        description: 'Creates a new anonymous post in the system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: {
                    type: 'string',
                    description: 'Post content text (max 500 characters)',
                    example: 'What\'s happening on campus today?',
                  },
                  campus: {
                    type: 'string',
                    description: 'Campus ID (optional - defaults to General)',
                    example: 'GCTU',
                  },
                  authorName: {
                    type: 'string',
                    description: 'Anonymous author name',
                    example: 'AnonymousUser123',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Post created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Post created successfully' },
                    post: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Posts'],
        summary: 'Get posts',
        description: 'Retrieves posts with optional campus filtering',
        parameters: [
          {
            name: 'campus',
            in: 'query',
            description: 'Filter posts by specific campus (optional)',
            required: false,
            schema: {
              type: 'string',
              example: 'GCTU',
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of posts to return (default: 50)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50,
            },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Number of posts to skip for pagination (default: 0)',
            required: false,
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0,
            },
          },
          {
            name: 'trending',
            in: 'query',
            description: 'If true, sort by popularity instead of timestamp (default: false)',
            required: false,
            schema: {
              type: 'boolean',
              default: false,
            },
          },
        ],
        responses: {
          200: {
            description: 'Posts retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostsResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Get a specific post',
        description: 'Retrieves a specific post by its ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Post ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Post retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostResponse' },
              },
            },
          },
          404: {
            description: 'Post not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/posts/{id}/like': {
      post: {
        tags: ['Posts'],
        summary: 'Like or unlike a post',
        description: 'Likes or unlikes a post',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Post ID',
            schema: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                    description: 'User identifier for tracking likes (optional)',
                    example: 'anon_123456_abcdef',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Like action completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LikeResponse' },
              },
            },
          },
          404: {
            description: 'Post not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    
    '/api/posts/{id}/comment': {
      post: {
        tags: ['Comments'],
        summary: 'Add a comment to a post',
        description: 'Adds a comment to a specific post',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Post ID',
            schema: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: {
                    type: 'string',
                    description: 'Comment content text (max 300 characters)',
                    example: 'Great post!',
                  },
                  authorName: {
                    type: 'string',
                    description: 'Anonymous author name',
                    example: 'AnonymousUser123',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Comment added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Comment added successfully' },
                    comment: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Post not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Comments'],
        summary: 'Get comments for a post',
        description: 'Retrieves all comments for a specific post',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Post ID',
            schema: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        ],
        responses: {
          200: {
            description: 'Comments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    comments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comment' },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Post not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    '/api/campuses': {
      get: {
        tags: ['Campuses'],
        summary: 'Get all campuses',
        description: 'Retrieves all available campuses',
        responses: {
          200: {
            description: 'Campuses retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CampusesResponse' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/campus/{campus}/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Get posts by campus',
        description: 'Gets all posts for a specific campus',
        parameters: [
          {
            name: 'campus',
            in: 'path',
            required: true,
            description: 'Campus ID',
            schema: {
              type: 'string',
              example: 'GCTU',
            },
          },
        ],
        responses: {
          200: {
            description: 'Campus posts retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    campus: { type: 'string', example: 'GCTU' },
                    postsCount: { type: 'integer', example: 15 },
                    posts: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Post' },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Health check endpoint for monitoring server status',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Post: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the post',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          content: {
            type: 'string',
            description: 'Post content text',
            example: 'What\'s happening on campus today?',
          },
          campus: {
            type: 'string',
            description: 'Campus where the post was made',
            example: 'GCTU',
          },
          authorName: {
            type: 'string',
            description: 'Anonymous author name',
            example: 'AnonymousUser123',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO timestamp when the post was created',
            example: '2023-10-01T12:00:00.000Z',
          },
          likes: {
            type: 'integer',
            description: 'Number of likes on the post',
            example: 5,
          },
          comments: {
            type: 'array',
            description: 'Array of comments on the post',
            items: {
              $ref: '#/components/schemas/Comment',
            }
          },
        },
      },
      
      Comment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the comment',
            example: '660e8400-e29b-41d4-a716-446655440001',
          },
          content: {
            type: 'string',
            description: 'Comment content text',
            example: 'Great post!',
          },
          authorName: {
            type: 'string',
            description: 'Anonymous author name',
            example: 'AnonymousUser456',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO timestamp when the comment was created',
            example: '2023-10-01T12:05:00.000Z',
          },
        },
      },
      
      Campus: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Campus identifier',
            example: 'GCTU',
          },
          name: {
            type: 'string',
            description: 'Full campus name',
            example: 'Ghana Communication Technology University',
          },
          code: {
            type: 'string',
            description: 'Campus code',
            example: 'GCTU',
          },
          location: {
            type: 'string',
            description: 'Campus location',
            example: 'Accra',
          },
        },
      },
      
      PostsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: true
          },
          count: {
            type: 'integer',
            description: 'Number of posts returned',
            example: 10
          },
          total: {
            type: 'integer',
            description: 'Total number of posts available',
            example: 42
          },
          campus: {
            type: 'string',
            description: 'Campus filter (if applied)',
            example: 'GCTU'
          },
          trending: {
            type: 'boolean',
            description: 'Whether posts are sorted by trending',
            example: false
          },
          posts: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Post',
            },
          },
        },
      },
      CampusesResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: true
          },
          campuses: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Campus',
            },
          },
        },
      },
      PostResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: true
          },
          post: {
            $ref: '#/components/schemas/Post',
          },
        },
      },
      LikeResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Like action message',
            example: 'Post liked'
          },
          likesCount: {
            type: 'integer',
            description: 'Updated likes count',
            example: 6
          },
          isLiked: {
            type: 'boolean',
            description: 'Whether the post is currently liked',
            example: true
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the server is healthy',
            example: true
          },
          message: {
            type: 'string',
            description: 'Health status message',
            example: 'HotGist API Server is running'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Server timestamp',
            example: '2023-10-01T12:00:00.000Z'
          },
          version: {
            type: 'string',
            description: 'API version',
            example: '1.0.0'
          },
          uptime: {
            type: 'number',
            description: 'Server uptime in seconds',
            example: 1234.56
          },
          memory: {
            type: 'object',
            description: 'Memory usage statistics',
          },
          posts: {
            type: 'integer',
            description: 'Total number of posts',
            example: 128
          },
          campuses: {
            type: 'integer',
            description: 'Number of campuses',
            example: 8
          },
          session: {
            type: 'string',
            description: 'Session handling method',
            example: 'client-side only'
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Something went wrong'
          },
          message: {
            type: 'string',
            description: 'Detailed error message',
            example: 'An unexpected error occurred'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp',
            example: '2023-10-01T12:00:00.000Z'
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;