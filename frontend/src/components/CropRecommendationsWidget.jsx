import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Sparkles, Calendar, Droplets, Mountain, Clock,
    ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight,
    RefreshCw, Filter, Layers, Sun, CloudRain
} from 'lucide-react';
import { getCropRecommendations } from '../api/dashboardApi';

const SOIL_OPTIONS = [
    { id: '', labelEn: 'All Soils', labelTa: 'அனைத்து மண்' },
    { id: 'Red Soil', labelEn: 'Red Soil', labelTa: 'செம்மண்' },
    { id: 'Black Soil', labelEn: 'Black Soil', labelTa: 'கரிசல் மண்' },
    { id: 'Alluvial', labelEn: 'Alluvial Soil', labelTa: 'வண்டல் மண்' },
    { id: 'Sandy Loam', labelEn: 'Sandy Loam', labelTa: 'மணற்பாங்கு' },
    { id: 'Clay Loam', labelEn: 'Clay Loam', labelTa: 'களிமண்' },
];

const RISK_BADGES = {
    Low: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: <CheckCircle2 size={13} className="text-emerald-600" />,
        labelEn: 'Low Risk',
        labelTa: 'குறைந்த ஆபத்து',
    },
    Medium: {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        icon: <AlertTriangle size={13} className="text-amber-600" />,
        labelEn: 'Moderate Risk',
        labelTa: 'மிதமான ஆபத்து',
    },
    High: {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        icon: <AlertTriangle size={13} className="text-rose-600" />,
        labelEn: 'High Risk',
        labelTa: 'அதிக ஆபத்து',
    },
};

const CropRecommendationsWidget = () => {
    const { t, i18n } = useTranslation();
    const isTa = i18n.language === 'ta';

    const [selectedSoil, setSelectedSoil] = useState('');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchRecommendations = async (soil = selectedSoil) => {
        setLoading(true);
        try {
            const res = await getCropRecommendations(soil || null);
            setData(res.data);
        } catch (err) {
            console.error('Crop Recommendations Fetch Error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations(selectedSoil);
    }, [selectedSoil]);

    const handleSoilChange = (soilId) => {
        setSelectedSoil(soilId);
    };

    const recommendations = data?.recommendations || [];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 transition-all duration-300 hover:shadow-md">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-sm">
                            <Sparkles size={18} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">
                            {isTa ? 'பருவநிலைக்கேற்ற பயிர் பரிந்துரைகள்' : 'Climate-Aware Crop Recommendations'}
                        </h2>
                        {data?.season && (
                            <span className="ml-1 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {data.season}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                        {isTa
                            ? 'நேரடி பலமுனை வானிலை, மண் வகை மற்றும் உள்ளூர் பருவ சுழற்சியை அடிப்படையாகக் கொண்ட பரிந்துரைகள்'
                            : 'Personalized agronomic ranking tailored to real-time weather consensus, soil, and sowing windows'}
                    </p>
                </div>

                {/* Weather snapshot pill */}
                {data?.weather_summary && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 self-start md:self-auto">
                        <Sun size={15} className="text-amber-500 shrink-0" />
                        <span>{data.weather_summary.temperature}°C</span>
                        <span className="text-slate-300">•</span>
                        <span>{data.weather_summary.condition}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">🌧 {data.weather_summary.rain_chance}% Rain</span>
                    </div>
                )}
            </div>

            {/* Soil Type Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-gray-400 font-bold flex items-center gap-1 shrink-0 uppercase tracking-wider text-[10px]">
                    <Filter size={12} /> {isTa ? 'மண் வகை:' : 'Soil Type:'}
                </span>
                {SOIL_OPTIONS.map((opt) => {
                    const active = selectedSoil === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSoilChange(opt.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 active:scale-95 ${
                                active
                                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/20'
                                    : 'bg-gray-100 hover:bg-gray-200/80 text-gray-600'
                            }`}
                        >
                            {isTa ? opt.labelTa : opt.labelEn}
                        </button>
                    );
                })}
            </div>

            {/* Recommendations Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="animate-pulse bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : recommendations.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm font-bold">{isTa ? 'பரிந்துரைகள் எதுவும் கிடைக்கவில்லை' : 'No recommendations available for selected filters'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {recommendations.map((crop, idx) => {
                        const risk = RISK_BADGES[crop.risk_level] || RISK_BADGES.Low;
                        const scoreColor =
                            crop.suitability_score >= 85
                                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                : crop.suitability_score >= 70
                                ? 'text-teal-600 bg-teal-50 border-teal-200'
                                : 'text-amber-600 bg-amber-50 border-amber-200';

                        return (
                            <div
                                key={idx}
                                className="group relative bg-gradient-to-b from-white to-gray-50/50 hover:to-emerald-50/20 border border-gray-200 hover:border-emerald-400 rounded-2xl p-4.5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                            >
                                {/* Top Badges */}
                                <div>
                                    <div className="flex items-center justify-between gap-1 mb-3">
                                        <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                                            {crop.icon || '🌱'}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {/* Suitability Score */}
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${scoreColor}`}>
                                                {crop.suitability_score}%
                                            </span>
                                            {/* Risk Level Badge */}
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${risk.bg}`}>
                                                {risk.icon}
                                                <span>{isTa ? risk.labelTa : risk.labelEn}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Crop Title */}
                                    <div className="mb-2">
                                        <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-800 transition-colors leading-snug">
                                            {crop.crop_name}
                                        </h3>
                                        {crop.crop_name_ta && (
                                            <p className="text-xs font-bold text-emerald-700">
                                                {crop.crop_name_ta}
                                            </p>
                                        )}
                                    </div>

                                    {/* Planting Window */}
                                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 mb-3 text-[11px] flex items-start gap-1.5 text-emerald-900">
                                        <Calendar size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-extrabold uppercase text-[9px] text-emerald-700 tracking-wider block">
                                                {isTa ? 'விதைப்பு பருவம்' : 'Sowing Window'}
                                            </span>
                                            <span className="font-bold leading-tight">
                                                {isTa && crop.planting_window_ta ? crop.planting_window_ta : crop.planting_window}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Plain Language Reason */}
                                    <p className="text-xs text-gray-600 font-medium leading-relaxed mb-3 line-clamp-3">
                                        {isTa && crop.reason_ta ? crop.reason_ta : crop.reason}
                                    </p>
                                </div>

                                {/* Key Specs Footer */}
                                <div className="pt-2.5 border-t border-gray-100 grid grid-cols-3 gap-1 text-[10px] text-gray-500 font-bold text-center">
                                    <div className="bg-white/80 border border-gray-100 rounded-lg py-1 px-0.5">
                                        <span className="block text-gray-400 text-[9px]">WATER</span>
                                        <span className="text-gray-700 font-black">{crop.water_need}</span>
                                    </div>
                                    <div className="bg-white/80 border border-gray-100 rounded-lg py-1 px-0.5">
                                        <span className="block text-gray-400 text-[9px]">SOIL</span>
                                        <span className="text-gray-700 font-black truncate block">{crop.ideal_soil?.split('/')[0]}</span>
                                    </div>
                                    <div className="bg-white/80 border border-gray-100 rounded-lg py-1 px-0.5">
                                        <span className="block text-gray-400 text-[9px]">CYCLE</span>
                                        <span className="text-gray-700 font-black">{crop.duration_days?.split(' ')[0]}d</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CropRecommendationsWidget;
