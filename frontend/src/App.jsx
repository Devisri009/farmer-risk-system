// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layout/DashboardLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import QRTracking from './pages/public/QRTracking';

// Farmer Pages
import DashboardHome from './pages/DashboardHome';
import PostCrop from './pages/PostCrop';
import MyBatches from './pages/MyBatches';
import BatchDetails from './pages/BatchDetails';
import FarmFeed from './pages/FarmFeed';

// Placeholder Pages for Settings/Alerts/Assistant if needed
const Placeholder = ({ title }) => (
  <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
    <h2 className="text-2xl font-bold text-gray-400">{title} Component Coming Soon</h2>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:id" element={<QRTracking />} />

        {/* Farmer Dashboard Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/farmer/*" element={<DashboardLayout>
            <Routes>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="post-crop" element={<PostCrop />} />
              <Route path="batches" element={<MyBatches />} />
              <Route path="batches/:id" element={<BatchDetails />} />
              <Route path="feed" element={<FarmFeed />} />
              <Route path="alerts" element={<Placeholder title="Climate Alerts" />} />
              <Route path="assistant" element={<Placeholder title="AI Assistant" />} />
              <Route path="settings" element={<Placeholder title="Settings" />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </DashboardLayout>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;