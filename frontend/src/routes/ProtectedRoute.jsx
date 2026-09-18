import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userData);

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Role mismatch, redirect to appropriate default dashboard
            if (user.role === 'farmer') {
                return <Navigate to="/farmer/dashboard" replace />;
            } else if (user.role === 'consumer' || user.role === 'retailer') {
                return <Navigate to="/consumer/dashboard" replace />;
            } else {
                return <Navigate to="/" replace />; // Fallback
            }
        }
    } catch (error) {
        console.error("Error parsing user data for protected route:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
