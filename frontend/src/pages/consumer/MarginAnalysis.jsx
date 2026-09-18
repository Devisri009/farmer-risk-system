import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ProfitChart from '../../components/ProfitChart';

const MarginAnalysis = () => {
    const { t } = useTranslation();
    // Mock Data
    const margins = [
        { id: 1, crop: "Organic Tomato", buyPrice: 20.0, marketPrice: 28.0, margin: 40, trend: 'up' },
        { id: 2, crop: "Paddy (Ponni)", buyPrice: 22.0, marketPrice: 29.5, margin: 34, trend: 'up' },
        { id: 3, crop: "Tomato", buyPrice: 18.0, marketPrice: 16.5, margin: -8, trend: 'down' },
        { id: 4, crop: "Onion", buyPrice: 25.0, marketPrice: 35.0, margin: 40, trend: 'up' }
    ];

    const chartData = [
        { month: 'Jan', revenue: 15000 }, 
        { month: 'Feb', revenue: 18000 }, 
        { month: 'Mar', revenue: 25000 },
        { month: 'Apr', revenue: 21000 },
        { month: 'May', revenue: 29000 },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('consumer.marginAnalysisTitle', 'Margin Analysis')}</h1>
                    <p className="text-gray-500">{t('consumer.marginAnalysisSub', 'Track profitability and current market values of your inventory.')}</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-600" />
                        <span className="font-bold text-green-700">Total +₹4,250 Margin</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">{t('consumer.revenueTrend', 'Revenue Trend')}</h2>
                    <ProfitChart data={chartData} />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">{t('consumer.profitabilityByItem', 'Profitability by Item')}</h2>
                    <div className="space-y-4 flex-1">
                        {margins.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${item.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {item.trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{t(`crops.${item.crop}`, item.crop)}</h3>
                                        <p className="text-sm text-gray-500">Bought: ₹{item.buyPrice.toFixed(2)}/kg • Mkt: ₹{item.marketPrice.toFixed(2)}/kg</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold text-lg ${item.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.trend === 'up' ? '+' : ''}{item.margin}%
                                    </span>
                                    <p className="text-xs text-gray-400">Margin</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarginAnalysis;
