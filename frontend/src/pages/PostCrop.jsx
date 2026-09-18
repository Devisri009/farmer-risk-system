import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Calendar, MapPin, Package, DollarSign, Scale, FileText, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { postCrop } from '../api/cropApi';

const MAX_IMAGES = 5;

const EMPTY_FORM = {
    cropName: '',
    quantity: '',
    pricePerKg: '',
    cultivateDate: '',
    harvestDate: '',
    location: '',
    description: '',
};

const FormField = ({ label, required, icon: Icon, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center space-x-1.5">
            {Icon && <Icon size={14} className="text-green-600" />}
            <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
        </label>
        {children}
    </div>
);

const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-800 placeholder-gray-400";

const PostCrop = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [images, setImages] = useState([]);   // File objects
    const [previews, setPreviews] = useState([]);   // data-URL strings
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    // ── field helper ───────────────────────────────────────────────────────────
    const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

    // ── image helpers ──────────────────────────────────────────────────────────
    const addFiles = (files) => {
        const remaining = MAX_IMAGES - images.length;
        const selected = Array.from(files).slice(0, remaining);
        if (selected.length === 0) return;

        setImages((prev) => [...prev, ...selected]);
        selected.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (idx) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleFileInput = (e) => { addFiles(e.target.files); e.target.value = ''; };

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    // validation
    const isDateOrderValid = () => {
        if (!formData.cultivateDate || !formData.harvestDate) return true;
        return new Date(formData.harvestDate) >= new Date(formData.cultivateDate);
    };

    // ── submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isDateOrderValid()) {
            setError(t('postCrop.dateError'));
            return;
        }
        
        setLoading(true); setStatus(null); setError('');
        
        try {
            // Local Database Sync (The backend will now handle the blockchain registro automatically)
            await postCrop({ 
                ...formData, 
                images
            });

            setStatus('success');
            setFormData(EMPTY_FORM);
            setImages([]); setPreviews([]);
            setTimeout(() => {
                setStatus(null);
            }, 5000);
        } catch (err) {
            console.error(err);
            setError(err.reason || err.message || t('postCrop.submitError'));
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{t('postCrop.title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('postCrop.subtitle')}</p>
            </div>


            {/* Success / Error banner */}
            {status === 'success' && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl text-green-800 shadow-sm space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                            <CheckCircle size={20} className="shrink-0 mt-0.5 text-green-600" />
                            <div>
                                <p className="font-bold">{t('postCrop.successTitle', 'Crop Posted Successfully!')}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{t('postCrop.successDesc', 'Your harvest batch has been stored and is being minted on Polygon Amoy blockchain in the background.')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/farmer/batches')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-100/70 hover:bg-blue-200/70 px-3 py-1.5 rounded-xl transition shrink-0"
                        >
                            <span>My Batches</span>
                            <ShieldCheck size={13} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-green-200/60 text-[11px] font-semibold text-blue-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Automated Smart Contract Mining · Chain ID 80002 · No Wallet or Gas Needed</span>
                    </div>
                </div>
            )}
            {status === 'error' && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Action Failed</p>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">

                {/* ── Row 1: Crop Name + Quantity ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label={t('postCrop.cropName')} required icon={Package}>
                        <input
                            type="text" required placeholder={t('postCrop.cropNamePl')}
                            className={inputClass}
                            value={formData.cropName} onChange={set('cropName')}
                        />
                    </FormField>
                    <FormField label={t('postCrop.quantity')} required icon={Scale}>
                        <input
                            type="text" required placeholder={t('postCrop.quantityPl')}
                            className={inputClass}
                            value={formData.quantity} onChange={set('quantity')}
                        />
                    </FormField>
                </div>

                {/* ── Row 2: Price + Location ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label={t('postCrop.price')} required icon={DollarSign}>
                        <input
                            type="number" required min="0" step="0.01" placeholder={t('postCrop.pricePl')}
                            className={inputClass}
                            value={formData.pricePerKg} onChange={set('pricePerKg')}
                        />
                    </FormField>
                    <FormField label={t('postCrop.location')} required icon={MapPin}>
                        <input
                            type="text" required placeholder={t('postCrop.locationPl')}
                            className={inputClass}
                            value={formData.location} onChange={set('location')}
                        />
                    </FormField>
                </div>

                {/* ── Row 3: Cultivate Date + Harvest Date ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label={t('postCrop.cultivateDate')} required icon={Calendar}>
                        <input
                            type="date" required
                            className={inputClass}
                            value={formData.cultivateDate} onChange={set('cultivateDate')}
                        />
                    </FormField>
                    <FormField label={t('postCrop.harvestDate')} required icon={Calendar}>
                        <input
                            type="date" required
                            min={formData.cultivateDate || undefined}
                            className={`${inputClass} ${!isDateOrderValid() ? 'border-red-400 ring-2 ring-red-300' : ''}`}
                            value={formData.harvestDate} onChange={set('harvestDate')}
                        />
                        {!isDateOrderValid() && (
                            <p className="text-xs text-red-500 mt-1">{t('postCrop.mustBeAfterDesc')}</p>
                        )}
                    </FormField>
                </div>

                {/* ── Description ── */}
                <FormField label={t('postCrop.description')} icon={FileText}>
                    <textarea
                        rows={3} placeholder={t('postCrop.descriptionPl')}
                        className={`${inputClass} resize-none`}
                        value={formData.description} onChange={set('description')}
                    />
                </FormField>

                {/* ── Image Upload ── */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center space-x-1.5">
                        <ImageIcon size={14} className="text-green-600" />
                        <span>{t('postCrop.photos')} <span className="font-normal text-gray-400">{t('postCrop.upTo').replace('{max}', MAX_IMAGES)}</span></span>
                    </label>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragOver ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
                            }`}
                        onClick={() => images.length < MAX_IMAGES && fileRef.current?.click()}
                    >
                        <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-green-500' : 'text-gray-400'}`} />
                        <p className="text-sm font-semibold text-gray-600">
                            {images.length < MAX_IMAGES
                                ? t('postCrop.clickDrag')
                                : t('postCrop.maxImagesReached').replace('{max}', MAX_IMAGES)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{t('postCrop.imgFormats')}</p>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileInput}
                        />
                    </div>

                    {/* Image previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                            {previews.map((src, i) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full transition-all hover:bg-red-600 shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 text-white rounded px-1 font-mono">
                                        {i + 1}
                                    </span>
                                </div>
                            ))}
                            {images.length < MAX_IMAGES && (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center text-gray-400 hover:text-green-600"
                                >
                                    <Upload size={20} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Submit ── */}
                <button
                    type="submit"
                    disabled={loading || !isDateOrderValid()}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base transition-all shadow-md shadow-green-900/15 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <><Loader2 size={20} className="animate-spin" /><span>{t('postCrop.processing')}</span></>
                    ) : (
                        <span>{t('postCrop.submitBtn')}</span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default PostCrop;
