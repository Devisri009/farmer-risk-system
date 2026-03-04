import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ClimateCard from '../../components/dashboard/ClimateCard';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';

const BatchDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [batch, setBatch] = useState(null);

    useEffect(() => {
        const fetchBatchData = async () => {
            try {
                const [batchRes, climateRes, historyRes] = await Promise.all([
                    apiClient.get(`/api/batches/${id}`).catch(() => null),
                    apiClient.get(`/api/climate-risk/${id}`).catch(() => null),
                    apiClient.get(`/api/blockchain/history/${id}`).catch(() => null)
                ]);

                // Fallbacks if backend doesn't exist
                const defaultBatch = {
                    id: id,
                    cropName: "Organic Tomatoes",
                    quantity: "500 kg",
                    basePrice: "15.50",
                    location: "Green Valley Farm",
                    harvestDate: "2026-04-15",
                    status: "Listed"
                };

                const defaultClimate = {
                    temp: 34, rainProb: 60, humidity: 80, riskLevel: 'Moderate'
                };

                const defaultTimeline = [
                    { date: "2026-03-01", event: "Batch Created", detail: "Farmer listed the crop" },
                    { date: "2026-03-02", event: "Climate Analysis", detail: "Risk assessed as Moderate" },
                    { date: "Pending", event: "Smart Contract Locked", detail: "Waiting for buyer" }
                ];

                setBatch({
                    ...defaultBatch,
                    ...batchRes?.data,
                    climate: climateRes?.data || defaultClimate,
                    timeline: historyRes?.data || defaultTimeline,
                    assistantSuggestions: [
                        "Harvest earlier by 3 days due to expected heavy rain next week.",
                        "Current market price is $16.00/kg. Consider adjusting your base price."
                    ]
                });
            } catch (error) {
                console.error("Failed to load batch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBatchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link to="/farmer/batches" className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-primary-green hover:border-primary-green transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Batch {batch?.id}</h2>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> {batch?.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Crop Information</h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Crop Name</div>
                                <div className="font-bold text-gray-900 text-lg">{batch?.cropName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Quantity</div>
                                <div className="font-bold text-gray-900 text-lg">{batch?.quantity}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Base Price / Unit</div>
                                <div className="font-bold text-primary-green text-lg">${batch?.basePrice}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 font-semibold mb-1">Harvest Date</div>
                                <div className="font-bold text-gray-900 text-lg">{batch?.harvestDate}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-sm text-gray-500 font-semibold mb-1">Location</div>
                                <div className="font-bold text-gray-900 text-lg">{batch?.location}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Actionable AI Suggestions</h3>
                        <div className="space-y-4">
                            {batch?.assistantSuggestions.map((sug, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="mt-1">
                                        <CheckCircle className="text-primary-green" size={20} />
                                    </div>
                                    <p className="text-gray-800 leading-relaxed">{sug}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <ClimateCard data={batch?.climate} />

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Ownership Timeline</h3>
                        <div className="relative border-l border-gray-200 ml-4 space-y-6">
                            {batch?.timeline.map((item, idx) => (
                                <div key={idx} className="mb-6 ml-6 relative">
                                    <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-[40px] ring-4 ring-white ${item.date === 'Pending' ? 'bg-gray-100 text-gray-400' : 'bg-primary-green text-white'}`}>
                                        <Clock size={16} />
                                    </span>
                                    <h3 className="mb-1 text-md font-bold text-gray-900">{item.event}</h3>
                                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">{item.date}</time>
                                    <p className="text-sm font-normal text-gray-600">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchDetails;
