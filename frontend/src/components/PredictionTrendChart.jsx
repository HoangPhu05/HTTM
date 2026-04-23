import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiClient } from '../services/api';

const REFRESH_MS = 5000;
const MAX_POINTS = 12;

const METRICS = [
  { key: 'temperature', apiKey: 'Temperature', label: 'Nhiệt độ', unit: '°C', color: '#f97316', digits: 1 },
  { key: 'humidity', apiKey: 'Humidity', label: 'Độ ẩm', unit: '%', color: '#14b8a6', digits: 0 },
  { key: 'co2', apiKey: 'CO2', label: 'CO2', unit: 'ppm', color: '#2563eb', digits: 0 },
  { key: 'pm25', apiKey: 'PM2.5', label: 'PM2.5', unit: 'µg/m³', color: '#dc2626', digits: 1 },
];

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const buildRenderableSeries = (points) => {
  if (points.length !== 1) return points;

  const onlyPoint = points[0];
  const nextTime = new Date(onlyPoint.timestamp).getTime() + REFRESH_MS;

  return [
    onlyPoint,
    {
      ...onlyPoint,
      timestamp: new Date(nextTime).toISOString(),
    },
  ];
};

const formatClock = (value) =>
  new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 min-w-[180px]">
      <p className="text-[11px] text-slate-400 mb-2">{formatClock(label)}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const metric = METRICS.find((item) => item.key === entry.dataKey);
          const digits = metric?.digits ?? 1;
          const unit = metric?.unit ?? '';

          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
                <span className="text-slate-500">{entry.name}</span>
              </div>
              <span className="num font-semibold text-slate-800">
                {Number(entry.value).toFixed(digits)} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PredictionTrendChart({ autoRefresh = true }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPredictedAt, setLastPredictedAt] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchPrediction = async () => {
      try {
        const res = await apiClient.getPredictions();
        const predicted = res.data?.predicted_values;
        if (!predicted || !alive) return;

        const now = new Date();
        const point = { timestamp: now.toISOString() };

        METRICS.forEach((metric) => {
          point[metric.key] = toNumber(predicted[metric.apiKey]);
        });

        setSeries((prev) => [...prev, point].slice(-MAX_POINTS));
        setLastPredictedAt(now);
      } catch (error) {
        console.error('Error loading prediction trend:', error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchPrediction();
    if (!autoRefresh) {
      return () => {
        alive = false;
      };
    }

    const id = setInterval(fetchPrediction, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [autoRefresh]);

  const latestPoint = series[series.length - 1] || null;
  const chartSeries = buildRenderableSeries(series);

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-sm font-semibold text-slate-800">Biểu đồ dự đoán 4 chỉ số chính</p>
          <p className="text-xs text-slate-500 mt-1">
            Một biểu đồ gồm 4 đường dự báo, cập nhật prediction mới sau mỗi 5 giây
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {autoRefresh ? 'Đang cập nhật 5 giây/lần' : 'Tạm dừng cập nhật'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {lastPredictedAt ? `Lần cuối ${formatClock(lastPredictedAt)}` : 'Đang tải dữ liệu'}
          </p>
        </div>
      </div>

      {loading && series.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-72 w-full" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          {latestPoint && (
            <div className="flex flex-wrap gap-2 mb-4">
              {METRICS.map((metric) => (
                <span
                  key={metric.key}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span>{metric.label}:</span>
                  <span className="num font-semibold text-slate-800">
                    {latestPoint[metric.key] == null ? '--' : latestPoint[metric.key].toFixed(metric.digits)} {metric.unit}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="h-80 -ml-2">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartSeries} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatClock}
                  minTickGap={24}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#475569' }}
                />
                {METRICS.map((metric) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={2.25}
                    dot={{ r: 2.5, strokeWidth: 0, fill: metric.color }}
                    activeDot={{ r: 4, strokeWidth: 0, fill: metric.color }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}
