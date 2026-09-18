/**
 * feedApi.js — Community Feed API integration layer
 *
 * All requests go through the shared Axios client which automatically
 * attaches the `Authorization: Bearer <token>` header.
 *
 * Expected backend base: http://localhost:5000/api
 *
 * ─── Endpoints consumed ───────────────────────────────────────────
 * GET    /feed                   → list all posts (paginated)
 * GET    /feed?page=1&limit=10   → paginated posts
 * POST   /feed                   → create a new post
 * DELETE /feed/:postId           → delete your own post
 *
 * POST   /feed/:postId/like      → toggle helpful mark on a post
 * POST   /feed/:postId/save      → toggle save on a post
 *
 * GET    /feed/:postId/comments  → get comments for a post
 * POST   /feed/:postId/comments  → add a comment
 * DELETE /feed/:postId/comments/:commentId → delete a comment
 *
 * POST   /feed/:postId/ai-suggestion → get AI suggestion for a post
 *
 * GET    /feed/trending-tags     → get trending hashtag list
 * GET    /feed/suggestions       → get "farmers to follow" suggestions
 * POST   /feed/follow/:userId    → follow a farmer
 *
 * GET    /feed/stories           → get stories bar list
 * ─────────────────────────────────────────────────────────────────
 */

import client from './client';

// ─── Posts ────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated feed posts.
 * @param {number} page - 1-indexed page number (default 1)
 * @param {number} limit - posts per page (default 10)
 * @param {string} tag - optional filter tag ('alert'|'update'|'tip'|'rain'|'question')
 * @param {string} crop - optional crop type filter
 */
export const getFeedPosts = (page = 1, limit = 10, tag = null, crop = null) => {
    const params = { page, limit };
    if (tag && tag !== 'all') params.tag = tag;
    if (crop) params.crop = crop;
    return client.get('/feed', { params });
};

/**
 * Create a new feed post.
 * Supports text + image upload + audio upload via multipart/form-data.
 *
 * @param {{ content: string, tag: string, cropType: string, image: File, audio: File }} data
 */
export const createPost = ({ content, tag, cropType, image, audio }) => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('tag', tag);
    if (cropType) formData.append('cropType', cropType);
    if (image) formData.append('image', image);
    if (audio) formData.append('audio', audio);

    return client.post('/feed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Delete your own post.
 * @param {string} postId
 */
export const deletePost = (postId) => client.delete(`/feed/${postId}`);

// ─── Reactions ────────────────────────────────────────────────────────────────

/**
 * Toggle "Helpful" mark on a post.
 * @param {string} postId
 *
 * Expected response:
 * { liked: boolean, likes: number }
 */
export const toggleLike = (postId) => client.post(`/feed/${postId}/like`);

/**
 * Toggle save on a post.
 * @param {string} postId
 *
 * Expected response:
 * { saved: boolean }
 */
export const toggleSave = (postId) => client.post(`/feed/${postId}/save`);

// ─── Comments ────────────────────────────────────────────────────────────────

/**
 * Get all comments for a post.
 * @param {string} postId
 */
export const getComments = (postId) => client.get(`/feed/${postId}/comments`);

/**
 * Add a comment to a post.
 * @param {string} postId
 * @param {string} text
 */
export const addComment = (postId, text) =>
    client.post(`/feed/${postId}/comments`, { text });

/**
 * Delete your own comment.
 * @param {string} postId
 * @param {string} commentId
 */
export const deleteComment = (postId, commentId) =>
    client.delete(`/feed/${postId}/comments/${commentId}`);

// ─── AI Suggestion ───────────────────────────────────────────────────────────

/**
 * Get AI-powered suggestion for a post (mainly question posts).
 * @param {string} postId
 */
export const getAiSuggestion = (postId) =>
    client.post(`/feed/${postId}/ai-suggestion`);

// ─── Discovery ───────────────────────────────────────────────────────────────

/**
 * Get trending hashtags.
 */
export const getTrendingTags = () => client.get('/feed/trending-tags');

/**
 * Get "Farmers to Follow" suggestions.
 */
export const getFollowSuggestions = () => client.get('/feed/suggestions');

/**
 * Follow or unfollow a farmer.
 * @param {string} userId
 */
export const followFarmer = (userId) => client.post(`/feed/follow/${userId}`);

// ─── Stories ────────────────────────────────────────────────────────────────

/**
 * Get stories bar items.
 */
export const getStories = () => client.get('/feed/stories');

// ─── Backward-compat alias (do not remove) ───────────────────────────────────
export const getFeed = (page = 1, limit = 10, tag = null) => {
    const params = { page, limit };
    if (tag && tag !== 'all') params.tag = tag;
    return client.get('/feed', { params });
};
