import React from 'react';
import { Menu, Globe, Wallet, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = ({ toggleSidebar }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(newLang);
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
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-600 font-medium text-sm transition-colors border border-transparent hover:border-gray-200"
                    title="Toggle Language (EN/TA)"
                >
                    <Globe size={18} /> <span className="hidden sm:inline">{i18n.language === 'en' ? 'English' : 'தமிழ்'}</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-sm transition-colors border border-blue-100 shadow-sm ml-2">
                    <Wallet size={18} /> <span className="hidden sm:inline">Connect Wallet</span>
                </button>

                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-primary-green border border-green-100 cursor-pointer ml-2 hover:bg-green-100 transition-colors">
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
