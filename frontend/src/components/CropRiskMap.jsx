import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import { MapPin } from 'lucide-react';

const CropRiskMap = ({ data }) => {
    const { t } = useTranslation();
    return (
        <Card title={t('dashboard.cropRiskMap', 'AI Crop Risk Map')} className="h-full">
            <div className="flex items-center space-x-2 mb-4 text-gray-600">
                <MapPin size={18} />
                <span className="font-semibold text-sm">{t('marketplace.city', 'Location')}: {data?.location ? t(`location.${data.location}`, data.location) : t('climate.unknown')}</span>
            </div>

            <div className="space-y-3">
                {data?.risks?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-800">{t(`crops.${item.crop}`, item.crop)}</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">
                                {item.risk === 'Low' ? '🟢' : item.risk === 'Moderate' ? '🟡' : '🔴'}
                            </span>
                            <span className="text-sm font-semibold text-gray-600">{t(`common.${item.risk.toLowerCase()}`, item.risk)} {t('climate.risk', 'Risk')}</span>
                        </div>
                    </div>
                ))}
                {(!data?.risks || data.risks.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">{t('dashboard.noRiskData', 'No risk data available.')}</p>
                )}
            </div>
        </Card>
    );
};

export default CropRiskMap;
