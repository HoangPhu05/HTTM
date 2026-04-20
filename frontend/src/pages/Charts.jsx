import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import Chart from '../components/Chart';

const PARAMETERS = [
  { id: 'co2',         label: 'CO2',       unit: 'ppm',    icon: '☁️', color: 'text-blue-600',   activeBg: 'bg-blue-500'   },
  { id: 'pm25',        label: 'PM2.5',     unit: 'µg/m³',  icon: '💨', color: 'text-red-500',    activeBg: 'bg-red-500'    },
  { id: 'temperature', label: 'Nhiệt độ',  unit: '°C',     icon: '🌡️', color: 'text-amber-500',  activeBg: 'bg-amber-500'  },
  { id: 'humidity',    label: 'Độ ẩm',     unit: '%',      icon: '💧', color: 'text-emerald-500',activeBg: 'bg-emerald-500'},
];

const RANGES = [
  { id: '10',  label: '10 mẫu'  },
  { id: '20',  label: '20 mẫu'  },
  { id: '50',  label: '50 mẫu'  },
  { id: 'all', label: 'Tất cả'  },
];

const Charts = () => {
  const [data, setData]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [dataRange, setDataRange]         = useState('20');
  const [selectedParams, setSelectedParams] = useState(['co2', 'pm25']);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = dataRange === 'all'
        ? await apiClient.getAllData()
        : await apiClient.getDataHistory(parseInt(dataRange));
      setData(response.data.records || []);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  }, [dataRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = (id) =>
    setSelectedParams(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );

  const chartTitle = selectedParams
    .map(id => PARAMETERS.find(p => p.id === id)?.label)
    .filter(Boolean)
    .join(' & ');

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Biểu đồ Dữ liệu</h1>
          <button onClick={fetchData} className="btn btn-ghost border border-slate-200 text-sm">
            ↻ Làm mới
          </button>
        </div>

        {/* Controls card */}
        <div className="card space-y-5">
          {/* Range selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Phạm vi dữ liệu
            </p>
            <div className="flex flex-wrap gap-2">
              {RANGES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setDataRange(r.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    dataRange === r.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter toggle */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Chọn chỉ số hiển thị
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PARAMETERS.map(p => {
                const active = selectedParams.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      active
                        ? `${p.activeBg} text-white border-transparent`
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{p.icon}</span>
                    <span className="flex-1 text-left">{p.label}</span>
                    <span className={`text-xs ${active ? 'text-white/70' : 'text-slate-400'}`}>{p.unit}</span>
                  </button>
                );
              })}
            </div>
            {selectedParams.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">Chọn ít nhất một chỉ số để hiển thị biểu đồ.</p>
            )}
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="card h-80 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-sm">Đang tải dữ liệu…</p>
          </div>
        ) : data.length > 0 && selectedParams.length > 0 ? (
          <Chart data={data} parameters={selectedParams} title={chartTitle} />
        ) : (
          <div className="card h-80 flex items-center justify-center text-slate-400 text-sm">
            {selectedParams.length === 0 ? 'Vui lòng chọn ít nhất một chỉ số' : 'Không có dữ liệu'}
          </div>
        )}

        {/* Stats summary */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PARAMETERS.filter(p => selectedParams.includes(p.id)).map(p => {
              const vals = data.map(d => d[p.id]).filter(v => v != null);
              const min  = Math.min(...vals).toFixed(1);
              const max  = Math.max(...vals).toFixed(1);
              const avg  = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
              return (
                <div key={p.id} className="card">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span>{p.icon}</span>
                    <span className={`text-xs font-semibold ${p.color}`}>{p.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {[['Min', min], ['TB', avg], ['Max', max]].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-xs text-slate-400">{l}</p>
                        <p className="text-sm font-bold text-slate-700">{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 text-right mt-1">{p.unit}</p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Charts;
