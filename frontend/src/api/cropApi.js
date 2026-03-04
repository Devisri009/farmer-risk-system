import apiClient from './client';

export const getFarmerBatches = () => apiClient.get('/farmer/batches');
export const getBatchById = (id) => apiClient.get(`/farmer/batches/${id}`);
export const postCrop = (data) => apiClient.post('/crops', data);
export const deleteBatch = (id) => apiClient.delete(`/farmer/batches/${id}`);
export const updateBatch = (id, data) => apiClient.put(`/farmer/batches/${id}`, data);
