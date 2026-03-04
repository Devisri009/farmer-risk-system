import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import BatchTable from '../components/BatchTable';
import { Package, Search, PlusCircle, AlertCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFarmerBatches } from '../api/cropApi';

const MyBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await getFarmerBatches();
                setBatches(res.data);
            } catch (err) {
                console.error("Fetch Batches Error:", err);
                // Fallback for demo
                setBatches([
                    { id: '101', crop: 'Rice', quantity: '1000kg', price: 20, risk: 'Low', status: 'Active' },
                    { id: '102', crop: 'Corn', quantity: '500kg', price: 15, risk: 'Moderate', status: 'Active' },
                    { id: '103', crop: 'Wheat', quantity: '2000kg', price: 30, risk: 'Low', status: 'Sold' },
                    { id: '104', crop: 'Tomato', quantity: '200kg', price: 12, risk: 'High', status: 'Active' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, []);

    const filteredBatches = batches.filter(b =>
        b.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.includes(searchTerm)
    );

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Crop Batches</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage and track your agricultural shipments.</p>
                </div>
                <Link
                    to="/farmer/post-crop"
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-900/10 hover:bg-green-700 transition-all"
                >
                    <PlusCircle size={20} />
                    Post Batch
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4 p-5 border-none bg-green-50">
                    <div className="p-3 bg-green-600 text-white rounded-xl">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-600 uppercase">Total Batches</p>
                        <h4 className="text-xl font-extrabold text-green-900">{batches.length}</h4>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-5 border-none bg-blue-50">
                    <div className="p-3 bg-blue-600 text-white rounded-xl">
                        <CheckCircle size={24} className="LucideCheckCircle" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase">Active Sales</p>
                        <h4 className="text-xl font-extrabold text-blue-900">{batches.filter(b => b.status === 'Active').length}</h4>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-5 border-none bg-orange-50">
                    <div className="p-3 bg-orange-600 text-white rounded-xl">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-600 uppercase">Risk Flagged</p>
                        <h4 className="text-xl font-extrabold text-orange-900">{batches.filter(b => b.risk === 'High').length}</h4>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by crop name or batch ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
                        <Filter size={20} />
                        Filters
                    </button>
                </div>

                {filteredBatches.length > 0 ? (
                    <BatchTable batches={filteredBatches} />
                ) : (
                    <div className="py-20 text-center">
                        <Package className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-lg font-bold text-gray-400">No batches matching your search</h3>
                        <p className="text-gray-400 text-sm mt-1">Try a different keyword or post a new crop.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

const CheckCircle = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default MyBatches;
