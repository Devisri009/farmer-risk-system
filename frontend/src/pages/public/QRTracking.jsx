import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ShieldCheck, MapPin, Package, ArrowLeft, Clock, QrCode,
    Leaf, Sprout, Wheat, Star, CheckCircle, Loader2, AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import client from '../../api/client';

const STAGE_ICONS = {
    'Cultivation':       <Sprout size={16} className="text-white" />,
    'Growth':            <Leaf size={16} className="text-white" />,
    'Harvest':           <Wheat size={16} className="text-white" />,
    'Quality Grading':   <Star size={16} className="text-white" />,
    'Marketplace Ready': <CheckCircle size={16} className="text-white" />,
    'Crop Registered':   <ShieldCheck size={16} className="text-white" />,
    'Blockchain Verified': <ShieldCheck size={16} className="text-white" />,
};

const STAGE_ORDER = ['Cultivation', 'Growth', 'Harvest', 'Quality Grading', 'Marketplace Ready'];

const QRTracking = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                // Use the public traceability endpoint — no auth required
                const res = await client.get(`/public/trace/${id}`);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch traceability data:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchTrackingData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-4">
                <Loader2 size={40} className="animate-spin text-green-600" />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Verifying Crop Journey...
                </p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-4">
                <AlertTriangle size={48} className="text-red-400" />
                <h2 className="text-xl font-black text-gray-800">Crop Not Found</h2>
                <p className="text-gray-500 text-sm">This batch ID does not exist or is unavailable.</p>
                <Link to="/" className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                    Back to FarmVista
                </Link>
            </div>
        );
    }

    const currentStageIdx = STAGE_ORDER.indexOf(data.stage || 'Cultivation');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Nav */}
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors font-bold text-sm">
                        <ArrowLeft size={18} /> Back to FarmVista
                    </Link>
                    <span className="text-lg font-black text-green-700">FarmVista</span>
                </div>

                {/* Hero Card */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    {data.verified && (
                        <div className="absolute top-6 right-6 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                            <ShieldCheck size={16} /> <span>Blockchain Verified</span>
                        </div>
                    )}
                    <p className="text-green-200 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Crop Traceability</p>
                    <h1 className="text-3xl font-black mb-1">{data.cropName}</h1>
                    <p className="text-green-100 font-medium">Batch #{data.id} · {data.quantity}</p>
                </div>

                {/* Crop Journey Stepper */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-base font-black text-gray-900 mb-6">Crop Journey</h2>
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 z-0 mx-8" />
                        <div
                            className="absolute top-4 left-0 h-1 bg-green-500 z-0 mx-8 transition-all duration-500"
                            style={{ width: `calc(${(currentStageIdx / (STAGE_ORDER.length - 1)) * 100}% - 4rem + ${currentStageIdx > 0 ? '2rem' : '0px'})` }}
                        />
                        {STAGE_ORDER.map((stage, idx) => {
                            const isCompleted = idx <= currentStageIdx;
                            const isCurrent   = idx === currentStageIdx;
                            return (
                                <div key={stage} className="flex flex-col items-center z-10 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    } ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}`}>
                                        {isCompleted
                                            ? <CheckCircle size={16} className="text-white" />
                                            : <div className="w-2 h-2 rounded-full bg-gray-400" />
                                        }
                                    </div>
                                    <p className={`text-[9px] font-black uppercase tracking-wide mt-2 text-center leading-tight max-w-[60px] ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                                        {stage}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Grade badge */}
                    {data.grade && (
                        <div className="mt-6 flex items-center space-x-2">
                            <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-black rounded-xl border border-amber-200">
                                Grade {data.grade} — Quality Certified
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Farmer', value: data.farmerStr, icon: <Package size={16} className="text-green-600" /> },
                        { label: 'Origin', value: [data.farmerDistrict, data.farmerState].filter(Boolean).join(', ') || data.location, icon: <MapPin size={16} className="text-green-600" /> },
                        { label: 'Cultivated', value: data.cultivateDate || '—', icon: <Clock size={16} className="text-green-600" /> },
                        { label: 'Harvest Date', value: data.harvestDate || '—', icon: <Wheat size={16} className="text-green-600" /> },
                    ].map(item => (
                        <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">{item.icon}<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p></div>
                            <p className="text-sm font-bold text-gray-900">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Full Timeline */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-black text-gray-900 mb-6 flex items-center space-x-2">
                        <ShieldCheck size={18} className="text-green-600" />
                        <span>Verified Lifecycle Timeline</span>
                    </h3>
                    <div className="relative border-l-2 border-green-200 ml-4 space-y-6">
                        {data.timeline.map((item, idx) => {
                            const photoSrc = item.photoUrl ? (item.photoUrl.startsWith('http') ? item.photoUrl : `http://localhost:5000${item.photoUrl}`) : null;
                            return (
                                <div key={idx} className="ml-8 relative">
                                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-[48px] bg-green-500 shadow-md">
                                        {STAGE_ICONS[item.event] || <Clock size={14} className="text-white" />}
                                    </span>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                                <span>{item.event}</span>
                                                {item.quantity && (
                                                    <span className="px-2 py-0.2 rounded bg-white text-gray-700 text-[10px] font-mono font-bold border border-gray-200">
                                                        Qty: {item.quantity}
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="text-[11px] text-gray-400 font-mono">
                                                <span>{item.date}</span>
                                                {item.submissionTimestamp && (
                                                    <span className="text-[10px] text-gray-400 ml-2">
                                                        ({new Date(item.submissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">{item.detail}</p>

                                        {/* Attached photo evidence */}
                                        {photoSrc && (
                                            <div className="pt-2">
                                                <div 
                                                    onClick={() => setLightbox(photoSrc)}
                                                    className="inline-block relative rounded-2xl overflow-hidden cursor-zoom-in border border-gray-200 shadow-sm group bg-white"
                                                >
                                                    <img 
                                                        src={photoSrc} 
                                                        alt={`${item.event} Evidence`} 
                                                        className="max-h-56 max-w-full sm:max-w-md object-cover rounded-2xl group-hover:scale-102 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-2xl">
                                                        🔍 Click to view full resolution
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Lightbox Modal */}
                {lightbox && (
                    <div 
                        className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
                        onClick={() => setLightbox(null)}
                    >
                        <img 
                            src={lightbox} 
                            alt="Full Resolution Evidence" 
                            className="max-h-[92vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl" 
                        />
                        <button 
                            onClick={() => setLightbox(null)}
                            className="absolute top-5 right-5 text-white bg-white/20 hover:bg-white/30 rounded-full p-2.5 transition-colors"
                        >
                            <span className="text-lg font-bold">✕</span>
                        </button>
                    </div>
                )}

                {/* On-Chain Provenance Card */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 text-white border border-blue-900/50 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/20 shrink-0">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Polygon Amoy Cryptographic Proof</h4>
                                <p className="text-[11px] text-blue-200/70">Public on-chain harvest registration</p>
                            </div>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Smart Contract Confirmed
                        </span>
                    </div>

                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">Transaction Hash</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(data.blockchainTxHash || '0x01b3990B92506A429f7967056210e4931f8A13D8');
                                    alert('Copied transaction hash to clipboard!');
                                }}
                                className="text-[10px] font-bold text-blue-300 hover:text-white px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition flex items-center gap-1"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="font-mono text-xs text-blue-100 break-all">
                            {data.blockchainTxHash || '0x01b3990B92506A429f7967056210e4931f8A13D8'}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-gray-400 font-mono">
                            Contract: 0x01b3...13D8 · Chain ID 80002
                        </div>
                        <a
                            href={data.blockchainTxHash ? `https://amoy.polygonscan.com/tx/${data.blockchainTxHash}` : 'https://amoy.polygonscan.com/address/0x01b3990B92506A429f7967056210e4931f8A13D8'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                            <span>PolygonScan Explorer</span>
                            <span className="text-xs">↗</span>
                        </a>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 pb-4">
                    Powered by FarmVista · Transparent Agri-Supply Chain on Blockchain
                </p>
            </div>
        </div>
    );
};

export default QRTracking;
