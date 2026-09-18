import React from 'react';
import { useTranslation } from 'react-i18next';
import { Thermometer, CloudRain, Droplets, Wind } from 'lucide-react';

const FarmWeatherInsights = ({ data }) => {
    const { t } = useTranslation();
    const insights = [
        {
            icon: Thermometer,
            value: `${data.temperature}°C`,
            label: t('climate.labels.Temperature'),
            description: data.temperature > 30 ? t('climate.desc.Warm weather') : t('climate.desc.Comfortable'),
            colorClass: 'text-amber-500'
        },
        {
            icon: CloudRain,
            value: `${data.rainfall} mm`,
            label: t('climate.labels.Rainfall'),
            description: data.rainfall > 0 ? t('climate.desc.Light rain') : t('climate.desc.No rain'),
            colorClass: 'text-blue-500'
        },
        {
            icon: Droplets,
            value: `${data.humidity}%`,
            label: t('climate.labels.Humidity'),
            description: data.humidity > 60 ? t('climate.desc.Normal moisture') : t('climate.desc.Low moisture'),
            colorClass: 'text-teal-500'
        },
        {
            icon: Wind,
            value: `${data.windSpeed} km/h`,
            label: t('climate.labels.Wind'),
            description: data.windSpeed > 15 ? t('climate.desc.Breezy conditions') : t('climate.desc.Mild wind'),
            colorClass: 'text-gray-500'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-l-blue-400 border border-transparent transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-green-400 cursor-pointer group h-full">
            <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 leading-tight flex items-center gap-2">
                    🌤 <span>{t('climate.weatherInsights')}</span>
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                    {data.condition ? `${t(`climate.condition.${data.condition}`, data.condition)} — ` : ''}
                    {data.location ? t(`location.${data.location}`, data.location) : t('climate.weatherInsightsSub')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="flex flex-col items-start p-5 rounded-2xl bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md transition-all group/item">
                        <div className="flex items-center space-x-2 mb-3">
                            <insight.icon size={20} className={`${insight.colorClass} group-hover/item:scale-125 transition-transform duration-300`} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{insight.label}</span>
                        </div>
                        <p className="text-xl font-black text-gray-900 leading-none group-hover/item:text-blue-600 transition-colors">
                            {insight.value}
                            <span className="text-sm font-bold text-gray-400 ml-2 group-hover/item:text-gray-500 transition-colors">
                                – {insight.description}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FarmWeatherInsights;
