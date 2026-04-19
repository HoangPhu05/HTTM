import React from 'react';

const STATUS_CONFIG = {
  green:  { border: 'border-l-emerald-500', dot: 'bg-emerald-500', label: 'Bình thường', text: 'text-emerald-600' },
  yellow: { border: 'border-l-amber-500',   dot: 'bg-amber-500',   label: 'Cảnh báo',   text: 'text-amber-600'   },
  red:    { border: 'border-l-red-500',     dot: 'bg-red-500',     label: 'Nguy hiểm',  text: 'text-red-600'     },
  default:{ border: 'border-l-blue-400',    dot: 'bg-blue-400',    label: '',            text: 'text-blue-600'    },
};

const StatCard = ({ icon, title, value, unit, status, description }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.default;

  return (
    <div className={`card border-l-4 ${cfg.border} fade-in`}>
      <div className="flex items-start justify-between gap-2">
        {/* Left: label + value */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{title}</p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800 leading-none">{value}</span>
            {unit && <span className="text-sm text-slate-500 leading-none">{unit}</span>}
          </div>
          {description && <p className="mt-1.5 text-xs text-slate-400">{description}</p>}
          {status && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
          )}
        </div>

        {/* Right: icon */}
        <div className="text-3xl shrink-0 opacity-80">{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
