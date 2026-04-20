import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import StatCard from '../components/StatCard';
import AlertPanel from '../components/AlertPanel';
import ControlOutput from '../components/ControlOutput';
import IoTControl from '../components/IoTControl';
import Chart from '../components/Chart';

const REFRESH = 5000;

function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-3 w-2/5" />
      <div className="skeleton h-8 w-3/5" />
      <div className="skeleton h-3 w-2/5" />
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

const getStatus = (value, param) => {
  if (param === 'co2')         return value > 1200 ? 'red' : value > 800  ? 'yellow' : 'green';
  if (param === 'pm25')        return value > 75   ? 'red' : value > 35   ? 'yellow' : 'green';
  if (param === 'humidity')    return (value < 40 || value > 70) ? 'yellow' : 'green';
  if (param === 'temperature') return (value < 16 || value > 28) ? 'yellow' : 'green';
  return 'default';
};

export default function Dashboard() {
  const [currentData, setCurrentData] = useState(null);
  const [alerts,      setAlerts]      = useState([]);
  const [control,     setControl]     = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [cur, al, hist] = await Promise.all([
        apiClient.getCurrentData(),
        apiClient.getAlerts(),
        apiClient.getDataHistory(20),
      ]);
      setCurrentData(cur.data.data);
      setAlerts(al.data.alerts || []);
      setControl(cur.data.control);
      setHistoryData(hist.data.records || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return;
    const id = setInterval(fetchData, REFRESH);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  const d = currentData;

  return (
    <div className="max-w-7xl mx-auto px-5 py-6 space-y-7 pb-14">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Tổng quan</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Đang tải dữ liệu…'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {autoRefresh && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="live-dot w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Tự động làm mới
            </span>
          )}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`btn text-xs ${autoRefresh ? 'btn-outline' : 'btn-primary'}`}
          >
            {autoRefresh ? 'Dừng' : 'Bật tự động'}
          </button>
          <button onClick={fetchData} className="btn btn-outline text-xs">
            <RefreshIcon />
            Làm mới
          </button>
        </div>
      </div>

      {/* Primary metrics */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Chỉ số chính</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : d && (
              <>
                <StatCard title="Nhiệt độ"  value={d.temperature.toFixed(1)} unit="°C"    status={getStatus(d.temperature, 'temperature')} />
                <StatCard title="Độ ẩm"     value={d.humidity.toFixed(1)}    unit="%"     status={getStatus(d.humidity, 'humidity')} />
                <StatCard title="CO₂"        value={d.co2.toFixed(0)}          unit="ppm"   status={getStatus(d.co2, 'co2')} />
                <StatCard title="PM2.5"      value={d.pm25.toFixed(1)}         unit="µg/m³" status={getStatus(d.pm25, 'pm25')} />
              </>
            )
          }
        </div>
      </section>

      {/* Secondary metrics */}
      {!loading && d && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 mb-3">Chỉ số bổ sung</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard title="PM10"      value={d.pm10.toFixed(1)}    unit="µg/m³" />
            <StatCard title="TVOC"      value={d.tvoc.toFixed(1)}    unit="ppb"   />
            <StatCard title="CO"        value={d.co.toFixed(2)}      unit="ppm"   />
            <StatCard title="Số người"  value={d.occupancy_count}    unit="người" />
            <StatCard title="Thông gió" value={d.ventilation_status} />
          </div>
        </section>
      )}

      {/* Alerts + Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section>
          <h2 className="text-xs font-semibold text-slate-500 mb-3">Cảnh báo hiện tại</h2>
          <AlertPanel alerts={alerts} loading={loading} />
        </section>
        <section className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-slate-500 mb-3">Điều khiển quạt thông gió</h2>
          <ControlOutput control={control} loading={loading} />
        </section>
      </div>

      {/* Charts */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Lịch sử 20 mẫu gần nhất</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart data={historyData} parameters={['co2', 'pm25']}            title="CO₂ & PM2.5" />
          <Chart data={historyData} parameters={['temperature', 'humidity']} title="Nhiệt độ & Độ ẩm" />
        </div>
      </section>

      {/* IoT controls */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Điều khiển thiết bị IoT</h2>
        <IoTControl />
      </section>

    </div>
  );
}
