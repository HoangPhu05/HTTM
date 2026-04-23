import React from 'react';

const FAN_LABEL = { Off: 'Dừng', Low: 'Thấp', Medium: 'Vừa', High: 'Cao' };
const FAN_STYLE = {
  Off:    'bg-slate-100 text-slate-600',
  Low:    'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High:   'bg-red-100 text-red-700',
};
const barColor = (v) => v < 30 ? 'bg-emerald-500' : v < 65 ? 'bg-amber-500' : 'bg-red-500';

function Sk({ h = 'h-4', w = 'w-full' }) {
  return <div className={`skeleton ${h} ${w}`} />;
}

export default function ControlOutput({ control, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card space-y-3">
          <Sk h="h-3" w="w-1/3" />
          <Sk h="h-2.5" />
          <Sk h="h-3" w="w-1/4" />
        </div>
        <div className="card space-y-2.5">
          <Sk h="h-3" w="w-2/5" />
          <Sk h="h-3.5" />
          <Sk h="h-3.5" w="w-5/6" />
        </div>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="card py-10 text-center text-sm text-slate-400">
        Chưa có dữ liệu điều khiển
      </div>
    );
  }

  const level     = control.ventilation_level ?? 0;
  const fanStyle  = FAN_STYLE[control.fan_status] ?? FAN_STYLE.Off;
  const fanLabel  = FAN_LABEL[control.fan_status] ?? 'Không rõ';

  return (
    <div className="space-y-3 fade-in">
      {/* Fan level card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Mức thông gió</p>
          <span className={`badge text-xs font-semibold px-2.5 py-1 rounded-full ${fanStyle}`}>
            Quạt — {fanLabel}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
          <div
            className={`h-2 rounded-full progress-bar ${barColor(level)}`}
            style={{ width: `${Math.min(100, level)}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">0%</span>
          <span className="num text-xs font-semibold text-slate-700">{level.toFixed(1)}%</span>
          <span className="text-xs text-slate-400">100%</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="card bg-slate-50/80 border-slate-200">
        <p className="text-xs text-slate-400 mb-1.5">Lý do quyết định</p>
        <p className="text-sm text-slate-700 leading-relaxed">{control.explanation}</p>
      </div>

      {/* Active rules */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Luật đang kích hoạt</p>
          <span className="badge badge-teal">{control.rule_count} luật</span>
        </div>
        {control.active_rules?.length > 0 ? (
          <div className="space-y-3">
            {control.active_rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="num text-xs text-slate-400 w-4 shrink-0 text-right">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-700">{rule.output}</span>
                    <span className="num text-xs text-slate-500">{((rule.strength ?? 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-teal-500 h-1.5 rounded-full progress-bar"
                      style={{ width: `${(rule.strength ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Không có luật nào được kích hoạt</p>
        )}
      </div>

      {/* Fuzzification breakdown */}
      {control.fuzzification && (
        <div className="card">
          <p className="text-sm font-semibold text-slate-700 mb-3">Chi tiết Fuzzification</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: 'co2',       label: 'CO₂',      cls: 'bg-blue-50 border-blue-100'    },
              { key: 'pm25',      label: 'PM2.5',    cls: 'bg-red-50 border-red-100'      },
              { key: 'humidity',  label: 'Độ ẩm',    cls: 'bg-emerald-50 border-emerald-100' },
              { key: 'occupancy', label: 'Số người', cls: 'bg-amber-50 border-amber-100'  },
            ].map(({ key, label, cls }) =>
              control.fuzzification[key] ? (
                <div key={key} className={`border rounded-lg p-3 ${cls}`}>
                  <p className="text-xs font-medium text-slate-600 mb-2">{label}</p>
                  <div className="space-y-1">
                    {Object.entries(control.fuzzification[key]).map(([k, val]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-500">{k}</span>
                        <span className="num font-medium text-slate-700">
                          {((val ?? 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
