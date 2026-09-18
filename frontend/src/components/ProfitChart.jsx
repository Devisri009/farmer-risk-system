import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Card from './Card';
import { BarChart2 } from 'lucide-react';

const BatchChart = ({ data }) => {
    const { t } = useTranslation();

    const hasData = data && data.some(d => d.count > 0);

    return (
        <Card title={t('dashboard.batchTrend', 'Batches Posted Per Month')} className="h-[340px]">
            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-400 gap-3">
                    <BarChart2 size={40} strokeWidth={1.2} />
                    <p className="text-sm font-medium">{t('dashboard.noBatches', 'No batches posted yet')}</p>
                    <p className="text-xs text-gray-300">{t('dashboard.postFirst', 'Post your first crop to see activity')}</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis
                            stroke="#9CA3AF"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            allowDecimals={false}
                            tickFormatter={(v) => v}
                        />
                        <Tooltip
                            formatter={(value) => [value, t('dashboard.batchCount', 'Batches')]}
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '13px'
                            }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {data && data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.count > 0 ? '#16A34A' : '#E5E7EB'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default BatchChart;
