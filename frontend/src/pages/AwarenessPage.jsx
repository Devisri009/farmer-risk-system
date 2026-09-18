import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, BookOpen, Landmark, Globe, SlidersHorizontal, Sparkles, Star } from 'lucide-react';
import schemes from '../data/schemes';
import SchemeCard from '../components/awareness/SchemeCard';
import client from '../api/client';

// ─── Scheme Personalisation ────────────────────────────────────────────────────
// Scores each scheme based on farmer's crops & profile. Higher = more relevant.
function scoreScheme(scheme, cropNames, user) {
    let score = 0;
    const nameLower = (scheme.name?.en || '').toLowerCase();
    const descLower = (scheme.description?.en || '').toLowerCase();
    const elLower   = (scheme.eligibility?.en || '').toLowerCase();
    const combined  = nameLower + ' ' + descLower + ' ' + elLower;

    // Crop name match
    cropNames.forEach(crop => {
        if (combined.includes(crop.toLowerCase())) score += 3;
    });

    // State-based match: state schemes are always more relevant
    if (scheme.level === 'state') score += 2;

    // Hidden (lesser-known) schemes get a boost — the farmer likely hasn't seen them
    if (scheme.isHidden) score += 1;

    // Insurance schemes always relevant in agri
    if (scheme.type === 'insurance') score += 1;

    return score;
}

const TYPES   = ['all', 'subsidy', 'insurance', 'loan', 'training', 'marketing'];
const LEVELS  = ['all', 'central', 'state'];

const AwarenessPage = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language === 'ta' ? 'ta' : 'en';

    const [search,      setSearch]      = useState('');
    const [activeType,  setActiveType]  = useState('all');
    const [activeLevel, setActiveLevel] = useState('all');
    const [cropNames,   setCropNames]   = useState([]);
    const [serverPersonalized, setServerPersonalized] = useState(null);

    // Fetch farmer's personalized schemes from backend
    useEffect(() => {
        client.get('/schemes/personalized')
            .then(res => {
                if (res.data?.recommendations) {
                    setServerPersonalized(res.data);
                }
                if (res.data?.farmerCrops) {
                    setCropNames(res.data.farmerCrops);
                }
            })
            .catch(() => {
                // Fallback to batches lookup if personalized endpoint is unavailable
                client.get('/farmer/batches')
                    .then(res => {
                        const names = [...new Set((res.data || []).map(c => c.cropName).filter(Boolean))];
                        setCropNames(names);
                    })
                    .catch(() => {});
            });
    }, []);

    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    }, []);

    // Recommended schemes: scored using server personalized result or client fallback
    const recommended = useMemo(() => {
        if (serverPersonalized?.recommendations?.length > 0) {
            const recMap = new Map(serverPersonalized.recommendations.map(r => [r.schemeId, r]));
            const matched = schemes
                .map(s => {
                    const rec = recMap.get(s.id);
                    return rec ? { ...s, _score: rec.score, matchReason: rec.matchReason } : null;
                })
                .filter(Boolean)
                .sort((a, b) => (b._score || 0) - (a._score || 0))
                .slice(0, 4);

            if (matched.length > 0) return matched;
        }

        // Fallback local scoring
        return schemes
            .map(s => ({ ...s, _score: scoreScheme(s, cropNames, user), matchReason: 'Recommended based on your crop profile' }))
            .filter(s => s._score > 0)
            .sort((a, b) => b._score - a._score)
            .slice(0, 4);
    }, [serverPersonalized, cropNames, user]);

    const filtered = useMemo(() => {
        return schemes.filter(s => {
            const matchType  = activeType  === 'all' || s.type  === activeType;
            const matchLevel = activeLevel === 'all' || s.level === activeLevel;
            const q = search.toLowerCase();
            const matchSearch = !q
                || s.name[lang].toLowerCase().includes(q)
                || s.description[lang].toLowerCase().includes(q)
                || s.benefits[lang].some(b => b.toLowerCase().includes(q));
            return matchType && matchLevel && matchSearch;
        });
    }, [search, activeType, activeLevel, lang]);

    // Labels (bilingual)
    const labels = {
        title:         { en: 'Govt. Scheme Awareness',              ta: 'அரசு திட்ட விழிப்புணர்வு' },
        subtitle:      { en: 'Discover Central & Tamil Nadu agricultural support programs curated for farmers.',
                         ta: 'விவசாயிகளுக்காக தொகுக்கப்பட்ட மத்திய மற்றும் தமிழ்நாடு வேளாண் ஆதரவு திட்டங்களை கண்டறியுங்கள்.' },
        searchPh:      { en: 'Search schemes by name or benefit...', ta: 'பெயர் அல்லது பலன் மூலம் திட்டங்களை தேடவும்...' },
        noResult:      { en: 'No schemes match your search.',        ta: 'உங்கள் தேடலுக்கு எந்த திட்டமும் பொருந்தவில்லை.' },
        all:           { en: 'All',       ta: 'அனைத்தும்' },
        subsidy:       { en: 'Subsidy',   ta: 'மானியம்' },
        insurance:     { en: 'Insurance', ta: 'காப்பீடு' },
        loan:          { en: 'Loan',      ta: 'கடன்' },
        training:      { en: 'Training',  ta: 'பயிற்சி' },
        marketing:     { en: 'Marketing', ta: 'சந்தை' },
        central:       { en: 'Central Govt', ta: 'மத்திய அரசு' },
        state:         { en: 'Tamil Nadu',   ta: 'தமிழ்நாடு' },
        showing:       { en: 'Showing',   ta: 'காட்டுகிறது' },
        schemes:       { en: 'schemes',   ta: 'திட்டங்கள்' },
        filterType:    { en: 'Type',      ta: 'வகை' },
        filterLevel:   { en: 'Level',     ta: 'நிலை' },
    };

    const L = (key) => labels[key]?.[lang] || labels[key]?.en || key;

    const typeChips  = TYPES.map(t => ({ key: t, label: L(t) }));
    const levelChips = LEVELS.map(l => ({ key: l, label: L(l) }));

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {lang === 'ta' ? 'விழிப்புணர்வு' : 'Awareness'}
                        </span>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-gray-400">
                                {schemes.length} {lang === 'ta' ? 'திட்டங்கள் கிடைக்கின்றன' : 'schemes available'}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{L('title')}</h1>
                    <p className="text-gray-500 mt-2 font-medium max-w-xl">{L('subtitle')}</p>
                </div>

                {/* Language quick-toggle */}
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit shrink-0">
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('ta')}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${lang === 'ta' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        தமிழ்
                    </button>
                </div>
            </div>

            {/* ── Stats Banner ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <Landmark size={20} className="text-indigo-500" />, value: schemes.filter(s=>s.level==='central').length, label: lang==='ta' ? 'மத்திய திட்டங்கள்' : 'Central Schemes' },
                    { icon: <Globe     size={20} className="text-orange-500" />, value: schemes.filter(s=>s.level==='state').length,   label: lang==='ta' ? 'மாநில திட்டங்கள்' : 'State Schemes' },
                    { icon: <BookOpen  size={20} className="text-green-500"  />, value: schemes.filter(s=>s.type==='subsidy').length,  label: lang==='ta' ? 'மானிய திட்டங்கள்' : 'Subsidy Schemes' },
                    { icon: <Filter    size={20} className="text-blue-500"   />, value: schemes.filter(s=>s.type==='insurance').length,label: lang==='ta' ? 'காப்பீட்டு திட்டங்கள்' : 'Insurance Schemes' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm">
                        <div className="p-2.5 bg-gray-50 rounded-xl">{stat.icon}</div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search + Filters ────────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-5">
                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={L('searchPh')}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Type filter */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <SlidersHorizontal size={12} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{L('filterType')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {typeChips.map(chip => (
                                <button
                                    key={chip.key}
                                    onClick={() => setActiveType(chip.key)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        activeType === chip.key
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level filter */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Landmark size={12} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{L('filterLevel')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {levelChips.map(chip => (
                                <button
                                    key={chip.key}
                                    onClick={() => setActiveLevel(chip.key)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        activeLevel === chip.key
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Result count */}
                <p className="text-xs font-bold text-gray-400">
                    {L('showing')} <span className="text-gray-900">{filtered.length}</span> {L('schemes')}
                </p>
            </div>

            {/* ── Recommended for You ─────────────────────────────────────── */}
            {recommended.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-amber-500 rounded-lg">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <h2 className="text-lg font-black text-gray-900">
                            {lang === 'ta' ? 'உங்களுக்கு பரிந்துரைக்கப்பட்டவை' : 'Recommended for You'}
                        </h2>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {lang === 'ta' ? 'AI தேர்வு' : 'AI Picked'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {recommended.map(scheme => (
                            <div key={scheme.id} className="relative">
                                <div className="absolute -top-2 -right-2 z-10 flex items-center space-x-1 px-2 py-0.5 bg-amber-400 rounded-full shadow">
                                    <Star size={10} className="text-white" fill="white" />
                                    <span className="text-white text-[9px] font-black uppercase">Match</span>
                                </div>
                                <SchemeCard scheme={scheme} />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">All Schemes</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>
                </div>
            )}

            {/* ── Scheme Cards Grid ────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="text-center py-24">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-bold text-lg">{L('noResult')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(scheme => (
                        <SchemeCard key={scheme.id} scheme={scheme} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AwarenessPage;
