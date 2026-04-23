import React from 'react';

const STATUS = {
  green:   { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Bình thường' },
  yellow:  { bar: 'bg-amber-400',   dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Cảnh báo'   },
  red:     { bar: 'bg-red-500',     dot: 'bg-red-500',     text: 'text-red-700',     label: 'Nguy hiểm'  },
  default: { bar: 'bg-slate-300',   dot: 'bg-slate-400',   text: 'text-slate-500',   label: ''           },
};

export default function StatCard({ title, value, unit, status, description, delta }) {
  const s = STATUS[status] ?? STATUS.default;

  const deltaUp   = delta != null && delta > 0;
  const deltaDown = delta != null && delta < 0;
  const deltaZero = delta != null && delta === 0;

  return (
    <div className="card relative overflow-hidden group hover:shadow-card-md transition-shadow">
      {/* Status stripe at top */}
      {status && status !== 'default' && (
        <div className={`absolute top-0 left-0 right-0 h-[3px] ${s.bar}`} />
      )}

      <p className="text-xs font-medium text-slate-500 mb-2 mt-0.5">{title}</p>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="num text-[1.85rem] font-semibold text-slate-900 leading-none">
          {value ?? '—'}
        </span>
        {unit && (
          <span className="text-sm text-slate-400 leading-none">{unit}</span>
        )}
        {/* Delta badge – shows predicted change vs current */}
        {delta != null && (
          <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
            deltaUp   ? 'bg-red-50 text-red-600'
            : deltaDown ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-400'
          }`}>
            {deltaUp ? '↑' : deltaDown ? '↓' : '→'}
            {deltaZero ? '0' : Math.abs(delta)}
          </span>
        )}
      </div>

      {status ? (
        <div className={`flex items-center gap-1.5 ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
          <span className="text-xs font-medium">{description || s.label}</span>
        </div>
      ) : description ? (
        <p className="text-xs text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
