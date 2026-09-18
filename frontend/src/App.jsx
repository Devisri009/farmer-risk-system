// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Farmer Pages
import ProtectedRoute from './routes/ProtectedRoute';

import DashboardHome from './pages/DashboardHome';
import PostCrop from './pages/PostCrop';
import MyBatches from './pages/MyBatches';
import BatchDetails from './pages/BatchDetails';
import FarmFeed from './pages/FarmFeed';
import ClimateAlerts from './pages/ClimateAlerts';
import FarmerMarketplace from './pages/FarmerMarketplace';
import FarmerBuyerMatching from './pages/FarmerBuyerMatching';
import Profile from './pages/Profile';
import AwarenessPage from './pages/AwarenessPage';
import Settings from './pages/Settings';

// Consumer Pages
import ConsumerDashboard from './pages/consumer/Dashboard';
import ConsumerMarketplace from './pages/consumer/Marketplace';
import ConsumerPurchases from './pages/consumer/Purchases';
import MarginAnalysis from './pages/consumer/MarginAnalysis';
import PaymentBreakdown from './pages/consumer/PaymentBreakdown';
import BuyerDemandPortal from './pages/buyer/BuyerDemandPortal';

// Placeholder Pages
import QRTracking from './pages/public/QRTracking';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:id" element={<QRTracking />} />

        {/* Farmer Routes */}
        <Route path="/farmer" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="post-crop" element={<PostCrop />} />
          <Route path="batches" element={<MyBatches />} />
          <Route path="batches/:id" element={<BatchDetails />} />
          <Route path="feed" element={<FarmFeed />} />
          <Route path="marketplace" element={<FarmerMarketplace />} />
          <Route path="buyer-matching" element={<FarmerBuyerMatching />} />
          <Route path="alerts" element={<ClimateAlerts />} />
          <Route path="awareness" element={<AwarenessPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Consumer Routes */}
        <Route path="/consumer/*" element={
          <ProtectedRoute allowedRoles={['consumer', 'retailer']}>
            <MainLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ConsumerDashboard />} />
                <Route path="marketplace" element={<ConsumerMarketplace />} />
                <Route path="buyer-demands" element={<BuyerDemandPortal />} />
                <Route path="purchases" element={<ConsumerPurchases />} />
                <Route path="margin-analysis" element={<MarginAnalysis />} />
                <Route path="payment/:id" element={<PaymentBreakdown />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/consumer/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Backwards Compatibility /retailer Redirect */}
        <Route path="/retailer/*" element={<Navigate to="/consumer/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;