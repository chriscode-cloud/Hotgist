/**
 * HotGist Application Configuration
 * 
 * This file contains configuration settings for the HotGist client application.
 * It includes API server settings, default values, and other configurable options.
 * 
 * Environment-based configuration:
 * - Development: Uses local IP for testing with Expo
 * - Production: Uses deployed server URL
 */

// Detect environment
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isWeb = typeof window !== 'undefined' && window.document;

// Environment-specific API URLs
const API_URLS = {
  development: process.env.EXPO_PUBLIC_API_BASE_URL || (isWeb ? 'http://localhost:3000/api' : 'http://192.168.100.177:3000/api'),
  production: 'https://your-production-domain.com/api', // Update for production
  local: 'http://localhost:3000/api' // For local testing
};

// Auto-detect API URL or use environment variable
const getApiUrl = () => {
  // Check if API_BASE_URL is set in environment variables (for Expo)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Use environment-based URL
  if (isProduction) {
    return API_URLS.production;
  }
  
  // For web, use localhost; for mobile, use the IP address
  return isWeb ? API_URLS.local : API_URLS.development;
};

const config = {
  /**
   * API Server Configuration
   * 
   * The base URL for the HotGist API server.
   * Automatically determined based on environment.
   * 
   * To override in development, set EXPO_PUBLIC_API_BASE_URL in .env:
   * EXPO_PUBLIC_API_BASE_URL=http://your-ip:3000/api
   */
  API_BASE_URL: getApiUrl(),

  /**
   * Default Values
   * 
   * These are default values used throughout the application when
   * specific values are not provided.
   */
  DEFAULTS: {
    CAMPUS: 'GCTU',
    AUTHOR_NAME: 'AnonymousUser123',
    POST_LIMIT: 50,
  },

  /**
   * Application Settings
   */
  APP: {
    NAME: 'HotGist',
    VERSION: '1.0.0',
    POLLING_INTERVAL: isDevelopment ? 10000 : 30000, // 10s dev, 30s prod
    DEBUG_MODE: isDevelopment,
    CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  },

  /**
   * Network Configuration
   */
  NETWORK: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  /**
   * UI Configuration
   */
  UI: {
    POST_MAX_LENGTH: 500,
    COMMENT_MAX_LENGTH: 300,
    POSTS_PER_PAGE: 20,
    ANIMATION_DURATION: 300,
  },

  /**
   * Development helpers
   */
  DEV: {
    ENABLE_LOGGING: isDevelopment,
    SHOW_NETWORK_LOGS: isDevelopment,
    MOCK_DATA: false,
  }
};

// Log configuration in development
if (config.DEV.ENABLE_LOGGING) {
  console.log('🔧 HotGist Configuration:', {
    environment: isDevelopment ? 'development' : 'production',
    apiUrl: config.API_BASE_URL,
    debugMode: config.APP.DEBUG_MODE
  });
}

export default config;