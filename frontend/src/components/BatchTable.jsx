import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ExternalLink, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── Badge helpers ────────────────────────────────────────────────────────────
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
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-all shadow-xs"
                title={txHash ? `Polygon Amoy: ${txHash}` : 'Verified on Polygon Amoy'}
            >
                <ShieldCheck size={13} className="text-blue-600" />
                <span>{t('myBatches.verifiedBadge', 'Verified')}</span>
                {txHash && <ExternalLink size={10} className="text-blue-500" />}
            </a>
        );
    }

    if (isFailed) {
        return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold" title="Transaction could not be confirmed on-chain">
                <AlertCircle size={12} />
                <span>Unverified</span>
            </span>
        );
    }

    // Default / Pending state
    return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-semibold" title="Submitting batch to Polygon Amoy blockchain...">
            <Loader2 size={11} className="animate-spin text-amber-600" />
            <span>Syncing</span>
        </span>
    );
};
const RiskBadge = ({ risk }) => {
    const { t } = useTranslation();
    const styles = {
        Low: 'bg-green-100 text-green-800',
        Moderate: 'bg-yellow-100 text-yellow-800',
        High: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[risk] || 'bg-gray-100 text-gray-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${risk === 'Low' ? 'bg-green-500' : risk === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
            {t(`myBatches.risk${risk}`, risk)}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const styles = {
        PLANTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        GROWING: 'bg-green-50 text-green-700 border-green-100',
        READY_FOR_HARVEST: 'bg-lime-50 text-lime-700 border-lime-100',
        HARVESTED: 'bg-amber-50 text-amber-700 border-amber-100',
        LISTED: 'bg-blue-50 text-blue-700 border-blue-100',
        SOLD: 'bg-purple-50 text-purple-700 border-purple-100',
        DELIVERED: 'bg-gray-50 text-gray-600 border-gray-200',
        // Legacy support
        Active: 'bg-blue-50 text-blue-700 border-blue-100',
        Pending: 'bg-orange-50 text-orange-700 border-orange-100',
    };

    const icons = {
        PLANTED: '🌱',
        GROWING: '🌿',
        READY_FOR_HARVEST: '🌾',
        HARVESTED: '🧺',
        LISTED: '🛒',
        SOLD: '💰',
        DELIVERED: '🚚',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${styles[status] || styles.Active}`}>
            <span className="mr-1.5">{icons[status] || '•'}</span>
            {t(`myBatches.status${status}`, status)}
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="mr-1.5">{stageIcons[stage] || '🌱'}</span>
            <span>{stage || 'Cultivation'}</span>
            {grade && <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-black border border-amber-300">Grade {grade}</span>}
        </span>
    );
};

// ─── BatchTable ───────────────────────────────────────────────────────────────
const BatchTable = ({ batches, onUpdateStatus }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead>
                    <tr className="bg-gray-50">
                        {[
                            t('myBatches.headerBatchId'), t('myBatches.headerCrop'), t('myBatches.headerQuantity'),
                            t('myBatches.headerPrice'), t('myBatches.headerStage', 'Journey Stage'), t('myBatches.headerRisk'), t('myBatches.headerStatus'),
                            t('myBatches.verification', 'Verification'), t('myBatches.headerAction', 'Crop Traceability')
                        ].map((h) => (
                            <th
                                key={h}
                                className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {batches.map((batch) => (
                        <tr
                            key={batch.id}
                            className="hover:bg-green-50/40 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/farmer/batches/${batch.id}`)}
                        >
                            <td className="px-5 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-gray-900 font-mono">#{batch.id}</span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-800">
                                    {t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop || '—')}
                                </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                                {batch.quantity}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                ₹{batch.pricePerKg ?? batch.price ?? '—'}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                                <StageBadge stage={batch.stage} grade={batch.grade} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                                <RiskBadge risk={batch.riskLevel || batch.risk || 'Low'} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <select
                                    value={batch.status}
                                    onChange={(e) => onUpdateStatus(batch.id, e.target.value)}
                                    className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                                >
                                    <option value="PLANTED">🌱 {t('myBatches.statusPLANTED')}</option>
                                    <option value="GROWING">🌿 {t('myBatches.statusGROWING')}</option>
                                    <option value="READY_FOR_HARVEST">🌾 {t('myBatches.statusREADY_FOR_HARVEST')}</option>
                                    <option value="HARVESTED">🧺 {t('myBatches.statusHARVESTED')}</option>
                                    <option value="LISTED">🛒 {t('myBatches.statusLISTED')}</option>
                                    <option value="SOLD">💰 {t('myBatches.statusSOLD')}</option>
                                    <option value="DELIVERED">🚚 {t('myBatches.statusDELIVERED')}</option>
                                    {/* Handle legacy Active status */}
                                    {batch.status === 'Active' && <option value="Active">Active</option>}
                                </select>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                                <BlockchainBadge 
                                    txHash={batch.blockchain_tx_hash || batch.blockchainTxHash} 
                                    status={batch.blockchain_status || batch.blockchainStatus} 
                                />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/farmer/batches/${batch.id}`); }}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors border border-green-200"
                                >
                                    <Eye size={13} />
                                    <span>{t('myBatches.viewDetailsBtn')}</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BatchTable;
