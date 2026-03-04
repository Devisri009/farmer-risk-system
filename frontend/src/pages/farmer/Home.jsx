import React, { useState, useEffect } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import ClimateCard from '../../components/dashboard/ClimateCard';
import PriceComparison from '../../components/dashboard/PriceComparison';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/client';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, climateRes, priceRes] = await Promise.all([
                    apiClient.get('/api/dashboard-summary').catch(() => null),
                    apiClient.get('/api/climate-risk').catch(() => null),
                    apiClient.get('/api/price-prediction').catch(() => null)
                ]);

                // If API returns data, use it. Otherwise use fallback for UI presentation
                setData({
                    metrics: summaryRes?.data || { activeBatches: 12, estimatedRevenue: '24,500', climateAlerts: 2 },
                    climate: climateRes?.data || { temp: 32, rainProb: 80, humidity: 75, riskLevel: 'Moderate' },
                    pricePrediction: priceRes?.data || { todayPrice: 15.50, waitPrice: 18.20, unit: 'kg' }
                });
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                // Hard Fallback
                setData({
                    metrics: { activeBatches: 12, estimatedRevenue: '24,500', climateAlerts: 2 },
                    climate: { temp: 32, rainProb: 80, humidity: 75, riskLevel: 'Moderate' },
                    pricePrediction: { todayPrice: 15.50, waitPrice: 18.20, unit: 'kg' }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h2>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                    Last updated: Just now
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Crop Batches"
                    value={data?.metrics?.activeBatches}
                    icon={<Package size={24} />}
                    bgColor="bg-primary-green"
                />
                <StatCard
                    title="Estimated Revenue"
                    value={`$${data?.metrics?.estimatedRevenue}`}
                    icon={<DollarSign size={24} />}
                    bgColor="bg-accent-blue"
                />
                <StatCard
                    title="Climate Alerts"
                    value={data?.metrics?.climateAlerts}
                    icon={<AlertTriangle size={24} />}
                    bgColor={data?.metrics?.climateAlerts > 0 ? "bg-alert-red" : "bg-gray-400"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="h-full">
                    <ClimateCard data={data?.climate} />
                </div>
                <div className="h-full">
                    <PriceComparison
                        todayPrice={data?.pricePrediction?.todayPrice}
                        waitPrice={data?.pricePrediction?.waitPrice}
                        unit={data?.pricePrediction?.unit}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
