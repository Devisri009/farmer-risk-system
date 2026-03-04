import React from 'react';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light-gray relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-green opacity-10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-blue opacity-10 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md mx-4 relative z-10">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
