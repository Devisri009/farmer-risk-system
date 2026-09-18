import client from './client';

export const getDashboardSummary = () => client.get('/dashboard/summary');
export const getClimateData = () => client.get('/climate');
export const getClimateRisk = () => client.get('/climate/risk');
export const getPricePrediction = () => client.get('/price-prediction');
export const getBatchesPerMonth = () => client.get('/dashboard/batches-per-month');
export const getCropRecommendations = (soilType = null) =>
    client.get('/crops/recommendations', { params: soilType ? { soil_type: soilType } : {} });
