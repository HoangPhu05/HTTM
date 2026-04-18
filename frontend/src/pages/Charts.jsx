import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Chart from '../components/Chart';
import Header from '../components/Header';

const Charts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataRange, setDataRange] = useState('20');
  const [selectedParams, setSelectedParams] = useState(['co2', 'pm25']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        if (dataRange === 'all') {
          response = await apiClient.getAllData();
        } else {
          response = await apiClient.getDataHistory(parseInt(dataRange));
        }
        setData(response.data.records || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataRange]);

  const parameters = [
    { id: 'co2', label: 'CO2 (ppm)', icon: '☁️' },
    { id: 'pm25', label: 'PM2.5 (µg/m³)', icon: '💨' },
    { id: 'temperature', label: 'Nhiệt độ (°C)', icon: '🌡️' },
    { id: 'humidity', label: 'Độ ẩm (%)', icon: '💧' },
  ];

  const toggleParameter = (param) => {
    setSelectedParams(prev =>
      prev.includes(param)
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header 
          title="📈 Biểu đồ Dữ liệu"
          subtitle="Theo dõi xu hướng các chỉ số môi trường"
        />

        {/* Controls */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Cài đặt</h3>
          
          {/* Data Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phạm vi dữ liệu
            </label>
            <div className="flex space-x-3">
              {['10', '20', '50', 'all'].map(range => (
                <button
                  key={range}
                  onClick={() => setDataRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dataRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range === 'all' ? 'Tất cả' : `${range} mẫu`}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn chỉ số
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {parameters.map(param => (
                <button
                  key={param.id}
                  onClick={() => toggleParameter(param.id)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedParams.includes(param.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span className="text-xl block mb-1">{param.icon}</span>
                  {param.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="card h-96 flex items-center justify-center">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
        ) : data.length > 0 ? (
          <div className="space-y-6">
            <Chart 
              data={data}
              parameters={selectedParams}
              title={`Biểu đồ ${selectedParams.map(p => 
                parameters.find(x => x.id === p)?.label
              ).join(', ')}`}
            />
          </div>
        ) : (
          <div className="card h-96 flex items-center justify-center">
            <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;
