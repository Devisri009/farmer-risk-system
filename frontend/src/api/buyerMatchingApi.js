import client from './client';

export const getBuyerDemands = (params) => client.get('/matching/buyer/demands', { params });
export const createBuyerDemand = (data) => client.post('/matching/buyer/demands', data);

export const enrollInSupplyPool = (data) => client.post('/matching/farmer/supply-pool', data);
export const getMySupplyPool = () => client.get('/matching/farmer/supply-pool');
export const getPublicSupplyPool = (params) => client.get('/matching/supply-pool', { params });

export const triggerMatching = (demandId) => client.post(`/matching/trigger/${demandId}`);
export const getAggregatedContracts = () => client.get('/matching/contracts');
export const confirmContract = (contractId) => client.patch(`/matching/contracts/${contractId}/confirm`);
