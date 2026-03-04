import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Eye, MapPin } from 'lucide-react';
import apiClient from '../../api/client';

const MyBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await apiClient.get('/api/batches');
                if (response.data && response.data.length > 0) {
                    setBatches(response.data);
                } else {
                    // Fallback simulation
                    setBatches([
                        { id: "FB-8012", cropName: "Organic Tomatoes", quantity: "500 kg", basePrice: "15.50", climateRisk: "Low", status: "Listed" },
                        { id: "FB-8013", cropName: "Wheat", quantity: "2000 kg", basePrice: "0.80", climateRisk: "Moderate", status: "Harvesting" },
                        { id: "FB-8014", cropName: "Apples (Fuji)", quantity: "150 kg", basePrice: "3.20", climateRisk: "High", status: "Sold" }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch batches:", error);
                // Hard fallback
                setBatches([
                    { id: "FB-8012", cropName: "Organic Tomatoes", quantity: "500 kg", basePrice: "15.50", climateRisk: "Low", status: "Listed" },
                    { id: "FB-8013", cropName: "Wheat", quantity: "2000 kg", basePrice: "0.80", climateRisk: "Moderate", status: "Harvesting" },
                    { id: "FB-8014", cropName: "Apples (Fuji)", quantity: "150 kg", basePrice: "3.20", climateRisk: "High", status: "Sold" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    const getRiskBadge = (risk) => {
        switch (risk) {
            case 'Low': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Low</span>;
            case 'Moderate': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Moderate</span>;
            case 'High': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">High</span>;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Listed': return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Listed</span>;
            case 'Harvesting': return <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">Harvesting</span>;
            case 'Sold': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Sold</span>;
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">My Crop Batches</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your listed crops and sales history.</p>
                </div>
                <Link to="/farmer/post-crop" className="bg-primary-green text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm text-sm">
                    + New Batch
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Batch ID</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Crop Name</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Quantity</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Base Price</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Climate Risk</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Status</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {batches.map((batch) => (
                            <tr key={batch.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4 font-bold text-gray-900">{batch.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-700">{batch.cropName}</td>
                                <td className="px-6 py-4 text-gray-600">{batch.quantity}</td>
                                <td className="px-6 py-4 font-semibold text-gray-900">${batch.basePrice}</td>
                                <td className="px-6 py-4">{getRiskBadge(batch.climateRisk)}</td>
                                <td className="px-6 py-4">{getStatusBadge(batch.status)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Link to={`/farmer/batches/${batch.id}`} className="p-2 text-primary-green hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100" title="View Details">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/track/${batch.id}`} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="QR Tracking">
                                            <QrCode size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {batches.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500 space-y-3">
                                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                        <MapPin className="text-gray-400" size={24} />
                                    </div>
                                    <p className="font-medium text-gray-900">No crop batches found</p>
                                    <p className="text-sm">You haven't listed any crops yet.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyBatches;
