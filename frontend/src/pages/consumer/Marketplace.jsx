import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ShieldCheck, ExternalLink, Users, Sparkles, Filter } from 'lucide-react';
import apiClient from '../../api/client';
import { getPublicSupplyPool } from '../../api/buyerMatchingApi';

const Marketplace = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('marketplace'); // 'marketplace' or 'supply_pool'
    const [crops, setCrops] = useState([]);
    const [supplyPool, setSupplyPool] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const [cropRes, poolRes] = await Promise.allSettled([
                    apiClient.get('/marketplace'),
                    getPublicSupplyPool()
                ]);

                setCrops(cropRes.status === 'fulfilled' ? (cropRes.value.data || []) : []);
                setSupplyPool(poolRes.status === 'fulfilled' ? (poolRes.value.data || []) : []);
            } catch (error) {
                console.error("Failed to fetch marketplace data:", error);
                setCrops([]);
                setSupplyPool([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    const filteredCrops = crops.filter((crop) => {
        const nameMatch = (crop.cropName || crop.crop_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (crop.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const isVerified = crop.verified || !!crop.blockchain_tx_hash || !!crop.blockchainTxHash || crop.blockchain_status === 'confirmed' || crop.blockchainStatus === 'confirmed';

        if (verifiedOnly) {
            return nameMatch && isVerified;
        }
        return nameMatch;
    });

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('marketplace.retailerTitle', 'Crop Marketplace')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('marketplace.retailerDesc', 'Browse and purchase verified crops directly from farmers.')}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            verifiedOnly
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                        title="Filter only batches verified on Polygon Amoy"
                    >
                        <ShieldCheck size={16} className={verifiedOnly ? 'text-white' : 'text-blue-600'} />
                        <span>{t('matching.onChainVerifiedOnly', 'Verified On-Chain Only')}</span>
                    </button>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('marketplace.searchPlaceholder', 'Search crops or locations...')}
                            className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setViewMode('marketplace')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            viewMode === 'marketplace'
                                ? 'bg-green-700 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {t('matching.activeCropListings', 'Active Crop Listings')} ({filteredCrops.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('supply_pool')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                            viewMode === 'supply_pool'
                                ? 'bg-blue-700 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Users size={16} />
                        <span>{t('matching.directPoolTitle', 'Direct Farmer Supply Pool')} ({supplyPool.length})</span>
                    </button>
                </div>
                {viewMode === 'supply_pool' && (
                    <Link
                        to="/consumer/buyer-demands"
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                        <span>{t('matching.postDemandBtn', 'Need bulk volume? Post Demand →')}</span>
                    </Link>
                )}
            </div>

            {viewMode === 'marketplace' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCrops.map((crop) => {
                        const isVerified = crop.verified || !!crop.blockchain_tx_hash || !!crop.blockchainTxHash || crop.blockchain_status === 'confirmed' || crop.blockchainStatus === 'confirmed';
                        const txHash = crop.blockchain_tx_hash || crop.blockchainTxHash;

                        return (
                            <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{crop.cropName}</h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <MapPin size={14} className="mr-1" /> {crop.location}
                                            </div>
                                        </div>
                                        {isVerified && (
                                            <a
                                                href={txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : 'https://amoy.polygonscan.com/address/0x01b3990B92506A429f7967056210e4931f8A13D8'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 border border-blue-200 text-xs font-bold transition-colors"
                                                title={txHash ? `Polygon Tx: ${txHash}` : 'Verified on Polygon Amoy'}
                                            >
                                                <ShieldCheck size={14} className="text-blue-600" />
                                                <span>On-Chain</span>
                                                <ExternalLink size={10} className="text-blue-500" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-sm font-semibold text-gray-600">{t('marketplace.quantity', 'Quantity')}</span>
                                            <span className="font-bold text-gray-900">{crop.quantity}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-sm font-semibold text-gray-600">{t('marketplace.priceUnit', 'Price / Unit')}</span>
                                            <span className="font-bold text-primary-green">₹{crop.price} <span className="text-xs text-gray-400 font-normal">/kg</span></span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                            <span className="text-sm font-semibold text-gray-600">Stage & Status</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                                crop.status === 'PLANTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                crop.status === 'READY_FOR_HARVEST' ? 'bg-lime-50 text-lime-700 border-lime-100' :
                                                crop.status === 'HARVESTED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {crop.status === 'PLANTED' && '🌱'}
                                                {crop.status === 'GROWING' && '🌿'}
                                                {crop.status === 'READY_FOR_HARVEST' && '🌾'}
                                                {crop.status === 'HARVESTED' && '🧺'}
                                                {(crop.status === 'LISTED' || crop.status === 'Active') && '🛒'}
                                                {crop.status === 'SOLD' && '💰'}
                                                {crop.status === 'DELIVERED' && '🚚'}
                                                {t(`myBatches.status${crop.status}`, crop.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 flex gap-3">
                                    {(crop.status === 'LISTED' || crop.status === 'Active') ? (
                                        <Link to={`/consumer/payment/${crop.id}`} className="flex-1 bg-primary-green text-center text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 block cursor-pointer">
                                            {t('marketplace.buyNow', 'Buy Now')}
                                        </Link>
                                    ) : (crop.status === 'Sold' || crop.status === 'SOLD') ? (
                                        <button disabled className="flex-1 bg-gray-200 text-gray-500 px-4 py-3 rounded-xl font-bold cursor-not-allowed">
                                            {t('marketplace.soldOut', 'Sold Out')}
                                        </button>
                                    ) : (
                                        <button disabled className="flex-1 bg-gray-200 text-gray-400 px-4 py-3 rounded-xl font-bold cursor-not-allowed">
                                            {t('marketplace.notAvailable', 'Not Available Yet')}
                                        </button>
                                    )}
                                    <Link to={`/track/${crop.id}`} className="px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition block text-center" title="Inspect complete crop lifecycle & blockchain audit">
                                        {t('marketplace.details', 'Details')}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Direct Farmer Supply Pool Grid */
                <div className="space-y-4">
                    <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{t('matching.directPoolTitle', 'Direct Smallholder Supply Pool')}</h4>
                                <p className="text-xs text-gray-500">{t('matching.directPoolSub', 'Farmers pooling harvest batches ready for institutional and bulk procurement.')}</p>
                            </div>
                        </div>
                        <Link
                            to="/consumer/buyer-demands"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                            + {t('matching.postDemandBtn', 'Post Bulk Demand')}
                        </Link>
                    </div>

                    {supplyPool.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                            <Users size={36} className="mx-auto mb-2 text-gray-300" />
                            <p className="font-bold">{t('matching.noPool', 'No farmer pool entries available currently.')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {supplyPool.map((p) => (
                                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                Grade {p.qualityGrade || p.quality_grade || 'A'}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 mt-1">{t(`crops.${p.cropName || p.crop_name}`, p.cropName || p.crop_name)}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={12} /> {p.district || p.location}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                            {p.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 py-2 border-y border-gray-100 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('myBatches.farmerName', 'Farmer')}:</span>
                                            <span className="font-bold text-gray-800">{p.farmerName || p.farmer_name || `Farmer #${p.farmerId}`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('matching.quantity', 'Available Volume')}:</span>
                                            <span className="font-bold text-gray-900">{p.availableQuantityKg || p.available_quantity_kg} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('matching.maxPrice', 'Min Floor Price')}:</span>
                                            <span className="font-bold text-emerald-700">₹{p.minPricePerKg || p.min_price_per_kg}/kg</span>
                                        </div>
                                        {p.harvestDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">{t('common.harvested', 'Harvest Date')}:</span>
                                                <span className="font-medium text-gray-600">{p.harvestDate}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/track/${p.cropId || p.crop_id || 1}`}
                                            className="flex-1 py-2 text-center text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
                                        >
                                            {t('matching.viewTraceability', 'View Traceability')}
                                        </Link>
                                        <Link
                                            to="/consumer/buyer-demands"
                                            className="flex-1 py-2 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                                        >
                                            {t('matching.procureBatch', 'Procure Batch')}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
