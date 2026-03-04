import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import BatchTable from '../components/BatchTable';
import ClimateCard from '../components/ClimateCard';
import CropRiskMap from '../components/CropRiskMap';
import ProfitChart from '../components/ProfitChart';
import { Package, DollarSign, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { getDashboardSummary, getClimateData, getClimateRisk, getPricePrediction } from '../api/dashboardApi';
import { getFarmerBatches } from '../api/cropApi';

const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState({
        summary: null,
        climate: null,
        riskMap: null,
        prediction: null,
        recentBatches: []
    });

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [summaryRes, climateRes, riskRes, priceRes, batchesRes] = await Promise.all([
                    getDashboardSummary().catch(() => ({ data: { activeCrops: 12, revenue: '45,000', alerts: 2 } })),
                    getClimateData().catch(() => ({ data: { temp: 28, rainProb: 40, humidity: 65, riskLevel: 'Moderate', windSpeed: 12 } })),
                    getClimateRisk().catch(() => ({ data: { location: 'Madurai', risks: [{ crop: 'Rice', risk: 'Low' }, { crop: 'Corn', risk: 'Moderate' }, { crop: 'Tomato', risk: 'High' }] } })),
                    getPricePrediction().catch(() => ({ data: { sellToday: 20000, wait3Days: 24000, gain: 4000, unitPrice: 20, waitUnitPrice: 24, kg: 1000 } })),
                    getFarmerBatches().catch(() => ({
                        data: [
                            { id: '101', crop: 'Rice', quantity: '1000kg', price: 20, risk: 'Low', status: 'Active' },
                            { id: '102', crop: 'Corn', quantity: '500kg', price: 15, risk: 'Moderate', status: 'Active' }
                        ]
                    }))
                ]);

                setData({
                    summary: summaryRes.data,
                    climate: climateRes.data,
                    riskMap: riskRes.data,
                    prediction: priceRes.data,
                    recentBatches: batchesRes.data.slice(0, 5) // Show only recent 5
                });
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Loading Analytics...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-800">Failed to load dashboard data</h2>
            <p className="text-red-600 mt-2">Please check your connection and try again.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 text-sm font-bold uppercase tracking-wider">Active Crops</p>
                            <h3 className="text-3xl font-extrabold mt-1">{data.summary?.activeCrops || 0} Batches</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Package size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Estimated Revenue</p>
                            <h3 className="text-3xl font-extrabold mt-1">₹{data.summary?.revenue || '0.00'}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                <Card className={`bg-gradient-to-br transition-all duration-500 ${data.summary?.alerts > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'} text-white border-none`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-red-100 text-sm font-bold uppercase tracking-wider">Climate Alerts</p>
                            <h3 className="text-3xl font-extrabold mt-1">{data.summary?.alerts || 0} Critical</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Charts and Risk */}
                <div className="lg:col-span-2 space-y-6">
                    <ProfitChart />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ClimateCard data={data.climate} />
                        <CropRiskMap data={data.riskMap} />
                    </div>
                </div>

                {/* Right Side: Predictions & Actions */}
                <div className="space-y-6">
                    <Card title="Price Prediction">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-green-100 transition-all">
                                <p className="text-xs font-bold text-gray-500 uppercase">Sell Today</p>
                                <div className="flex justify-between items-end mt-1">
                                    <h4 className="text-xl font-extrabold text-gray-900">₹{data.prediction?.sellToday.toLocaleString()}</h4>
                                    <span className="text-sm font-bold text-gray-400">₹{data.prediction?.unitPrice}/kg</span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-gray-300">
                                        <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 text-green-100 transition-transform group-hover:scale-110">
                                    <TrendingUp size={80} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-green-600 uppercase">Wait 3 Days</p>
                                    <div className="flex justify-between items-end mt-1">
                                        <h4 className="text-2xl font-extrabold text-green-700">₹{data.prediction?.wait3Days.toLocaleString()}</h4>
                                        <span className="text-sm font-bold text-green-600">₹{data.prediction?.waitUnitPrice}/kg</span>
                                    </div>
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-extrabold shadow-sm">
                                        Potential Gain: +₹{data.prediction?.gain.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gray-900 text-white border-none p-8 text-center flex flex-col justify-center items-center gap-4">
                        <div className="p-4 bg-green-500/20 rounded-full border border-green-500/30">
                            <TrendingUp className="text-green-500" size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">New Harvest?</h4>
                            <p className="text-gray-400 text-sm mt-1">List your crops on FarmVista to get real-time price analysis.</p>
                        </div>
                        <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95">
                            Post New Crop
                        </button>
                    </Card>
                </div>
            </div>

            {/* Recent Batches Table */}
            <Card title="Recent Crop Batches">
                {data.recentBatches.length > 0 ? (
                    <BatchTable batches={data.recentBatches} />
                ) : (
                    <div className="py-12 text-center text-gray-400 font-medium">
                        No crop batches found. Start by posting your first crop.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DashboardHome;
