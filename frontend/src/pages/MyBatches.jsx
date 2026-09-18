import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BatchCard from '../components/BatchCard';
import BatchDetailsOverlay from '../components/BatchDetailsOverlay';
import AddCropUpdateModal from '../components/AddCropUpdateModal';
import { getFarmerBatches } from '../api/cropApi';

const FALLBACK_BATCHES = [
    {
        id: '101',
        crop: 'Rice',
        cropName: 'Rice',
        quantity: '1000 kg',
        price: '20',
        pricePerKg: '20',
        totalAmount: '₹20,000',
        risk: 'Low',
        riskLevel: 'Low',
        status: 'PLANTED',
        stage: 'Cultivation',
        location: 'Madurai, Tamil Nadu',
        cultivateDate: '2025-01-10',
        harvestDate: '2025-06-15',
        farmerName: 'Logesh P',
    },
    {
        id: '102',
        crop: 'Corn',
        cropName: 'Corn',
        quantity: '500 kg',
        price: '15',
        pricePerKg: '15',
        totalAmount: '₹7,500',
        risk: 'Moderate',
        riskLevel: 'Moderate',
        status: 'GROWING',
        stage: 'Growth',
        location: 'Salem, Tamil Nadu',
        cultivateDate: '2025-02-01',
        harvestDate: '2025-06-20',
        farmerName: 'Logesh P',
    },
    {
        id: '103',
        crop: 'Tomato',
        cropName: 'Tomato',
        quantity: '2000 kg',
        price: '40',
        pricePerKg: '40',
        totalAmount: '₹80,000',
        risk: 'High',
        riskLevel: 'High',
        status: 'HARVESTED',
        stage: 'Harvest',
        location: 'Coimbatore, Tamil Nadu',
        cultivateDate: '2024-11-05',
        harvestDate: '2025-03-01',
        farmerName: 'Logesh P',
    },
];

const MyBatches = () => {
    const { t } = useTranslation();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Modal states
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [updatingBatch, setUpdatingBatch] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const navigate = useNavigate();

    const fetchBatches = async () => {
        try {
            const res = await getFarmerBatches();
            setBatches(res.data);
        } catch (err) {
            console.error(err);
            setBatches(FALLBACK_BATCHES);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleOpenDetails = (batch) => {
        setSelectedBatchId(batch.id);
        setIsDetailsOpen(true);
    };

    const handleOpenAddUpdate = (batch) => {
        setUpdatingBatch(batch);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSuccess = (newEvent) => {
        // Refetch all batches so card stage & status update immediately
        fetchBatches();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">{t('myBatches.title')}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {t('myBatches.countFound', { count: batches.length })}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/farmer/post-crop')}
                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-900/10"
                >
                    <PlusCircle size={17} />
                    <span>{t('myBatches.newBatchBtn')}</span>
                </button>
            </div>

            {/* Offline warning */}
            {error && (
                <div className="flex items-center space-x-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{t('myBatches.demoDataWarning')}</span>
                </div>
            )}

            {/* Responsive Card Grid (No horizontal scrolling) */}
            {batches.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-xs">
                    <p className="text-4xl mb-3">🌾</p>
                    <p className="font-bold text-gray-700 text-base">{t('myBatches.noBatchesFound')}</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">{t('myBatches.noBatchesDesc')}</p>
                    <button
                        onClick={() => navigate('/farmer/post-crop')}
                        className="mt-5 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-sm"
                    >
                        {t('myBatches.postCropBtn')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {batches.map((batch) => (
                        <BatchCard
                            key={batch.id}
                            batch={batch}
                            onOpenDetails={handleOpenDetails}
                            onAddUpdate={handleOpenAddUpdate}
                        />
                    ))}
                </div>
            )}

            {/* Batch Details Overlay / Modal */}
            <BatchDetailsOverlay
                batchId={selectedBatchId}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onAddUpdateClick={(batch) => {
                    handleOpenAddUpdate(batch);
                }}
            />

            {/* Add Crop Update Modal */}
            <AddCropUpdateModal
                batch={updatingBatch}
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default MyBatches;

