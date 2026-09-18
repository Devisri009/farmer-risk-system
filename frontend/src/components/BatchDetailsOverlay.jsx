import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    X, Download, Printer, Copy, CheckCheck, ExternalLink,
    MapPin, Calendar, Hash, User,
    AlertTriangle, Activity, CheckCircle, Clock, Loader2, Shield, ShieldCheck,
    PlusCircle, Layers, Image as ImageIcon
} from 'lucide-react';
import { getBatchById, getBatchEvents } from '../api/cropApi';

const CopyBtn = ({ value }) => {
    const [done, setDone] = useState(false);
    const copy = (e) => {
        e.stopPropagation();
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

const InfoRow = ({ icon: Icon, label, value, sub, valueClass = 'text-gray-900', mono = false }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
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

const BatchDetailsOverlay = ({ batchId, isOpen, onClose, onAddUpdateClick }) => {
    const { t } = useTranslation();
    const qrRef = useRef(null);
    const [batch, setBatch] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxImg, setLightboxImg] = useState(null);

    const loadBatchData = async () => {
        if (!batchId) return;
        setLoading(true);
        try {
            const [batchRes, eventsRes] = await Promise.all([
                getBatchById(batchId),
                getBatchEvents(batchId).catch(() => ({ data: [] }))
            ]);
            setBatch(batchRes.data);
            setEvents(eventsRes.data || []);
        } catch (err) {
            console.error('Failed to load batch details:', err);
            toast.error('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && batchId) {
            loadBatchData();
        }
    }, [isOpen, batchId]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (lightboxImg) {
                    setLightboxImg(null);
                } else if (isOpen) {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, lightboxImg]);

    if (!isOpen) return null;

    const trackUrl = batch ? `${window.location.origin}/track/${batch.id}` : '';

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
        <div 
            className="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden my-4 sm:my-8 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Close button */}
                <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-green-100 text-green-800 text-xs font-mono font-black">
                                Batch #{batchId}
                            </span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs font-semibold text-gray-500">FarmVista Traceability</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                            {batch ? (t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop)) : 'Loading Batch...'}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-2">
                        {batch && (
                            <button
                                type="button"
                                onClick={() => onAddUpdateClick(batch)}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                <PlusCircle size={15} />
                                <span>+ Add Crop Update</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={36} className="animate-spin text-green-600 mb-3" />
                            <p className="text-sm font-bold text-gray-500">Loading verified batch details...</p>
                        </div>
                    ) : batch ? (
                        <>
                            {/* Hero Stat Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/80 rounded-2xl p-4">
                                    <p className="text-[11px] font-bold text-gray-500 mb-1">Crop</p>
                                    <p className="text-base font-extrabold text-gray-900">{t(`crops.${batch.cropName || batch.crop}`, batch.cropName || batch.crop)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 rounded-2xl p-4">
                                    <p className="text-[11px] font-bold text-gray-500 mb-1">Quantity</p>
                                    <p className="text-base font-extrabold text-gray-900">{batch.quantity || '—'}</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/80 rounded-2xl p-4">
                                    <p className="text-[11px] font-bold text-gray-500 mb-1">Price / kg</p>
                                    <p className="text-base font-extrabold text-emerald-800">₹{batch.pricePerKg ?? batch.price ?? '—'}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/80 rounded-2xl p-4">
                                    <p className="text-[11px] font-bold text-gray-500 mb-1">Status</p>
                                    <p className="text-base font-extrabold text-purple-900">{batch.status || 'Active'}</p>
                                </div>
                            </div>

                            {/* Batch Info Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                                <h3 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider">
                                    Batch Specification
                                </h3>
                                <InfoRow icon={Hash} label="Batch ID" value={`#${batch.id}`} mono />
                                <InfoRow icon={MapPin} label="Origin Location" value={batch.location || 'Tamil Nadu, India'} />
                                <InfoRow icon={Calendar} label="Cultivation Date" value={batch.cultivateDate || '—'} />
                                <InfoRow icon={Calendar} label="Harvest Date" value={batch.harvestDate || '—'} />
                                <InfoRow icon={Layers} label="Journey Stage" value={batch.stage || 'Cultivation'} valueClass="text-emerald-700" />
                                <InfoRow icon={AlertTriangle} label="Risk Level" value={batch.riskLevel || batch.risk || 'Low'} />
                            </div>

                            {/* Chronological Crop Journey / Verified Updates Timeline */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                                            <span>Crop Lifecycle & Update Log</span>
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
                                                {events.length} event(s)
                                            </span>
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Chronological log recorded by farmer with photo evidence.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onAddUpdateClick(batch)}
                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition-colors"
                                    >
                                        <PlusCircle size={14} />
                                        <span>+ Add Update</span>
                                    </button>
                                </div>

                                <div className="relative border-l-2 border-green-200 ml-4 pl-6 space-y-6 my-4">
                                    {/* Baseline Registration Event */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shadow-md">
                                            🌱
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Crop Registered</h4>
                                                <span className="text-[11px] font-mono text-gray-400">
                                                    {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : (batch.cultivateDate || '—')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                Batch #{batch.id} initialized at {batch.location || 'farm location'}.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Real Farmer Logged Events */}
                                    {events.map((evt) => (
                                        <div key={evt.id} className="relative">
                                            <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md">
                                                ✓
                                            </div>
                                            <div className="bg-white rounded-2xl p-4 border border-emerald-100/90 shadow-sm hover:border-emerald-200 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                                    <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                                        <span>{evt.activity}</span>
                                                        {evt.quantity && (
                                                            <span className="px-2 py-0.2 rounded bg-gray-100 text-gray-700 text-[10px] font-mono font-bold">
                                                                Qty: {evt.quantity}
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                                                        <span>Event Date: <strong>{evt.eventDate}</strong></span>
                                                        {evt.createdAt && (
                                                            <span className="text-gray-300">· Logged: {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-700 leading-relaxed mb-3">
                                                    {evt.description}
                                                </p>

                                                {/* Photo / Evidence if uploaded */}
                                                {evt.photoUrl && (
                                                    <div className="mt-2">
                                                        <div 
                                                            onClick={() => setLightboxImg(evt.photoUrl.startsWith('http') ? evt.photoUrl : `http://localhost:5000${evt.photoUrl}`)}
                                                            className="inline-block relative rounded-xl overflow-hidden cursor-zoom-in border border-gray-200 shadow-xs group"
                                                        >
                                                            <img 
                                                                src={evt.photoUrl.startsWith('http') ? evt.photoUrl : `http://localhost:5000${evt.photoUrl}`} 
                                                                alt="Crop Evidence" 
                                                                className="h-36 w-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                                Click to zoom
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Traceability QR Card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-6">
                                <div ref={qrRef} className="p-3 bg-white rounded-2xl border-2 border-green-200 shadow-inner shrink-0">
                                    <QRCodeSVG value={trackUrl} size={160} level="M" includeMargin={true} />
                                </div>

                                <div className="flex-1 text-center sm:text-left space-y-3">
                                    <div>
                                        <h3 className="text-base font-black text-gray-900">Crop Traceability QR</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Scan to verify the full crop journey and photographic evidence on the public ledger.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between">
                                        <span className="text-xs font-mono text-green-700 truncate mr-2">{trackUrl}</span>
                                        <div className="flex items-center space-x-1 shrink-0">
                                            <CopyBtn value={trackUrl} />
                                            <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
                                                <ExternalLink size={13} />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadQR}
                                            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            <Download size={14} /> <span>Download QR</span>
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            <Printer size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Polygon Amoy Blockchain Card */}
                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 border border-blue-900/50 shadow-md">
                                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                                            <ShieldCheck size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Polygon Amoy Smart Contract</h4>
                                            <p className="text-[11px] text-blue-200/70">Chain ID 80002 · Cryptographic Proof</p>
                                        </div>
                                    </div>

                                    <a
                                        href={batch.blockchain_tx_hash || batch.blockchainTxHash ? `https://amoy.polygonscan.com/tx/${batch.blockchain_tx_hash || batch.blockchainTxHash}` : 'https://amoy.polygonscan.com/address/0x01b3990B92506A429f7967056210e4931f8A13D8'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <span>PolygonScan</span>
                                        <ExternalLink size={12} />
                                    </a>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">Transaction Hash</span>
                                        {(batch.blockchain_tx_hash || batch.blockchainTxHash) && (
                                            <CopyBtn value={batch.blockchain_tx_hash || batch.blockchainTxHash} />
                                        )}
                                    </div>
                                    <p className="text-xs font-mono text-blue-100 truncate">
                                        {batch.blockchain_tx_hash || batch.blockchainTxHash || 'Awaiting block confirmation...'}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-10">Batch information not found.</p>
                    )}
                </div>
            </div>

            {/* Lightbox for full-resolution photo */}
            {lightboxImg && (
                <div 
                    className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxImg(null)}
                >
                    <img 
                        src={lightboxImg} 
                        alt="Enlarged Evidence" 
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
                    />
                    <button 
                        onClick={() => setLightboxImg(null)}
                        className="absolute top-5 right-5 text-white bg-white/20 hover:bg-white/30 rounded-full p-2"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default BatchDetailsOverlay;
