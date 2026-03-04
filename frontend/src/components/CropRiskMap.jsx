import React from 'react';

const CropRiskMap = ({ data }) => {
    const getRiskIcon = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return '🟢';
            case 'moderate': return '🟡';
            case 'high': return '🔴';
            default: return '⚪';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AI Crop Risk Map ({data.location})</h3>
            <div className="space-y-3">
                {data.risks.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-bold text-gray-700">{item.crop}</span>
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase">
                            {getRiskIcon(item.risk)} {item.risk} Risk
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropRiskMap;
