// src/services/api.js
import axios from 'axios';

// ✅ Update BASE_URL with your ngrok URL + /api
const BASE_URL = 'https://77101fcb736e.ngrok-free.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 3000000, // 15 seconds timeout
});

// ✅ Add authentication headers if needed
const authHeaders = () => ({
  // Example: Authorization: `Bearer ${token}`,
});

// =======================
// USER PROFILE FUNCTIONS
// =======================

// Fetch current user profile
const getProfile = async () => {
  const response = await api.get('/profile', { headers: authHeaders() });
  return response.data;
};

// Create or update user profile
const createProfile = async (profileData) => {
  const response = await api.post('/profile', profileData, { headers: authHeaders() });
  return response.data;
};

// =======================
// POSTS FUNCTIONS
// =======================

// Fetch posts with pagination
const getPosts = async (limit = 20, lastDocId = null) => {
  const response = await api.get('/posts', {
    params: { limit, lastDocId },
    headers: authHeaders(),
  });
  return response.data;
};

// ✅ Create a new post
const createPost = async (postData) => {
  const response = await api.post('/posts', postData, { headers: authHeaders() });
  return response.data;
};

// =======================
// REACTIONS FUNCTIONS
// =======================

// Add a reaction to a post
const addReaction = async (postId, type) => {
  const response = await api.post(`/reactions/${postId}`, { type }, { headers: authHeaders() });
  return response.data;
};

// =======================
// EXPORT FUNCTIONS
// =======================
export default {
  getProfile,
  createProfile,
  getPosts,
  createPost,   // <-- ✅ Added this so frontend can call createPost
  addReaction,
};
