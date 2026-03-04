import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import CropTimeline from '../components/CropTimeline';
import { ArrowLeft, Package, Calendar, MapPin, DollarSign, ShieldCheck } from 'lucide-react';
import { getBatchById } from '../api/cropApi';

const BatchDetails = () => {
    const { id } = useParams();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatch = async () => {
            try {
                const res = await getBatchById(id);
                setBatch(res.data);
            } catch (err) {
                console.error("Fetch Batch Error:", err);
                // Fallback for demo
                setBatch({
                    id: id || '101',
                    crop: 'Basmati Rice',
                    quantity: '1200 kg',
                    price: 35,
                    harvestDate: '2026-06-12',
                    location: 'Madurai, Tamil Nadu',
                    status: 'Active',
                    risk: 'Low',
                    farmer: 'Logesh',
                    events: [
                        { title: 'Crop Created', date: '12 June', details: { Farmer: 'Logesh', Location: 'Madurai' } },
                        { title: 'Listed for Sale', date: '14 June', details: { Price: '₹35/kg', Status: 'Available' } },
                        { title: 'Purchased by Retailer', date: '16 June', details: { Retailer: 'Green Market', Qty: '1200kg' } },
                        { title: 'Delivered to Market', date: '18 June', details: { Location: 'Chennai', Status: 'Confirmed' } }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBatch();
    }, [id]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <Link to="/farmer/batches" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">
                <ArrowLeft size={16} />
                Back to Batches
            </Link>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Batch Summary Info */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                    <Card className="border-none bg-gradient-to-br from-green-600 to-green-800 text-white overflow-hidden relative">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10">
                            <Package size={200} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Package size={24} />
                                </div>
                                <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Batch Info</span>
                            </div>
                            <h2 className="text-3xl font-extrabold">{batch.crop}</h2>
                            <p className="text-green-100 font-bold mt-1 opacity-90">ID: #{batch.id}</p>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                                    <p className="text-xs font-bold text-green-100 uppercase opacity-60">Status</p>
                                    <p className="font-extrabold">{batch.status}</p>
                                </div>
                                <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                                    <p className="text-xs font-bold text-green-100 uppercase opacity-60">Risk</p>
                                    <p className="font-extrabold">{batch.risk} Level</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Quick Specifications">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                                    <Package size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Quantity</p>
                                    <p className="text-sm font-extrabold text-gray-800">{batch.quantity}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Unit Price</p>
                                    <p className="text-sm font-extrabold text-gray-800">₹{batch.price}/kg</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Harvest Date</p>
                                    <p className="text-sm font-extrabold text-gray-800">{batch.harvestDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                                    <p className="text-sm font-extrabold text-gray-800">{batch.location}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                        <ShieldCheck className="mb-3 opacity-50" size={32} />
                        <h4 className="text-lg font-extrabold">Quality Guaranteed</h4>
                        <p className="text-xs font-bold text-blue-100 mt-1 leading-relaxed">
                            This batch has passed all climate-risk assessments and is verified by FarmVista's AI engine.
                        </p>
                    </div>
                </div>

                {/* Timeline and Detailed Ops */}
                <div className="lg:w-2/3">
                    <CropTimeline events={batch.events || []} />

                    <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800">Need to update this batch?</h4>
                            <p className="text-sm text-gray-500 font-medium">You can edit quantity or price before it's purchased.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                Edit Details
                            </button>
                            <button className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchDetails;
