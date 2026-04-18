import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Header from '../components/Header';
import AlertPanel from '../components/AlertPanel';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsRes, currentRes] = await Promise.all([
          apiClient.getAlerts(),
          apiClient.getCurrentData(),
        ]);
        
        setAlerts(alertsRes.data.alerts || []);
        setCurrentData(currentRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Header 
          title="⚠️ Hệ thống Cảnh báo"
          subtitle="Theo dõi các chỉ số vượt ngưỡng"
        />

        {/* Summary */}
        {currentData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <div className="text-sm text-gray-600">Tông số cảnh báo</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{alerts.length}</div>
            </div>
            <div className="card bg-red-50">
              <div className="text-sm text-gray-600">Mức nguy hiểm</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {alerts.filter(a => a.status === 'danger').length}
              </div>
            </div>
            <div className="card bg-yellow-50">
              <div className="text-sm text-gray-600">Mức cảnh báo</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">
                {alerts.filter(a => a.status === 'warning').length}
              </div>
            </div>
            <div className="card bg-green-50">
              <div className="text-sm text-gray-600">Trạng thái</div>
              <div className="text-lg font-bold text-green-600 mt-2">
                {alerts.length === 0 ? '✅ Bình thường' : '⚠️ Có cảnh báo'}
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết cảnh báo</h2>
          <AlertPanel alerts={alerts} loading={loading} />
        </div>

        {/* Threshold Info */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📋 Thông tin ngưỡng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-green-700 mb-3">✅ Bình thường</h4>
              <ul className="space-y-2 text-sm">
                <li>• CO2: &lt; 800 ppm</li>
                <li>• PM2.5: &lt; 35 µg/m³</li>
                <li>• Độ ẩm: 40 - 70 %</li>
                <li>• Nhiệt độ: 16 - 28 °C</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-yellow-700 mb-3">⚠️ Cảnh báo</h4>
              <ul className="space-y-2 text-sm">
                <li>• CO2: 800 - 1200 ppm</li>
                <li>• PM2.5: 35 - 75 µg/m³</li>
                <li>• Độ ẩm: &lt; 40% hoặc &gt; 70%</li>
                <li>• Nhiệt độ: 14  -30 °C</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-red-700 mb-3">🔴 Nguy hiểm</h4>
              <ul className="space-y-2 text-sm">
                <li>• CO2: &gt; 1200 ppm</li>
                <li>• PM2.5: &gt; 75 µg/m³</li>
                <li>• TVOC: &gt; 400 ppb</li>
                <li>• CO: &gt; 9 ppm</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card border-l-4 border-l-blue-500 bg-blue-50">
          <h3 className="text-lg font-bold mb-4">💡 Khuyến nghị</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Khi có cảnh báo CO2, tăng thông gió để giảm nồng độ CO2</li>
            <li>• Nếu PM2.5 cao, sử dụng quạt và máy lọc không khí</li>
            <li>• Duy trì độ ẩm 40-70% để thoải mái nhất</li>
            <li>• Thường xuyên kiểm tra và bảo trì hệ thống thông gió</li>
            <li>• Tăng số lần thông gió khi lớp học đông người</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
