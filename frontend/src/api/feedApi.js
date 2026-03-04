import apiClient from './client';

export const getFeedPosts = () => apiClient.get('/feed');
export const likePost = (postId) => apiClient.post(`/feed/${postId}/like`);
export const commentOnPost = (postId, comment) => apiClient.post(`/feed/${postId}/comment`, { comment });
