import React from 'react';

const StatCard = ({ icon, title, value, unit, status, description }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'green': return 'border-l-4 border-l-green-500';
      case 'yellow': return 'border-l-4 border-l-yellow-500';
      case 'red': return 'border-l-4 border-l-red-500';
      default: return 'border-l-4 border-l-blue-500';
    }
  };

  const getStatusBgColor = () => {
    switch(status) {
      case 'green': return 'bg-green-50';
      case 'yellow': return 'bg-yellow-50';
      case 'red': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className={`card ${getStatusColor()} ${getStatusBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 font-medium">{title}</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="ml-2 text-sm text-gray-600">{unit}</span>
          </div>
          {description && (
            <div className="mt-2 text-xs text-gray-500">{description}</div>
          )}
        </div>
        <div className="text-4xl ml-4">{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
