import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AssistantWidget from '../components/shared/AssistantWidget';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col md:ml-64 min-w-0">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto w-full">
                    <Outlet />
                </main>
            </div>
            {/* Floating Assistant Widget */}
            <AssistantWidget />
        </div>
    );
};

export default DashboardLayout;
