import React, { useState } from 'react';
import { Search, MapPin, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MandiTable = ({ prices, onAnalyze }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPrices = prices.filter(p => 
        p.crop.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.mandi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/30 gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900">{t('marketplace.liveRates', 'Live Mandi Rates')}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">{t('marketplace.updatesEvery', 'Updates every 15 minutes')}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('marketplace.searchPlaceholder', 'Search crop or mandi...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('marketplace.colCrop', 'Crop Name')}</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('marketplace.colPricing', 'Pricing')}</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('marketplace.colTrend', 'Trend')}</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('marketplace.colMandi', 'Primary Mandi')}</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('marketplace.colAction', 'Action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredPrices.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-lg shadow-sm">
                                            {item.crop.toLowerCase().includes('tomato') ? '🍅' : 
                                             item.crop.toLowerCase().includes('rice') || item.crop.toLowerCase().includes('paddy') ? '🌾' : 
                                             item.crop.toLowerCase().includes('corn') || item.crop.toLowerCase().includes('maize') ? '🌽' : '📦'}
                                        </div>
                                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{t(`crops.${item.crop}`, item.crop)}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div>
                                        <span className="text-base font-black text-gray-900">₹{item.price.toLocaleString()}</span>
                                        <span className="ml-1 text-[10px] font-extrabold text-gray-400 lowercase">/ {t(`units.${item.unit}`, item.unit)}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`flex items-center ${item.trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.trend.includes('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        <span className="ml-1 text-xs font-black">{item.trend}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center text-gray-600 font-bold text-sm">
                                        <MapPin size={14} className="mr-1.5 text-gray-300" />
                                        {t(`location.${item.mandi}`, item.mandi)}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button 
                                        onClick={() => onAnalyze(item)}
                                        className="px-5 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl text-xs font-black hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                                    >
                                        {t('marketplace.btnAnalytic', 'Analytic')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MandiTable;
