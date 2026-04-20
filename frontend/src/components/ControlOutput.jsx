import React from 'react';

const FAN_CONFIG = {
  Off:    { label: 'Tắt',         color: 'text-slate-500',   bg: 'bg-slate-100' },
  Low:    { label: 'Mức thấp',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Medium: { label: 'Mức vừa',     color: 'text-amber-600',   bg: 'bg-amber-50'   },
  High:   { label: 'Mức cao',     color: 'text-red-600',     bg: 'bg-red-50'     },
};

const getProgressColor = (level) => {
  if (level < 25) return 'from-slate-400 to-slate-500';
  if (level < 50) return 'from-emerald-400 to-emerald-500';
  if (level < 75) return 'from-amber-400 to-amber-500';
  return 'from-red-400 to-red-500';
};

const SkeletonBlock = ({ h = 'h-4', w = 'w-full' }) => (
  <div className={`skeleton ${h} ${w} rounded`} />
);

const ControlOutput = ({ control, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card space-y-3">
          <SkeletonBlock h="h-4" w="w-1/3" />
          <SkeletonBlock h="h-8" />
          <SkeletonBlock h="h-4" w="w-1/4" />
        </div>
        <div className="card space-y-2">
          <SkeletonBlock h="h-4" w="w-1/4" />
          <SkeletonBlock h="h-3" />
          <SkeletonBlock h="h-3" w="w-5/6" />
        </div>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="card text-center text-slate-400 py-10">
        Chưa có dữ liệu điều khiển
      </div>
    );
  }

  const level = control.ventilation_level ?? 0;
  const fanCfg = FAN_CONFIG[control.fan_status] ?? FAN_CONFIG.Off;
  const progressColor = getProgressColor(level);

  return (
    <div className="space-y-4 fade-in">
      {/* Ventilation level */}
      <div className="card">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Mức thông gió</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${progressColor} h-5 rounded-full progress-bar`}
                style={{ width: `${Math.min(100, level)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {level.toFixed(1)} / 100
            </p>
          </div>
          <div className={`${fanCfg.bg} ${fanCfg.color} rounded-lg px-4 py-2.5 text-center min-w-max`}>
            <div className="text-2xl mb-0.5">🌀</div>
            <p className="text-xs font-semibold">{fanCfg.label}</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="card border-l-4 border-l-blue-400">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Lý do quyết định</p>
        <p className="text-sm text-slate-700 leading-relaxed">{control.explanation}</p>
      </div>

      {/* Active rules */}
      <div className="card">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Luật đang kích hoạt
          <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
            {control.rule_count}
          </span>
        </p>
        <div className="space-y-2">
          {control.active_rules?.length > 0 ? (
            control.active_rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-6 shrink-0 text-right">{idx + 1}.</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium text-slate-700">{rule.output}</span>
                    <span className="text-slate-400">{((rule.strength ?? 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-400 h-1.5 rounded-full progress-bar"
                      style={{ width: `${(rule.strength ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Không có luật nào được kích hoạt</p>
          )}
        </div>
      </div>

      {/* Fuzzification */}
      {control.fuzzification && (
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Chi tiết Fuzzification</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'co2',       label: 'CO2',      bg: 'bg-blue-50'   },
              { key: 'pm25',      label: 'PM2.5',    bg: 'bg-red-50'    },
              { key: 'humidity',  label: 'Độ ẩm',    bg: 'bg-emerald-50'},
              { key: 'occupancy', label: 'Số người', bg: 'bg-amber-50'  },
            ].map(({ key, label, bg }) => (
              control.fuzzification[key] && (
                <div key={key} className={`${bg} rounded-lg p-3`}>
                  <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
                  <div className="space-y-1">
                    {Object.entries(control.fuzzification[key]).map(([k, val]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {((val ?? 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlOutput;
