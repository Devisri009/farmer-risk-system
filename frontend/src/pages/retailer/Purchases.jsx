import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Eye, CheckCircle } from 'lucide-react';

const Purchases = () => {
    const [purchases] = useState([
        {
            id: "FB-7098",
            cropName: "Organic Carrots",
            farmer: "Valley Produce",
            quantity: "200 kg",
            totalPaid: "412.50",
            date: "2026-02-15",
            status: "Delivered",
            txHash: "0x8f...3a1c"
        },
        {
            id: "FB-7512",
            cropName: "Almonds",
            farmer: "Nutty Farms",
            quantity: "50 kg",
            totalPaid: "550.00",
            date: "2026-03-01",
            status: "In Transit",
            txHash: "0x3b...9f22"
        }
    ]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">My Purchases</h2>
                <p className="text-sm text-gray-500 mt-1">Track your bought crops and view blockchain receipts.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Batch ID</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Crop / Details</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Total Paid</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Date</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100">Status</th>
                            <th className="px-6 py-4 font-semibold border-b border-gray-100 text-right">Receipt / Tracking</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4 font-bold text-gray-900">{purchase.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{purchase.cropName} • {purchase.quantity}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><CheckCircle size={12} className="text-primary-green" /> {purchase.farmer}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-primary-green">${purchase.totalPaid}</td>
                                <td className="px-6 py-4 text-gray-600">{purchase.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${purchase.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {purchase.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-gray-400 font-mono px-2 py-1 bg-gray-100 rounded border border-gray-200 mr-2" title="Polygon Tx Hash">
                                            {purchase.txHash}
                                        </span>
                                        <Link to={`/track/${purchase.id}`} className="p-2 text-primary-green hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100" title="QR Tracking">
                                            <QrCode size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Purchases;
