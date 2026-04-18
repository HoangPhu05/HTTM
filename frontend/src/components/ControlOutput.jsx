import React from 'react';

const ControlOutput = ({ control, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!control) {
    return <div className="card">Chưa có dữ liệu điều khiển</div>;
  }

  const getFanColor = () => {
    switch(control.fan_status) {
      case 'Off': return 'bg-gray-200';
      case 'Low': return 'bg-blue-300';
      case 'Medium': return 'bg-yellow-300';
      case 'High': return 'bg-red-400';
      default: return 'bg-gray-200';
    }
  };

  const getFanIcon = () => {
    switch(control.fan_status) {
      case 'Off': return '🔴 Tắt';
      case 'Low': return '🟢 Mức thấp';
      case 'Medium': return '🟡 Mức trung bình';
      case 'High': return '🔴 Mức cao';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Ventilation Level Display */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Mức thông gió hiện tại</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-8 rounded-full transition-all"
                style={{ width: `${control.ventilation_level}%` }}
              />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-600">
              {(control?.ventilation_level ?? 0).toFixed(1)}/100
            </div>
          </div>
          <div className={`${getFanColor()} rounded-lg p-6 text-center min-w-max`}>
            <div className="text-3xl mb-2">🌀</div>
            <div className="font-bold">{getFanIcon()}</div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="card border-l-4 border-l-blue-500">
        <h3 className="text-lg font-bold mb-2">Giải thích quyết định</h3>
        <p className="text-gray-700 leading-relaxed">
          {control.explanation}
        </p>
      </div>

      {/* Active Rules */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Luật đang kích hoạt ({control.rule_count})</h3>
        <div className="space-y-2">
          {control.active_rules && control.active_rules.length > 0 ? (
            control.active_rules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">
                  {rule.output} (Độ mạnh: {((rule?.strength ?? 0) * 100).toFixed(0)}%)
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${rule.strength * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Không có luật nào được kích hoạt</p>
          )}
        </div>
      </div>

      {/* Fuzzification Details */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Chi tiết Fuzzification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {control.fuzzification && (
            <>
              {/* CO2 */}
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-medium text-sm text-gray-700 mb-2">CO2</div>
                <div className="space-y-1 text-xs">
                  {control.fuzzification.co2 && Object.entries(control.fuzzification.co2).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="font-mono">{((val ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM2.5 */}
              <div className="p-3 bg-red-50 rounded">
                <div className="font-medium text-sm text-gray-700 mb-2">PM2.5</div>
                <div className="space-y-1 text-xs">
                  {control.fuzzification.pm25 && Object.entries(control.fuzzification.pm25).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="font-mono">{((val ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Humidity */}
              <div className="p-3 bg-green-50 rounded">
                <div className="font-medium text-sm text-gray-700 mb-2">Độ ẩm</div>
                <div className="space-y-1 text-xs">
                  {control.fuzzification.humidity && Object.entries(control.fuzzification.humidity).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="font-mono">{((val ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupancy */}
              <div className="p-3 bg-yellow-50 rounded">
                <div className="font-medium text-sm text-gray-700 mb-2">Số người</div>
                <div className="space-y-1 text-xs">
                  {control.fuzzification.occupancy && Object.entries(control.fuzzification.occupancy).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="font-mono">{((val ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlOutput;
