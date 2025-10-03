/**
 * HotGist App Context
 * 
 * Provides global state management for the HotGist application using React Context.
 * This replaces scattered useState calls with centralized state management.
 * 
 * Features:
 * - User session management
 * - Posts cache and management
 * - Comments state handling
 * - Campus selection
 * - Network status tracking
 * - Error handling
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import config from '../config';

// Initial state
const initialState = {
  // User state
  user: null,
  isAuthenticated: false,
  selectedCampus: null,

  // Posts state
  posts: [],
  loading: false,
  refreshing: false,
  hasMorePosts: true,
  postsOffset: 0,

  // Comments state
  comments: {},
  loadingComments: {},

  // App state
  campuses: [],
  networkStatus: 'online',
  errors: [],
  lastUpdated: null,

  // UI state
  showTrending: false,
  searchQuery: '',
  selectedPost: null,
};

// Action types
const actionTypes = {
  // User actions
  SET_USER: 'SET_USER',
  LOGOUT_USER: 'LOGOUT_USER',
  SET_SELECTED_CAMPUS: 'SET_SELECTED_CAMPUS',

  // Posts actions
  SET_POSTS: 'SET_POSTS',
  ADD_POST: 'ADD_POST',
  UPDATE_POST: 'UPDATE_POST',
  DELETE_POST: 'DELETE_POST',
  SET_LOADING: 'SET_LOADING',
  SET_REFRESHING: 'SET_REFRESHING',
  RESET_POSTS: 'RESET_POSTS',
  LOAD_MORE_POSTS: 'LOAD_MORE_POSTS',

  // Comments actions
  SET_COMMENTS: 'SET_COMMENTS',
  ADD_COMMENT: 'ADD_COMMENT',
  SET_LOADING_COMMENTS: 'SET_LOADING_COMMENTS',

  // App actions
  SET_CAMPUSES: 'SET_CAMPUSES',
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  ADD_ERROR: 'ADD_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED',

  // UI actions
  SET_SHOW_TRENDING: 'SET_SHOW_TRENDING',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SELECTED_POST: 'SET_SELECTED_POST',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case actionTypes.LOGOUT_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        selectedCampus: null,
        posts: [],
        comments: {},
      };

    case actionTypes.SET_SELECTED_CAMPUS:
      return {
        ...state,
        selectedCampus: action.payload,
        posts: [], // Reset posts when campus changes
        postsOffset: 0,
        hasMorePosts: true,
      };

    case actionTypes.SET_POSTS:
      return {
        ...state,
        posts: action.payload.reset ? action.payload.posts : [...state.posts, ...action.payload.posts],
        loading: false,
        refreshing: false,
        hasMorePosts: action.payload.hasMore,
        postsOffset: action.payload.reset ? action.payload.posts.length : state.postsOffset + action.payload.posts.length,
        lastUpdated: new Date().toISOString(),
      };

    case actionTypes.ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts],
        postsOffset: state.postsOffset + 1,
      };

    case actionTypes.UPDATE_POST:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? { ...post, ...action.payload.updates } : post
        ),
      };

    case actionTypes.DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload.postId),
        postsOffset: Math.max(0, state.postsOffset - 1),
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case actionTypes.SET_REFRESHING:
      return {
        ...state,
        refreshing: action.payload,
      };

    case actionTypes.RESET_POSTS:
      return {
        ...state,
        posts: [],
        postsOffset: 0,
        hasMorePosts: true,
      };

    case actionTypes.SET_COMMENTS:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.postId]: action.payload.comments,
        },
        loadingComments: {
          ...state.loadingComments,
          [action.payload.postId]: false,
        },
      };

    case actionTypes.ADD_COMMENT:
      const existingComments = state.comments[action.payload.postId] || [];
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.postId]: [...existingComments, action.payload.comment],
        },
        // Also update the post's comment count
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, comments: [...(post.comments || []), action.payload.comment] }
            : post
        ),
      };

    case actionTypes.SET_LOADING_COMMENTS:
      return {
        ...state,
        loadingComments: {
          ...state.loadingComments,
          [action.payload.postId]: action.payload.loading,
        },
      };

    case actionTypes.SET_CAMPUSES:
      return {
        ...state,
        campuses: action.payload,
      };

    case actionTypes.SET_NETWORK_STATUS:
      return {
        ...state,
        networkStatus: action.payload,
      };

    case actionTypes.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, { id: Date.now(), ...action.payload }],
      };

    case actionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      };

    case actionTypes.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload,
      };

    case actionTypes.SET_SHOW_TRENDING:
      return {
        ...state,
        showTrending: action.payload,
        posts: [], // Reset posts when switching between recent/trending
        postsOffset: 0,
        hasMorePosts: true,
      };

    case actionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case actionTypes.SET_SELECTED_POST:
      return {
        ...state,
        selectedPost: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user data from storage on app start
  useEffect(() => {
    loadUserData();
    loadCampuses();
  }, []);

  // User management functions
  const loadUserData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('anonymousUser');
      if (userData) {
        const user = JSON.parse(userData);
        dispatch({ type: actionTypes.SET_USER, payload: user });
        if (user.campus) {
          dispatch({ type: actionTypes.SET_SELECTED_CAMPUS, payload: user.campus });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const setUser = useCallback(async (userData) => {
    try {
      await AsyncStorage.setItem('anonymousUser', JSON.stringify(userData));
      dispatch({ type: actionTypes.SET_USER, payload: userData });
      if (userData.campus) {
        dispatch({ type: actionTypes.SET_SELECTED_CAMPUS, payload: userData.campus });
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to save user data', type: 'error' }
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('anonymousUser');
      dispatch({ type: actionTypes.LOGOUT_USER });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  // Posts management functions
  const loadCampuses = useCallback(async () => {
    try {
      const response = await apiService.getCampuses();
      if (response.success) {
        dispatch({ type: actionTypes.SET_CAMPUSES, payload: response.campuses });
      }
    } catch (error) {
      console.error('Error loading campuses:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to load campuses', type: 'error' }
      });
    }
  }, []);

  const loadPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        dispatch({ type: actionTypes.SET_REFRESHING, payload: true });
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
      }

      const offset = reset ? 0 : state.postsOffset;
      const response = await apiService.getPosts(
        state.selectedCampus,
        config.UI.POSTS_PER_PAGE,
        offset,
        state.showTrending
      );

      if (response.success) {
        dispatch({
          type: actionTypes.SET_POSTS,
          payload: {
            posts: response.posts,
            hasMore: response.posts.length === config.UI.POSTS_PER_PAGE,
            reset: reset,
          },
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to load posts', type: 'error' }
      });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      dispatch({ type: actionTypes.SET_REFRESHING, payload: false });
    }
  }, [state.postsOffset, state.selectedCampus, state.showTrending]);

  const createPost = useCallback(async (postData) => {
    try {
      const response = await apiService.createPost(postData);
      if (response.success) {
        dispatch({ type: actionTypes.ADD_POST, payload: response.post });
        return response.post;
      }
    } catch (error) {
      console.error('Error creating post:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to create post', type: 'error' }
      });
      throw error;
    }
  }, []);

  const likePost = useCallback(async (postId) => {
    try {
      const response = await apiService.toggleLike(postId);
      if (response.success) {
        dispatch({
          type: actionTypes.UPDATE_POST,
          payload: {
            id: postId,
            updates: { likes: response.likesCount, liked: response.isLiked },
          },
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to like post', type: 'error' }
      });
    }
  }, []);

  // Comments management functions
  const loadComments = useCallback(async (postId) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING_COMMENTS, payload: { postId, loading: true } });
      
      const response = await apiService.getComments(postId);
      if (response.success) {
        dispatch({
          type: actionTypes.SET_COMMENTS,
          payload: { postId, comments: response.comments },
        });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to load comments', type: 'error' }
      });
      dispatch({ type: actionTypes.SET_LOADING_COMMENTS, payload: { postId, loading: false } });
    }
  }, []);

  const addComment = useCallback(async (postId, commentData) => {
    try {
      const response = await apiService.addComment(postId, commentData);
      if (response.success) {
        dispatch({
          type: actionTypes.ADD_COMMENT,
          payload: { postId, comment: response.comment },
        });
        return response.comment;
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      dispatch({ 
        type: actionTypes.ADD_ERROR, 
        payload: { message: 'Failed to add comment', type: 'error' }
      });
      throw error;
    }
  }, []);

  // UI management functions
  const setSelectedCampus = useCallback((campus) => {
    dispatch({ type: actionTypes.SET_SELECTED_CAMPUS, payload: campus });
  }, []);

  const setShowTrending = useCallback((trending) => {
    dispatch({ type: actionTypes.SET_SHOW_TRENDING, payload: trending });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERRORS });
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,

    // Actions
    setUser,
    logout,
    loadPosts,
    createPost,
    likePost,
    loadComments,
    addComment,
    setSelectedCampus,
    setShowTrending,
    clearErrors,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { actionTypes };
export default AppContext;
