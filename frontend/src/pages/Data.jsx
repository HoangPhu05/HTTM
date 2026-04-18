import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Header from '../components/Header';

const Data = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAllData();
        setData(response.data.records || []);
        setFilteredData(response.data.records || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = data.filter(record => 
        record.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  // Pagination
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedData = filteredData.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Temperature', 'Humidity', 'CO2', 'PM2.5', 'PM10', 'TVOC', 'CO', 'Occupancy', 'Ventilation'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(record =>
        [
          record.timestamp,
          record.temperature.toFixed(2),
          record.humidity.toFixed(2),
          record.co2.toFixed(2),
          record.pm25.toFixed(2),
          record.pm10.toFixed(2),
          record.tvoc.toFixed(2),
          record.co.toFixed(2),
          record.occupancy_count,
          record.ventilation_status
        ].join(',')
      )
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `air-quality-data-${new Date().toISOString().slice(0, 10)}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header 
          title="📋 Dữ liệu Chi tiết"
          subtitle="Bảng dữ liệu đầy đủ từ hệ thống"
        />

        {/* Controls */}
        <div className="card space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Tìm kiếm theo thời gian
              </label>
              <input
                type="text"
                placeholder="Nhập thời gian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Dòng trên trang
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="btn btn-secondary"
            >
              💾 Xuất CSV
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600">Tổng bản ghi</div>
              <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Bản ghi hiển thị</div>
              <div className="text-2xl font-bold text-green-600">{filteredData.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Trang hiện tại</div>
              <div className="text-2xl font-bold text-purple-600">{currentPage}/{totalPages}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card h-64 flex items-center justify-center">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
        ) : paginatedData.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Thời gian</th>
                  <th className="px-4 py-3 text-right font-bold">Nhiệt độ (°C)</th>
                  <th className="px-4 py-3 text-right font-bold">Độ ẩm (%)</th>
                  <th className="px-4 py-3 text-right font-bold">CO2 (ppm)</th>
                  <th className="px-4 py-3 text-right font-bold">PM2.5 (µg/m³)</th>
                  <th className="px-4 py-3 text-right font-bold">PM10 (µg/m³)</th>
                  <th className="px-4 py-3 text-right font-bold">TVOC (ppb)</th>
                  <th className="px-4 py-3 text-right font-bold">CO (ppm)</th>
                  <th className="px-4 py-3 text-right font-bold">Số người</th>
                  <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((record, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                  >
                    <td className="px-4 py-3 text-gray-800">{record.timestamp}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.temperature.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.humidity.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.co2.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.pm25.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.pm10.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.tvoc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.co.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono">{record.occupancy_count}</td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className={`badge ${
                        record.ventilation_status === 'Open' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {record.ventilation_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card h-64 flex items-center justify-center">
            <p className="text-gray-500">Không tìm thấy dữ liệu</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`btn ${currentPage === 1 ? 'bg-gray-300 text-gray-500' : 'btn-primary'}`}
            >
              ◀️ Trước
            </button>

            <div className="space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`btn ${currentPage === totalPages ? 'bg-gray-300 text-gray-500' : 'btn-primary'}`}
            >
              Sau ▶️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Data;
