import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Alerts from './pages/Alerts';
import FuzzyDetails from './pages/FuzzyDetails';
import Data from './pages/Data';
import About from './pages/About';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'charts':
        return <Charts />;
      case 'alerts':
        return <Alerts />;
      case 'fuzzy':
        return <FuzzyDetails />;
      case 'data':
        return <Data />;
      case 'about':
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderPage()}
    </div>
  );
}

export default App;
