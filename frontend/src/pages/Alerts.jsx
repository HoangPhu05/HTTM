import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import AlertPanel from '../components/AlertPanel';

const THRESHOLDS = [
  { param: 'CO₂',      normal: '< 800 ppm',            warning: '800 – 1200 ppm',         danger: '> 1200 ppm'  },
  { param: 'PM2.5',    normal: '< 35 µg/m³',           warning: '35 – 75 µg/m³',          danger: '> 75 µg/m³'  },
  { param: 'Nhiệt độ', normal: '16 – 28 °C',           warning: '14 – 30 °C',             danger: '—'           },
  { param: 'Độ ẩm',    normal: '40 – 70 %',            warning: '< 40 % hoặc > 70 %',    danger: '—'           },
  { param: 'TVOC',     normal: '< 200 ppb',            warning: '200 – 400 ppb',          danger: '> 400 ppb'   },
  { param: 'CO',       normal: '< 4 ppm',              warning: '4 – 9 ppm',              danger: '> 9 ppm'     },
];

const RECOMMENDATIONS = [
  'Khi CO₂ vượt ngưỡng, tăng thông gió ngay để giảm nồng độ khí trong phòng.',
  'PM2.5 cao — bật quạt mạnh hơn và cân nhắc dùng máy lọc không khí.',
  'Duy trì độ ẩm trong khoảng 40–70% để đảm bảo sức khỏe và sự thoải mái.',
  'Lớp đông học sinh — tăng tần suất thông gió để kiểm soát CO₂ tích tụ.',
  'Kiểm tra và bảo trì hệ thống quạt, cảm biến theo định kỳ.',
];

export default function Alerts() {
  const [alerts,      setAlerts]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAlerts();
      setAlerts(res.data.alerts || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [fetchData]);

  const dangerCount  = alerts.filter((a) => a.status === 'danger').length;
  const warningCount = alerts.filter((a) => a.status === 'warning').length;

  const overallStatus = alerts.length === 0
    ? { label: 'Bình thường', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' }
    : dangerCount > 0
    ? { label: 'Nguy hiểm',   cls: 'bg-red-50 text-red-700',         dot: 'bg-red-500'     }
    : { label: 'Cảnh báo',    cls: 'bg-amber-50 text-amber-700',     dot: 'bg-amber-500'   };

  return (
    <div className="max-w-4xl mx-auto px-5 py-6 space-y-7 pb-14">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Hệ thống cảnh báo</h1>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-0.5">
              Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Tự động cập nhật
          </span>
          <button onClick={fetchData} className="btn btn-outline text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1.5">Tổng cảnh báo</p>
          <p className="num text-2xl font-semibold text-slate-900">{alerts.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1.5">Nguy hiểm</p>
          <p className="num text-2xl font-semibold text-red-600">{dangerCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1.5">Cảnh báo</p>
          <p className="num text-2xl font-semibold text-amber-600">{warningCount}</p>
        </div>
        <div className="card text-center flex flex-col items-center justify-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${overallStatus.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${overallStatus.dot}`} />
            {overallStatus.label}
          </div>
          <p className="text-xs text-slate-400">Trạng thái</p>
        </div>
      </div>

      {/* Alert list */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 mb-3">Chi tiết cảnh báo</h2>
        <AlertPanel alerts={alerts} loading={loading} />
      </section>

      {/* Threshold table */}
      <section className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Bảng ngưỡng tham chiếu</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Chỉ số</th>
                <th className="text-emerald-600">Bình thường</th>
                <th className="text-amber-600">Cảnh báo</th>
                <th className="text-red-600">Nguy hiểm</th>
              </tr>
            </thead>
            <tbody>
              {THRESHOLDS.map((row, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-700">{row.param}</td>
                  <td className="num text-xs text-emerald-700">{row.normal}</td>
                  <td className="num text-xs text-amber-700">{row.warning}</td>
                  <td className="num text-xs text-red-700">{row.danger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommendations */}
      <section className="card bg-slate-50/70">
        <p className="text-sm font-semibold text-slate-700 mb-4">Khuyến nghị xử lý</p>
        <ol className="space-y-3">
          {RECOMMENDATIONS.map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ol>
      </section>

    </div>
  );
}
