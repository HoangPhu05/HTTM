import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import AlertPanel from '../components/AlertPanel';

const THRESHOLDS = [
  {
    param: 'CO2',
    normal: '< 800 ppm',
    warning: '800 – 1200 ppm',
    danger: '> 1200 ppm',
  },
  {
    param: 'PM2.5',
    normal: '< 35 µg/m³',
    warning: '35 – 75 µg/m³',
    danger: '> 75 µg/m³',
  },
  {
    param: 'Nhiệt độ',
    normal: '16 – 28 °C',
    warning: '14 – 30 °C',
    danger: '—',
  },
  {
    param: 'Độ ẩm',
    normal: '40 – 70 %',
    warning: '< 40% hoặc > 70%',
    danger: '—',
  },
  {
    param: 'TVOC',
    normal: '< 200 ppb',
    warning: '200 – 400 ppb',
    danger: '> 400 ppb',
  },
  {
    param: 'CO',
    normal: '< 4 ppm',
    warning: '4 – 9 ppm',
    danger: '> 9 ppm',
  },
];

const RECOMMENDATIONS = [
  { icon: '🌬️', text: 'Khi CO2 vượt ngưỡng, tăng thông gió ngay để giảm nồng độ' },
  { icon: '💨', text: 'PM2.5 cao → bật quạt mạnh và máy lọc không khí' },
  { icon: '💧', text: 'Duy trì độ ẩm 40–70% để đảm bảo sức khỏe và thoải mái' },
  { icon: '👥', text: 'Lớp đông người → tăng tần suất thông gió' },
  { icon: '🔧', text: 'Kiểm tra và bảo trì hệ thống thông gió định kỳ' },
];

const SummaryCard = ({ label, value, color }) => (
  <div className="card text-center">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Alerts = () => {
  const [alerts, setAlerts]       = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsRes, currentRes] = await Promise.all([
        apiClient.getAlerts(),
        apiClient.getCurrentData(),
      ]);
      setAlerts(alertsRes.data.alerts || []);
      setCurrentData(currentRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [fetchData]);

  const dangerCount  = alerts.filter(a => a.status === 'danger').length;
  const warningCount = alerts.filter(a => a.status === 'warning').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hệ thống Cảnh báo</h1>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="live-dot w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-xs text-emerald-600 font-medium">Tự động cập nhật</span>
            <button onClick={fetchData} className="btn btn-ghost border border-slate-200 text-sm ml-1">
              ↻ Làm mới
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Tổng cảnh báo" value={alerts.length}  color="text-blue-600" />
          <SummaryCard label="Nguy hiểm"     value={dangerCount}    color="text-red-600"  />
          <SummaryCard label="Cảnh báo"      value={warningCount}   color="text-amber-600"/>
          <div className="card text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Trạng thái</p>
            {alerts.length === 0 ? (
              <p className="text-sm font-bold text-emerald-600 mt-1">✅ Bình thường</p>
            ) : dangerCount > 0 ? (
              <p className="text-sm font-bold text-red-600 mt-1">🚨 Nguy hiểm</p>
            ) : (
              <p className="text-sm font-bold text-amber-600 mt-1">⚠️ Cảnh báo</p>
            )}
          </div>
        </div>

        {/* Alert list */}
        <section>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Chi tiết cảnh báo
          </p>
          <AlertPanel alerts={alerts} loading={loading} />
        </section>

        {/* Threshold table */}
        <section className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Bảng ngưỡng tham chiếu
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 font-semibold text-slate-600">Chỉ số</th>
                  <th className="text-center py-2 px-3 font-semibold text-emerald-600">✅ Bình thường</th>
                  <th className="text-center py-2 px-3 font-semibold text-amber-600">⚠️ Cảnh báo</th>
                  <th className="text-center py-2 px-3 font-semibold text-red-600">🔴 Nguy hiểm</th>
                </tr>
              </thead>
              <tbody>
                {THRESHOLDS.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/60'}`}>
                    <td className="py-2.5 pr-4 font-medium text-slate-700">{row.param}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-mono text-xs">{row.normal}</td>
                    <td className="py-2.5 px-3 text-center text-amber-700 font-mono text-xs">{row.warning}</td>
                    <td className="py-2.5 px-3 text-center text-red-700 font-mono text-xs">{row.danger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommendations */}
        <section className="card border-l-4 border-l-blue-400 bg-blue-50/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Khuyến nghị xử lý
          </p>
          <ul className="space-y-2">
            {RECOMMENDATIONS.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="text-base shrink-0">{r.icon}</span>
                {r.text}
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
};

export default Alerts;
