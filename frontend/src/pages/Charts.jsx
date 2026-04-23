import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import Chart from '../components/Chart';

const PARAMETERS = [
  { id: 'co2',         label: 'CO₂',      unit: 'ppm',    dotColor: 'bg-blue-600'    },
  { id: 'pm25',        label: 'PM2.5',    unit: 'µg/m³',  dotColor: 'bg-red-600'     },
  { id: 'temperature', label: 'Nhiệt độ', unit: '°C',     dotColor: 'bg-amber-500'   },
  { id: 'humidity',    label: 'Độ ẩm',    unit: '%',      dotColor: 'bg-emerald-600' },
];

const RANGES = [
  { id: '10',  label: '10 mẫu'  },
  { id: '20',  label: '20 mẫu'  },
  { id: '50',  label: '50 mẫu'  },
  { id: 'all', label: 'Tất cả'  },
];

export default function Charts() {
  const [data,           setData]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [dataRange,      setDataRange]      = useState('20');
  const [selectedParams, setSelectedParams] = useState(['co2', 'pm25']);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = dataRange === 'all'
        ? await apiClient.getAllData()
        : await apiClient.getDataHistory(parseInt(dataRange));
      setData(res.data.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dataRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = (id) =>
    setSelectedParams((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const chartTitle = selectedParams
    .map((id) => PARAMETERS.find((p) => p.id === id)?.label)
    .filter(Boolean)
    .join(' & ');

  return (
    <div className="max-w-7xl mx-auto px-5 py-6 space-y-6 pb-14">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Biểu đồ dữ liệu</h1>
        <button onClick={fetchData} className="btn btn-outline text-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Controls */}
      <div className="card space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2.5">Phạm vi dữ liệu</p>
          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setDataRange(r.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  dataRange === r.id
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2.5">Chỉ số hiển thị</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PARAMETERS.map((p) => {
              const active = selectedParams.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? 'bg-white/70' : p.dotColor}`} />
                  <span className="flex-1 text-left">{p.label}</span>
                  <span className={`text-xs ${active ? 'text-white/60' : 'text-slate-400'}`}>{p.unit}</span>
                </button>
              );
            })}
          </div>
          {selectedParams.length === 0 && (
            <p className="text-xs text-amber-600 mt-2">Chọn ít nhất một chỉ số để hiển thị.</p>
          )}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="card h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm">Đang tải dữ liệu…</p>
        </div>
      ) : data.length > 0 && selectedParams.length > 0 ? (
        <Chart data={data} parameters={selectedParams} title={chartTitle} />
      ) : (
        <div className="card h-72 flex items-center justify-center text-slate-400 text-sm">
          {selectedParams.length === 0 ? 'Chọn ít nhất một chỉ số để hiển thị' : 'Không có dữ liệu'}
        </div>
      )}

      {/* Stats summary */}
      {!loading && data.length > 0 && selectedParams.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3">Thống kê trong khoảng đã chọn</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PARAMETERS.filter((p) => selectedParams.includes(p.id)).map((p) => {
              const vals = data.map((d) => d[p.id]).filter((v) => v != null);
              if (!vals.length) return null;
              const min = Math.min(...vals).toFixed(1);
              const max = Math.max(...vals).toFixed(1);
              const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
              return (
                <div key={p.id} className="card-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.dotColor}`} />
                    <span className="text-xs font-semibold text-slate-700">{p.label}</span>
                    <span className="text-xs text-slate-400 ml-auto">{p.unit}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {[['Min', min], ['Trung bình', avg], ['Max', max]].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-xs text-slate-400 mb-1">{lbl}</p>
                        <p className="num text-sm font-semibold text-slate-800">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
