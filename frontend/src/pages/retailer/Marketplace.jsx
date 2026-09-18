import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';
import apiClient from '../../api/client';

const Marketplace = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [crops, setCrops] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await apiClient.get('/marketplace');
                if (response.data) {
                    setCrops(response.data);
                } else {
                    setCrops([]);
                }
            } catch (error) {
                console.error("Failed to fetch marketplace crops:", error);
                setCrops([]);
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
                        <span>Verified On-Chain Only</span>
                    </button>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search crops or locations..."
                            className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

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

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-xs text-gray-500 font-semibold mb-1">{t('marketplace.quantity', 'Quantity')}</div>
                                        <div className="font-bold text-gray-900">{crop.quantity}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-xs text-gray-500 font-semibold mb-1">{t('marketplace.priceUnit', 'Price / Unit')}</div>
                                        <div className="font-bold text-primary-green">${crop.price}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-500">{t('marketplace.climateRisk', 'Climate Risk:')}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${crop.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                                            crop.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {crop.riskLevel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-500">{t('marketplace.status', 'Status:')}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border ${
                                            (crop.status === 'LISTED' || crop.status === 'Active') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            crop.status === 'GROWING' ? 'bg-green-50 text-green-700 border-green-100' :
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
                                    <Link to={`/retailer/payment/${crop.id}`} className="flex-1 bg-primary-green text-center text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 block cursor-pointer">
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
                                <Link to={`/track/${crop.id}`} className="px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition block text-center">
                                    {t('marketplace.details', 'Details')}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Marketplace;
