// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Farmer Pages
import FarmerHome from './pages/farmer/Home';
import PostCrop from './pages/farmer/PostCrop';
import MyBatches from './pages/farmer/MyBatches';
import BatchDetails from './pages/farmer/BatchDetails';
import FarmFeed from './pages/farmer/FarmFeed';

// Retailer Pages
import RetailerMarketplace from './pages/retailer/Marketplace';
import RetailerPurchases from './pages/retailer/Purchases';
import PaymentBreakdown from './pages/retailer/PaymentBreakdown';

// Placeholder Pages
import QRTracking from './pages/public/QRTracking';

// Placeholder Pages
const Settings = () => <div className="p-8 text-2xl text-center">Settings</div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:id" element={<QRTracking />} />

        {/* Farmer Routes */}
        <Route path="/farmer/*" element={<MainLayout>
          <Routes>
            <Route path="dashboard" element={<FarmerHome />} />
            <Route path="post-crop" element={<PostCrop />} />
            <Route path="batches" element={<MyBatches />} />
            <Route path="batches/:id" element={<BatchDetails />} />
            <Route path="feed" element={<FarmFeed />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </MainLayout>} />

        {/* Retailer Routes */}
        <Route path="/retailer/*" element={<MainLayout>
          <Routes>
            <Route path="marketplace" element={<RetailerMarketplace />} />
            <Route path="purchases" element={<RetailerPurchases />} />
            <Route path="payment/:id" element={<PaymentBreakdown />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="marketplace" replace />} />
          </Routes>
        </MainLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;