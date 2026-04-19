import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PARAM_CONFIG = {
  co2:         { color: '#3b82f6', label: 'CO2 (ppm)' },
  pm25:        { color: '#ef4444', label: 'PM2.5 (µg/m³)' },
  temperature: { color: '#f59e0b', label: 'Nhiệt độ (°C)' },
  humidity:    { color: '#10b981', label: 'Độ ẩm (%)' },
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const ts = payload[0]?.payload?.timestamp;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      {ts && <p className="text-slate-500 text-xs mb-1.5">{formatTime(ts)}</p>}
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-800">{Number(entry.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

const Chart = ({ data, parameters = ['co2', 'pm25'], title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card h-80 flex items-center justify-center text-slate-400">
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  const chartData = data.map((item) => ({
    timestamp: item.timestamp,
    co2:         item.co2,
    pm25:        item.pm25,
    temperature: item.temperature,
    humidity:    item.humidity,
  }));

  // Show max 10 ticks on X axis
  const tickInterval = Math.max(1, Math.floor(chartData.length / 10));

  return (
    <div className="card fade-in">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {parameters.map((p) => {
            const cfg = PARAM_CONFIG[p];
            if (!cfg) return null;
            return (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={cfg.color}
                name={cfg.label}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
