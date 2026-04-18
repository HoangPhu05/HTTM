import React from 'react';

const AlertPanel = ({ alerts, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="card border-l-4 border-l-green-500 bg-green-50">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">✅</div>
          <div>
            <h3 className="font-bold text-green-900">Môi trường ổn định</h3>
            <p className="text-sm text-green-700">Tất cả các chỉ số đều trong phạm vi bình thường</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`card border-l-4 ${
            alert.status === 'danger'
              ? 'border-l-red-500 bg-red-50'
              : 'border-l-yellow-500 bg-yellow-50'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`text-2xl ${alert.status === 'danger' ? '🔴' : '🟡'}`}>
              {alert.status === 'danger' ? '🚨' : '⚠️'}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${alert.status === 'danger' ? 'text-red-900' : 'text-yellow-900'}`}>
                {alert.parameter}
              </h4>
              <p className={`text-sm mt-1 ${alert.status === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>
                {alert.message}
              </p>
              <div className="mt-2 text-xs text-gray-600">
                Giá trị: {alert.value} {alert.unit}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel;
