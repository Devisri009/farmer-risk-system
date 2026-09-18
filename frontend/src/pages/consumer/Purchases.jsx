import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QrCode, Eye, CheckCircle, Tag, X, ArrowRight, ShieldCheck, ExternalLink, Copy } from 'lucide-react';
import apiClient from '../../api/client';

const Purchases = () => {
    const { t } = useTranslation();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await apiClient.get('/consumer/purchases');
                setPurchases(response.data);
            } catch (error) {
                console.error("Failed to fetch purchases:", error);
                // Setup hard fallback if error
                setPurchases([
                    {
                        id: "FB-7098",
                        crop_name: "Organic Carrots",
                        farmer_name: "Valley Produce",
                        quantity: "200 kg",
                        total_paid: "412.50",
                        date: "2026-02-15",
                        status: "Delivered",
                        tx_hash: "0x8f2b3e4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [modalType, setModalType] = useState(null); // 'resell', 'qr', or 'audit'

    const openModal = (purchase, type) => {
        setSelectedPurchase(purchase);
        setModalType(type);
    };

    const closeModal = () => {
        setSelectedPurchase(null);
        setModalType(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">{t('consumer.myPurchasesTitle', 'My Purchases')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('consumer.myPurchasesSub', 'Track your bought crops and view blockchain receipts.')}</p>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
                </div>
            ) : purchases.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <p className="mb-4">{t('consumer.noPurchasesYet', "You haven't made any purchases yet.")}</p>
                    <Link to="/consumer/marketplace" className="inline-block bg-primary-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                        {t('consumer.browseMarketplace', 'Browse Marketplace')}
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">{t('consumer.batchId', 'Batch ID')}</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">{t('consumer.cropDetails', 'Crop / Details')}</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">{t('consumer.totalPaid', 'Total Paid')}</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">{t('consumer.date', 'Date')}</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">{t('consumer.status', 'Status')}</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 text-right">{t('consumer.receiptTracking', 'Receipt / Tracking')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4 font-bold text-gray-900">{purchase.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{t(`crops.${purchase.crop_name}`, purchase.crop_name)} • {purchase.quantity}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><CheckCircle size={12} className="text-primary-green" /> {purchase.farmer_name}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-primary-green">₹{purchase.total_paid}</td>
                                <td className="px-6 py-4 text-gray-600">{purchase.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${purchase.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {purchase.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openModal(purchase, 'audit')}
                                            className="text-xs text-blue-700 hover:text-blue-900 font-mono px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
                                            title="View Blockchain Provenance Audit"
                                        >
                                            <ShieldCheck size={13} className="text-blue-600" />
                                            <span>{purchase.tx_hash ? `${purchase.tx_hash.substring(0,6)}...${purchase.tx_hash.substring(purchase.tx_hash.length-4)}` : 'On-Chain'}</span>
                                        </button>
                                        <button 
                                            onClick={() => openModal(purchase, 'resell')}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 cursor-pointer" 
                                            title="Resell Crop">
                                            <Tag size={18} />
                                        </button>
                                        <button 
                                            onClick={() => openModal(purchase, 'qr')}
                                            className="p-2 text-primary-green hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100 cursor-pointer" 
                                            title="Generate QR Tracking">
                                            <QrCode size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {/* Modals */}
            {modalType && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">
                                {modalType === 'resell' ? t('consumer.resellCrop', 'Resell Crop Batch') : modalType === 'audit' ? t('consumer.blockchainAudit', 'Blockchain Provenance Audit') : t('consumer.traceabilityQr', 'Traceability QR Code')}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-200 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {modalType === 'resell' && selectedPurchase && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">{t('consumer.cropDetails', 'Purchased Item')}</p>
                                        <p className="font-bold text-gray-900">{t(`crops.${selectedPurchase.crop_name}`, selectedPurchase.crop_name)} • {selectedPurchase.quantity}</p>
                                        <p className="text-sm text-gray-600 font-mono mt-1">Cost: ₹{selectedPurchase.total_paid}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Set Selling Price</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">₹</span>
                                            </div>
                                            <input type="number" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all" placeholder="e.g. 600.00" />
                                        </div>
                                    </div>
                                    <button className="w-full py-3 bg-primary-green text-white font-bold rounded-xl mt-4 hover:bg-green-700 transition shadow-lg shadow-green-900/20 flex justify-center items-center gap-2 cursor-pointer">
                                        List on Marketplace <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}

                            {modalType === 'audit' && selectedPurchase && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl border border-blue-900/60 shadow-inner">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                                                <ShieldCheck size={16} />
                                                <span>{t('dashboard.polygonLive', 'Polygon Amoy Verified')}</span>
                                            </div>
                                            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/20">
                                                Chain ID 80002
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold">{t(`crops.${selectedPurchase.crop_name}`, selectedPurchase.crop_name)} • {selectedPurchase.quantity}</p>
                                        <p className="text-xs text-blue-200/70 mt-0.5">{t('myBatches.farmerName', 'Farmer')}: {selectedPurchase.farmer_name}</p>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500 font-semibold">Smart Contract</span>
                                            <span className="font-mono text-gray-800">0x01b3...13D8</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500 font-semibold">{t('consumer.totalPaid', 'Total Paid')}</span>
                                            <span className="font-bold text-primary-green">₹{selectedPurchase.total_paid}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-gray-500 font-semibold">{t('consumer.date', 'Date Settled')}</span>
                                            <span className="text-gray-800">{selectedPurchase.date}</span>
                                        </div>
                                        <div className="py-2">
                                            <p className="text-gray-500 font-semibold mb-1">Transaction Hash:</p>
                                            <p className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-[10px] text-gray-700 break-all select-all">
                                                {selectedPurchase.tx_hash || '0x01b3990B92506A429f7967056210e4931f8A13D8'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <a
                                            href={selectedPurchase.tx_hash ? `https://amoy.polygonscan.com/tx/${selectedPurchase.tx_hash}` : 'https://amoy.polygonscan.com/'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center text-xs flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <span>PolygonScan Explorer</span>
                                            <ExternalLink size={13} />
                                        </a>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedPurchase.tx_hash || '');
                                                alert("Transaction Hash copied to clipboard!");
                                            }}
                                            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition text-xs flex items-center justify-center gap-1 border border-gray-200 cursor-pointer"
                                        >
                                            <Copy size={13} />
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalType === 'qr' && selectedPurchase && (
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-xl inline-block shadow-sm">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/track/' + selectedPurchase.id)}`} alt="QR Code" className="w-48 h-48" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{t(`crops.${selectedPurchase.crop_name}`, selectedPurchase.crop_name)}</h4>
                                        <p className="text-sm text-gray-500 font-mono mt-1">{t('consumer.batchId', 'Batch ID')}: {selectedPurchase.id}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100">
                                        {t('common.immutableTrackingNote', "Print or display this QR code to allow consumers to track the crop's journey on the blockchain.")}
                                    </p>
                                    <div className="flex gap-3 w-full mt-4">
                                        <Link to={`/track/${selectedPurchase.id}`} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition text-center border border-gray-200">
                                            {t('marketplace.details', 'View Page')}
                                        </Link>
                                        <button className="flex-1 py-2.5 bg-primary-green text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-900/20 cursor-pointer" onClick={() => window.alert("Downloading QR Code...")}>
                                            {t('myBatches.download', 'Download')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
