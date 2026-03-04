import React from 'react';
import { Thermometer, CloudRain, Droplets, Wind, AlertCircle } from 'lucide-react';

const ClimateCard = ({ data }) => {
    const getRiskStyles = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-100 border-green-200';
            case 'moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'high': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Climate Overview</h3>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRiskStyles(data.riskLevel)}`}>
                    <AlertCircle size={14} />
                    {data.riskLevel} Risk
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Thermometer size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Temperature</p>
                        <p className="text-lg font-bold text-gray-900">{data.temp}°C</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <CloudRain size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Rain Chance</p>
                        <p className="text-lg font-bold text-gray-900">{data.rainProb}%</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Droplets size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Humidity</p>
                        <p className="text-lg font-bold text-gray-900">{data.humidity}%</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                        <Wind size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">Wind Speed</p>
                        <p className="text-lg font-bold text-gray-900">{data.windSpeed || '10'} km/h</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClimateCard;
