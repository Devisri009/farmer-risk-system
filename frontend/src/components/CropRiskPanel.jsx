import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles, CheckCircle, ArrowRight, Lightbulb, Sprout } from 'lucide-react';

const CROP_ICONS = {
    Rice: '🌾',
    Paddy: '🌾',
    Tomato: '🍅',
    Corn: '🌽',
    Maize: '🌽',
    Groundnut: '🥜',
    Sugarcane: '🎋',
    Onion: '🧅',
    Chilli: '🌶️',
    Banana: '🍌',
    Turmeric: '🌿',
    Cotton: '🌱',
};

const CropRiskPanel = ({ data = [] }) => {
    const { t } = useTranslation();
    const [selectedCrop, setSelectedCrop] = useState('all');

    const getBadgeStyles = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'high': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRiskLabel = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return t('climate.safeToGrow', 'Low Risk · Safe');
            case 'moderate': return t('climate.modRisk', 'Moderate Risk · Monitor');
            case 'high': return t('climate.highRisk', 'High Risk · Action Needed');
            default: return t('climate.unknown', 'Stable');
        }
    };

    const filteredData = selectedCrop === 'all'
        ? data
        : data.filter(d => d.crop?.toLowerCase() === selectedCrop.toLowerCase());

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-7 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-5">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-100 rounded-2xl">
                        <Sparkles size={24} className="text-emerald-700" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                {t('climate.cropSafetyTitle', 'Crop-First AI Advisory')}
                            </h3>
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-black uppercase rounded-full tracking-wider">
                                AI Powered
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {t('climate.cropSafetySub', 'Real-time crop risk assessment & recommended actions tailored to your farm')}
                        </p>
                    </div>
                </div>

                {/* Filter Pills */}
                {data.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setSelectedCrop('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                selectedCrop === 'all'
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All ({data.length})
                        </button>
                        {data.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedCrop(item.crop)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedCrop.toLowerCase() === item.crop?.toLowerCase()
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {CROP_ICONS[item.crop] || '🌱'} {item.crop}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Crop Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.map((item, idx) => {
                    const isHigh = item.risk?.toLowerCase() === 'high';
                    const isMod = item.risk?.toLowerCase() === 'moderate';
                    const borderAccent = isHigh ? 'border-l-4 border-l-red-500' : isMod ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500';

                    return (
                        <div
                            key={idx}
                            className={`bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 ${borderAccent} hover:bg-white hover:shadow-md transition-all group`}
                        >
                            {/* Top row: Crop Name & Risk Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2.5">
                                    <span className="text-2xl">{CROP_ICONS[item.crop] || '🌱'}</span>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 group-hover:text-green-700 transition-colors">
                                            {t(`crops.${item.crop}`, item.crop)}
                                        </h4>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            Target Crop
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-xs ${getBadgeStyles(item.risk)}`}>
                                    {getRiskLabel(item.risk)}
                                </span>
                            </div>

                            {/* Advisory Text */}
                            <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs mb-3">
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Lightbulb size={13} className="text-amber-500" />
                                    <span>{t('climate.recommendedAction', 'Recommended Action')}</span>
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    {item.advice || t('climate.normalConditions', 'Current weather is suitable. Maintain regular monitoring and scheduled watering.')}
                                </p>
                            </div>

                            {/* Actionable Guideline pill */}
                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold pt-1">
                                <span className="flex items-center gap-1">
                                    <CheckCircle size={13} className={isHigh ? 'text-red-500' : isMod ? 'text-amber-500' : 'text-emerald-500'} />
                                    <span>{isHigh ? 'Immediate Intervention Required' : isMod ? 'Preventative Irrigation Advised' : 'Optimal Growth Parameters'}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CropRiskPanel;
