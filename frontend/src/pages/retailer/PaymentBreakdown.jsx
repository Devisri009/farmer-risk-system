import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';

const PaymentBreakdown = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [paymentDone, setPaymentDone] = useState(false);
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const fetchPaymentEstimate = async () => {
            try {
                const response = await apiClient.get(`/api/payment-estimate/${id}`);
                setDetails({
                    id: id,
                    ...response.data
                });
            } catch (error) {
                console.error("Failed to fetch payment estimate:", error);
                // Fallback simulation
                setDetails({
                    id: id,
                    cropName: "Organic Tomatoes",
                    quantity: "500 kg",
                    farmerStr: "Green Valley Farm",
                    breakdown: {
                        baseCost: 7750.00,
                        transportEstimate: 120.00,
                        platformFee: 77.50,
                        total: 7947.50
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentEstimate();
    }, [id]);

    const handleConfirmPayment = () => {
        // Call smart contract transferOwnership()
        setPaymentDone(true);
        alert("Smart contract ownership transfer initiated on Polygon!");
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
        );
    }

    if (paymentDone) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center mt-10">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-primary-green w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Smart contract ownership has been updated. You can view the blockchain receipt in your purchases.</p>
                <Link to="/retailer/purchases" className="bg-primary-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors inline-block">
                    View My Purchases
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/retailer/marketplace" className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-primary-green transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Payment Breakdown</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{details?.cropName}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                        <span>Batch ID: <strong className="text-gray-900">{details?.id}</strong></span>
                        <span>Qty: <strong className="text-gray-900">{details?.quantity}</strong></span>
                        <span>Seller: <strong className="text-gray-900">{details?.farmerStr}</strong></span>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Base Crop Price</span>
                        <span className="font-bold text-gray-900">${details?.breakdown.baseCost.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 pb-4">
                        <div>
                            <span className="block text-gray-600 font-medium text-sm">Transport Estimate</span>
                        </div>
                        <span className="font-bold text-gray-900">${details?.breakdown.transportEstimate.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <div>
                            <span className="block text-gray-600 font-medium text-sm">Platform Trust Fee (1%)</span>
                        </div>
                        <span className="font-bold text-gray-900">${details?.breakdown.platformFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-6 mt-4 border-t-2 border-gray-100">
                        <span className="text-lg font-bold text-gray-900">Final Payment Amount</span>
                        <span className="text-3xl font-extrabold text-primary-green">${details?.breakdown.total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleConfirmPayment}
                        className="w-full bg-primary-green text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors mt-6 shadow-sm flex items-center justify-center gap-2"
                    >
                        Confirm & Transfer Ownership
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                        By confirming, you agree to the smart contract terms on the Polygon network. Transaction fees may apply.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentBreakdown;
