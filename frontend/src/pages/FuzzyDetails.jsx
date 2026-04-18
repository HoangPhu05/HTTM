import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Header from '../components/Header';
import ControlOutput from '../components/ControlOutput';

const FuzzyDetails = () => {
  const [control, setControl] = useState(null);
  const [customInputs, setCustomInputs] = useState({
    co2: 800,
    pm25: 30,
    humidity: 55,
    occupancy: 20,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [applyControl, setApplyControl] = useState(true); // Always enabled
  const [isManualMode, setIsManualMode] = useState(true);

  useEffect(() => {
    // Fetch initial control data once, no auto-refresh
    fetchControl();
  }, []);

  const fetchControl = async () => {
    try {
      const response = await apiClient.getControlOutput();
      // Only update if in auto mode (not manual slider mode)
      if (!isManualMode) {
        setControl(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching control:', error);
    }
  };

  const handleInputChange = (e) => {
    setIsManualMode(true); // Enter manual mode when changing sliders
    const { name, value } = e.target;
    setCustomInputs(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleCustomFuzzyControl = async () => {
    try {
      const response = await apiClient.runFuzzyControl(
        customInputs.co2,
        customInputs.pm25,
        customInputs.humidity,
        customInputs.occupancy,
        applyControl
      );
      
      // Transform nested response to flat structure for ControlOutput
      const flatControl = {
        ventilation_level: response.data.output?.ventilation_level ?? 0,
        fan_status: response.data.output?.fan_status ?? 'Unknown',
        explanation: response.data.output?.explanation ?? '',
        fuzzification: response.data.fuzzification || {},
        active_rules: response.data.active_rules || [],
        rule_count: response.data.active_rules?.length || 0,
        applied_to_devices: response.data.applied_to_devices,
        device_states: response.data.device_states
      };
      
      setControl(flatControl);
      
      if (applyControl) {
        setMessage(`✅ Điều khiển thiết bị: Mức ${flatControl.ventilation_level.toFixed(0)}%`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error running fuzzy control:', error);
      setMessage('❌ Lỗi thực thi Fuzzy Control');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Header 
          title="🔧 Chi tiết Fuzzy Logic Control"
          subtitle="Phân tích chi tiết quá trình điều khiển"
        />

        {/* Custom Input Panel */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">🎯 Kiểm thử với giá trị tùy chỉnh</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CO2 (ppm)
              </label>
              <input
                type="range"
                name="co2"
                min="0"
                max="2000"
                value={customInputs.co2}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="text-center mt-1 font-bold text-blue-600">
                {customInputs.co2.toFixed(0)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PM2.5 (µg/m³)
              </label>
              <input
                type="range"
                name="pm25"
                min="0"
                max="200"
                value={customInputs.pm25}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="text-center mt-1 font-bold text-red-600">
                {customInputs.pm25.toFixed(1)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ ẩm (%)
              </label>
              <input
                type="range"
                name="humidity"
                min="0"
                max="100"
                value={customInputs.humidity}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="text-center mt-1 font-bold text-green-600">
                {customInputs.humidity.toFixed(0)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số người
              </label>
              <input
                type="range"
                name="occupancy"
                min="0"
                max="60"
                value={customInputs.occupancy}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="text-center mt-1 font-bold text-yellow-600">
                {parseInt(customInputs.occupancy)}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCustomFuzzyControl}
              className="flex-1 btn btn-primary"
            >
              ▶️ Chạy Fuzzy Control & Điều khiển Thiết bị
            </button>
          </div>

          {message && (
            <div className={`mt-3 p-3 rounded-lg text-center font-semibold ${
              message.startsWith('✅')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Control Output */}
        {control && (
          <ControlOutput control={control} loading={loading} />
        )}

        {/* Fuzzy Logic Explanation */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📚 Hướng dẫn Fuzzy Logic Control</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-bold text-blue-600 mb-2">1️⃣ Fuzzification (Mờ hóa)</h4>
              <p>
                Chuyển đổi các giá trị cảm biến thực (crisp values) thành các biến mờ (fuzzy values).
                Mỗi input được ánh xạ vào các tập mờ như "Low", "Medium", "High" với độ thành viên (membership).
              </p>
            </div>
            <div>
              <h4 className="font-bold text-green-600 mb-2">2️⃣ Rule Evaluation (Đánh giá luật)</h4>
              <p>
                Áp dụng các luật mờ được định nghĩa sẵn. Mỗi luật là một mệnh đề: 
                "Nếu CO2 cao VÀ PM2.5 cao THÌ mức thông gió = cao"
              </p>
            </div>
            <div>
              <h4 className="font-bold text-purple-600 mb-2">3️⃣ Defuzzification (Khử mờ)</h4>
              <p>
                Chuyển đổi kết quả mờ từ các luật trở lại giá trị cụ thể (crisp value).
                Sử dụng phương pháp Centroid để tính mức thông gió cuối cùng (0-100).
              </p>
            </div>
          </div>
        </div>

        {/* Rule Base */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📋 Cơ sở luật (Rule Base)</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-medium">Luật 1:</div>
              <div className="text-sm text-gray-700">
                Nếu (CO2 cao HOẶC PM2.5 cao) &rarr; Ventilation = High
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-medium">Luật 2:</div>
              <div className="text-sm text-gray-700">
                Nếu (CO2 trung bình VÀ Độ ẩm cao) &rarr; Ventilation = Medium
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-medium">Luật 3:</div>
              <div className="text-sm text-gray-700">
                Nếu (CO2 thấp VÀ PM2.5 thấp VÀ Số người thấp) &rarr; Ventilation = Low
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-medium">Luật 4:</div>
              <div className="text-sm text-gray-700">
                Nếu Số người cao &rarr; Ventilation = High
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-medium">Luật 5:</div>
              <div className="text-sm text-gray-700">
                Nếu PM2.5 cao &rarr; Ventilation = High
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-medium">Luật 6:</div>
              <div className="text-sm text-gray-700">
                Nếu (CO2 trung bình HOẶC Số người trung bình) &rarr; Ventilation = Medium
              </div>
            </div>
          </div>
        </div>

        {/* Membership Functions */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">📊 Membership Functions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">CO2 (0-2000 ppm)</h4>
              <ul className="text-sm space-y-1">
                <li>🟢 Low: 0-800 ppm</li>
                <li>🟡 Medium: 600-1800 ppm</li>
                <li>🔴 High: 1000-2000 ppm</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">PM2.5 (0-200 µg/m³)</h4>
              <ul className="text-sm space-y-1">
                <li>🟢 Low: 0-35 µg/m³</li>
                <li>🟡 Medium: 25-100 µg/m³</li>
                <li>🔴 High: 75-200 µg/m³</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Humidity (0-100%)</h4>
              <ul className="text-sm space-y-1">
                <li>🟢 Low: 0-40%</li>
                <li>🟡 Normal: 35-70%</li>
                <li>🔴 High: 65-100%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Occupancy (0-60 people)</h4>
              <ul className="text-sm space-y-1">
                <li>🟢 Low: 0-15 người</li>
                <li>🟡 Medium: 10-45 người</li>
                <li>🔴 High: 35-60 người</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuzzyDetails;
