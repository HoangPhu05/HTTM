import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function IoTControl() {
  const [devices, setDevices] = useState({
    fan: false,
    door: false,
    light: false
  });
  
  const [fanSpeed, setFanSpeed] = useState(0);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Fetch device status
  useEffect(() => {
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchDeviceStatus = async () => {
    try {
      const response = await api.get('/api/devices/status');
      setDevices(response.data.devices);
      setMqttConnected(response.data.mqtt_connected);
    } catch (error) {
      console.error('Error fetching device status:', error);
    }
  };
  
  const controlFan = async (speed) => {
    setLoading(true);
    try {
      const response = await api.post(`/api/devices/fan/control?speed=${speed}`);
      if (response.data.success) {
        setFanSpeed(speed);
        setMessage(`Quạt: ${speed}%`);
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      setMessage('Lỗi điều khiển quạt');
    } finally {
      setLoading(false);
    }
  };
  
  const controlDoor = async (open) => {
    setLoading(true);
    try {
      const response = await api.post(`/api/devices/door/control?open=${open}`);
      if (response.data.success) {
        setMessage(`Cửa: ${open ? 'Mở' : 'Đóng'}`);
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      setMessage('Lỗi điều khiển cửa');
    } finally {
      setLoading(false);
    }
  };
  
  const controlLight = async (on) => {
    setLoading(true);
    try {
      const response = await api.post(`/api/devices/light/control?on=${on}`);
      if (response.data.success) {
        setMessage(`Đèn: ${on ? 'Bật' : 'Tắt'}`);
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (error) {
      setMessage('Lỗi điều khiển đèn');
    } finally {
      setLoading(false);
    }
  };
  
  const activateAutoControl = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/devices/auto-control');
      if (response.data.status === 'activated') {
        setMessage(`Tự động: Mức ${Math.round(response.data.ventilation_level)}%`);
        setFanSpeed(response.data.ventilation_level);
        setTimeout(() => setMessage(''), 3000);
        fetchDeviceStatus();
      }
    } catch (error) {
      setMessage('Lỗi kích hoạt tự động');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          🏠 Điều khiển Thiết bị IoT
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          mqttConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-green-600' : 'bg-red-600'}`} />
          <span className="text-sm font-medium">
            {mqttConnected ? 'MQTT Kết nối' : 'MQTT Ngắt'}
          </span>
        </div>
      </div>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* FAN Control */}
        <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            💨 Quạt
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tốc độ:</span>
              <span className="text-lg font-bold text-blue-600">{fanSpeed}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fanSpeed}
              onChange={(e) => setFanSpeed(parseInt(e.target.value))}
              onMouseUp={(e) => controlFan(parseInt(e.target.value))}
              className="w-full"
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                onClick={() => controlFan(0)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
              >
                Tắt
              </button>
              <button
                onClick={() => controlFan(50)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition disabled:opacity-50"
              >
                50%
              </button>
              <button
                onClick={() => controlFan(100)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
              >
                Max
              </button>
            </div>
          </div>
        </div>
        
        {/* DOOR Control */}
        <div className="border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-amber-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🚪 Cửa
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Trạng thái: {devices.door ? '✅ Mở' : '❌ Đóng'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => controlDoor(false)}
              disabled={loading || !devices.door}
              className={`flex-1 px-4 py-2 rounded transition ${
                devices.door
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-300 text-gray-500'
              } disabled:opacity-50`}
            >
              Đóng
            </button>
            <button
              onClick={() => controlDoor(true)}
              disabled={loading || devices.door}
              className={`flex-1 px-4 py-2 rounded transition ${
                !devices.door
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500'
              } disabled:opacity-50`}
            >
              Mở
            </button>
          </div>
        </div>
        
        {/* LIGHT Control */}
        <div className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            💡 Đèn
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Trạng thái: {devices.light ? '✅ Bật' : '❌ Tắt'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => controlLight(false)}
              disabled={loading || !devices.light}
              className={`flex-1 px-4 py-2 rounded transition ${
                devices.light
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-gray-300 text-gray-500'
              } disabled:opacity-50`}
            >
              Tắt
            </button>
            <button
              onClick={() => controlLight(true)}
              disabled={loading || devices.light}
              className={`flex-1 px-4 py-2 rounded transition ${
                !devices.light
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-300 text-gray-500'
              } disabled:opacity-50`}
            >
              Bật
            </button>
          </div>
        </div>
      </div>
      
      {/* Auto Control Button */}
      <button
        onClick={activateAutoControl}
        disabled={loading || !mqttConnected}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🤖 Kích hoạt Tự động Điều khiển
      </button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        {mqttConnected
          ? '✅ Kết nối MQTT thành công - Thiết bị sẵn sàng'
          : '⚠️ Chưa kết nối MQTT - Hãy kiểm tra cấu hình'}
      </p>
    </div>
  );
}
