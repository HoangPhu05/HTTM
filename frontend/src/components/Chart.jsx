import React from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const PARAM_CONFIG = {
  co2:         { color: '#2563eb', label: 'CO₂ (ppm)' },
  pm25:        { color: '#dc2626', label: 'PM2.5 (µg/m³)' },
  temperature: { color: '#d97706', label: 'Nhiệt độ (°C)' },
  humidity:    { color: '#059669', label: 'Độ ẩm (%)' },
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return isNaN(d) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const ts = payload[0]?.payload?.timestamp;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-lg p-3 text-sm min-w-[140px]">
      {ts && (
        <p className="text-xs text-slate-400 mb-2 font-medium">{formatTime(ts)}</p>
      )}
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-500 text-xs">{entry.name.split(' ')[0]}</span>
          </div>
          <span className="num font-semibold text-slate-800 text-xs">
            {Number(entry.value).toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Chart({ data, parameters = ['co2', 'pm25'], title }) {
  if (!data || data.length === 0) {
    return (
      <div className="card h-72 flex items-center justify-center text-slate-400 text-sm">
        Không có dữ liệu
      </div>
    );
  }

  const chartData = data.map((item) => ({
    timestamp:   item.timestamp,
    co2:         item.co2,
    pm25:        item.pm25,
    temperature: item.temperature,
    humidity:    item.humidity,
  }));

  const tickInterval = Math.max(1, Math.floor(chartData.length / 8));

  return (
    <div className="card">
      {title && (
        <p className="text-sm font-semibold text-slate-700 mb-4">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={288}>
        <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 2, left: -8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'inherit' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#64748b' }}
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
                strokeWidth={1.75}
                activeDot={{ r: 3.5, strokeWidth: 0 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
