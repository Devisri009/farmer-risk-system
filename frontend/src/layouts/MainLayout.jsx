import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import AssistantWidget from '../components/shared/AssistantWidget';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-bg-light-gray flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all pb-[70px] md:pb-0">
                {/* Navbar */}
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 md:pt-24 pt-20 overflow-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Floating Assistant Widget */}
            <AssistantWidget />
        </div>
    );
};

export default MainLayout;
