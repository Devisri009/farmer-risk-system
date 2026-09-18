import client from './client';

export const getMarketPrices = () => client.get('/marketplace/prices');
export const getRetailerDemands = () => client.get('/marketplace/demands');
export const getMarketInsights = () => client.get('/marketplace/insights');
