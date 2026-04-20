import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Alerts from './pages/Alerts';
import FuzzyDetails from './pages/FuzzyDetails';
import Data from './pages/Data';
import About from './pages/About';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'charts':    return <Charts />;
      case 'alerts':    return <Alerts />;
      case 'fuzzy':     return <FuzzyDetails />;
      case 'data':      return <Data />;
      case 'about':     return <About />;
      default:          return <Dashboard />;
    }
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="layout-root">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
      />

      <div className="main-content min-h-screen bg-slate-50">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-12 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Mở menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-slate-800 text-sm">HTTM</span>
        </div>

        {renderPage()}
      </div>
    </div>
  );
}

export default App;
