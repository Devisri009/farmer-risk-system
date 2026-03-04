import React from 'react';
import { CloudRain, Thermometer, Droplets, AlertTriangle } from 'lucide-react';

const ClimateCard = ({ data }) => {
    const riskColors = {
        Low: 'bg-green-100 text-green-800 border-green-200',
        Moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        High: 'bg-red-100 text-red-800 border-red-200',
    };

    const riskColor = riskColors[data?.riskLevel] || riskColors.Low;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden h-full flex flex-col">
            {data?.riskLevel === 'High' && (
                <div className="absolute top-0 left-0 right-0 bg-alert-red text-white text-xs font-bold px-4 py-1.5 text-center flex justify-center items-center gap-2">
                    <AlertTriangle size={14} /> High Climate Risk Alert!
                </div>
            )}

            <div className={`flex-1 flex flex-col mt-${data?.riskLevel === 'High' ? '6' : '0'}`}>
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Climate Overview</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColor}`}>
                        Risk: {data?.riskLevel || 'Low'}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 flex-1 items-stretch">
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                        <Thermometer className="text-orange-500 mb-2" size={28} />
                        <span className="text-2xl font-bold text-gray-900">{data?.temp || '--'}°C</span>
                        <span className="text-xs text-gray-500 mt-1 font-medium">Temperature</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                        <CloudRain className="text-blue-500 mb-2" size={28} />
                        <span className="text-2xl font-bold text-gray-900">{data?.rainProb || '--'}%</span>
                        <span className="text-xs text-gray-500 mt-1 font-medium">Rain Prob.</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                        <Droplets className="text-cyan-500 mb-2" size={28} />
                        <span className="text-2xl font-bold text-gray-900">{data?.humidity || '--'}%</span>
                        <span className="text-xs text-gray-500 mt-1 font-medium">Humidity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClimateCard;
