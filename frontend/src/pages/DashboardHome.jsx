import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import ClimateCard from '../components/ClimateCard';
import CropRiskMap from '../components/CropRiskMap';
import BatchChart from '../components/ProfitChart';
import BatchTable from '../components/BatchTable';
import CropRecommendationsWidget from '../components/CropRecommendationsWidget';
import { 
    Package, IndianRupee, AlertTriangle, TrendingUp, TrendingDown, Minus, 
    Sparkles, ShieldCheck, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Info, Zap,
    Users, ChevronRight, CheckCheck
} from 'lucide-react';
import {
    getDashboardSummary,
    getClimateData,
    getPricePrediction,
    getClimateRisk,
    getBatchesPerMonth
} from '../api/dashboardApi';
import { getFarmerBatches } from '../api/cropApi';
import { getAggregatedContracts } from '../api/buyerMatchingApi';

const DashboardHome = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [showFactors, setShowFactors] = useState(false);

    const [summaryData, setSummaryData] = useState(null);
    const [climateData, setClimateData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [priceData, setPriceData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [batches, setBatches] = useState([]);
    const [matchedContracts, setMatchedContracts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sumRes, cliRes, riskRes, priceRes, batchRes, chartRes, contractRes] = await Promise.allSettled([
                    getDashboardSummary(),
                    getClimateData(),
                    getClimateRisk(),
                    getPricePrediction(),
                    getFarmerBatches(),
                    getBatchesPerMonth(),
                    getAggregatedContracts()
                ]);

                setSummaryData(sumRes.status === 'fulfilled' ? sumRes.value.data : { activeCrops: 0, revenue: '0', alerts: 0 });
                setClimateData(cliRes.status === 'fulfilled' ? cliRes.value.data : null);
                setRiskData(riskRes.status === 'fulfilled' ? riskRes.value.data : null);
                setPriceData(priceRes.status === 'fulfilled' ? priceRes.value.data : { sellToday: 0, wait3Days: 0, potentialGain: 0 });
                setBatches(batchRes.status === 'fulfilled' ? batchRes.value.data.slice(0, 5) : []);
                setChartData(chartRes.status === 'fulfilled' ? chartRes.value.data : []);
                setMatchedContracts(contractRes.status === 'fulfilled' ? contractRes.value.data : []);

            } catch (err) {
                console.error('Dashboard Fetch Error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
    );

    const hasPrediction = priceData && (priceData.sellToday > 0 || priceData.sell_today > 0);
    const sellToday = priceData?.sellToday ?? priceData?.sell_today ?? 0;
    const wait3Days = priceData?.wait3Days ?? priceData?.wait_3_days ?? 0;
    const potentialGain = priceData?.potentialGain ?? priceData?.potential_gain ?? 0;

    const activeCount = summaryData?.activeCrops ?? summaryData?.active_crops ?? 0;
    const revenue = summaryData?.revenue ?? '0';
    const alerts = summaryData?.alerts ?? 0;

    return (
        <div className="space-y-6">
            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Active Crops */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-semibold mb-1">{t('dashboard.activeCrops', 'Active Crops')}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{activeCount}</h3>
                    </div>
                    <div className="p-4 bg-green-50 text-green-700 rounded-full">
                        <Package size={24} />
                    </div>
                </div>

                {/* Estimated Revenue */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-semibold mb-1">{t('dashboard.revenue', 'Estimated Revenue')}</p>
                        <h3 className="text-3xl font-bold text-gray-900">₹{revenue}</h3>
                        {revenue === '0' && (
                            <p className="text-xs text-gray-400 mt-1">{t('dashboard.noRevenue', 'No active crops listed')}</p>
                        )}
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-700 rounded-full">
                        <IndianRupee size={24} />
                    </div>
                </div>

                {/* Climate Alerts */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-semibold mb-1">{t('dashboard.alerts', 'Climate Alerts')}</p>
                        <h3 className={`text-3xl font-bold ${alerts > 0 ? 'text-red-600' : 'text-gray-900'}`}>{alerts}</h3>
                        {alerts === 0 && (
                            <p className="text-xs text-gray-400 mt-1">{t('dashboard.noAlerts', 'All crops at low risk')}</p>
                        )}
                    </div>
                    <div className={`p-4 rounded-full ${alerts > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                        <AlertTriangle size={24} />
                    </div>
                </div>

                {/* Blockchain Verified Batches */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-semibold mb-1">{t('dashboard.onChainVerified', 'On-Chain Verified')}</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {batches.filter(b => b.blockchain_tx_hash || b.blockchainTxHash || b.blockchain_status === 'confirmed' || b.blockchainStatus === 'confirmed').length}
                        </h3>
                        <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t('dashboard.polygonLive', 'Polygon Amoy Live')}
                        </p>
                    </div>
                    <div className="p-4 bg-indigo-50 text-indigo-700 rounded-full">
                        <ShieldCheck size={24} />
                    </div>
                </div>
            </div>

            {/* Chart + Prediction Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <BatchChart data={chartData} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ClimateCard
                            data={climateData || { temp: null, rainProb: null, humidity: null, windSpeed: null }}
                            riskLevel={alerts > 0 ? 'High' : 'Low'}
                        />
                        <CropRiskMap data={riskData || { location: '', risks: [] }} />
                    </div>
                </div>

                {/* Sell vs Wait Prediction */}
                <div className="space-y-6">
                    <Card title={t('dashboard.prediction', 'Sell vs Wait Prediction')} className="h-full">
                        {!hasPrediction ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                                <Minus size={36} strokeWidth={1.2} />
                                <p className="text-sm font-medium text-center">
                                    {t('dashboard.noPrediction', 'Post a crop batch to see sell predictions')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Header Badges: Action & AI Confidence */}
                                <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                        (priceData?.action === 'WAIT' || potentialGain > 0)
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        <Zap size={13} className="shrink-0" />
                                        {(priceData?.action === 'WAIT' || potentialGain > 0) ? t('dashboard.actionWait', 'Action: Wait 3 Days') : t('dashboard.actionSell', 'Action: Sell Today')}
                                    </span>

                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-[11px] font-bold">
                                        <ShieldCheck size={13} className="text-amber-600" />
                                        <span>{priceData?.confidenceScore ?? priceData?.confidence_score ?? 85}% {t('dashboard.confidence', 'Confidence')}</span>
                                    </span>
                                </div>

                                {priceData?.cropName || priceData?.crop_name ? (
                                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                        <span>{t('dashboard.forBatch', 'For crop:')}</span>
                                        <span className="font-bold text-gray-800">{priceData?.cropName || priceData?.crop_name}</span>
                                    </p>
                                ) : null}

                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                                    <span className="font-semibold text-gray-600">{t('dashboard.sellToday', 'Sell Today')}</span>
                                    <span className="font-bold text-lg text-gray-800">₹{sellToday.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-center text-gray-400 text-sm font-medium">vs</div>
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex justify-between items-center">
                                    <span className="font-semibold text-green-700">{t('dashboard.wait3Days', 'Wait 3 Days')}</span>
                                    <span className="font-extrabold text-2xl text-green-800">₹{wait3Days.toLocaleString()}</span>
                                </div>
                                
                                <div className={`p-4 rounded-xl text-center font-bold shadow-md transition-all ${
                                    potentialGain > 0 ? 'bg-green-600 text-white shadow-green-900/10' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    <span className="flex items-center justify-center gap-2">
                                        {potentialGain > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                        {t('dashboard.potentialGain', 'Potential Gain:')} {potentialGain > 0 ? '+' : ''}₹{potentialGain.toLocaleString()}
                                    </span>
                                </div>

                                {/* Reasoning Note */}
                                {(priceData?.recommendationText || priceData?.recommendation_text) && (
                                    <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-900 font-medium leading-relaxed">
                                        <p className="font-bold mb-0.5 text-emerald-950 flex items-center gap-1">
                                            <Sparkles size={12} className="text-emerald-600" />
                                            <span>AI Advisory:</span>
                                        </p>
                                        {i18n.language === 'ta' && (priceData?.recommendationTextTa || priceData?.recommendation_text_ta)
                                            ? (priceData.recommendationTextTa || priceData.recommendation_text_ta)
                                            : (priceData.recommendationText || priceData.recommendation_text)
                                        }
                                    </div>
                                )}

                                {/* Collapsible Factors Breakdown */}
                                {priceData?.factors && priceData.factors.length > 0 && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowFactors(!showFactors)}
                                            className="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors py-1"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Info size={13} className="text-green-600" />
                                                {showFactors ? t('dashboard.hideFactors', 'Hide Decision Drivers') : t('dashboard.showFactors', 'Why this recommendation?')}
                                            </span>
                                            {showFactors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>

                                        {showFactors && (
                                            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                                                {priceData.factors.map((f, idx) => (
                                                    <div key={idx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-bold text-gray-800">{f.name}</span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                                                f.impact === 'positive' ? 'bg-green-100 text-green-700' :
                                                                f.impact === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                                            }`}>
                                                                {f.impact}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-[11px] leading-snug">
                                                            {i18n.language === 'ta' && (f.descriptionTa || f.description_ta)
                                                                ? (f.descriptionTa || f.description_ta)
                                                                : (f.description || f.description_en)
                                                            }
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Climate-Aware Crop Recommendations */}
            <CropRecommendationsWidget />

            {/* Matched Institutional Contracts */}
            <Card title={
                <div className="flex justify-between items-center w-full">
                    <span className="flex items-center gap-2">
                        <Users size={18} className="text-blue-600" />
                        <span>{t('dashboard.matchedContracts', 'Matched Institutional Supply Contracts')}</span>
                    </span>
                    <Link to="/farmer/buyer-matching" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        <span>{t('dashboard.viewAllContracts', 'View Direct Matching')}</span>
                        <ChevronRight size={14} />
                    </Link>
                </div>
            }>
                {matchedContracts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <Users size={32} strokeWidth={1.2} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600">{t('dashboard.noContractsYet', 'No collective supply contracts matched yet')}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.enrollPoolHint', 'Enroll your harvest into the supply pool to auto-match bulk buyers.')}</p>
                        <Link to="/farmer/buyer-matching" className="inline-block mt-3 px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                            {t('dashboard.goToMatching', 'Enroll in Supply Pool →')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchedContracts.slice(0, 4).map((c) => (
                            <div key={c.id} className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50/60 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                                            {c.buyerCategory || c.buyer_category || 'Institutional Buyer'}
                                        </span>
                                        <h4 className="text-base font-bold text-gray-900 mt-1">{c.buyerName || c.buyer_name}</h4>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                        c.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200 font-black'
                                    }`}>
                                        {c.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-2 border-y border-blue-100/60 text-xs">
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">Crop</span>
                                        <span className="font-bold text-gray-800">{c.cropName || c.crop_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">Agreed Rate</span>
                                        <span className="font-bold text-emerald-700">₹{c.agreedPricePerKg || c.agreed_price_per_kg}/kg</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-[10px]">Target Qty</span>
                                        <span className="font-bold text-gray-800">{c.totalQuantityKg || c.total_quantity_kg} kg</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-between items-center text-xs">
                                    <span className="text-gray-500 text-[11px]">Contract Val: <strong className="text-gray-900">₹{(c.totalContractValue || c.total_contract_value || 0).toLocaleString()}</strong></span>
                                    <Link to="/farmer/buyer-matching" className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1">
                                        <span>{t('dashboard.viewQuota', 'View Quota')}</span>
                                        <ChevronRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Recent Batches */}
            <Card title={t('dashboard.recentBatches', 'Recent Crop Batches')}>
                {batches.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Package size={36} strokeWidth={1.2} className="mx-auto mb-3" />
                        <p className="text-sm font-medium">{t('dashboard.noBatchesYet', 'No crop batches posted yet')}</p>
                        <p className="text-xs mt-1">{t('dashboard.startPosting', 'Go to Post Crop to add your first batch')}</p>
                    </div>
                ) : (
                    <BatchTable batches={batches} />
                )}
            </Card>
        </div>
    );
};

export default DashboardHome;
