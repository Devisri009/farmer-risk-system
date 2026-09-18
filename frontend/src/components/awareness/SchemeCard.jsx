import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, CheckCircle2, Users, Building2, Sparkles } from 'lucide-react';

const typeColors = {
    subsidy:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100' },
    insurance: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100' },
    loan:      { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    training:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
    marketing: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-100' },
};

const levelColors = {
    central: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    state:   { bg: 'bg-orange-50', text: 'text-orange-700' },
};

const SchemeCard = ({ scheme }) => {
    const { i18n } = useTranslation();
    const lang = i18n.language === 'ta' ? 'ta' : 'en';

    const typePalette  = typeColors[scheme.type]  || typeColors.subsidy;
    const levelPalette = levelColors[scheme.level] || levelColors.central;

    const typeLabel = {
        subsidy:   { en: 'Subsidy',   ta: 'மானியம்' },
        insurance: { en: 'Insurance', ta: 'காப்பீடு' },
        loan:      { en: 'Loan',      ta: 'கடன்' },
        training:  { en: 'Training',  ta: 'பயிற்சி' },
        marketing: { en: 'Marketing', ta: 'சந்தை' },
    }[scheme.type]?.[lang] || scheme.type;

    const levelLabel = scheme.level === 'central'
        ? (lang === 'ta' ? 'மத்திய அரசு' : 'Central Govt')
        : (lang === 'ta' ? 'தமிழ்நாடு அரசு' : 'Tamil Nadu Govt');

    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-7 flex flex-col gap-5 hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-300 group">
            {/* Top badges */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${typePalette.bg} ${typePalette.text}`}>
                        {typeLabel}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${levelPalette.bg} ${levelPalette.text}`}>
                        {levelLabel}
                    </span>
                    {scheme.isHidden && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-700 border border-yellow-200">
                            💎 {lang === 'ta' ? 'மறைந்த திட்டம்' : 'Hidden Gem'}
                        </span>
                    )}
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                    {lang === 'ta' ? 'தற்போது திறந்துள்ளது' : 'Currently Open'}
                </span>
            </div>

            {/* Personalized Match Reason */}
            {scheme.matchReason && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 -mt-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold text-emerald-900 leading-tight">
                        {scheme.matchReason}
                    </span>
                </div>
            )}

            {/* Header */}
            <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                    {scheme.name[lang]}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
                    <Building2 size={11} />
                    {scheme.ministry[lang]}
                </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-3">
                {scheme.description[lang]}
            </p>

            {/* Benefits */}
            <div className="space-y-2">
                {scheme.benefits[lang].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 leading-snug">{benefit}</span>
                    </div>
                ))}
            </div>

            {/* Eligibility */}
            <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {lang === 'ta' ? 'தகுதி' : 'Eligibility'}
                    </span>
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-snug">
                    {scheme.eligibility[lang]}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
                <a
                    href={scheme.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-gray-900/10 active:scale-95"
                >
                    <ExternalLink size={14} />
                    {lang === 'ta' ? 'மேலும் அறியவும்' : 'Learn More'}
                </a>
                <a
                    href={scheme.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white text-xs font-black rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 active:scale-95"
                >
                    {lang === 'ta' ? 'விண்ணப்பிக்கவும்' : 'Apply Now'}
                </a>
            </div>
        </div>
    );
};

export default SchemeCard;
