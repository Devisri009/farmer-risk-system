import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import { Thermometer, CloudRain, Droplet, Wind } from 'lucide-react';

const ClimateCard = ({ data, riskLevel }) => {
    const { t } = useTranslation();
    return (
        <Card title={t('dashboard.climateOverview', 'Climate Overview')} className="h-full">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Thermometer className="text-red-500" size={24} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{t('climate.labels.Temperature', 'Temperature')}</p>
                        <p className="text-lg font-bold text-gray-800">{data?.temperature != null ? `${data.temperature}°C` : 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CloudRain className="text-blue-500" size={24} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{t('dashboard.rainChance', 'Rain Chance')}</p>
                        <p className="text-lg font-bold text-gray-800">
                            {data?.rain_chance != null ? (
                                data.rain_chance < 5 ? 
                                    t('climate.noRain', 'No Rain Expected') : 
                                    data.rain_chance > 30 ? 
                                        `${t('climate.highChance', 'High Chance')} (${data.rain_chance}%)` :
                                        `${t('climate.lowChance', 'Low Chance')} (${data.rain_chance}%)`
                            ) : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Droplet className="text-blue-400" size={24} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{t('climate.labels.Humidity', 'Humidity')}</p>
                        <p className="text-lg font-bold text-gray-800">{data?.humidity != null ? `${data.humidity}%` : 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Wind className="text-gray-400" size={24} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{t('climate.labels.Wind', 'Wind Speed')}</p>
                        <p className="text-lg font-bold text-gray-800">{data?.windSpeed != null ? `${data.windSpeed} km/h` : 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border flex justify-between items-center text-sm font-bold
        ${riskLevel === 'Low' ? 'bg-green-50 border-green-200 text-green-700' : 
          riskLevel === 'Moderate' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
          'bg-red-50 border-red-200 text-red-700'}"
            >
                <span>{t('dashboard.overallRisk', 'Overall Climate Risk Level:')}</span>
                <span>{riskLevel ? t(`common.${riskLevel.toLowerCase()}`, riskLevel) : t('climate.unknown')}</span>
            </div>
        </Card>
    );
};

export default ClimateCard;
