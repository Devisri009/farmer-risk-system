import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';

const Marketplace = () => {
    const [loading, setLoading] = useState(true);
    const [crops, setCrops] = useState([]);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await apiClient.get('/api/marketplace');
                if (response.data && response.data.length > 0) {
                    setCrops(response.data);
                } else {
                    // Fallback
                    setCrops([
                        { id: "FB-8012", cropName: "Organic Tomatoes", quantity: "500 kg", price: "15.50", location: "Green Valley Farm", riskLevel: "Low", verified: true },
                        { id: "FB-8015", cropName: "Premium Basmati Rice", quantity: "5000 kg", price: "2.10", location: "Sunrise Agriculture", riskLevel: "Moderate", verified: true },
                        { id: "FB-8016", cropName: "Red Onions", quantity: "1200 kg", price: "0.95", location: "Hillside Farms", riskLevel: "High", verified: false }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch marketplace crops:", error);
                // Hard Fallback
                setCrops([
                    { id: "FB-8012", cropName: "Organic Tomatoes", quantity: "500 kg", price: "15.50", location: "Green Valley Farm", riskLevel: "Low", verified: true },
                    { id: "FB-8015", cropName: "Premium Basmati Rice", quantity: "5000 kg", price: "2.10", location: "Sunrise Agriculture", riskLevel: "Moderate", verified: true },
                    { id: "FB-8016", cropName: "Red Onions", quantity: "1200 kg", price: "0.95", location: "Hillside Farms", riskLevel: "High", verified: false }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Crop Marketplace</h2>
                    <p className="text-sm text-gray-500 mt-1">Browse and purchase verified crops directly from farmers.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search crops..."
                        className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-green"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                    <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{crop.cropName}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <MapPin size={14} className="mr-1" /> {crop.location}
                                    </div>
                                </div>
                                {crop.verified && (
                                    <span className="bg-blue-50 text-blue-700 p-1.5 rounded-lg flex items-center" title="Blockchain Verified">
                                        <ShieldCheck size={20} />
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-xs text-gray-500 font-semibold mb-1">Quantity</div>
                                    <div className="font-bold text-gray-900">{crop.quantity}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-xs text-gray-500 font-semibold mb-1">Price / Unit</div>
                                    <div className="font-bold text-primary-green">${crop.price}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Climate Risk:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${crop.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                                        crop.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {crop.riskLevel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <Link to={`/retailer/payment/${crop.id}`} className="flex-1 bg-primary-green text-center text-white px-4 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors cursor-pointer block">
                                Buy Now
                            </Link>
                            <Link to={`/track/${crop.id}`} className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors block text-center">
                                Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
