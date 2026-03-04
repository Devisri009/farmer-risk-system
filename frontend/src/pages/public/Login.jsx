import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import LanguageToggle from '../../components/layout/LanguageToggle';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/login', formData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'farmer') {
                navigate('/farmer/dashboard');
            } else {
                navigate('/retailer/marketplace');
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || err.response?.data?.error || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Minimal Header */}
            <div className="p-6 flex justify-end">
                <LanguageToggle />
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full border border-gray-100 max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('login.title')}</h2>
                        <p className="text-gray-500">{t('login.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('login.email')}</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="farmer@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('login.password')}</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? t('login.signingIn') : t('login.signIn')}
                        </button>
                    </form>

                    <div className="text-center mt-6 text-gray-600">
                        {t('login.noAccount')} <Link to="/register" className="text-primary-green font-semibold hover:underline">{t('login.registerLink')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
