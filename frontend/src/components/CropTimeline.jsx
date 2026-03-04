import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CropTimeline = ({ events }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Blockchain Tracking</h3>
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={14} />
                    Verified On-Chain
                </span>
            </div>

            <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100"></div>

                {events.map((event, index) => (
                    <div key={index} className="relative flex gap-6 pl-8">
                        {/* Dot */}
                        <div className="absolute left-0 top-1.5 w-6.5 h-6.5 bg-white border-2 border-green-500 rounded-full flex items-center justify-center -translate-x-1.5 z-10">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 leading-none">{event.title}</h4>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                {event.details && Object.entries(event.details).map(([key, value]) => (
                                    <p key={key}><span className="font-bold text-gray-500 lowercase">{key}:</span> {value}</p>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{event.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropTimeline;
