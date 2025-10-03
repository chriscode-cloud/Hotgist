/**
 * Comment Service
 * 
 * This service handles comment operations for the HotGist app.
 * It now uses the API service to communicate with the backend.
 */

import apiService from './apiService';

class CommentService {
  /**
   * Adds a comment to a post
   * @param {string} postId - The ID of the post to add the comment to
   * @param {object} commentData - The comment data {content, authorName}
   * @returns {Promise<object>} The new comment object
   */
  async addComment(postId, commentData) {
    try {
      const response = await apiService.addComment(postId, commentData);
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Gets all comments for a post
   * @param {string} postId - The ID of the post to get comments for
   * @returns {Promise<Array>} Array of comment objects
   */
  async getComments(postId) {
    try {
      const response = await apiService.getComments(postId);
      if (response.success) {
        return response.comments || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  /**
   * Merges stored comments with post comments
   * @param {object} post - The post object
   * @returns {Promise<object>} Post with merged comments
   */
  async mergeCommentsWithPost(post) {
    try {
      // If post already has comments from server, return as is
      // Only return as is if comments array exists and we're sure it contains all comments
      // For now, we'll always fetch fresh comments to ensure accuracy
      const comments = await this.getComments(post.id);
      return {
        ...post,
        comments: comments
      };
    } catch (error) {
      console.error('Error merging comments:', error);
      // Return post with empty comments array if error occurs
      return {
        ...post,
        comments: []
      };
    }
  }

  /**
   * Cleans up old comments - not needed with server-side storage
   * @returns {Promise<void>}
   */
  async cleanupOldComments() {
    // No cleanup needed with server-side storage
    return Promise.resolve();
  }
}

// Create and export a single instance
const commentService = new CommentService();
export default commentService;