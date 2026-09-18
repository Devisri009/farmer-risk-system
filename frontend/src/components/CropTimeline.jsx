import React from 'react';
import { CheckCircle } from 'lucide-react';

const CropTimeline = ({ events }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Crop Timeline</h3>
                <span className="flex items-center space-x-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    <CheckCircle size={14} />
                    <span>Blockchain Verified</span>
                </span>
            </div>

            <div className="relative pl-6 border-l-2 border-gray-200 space-y-8 mt-4">
                {events?.map((event, index) => (
                    <div key={index} className="relative">
                        <div className={`absolute -left-[35px] mt-1.5 w-4 h-4 rounded-full border-4 border-white ${event.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                        <div>
                            <h4 className={`text-md font-bold ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                {event.title}
                            </h4>
                            <div className="mt-1 space-y-1">
                                {event.details && Object.entries(event.details).map(([key, value]) => (
                                    <p key={key} className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-500 mr-2">{key}:</span> {value}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropTimeline;
