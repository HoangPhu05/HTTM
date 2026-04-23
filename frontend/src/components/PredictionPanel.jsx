import React, { useEffect, useState } from 'react';
import api, { apiClient } from '../services/api';

const asNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatNumber = (value, digits = 0, fallback = '--') => {
  const num = asNumber(value);
  return num == null ? fallback : num.toFixed(digits);
};

const diffNumber = (next, current, digits = 0) => {
  const nextNum = asNumber(next);
  const currentNum = asNumber(current) ?? 0;
  if (nextNum == null) return null;
  return Number((nextNum - currentNum).toFixed(digits));
};

const pickCurrentData = (payload) => payload?.data ?? payload ?? null;
const pickControlData = (payload) =>
  payload?.control ?? (
    payload?.ventilation_level != null || payload?.fan_status || payload?.explanation
      ? payload
      : null
  );

export default function PredictionPanel({ sharedPredicted, sharedCurrent, sharedHybrid }) {
  const [predictions, setPredictions] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [hybridDecision, setHybridDecision] = useState(null);
  const [loading, setLoading] = useState(true);

  // If Dashboard passes shared data, use it directly (keeps in sync with StatCards)
  useEffect(() => {
    if (sharedPredicted !== undefined) {
      setPredictions({ predicted_values: sharedPredicted, status: 'available' });
    }
    if (sharedCurrent !== undefined) {
      setCurrentData({ ...sharedCurrent });
    }
    if (sharedHybrid !== undefined) {
      setHybridDecision(sharedHybrid ? { ...sharedHybrid, status: 'available' } : null);
    }
    if (sharedPredicted !== undefined || sharedCurrent !== undefined) {
      setLoading(false);
    }
  }, [sharedPredicted, sharedCurrent, sharedHybrid]);

  // Only self-fetch when parent doesn't provide data
  useEffect(() => {
    if (sharedPredicted !== undefined && sharedCurrent !== undefined) return; // use props

    const fetchData = async () => {
      try {
        const [currentRes, predRes, hybridRes] = await Promise.all([
          apiClient.getCurrentData(),
          api.get('/predictions'),
          api.get('/hybrid-decision'),
        ]);

        const currentPayload = currentRes.data;
        setCurrentData({
          ...(pickCurrentData(currentPayload) || {}),
          control: pickControlData(currentPayload),
        });
        setPredictions(predRes.data);
        setHybridDecision(hybridRes.data);
      } catch (error) {
        console.error('Error fetching prediction panel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [sharedPredicted, sharedCurrent]);

  if (loading) {
    return <div className="text-center text-gray-500">Đang tải dự báo...</div>;
  }

  const current = currentData;
  const currentControl = current?.control;
  const predicted = predictions?.predicted_values;
  const hybridAvailable = hybridDecision?.status === 'available';

  const co2Diff = diffNumber(predicted?.CO2, current?.co2, 0);
  const pm25Diff = diffNumber(predicted?.['PM2.5'], current?.pm25, 1);
  const humidityDiff = diffNumber(predicted?.Humidity, current?.humidity, 0);
  const tempDiff = diffNumber(predicted?.Temperature, current?.temperature, 1);
  const occupancyDiff = diffNumber(predicted?.Occupancy_Count, current?.occupancy_count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-blue-600 mb-4">Tổng quan hiện tại</h3>

        {current && (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-semibold">CO2</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatNumber(current.co2, 0)} ppm
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="font-semibold">PM2.5</span>
              <span className="text-2xl font-bold text-red-600">
                {formatNumber(current.pm25, 1)} ug/m3
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-semibold">Độ ẩm</span>
              <span className="text-2xl font-bold text-green-600">
                {formatNumber(current.humidity, 0)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="font-semibold">Số người</span>
              <span className="text-2xl font-bold text-yellow-600">
                {current.occupancy_count ?? '--'} người
              </span>
            </div>
          </div>
        )}

        {currentControl && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">Thông gió hiện tại</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(currentControl.ventilation_level, 0)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Trạng thái quạt: {currentControl.fan_status || '--'}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-purple-600 mb-1">Dự báo sau 5 phút</h3>
        <p className="text-xs text-gray-400 mb-4">Khớp với 4 chỉ số chính ở trên</p>

        {predicted ? (
          <div className="space-y-3">
            {/* Nhiệt độ */}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="font-semibold">Nhiệt độ</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">
                  {formatNumber(predicted.Temperature, 1)} °C
                </span>
                {tempDiff != null && (
                  <span className={`text-sm font-bold ${tempDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {tempDiff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(tempDiff), 1)}
                  </span>
                )}
              </div>
            </div>

            {/* Độ ẩm */}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="font-semibold">Độ ẩm</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">
                  {formatNumber(predicted.Humidity, 1)}%
                </span>
                {humidityDiff != null && (
                  <span className={`text-sm font-bold ${humidityDiff > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                    {humidityDiff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(humidityDiff), 0)}
                  </span>
                )}
              </div>
            </div>

            {/* CO2 */}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="font-semibold">CO2</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">
                  {formatNumber(predicted.CO2, 0)} ppm
                </span>
                {co2Diff != null && (
                  <span className={`text-sm font-bold ${co2Diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {co2Diff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(co2Diff), 0)}
                  </span>
                )}
              </div>
            </div>

            {/* PM2.5 */}
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="font-semibold">PM2.5</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">
                  {formatNumber(predicted['PM2.5'], 1)} µg/m³
                </span>
                {pm25Diff != null && (
                  <span className={`text-sm font-bold ${pm25Diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {pm25Diff > 0 ? '↑' : '↓'}{formatNumber(Math.abs(pm25Diff), 1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6">Không có dữ liệu dự báo</div>
        )}

        {hybridAvailable && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">Thông gió dự báo</div>
            <div className="text-3xl font-bold text-purple-600">
              {formatNumber(hybridDecision.predicted_ventilation, 0)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {(asNumber(hybridDecision.predicted_ventilation) ?? 0) > (asNumber(hybridDecision.current_ventilation) ?? 0)
                ? 'Cần tăng thông gió'
                : 'Chất lượng không khí đang cải thiện'}
            </div>
          </div>
        )}
      </div>

      {hybridAvailable && (
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border-2 border-green-400">
          <h3 className="text-lg font-bold text-green-600 mb-4">Quyết định hybrid</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">Hiện tại</div>
              <div className="text-4xl font-bold text-blue-600">
                {formatNumber(hybridDecision.current_ventilation, 0)}%
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded flex flex-col justify-center">
              <div className="text-2xl">so với</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-sm text-gray-600">Dự báo</div>
              <div className="text-4xl font-bold text-purple-600">
                {formatNumber(hybridDecision.predicted_ventilation, 0)}%
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded border-2 border-green-300 mb-4">
            <div className="text-sm text-gray-600 mb-2">QUYẾT ĐỊNH CUỐI (MAX)</div>
            <div className="text-5xl font-bold text-green-600">
              {formatNumber(hybridDecision.final_decision, 0)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Chiến lược: ưu tiên mức thông gió an toàn hơn
            </div>
          </div>

          {hybridDecision.change_detected && hybridDecision.alert && (
            <div className="p-4 bg-red-50 rounded border-2 border-red-300 mb-4">
              <div className="text-lg font-bold text-red-600">
                {hybridDecision.alert}
              </div>
            </div>
          )}

          {hybridDecision.reasoning && (
            <div className="p-4 bg-yellow-50 rounded">
              <div className="text-sm font-bold text-gray-700 mb-2">Lý do</div>
              <div className="text-sm text-gray-700">
                {hybridDecision.reasoning}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
