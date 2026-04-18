import React from 'react';

const Navbar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'charts', label: '📈 Biểu đồ', icon: '📈' },
    { id: 'alerts', label: '⚠️ Cảnh báo', icon: '⚠️' },
    { id: 'fuzzy', label: '🔧 Điều khiển Fuzzy', icon: '🔧' },
    { id: 'data', label: '📋 Dữ liệu', icon: '📋' },
    { id: 'about', label: 'ℹ️ Giới thiệu', icon: 'ℹ️' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">🏫 HTTM System</h1>
            <div className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
