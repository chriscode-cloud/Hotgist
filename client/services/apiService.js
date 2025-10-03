/**
 * HotGist API Service
 *
 * This service handles all communication between the React Native app
 * and the HotGist server. It provides a clean interface for making
 * API requests and handles errors appropriately.
 *
 * Architecture:
 * - Centralized API communication
 * - Automatic error handling and logging
 * - Session-based authentication support
 * - Request/response logging for debugging
 *
 * Author: HotGist Development Team
 * Version: 1.0.0
 */

import config from '../config';

const API_BASE_URL = config.API_BASE_URL; // HotGist server

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Helper method to determine if an error is retryable
   * @param {number} statusCode - HTTP status code
   * @returns {boolean} Whether the error should be retried
   */
  isRetryableError(statusCode) {
    // Retry on server errors (5xx) and some client errors
    return statusCode >= 500 || 
           statusCode === 408 || // Request timeout
           statusCode === 429;   // Too many requests
  }

  /**
   * Get user-friendly error message for HTTP status codes
   * @param {number} statusCode - HTTP status code
   * @returns {string} User-friendly error message
   */
  getErrorMessageForStatus(statusCode) {
    const errorMessages = {
      400: 'Bad request - please check your input',
      401: 'Authentication required',
      403: 'Access forbidden',
      404: 'Resource not found',
      408: 'Request timeout - please try again',
      429: 'Too many requests - please wait a moment',
      500: 'Server error - please try again later',
      502: 'Service temporarily unavailable',
      503: 'Service unavailable',
      504: 'Request timeout - server is busy'
    };
    
    return errorMessages[statusCode] || `Unexpected error (${statusCode})`;
  }

  /**
   * Validate API response structure
   * @param {object} data - Response data
   * @returns {boolean} Whether the response is valid
   */
  isValidResponse(data) {
    // Basic validation - response should be an object with at least a success field
    return data && 
           typeof data === 'object' && 
           typeof data.success === 'boolean';
  }

  /**
   * Validate post data before sending
   * @param {object} postData - Post data to validate
   * @throws {Error} If validation fails
   */
  validatePostData(postData) {
    if (!postData) {
      throw new Error('Post data is required');
    }
    
    if (!postData.content || typeof postData.content !== 'string') {
      throw new Error('Post content is required and must be a string');
    }
    
    if (postData.content.trim().length === 0) {
      throw new Error('Post content cannot be empty');
    }
    
    if (postData.content.length > (config.UI?.POST_MAX_LENGTH || 500)) {
      throw new Error(`Post content must be less than ${config.UI?.POST_MAX_LENGTH || 500} characters`);
    }
    
    // Validate campus if provided
    if (postData.campus && typeof postData.campus !== 'string') {
      throw new Error('Campus must be a string');
    }
    
    // Validate author name if provided
    if (postData.authorName && typeof postData.authorName !== 'string') {
      throw new Error('Author name must be a string');
    }
  }

  /**
   * Validate comment data before sending
   * @param {object} commentData - Comment data to validate
   * @throws {Error} If validation fails
   */
  validateCommentData(commentData) {
    if (!commentData) {
      throw new Error('Comment data is required');
    }
    
    if (!commentData.content || typeof commentData.content !== 'string') {
      throw new Error('Comment content is required and must be a string');
    }
    
    if (commentData.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }
    
    if (commentData.content.length > (config.UI?.COMMENT_MAX_LENGTH || 300)) {
      throw new Error(`Comment content must be less than ${config.UI?.COMMENT_MAX_LENGTH || 300} characters`);
    }
    
    // Validate author name if provided
    if (commentData.authorName && typeof commentData.authorName !== 'string') {
      throw new Error('Author name must be a string');
    }
  }

  /**
   * Makes an HTTP request to the API with enhanced error handling
   * Handles errors, logging, response parsing, retries, and validation
   *
   * @param {string} endpoint - API endpoint (e.g., '/posts')
   * @param {object} options - Request options (method, headers, body)
   * @param {number} [retryCount=0] - Current retry attempt
   * @returns {Promise<object>} API response data
   */
  async makeRequest(endpoint, options = {}, retryCount = 0) {
    const maxRetries = config.NETWORK?.RETRY_ATTEMPTS || 3;
    const retryDelay = config.NETWORK?.RETRY_DELAY || 1000;
    const timeout = config.NETWORK?.TIMEOUT || 10000;
    
    try {
      // Validate endpoint
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint provided');
      }

      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for session management
        signal: AbortSignal.timeout ? AbortSignal.timeout(timeout) : undefined,
        ...options,
      };

      if (config.DEV?.SHOW_NETWORK_LOGS) {
        console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
        console.log(`🔧 Request config:`, config);
      }

      // Log the full URL being requested for debugging
      console.log(`📡 Making request to: ${url}`);
      console.log(`🔧 With config:`, { method: options.method || 'GET', ...config });

      const response = await fetch(url, config);
      
      if (config.DEV?.SHOW_NETWORK_LOGS) {
        console.log(`📊 Response status: ${response.status}`);
      }

      // Handle different error types
      if (!response.ok) {
        const errorText = await response.text();
        
        let errorData = { error: 'Unknown error occurred' };
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('❌ Failed to parse error response as JSON:', parseError);
          // Create structured error for non-JSON responses
          errorData = {
            error: this.getErrorMessageForStatus(response.status),
            statusCode: response.status,
            rawResponse: errorText
          };
        }

        // Create enhanced error object
        const enhancedError = new Error(errorData.error || 'Request failed');
        enhancedError.status = response.status;
        enhancedError.statusText = response.statusText;
        enhancedError.data = errorData;
        enhancedError.endpoint = endpoint;
        enhancedError.isRetryable = this.isRetryableError(response.status);
        
        throw enhancedError;
      }

      const data = await response.json();
      
      // Validate response structure
      if (!this.isValidResponse(data)) {
        console.warn('⚠️ Invalid response structure:', data);
      }
      
      if (config.DEV?.SHOW_NETWORK_LOGS) {
        console.log(`✅ API Response: ${response.status}`, data);
      }

      return data;
    } catch (error) {
      // Enhanced error logging
      console.error(`❌ API Error for ${endpoint}:`, {
        message: error.message,
        status: error.status,
        endpoint,
        retryCount,
        timestamp: new Date().toISOString()
      });

      // Retry logic for retryable errors
      if (retryCount < maxRetries && error.isRetryable) {
        console.log(`🔄 Retrying request (${retryCount + 1}/${maxRetries}) in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      // Enhance error for better client handling
      error.isNetworkError = error.name === 'TypeError' || error.message.includes('fetch');
      error.isTimeoutError = error.name === 'AbortError' || error.message.includes('timeout');
      error.endpoint = endpoint;
      error.retryCount = retryCount;
      
      throw error;
    }
  }

  // ==========================================
  // AUTHENTICATION API (Server-side posts, client-side auth)
  // ==========================================

  /**
   * Creates an anonymous user locally (client-side)
   * No server authentication required - just returns user object
   *
   * @param {string} name - Anonymous username
   * @param {string} campus - Optional campus selection
   * @returns {Promise<object>} User data (not stored on server)
   */
  async createAnonymousUser(userData) {
    // This is now client-side only - no server call needed
    return Promise.resolve({
      success: true,
      user: {
        id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: userData.name,
        campus: userData.campus || null,
        isAnonymous: true,
        createdAt: new Date().toISOString()
      }
    });
  }

  // ==========================================
  // POSTS API
  // ==========================================

  /**
   * Gets posts with optional campus filtering and trending sort
   *
   * @param {string} campus - Campus ID to filter by (optional)
   * @param {number} limit - Maximum posts to return (default: 50)
   * @param {number} offset - Posts to skip for pagination (default: 0)
   * @param {boolean} trending - Sort by popularity if true (default: false)
   * @returns {Promise<object>} Posts data with metadata
   */
  async getPosts(campus = null, limit = 50, offset = 0, trending = false) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      trending: trending.toString(),
    });

    if (campus) {
      params.append('campus', campus);
    }

    const endpoint = `/posts?${params.toString()}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Creates a new post with validation
   * Requires active anonymous session
   *
   * @param {object} postData - Post data {content, campus, authorName}
   * @returns {Promise<object>} Created post data
   * @throws {Error} If validation fails
   */
  async createPost(postData) {
    // Validate post data before sending
    this.validatePostData(postData);
    
    // Clean the data
    const cleanedData = {
      content: postData.content.trim(),
      campus: postData.campus || 'General',
      authorName: postData.authorName || 'Anonymous'
    };
    
    return this.makeRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(cleanedData),
    });
  }

  /**
   * Gets a specific post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<object>} Post data
   */
  async getPostById(postId) {
    return this.makeRequest(`/posts/${postId}`);
  }

  /**
   * Likes or unlikes a post (anonymous)
   * @param {string} postId - Post ID
   * @returns {Promise<object>} Like status
   */
  async toggleLike(postId) {
    return this.makeRequest(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // ==========================================
  // COMMENTS API
  // ==========================================

  /**
   * Adds a comment to a post with validation
   * @param {string} postId - Post ID
   * @param {object} commentData - Comment data {content, authorName}
   * @returns {Promise<object>} Comment response
   * @throws {Error} If validation fails
   */
  async addComment(postId, commentData) {
    // Validate post ID
    if (!postId || typeof postId !== 'string') {
      throw new Error('Post ID is required and must be a string');
    }
    
    // Validate comment data
    this.validateCommentData(commentData);
    
    // Clean the data
    const cleanedData = {
      content: commentData.content.trim(),
      authorName: commentData.authorName || 'Anonymous'
    };
    
    return this.makeRequest(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(cleanedData),
    });
  }

  /**
   * Gets comments for a post
   * @param {string} postId - Post ID
   * @returns {Promise<object>} Comments data
   */
  async getComments(postId) {
    return this.makeRequest(`/posts/${postId}/comment`);
  }

  // ==========================================
  // CAMPUSES API
  // ==========================================

  /**
   * Gets all available campuses
   * @returns {Promise<object>} Campuses data
   */
  async getCampuses() {
    return this.makeRequest('/campuses');
  }

  // ==========================================
  // USERS API
  // ==========================================

  /**
   * Gets posts by a specific campus
   * @param {string} campusId - Campus ID to get posts for
   * @returns {Promise<object>} Campus posts data
   */
  async getCampusPosts(campusId) {
    return this.makeRequest(`/campus/${campusId}/posts`);
  }

  /**
   * Gets posts by a specific user (based on author name since it's anonymous)
   * @param {string} userId - User ID
   * @param {string} campusId - Campus ID to filter by
   * @returns {Promise<object>} User posts data
   */
  async getUserPosts(userId, campusId = null) {
    try {
      // Get all posts, filtered by campus if provided
      const response = await this.getPosts(campusId, 100, 0, false);
      if (response.success && response.posts) {
        // Filter posts by author name (userId can be either a string or user object)
        const userName = typeof userId === 'string' ? userId : userId.name;
        const userPosts = response.posts.filter(post => 
          post.authorName === userName
        );
        return {
          success: true,
          posts: userPosts,
          count: userPosts.length
        };
      }
      return response;
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY API
  // ==========================================

  /**
   * Checks server health and status
   * @returns {Promise<object>} Server health information
   */
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

/**
 * Create and export a single instance of the API service
 * This ensures consistent configuration across the app
 */
const apiService = new ApiService();
export default apiService;