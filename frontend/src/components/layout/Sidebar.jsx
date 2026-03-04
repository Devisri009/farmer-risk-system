import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Package, Settings, LogOut, ShoppingCart, MessageSquare, AlertTriangle, Bot } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const isRetailer = location.pathname.includes('/retailer');

    const farmerLinks = [
        { name: 'Home', path: '/farmer/dashboard', icon: <Home size={20} /> },
        { name: 'Post Crop', path: '/farmer/post-crop', icon: <PlusSquare size={20} /> },
        { name: 'My Batches', path: '/farmer/batches', icon: <Package size={20} /> },
        { name: 'Marketplace', path: '/retailer/marketplace', icon: <ShoppingCart size={20} /> },
        { name: 'Farm Feed', path: '/farmer/feed', icon: <MessageSquare size={20} /> },
        { name: 'Climate Alerts', path: '/farmer/alerts', icon: <AlertTriangle size={20} /> },
        { name: 'Assistant', path: '/farmer/assistant', icon: <Bot size={20} /> },
        { name: 'Settings', path: '/farmer/settings', icon: <Settings size={20} /> },
    ];

    const retailerLinks = [
        { name: 'Marketplace', path: '/retailer/marketplace', icon: <ShoppingCart size={20} /> },
        { name: 'My Purchases', path: '/retailer/purchases', icon: <Package size={20} /> },
        { name: 'Settings', path: '/retailer/settings', icon: <Settings size={20} /> },
    ];

    const links = isRetailer ? retailerLinks : farmerLinks;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
                    <h1 className="text-2xl font-bold text-primary-green">FarmVista</h1>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                        Main Menu
                    </div>
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${isActive
                                    ? 'bg-green-50 text-primary-green'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {link.icon}
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <NavLink
                        to="/login"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-alert-red hover:bg-red-50 transition-colors w-full"
                    >
                        <LogOut size={20} />
                        Logout
                    </NavLink>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
