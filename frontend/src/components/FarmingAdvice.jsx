import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, Info, CloudRain, Sun, Thermometer } from 'lucide-react';

const FarmingAdvice = ({ advice }) => {
    const { t } = useTranslation();
    const adviceIcons = [
        <CloudRain className="text-blue-500" size={18} />,
        <Sun className="text-amber-500" size={18} />,
        <Shield className="text-green-500" size={18} />,
        <CheckCircle className="text-teal-500" size={18} />,
        <Info className="text-indigo-500" size={18} />,
        <Thermometer className="text-red-500" size={18} />
    ];

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-l-yellow-400 border border-transparent transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-green-400 cursor-pointer group mt-6 h-full">
            <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 leading-tight flex items-center gap-2">
                    🌱 <span>{t('climate.farmersDo')}</span>
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{t('climate.farmersDoSub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advice.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-yellow-200 hover:bg-white hover:shadow-md transition-all group/item"
                    >
                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover/item:scale-125 transition-transform duration-300 flex-shrink-0">
                            {adviceIcons[idx % adviceIcons.length]}
                        </div>
                        <p className="text-sm font-bold text-gray-700 group-hover/item:text-yellow-700 transition-colors">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FarmingAdvice;
