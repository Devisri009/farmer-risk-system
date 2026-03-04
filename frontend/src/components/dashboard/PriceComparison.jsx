import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

const PriceComparison = ({ todayPrice, waitPrice, unit }) => {
    const diff = waitPrice - todayPrice;
    const isProfitableToWait = diff > 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Sell vs Wait Prediction</h3>

            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center">
                    <CheckCircle className="text-primary-green mb-3" size={28} />
                    <div className="text-sm text-gray-500 font-semibold mb-1">Sell Today Price</div>
                    <div className="text-3xl font-bold text-gray-900">${todayPrice}<span className="text-lg text-gray-500 font-medium">/{unit}</span></div>
                </div>

                <div className="p-4 border border-blue-50 bg-blue-50/30 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <Clock className="text-accent-blue mb-3" size={28} />
                    <div className="text-sm text-gray-500 font-semibold mb-1">Predicted (1 Week)</div>
                    <div className="text-3xl font-bold text-gray-900">${waitPrice}<span className="text-lg text-gray-500 font-medium">/{unit}</span></div>
                </div>
            </div>

            <div className={`p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm md:text-base ${isProfitableToWait ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {isProfitableToWait ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {isProfitableToWait
                    ? `Waiting could increase profit by $${Math.abs(diff)}/${unit}`
                    : `Selling today avoids a $${Math.abs(diff)}/${unit} potential loss`}
            </div>
        </div>
    );
};

export default PriceComparison;
