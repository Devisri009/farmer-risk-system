import client from './client';

export const getClimateAlerts = () => client.get('/climate/alerts');
export const getClimateCurrent = () => client.get('/climate/current');
export const getClimateForecast = () => client.get('/climate/forecast');
export const getAlertAnalytics = (id) => client.get(`/climate/alerts/${id}/analytics`);
export const getClimateInsights = () => client.get('/climate');
export const getCropRisk = () => client.get('/climate/risk');
export const getFarmingAdvice = () => client.get('/farming-advice');
export const getWeatherSourceStatus = () => client.get('/climate/source-status');
