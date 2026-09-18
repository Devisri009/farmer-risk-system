import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    Users, ShoppingBag, Building2, Utensils, Factory, Plane,
    Store, Landmark, CheckCircle2, Clock, MapPin, ArrowRight,
    Sparkles, ShieldCheck, Plus, Layers, RefreshCw, X, ChevronRight,
    TrendingUp, FileText, CheckCheck, Loader2
} from 'lucide-react';
import {
    getBuyerDemands,
    enrollInSupplyPool,
    getMySupplyPool,
    getAggregatedContracts,
    confirmContract
} from '../api/buyerMatchingApi';
import { getFarmerBatches } from '../api/cropApi';

const CATEGORY_ICONS = {
    'Supermarkets': <Building2 className="text-blue-600" size={20} />,
    'Restaurants & Hotels': <Utensils className="text-amber-600" size={20} />,
    'Food-Processing': <Factory className="text-purple-600" size={20} />,
    'Exporters': <Plane className="text-emerald-600" size={20} />,
    'Local Retailers': <Store className="text-rose-600" size={20} />,
    'Government/Institutional': <Landmark className="text-indigo-600" size={20} />
};

const CATEGORIES = [
    'All',
    'Supermarkets',
    'Restaurants & Hotels',
    'Food-Processing',
    'Exporters',
    'Local Retailers',
    'Government/Institutional'
];

const FarmerBuyerMatching = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('demands'); // 'demands', 'contracts', 'my_pool'
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [demands, setDemands] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [myPool, setMyPool] = useState([]);
    const [myBatches, setMyBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [selectedDemand, setSelectedDemand] = useState(null);

    // Form state for enrollment
    const [enrollForm, setEnrollForm] = useState({
        cropName: 'Tomato',
        availableQuantityKg: 500,
        minPricePerKg: 20,
        qualityGrade: 'A',
        location: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [demandsRes, contractsRes, poolRes, batchesRes] = await Promise.allSettled([
                getBuyerDemands({ category: selectedCategory }),
                getAggregatedContracts(),
                getMySupplyPool(),
                getFarmerBatches()
            ]);

            setDemands(demandsRes.status === 'fulfilled' ? demandsRes.value.data : []);
            setContracts(contractsRes.status === 'fulfilled' ? contractsRes.value.data : []);
            setMyPool(poolRes.status === 'fulfilled' ? poolRes.value.data : []);
            setMyBatches(batchesRes.status === 'fulfilled' ? batchesRes.value.data : []);
        } catch (err) {
            console.error('Buyer Matching fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCategory]);

    const handleOpenEnrollForDemand = (demand) => {
        setSelectedDemand(demand);
        setEnrollForm({
            cropName: demand.crop_name || demand.cropName || 'Tomato',
            availableQuantityKg: 500,
            minPricePerKg: demand.max_price_per_kg || demand.maxPricePerKg || 22,
            qualityGrade: 'A',
            location: ''
        });
        setShowEnrollModal(true);
    };

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        try {
            await enrollInSupplyPool({
                crop_name: enrollForm.cropName,
                available_quantity_kg: parseFloat(enrollForm.availableQuantityKg),
                min_price_per_kg: parseFloat(enrollForm.minPricePerKg),
                quality_grade: enrollForm.qualityGrade,
                location: enrollForm.location
            });
            toast.success(t('matching.enrolledSuccess', 'Enrolled in supply pool! AI aggregation active.'));
            setShowEnrollModal(false);
            fetchData();
            setActiveTab('contracts');
        } catch (err) {
            toast.error(t('matching.enrolledError', 'Failed to enroll into supply pool.'));
        }
    };

    const handleConfirmContract = async (contractId) => {
        try {
            await confirmContract(contractId);
            toast.success(t('matching.contractConfirmed', 'Contract approved and recorded!'));
            fetchData();
        } catch (err) {
            toast.error('Failed to confirm contract.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-emerald-300 mb-3 border border-white/10">
                            <Sparkles size={14} />
                            <span>{t('matching.badge', 'AI Direct Buyer Aggregation')}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                            {t('matching.heroTitle', 'Direct Buyer Matching & Group Contracts')}
                        </h1>
                        <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
                            {t('matching.heroSub', 'Connect directly with verified supermarkets, food processors, exporters, and hotels. Smallholder farmers unite to fulfill large bulk orders with guaranteed contract rates.')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedDemand(null);
                                setShowEnrollModal(true);
                            }}
                            className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-2xl flex items-center gap-2 shadow-lg hover:scale-102 transition-all cursor-pointer text-sm"
                        >
                            <Plus size={18} />
                            <span>{t('matching.optInBtn', 'Join Supply Pool')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab('demands')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'demands' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Building2 size={16} />
                        <span>{t('matching.tabDemands', 'Verified Buyer Demands')}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-black">
                            {demands.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('contracts')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'contracts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Layers size={16} />
                        <span>{t('matching.tabContracts', 'Group Contracts')}</span>
                        {contracts.length > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-black animate-pulse">
                                {contracts.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('my_pool')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            activeTab === 'my_pool' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <CheckCheck size={16} />
                        <span>{t('matching.tabMyPool', 'My Enrolled Batches')}</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                            {myPool.length}
                        </span>
                    </button>
                </div>

                {/* Category Pills (Active on Demands tab) */}
                {activeTab === 'demands' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {t(`matching.categories.${cat}`, cat)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Loading */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3">
                    <Loader2 size={36} className="animate-spin text-green-600" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('matching.loading', 'Loading buyer matches...')}</p>
                </div>
            ) : null}

            {/* ── TAB 1: BUYER DEMANDS ── */}
            {!loading && activeTab === 'demands' && (
                <div className="space-y-6">
                    {demands.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-gray-400">
                            <Building2 size={40} className="mx-auto mb-2 text-gray-300" />
                            <p className="font-bold text-gray-600">{t('matching.noDemands', 'No buyer demands found in this category.')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {demands.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                                                    {CATEGORY_ICONS[item.buyer_category || item.buyerCategory] || <Building2 size={20} />}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                        {item.buyer_category || item.buyerCategory}
                                                    </span>
                                                    <h3 className="font-extrabold text-gray-900 text-lg leading-snug mt-1">
                                                        {item.buyer_name || item.buyerName}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requirements box */}
                                        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-2 mb-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-semibold">{t('matching.crop', 'Crop Required')}:</span>
                                                <span className="font-extrabold text-gray-900 text-base">{item.crop_name || item.cropName}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-semibold">{t('matching.quantity', 'Volume Target')}:</span>
                                                <span className="font-black text-emerald-700">{(item.target_quantity_kg || item.targetQuantityKg)?.toLocaleString()} kg</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-semibold">{t('matching.maxPrice', 'Offered Rate')}:</span>
                                                <span className="font-extrabold text-gray-900">₹{item.max_price_per_kg || item.maxPricePerKg}/kg</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200/60 text-gray-500">
                                                <span>{t('matching.frequency', 'Frequency')}:</span>
                                                <span className="font-bold text-gray-700">{item.frequency}</span>
                                            </div>
                                        </div>

                                        {item.notes && (
                                            <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">
                                                "{item.notes}"
                                            </p>
                                        )}

                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
                                            <MapPin size={14} className="text-emerald-600 shrink-0" />
                                            <span className="truncate">{item.delivery_location || item.deliveryLocation}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleOpenEnrollForDemand(item)}
                                        className="w-full py-3 bg-gray-900 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-101 cursor-pointer text-sm"
                                    >
                                        <span>{t('matching.joinOrder', 'Supply for this Order')}</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 2: AGGREGATED CONTRACTS ── */}
            {!loading && activeTab === 'contracts' && (
                <div className="space-y-6">
                    {contracts.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-gray-400">
                            <Layers size={40} className="mx-auto mb-2 text-gray-300" />
                            <p className="font-bold text-gray-600">{t('matching.noContracts', 'No active group contracts yet.')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('matching.noContractsSub', 'Enroll your batch to be automatically grouped into matching buyer contracts.')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {contracts.map((c) => (
                                <div
                                    key={c.id}
                                    className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden p-6 sm:p-8"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider">
                                                    Contract #{c.id} · {c.buyer_category || c.buyerCategory}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                    c.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                    c.status === 'Fulfilled' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    ● {c.status}
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-black text-gray-900">
                                                {c.crop_name || c.cropName} Supply Agreement with {c.buyer_name || c.buyerName}
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                                                <MapPin size={13} className="text-emerald-600" />
                                                <span>Delivery to: {c.delivery_location || c.deliveryLocation}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Total Aggregated Volume</p>
                                                <p className="text-2xl font-black text-emerald-950">{(c.total_quantity_kg || c.totalQuantityKg)?.toLocaleString()} kg</p>
                                            </div>
                                            <div className="h-8 w-px bg-emerald-200" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Agreed Contract Price</p>
                                                <p className="text-2xl font-black text-emerald-950">₹{c.agreed_price_per_kg || c.agreedPricePerKg}/kg</p>
                                            </div>
                                            <div className="h-8 w-px bg-emerald-200" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Total Contract Value</p>
                                                <p className="text-2xl font-black text-emerald-950">₹{(c.total_contract_value || c.totalContractValue)?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Aggregated Farmer Cluster Breakdown */}
                                    <div className="mt-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                                            <Users size={14} className="text-emerald-600" />
                                            <span>Matched Smallholder Farmer Supply Cluster ({(c.farmer_allocations || c.farmerAllocations || []).length} Farmers Grouped)</span>
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {(c.farmer_allocations || c.farmerAllocations || []).map((fa, fIdx) => (
                                                <div key={fIdx} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-extrabold text-sm text-gray-900">{fa.farmer_name || fa.farmerName}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{fa.district || 'Local Cluster'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-sm text-emerald-700">{fa.allocated_kg || fa.allocatedKg} kg</p>
                                                        <p className="text-xs font-bold text-gray-800">₹{(fa.payout_amount || fa.payoutAmount)?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions & Blockchain stamp */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <ShieldCheck size={16} className="text-green-600" />
                                            <span>
                                                {c.blockchain_contract_tx
                                                    ? `Blockchain Agreement Verified: ${c.blockchain_contract_tx.slice(0, 16)}...`
                                                    : 'Secured by Smart Contract volume escrow'}
                                            </span>
                                        </div>

                                        {c.status === 'Matched' && (
                                            <button
                                                type="button"
                                                onClick={() => handleConfirmContract(c.id)}
                                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                                            >
                                                <CheckCheck size={16} />
                                                <span>Confirm & Accept Contract</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 3: MY SUPPLY POOL ── */}
            {!loading && activeTab === 'my_pool' && (
                <div className="space-y-6">
                    {myPool.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-gray-400">
                            <Plus size={40} className="mx-auto mb-2 text-gray-300" />
                            <p className="font-bold text-gray-600">{t('matching.noPool', 'You have no batches in the supply pool.')}</p>
                            <button
                                type="button"
                                onClick={() => setShowEnrollModal(true)}
                                className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                            >
                                {t('matching.optInBtn', 'Join Supply Pool')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myPool.map((p) => (
                                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-50 text-green-700 rounded-md">
                                                Grade {p.quality_grade || p.qualityGrade || 'A'}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 mt-1">{p.crop_name || p.cropName}</h3>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                            p.status === 'Allocated' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-3.5 rounded-xl space-y-1.5 text-xs text-gray-600 mb-3">
                                        <div className="flex justify-between font-semibold">
                                            <span>Volume:</span>
                                            <span className="font-extrabold text-gray-900">{(p.available_quantity_kg || p.availableQuantityKg)?.toLocaleString()} kg</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Min Price:</span>
                                            <span className="font-extrabold text-emerald-700">₹{p.min_price_per_kg || p.minPricePerKg}/kg</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <MapPin size={12} /> {p.location || 'Local Farm'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ENROLL MODAL ── */}
            {showEnrollModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    {selectedDemand ? `Supply ${selectedDemand.crop_name} to ${selectedDemand.buyer_name}` : 'Join Farmer Supply Pool'}
                                </h3>
                                <p className="text-xs text-gray-500">Add your volume to collective buyer matches</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEnrollModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Crop Name</label>
                                <input
                                    type="text"
                                    required
                                    value={enrollForm.cropName}
                                    onChange={(e) => setEnrollForm({ ...enrollForm, cropName: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Quantity (kg)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={enrollForm.availableQuantityKg}
                                        onChange={(e) => setEnrollForm({ ...enrollForm, availableQuantityKg: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min Acceptable Price (₹/kg)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.5"
                                        required
                                        value={enrollForm.minPricePerKg}
                                        onChange={(e) => setEnrollForm({ ...enrollForm, minPricePerKg: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quality Grade</label>
                                    <select
                                        value={enrollForm.qualityGrade}
                                        onChange={(e) => setEnrollForm({ ...enrollForm, qualityGrade: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                                    >
                                        <option value="A">Grade A (Premium / Export)</option>
                                        <option value="B">Grade B (Standard Market)</option>
                                        <option value="C">Grade C (Processing)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Farm Location / District</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Madurai"
                                        value={enrollForm.location}
                                        onChange={(e) => setEnrollForm({ ...enrollForm, location: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-md transition-all cursor-pointer"
                                >
                                    Confirm Supply Enrollment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerBuyerMatching;
