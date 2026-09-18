import React from 'react';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MarketCards = ({ prices }) => {
    const { t } = useTranslation();

    // Logic to calculate insights
    const bestOpp = [...prices].sort((a, b) => {
        const aVal = parseFloat(a.trend.replace(/[^0-9.-]/g, '')) || 0;
        const bVal = parseFloat(b.trend.replace(/[^0-9.-]/g, '')) || 0;
        return bVal - aVal;
    })[0];

    const upCount = prices.filter(p => p.trend.includes('+')).length;
    const sentiment = upCount > prices.length / 2 ? 'Strong Bullish' : 'Neutral';
    const sentimentPercent = Math.round((upCount / (prices.length || 1)) * 100);

    const surplusCrop = prices.find(p => p.trend.includes('-')) || { crop: 'No Alerts', trend: 'Stable' };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Best Opportunity */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                <Sparkles className="absolute -right-4 -top-4 text-green-200/50 group-hover:scale-125 transition-transform duration-500" size={100} />
                <p className="text-xs font-black text-green-700 uppercase mb-2 tracking-widest leading-none">{t('marketplace.bestOpportunity', 'Best Opportunity')}</p>
                <h3 className="text-xl font-black text-green-900">{bestOpp ? `${t(`crops.${bestOpp.crop}`, bestOpp.crop)} @ ${t(`location.${bestOpp.mandi}`, bestOpp.mandi)}` : t('common.loading')}</h3>
                <p className="text-sm font-bold text-green-600 mt-1 flex items-center">
                    <TrendingUp size={16} className="mr-1" /> {bestOpp ? t('marketplace.oppTrend', { trend: bestOpp.trend }) : 'Up 0%'}
                </p>
            </div>

            {/* Market Sentiment */}
            <div className="bg-white border border-gray-200 p-6 rounded-[2rem] shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase mb-2 tracking-widest leading-none">{t('marketplace.marketSentiment', 'Market Sentiment')}</p>
                <h3 className="text-xl font-black text-gray-900">{t(`marketplace.sentiment.${sentiment}`, sentiment)}</h3>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${sentimentPercent}%` }} />
                </div>
            </div>

            {/* Volume Alert */}
            <div className="bg-white border border-gray-200 p-6 rounded-[2rem] shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase mb-2 tracking-widest leading-none">{t('marketplace.volumeAlert', 'Volume Alert')}</p>
                <h3 className="text-xl font-black text-gray-900">{t(`crops.${surplusCrop.crop}`, surplusCrop.crop)} {t('marketplace.surplus', 'surplus')}</h3>
                <p className="text-sm font-bold text-amber-600 mt-1 flex items-center">
                    <AlertCircle size={16} className="mr-1" /> {surplusCrop.trend.includes('-') ? t('marketplace.highSupply', 'High supply expected') : t('marketplace.noSurplus', 'Market stable')}
                </p>
            </div>
        </div>
    );
};

export default MarketCards;
