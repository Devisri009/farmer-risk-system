import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();



    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await apiClient.post('/auth/login', {
                username,
                password
            });

            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'farmer') {
                navigate('/farmer/dashboard');
            } else {
                navigate('/consumer/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('login.welcome', 'Welcome Back')}</h2>
                <p className="text-gray-500">{t('login.subtitle', 'Sign in to manage your farm and crops.')}</p>
            </div>

            {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('login.usernameOrPhone', 'Username or Phone Number')}</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder={t('login.usernamePlaceholder', 'Username or 10-digit Phone')}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('login.password', 'Password')}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        placeholder={t('login.passwordPlaceholder', '••••••••')}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? t('login.signingIn', 'Signing In...') : t('login.signIn', 'Sign In')}
                </button>
            </form>

            <div className="text-center mt-6 text-gray-600">
                {t('login.noAccount', "Don't have an account?")} <Link to="/register" className="text-green-600 font-semibold hover:underline">{t('login.registerHere', 'Register here')}</Link>
            </div>
        </div>
    );
};

export default Login;
