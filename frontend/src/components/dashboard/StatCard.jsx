import React from 'react';

const StatCard = ({ title, value, icon, bgColor = "bg-primary-green", textColor = "text-white" }) => {
    return (
        <div className={`rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between ${bgColor}`}>
            <div>
                <h4 className={`text-sm font-semibold mb-1 opacity-90 ${textColor}`}>{title}</h4>
                <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white bg-opacity-20 ${textColor}`}>
                {icon}
            </div>
        </div>
    );
};

export default StatCard;
