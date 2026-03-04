import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Placeholder login flow: mock user as farmer
        navigate('/farmer/dashboard');
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Sign in to manage your farm and crops.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all"
                        placeholder="farmer@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className="w-full bg-primary-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                    Sign In
                </button>
            </form>

            <div className="text-center mt-6 text-gray-600">
                Don't have an account? <Link to="/register" className="text-primary-green font-semibold hover:underline">Register here</Link>
            </div>
        </div>
    );
};

export default Login;
