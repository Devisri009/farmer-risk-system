import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    Building2, Plus, Users, Layers, ShieldCheck, MapPin,
    ArrowRight, CheckCheck, Loader2, Sparkles, TrendingUp
} from 'lucide-react';
import {
    getBuyerDemands,
    createBuyerDemand,
    getAggregatedContracts,
    triggerMatching,
    confirmContract
} from '../../api/buyerMatchingApi';

const BUYER_CATEGORIES = [
    'Supermarkets',
    'Restaurants & Hotels',
    'Food-Processing',
    'Exporters',
    'Local Retailers',
    'Government/Institutional'
];

const BuyerDemandPortal = () => {
    const { t } = useTranslation();
    const [demands, setDemands] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);

    const [form, setForm] = useState({
        buyerCategory: 'Supermarkets',
        cropName: 'Tomato',
        targetQuantityKg: 2000,
        maxPricePerKg: 24,
        frequency: 'Weekly',
        deliveryLocation: 'Chennai Distribution Hub',
        deliveryDistrict: 'Chennai',
        deliveryDeadline: 'Next Monday',
        notes: 'Cold-chain vehicle pickup provided at farm cluster point.'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [dRes, cRes] = await Promise.allSettled([
                getBuyerDemands(),
                getAggregatedContracts()
            ]);
            setDemands(dRes.status === 'fulfilled' ? dRes.value.data : []);
            setContracts(cRes.status === 'fulfilled' ? cRes.value.data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handlePostDemand = async (e) => {
        e.preventDefault();
        try {
            await createBuyerDemand({
                buyer_category: form.buyerCategory,
                crop_name: form.cropName,
                target_quantity_kg: parseFloat(form.targetQuantityKg),
                max_price_per_kg: parseFloat(form.maxPricePerKg),
                frequency: form.frequency,
                delivery_location: form.deliveryLocation,
                delivery_district: form.deliveryDistrict,
                delivery_deadline: form.deliveryDeadline,
                notes: form.notes
            });
            toast.success('Demand posted! AI matching engine initiated.');
            setShowPostModal(false);
            loadData();
        } catch (err) {
            toast.error('Failed to post buyer demand.');
        }
    };

    const handleTriggerMatch = async (demandId) => {
        try {
            await triggerMatching(demandId);
            toast.success('Supply cluster matched successfully!');
            loadData();
        } catch (err) {
            toast.error('Matching threshold not yet reached. Waiting for more farmer pool entries.');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 mb-2">
                        <Sparkles size={14} /> {t('matching.institutionalPortal', 'Institutional Procurement Portal')}
                    </div>
                    <h1 className="text-3xl font-black">{t('matching.heroTitle', 'Direct Sourcing & Farm Cluster Aggregation')}</h1>
                    <p className="text-blue-100 text-sm mt-1 max-w-2xl">
                        {t('matching.demandSubtitle', 'Post recurring bulk requirements and let our algorithm group verified smallholder farmers to meet your delivery specifications.')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowPostModal(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                    <Plus size={18} /> {t('matching.postDemandBtn', 'Post Bulk Demand')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 size={36} className="animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Active Demands */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Building2 size={20} className="text-blue-600" />
                            <span>{t('matching.activeDemandsTitle', 'Active Procurement Demands')}</span>
                        </h2>

                        <div className="space-y-4">
                            {demands.map((d) => (
                                <div key={d.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                                {t(`matching.categories.${d.buyer_category || d.buyerCategory}`, d.buyer_category || d.buyerCategory)}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 mt-1">{t(`crops.${d.crop_name || d.cropName}`, d.crop_name || d.cropName)}</h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                            d.status === 'Matched' || d.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {d.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 my-3 bg-gray-50 p-3 rounded-xl">
                                        <div>{t('matching.quantity', 'Volume')}: <span className="font-bold text-gray-900">{(d.target_quantity_kg || d.targetQuantityKg)?.toLocaleString()} kg</span></div>
                                        <div>{t('matching.maxPrice', 'Max Rate')}: <span className="font-bold text-gray-900">₹{d.max_price_per_kg || d.maxPricePerKg}/kg</span></div>
                                        <div>{t('matching.frequency', 'Schedule')}: <span className="font-bold text-gray-900">{d.frequency}</span></div>
                                        <div>{t('matching.deliveryLocation', 'Location')}: <span className="font-bold text-gray-900">{d.delivery_location || d.deliveryLocation}</span></div>
                                    </div>

                                    {d.status === 'Pending' && (
                                        <button
                                            type="button"
                                            onClick={() => handleTriggerMatch(d.id)}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                                        >
                                            {t('matching.triggerAiMatch', 'Trigger AI Farmer Cluster Match')}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Aggregated Contracts */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Layers size={20} className="text-emerald-600" />
                            <span>{t('matching.matchedContractsTitle', 'Aggregated Supply Contracts')}</span>
                        </h2>

                        <div className="space-y-4">
                            {contracts.map((c) => (
                                <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                                Contract #{c.id}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 mt-1">{t(`crops.${c.crop_name || c.cropName}`, c.crop_name || c.cropName)} {t('matching.contractCluster', 'Cluster Supply')}</h3>
                                        </div>
                                        <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-black">
                                            {c.status}
                                        </span>
                                    </div>

                                    <div className="bg-emerald-50/70 p-3 rounded-xl text-xs text-emerald-950 font-medium grid grid-cols-3 gap-2 text-center">
                                        <div>{t('matching.quantity', 'Volume')}: <b className="block text-sm">{(c.total_quantity_kg || c.totalQuantityKg)?.toLocaleString()} kg</b></div>
                                        <div>{t('matching.maxPrice', 'Agreed Rate')}: <b className="block text-sm">₹{c.agreed_price_per_kg || c.agreedPricePerKg}/kg</b></div>
                                        <div>{t('dashboard.revenue', 'Total Value')}: <b className="block text-sm">₹{(c.total_contract_value || c.totalContractValue)?.toLocaleString()}</b></div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">{t('matching.groupedFarmers', 'Grouped Farmers')} ({(c.farmer_allocations || c.farmerAllocations || []).length}):</p>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                            {(c.farmer_allocations || c.farmerAllocations || []).map((fa, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
                                                    <span className="font-semibold text-gray-800">{fa.farmer_name || fa.farmerName} ({fa.district || 'Local'})</span>
                                                    <span className="font-black text-emerald-700">{fa.allocated_kg || fa.allocatedKg} kg</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Blockchain Stamp & Confirmation Action */}
                                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-500 font-mono">
                                            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                                            {c.blockchain_contract_tx ? (
                                                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded truncate max-w-[200px]" title={c.blockchain_contract_tx}>
                                                    Tx: {c.blockchain_contract_tx.slice(0, 10)}...{c.blockchain_contract_tx.slice(-6)}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-gray-400">Escrow verification pending</span>
                                            )}
                                        </div>

                                        {c.status === 'Matched' && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await confirmContract(c.id);
                                                        toast.success(t('matching.contractConfirmed', 'Contract confirmed & notarized on blockchain!'));
                                                        loadData();
                                                    } catch (err) {
                                                        toast.error('Failed to confirm contract.');
                                                    }
                                                }}
                                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 justify-center shadow-sm cursor-pointer transition-all"
                                            >
                                                <CheckCheck size={14} />
                                                <span>{t('matching.confirmContractBtn', 'Confirm Contract')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-4">
                        <h3 className="text-xl font-black text-gray-900">{t('matching.postModalTitle', 'Post Bulk Procurement Demand')}</h3>
                        <form onSubmit={handlePostDemand} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase">Buyer Category</label>
                                <select
                                    value={form.buyerCategory}
                                    onChange={(e) => setForm({ ...form, buyerCategory: e.target.value })}
                                    className="w-full p-2.5 border rounded-xl text-sm font-bold bg-white"
                                >
                                    {BUYER_CATEGORIES.map(c => <option key={c} value={c}>{t(`matching.categories.${c}`, c)}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase">{t('matching.crop', 'Crop')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.cropName}
                                        onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                                        className="w-full p-2.5 border rounded-xl text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase">{t('matching.quantity', 'Quantity (kg)')}</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.targetQuantityKg}
                                        onChange={(e) => setForm({ ...form, targetQuantityKg: e.target.value })}
                                        className="w-full p-2.5 border rounded-xl text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase">{t('matching.maxPrice', 'Max Rate (₹/kg)')}</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={form.maxPricePerKg}
                                        onChange={(e) => setForm({ ...form, maxPricePerKg: e.target.value })}
                                        className="w-full p-2.5 border rounded-xl text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase">{t('matching.frequency', 'Frequency')}</label>
                                    <select
                                        value={form.frequency}
                                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                                        className="w-full p-2.5 border rounded-xl text-sm font-bold bg-white"
                                    >
                                        <option value="One-Time">One-Time</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase">{t('matching.deliveryLocation', 'Delivery Location')}</label>
                                <input
                                    type="text"
                                    required
                                    value={form.deliveryLocation}
                                    onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                                    className="w-full p-2.5 border rounded-xl text-sm font-bold"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    className="px-4 py-2 text-gray-600 font-bold text-sm"
                                >
                                    {t('matching.cancel', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm"
                                >
                                    {t('matching.postDemandBtn', 'Post Demand')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerDemandPortal;
