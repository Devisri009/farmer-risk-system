import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Download, Printer, Copy, CheckCheck, ExternalLink,
    Package, Scale, DollarSign, MapPin, Calendar, Hash, User,
    AlertTriangle, Activity, CheckCircle, Clock, Loader2, Shield, ShieldCheck
} from 'lucide-react';
import { getBatchById, updateBatchJourney } from '../api/cropApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
};

const RISK_STYLE = {
    Low: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    Moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    High: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const STATUS_STYLE = {
    PLANTED: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🌱' },
    GROWING: { bg: 'bg-green-50', text: 'text-green-700', icon: '🌿' },
    READY_FOR_HARVEST: { bg: 'bg-lime-50', text: 'text-lime-700', icon: '🌾' },
    HARVESTED: { bg: 'bg-amber-50', text: 'text-amber-700', icon: '🧺' },
    LISTED: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🛒' },
    SOLD: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '💰' },
    DELIVERED: { bg: 'bg-gray-50', text: 'text-gray-600', icon: '🚚' },
    Active: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '•' },
    Pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '•' },
};

const Badge = ({ label, styleMap }) => {
    const { t } = useTranslation();
    const isRisk = label === 'Low' || label === 'Moderate' || label === 'High';
    const s = styleMap[label] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '•' };
    
    return (
        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${s.bg} ${s.text} ${s.bg === 'bg-gray-100' ? 'border-gray-200' : 'border-current/10'}`}>
            {'dot' in s && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.dot}`} />}
            {s.icon && <span className="mr-1.5 opacity-80">{s.icon}</span>}
            {isRisk ? t(`myBatches.risk${label}`, label) : t(`myBatches.status${label}`, label)}
        </span>
    );
};

// Copy button
const CopyBtn = ({ value }) => {
    const [done, setDone] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
    };
    return (
        <button onClick={copy} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            {done ? <CheckCheck size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
    );
};

// Info row used in the detail card
const InfoRow = ({ icon: Icon, label, value, sub, valueClass = 'text-gray-900', mono = false }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
        <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-green-600" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500">{label}</p>
                {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
            </div>
        </div>
        <p className={`text-sm font-bold ml-4 text-right shrink-0 ${valueClass} ${mono ? 'font-mono' : ''}`}>
            {value}
        </p>
    </div>
);

// ─── Timeline ─────────────────────────────────────────────────────────────────
const Timeline = ({ events }) => {
    const { t } = useTranslation();
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-extrabold text-gray-800">{t('myBatches.blockchainTimeline', 'Blockchain Timeline')}</h2>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                    <Shield size={12} /> <span>{t('myBatches.blockchainVerified', 'Blockchain Verified')}</span>
                </span>
            </div>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

                <div className="space-y-6">
                    {events?.map((event, i) => (
                        <div key={i} className="relative flex items-start space-x-4 pl-10">
                            {/* Node */}
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10 ${event.completed ? 'bg-green-500' : 'bg-gray-200'
                                }`}>
                                {event.completed
                                    ? <CheckCircle size={16} className="text-white" />
                                    : <Clock size={14} className="text-gray-400" />}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 bg-white border rounded-xl p-4 shadow-sm transition-all ${event.completed ? 'border-green-100' : 'border-gray-200 opacity-60'
                                }`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`text-sm font-bold ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {event.key ? t(`myBatches.timeline${event.key}`, event.title) : t(`myBatches.timeline${event.title.replace(/\s+/g, '')}`, event.title)}
                                    </h4>
                                    {event.date && <span className="text-[10px] text-gray-400 font-mono">{event.date}</span>}
                                </div>
                                {event.details && (
                                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                        {Object.entries(event.details).map(([k, v]) => (
                                            <p key={k} className="text-xs text-gray-500">
                                                <span className="font-semibold text-gray-600">{t(`profile.${k.toLowerCase().replace(/\s+/g, '')}`, k)}:</span> {v.includes('₹') || v.includes('kg') ? v : t(`location.${v}`, v)}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BatchDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const qrRef = useRef(null);
    const authUser = getUser();

    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    
    const advanceStage = async (newStage, newGrade = null) => {
        try {
            setLoading(true);
            const res = await updateBatchJourney(id, newStage, newGrade);
            setBatch(res.data);
            toast.success('Stage updated successfully');
        } catch (e) {
            toast.error('Failed to update stage');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBatchById(id)
            .then((res) => setBatch(res.data))
            .catch(() =>
                setBatch({
                    id,
                    cropName: 'Organic Tomato',
                    crop: 'Organic Tomato',
                    quantity: '500 kg',
                    price: '20',
                    pricePerKg: '20',
                    totalAmount: '₹10,000',
                    risk: 'Low',
                    status: 'Active',
                    location: authUser.location || 'Madurai, Tamil Nadu',
                    cultivateDate: '2025-01-15',
                    harvestDate: '2025-06-10',
                    farmerName: authUser.name || 'Unknown Farmer',
                    farmerId: authUser.id || '—',
                    timeline: [
                        { title: 'Crop Registered', completed: true, date: '15 Jan 2025', details: { Farmer: authUser.name || 'Farmer', Location: 'Madurai' } },
                        { title: 'Listed on Marketplace', completed: true, date: '20 Jan 2025', details: { Price: '₹20/kg', Platform: 'FarmVista' } },
                        { title: 'Purchased by Retailer', completed: true, date: '14 Mar 2025', details: { Retailer: 'Green Market', Amount: '₹10,000' } },
                        { title: 'In Transit', completed: false, date: 'Pending', details: { Destination: 'Chennai' } },
                        { title: 'Delivered', completed: false, date: 'Pending', details: {} },
                    ],
                })
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-green-600" />
            </div>
        );
    }

    const farmerName = batch.farmerName || authUser.name || 'Unknown Farmer';
    const farmerId = batch.farmerId || authUser.id || '—';
    const trackUrl = `${window.location.origin}/track/${batch.id}`;
    // QR now encodes the traceability URL — payment QR is in the purchase/payment flow only
    const qrPayload = trackUrl;

    const handleDownloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 300, 300);
            ctx.drawImage(img, 0, 0, 300, 300);
            const a = document.createElement('a');
            a.download = `FarmVista-Batch-${batch.id}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">

            {/* ── Back + Page Title ── */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => navigate('/farmer/batches')}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        {t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop)}
                        <span className="ml-2 text-base font-semibold text-gray-400">{t('myBatches.headerBatchId')} #{batch.id}</span>
                    </h1>
                    <p className="text-sm text-gray-500">{t('myBatches.fullDetails', 'Full details, payment QR, and blockchain tracking')}</p>
                </div>
            </div>

            {/* ── Top Two-Column Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── Left: Batch Details (3 cols) ── */}
                <div className="lg:col-span-3 space-y-4">

                    {/* Hero Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: t('myBatches.headerCrop'), value: t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop), color: 'from-green-50 to-emerald-50', border: 'border-green-200' },
                            { label: t('myBatches.headerQuantity'), value: batch.quantity, color: 'from-blue-50 to-sky-50', border: 'border-blue-200' },
                            { label: t('myBatches.headerPrice'), value: `₹${batch.price || batch.pricePerKg}`, color: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
                            { label: t('myBatches.total'), value: batch.totalAmount || '—', color: 'from-purple-50 to-violet-50', border: 'border-purple-200' },
                        ].map(({ label, value, color, border }) => (
                            <div key={label} className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-4`}>
                                <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                                <p className="text-base font-extrabold text-gray-900 leading-tight">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detail Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                        <h2 className="text-base font-extrabold text-gray-800 mb-4">{t('myBatches.batchInfo', 'Batch Information')}</h2>

                        <InfoRow icon={Hash} label={t('myBatches.headerBatchId')} sub="System-generated on submission" value={batch.id ? `#${batch.id}` : 'Pending'} mono />
                        <InfoRow icon={User} label={t('myBatches.farmerName')} sub={`User ID: ${farmerId}`} value={farmerName} valueClass="text-green-700" />
                        <InfoRow icon={MapPin} label={t('profile.location')} value={t(`location.${batch.location}`, batch.location) || '—'} />
                        <InfoRow icon={Calendar} label={t('postCrop.cultivateDate')} value={batch.cultivateDate || '—'} />
                        <InfoRow icon={Calendar} label={t('postCrop.harvestDate')} value={batch.harvestDate || '—'} />

                        <div className="flex items-start justify-between py-3 border-b border-gray-50">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                    <AlertTriangle size={13} className="text-green-600" />
                                </div>
                                <p className="text-xs font-semibold text-gray-500">{t('myBatches.headerRisk')}</p>
                            </div>
                            <Badge label={batch.risk} styleMap={RISK_STYLE} />
                        </div>

                        <div className="flex items-start justify-between py-3 border-b border-gray-50">
                            <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                    <Activity size={13} className="text-green-600" />
                                </div>
                                <p className="text-xs font-semibold text-gray-500">{t('myBatches.headerStatus')}</p>
                            </div>
                            <Badge label={batch.status} styleMap={STATUS_STYLE} />
                        </div>
                        
                        {/* ── Lifecycle Stage Tracker ── */}
                        <div className="py-4 border-b border-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Crop Lifecycle Journey</p>
                                    <p className="text-[11px] text-gray-400">Current: <span className="font-extrabold text-green-700">{batch.stage || 'Cultivation'}</span> {batch.grade ? `(Grade ${batch.grade})` : ''}</p>
                                </div>
                                {batch.grade && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-lg border border-amber-300">
                                        Grade {batch.grade} Certified
                                    </span>
                                )}
                            </div>

                            {/* Stage Stepper Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-3">
                                {[
                                    { key: 'Cultivation', icon: '🌱', label: 'Cultivation' },
                                    { key: 'Growth', icon: '🌿', label: 'Growth' },
                                    { key: 'Harvest', icon: '🌾', label: 'Harvest' },
                                    { key: 'Quality Grading', icon: '⭐', label: 'Grading' },
                                    { key: 'Marketplace Ready', icon: '🛒', label: 'Ready' },
                                ].map((st) => {
                                    const isCurrent = (batch.stage || 'Cultivation') === st.key;
                                    return (
                                        <button
                                            key={st.key}
                                            type="button"
                                            onClick={() => advanceStage(st.key, st.key === 'Quality Grading' ? (batch.grade || 'A') : batch.grade)}
                                            className={`p-2.5 rounded-xl border text-center transition-all ${
                                                isCurrent
                                                    ? 'bg-green-600 text-white border-green-600 shadow-md scale-102 font-bold'
                                                    : 'bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 border-gray-200 hover:border-green-300 font-semibold'
                                            }`}
                                        >
                                            <span className="text-sm block mb-0.5">{st.icon}</span>
                                            <span className="text-[10px] block leading-tight">{st.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Grade Assignment Pills (Shown when in or entering Quality Grading) */}
                            {((batch.stage === 'Quality Grading') || batch.grade) && (
                                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                                    <p className="text-[11px] font-black text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                        <span>⭐</span> Assign Quality Grade
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => advanceStage(batch.stage || 'Quality Grading', 'A')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                                                batch.grade === 'A'
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                            }`}
                                        >
                                            🏆 Grade A (Premium Quality)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => advanceStage(batch.stage || 'Quality Grading', 'B')}
                                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                                                batch.grade === 'B'
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                            }`}
                                        >
                                            ✓ Grade B (Standard Quality)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* ── Right: QR Card (2 cols) ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col items-center space-y-4 h-full">

                        <div className="text-center">
                            <h2 className="text-base font-extrabold text-gray-800">Crop Traceability QR</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Scan to view the full crop journey & origin</p>
                        </div>

                        {/* QR Code */}
                        <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-green-200 shadow-inner">
                            <QRCodeSVG
                                value={qrPayload}
                                size={220}
                                level="M"
                                includeMargin={true}
                            />
                        </div>

                        {/* Batch label under QR */}
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-700">{t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop)}</p>
                            <p className="text-[11px] text-gray-400">{t('myBatches.headerBatchId')} #{batch.id} · {t(`myBatches.status${batch.status}`)}</p>
                        </div>

                        {/* Track URL */}
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">{t('myBatches.trackUrl', 'Track URL')}</p>
                            <div className="flex items-center justify-between space-x-2">
                                <span className="text-xs text-green-700 font-mono truncate">{trackUrl}</span>
                                <div className="flex items-center shrink-0">
                                    <CopyBtn value={trackUrl} />
                                    <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors">
                                        <ExternalLink size={13} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Download / Print */}
                        <div className="flex space-x-2 w-full">
                            <button
                                onClick={handleDownloadQR}
                                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-900/10"
                            >
                                <Download size={15} /> <span>{t('myBatches.download', 'Download')}</span>
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
                            >
                                <Printer size={15} />
                            </button>
                        </div>

                        {/* Payload copy */}
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t('myBatches.qrPayload', 'QR Payload')}</p>
                                <CopyBtn value={qrPayload} />
                            </div>
                            <p className="text-[10px] font-mono text-gray-400 break-all leading-relaxed line-clamp-2">
                                {qrPayload}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Blockchain Notarization Card ── */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white border border-blue-900/50 rounded-2xl shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-white tracking-wide">Polygon Amoy Smart Contract</h3>
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/20 rounded text-[10px] font-extrabold font-mono">
                                    80002
                                </span>
                            </div>
                            <p className="text-xs text-blue-200/70 mt-0.5">Immutable harvest verification & quality provenance proof</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a
                            href={batch.blockchain_tx_hash || batch.blockchainTxHash ? `https://amoy.polygonscan.com/tx/${batch.blockchain_tx_hash || batch.blockchainTxHash}` : 'https://amoy.polygonscan.com/address/0x01b3990B92506A429f7967056210e4931f8A13D8'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/40"
                        >
                            <span>Open PolygonScan</span>
                            <ExternalLink size={13} />
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                        <p className="text-[10px] font-extrabold text-blue-300/70 uppercase tracking-wider mb-1">On-Chain Status</p>
                        <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${batch.blockchain_tx_hash || batch.blockchainTxHash ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            <p className="text-sm font-bold text-white font-mono">
                                {batch.blockchain_tx_hash || batch.blockchainTxHash ? 'Mined & Verified' : 'Pending Confirmation'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-extrabold text-blue-300/70 uppercase tracking-wider">Transaction Hash</p>
                            {(batch.blockchain_tx_hash || batch.blockchainTxHash) && (
                                <CopyBtn value={batch.blockchain_tx_hash || batch.blockchainTxHash} />
                            )}
                        </div>
                        <p className="text-xs font-mono text-blue-200/90 truncate">
                            {batch.blockchain_tx_hash || batch.blockchainTxHash || 'Awaiting block inclusion...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Full-Width Timeline ── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <Timeline events={batch.timeline} />
            </div>

        </div>
    );
};

export default BatchDetails;
