import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, Package, ShoppingCart, MessageSquare, AlertTriangle, Bot, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Home', path: '/farmer/dashboard', icon: <Home size={20} /> },
        { name: 'Post Crop', path: '/farmer/post-crop', icon: <PlusSquare size={20} /> },
        { name: 'My Batches', path: '/farmer/batches', icon: <Package size={20} /> },
        { name: 'Marketplace', path: '/retailer/marketplace', icon: <ShoppingCart size={20} /> },
        { name: 'Farm Feed', path: '/farmer/feed', icon: <MessageSquare size={20} /> },
        { name: 'Climate Alerts', path: '/farmer/alerts', icon: <AlertTriangle size={20} /> },
        { name: 'Assistant', path: '/farmer/assistant', icon: <Bot size={20} /> },
        { name: 'Settings', path: '/farmer/settings', icon: <Settings size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
                    <h1 className="text-2xl font-bold text-green-600">FarmVista</h1>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`
                            }
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
