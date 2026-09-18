import React, { useState, useEffect, useRef } from 'react';
import { Menu, Globe, Wallet, User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';

const Navbar = ({ toggleSidebar }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const syncUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                } catch (e) {
                    console.error("Invalid user data in local storage");
                }
            }
        };

        syncUser();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener('profile-update', syncUser);
        document.addEventListener('mousedown', handleClickOutside);
        
        // Also fetch latest from API quietly in background once
        apiClient.get('/auth/me')
            .then(res => {
                if (res.data && res.data.avatar) { // Added res.data.avatar check
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
            })
            .catch(err => console.log("Background check failed", err));

        return () => {
            window.removeEventListener('profile-update', syncUser);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success(t('auth.logoutSuccess', 'Logged out successfully'));
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem("language", newLang);
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        if (avatar.startsWith('/')) {
            return `http://localhost:5000${avatar}?t=${new Date().getTime()}`;
        }
        return null;
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 md:ml-64 flex items-center justify-between px-4 md:px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-primary-green md:hidden">FarmVista</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">
                    <Globe size={18} />
                    <button onClick={() => { i18n.changeLanguage('en'); localStorage.setItem("language", "en"); }} className={`hover:text-primary-green transition-colors ${i18n.language === 'en' ? 'text-primary-green' : ''}`}>EN</button>
                    <span className="text-gray-300 mx-1">|</span>
                    <button onClick={() => { i18n.changeLanguage('ta'); localStorage.setItem("language", "ta"); }} className={`hover:text-primary-green transition-colors ${i18n.language === 'ta' ? 'text-primary-green' : ''}`}>தமிழ்</button>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-sm transition-colors border border-blue-100 shadow-sm ml-2">
                    <Wallet size={18} /> <span className="hidden sm:inline">{t('common.connectWallet', 'Connect Wallet')}</span>
                </button>

                <div className="relative ml-2" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 cursor-pointer group focus:outline-none"
                    >
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-primary-green border border-green-100 group-hover:bg-green-100 transition-colors overflow-hidden">
                            {getAvatarUrl(user?.avatar) ? (
                                <img 
                                    key={user?.avatar}
                                    src={getAvatarUrl(user?.avatar)} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                                />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div className="hidden md:flex items-center gap-1 group-hover:text-green-800 transition-colors ml-1">
                            <span className="text-sm font-bold text-gray-700">{user?.name || 'User'}</span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    {/* Dropdown Menu Rest remains same... */}

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('nav.account', 'Account')}</p>
                            </div>
                            
                            <Link 
                                to={user?.role === 'retailer' ? "/retailer/profile" : "/farmer/profile"} 
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors mx-2 rounded-xl"
                            >
                                <User size={18} className="text-gray-400 group-hover:text-green-600" />
                                {t('nav.profile', 'My Profile')}
                            </Link>
                            
                            <Link 
                                to={user?.role === 'retailer' ? "/retailer/settings" : "/farmer/settings"} 
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors mx-2 rounded-xl"
                            >
                                <SettingsIcon size={18} className="text-gray-400" />
                                {t('nav.settings', 'Settings')}
                            </Link>

                            <div className="my-1 border-t border-gray-50 mx-2"></div>

                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-1 mx-2 rounded-xl group"
                            >
                                <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                                {t('nav.logout', 'Logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
