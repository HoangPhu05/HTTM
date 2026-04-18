import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import StatCard from '../components/StatCard';
import Header from '../components/Header';
import AlertPanel from '../components/AlertPanel';
import ControlOutput from '../components/ControlOutput';
import IoTControl from '../components/IoTControl';
import Chart from '../components/Chart';

const Dashboard = () => {
  const [currentData, setCurrentData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [control, setControl] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [current, alertsRes, historyRes] = await Promise.all([
        apiClient.getCurrentData(),
        apiClient.getAlerts(),
        apiClient.getDataHistory(20),
      ]);

      setCurrentData(current.data.data);
      setAlerts(alertsRes.data.alerts || []);
      setControl(current.data.control);
      setHistoryData(historyRes.data.records || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (value, param) => {
    // Color coding logic
    if (param === 'co2') {
      if (value > 1200) return 'red';
      if (value > 800) return 'yellow';
      return 'green';
    }
    if (param === 'pm25') {
      if (value > 75) return 'red';
      if (value > 35) return 'yellow';
      return 'green';
    }
    if (param === 'humidity') {
      if (value < 40 || value > 70) return 'yellow';
      return 'green';
    }
    return 'green';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <Header 
          title="🏫 Hệ thống Giám sát Chất lượng Không khí"
          subtitle="Điều khiển thiết bị thông gió bằng Fuzzy Logic"
        />

        {/* Control Panel */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
          >
            {autoRefresh ? '⏸️ Dừng cập nhật' : '▶️ Cập nhật tự động'}
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentData && (
            <>
              <StatCard 
                icon="🌡️"
                title="Nhiệt độ"
                value={currentData.temperature.toFixed(1)}
                unit="°C"
                status={getStatusColor(currentData.temperature, 'temp')}
              />
              <StatCard 
                icon="💧"
                title="Độ ẩm"
                value={currentData.humidity.toFixed(1)}
                unit="%"
                status={getStatusColor(currentData.humidity, 'humidity')}
              />
              <StatCard 
                icon="☁️"
                title="CO2"
                value={currentData.co2.toFixed(0)}
                unit="ppm"
                status={getStatusColor(currentData.co2, 'co2')}
              />
              <StatCard 
                icon="💨"
                title="PM2.5"
                value={currentData.pm25.toFixed(1)}
                unit="µg/m³"
                status={getStatusColor(currentData.pm25, 'pm25')}
              />
            </>
          )}
        </div>

        {/* Additional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {currentData && (
            <>
              <StatCard 
                icon="🏭"
                title="PM10"
                value={currentData.pm10.toFixed(1)}
                unit="µg/m³"
              />
              <StatCard 
                icon="🚫"
                title="TVOC"
                value={currentData.tvoc.toFixed(1)}
                unit="ppb"
              />
              <StatCard 
                icon="⚡"
                title="CO"
                value={currentData.co.toFixed(2)}
                unit="ppm"
              />
              <StatCard 
                icon="👥"
                title="Số người"
                value={currentData.occupancy_count}
                unit="người"
              />
              <StatCard 
                icon="🌬️"
                title="Trạng thái"
                value={currentData.ventilation_status}
                unit=""
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Alerts and Control */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Cảnh báo</h3>
              <AlertPanel alerts={alerts} loading={loading} />
            </div>
          </div>

          {/* Right Column - Control Output and Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔧 Điều khiển Quạt</h3>
              <ControlOutput control={control} loading={loading} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            data={historyData}
            parameters={['co2', 'pm25']}
            title="Biểu đồ CO2 và PM2.5"
          />
          <Chart 
            data={historyData}
            parameters={['temperature', 'humidity']}
            title="Biểu đồ Nhiệt độ và Độ ẩm"
          />
        </div>

        {/* IoT Device Control */}
        <div className="mt-6">
          <IoTControl />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
