import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, List, ShoppingBag, Radio, AlertTriangle, MessageSquare, Settings, LogOut, X, BookOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { label: t('sidebar.home', 'Home'), path: '/farmer/dashboard', icon: Home },
        { label: t('sidebar.postCrop', 'Post Crop'), path: '/farmer/post-crop', icon: PlusCircle },
        { label: t('sidebar.myBatches', 'My Batches'), path: '/farmer/batches', icon: List },
        { label: t('sidebar.marketplace', 'Marketplace'), path: '/farmer/marketplace', icon: ShoppingBag },
        { label: t('sidebar.buyerMatching', 'Direct Buyer Matching'), path: '/farmer/buyer-matching', icon: Users },
        { label: t('sidebar.communityFeed', 'Community Feed'), path: '/farmer/feed', icon: Radio },
        { label: t('sidebar.climateAlerts', 'Climate Alerts'), path: '/farmer/alerts',    icon: AlertTriangle },
        { label: t('sidebar.awareness',    'Awareness'),        path: '/farmer/awareness', icon: BookOpen },
        { label: t('sidebar.settings', 'Settings'),             path: '/farmer/settings',  icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <span className="text-2xl font-extrabold text-green-700">FarmVista</span>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-4rem)]">
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto w-full">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path === '/farmer/dashboard' && location.pathname === '/farmer');
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={() => setIsOpen && toggleSidebar()}
                                    className={`flex w-full items-center px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={20} className="mr-3" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                        >
                            <LogOut size={20} className="mr-3" />
                            {t('sidebar.logout', 'Logout')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
