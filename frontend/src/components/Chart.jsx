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

const Chart = ({ data, parameters = ['co2', 'pm25'], title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card h-96 flex items-center justify-center">
        <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Prepare data  
  const chartData = data.map((item, idx) => ({
    name: idx,
    timestamp: item.timestamp,
    co2: item.co2,
    pm25: item.pm25,
    temperature: item.temperature,
    humidity: item.humidity,
  }));

  const colors = {
    co2: '#3b82f6',
    pm25: '#ef4444',
    temperature: '#f59e0b',
    humidity: '#10b981',
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
            formatter={(value) => value.toFixed(2)}
          />
          <Legend />
          {parameters.includes('co2') && (
            <Line type="monotone" dataKey="co2" stroke={colors.co2} name="CO2 (ppm)" dot={false} />
          )}
          {parameters.includes('pm25') && (
            <Line type="monotone" dataKey="pm25" stroke={colors.pm25} name="PM2.5 (µg/m³)" dot={false} />
          )}
          {parameters.includes('temperature') && (
            <Line type="monotone" dataKey="temperature" stroke={colors.temperature} name="Nhiệt độ (°C)" dot={false} />
          )}
          {parameters.includes('humidity') && (
            <Line type="monotone" dataKey="humidity" stroke={colors.humidity} name="Độ ẩm (%)" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
