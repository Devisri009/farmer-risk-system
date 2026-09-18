import React from 'react';

const Card = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
            {title && <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>}
            {children}
        </div>
    );
};

export default Card;
