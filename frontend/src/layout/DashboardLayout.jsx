import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import AssistantWidget from '../components/AssistantWidget';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                {/* Topbar */}
                <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                {/* Dashboard Content */}
                <main className="flex-1 p-4 md:p-6 md:pt-24 pt-20 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Floating AI Assistant Widget */}
            <AssistantWidget />
        </div>
    );
};

export default DashboardLayout;
