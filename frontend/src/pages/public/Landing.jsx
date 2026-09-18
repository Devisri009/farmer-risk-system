import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CloudRain, ShieldCheck, Bot, TrendingUp, Languages, Users,
    PlusSquare, BarChart3, ShoppingCart, Link2,
    ChevronDown, Menu, X, Star, Mail, LifeBuoy,
    Sprout, ArrowRight
} from 'lucide-react';

/* ─────────────── smooth-scroll helper ─────────────── */
const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ───────────────────── data ───────────────────────── */
const features = [
    { icon: <CloudRain size={28} />, titleKey: 'feat1Title', descKey: 'feat1Desc' },
    { icon: <ShieldCheck size={28} />, titleKey: 'feat2Title', descKey: 'feat2Desc' },
    { icon: <Bot size={28} />, titleKey: 'feat3Title', descKey: 'feat3Desc' },
    { icon: <TrendingUp size={28} />, titleKey: 'feat4Title', descKey: 'feat4Desc' },
    { icon: <Languages size={28} />, titleKey: 'feat5Title', descKey: 'feat5Desc' },
    { icon: <Users size={28} />, titleKey: 'feat6Title', descKey: 'feat6Desc' },
];

const steps = [
    { icon: <PlusSquare size={30} />, num: '01', textKey: 'step1' },
    { icon: <BarChart3 size={30} />, num: '02', textKey: 'step2' },
    { icon: <ShoppingCart size={30} />, num: '03', textKey: 'step3' },
    { icon: <Link2 size={30} />, num: '04', textKey: 'step4' },
];

const reviews = [
    { name: 'Ravi Kumar', roleKey: 'roleFarmer', textKey: 'review1Text' },
    { name: 'Priya Menon', roleKey: 'roleRetailer', textKey: 'review2Text' },
    { name: 'Manoj Reddy', roleKey: 'roleFarmer', textKey: 'review3Text' },
];

const faqs = [
    { qKey: 'faq1Q', aKey: 'faq1A' },
    { qKey: 'faq2Q', aKey: 'faq2A' },
    { qKey: 'faq3Q', aKey: 'faq3A' },
    { qKey: 'faq4Q', aKey: 'faq4A' },
];

/* ──────────────── useInView hook ──────────────────── */
const useInView = (options = {}) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
            { threshold: 0.15, ...options }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, isInView];
};

/* ──────────── Animated Section Wrapper ────────────── */
const Reveal = ({ children, className = '', delay = 0 }) => {
    const [ref, isInView] = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

/* ═══════════════════ NAVBAR ═══════════════════════ */
const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const navLinks = [
        { label: t('nav.home', 'Home'), id: 'home' },
        { label: t('nav.features', 'Features'), id: 'features' },
        { label: t('nav.howItWorks', 'How It Works'), id: 'howitworks' },
        { label: t('nav.reviews', 'Reviews'), id: 'reviews' },
        { label: t('nav.faq', 'FAQ'), id: 'faq' },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
                {/* Logo */}
                <button className="flex items-center gap-2 group" onClick={() => scrollTo('home')}>
                    <Sprout className="text-[#2E7D32] transition-transform duration-300 group-hover:rotate-12" size={28} />
                    <span className="text-xl font-extrabold text-[#2E7D32]">FarmVista</span>
                </button>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(l => (
                        <button
                            key={l.id}
                            onClick={() => scrollTo(l.id)}
                            className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2E7D32] transition-colors duration-200 group"
                        >
                            {l.label}
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#2E7D32] rounded-full transition-all duration-300 group-hover:w-3/4" />
                        </button>
                    ))}
                </div>

                {/* Left side actions (Language & Auth) */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Language Toggle */}
                    <div className="flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 font-bold text-gray-700 text-sm">
                        <span>🌐</span>
                        <button onClick={() => changeLanguage('en')} className={`hover:text-[#2E7D32] transition-colors ${i18n.language === 'en' ? 'text-[#2E7D32]' : ''}`}>EN</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => changeLanguage('ta')} className={`hover:text-[#2E7D32] transition-colors ${i18n.language === 'ta' ? 'text-[#2E7D32]' : ''}`}>தமிழ்</button>
                    </div>

                    <Link to="/login"
                        className="px-5 py-2 rounded-full border-2 border-[#2E7D32] text-[#2E7D32] font-bold text-sm hover:bg-[#2E7D32] hover:text-white transition-all duration-300">
                        {t('nav.login', 'Login')}
                    </Link>
                    <Link to="/register"
                        className="px-5 py-2 rounded-full bg-[#2E7D32] text-white font-bold text-sm hover:bg-green-800 hover:shadow-lg hover:shadow-green-200 transition-all duration-300">
                        {t('nav.register', 'Register')}
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button className="md:hidden p-2 text-gray-600 hover:text-[#2E7D32] transition-colors" onClick={() => setOpen(!open)}>
                    <div className="relative w-6 h-6">
                        <Menu size={24} className={`absolute inset-0 transition-all duration-300 ${open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
                        <X size={24} className={`absolute inset-0 transition-all duration-300 ${open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
                    </div>
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border-t border-gray-100 px-4 pb-4 shadow-lg">
                    {navLinks.map(l => (
                        <button key={l.id} onClick={() => { scrollTo(l.id); setOpen(false); }}
                            className="block w-full text-left py-3 text-gray-700 font-medium border-b border-gray-50 hover:text-[#2E7D32] hover:pl-2 transition-all duration-200">
                            {l.label}
                        </button>
                    ))}

                    {/* Mobile Language Toggle */}
                    <div className="flex items-center justify-center gap-2 mt-4 mb-2 py-2 rounded-full border border-gray-200 bg-gray-50 font-bold text-gray-700 text-sm w-full max-w-[200px] mx-auto">
                        <span>🌐</span>
                        <button onClick={() => changeLanguage('en')} className={`hover:text-[#2E7D32] transition-colors ${i18n.language === 'en' ? 'text-[#2E7D32]' : ''}`}>EN</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => changeLanguage('ta')} className={`hover:text-[#2E7D32] transition-colors ${i18n.language === 'ta' ? 'text-[#2E7D32]' : ''}`}>தமிழ்</button>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Link to="/login" className="flex-1 text-center px-4 py-2.5 rounded-full border-2 border-[#2E7D32] text-[#2E7D32] font-bold text-sm hover:bg-[#2E7D32] hover:text-white transition-all duration-300">{t('nav.login', 'Login')}</Link>
                        <Link to="/register" className="flex-1 text-center px-4 py-2.5 rounded-full bg-[#2E7D32] text-white font-bold text-sm hover:bg-green-800 transition-colors">{t('nav.register', 'Register')}</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

/* ═══════════════ FEATURE CARD ═════════════════════ */
const FeatureCard = ({ icon, titleKey, descKey, delay }) => {
    const { t } = useTranslation();
    const [ref, isInView] = useInView();
    return (
        <div
            ref={ref}
            className={`group bg-white border-2 border-transparent rounded-2xl p-8 text-left shadow-sm cursor-default
                transition-all duration-500 ease-out
                hover:-translate-y-2 hover:shadow-xl hover:border-[#A5D6A7]
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="w-14 h-14 rounded-xl bg-green-50 text-[#2E7D32] flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2E7D32] group-hover:text-white group-hover:shadow-lg group-hover:shadow-green-100">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors duration-200 group-hover:text-[#2E7D32]">{t(`landing.${titleKey}`)}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t(`landing.${descKey}`)}</p>
        </div>
    );
};

/* ═══════════════════ STEP CARD ════════════════════ */
const StepCard = ({ icon, num, textKey, delay }) => {
    const { t } = useTranslation();
    const [ref, isInView] = useInView();
    return (
        <div
            ref={ref}
            className={`group relative flex flex-col items-center text-center transition-all duration-500 ease-out
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="w-20 h-20 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center shadow-lg mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-200 group-hover:rounded-3xl">
                {icon}
            </div>
            <span className="text-2xl font-extrabold text-[#A5D6A7] mb-2">{num}</span>
            <p className="text-gray-600 text-sm leading-relaxed max-w-[220px]">{t(`landing.${textKey}`)}</p>
        </div>
    );
};

/* ══════════════ REVIEW CARD ═══════════════════════ */
const ReviewCard = ({ name, roleKey, textKey, delay }) => {
    const { t } = useTranslation();
    const [ref, isInView] = useInView();
    return (
        <div
            ref={ref}
            className={`group bg-white border border-gray-100 rounded-2xl p-8 text-left shadow-sm cursor-default
                transition-all duration-500 ease-out
                hover:shadow-lg hover:-translate-y-1
                ${isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="flex gap-1 text-yellow-400 mb-5">
                {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" className="transition-transform duration-200 group-hover:scale-110" style={{ transitionDelay: `${j * 50}ms` }} />
                ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6 italic">{t(`landing.${textKey}`)}</p>
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-green-100 text-[#2E7D32] font-bold flex items-center justify-center text-lg transition-all duration-300 group-hover:bg-[#2E7D32] group-hover:text-white group-hover:scale-105">
                    {name.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-gray-900 text-sm">{name}</div>
                    <div className="text-xs text-[#2E7D32] font-semibold">{t(`landing.${roleKey}`)}</div>
                </div>
            </div>
        </div>
    );
};

/* ══════════════ FAQ ACCORDION ═════════════════════ */
const FAQItem = ({ qKey, aKey, delay }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const contentRef = useRef(null);
    const [ref, isInView] = useInView();

    return (
        <div
            ref={ref}
            className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-500 ease-out
                hover:shadow-md hover:border-[#A5D6A7]
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-gray-800 hover:bg-gray-50 transition-colors duration-200"
            >
                <span>{t(`landing.${qKey}`)}</span>
                <ChevronDown
                    size={20}
                    className={`shrink-0 transition-all duration-300 ${open ? 'rotate-180 text-[#2E7D32]' : 'text-gray-400'}`}
                />
            </button>
            <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-400 ease-in-out"
                style={{ maxHeight: open ? contentRef.current?.scrollHeight + 'px' : '0px' }}
            >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {t(`landing.${aKey}`)}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════ LANDING PAGE ══════════════════ */
const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [chainStats, setChainStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/chain/stats');
                if (res.ok) {
                    const data = await res.json();
                    setChainStats(data);
                }
            } catch (err) {
                // Fallback gracefully without breaking
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="bg-white text-gray-800 overflow-x-hidden scroll-smooth">
            <Navbar />

            {/* ── 1. Hero ──────────────────────────────── */}
            <section id="home" className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#A5D6A7]/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-[#A5D6A7]/15 blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">
                    <Reveal className="md:w-1/2 space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-[#2E7D32] text-xs font-bold tracking-wide uppercase">
                                🌱 {t('hero.subtitle', 'Climate-Aware Agriculture')}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                {chainStats ? `${chainStats.total_batches_on_chain || 0} Batches Verified on Polygon` : 'Polygon Amoy Verified'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
                            Farm<span className="text-[#2E7D32]">Vista</span> – {t('hero.title', 'Climate-Aware Agricultural Supply Chain Platform')}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                            {t('hero.description', 'Connecting farmers and retailers through a transparent digital marketplace while helping farmers manage climate risks.')}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/register"
                                className="group px-7 py-3.5 rounded-full bg-[#2E7D32] text-white font-bold hover:bg-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-200 flex items-center gap-2">
                                {t('hero.getStarted', 'Get Started')} <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                            <Link to="/consumer/marketplace"
                                className="px-7 py-3.5 rounded-full border-2 border-[#2E7D32] text-[#2E7D32] font-bold hover:bg-[#2E7D32] hover:text-white transition-all duration-300">
                                {t('hero.explore', 'Explore Marketplace')}
                            </Link>
                        </div>
                    </Reveal>

                    <Reveal className="md:w-1/2 flex justify-center" delay={200}>
                        <img
                            src="/farmvista_hero.png"
                            alt="FarmVista Illustration"
                            className="w-full max-w-md md:max-w-lg drop-shadow-xl rounded-3xl transition-transform duration-700 hover:scale-[1.03]"
                        />
                    </Reveal>
                </div>
            </section>

            {/* ── 2. Features ──────────────────────────── */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{t('landing.featuresTitle')}</h2>
                        <p className="text-gray-500 max-w-xl mx-auto mb-14">{t('landing.featuresDesc')}</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <FeatureCard key={i} {...f} delay={i * 100} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. How It Works ──────────────────────── */}
            <section id="howitworks" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-14">{t('landing.howItWorksTitle')}</h2>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#A5D6A7] via-[#2E7D32] to-[#A5D6A7] opacity-30 rounded-full" />

                        {steps.map((s, i) => (
                            <StepCard key={i} {...s} delay={i * 150} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. Reviews ───────────────────────────── */}
            <section id="reviews" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-14">{t('landing.reviewsTitle')}</h2>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.map((r, i) => (
                            <ReviewCard key={i} {...r} delay={i * 150} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5. FAQ ───────────────────────────────── */}
            <section id="faq" className="py-20 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 md:px-8">
                    <Reveal>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">{t('landing.faqTitle')}</h2>
                    </Reveal>
                    <div className="space-y-4">
                        {faqs.map((f, i) => <FAQItem key={i} qKey={f.qKey} aKey={f.aKey} delay={i * 100} />)}
                    </div>
                </div>
            </section>

            {/* ── 6. Footer ───────────────────────────── */}
            <footer className="bg-gray-900 text-gray-400 py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sprout className="text-[#A5D6A7]" size={24} />
                            <span className="text-lg font-extrabold text-white">FarmVista</span>
                        </div>
                        <p className="text-sm leading-relaxed">{t('landing.footerDesc')}</p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('landing.quickLinks')}</h4>
                        <ul className="space-y-2 text-sm">
                            {[
                                { id: 'home', label: t('nav.home', 'Home') },
                                { id: 'features', label: t('nav.features', 'Features') },
                                { id: 'howitworks', label: t('nav.howItWorks', 'How It Works') },
                                { id: 'faq', label: t('nav.faq', 'FAQ') }
                            ].map(link => (
                                <li key={link.id}>
                                    <button onClick={() => scrollTo(link.id)} className="hover:text-white transition-colors duration-200">
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('landing.contact')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2"><Mail size={16} /> support@farmvista.io</li>
                            <li className="flex items-center gap-2"><LifeBuoy size={16} /> {t('landing.helpCenter')}</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t('landing.platform')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/login" className="hover:text-white transition-colors duration-200">{t('nav.login', 'Login')}</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors duration-200">{t('nav.register', 'Register')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
                    {t('landing.rights')}
                </div>
            </footer>
        </div>
    );
};

export default Landing;
