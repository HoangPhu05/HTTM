import React from 'react';

const ALERT_CONFIG = {
  danger:  { border: 'border-l-red-500',    bg: 'bg-red-50',    icon: '🚨', badge: 'bg-red-100 text-red-700',    title: 'text-red-800',    body: 'text-red-600'    },
  warning: { border: 'border-l-amber-400',  bg: 'bg-amber-50',  icon: '⚠️', badge: 'bg-amber-100 text-amber-700', title: 'text-amber-800',  body: 'text-amber-600'  },
};

const SkeletonAlert = () => (
  <div className="card space-y-2">
    <div className="skeleton h-3 w-1/3 rounded" />
    <div className="skeleton h-4 w-2/3 rounded" />
    <div className="skeleton h-3 w-1/4 rounded" />
  </div>
);

const AlertPanel = ({ alerts, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonAlert />
        <SkeletonAlert />
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="card border-l-4 border-l-emerald-500 bg-emerald-50 flex items-center gap-4">
        <span className="text-3xl">✅</span>
        <div>
          <p className="font-semibold text-emerald-800">Môi trường ổn định</p>
          <p className="text-sm text-emerald-600 mt-0.5">Tất cả chỉ số trong ngưỡng bình thường</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => {
        const cfg = ALERT_CONFIG[alert.status] ?? ALERT_CONFIG.warning;
        return (
          <div key={idx} className={`card border-l-4 ${cfg.border} ${cfg.bg} fade-in`}>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${cfg.title}`}>{alert.parameter}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                    {alert.status === 'danger' ? 'Nguy hiểm' : 'Cảnh báo'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${cfg.body}`}>{alert.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Giá trị: <span className="font-mono font-semibold">{alert.value} {alert.unit}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertPanel;
