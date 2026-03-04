import React from 'react';

const Card = ({ title, children, className = "" }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
