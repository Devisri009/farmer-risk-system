import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Package, Settings, LogOut, ShoppingCart, MessageSquare, AlertTriangle, Link as LinkIcon, ShieldCheck, Wallet, Loader2, TrendingUp, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Web3Context } from '../../context/Web3Context';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const isConsumer = location.pathname.includes('/consumer') || location.pathname.includes('/retailer');

    const farmerLinks = [
        { name: t('sidebar.home', 'Home'), path: '/farmer/dashboard', icon: <Home size={20} /> },
        { name: t('sidebar.postCrop', 'Post Crop'), path: '/farmer/post-crop', icon: <PlusSquare size={20} /> },
        { name: t('sidebar.myBatches', 'My Batches'), path: '/farmer/batches', icon: <Package size={20} /> },
        { name: t('sidebar.marketplace', 'Marketplace'), path: '/farmer/marketplace', icon: <ShoppingCart size={20} /> },
        { name: t('sidebar.communityFeed', 'Farm Feed'), path: '/farmer/feed', icon: <MessageSquare size={20} /> },
        { name: t('sidebar.climateAlerts', 'Climate Alerts'), path: '/farmer/alerts',     icon: <AlertTriangle size={20} /> },
        { name: t('sidebar.awareness',    'Awareness'),       path: '/farmer/awareness',  icon: <BookOpen size={20} /> },
        { name: t('sidebar.settings', 'Settings'),            path: '/farmer/settings',   icon: <Settings size={20} /> },
    ];

    const consumerLinks = [
        { name: t('sidebar.home', 'Home'), path: '/consumer/dashboard', icon: <Home size={20} /> },
        { name: t('sidebar.marketplace', 'Marketplace'), path: '/consumer/marketplace', icon: <ShoppingCart size={20} /> },
        { name: t('sidebar.buyerDemands', 'Bulk Demands'), path: '/consumer/buyer-demands', icon: <TrendingUp size={20} /> },
        { name: t('sidebar.myPurchases', 'My Purchases'), path: '/consumer/purchases', icon: <Package size={20} /> },
        { name: t('sidebar.marginAnalysis', 'Margin Analysis'), path: '/consumer/margin-analysis', icon: <TrendingUp size={20} /> },
        { name: t('sidebar.settings', 'Settings'), path: '/consumer/settings', icon: <Settings size={20} /> },
    ];

    const links = isConsumer ? consumerLinks : farmerLinks;
    const { account, connectWallet, isRegistered, registerFarmerOnChain } = useContext(Web3Context);
    const [regLoading, setRegLoading] = useState(false);

    const handleRegister = async () => {
        setRegLoading(true);
        try {
            await registerFarmerOnChain();
        } catch (e) {
            alert("Verification failed. Please try again.");
        } finally {
            setRegLoading(false);
        }
    };

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
                        {t('sidebar.mainMenu', 'Main Menu')}
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

                {/* Web3 Status Card */}
                <div className="px-4 mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Wallet size={16} className="text-primary-green" />
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Polygon Amoy</span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                80002
                            </span>
                        </div>
                        
                        {!account ? (
                            <div className="space-y-2">
                                <button 
                                    onClick={connectWallet}
                                    className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    Connect Wallet
                                </button>
                                <a 
                                    href="https://amoy.polygonscan.com/address/0x01b3990B92506A429f7967056210e4931f8A13D8"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-gray-500 hover:text-primary-green block text-center font-mono truncate"
                                    title="View Master Contract on PolygonScan"
                                >
                                    Contract: 0x01b3...13D8 ↗
                                </a>
                            </div>
                        ) : !isRegistered ? (
                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 leading-tight">Wallet connected but not verified on-chain.</p>
                                <button 
                                    onClick={handleRegister}
                                    disabled={regLoading}
                                    className="w-full py-2 bg-primary-green text-white rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-md shadow-green-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {regLoading ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                                    Verify Identity
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary-green">
                                    <ShieldCheck size={18} />
                                    <span className="text-sm font-bold">Verified Farmer</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono truncate">{account}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <NavLink
                        to="/login"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-alert-red hover:bg-red-50 transition-colors w-full"
                    >
                        <LogOut size={20} />
                        {t('sidebar.logout', 'Logout')}
                    </NavLink>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
