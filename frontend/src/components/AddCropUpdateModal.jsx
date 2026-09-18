import React, { useState } from 'react';
import { X, Upload, Calendar, Layers, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addBatchEvent } from '../api/cropApi';

const ACTIVITIES = [
    { value: 'Cultivation Started', label: '🌱 Cultivation Started', stageDesc: 'Sets stage to Cultivation' },
    { value: 'Growth Update', label: '🌿 Growth Update', stageDesc: 'Sets stage to Growth' },
    { value: 'Fertilizer Applied', label: '🧪 Fertilizer Applied', stageDesc: 'Sets stage to Growth' },
    { value: 'Irrigation', label: '💧 Irrigation', stageDesc: 'Sets stage to Growth' },
    { value: 'Pest/Disease Observation', label: '🐛 Pest/Disease Observation', stageDesc: 'Sets stage to Growth' },
    { value: 'Weather Impact', label: '🌦️ Weather Impact', stageDesc: 'Sets stage to Growth' },
    { value: 'Harvest', label: '🌾 Harvest', stageDesc: 'Sets stage to Harvest' },
    { value: 'Quality Check', label: '⭐ Quality Check', stageDesc: 'Sets stage to Quality Grading' },
    { value: 'Marketplace Ready', label: '🛒 Marketplace Ready', stageDesc: 'Sets stage to Marketplace Ready' },
    { value: 'Other', label: '📝 Other Note', stageDesc: 'Preserves current stage' },
];

const AddCropUpdateModal = ({ batch, isOpen, onClose, onSuccess }) => {
    const [activity, setActivity] = useState('Growth Update');
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !batch) return null;

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error('Please add a description for this update');
            return;
        }

        setSubmitting(true);
        try {
            const res = await addBatchEvent(batch.id, {
                activity,
                eventDate,
                description,
                quantity: quantity || undefined,
                photo: photo || undefined
            });
            toast.success('Crop update logged successfully!');
            if (onSuccess) {
                onSuccess(res.data);
            }
            onClose();
        } catch (err) {
            console.error('Failed to log update:', err);
            toast.error('Failed to record crop update. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-emerald-50/30">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                Batch #{batch.id}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                                {batch.cropName || batch.crop}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Add Crop Update</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Logs an immutable chronological event with photo evidence.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    {/* Activity Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                            Activity / Milestone *
                        </label>
                        <select
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        >
                            {ACTIVITIES.map((act) => (
                                <option key={act.value} value={act.value}>
                                    {act.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                            ℹ️ {ACTIVITIES.find(a => a.value === activity)?.stageDesc}
                        </p>
                    </div>

                    {/* Date Picker & Optional Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                <Calendar size={13} className="text-gray-400" />
                                <span>Activity Date *</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                Quantity (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 500 kg, 20 bags"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                            Description & Observations *
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Detail your agricultural activity, crop condition, fertilizers, soil moisture, or harvest notes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Photo / Evidence Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            <ImageIcon size={13} className="text-gray-400" />
                            <span>Photo Evidence (Recommended)</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-green-400 rounded-2xl p-4 text-center transition-colors bg-gray-50/50">
                            {photoPreview ? (
                                <div className="relative inline-block">
                                    <img 
                                        src={photoPreview} 
                                        alt="Upload preview" 
                                        className="max-h-40 rounded-xl object-cover shadow-sm mx-auto" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center">
                                    <Upload size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs font-bold text-green-700">Click to upload photo</span>
                                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 10MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-start space-x-2">
                        <CheckCircle size={15} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-900 leading-relaxed">
                            <strong>Blockchain Transparency:</strong> Your entry date and exact submission timestamp are permanently stamped and shown on the public Crop Traceability page.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-green-900/10"
                        >
                            {submitting && <Loader2 size={14} className="animate-spin" />}
                            <span>{submitting ? 'Saving Event...' : 'Save Crop Update'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCropUpdateModal;
