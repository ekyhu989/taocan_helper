import React from 'react';

const FeatureCard = ({ icon, title, description, onClick, bgColor = 'bg-blue-50' }) => {
  const handleClick = (e) => {
    if (onClick && typeof onClick === 'function') {
      onClick(e);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`${bgColor} rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default FeatureCard;
