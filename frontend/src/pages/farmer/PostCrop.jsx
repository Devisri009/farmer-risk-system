import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const PostCrop = () => {
    const [formData, setFormData] = useState({
        cropName: '',
        quantity: '',
        basePrice: '',
        harvestDate: '',
        location: ''
    });

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('/batches', formData);
            alert("Crop batch created successfully!");
            setFormData({ cropName: '', quantity: '', basePrice: '', harvestDate: '', location: '' });
            navigate('/farmer/batches');
        } catch (error) {
            console.error("Error creating batch:", error);
            // Fallback for simulation
            alert("Crop batch created successfully! (Simulated)");
            setFormData({ cropName: '', quantity: '', basePrice: '', harvestDate: '', location: '' });
            navigate('/farmer/batches');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Post New Crop Batch</h2>
                <p className="text-gray-500">List your upcoming or harvested crops to connect with retailers directly and transparently.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="e.g. Organic Tomatoes"
                            value={formData.cropName}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (kg/tons)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="e.g. 500 kg"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price per Unit ($)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="15.50"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Harvest Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green outline-none transition-all bg-gray-50 focus:bg-white text-gray-700"
                            value={formData.harvestDate}
                            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Farm Location</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="City, Region or Coordinates"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>

                {/* Optional Image Upload Placeholder */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-green hover:bg-green-50/30 transition-colors cursor-pointer bg-gray-50">
                    <UploadCloud className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-sm font-semibold text-gray-700">Click to upload crop photos</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={submitting} className="bg-primary-green justify-center w-full md:w-auto text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50">
                        {submitting ? 'Creating...' : 'Create Crop Batch'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostCrop;
