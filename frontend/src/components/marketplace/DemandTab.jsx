import React from 'react';
import { Store, ShieldCheck, ShoppingBag, TrendingUp, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DemandTab = ({ demands }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {demands.map((demand, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-[2.5rem] p-8 space-y-6 hover:shadow-xl hover:shadow-green-900/5 transition-all group relative overflow-hidden">
                    {demand.demand === 'High' && (
                        <div className="absolute top-0 right-0 px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                            {t('marketplace.urgent', 'Urgent Request')}
                        </div>
                    )}

                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center text-2xl shadow-inner">
                            <Store className="text-gray-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-gray-900 leading-tight">{t('marketplace.verifiedRetailer', 'Verified Retailer')}</h3>
                            <p className="text-xs text-green-600 font-bold flex items-center mt-0.5">
                                <ShieldCheck className="mr-1" size={14} /> {t('marketplace.verifiedBuyer', 'Verified Buyer')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <div className="flex items-center space-x-2">
                                <ShoppingBag size={14} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('marketplace.demanding', 'Demanding')}</span>
                            </div>
                            <span className="text-sm font-black text-gray-900">{t(`crops.${demand.crop}`, demand.crop)} ({demand.quantity})</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp size={14} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('marketplace.demandLevel', 'Demand Level')}</span>
                            </div>
                            <span className={`text-sm font-black ${demand.demand === 'High' ? 'text-red-600' : 'text-green-700'}`}>{t(`marketplace.demandLevels.${demand.demand}`, demand.demand)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('marketplace.city', 'City')}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{t(`location.${demand.city}`, demand.city)}</span>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-2xl text-xs font-black flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 active:scale-95 transition-transform">
                            <MessageCircle size={16} />
                            <span>{t('marketplace.initiateQuote', 'Initiate Quote')}</span>
                        </button>
                        <button className="p-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all hover:text-gray-900">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DemandTab;
