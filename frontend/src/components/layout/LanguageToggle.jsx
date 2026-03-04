import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-[#A5D6A7]">
            <button
                onClick={() => toggleLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors duration-200 ${i18n.language === 'en'
                        ? 'bg-green-50 text-[#2E7D32]'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
            >
                <Globe size={14} className={i18n.language === 'en' ? 'text-[#2E7D32]' : 'text-gray-400'} />
                EN
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => toggleLanguage('ta')}
                className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors duration-200 ${i18n.language === 'ta'
                        ? 'bg-green-50 text-[#2E7D32]'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
            >
                <Globe size={14} className={i18n.language === 'ta' ? 'text-[#2E7D32]' : 'text-gray-400'} />
                தமிழ்
            </button>
        </div>
    );
};

export default LanguageToggle;
