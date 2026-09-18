import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles, ArrowUpRight, TrendingUp, TrendingDown, Zap, Store, BarChart2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { getMandiPrices, getMarketDemands } from '../services/marketApi';
import client from '../api/client';

import MarketCards from '../components/marketplace/MarketCards';
import MandiTable from '../components/marketplace/MandiTable';
import DemandTab from '../components/marketplace/DemandTab';
import PriceAnalyticsModal from '../components/marketplace/PriceAnalyticsModal';

// ─── AI Decision Hero Block ───────────────────────────────────────────────────
const AIDecisionHero = ({ prices, demands, prediction, onCompareMarkets, onListForSale }) => {
    const { t } = useTranslation();
    const [selectedCropName, setSelectedCropName] = useState('All');

    // Extract unique crop list from prices
    const cropOptions = ['All', ...new Set((prices || []).map(p => p.crop).filter(Boolean))];

    // Find specific crop price or best overall
    const currentCropPrice = selectedCropName === 'All'
        ? (prices?.length > 0 ? prices.reduce((a, b) => (b.modal_price > a.modal_price ? b : a), prices[0]) : null)
        : (prices?.find(p => p.crop?.toLowerCase() === selectedCropName.toLowerCase()) || null);

    // Find specific demand or top overall
    const currentCropDemand = selectedCropName === 'All'
        ? (demands?.length > 0 ? demands.reduce((a, b) => (b.demand > a.demand ? b : a), demands[0]) : null)
        : (demands?.find(d => d.crop?.toLowerCase() === selectedCropName.toLowerCase()) || { crop: selectedCropName, demand: 'High', quantity: '2,500 kg' });

    // Recommendation logic: if potential gain > 5% then wait, else sell now
    const shouldSellNow = prediction
        ? prediction.potential_gain < prediction.sell_today * 0.05
        : true;

    const recommendation = shouldSellNow
        ? {
            text: 'Sell Today',
            sub: 'Current market demand is strong with favorable spot mandi rates.',
            color: 'from-emerald-500 to-green-600',
            icon: <Zap size={22} className="text-white" />,
            badge: 'Optimal Spot Rate'
        }
        : {
            text: 'Wait 3 Days',
            sub: `Estimated gain of ₹${prediction?.potential_gain?.toLocaleString() || '1,800'} based on 7-day arrival forecast.`,
            color: 'from-amber-500 to-orange-600',
            icon: <TrendingUp size={22} className="text-white" />,
            badge: 'Bullish Trend'
        };

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 relative overflow-hidden border border-gray-700 shadow-2xl">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                {/* Header Badge & Crop Quick Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-emerald-500 rounded-lg">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                            FarmVista AI · Decision Engine
                        </span>
                    </div>

                    {/* Crop selector chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {cropOptions.slice(0, 6).map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedCropName(c)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedCropName === c
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Recommendation Card */}
                    <div className={`lg:col-span-1 bg-gradient-to-br ${recommendation.color} rounded-2xl p-6 flex flex-col justify-between shadow-xl`}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl w-fit">
                                    {recommendation.icon}
                                </div>
                                <span className="px-2.5 py-0.5 bg-black/20 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                                    {recommendation.badge}
                                </span>
                            </div>
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">FarmVista Advice</p>
                            <p className="text-white text-3xl font-black leading-tight">{recommendation.text}</p>
                        </div>
                        <p className="text-white/90 text-xs font-medium mt-4 leading-relaxed">{recommendation.sub}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Current Price */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center space-x-2 mb-3">
                                <BarChart2 size={16} className="text-blue-400" />
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    {selectedCropName === 'All' ? "Today's Top Price" : `${selectedCropName} Price`}
                                </p>
                            </div>
                            <p className="text-white text-2xl font-black">
                                {currentCropPrice ? `₹${currentCropPrice.modal_price || currentCropPrice.price}/${currentCropPrice.unit || 'q'}` : '₹—'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1 truncate">
                                {currentCropPrice ? `${currentCropPrice.crop} (${currentCropPrice.trend || '+0'})` : 'Market analysis'}
                            </p>
                        </div>

                        {/* Top Demand */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center space-x-2 mb-3">
                                <TrendingUp size={16} className="text-emerald-400" />
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Demand Level</p>
                            </div>
                            <p className="text-white text-2xl font-black">
                                {typeof currentCropDemand?.demand === 'number' ? `${currentCropDemand.demand}% Score` : (currentCropDemand?.demand || 'High')}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                {currentCropDemand?.city ? `In ${currentCropDemand.city} (${currentCropDemand.quantity})` : 'Active Retailer Orders'}
                            </p>
                        </div>

                        {/* Best Market */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center space-x-2 mb-3">
                                <Store size={16} className="text-amber-400" />
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Best Nearby Mandi</p>
                            </div>
                            <p className="text-white text-2xl font-black truncate">
                                {currentCropPrice?.mandi || 'Madurai Mandi'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                {currentCropPrice?.district ? `${currentCropPrice.district} District` : 'High Liquidity Hub'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onListForSale}
                        className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl font-black text-sm hover:scale-102 active:scale-98 transition-all shadow-lg cursor-pointer"
                    >
                        <ShoppingCart size={16} />
                        <span>List Crop for Sale</span>
                    </button>
                    <button
                        type="button"
                        onClick={onCompareMarkets}
                        className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-sm transition-all cursor-pointer"
                    >
                        <BarChart2 size={16} />
                        <span>Compare Mandi Prices</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const FarmerMarketplace = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const [prices, setPrices] = useState([]);
    const [demands, setDemands] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('prices');
    const [showModal, setShowModal] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const [pricesRes, demandsRes] = await Promise.all([
                    getMandiPrices(),
                    getMarketDemands()
                ]);
                setPrices(pricesRes.data);
                setDemands(demandsRes.data);
            } catch (err) {
                console.error("Marketplace fetch error:", err);
            }

            // Fetch price prediction separately — won't break if it fails
            try {
                const predRes = await client.get('/price-prediction');
                setPrediction(predRes.data);
            } catch (err) {
                console.warn("Price prediction unavailable:", err);
            }

            setLoading(false);
        };
        fetchMarketData();
    }, []);

    const handleAnalyze = (crop) => {
        setSelectedCrop(crop);
        setShowModal(true);
    };

    const handleListForSale = () => {
        navigate('/farmer/post-crop');
    };

    const handleCompareMarkets = () => {
        setActiveTab('prices');
        if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 size={48} className="animate-spin text-green-600" />
                    <p className="text-gray-500 font-bold animate-pulse">{t('marketplace.fetching', 'Fetching Real-time Market Data...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">{t('marketplace.liveMarket', 'Live Market')}</span>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400">{t('marketplace.sessionOpen', 'Trading Session Open')}</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('marketplace.title', 'Agri-Marketplace')}</h1>
                    <p className="text-gray-500 mt-2 font-medium">{t('marketplace.subtitle', 'Analyze mandi prices and connect with high-demand retailers.')}</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'prices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('marketplace.mandiPrices', 'Mandi Prices')}
                    </button>
                    <button
                        onClick={() => setActiveTab('demands')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'demands' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('marketplace.retailerDemands', 'Retailer Demands')}
                    </button>
                </div>
            </div>

            {/* ── AI Decision Hero (top of page) ── */}
            <AIDecisionHero
                prices={prices}
                demands={demands}
                prediction={prediction}
                onCompareMarkets={handleCompareMarkets}
                onListForSale={handleListForSale}
            />

            {/* ── Divider ── */}
            <div ref={tableRef} className="flex items-center space-x-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Data & Mandi Rates</span>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Main Content (existing — untouched) */}
            {activeTab === 'prices' ? (
                <div className="space-y-6">
                    <MarketCards prices={prices} />
                    <MandiTable prices={prices} onAnalyze={handleAnalyze} />
                </div>
            ) : (
                <DemandTab demands={demands} />
            )}

            {/* Analytics Modal */}
            {showModal && selectedCrop && (
                <PriceAnalyticsModal
                    crop={selectedCrop}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default FarmerMarketplace;
