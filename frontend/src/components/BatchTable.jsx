import React from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const BatchTable = ({ batches }) => {
    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50';
            case 'moderate': return 'text-yellow-600 bg-yellow-50';
            case 'high': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="overflow-x-auto -mx-6 md:mx-0">
            <div className="inline-block min-w-full align-middle p-6 md:p-0">
                <table className="min-w-full divide-y divide-gray-200 border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Batch ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Crop</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Risk</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {batches.map((batch) => (
                            <tr key={batch.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{batch.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{batch.crop}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{batch.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{batch.price}/kg</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRiskColor(batch.risk)}`}>
                                        {batch.risk}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${batch.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <span className="text-sm font-medium text-gray-700">{batch.status}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <Link
                                        to={`/farmer/batches/${batch.id}`}
                                        className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg inline-flex items-center gap-1 transition-all"
                                    >
                                        <Eye size={18} />
                                        <span className="font-bold text-sm">View</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BatchTable;
