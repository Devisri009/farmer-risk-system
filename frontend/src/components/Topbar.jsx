import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Menu, User, Globe, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';

const Topbar = ({ toggleSidebar }) => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem("language", newLang);
    };

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

        // Background check for latest data
        apiClient.get('/auth/me')
            .then(res => {
                if (res.data) {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                }
            })
            .catch(err => console.log("Background check failed", err));

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener('profile-update', syncUser);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('profile-update', syncUser);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http')) return avatar;
        if (avatar.startsWith('/')) {
            return `http://localhost:5000${avatar}?t=${new Date().getTime()}`;
        }
        return null;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success(t('auth.logoutSuccess', 'Logged out successfully'));
        navigate('/login');
    };

    const getPageTitle = (path) => {
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0 || (segments.length === 1 && segments[0] === 'farmer')) {
            return t('nav.dashboard');
        }
        const lastSegment = segments[segments.length - 1];
        // Try to translate the segment, fallback to formatted string
        const translated = t(`nav.${lastSegment}`);
        if (translated !== `nav.${lastSegment}`) return translated;
        
        return lastSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                    {getPageTitle(location.pathname)}
                </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-sm transition-colors border border-gray-200">
                    <Globe size={18} />
                    <button onClick={() => { i18n.changeLanguage('en'); localStorage.setItem("language", "en"); }} className={`hover:text-primary-green transition-colors ${i18n.language === 'en' ? 'text-primary-green' : ''}`}>EN</button>
                    <span className="text-gray-300 mx-1">|</span>
                    <button onClick={() => { i18n.changeLanguage('ta'); localStorage.setItem("language", "ta"); }} className={`hover:text-primary-green transition-colors ${i18n.language === 'ta' ? 'text-primary-green' : ''}`}>தமிழ்</button>
                </div>
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 pl-4 border-l border-gray-200 cursor-pointer group focus:outline-none"
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

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('nav.account', 'Account')}</p>
                            </div>
                            
                            <Link 
                                to={location.pathname.startsWith('/farmer') ? '/farmer/profile' : '/retailer/profile'} 
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors mx-2 rounded-xl"
                            >
                                <User size={18} className="text-gray-400 group-hover:text-green-600" />
                                {t('nav.profile', 'My Profile')}
                            </Link>
                            
                            <Link 
                                to={location.pathname.startsWith('/farmer') ? '/farmer/settings' : '/retailer/settings'} 
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

export default Topbar;
