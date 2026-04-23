import React from 'react';

const IcoDashboard = () => (
  <svg className="w-[17px] h-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
    <rect x="3" y="3" width="7" height="7" rx="1.25" />
    <rect x="14" y="3" width="7" height="7" rx="1.25" />
    <rect x="14" y="14" width="7" height="7" rx="1.25" />
    <rect x="3" y="14" width="7" height="7" rx="1.25" />
  </svg>
);

const IcoCharts = () => (
  <svg className="w-[17px] h-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IcoAlerts = () => (
  <svg className="w-[17px] h-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IcoFuzzy = () => (
  <svg className="w-[17px] h-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const IcoData = () => (
  <svg className="w-[17px] h-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h7" />
  </svg>
);

const IcoAbout = () => (
  <svg className="w-[17px] h-[17px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan',       Icon: IcoDashboard },
  { id: 'charts',    label: 'Biểu đồ',          Icon: IcoCharts    },
  { id: 'alerts',    label: 'Cảnh báo',         Icon: IcoAlerts    },
  { id: 'fuzzy',     label: 'Điều khiển Fuzzy', Icon: IcoFuzzy     },
  { id: 'data',      label: 'Dữ liệu',          Icon: IcoData      },
  { id: 'about',     label: 'Thông tin',        Icon: IcoAbout     },
];

export default function Sidebar({ activeTab, onTabChange, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight tracking-tight">HTTM</p>
            <p className="text-slate-500 text-xs mt-0.5 truncate">Giám sát không khí</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 text-left group
                ${active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }
              `}
            >
              <span className={`transition-colors ${active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                <Icon />
              </span>
              <span className="flex-1">{label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400">Đang hoạt động</span>
        </div>
        <p className="text-xs text-slate-600">Phiên bản 2.0</p>
      </div>
    </aside>
  );
}
