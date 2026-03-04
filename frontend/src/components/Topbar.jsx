import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
    const location = useLocation();

    // Logic to get page title based on path
    const getPageTitle = (pathname) => {
        const path = pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    };

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Farmer' };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 md:ml-64 flex items-center justify-between px-4 md:px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">{getPageTitle(location.pathname)}</h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all relative">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{user.role || 'Farmer'}</span>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 border border-green-200 cursor-pointer hover:bg-green-200 transition-all shadow-sm">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
