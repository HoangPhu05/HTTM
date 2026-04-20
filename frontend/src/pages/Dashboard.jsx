import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import StatCard from '../components/StatCard';
import AlertPanel from '../components/AlertPanel';
import ControlOutput from '../components/ControlOutput';
import IoTControl from '../components/IoTControl';
import Chart from '../components/Chart';

const REFRESH_INTERVAL = 5000;

const SkeletonCard = () => (
  <div className="card">
    <div className="skeleton h-3 w-1/2 rounded mb-3" />
    <div className="skeleton h-7 w-2/3 rounded mb-2" />
    <div className="skeleton h-3 w-1/3 rounded" />
  </div>
);

const Dashboard = () => {
  const [currentData, setCurrentData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [control, setControl] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [current, alertsRes, historyRes] = await Promise.all([
        apiClient.getCurrentData(),
        apiClient.getAlerts(),
        apiClient.getDataHistory(20),
      ]);
      setCurrentData(current.data.data);
      setAlerts(alertsRes.data.alerts || []);
      setControl(current.data.control);
      setHistoryData(historyRes.data.records || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const getStatusColor = (value, param) => {
    if (param === 'co2') {
      if (value > 1200) return 'red';
      if (value > 800)  return 'yellow';
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
    if (param === 'temperature') {
      if (value < 16 || value > 28) return 'yellow';
      return 'green';
    }
    return 'green';
  };

  const formatTime = (d) =>
    d ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật lần cuối: {formatTime(lastUpdated)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {autoRefresh && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="live-dot w-2 h-2 bg-emerald-500 rounded-full" />
                Đang cập nhật
              </span>
            )}
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`btn text-sm ${autoRefresh ? 'btn-primary' : 'btn-ghost border border-slate-200'}`}
            >
              {autoRefresh ? '⏸ Dừng' : '▶ Tự động'}
            </button>
            <button onClick={fetchData} className="btn btn-ghost border border-slate-200 text-sm">
              ↻ Làm mới
            </button>
          </div>
        </div>

        {/* Primary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : currentData ? (
            <>
              <StatCard icon="🌡️" title="Nhiệt độ"  value={currentData.temperature.toFixed(1)} unit="°C"     status={getStatusColor(currentData.temperature, 'temperature')} />
              <StatCard icon="💧" title="Độ ẩm"     value={currentData.humidity.toFixed(1)}    unit="%"      status={getStatusColor(currentData.humidity,    'humidity')}    />
              <StatCard icon="☁️" title="CO2"        value={currentData.co2.toFixed(0)}          unit="ppm"    status={getStatusColor(currentData.co2,         'co2')}         />
              <StatCard icon="💨" title="PM2.5"      value={currentData.pm25.toFixed(1)}         unit="µg/m³"  status={getStatusColor(currentData.pm25,        'pm25')}        />
            </>
          ) : null}
        </div>

        {/* Secondary stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {!loading && currentData && (
            <>
              <StatCard icon="🏭" title="PM10"        value={currentData.pm10.toFixed(1)}          unit="µg/m³" />
              <StatCard icon="🚫" title="TVOC"         value={currentData.tvoc.toFixed(1)}          unit="ppb"   />
              <StatCard icon="⚡" title="CO"           value={currentData.co.toFixed(2)}            unit="ppm"   />
              <StatCard icon="👥" title="Số người"     value={currentData.occupancy_count}          unit="người" />
              <StatCard icon="🌬️" title="Thông gió"   value={currentData.ventilation_status}       unit=""      />
            </>
          )}
        </div>

        {/* Alerts + Control side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">⚠️ Cảnh báo</p>
            <AlertPanel alerts={alerts} loading={loading} />
          </div>
          <div className="lg:col-span-2 space-y-2">
            <p className="text-sm font-semibold text-slate-700">🔧 Điều khiển quạt</p>
            <ControlOutput control={control} loading={loading} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart data={historyData} parameters={['co2', 'pm25']}          title="CO2 & PM2.5" />
          <Chart data={historyData} parameters={['temperature', 'humidity']} title="Nhiệt độ & Độ ẩm" />
        </div>

        {/* IoT Control */}
        <IoTControl />
      </div>
    </div>
  );
};

export default Dashboard;
