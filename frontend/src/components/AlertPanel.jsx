import React from 'react';

function SkeletonAlert() {
  return (
    <div className="card space-y-2.5">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-2/5" />
    </div>
  );
}

export default function AlertPanel({ alerts, loading }) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        <SkeletonAlert />
        <SkeletonAlert />
      </div>
    );
  }

  if (!alerts?.length) {
    return (
      <div className="card flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Môi trường ổn định</p>
          <p className="text-xs text-slate-400 mt-0.5">Tất cả chỉ số trong ngưỡng cho phép</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => {
        const isDanger = alert.status === 'danger';
        return (
          <div
            key={idx}
            className={`card-sm fade-in border-l-[3px] ${
              isDanger
                ? 'border-l-red-500 bg-red-50/40'
                : 'border-l-amber-400 bg-amber-50/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                isDanger ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <svg className={`w-3.5 h-3.5 ${isDanger ? 'text-red-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">{alert.parameter}</span>
                  <span className={`badge ${isDanger ? 'badge-red' : 'badge-amber'}`}>
                    {isDanger ? 'Nguy hiểm' : 'Cảnh báo'}
                  </span>
                </div>
                <p className={`text-sm leading-snug ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
                  {alert.message}
                </p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Giá trị hiện tại:{' '}
                  <span className="num font-semibold text-slate-700">{alert.value} {alert.unit}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
