import client from './client';

export const getFarmerBatches = () => client.get('/farmer/batches');
export const getBatchById = (id) => client.get(`/farmer/batches/${id}`);
export const deleteBatch = (id) => client.delete(`/farmer/batches/${id}`);

/**
 * Create a new crop batch.
 * Sends multipart/form-data so images can be attached.
 *
 * Fields expected by backend:
 *   cropName      : string  (required)
 *   quantity      : string  (required)  e.g. "1000kg"
 *   pricePerKg    : number  (required)
 *   cultivateDate : string  (required)  ISO date yyyy-mm-dd
 *   harvestDate   : string  (required)  ISO date yyyy-mm-dd
 *   location      : string  (required)
 *   description   : string  (optional)
 *   images        : File[]  (optional)  up to 5 images
 */
export const postCrop = ({ cropName, quantity, pricePerKg, cultivateDate, harvestDate, location, description, images = [], blockchainTxHash = null }) => {
    const formData = new FormData();
    formData.append('cropName', cropName);
    formData.append('quantity', quantity);
    formData.append('pricePerKg', pricePerKg);
    formData.append('cultivateDate', cultivateDate);
    formData.append('harvestDate', harvestDate);
    formData.append('location', location);
    if (description) formData.append('description', description);
    if (blockchainTxHash) formData.append('blockchainTxHash', blockchainTxHash);
    images.forEach((file) => formData.append('images', file));

    return client.post('/crops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const updateBatchStatus = (id, status) => client.patch(`/farmer/batches/${id}/status`, { status });
export const updateBatchJourney = (id, stage, grade) => client.patch(`/farmer/batches/${id}/journey`, { stage, grade });

/**
 * Add a new chronological crop update event with photo/evidence.
 */
export const addBatchEvent = (batchId, { activity, eventDate, description, quantity, photo }) => {
    const formData = new FormData();
    formData.append('activity', activity);
    formData.append('eventDate', eventDate);
    formData.append('description', description);
    if (quantity) formData.append('quantity', quantity);
    if (photo) formData.append('photo', photo);

    return client.post(`/farmer/batches/${batchId}/events`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getBatchEvents = (batchId) => client.get(`/farmer/batches/${batchId}/events`);

export const getCropRecommendations = (soilType = null) =>
    client.get('/crops/recommendations', { params: soilType ? { soil_type: soilType } : {} });

