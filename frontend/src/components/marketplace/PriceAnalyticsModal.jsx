import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Info, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getPriceInsights } from '../../services/marketApi';
import { useTranslation } from 'react-i18next';

const PriceAnalyticsModal = ({ crop, onClose }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await getPriceInsights(crop.crop, crop.price, crop.trend, crop.mandi);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch price insights:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [crop]);

    if (!crop) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">{t('analytics.liveAnalysis', 'Live Analysis')}</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">{t(`crops.${crop.crop}`, crop.crop)} @ {t(`location.${crop.mandi}`, crop.mandi)}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[80vh]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 size={48} className="animate-spin text-green-600" />
                            <p className="text-gray-500 font-bold animate-pulse">{t('analytics.fetching', 'Processing Market Data...')}</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('analytics.bestMandi', 'Recommend Mandi')}</p>
                                    <h4 className="text-xl font-black text-gray-900">{t(`location.${data.best_mandi}`, data.best_mandi)}</h4>
                                    <p className="text-xs font-bold text-green-600 flex items-center mt-1">
                                        <TrendingUp size={14} className="mr-1" /> {t('analytics.highestRate', 'Highest Current Rate')}
                                    </p>
                                </div>
                                <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('analytics.demand', 'Demand Level')}</p>
                                    <h4 className="text-xl font-black text-gray-900">{t(`marketplace.demandLevels.${data.demand_level}`, data.demand_level)}</h4>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                                        <div className={`h-full ${data.demand_level === 'High' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: data.demand_level === 'High' ? '85%' : '60%' }} />
                                    </div>
                                </div>
                                <div className="bg-gray-900 p-5 rounded-3xl shadow-lg relative overflow-hidden">
                                     <Sparkles size={60} className="absolute -right-4 -bottom-4 text-white/5" />
                                     <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">{t('analytics.currentRate', 'Current Rate')}</p>
                                     <h4 className="text-2xl font-black text-white">₹{crop.price} <span className="text-xs font-bold text-gray-400">/ {t(`units.${crop.unit}`, crop.unit)}</span></h4>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-green-600" />
                                    {t('analytics.7dTrend', '7-Day Price Trend')}
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.trend7d}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis 
                                                dataKey="day" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }} 
                                                domain={['auto', 'auto']}
                                                dx={-10}
                                            />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="price" 
                                                stroke="#22c55e" 
                                                strokeWidth={4} 
                                                fillOpacity={1} 
                                                fill="url(#colorPrice)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* AI Recommendation */}
                            <div className="bg-green-50 border border-green-100 p-8 rounded-[2rem] relative overflow-hidden group">
                                <Sparkles className="absolute -right-4 -top-4 text-green-200/40 group-hover:scale-125 transition-transform duration-500" size={80} />
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-green-600 rounded-lg">
                                        <Sparkles size={14} className="text-white" />
                                    </div>
                                    <span className="text-green-800 text-xs font-black uppercase tracking-widest">{t('analytics.aiAdvisor', 'FarmVista AI Advisor')}</span>
                                </div>
                                <p className="text-green-900 font-bold text-lg leading-relaxed relative z-10">
                                    "{data.ai_recommendation || t('analytics.advicePlaceholder', 'Our AI is analyzing the local market patterns for you...')}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
                            <p className="text-gray-500 font-bold">{t('analytics.noInsights', 'No insights available for this crop currently.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceAnalyticsModal;
