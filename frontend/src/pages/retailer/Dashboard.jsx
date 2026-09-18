import React, { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

const RetailerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [recentPurchases, setRecentPurchases] = useState([]);
    const [quickMarket, setQuickMarket] = useState([]);
    const [summaryData, setSummaryData] = useState({
        totalSpend: "0",
        inventoryValue: "0",
        avgMargin: "0%",
        activePurchases: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch purchases for dashboard
                const res = await apiClient.get('/retailer/purchases');
                const purchases = res.data;
                
                // Keep only top 5 for recent
                setRecentPurchases(purchases.slice(0, 5));
                
                // Calculate simple summary values
                const total = purchases.reduce((sum, p) => sum + p.total_paid, 0);
                
                setSummaryData({
                    totalSpend: total.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                    inventoryValue: (total * 1.35).toLocaleString(undefined, { maximumFractionDigits: 0 }), // 35% simulated margin markup
                    avgMargin: "35%",
                    activePurchases: purchases.filter(p => p.status !== 'Delivered').length
                });

                // Fetch a quick preview of marketplace crops
                const mktRes = await apiClient.get('/marketplace');
                // Randomize or slice top 3
                const topPicks = mktRes.data.sort(() => 0.5 - Math.random()).slice(0, 3);
                setQuickMarket(topPicks);

            } catch (error) {
                console.error("Dashboard fetch error:", error);
                // Fallback
                setRecentPurchases([
                    { id: "FB-7098", crop_name: "Organic Carrots", farmer_name: "Valley Produce", status: "Delivered", date: "2026-02-15" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:flex-row flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
                    <p className="text-gray-500">Welcome back. Here's what's happening with your inventory today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Spent" value={`$${summaryData.totalSpend}`} icon={<DollarSign size={24} />} color="blue" />
                <DashboardCard title="Est. Inventory Value" value={`$${summaryData.inventoryValue}`} icon={<Package size={24} />} color="green" />
                <DashboardCard title="Avg Profit Margin" value={summaryData.avgMargin} icon={<TrendingUp size={24} />} color="purple" />
                <DashboardCard title="Active Purchases" value={summaryData.activePurchases} icon={<AlertCircle size={24} />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-bold text-gray-900">Recent Purchases</h2>
                         <Link to="/retailer/purchases" className="text-primary-green hover:underline text-sm font-semibold">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-sm border-b border-gray-100">
                                    <th className="pb-3 font-medium">Batch ID</th>
                                    <th className="pb-3 font-medium">Crop</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">Loading recent purchases...</td>
                                    </tr>
                                ) : recentPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">No recent purchases found. Browse the marketplace to get started.</td>
                                    </tr>
                                ) : (
                                    recentPurchases.map(p => (
                                        <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group">
                                            <td className="py-4 font-bold text-gray-900 group-hover:text-primary-green transition-colors">{p.id}</td>
                                            <td className="py-4 font-medium text-gray-700">{p.crop_name}</td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                                    p.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    p.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-500 font-medium">{p.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm border border-green-200 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp size={100} />
                        </div>
                        <div className="p-3 bg-white rounded-full shadow-sm text-green-600 z-10 mb-3">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 z-10 mb-2">Ready to boost margins?</h3>
                        <p className="text-gray-600 z-10 text-sm mb-4">Analyze your current buying trends and uncover potential margins.</p>
                        <Link to="/retailer/margin-analysis" className="px-6 py-2.5 bg-primary-green text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition w-full z-10">
                            View Analysis
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Fresh from Farmers</h2>
                            <Link to="/retailer/marketplace" className="text-blue-600 hover:underline text-sm font-semibold">Browse All</Link>
                        </div>
                        
                        <div className="space-y-3">
                            {quickMarket.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No crops available right now.</p>
                            ) : (
                                quickMarket.map(crop => (
                                    <div key={crop.id} className="p-3 rounded-xl border border-gray-100 hover:border-primary-green hover:shadow-md transition-all group cursor-pointer block">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 group-hover:text-primary-green transition-colors">{crop.cropName}</h4>
                                            <span className="font-bold text-primary-green">${crop.price} <span className="text-xs text-gray-400 font-normal">/kg</span></span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>{crop.quantity}</span>
                                            <Link to={`/retailer/payment/${crop.id}`} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-semibold group-hover:bg-primary-green group-hover:text-white transition-colors">
                                                Buy
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div>
                <p className="text-gray-500 font-bold text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
                {icon}
            </div>
        </div>
    );
};

export default RetailerDashboard;
