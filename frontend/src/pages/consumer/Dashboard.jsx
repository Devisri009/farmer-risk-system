import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, DollarSign, TrendingUp, AlertCircle, Building2, ChevronRight, Sparkles, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { getBuyerDemands } from '../../api/buyerMatchingApi';

const ConsumerDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [recentPurchases, setRecentPurchases] = useState([]);
    const [quickMarket, setQuickMarket] = useState([]);
    const [myDemands, setMyDemands] = useState([]);
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
                const [resPurchases, resDemands, mktRes] = await Promise.allSettled([
                    apiClient.get('/consumer/purchases'),
                    getBuyerDemands(),
                    apiClient.get('/marketplace')
                ]);

                const purchases = resPurchases.status === 'fulfilled' ? resPurchases.value.data : [];
                setRecentPurchases(purchases.slice(0, 5));

                const demands = resDemands.status === 'fulfilled' ? resDemands.value.data : [];
                setMyDemands(demands.slice(0, 3));
                
                // Calculate simple summary values
                const total = purchases.reduce((sum, p) => sum + (p.total_paid || 0), 0);
                
                setSummaryData({
                    totalSpend: total.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                    inventoryValue: (total * 1.35).toLocaleString(undefined, { maximumFractionDigits: 0 }),
                    avgMargin: "35%",
                    activePurchases: purchases.filter(p => p.status !== 'Delivered').length
                });

                const topPicks = mktRes.status === 'fulfilled' ? mktRes.value.data.sort(() => 0.5 - Math.random()).slice(0, 3) : [];
                setQuickMarket(topPicks);

            } catch (error) {
                console.error("Dashboard fetch error:", error);
                setRecentPurchases([]);
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
                    <h1 className="text-2xl font-bold text-gray-900">{t('consumer.dashboardTitle', 'Consumer Dashboard')}</h1>
                    <p className="text-gray-500">{t('consumer.dashboardSubtitle', "Welcome back. Here's what's happening with your purchases today.")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/consumer/buyer-demands"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
                    >
                        <TrendingUp size={16} />
                        <span>{t('consumer.postBulkDemand', 'Post Bulk Demand')}</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title={t('consumer.totalSpent', 'Total Spent')} value={`₹${summaryData.totalSpend}`} icon={<IndianRupee size={24} />} color="blue" />
                <DashboardCard title={t('consumer.estInventoryValue', 'Est. Inventory Value')} value={`₹${summaryData.inventoryValue}`} icon={<Package size={24} />} color="green" />
                <DashboardCard title={t('consumer.avgMargin', 'Avg Profit Margin')} value={summaryData.avgMargin} icon={<TrendingUp size={24} />} color="purple" />
                <DashboardCard title={t('consumer.activePurchases', 'Active Purchases')} value={summaryData.activePurchases} icon={<AlertCircle size={24} />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-bold text-gray-900">{t('consumer.recentPurchases', 'Recent Purchases')}</h2>
                         <Link to="/consumer/purchases" className="text-primary-green hover:underline text-sm font-semibold">{t('consumer.viewAll', 'View All')}</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-sm border-b border-gray-100">
                                    <th className="pb-3 font-medium">{t('consumer.batchId', 'Batch ID')}</th>
                                    <th className="pb-3 font-medium">{t('consumer.crop', 'Crop')}</th>
                                    <th className="pb-3 font-medium">{t('consumer.status', 'Status')}</th>
                                    <th className="pb-3 font-medium">{t('consumer.date', 'Date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">{t('consumer.loadingPurchases', 'Loading recent purchases...')}</td>
                                    </tr>
                                ) : recentPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">{t('consumer.noPurchases', 'No recent purchases found. Browse the marketplace to get started.')}</td>
                                    </tr>
                                ) : (
                                    recentPurchases.map(p => (
                                        <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group">
                                            <td className="py-4 font-bold text-gray-900 group-hover:text-primary-green transition-colors">{p.id}</td>
                                            <td className="py-4 font-medium text-gray-700">{t(`crops.${p.crop_name}`, p.crop_name)}</td>
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
                        <h3 className="text-xl font-bold text-gray-900 z-10 mb-2">{t('consumer.readyToBoostMargins', 'Ready to boost margins?')}</h3>
                        <p className="text-gray-600 z-10 text-sm mb-4">{t('consumer.marginBoostSub', 'Analyze your current buying trends and uncover potential margins.')}</p>
                        <Link to="/consumer/margin-analysis" className="px-6 py-2.5 bg-primary-green text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition w-full z-10">
                            {t('consumer.viewAnalysis', 'View Analysis')}
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Building2 size={18} className="text-blue-600" />
                                <span>{t('consumer.myBulkDemands', 'My Bulk Demands')}</span>
                            </h2>
                            <Link to="/consumer/buyer-demands" className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1">
                                <span>{t('consumer.manage', 'Manage')}</span>
                                <ChevronRight size={14} />
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {myDemands.length === 0 ? (
                                <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">{t('consumer.noBulkDemands', 'No bulk procurement demands posted yet.')}</p>
                                    <Link to="/consumer/buyer-demands" className="text-xs font-bold text-blue-600 hover:underline">
                                        {t('consumer.postFirstDemand', 'Post your first demand →')}
                                    </Link>
                                </div>
                            ) : (
                                myDemands.map(d => (
                                    <div key={d.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                                                    {t(`matching.categories.${d.buyer_category || d.buyerCategory}`, d.buyer_category || d.buyerCategory || 'Direct')}
                                                </span>
                                                <h4 className="font-bold text-gray-900 text-sm mt-1">{t(`crops.${d.crop_name || d.cropName}`, d.crop_name || d.cropName)}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{t('matching.quantity', 'Target')}: {d.target_quantity_kg || d.targetQuantityKg} kg @ ₹{d.max_price_per_kg || d.maxPricePerKg}/kg</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                d.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                d.status === 'Matched' ? 'bg-blue-100 text-blue-700 font-black' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {d.status}
                                            </span>
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

export default ConsumerDashboard;
