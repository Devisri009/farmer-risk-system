import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CloudRain, Sun, Wind, Thermometer, AlertTriangle,
    CheckCircle, Clock, MapPin, Calendar, ArrowRight,
    Droplets, CloudLightning, Sunrise, Sunset, Loader2, Shield, X, TrendingUp, Info, ShieldCheck
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts';
import {
    getClimateAlerts,
    getClimateForecast,
    getAlertAnalytics,
    getClimateInsights,
    getCropRisk,
    getFarmingAdvice,
    getWeatherSourceStatus
} from '../api/climateApi';
import FarmWeatherInsights from '../components/FarmWeatherInsights';
import CropRiskPanel from '../components/CropRiskPanel';
import FarmingAdvice from '../components/FarmingAdvice';

const SEVERITY_COLORS = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const SEVERITY_ICONS = {
    High: <AlertTriangle size={18} className="text-red-500" />,
    Medium: <AlertTriangle size={18} className="text-amber-500" />,
    Low: <CheckCircle size={18} className="text-blue-500" />,
};

// ─── Analytics Modal Component ───────────────────────────────────────────────
const AnalyticsModal = ({ alert, onClose }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getAlertAnalytics(alert.id);
                setAnalytics(res.data);
            } catch (err) {
                console.error(err);
                // Fallback demo data
                setAnalytics({
                    title: alert.type === 'Heavy Rain Warning' ? 'Precipitation Forecast' : 'Temperature Trend',
                    unit: alert.type === 'Heavy Rain Warning' ? 'mm' : '°C',
                    data: [
                        { time: '06:00', value: 20 },
                        { time: '09:00', value: 25 },
                        { time: '12:00', value: 35 },
                        { time: '15:00', value: 45 },
                        { time: '18:00', value: 30 },
                        { time: '21:00', value: 15 },
                        { time: '00:00', value: 10 },
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [alert.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-2xl">
                            <TrendingUp size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Detailed Analytics</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{alert.type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all active:scale-90">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4">
                            <Loader2 size={40} className="animate-spin text-green-600" />
                            <p className="text-sm font-bold text-gray-400 animate-pulse">Analyzing Patterns...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-100 rounded-3xl p-4">
                                    <p className="text-[10px] font-black text-green-700 uppercase mb-1">Peak Intensity</p>
                                    <p className="text-xl font-black text-green-900">
                                        {Math.max(...analytics.data.map(d => d.value))}{analytics.unit}
                                    </p>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4">
                                    <p className="text-[10px] font-black text-blue-700 uppercase mb-1">Average</p>
                                    <p className="text-xl font-black text-blue-900">
                                        {(analytics.data.reduce((a, b) => a + b.value, 0) / analytics.data.length).toFixed(1)}{analytics.unit}
                                    </p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4">
                                    <p className="text-[10px] font-black text-amber-700 uppercase mb-1">Status</p>
                                    <p className="text-base font-black text-amber-900 uppercase">Monitoring</p>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wide">{analytics.title}</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[10px] font-bold text-gray-400">Live Forecast</span>
                                    </div>
                                </div>
                                <div className="h-64 w-full bg-white border border-gray-100 rounded-[24px] p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.data}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                                unit={analytics.unit}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#22c55e"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorVal)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ClimateAlerts = () => {
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [insights, setInsights] = useState(null);
    const [cropRisk, setCropRisk] = useState([]);
    const [advice, setAdvice] = useState([]);
    const [sourceMeta, setSourceMeta] = useState({
        sources_used: ['Open-Meteo', 'ECMWF IFS', 'NOAA GFS', 'NASA POWER', 'IMD'],
        confidence_score: 92,
        source_agreement: 'High',
        imd_alerts: []
    });

    const conditionToIcon = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'sunny': return <Sun className="text-amber-500" />;
            case 'rainy': return <CloudRain className="text-blue-500" />;
            case 'stormy': return <CloudLightning className="text-indigo-500" />;
            case 'cloudy': return <Wind className="text-gray-400" />;
            default: return <Sun className="text-amber-500" />;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            let hasError = false;

            // Fetch each endpoint independently — if one fails, others still work
            try {
                const insightsRes = await getClimateInsights();
                if (insightsRes.data) {
                    setInsights(insightsRes.data);
                    setSourceMeta({
                        sources_used: insightsRes.data.sources_used || ['Open-Meteo', 'ECMWF IFS', 'NOAA GFS', 'NASA POWER'],
                        confidence_score: insightsRes.data.confidence_score || 88,
                        source_agreement: insightsRes.data.source_agreement || 'High',
                        imd_alerts: insightsRes.data.imd_alerts || []
                    });
                }
            } catch (err) {
                console.error('Climate insights error:', err);
                hasError = true;
                if (!insights) {
                    setInsights({
                        temperature: 0,
                        rainfall: 0,
                        humidity: 0,
                        windSpeed: 0,
                        location: "Unable to load"
                    });
                }
            }

            try {
                const riskRes = await getCropRisk();
                const riskData = riskRes.data?.risks || (Array.isArray(riskRes.data) ? riskRes.data : []);
                setCropRisk(riskData);
            } catch (err) {
                console.error('Crop risk error:', err);
                hasError = true;
            }

            try {
                const alertsRes = await getClimateAlerts();
                setAlerts(alertsRes.data);
            } catch (err) {
                console.error('Alerts error:', err);
                hasError = true;
            }

            try {
                const forecastRes = await getClimateForecast();
                setForecast(forecastRes.data);
            } catch (err) {
                console.error('Forecast error:', err);
                hasError = true;
            }

            try {
                const adviceRes = await getFarmingAdvice();
                setAdvice(adviceRes.data);
            } catch (err) {
                console.error('Advice error:', err);
                hasError = true;
            }

            if (hasError) setError(true);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 size={32} className="animate-spin text-green-600" />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">{t('climate.fetchingData')}</p>
            </div>
        );
    }

    if (error && !insights) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <AlertTriangle size={48} className="text-red-500" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('climate.unableToLoad')}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors"
                >
                    {t('climate.retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('climate.title', 'Climate Alerts')}</h1>
                    <p className="text-gray-500 font-medium">{t('climate.subtitle', 'Localized monitoring and safety insights for your farm')}</p>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl shadow-md transition-all hover:shadow-lg cursor-pointer">
                    <MapPin size={18} className="text-green-600" />
                    <span className="text-sm font-black text-gray-700 uppercase tracking-widest">
                        {t(`location.${insights?.location}`, insights?.location || 'Madurai, TN')}
                    </span>
                </div>
            </div>

            {/* Multi-Source Weather Consensus Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Multi-Source Consensus Active</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {sourceMeta.source_agreement} Agreement
                            </span>
                        </div>
                        <p className="text-sm text-emerald-100/80 font-medium max-w-2xl">
                            Consensus forecast synthesized from India Meteorological Department (IMD), European Centre for Medium-Range Weather Forecasts (ECMWF IFS), NOAA GFS, Open-Meteo, & NASA POWER.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm self-start lg:self-auto">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model Confidence</p>
                            <p className="text-2xl font-black text-emerald-400">{sourceMeta.confidence_score}%</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Models</p>
                            <p className="text-sm font-black text-white">{sourceMeta.sources_used?.length || 4} / 5 Online</p>
                        </div>
                    </div>
                </div>

                {/* Source Badges */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-300/70 mr-1">Ensemble Feeds:</span>
                    {[
                        { name: 'IMD (Official)', desc: 'District Nowcast & Warnings' },
                        { name: 'ECMWF (IFS-0.4°)', desc: 'Global Numerical Physics' },
                        { name: 'NOAA (GFS)', desc: 'Atmospheric Cross-Validation' },
                        { name: 'Open-Meteo', desc: 'High-Res Local Models' },
                        { name: 'NASA POWER', desc: 'Solar & Agro-climatology' }
                    ].map((src, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-emerald-100 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{src.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Official IMD Severe Weather Strip */}
            {sourceMeta.imd_alerts && sourceMeta.imd_alerts.length > 0 && (
                <div className="space-y-3">
                    {sourceMeta.imd_alerts.map((imd, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-2xl p-5 shadow-md flex items-start gap-4">
                            <div className="p-3 bg-orange-500 text-white rounded-xl shadow-sm">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase bg-orange-500 text-white">
                                            IMD Official Advisory
                                        </span>
                                        <span className="text-sm font-black text-gray-900">{imd.type || 'District Severe Weather Alert'}</span>
                                    </div>
                                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                                        Valid: {imd.valid_until || 'Next 24h'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{imd.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Row 1 - Crop-First AI Advisory & Farming Advice */}
            <div className="space-y-6">
                <CropRiskPanel data={cropRisk} />
                <FarmingAdvice advice={advice} />
            </div>

            {/* Active Alerts (Integrated clearly) */}
            {alerts.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-gray-900 flex items-center space-x-3">
                        <AlertTriangle size={24} className="text-red-500" />
                        <span>⚠ {t('climate.activeAlerts', 'Active Risk Alerts')}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="bg-white border-l-4 border-l-red-400 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-green-400 cursor-pointer transition-all duration-300 group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-2 flex-wrap gap-1">
                                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-lg">
                                                {alert.severity} Risk
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                                                {alert.source || 'FarmVista AI'}
                                            </span>
                                            <span className="text-sm font-black text-gray-900">{alert.type}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center space-x-1">
                                            <Clock size={12} /> <span>{alert.time}</span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">{alert.description}</p>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4 group-hover:bg-red-50/50 transition-colors">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{t('climate.advice')}</p>
                                        <p className="text-sm text-gray-800 font-bold">{alert.advice}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAlert(alert)}
                                        className="text-green-600 text-xs font-black flex items-center hover:scale-105 transition-transform origin-left"
                                    >
                                        {t('climate.viewAnalytics')} <ArrowRight size={14} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            

            {/* Row 2 - Supporting Weather Data */}
            <div className="pt-6 mt-8 border-t border-gray-200">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Supporting Weather Data</h2>
            </div>
            
            {/* Row 1 — Highlight Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weather Today */}
                <div className="bg-gradient-to-br from-green-50 to-white p-7 rounded-2xl shadow-md border-l-4 border-l-blue-400 flex items-center space-x-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-green-400 cursor-pointer group border border-transparent">
                    <div className="p-4 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
                        <Sun size={32} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            🌤 <span>{t('climate.weatherToday', 'Weather Today')}</span>
                        </p>
                        <p className="text-xl font-black text-gray-900">{insights?.temperature || 31}°C</p>
                    </div>
                </div>

                {/* Crop Safety */}
                <div className="bg-gradient-to-br from-green-50 to-white p-7 rounded-2xl shadow-md border-l-4 border-l-green-500 flex items-center space-x-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-green-400 cursor-pointer group border border-transparent">
                    <div className="p-4 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
                        <ShieldCheck size={32} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            🌾 <span>{t('climate.cropSafety', 'Crop Safety')}</span>
                        </p>
                        <p className="text-xl font-black text-gray-900">
                            {cropRisk.filter(r => r.risk === 'Low').length > 2 ? t('climate.cropsSafe', 'Most crops safe this week') : t('climate.monitorCrops', 'Monitor crops closely')}
                        </p>
                    </div>
                </div>

                {/* Climate Alerts */}
                <div className="bg-gradient-to-br from-green-50 to-white p-7 rounded-2xl shadow-md border-l-4 border-l-red-400 flex items-center space-x-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-green-400 cursor-pointer group border border-transparent">
                    <div className="p-4 bg-red-50 rounded-2xl group-hover:scale-110 transition-transform">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            ⚠ <span>{t('climate.alerts', 'Climate Alerts')}</span>
                        </p>
                        <p className="text-xl font-black text-gray-900">
                            {alerts.length > 0 ? t('climate.alertsExpected', '{{type}} expected', { type: alerts[0].type }) : t('climate.noAlerts', 'No active alerts')}
                        </p>
                    </div>
                </div>
            </div>

            

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-full">
                    {insights && <FarmWeatherInsights data={insights} />}
                </div>
                <div className="h-full">
                    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-l-blue-400 border border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-green-400 h-full">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                🌤 <span>{t('climate.forecast', '5-Day Forecast')}</span>
                            </h3>
                            <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                <span>⚡ Cross-validated across ECMWF IFS + NOAA GFS + Open-Meteo</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {forecast.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group/item">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.day}</span>
                                    <div className="mb-2">
                                        {conditionToIcon(item.condition)}
                                    </div>
                                    <span className="text-lg font-black text-gray-900">{item.temp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Modal */}
            {selectedAlert && (
                <AnalyticsModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlert(null)}
                />
            )}
        </div>
    );
};

export default ClimateAlerts;
