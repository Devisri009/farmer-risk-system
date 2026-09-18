import client from '../api/client';

export const getMandiPrices = () => client.get('/mandi/prices');
export const getMarketDemands = () => client.get('/market-demand/demands');
export const getPriceInsights = (crop, price, trend, mandi) => 
    client.get(`/mandi/insights/${crop}`, {
        params: { price, trend, mandi }
    });
export const getAiMarketInsight = (crop, price, trend, mandi) =>
    client.get(`/market-ai/ai-market-insight/${crop}`, {
        params: { price, trend, mandi }
    });
