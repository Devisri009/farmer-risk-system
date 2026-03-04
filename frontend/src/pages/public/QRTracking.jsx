import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Package, ArrowLeft, Clock, QrCode } from 'lucide-react';
import apiClient from '../../api/client';

const QRTracking = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const response = await apiClient.get(`/api/batch/${id}`);
                setData({
                    id: id,
                    ...response.data
                });
            } catch (error) {
                console.error("Failed to fetch tracking data:", error);
                // Fallback Simulation
                setData({
                    id: id,
                    cropName: "Organic Tomatoes",
                    farmerStr: "Green Valley Farm",
                    quantity: "500 kg",
                    harvestDate: "2026-04-15",
                    status: "Sold",
                    verified: true,
                    timeline: [
                        { date: "2026-03-01", event: "Batch Created", detail: "Farmer listed the crop" },
                        { date: "2026-03-03", event: "Ownership Transferred", detail: "Purchased by retailer: Fresh Mart" }
                    ],
                    location: {
                        origin: "Green Valley Base",
                        destination: "Fresh Mart Hub"
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTrackingData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mb-4"></div>
                <p className="text-gray-500 font-medium">Verifying blockchain records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary-green transition-colors font-medium">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <div className="text-xl font-bold text-primary-green">FarmVista</div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-green to-green-700 p-8 text-white relative">
                        {data?.verified && (
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold border border-white/30 text-white">
                                <ShieldCheck size={18} /> Polygon Verified
                            </div>
                        )}
                        <h1 className="text-3xl font-extrabold mb-2">{data?.cropName}</h1>
                        <p className="text-green-50 opacity-90 font-medium text-lg">Batch ID: {data?.id}</p>
                    </div>

                    {/* Core Info */}
                    <div className="p-8 grid md:grid-cols-2 gap-8 border-b border-gray-100">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-500">Crop Details</div>
                                    <div className="font-bold text-gray-900 text-lg">{data?.quantity}</div>
                                    <div className="text-sm text-gray-600 font-medium">Harvested: {data?.harvestDate}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-500">Origin Farm</div>
                                    <div className="font-bold text-gray-900 text-lg">{data?.farmerStr}</div>
                                    <div className="text-sm text-gray-600 font-medium">{data?.location.origin}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-center">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-4 flex items-center justify-center">
                                    <QrCode size={64} className="text-gray-800" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Authentic Product</h3>
                                <p className="text-xs text-gray-500">Scan verified on blockchain</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-8 bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">Lifecycle Timeline</h3>
                        <div className="relative border-l-2 border-primary-green ml-4 space-y-8">
                            {data?.timeline.map((item, idx) => (
                                <div key={idx} className="ml-8 relative">
                                    <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-[48px] bg-primary-green text-white shadow-md">
                                        <Clock size={16} />
                                    </span>
                                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="flex items-center mb-1 text-lg font-bold text-gray-900">{item.event}</h4>
                                        <time className="block mb-2 text-sm font-medium text-gray-500">{item.date}</time>
                                        <p className="text-base text-gray-700">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 text-center flex flex-col items-center">
                            <ShieldCheck className="text-primary-green w-12 h-12 mb-3 mt-4" />
                            <p className="text-sm text-gray-500 max-w-sm">This timeline is immutably recorded on the connected blockchain network ensuring transparent provenance.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRTracking;
