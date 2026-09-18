import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Calendar, 
    Layers, 
    ArrowRight, 
    ShieldCheck, 
    ExternalLink, 
    AlertCircle, 
    Loader2, 
    PlusCircle,
    Package
} from 'lucide-react';

const BlockchainBadge = ({ txHash, status }) => {
    const { t } = useTranslation();
    const isConfirmed = status === 'confirmed' || !!txHash;
    const isFailed = status === 'failed';

    if (isConfirmed) {
        return (
            <a
                href={txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : 'https://amoy.polygonscan.com/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50/90 text-blue-700 border border-blue-200/80 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-all shadow-xs"
                title={txHash ? `Polygon Amoy: ${txHash}` : 'Verified on Polygon Amoy'}
            >
                <ShieldCheck size={13} className="text-blue-600 shrink-0" />
                <span>{t('myBatches.verifiedBadge', 'Verified')}</span>
                {txHash && <ExternalLink size={10} className="text-blue-500" />}
            </a>
        );
    }

    if (isFailed) {
        return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold">
                <AlertCircle size={12} />
                <span>Unverified</span>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-semibold">
            <Loader2 size={11} className="animate-spin text-amber-600" />
            <span>Syncing</span>
        </span>
    );
};

const RiskBadge = ({ risk }) => {
    const { t } = useTranslation();
    const styles = {
        Low: 'bg-green-100/80 text-green-800 border-green-200',
        Moderate: 'bg-yellow-100/80 text-yellow-800 border-yellow-200',
        High: 'bg-red-100/80 text-red-700 border-red-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[risk] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                risk === 'Low' ? 'bg-green-500' : risk === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {t(`myBatches.risk${risk}`, risk)}
        </span>
    );
};

const StageBadge = ({ stage, grade }) => {
    const stageIcons = {
        'Cultivation': '🌱',
        'Growth': '🌿',
        'Harvest': '🌾',
        'Quality Grading': '⭐',
        'Marketplace Ready': '🛒',
    };
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <span className="mr-1.5">{stageIcons[stage] || '🌱'}</span>
            <span>{stage || 'Cultivation'}</span>
            {grade && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-black border border-amber-300">
                    Grade {grade}
                </span>
            )}
        </span>
    );
};

const BatchCard = ({ batch, onOpenDetails, onAddUpdate }) => {
    const { t } = useTranslation();
    const cropTitle = t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop || 'Crop');

    return (
        <div 
            onClick={() => onOpenDetails(batch)}
            className="group relative bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
            {/* Top Row: Batch ID, Crop Name, Blockchain Badge */}
            <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-mono font-extrabold border border-gray-200">
                            #{batch.id}
                        </span>
                        <BlockchainBadge 
                            txHash={batch.blockchain_tx_hash || batch.blockchainTxHash} 
                            status={batch.blockchain_status || batch.blockchainStatus} 
                        />
                    </div>
                    <RiskBadge risk={batch.riskLevel || batch.risk || 'Low'} />
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-green-700 transition-colors flex items-center gap-2">
                        <span>{cropTitle}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <span>📍</span> {batch.location || 'Tamil Nadu, India'}
                    </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-gray-100 bg-gray-50/50 rounded-xl px-3 mb-4">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Quantity</span>
                        <span className="text-sm font-extrabold text-gray-800">{batch.quantity || '—'}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Price / kg</span>
                        <span className="text-sm font-extrabold text-emerald-700">₹{batch.pricePerKg ?? batch.price ?? '—'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            <Calendar size={13} className="text-gray-400" />
                            <span>Cultivated: {batch.cultivateDate || '—'}</span>
                        </span>
                    </div>
                </div>

                {/* Journey Stage */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                        <Layers size={14} className="text-gray-400" />
                        <span>Stage</span>
                    </span>
                    <StageBadge stage={batch.stage} grade={batch.grade} />
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddUpdate(batch);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                >
                    <PlusCircle size={14} />
                    <span>+ Update</span>
                </button>

                <div className="inline-flex items-center space-x-1 text-xs font-extrabold text-green-700 group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>
    );
};

export default BatchCard;
