import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import registerIllustration from '../../assets/register-illustration.png';
import LanguageToggle from '../../components/layout/LanguageToggle';
/* ── Reusable input renderer defined OUTSIDE to prevent focus loss ── */
const InputField = ({ label, name, type = 'text', placeholder, value, onChange, error, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none text-sm
                ${error
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-500'
                }`}
        />
        {error && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>
        )}
    </div>
);

const Register = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [role, setRole] = useState('farmer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        location: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (apiError) setApiError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.location.trim()) newErrors.location = 'Location is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMsg('');

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.replace(/\s/g, ''),
                password: formData.password,
                role,
                location: formData.location.trim(),
            };

            await apiClient.post('/auth/register', payload);

            setSuccessMsg('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            console.error('Registration Error:', err);

            let message = 'Registration failed. Please try again.';

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    message = detail;
                } else if (Array.isArray(detail)) {
                    // Handle validation errors from FastAPI (array of objects)
                    message = detail.map(d => d.msg).join(', ');
                }
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.response?.data?.error) {
                message = err.response.data.error;
            } else if (err.message) {
                message = err.message;
            }

            setApiError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative">
            <div className="absolute top-4 right-6 z-10">
                <LanguageToggle />
            </div>
            {/* ════════════ LEFT — Platform Introduction ════════════ */}
            <div className="lg:w-[48%] w-full flex flex-col justify-center items-center px-8 py-12 lg:py-0"
                style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)' }}>

                <div className="max-w-md w-full space-y-6">
                    {/* Badge */}
                    <span className="inline-block text-xs font-bold tracking-[0.2em] text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase">
                        FarmVista
                    </span>

                    {/* Heading */}
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                        {t('hero.title1')} <br /> {t('hero.title2')}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                        {t('hero.description')}
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {['Climate Monitoring', 'Crop Tracking', 'Secure Trading'].map((f) => (
                            <span key={f} className="text-xs font-medium text-green-800 bg-white/70 border border-green-200 px-3 py-1 rounded-full backdrop-blur-sm">
                                {f}
                            </span>
                        ))}
                    </div>

                    {/* Illustration */}
                    <div className="pt-4">
                        <img
                            src={registerIllustration}
                            alt="Sustainable agriculture — farmers working in a field"
                            className="w-full max-w-lg mx-auto rounded-3xl shadow-xl hover:scale-[1.02] transition-transform duration-500 object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* ════════════ RIGHT — Register Form ════════════ */}
            <div className="lg:w-[52%] w-full flex items-center justify-center bg-gray-50 px-6 py-12 lg:py-0">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-10">
                        {/* Form header */}
                        <div className="mb-7 mt-4">
                            <h2 className="text-2xl font-bold text-gray-900">{t('register.title')}</h2>
                            <p className="text-gray-500 text-sm mt-1">{t('register.subtitle')}</p>
                            <p className="text-gray-400 text-xs mt-2">{t('register.required')}</p>
                        </div>

                        {/* API-level messages */}
                        {apiError && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {apiError}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {/* ── Role selector ── */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.role')} <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'farmer', label: t('register.roleFarmer'), icon: '🌾' },
                                        { value: 'retailer', label: t('register.roleRetailer'), icon: '🛒' },
                                    ].map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200
                                                ${role === r.value
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-lg">{r.icon}</span>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Input fields ── */}
                            <InputField
                                label={t('register.name')}
                                name="name"
                                placeholder="e.g. Logesh Kumar"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                            <InputField
                                label={t('register.email')}
                                name="email"
                                type="email"
                                placeholder="logesh@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            <InputField
                                label={t('register.phone')}
                                name="phone"
                                type="tel"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                            />
                            <InputField
                                label={t('register.password')}
                                name="password"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                            />
                            <InputField
                                label={t('register.confirmPassword')}
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                            />
                            <InputField
                                label={t('register.location')}
                                name="location"
                                placeholder="e.g. Tamil Nadu"
                                value={formData.location}
                                onChange={handleChange}
                                error={errors.location}
                            />

                            {/* ── Submit button ── */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2
                                    ${isSubmitting
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-sm hover:shadow'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('register.creatingAccount')}
                                    </span>
                                ) : (
                                    t('register.createAccount')
                                )}
                            </button>
                        </form>

                        {/* ── Login redirect ── */}
                        <p className="text-center text-sm text-gray-500 mt-6">
                            {t('register.hasAccount')}{' '}
                            <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors">
                                {t('register.loginLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
