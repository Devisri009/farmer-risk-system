import apiClient from './client';

export const getDashboardSummary = () => apiClient.get('/dashboard/summary');
export const getClimateData = () => apiClient.get('/climate');
export const getPricePrediction = () => apiClient.get('/price-prediction');
export const getClimateRisk = () => apiClient.get('/climate/risk');
