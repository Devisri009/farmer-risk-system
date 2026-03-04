import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
    { name: 'Jan', revenue: 10000 },
    { name: 'Feb', revenue: 15000 },
    { name: 'Mar', revenue: 22000 },
    { name: 'Apr', revenue: 30000 },
    { name: 'May', revenue: 25000 },
    { name: 'Jun', revenue: 35000 },
];

const ProfitChart = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full min-h-[350px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Profit Analytics</h3>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontWeight: 800, color: '#16a34a' }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#111827' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#16a34a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRev)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProfitChart;
