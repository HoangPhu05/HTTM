import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import StatCard from '../components/StatCard';
import AlertPanel from '../components/AlertPanel';
import ControlOutput from '../components/ControlOutput';
import IoTControl from '../components/IoTControl';
import Chart from '../components/Chart';
import PredictionPanel from '../components/PredictionPanel';
import PredictionTrendChart from '../components/PredictionTrendChart';

const REFRESH = 5000;

const formatValue = (value, digits = 1, fallback = '--') =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : fallback;

const pickCurrentData = (payload) => payload?.data ?? payload ?? null;

const pickControlData = (payload) =>
  payload?.control ?? (
    payload?.ventilation_level != null || payload?.fan_status || payload?.explanation
      ? payload
      : null
  );

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
  const num = Number(value);
  if (!Number.isFinite(num)) return 'default';
  if (param === 'co2') return num > 1200 ? 'red' : num > 800 ? 'yellow' : 'green';
  if (param === 'pm25') return num > 75 ? 'red' : num > 35 ? 'yellow' : 'green';
  if (param === 'humidity') return (num < 40 || num > 70) ? 'yellow' : 'green';
  if (param === 'temperature') return (num < 16 || num > 28) ? 'yellow' : 'green';
  return 'default';
};

const getTrend = (current, predicted) => {
  if (predicted == null || current == null) return null;
  return predicted > current ? 'up' : predicted < current ? 'down' : 'flat';
};

export default function Dashboard() {
  const [currentData, setCurrentData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [hybridDecision, setHybridDecision] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [control, setControl] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [cur, al, hist, pred, hyb] = await Promise.all([
        apiClient.getCurrentData(),
        apiClient.getAlerts(),
        apiClient.getDataHistory(20),
        apiClient.getPredictions().catch(() => ({ data: null })),
        import('../services/api').then(m => m.default.get('/hybrid-decision').catch(() => ({ data: null }))),
      ]);

      setCurrentData(pickCurrentData(cur.data));
      setAlerts(al.data.alerts || []);
      setControl(pickControlData(cur.data));
      setHistoryData(hist.data.records || []);
      setPrediction(pred.data);
      // hybrid decision
      const hd = hyb?.data;
      setHybridDecision(
        hd?.status === 'available' ? hd : null
      );
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return undefined;
    const id = setInterval(fetchData, REFRESH);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  const d = currentData;
  const p = prediction?.predicted_values || {};

  return (
    <div className="max-w-7xl mx-auto px-5 py-6 space-y-7 pb-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Tổng quan</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Đang tải dữ liệu...'}
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

      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-semibold text-slate-500">Chỉ số chính</h2>
          {prediction?.predicted_values && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-medium text-purple-600">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
              Dự đoán ARIMA (5 phút tới)
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard
                title="Nhiệt độ"
                value={p.Temperature != null ? formatValue(p.Temperature, 1) : formatValue(d?.temperature, 1)}
                unit="°C"
                status={getStatus(p.Temperature ?? d?.temperature, 'temperature')}
                delta={p.Temperature != null && d ? +(p.Temperature - d.temperature).toFixed(1) : null}
              />
              <StatCard
                title="Độ ẩm"
                value={p.Humidity != null ? formatValue(p.Humidity, 1) : formatValue(d?.humidity, 1)}
                unit="%"
                status={getStatus(p.Humidity ?? d?.humidity, 'humidity')}
                delta={p.Humidity != null && d ? +(p.Humidity - d.humidity).toFixed(1) : null}
              />
              <StatCard
                title="CO2"
                value={p.CO2 != null ? formatValue(p.CO2, 0) : formatValue(d?.co2, 0)}
                unit="ppm"
                status={getStatus(p.CO2 ?? d?.co2, 'co2')}
                delta={p.CO2 != null && d ? +(p.CO2 - d.co2).toFixed(0) : null}
              />
              <StatCard
                title="PM2.5"
                value={p['PM2.5'] != null ? formatValue(p['PM2.5'], 1) : formatValue(d?.pm25, 1)}
                unit="µg/m³"
                status={getStatus(p['PM2.5'] ?? d?.pm25, 'pm25')}
                delta={p['PM2.5'] != null && d ? +(p['PM2.5'] - d.pm25).toFixed(1) : null}
              />
            </>
          )}
        </div>
      </section>

      {!loading && d && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 mb-3">Chỉ số bổ sung</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard title="PM10" value={formatValue(d.pm10, 1)} unit="µg/m³" />
            <StatCard title="TVOC" value={formatValue(d.tvoc, 1)} unit="ppb" />
            <StatCard title="CO" value={formatValue(d.co, 2)} unit="ppm" />
            <StatCard title="Số người" value={d.occupancy_count ?? '--'} unit="người" />
            <StatCard title="Thông gió" value={d.ventilation_status || '--'} />
          </div>
        </section>
      )}

      <section>
        <PredictionTrendChart autoRefresh={autoRefresh} />
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Dự báo và quyết định hybrid</h2>
        <PredictionPanel
          sharedPredicted={prediction?.predicted_values ?? undefined}
          sharedCurrent={currentData ?? undefined}
          sharedHybrid={hybridDecision ?? undefined}
        />
      </section>

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

      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Lịch sử 20 mẫu gần nhất</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Chart data={historyData} parameters={['co2', 'pm25']} title="CO2 và PM2.5" />
          <Chart data={historyData} parameters={['temperature', 'humidity']} title="Nhiệt độ và độ ẩm" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Điều khiển thiết bị IoT</h2>
        <IoTControl />
      </section>
    </div>
  );
}
