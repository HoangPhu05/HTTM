import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const COLUMNS = [
  { key: 'timestamp',         label: 'Thời gian',       align: 'left',   fmt: (v) => v },
  { key: 'temperature',       label: 'Nhiệt độ (°C)',   align: 'right',  fmt: (v) => v.toFixed(1) },
  { key: 'humidity',          label: 'Độ ẩm (%)',       align: 'right',  fmt: (v) => v.toFixed(1) },
  { key: 'co2',               label: 'CO₂ (ppm)',       align: 'right',  fmt: (v) => v.toFixed(0) },
  { key: 'pm25',              label: 'PM2.5 (µg/m³)',   align: 'right',  fmt: (v) => v.toFixed(1) },
  { key: 'pm10',              label: 'PM10 (µg/m³)',    align: 'right',  fmt: (v) => v.toFixed(1) },
  { key: 'tvoc',              label: 'TVOC (ppb)',      align: 'right',  fmt: (v) => v.toFixed(1) },
  { key: 'co',                label: 'CO (ppm)',        align: 'right',  fmt: (v) => v.toFixed(2) },
  { key: 'occupancy_count',   label: 'Số người',        align: 'right',  fmt: (v) => v },
  { key: 'ventilation_status',label: 'Thông gió',       align: 'center', fmt: null },
];

function Pagination({ currentPage, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  let last = 0;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - delta && p <= currentPage + delta)) {
      if (last && p - last > 1) {
        pages.push(
          <span key={`e${p}`} className="w-8 flex items-center justify-center text-slate-400 text-sm select-none">…</span>
        );
      }
      pages.push(
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            currentPage === p
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {p}
        </button>
      );
      last = p;
    }
  }

  return (
    <div className="card flex items-center justify-between gap-2">
      <button
        onClick={() => onPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="btn btn-outline text-xs disabled:opacity-40"
      >
        Trước
      </button>
      <div className="flex items-center gap-1 flex-wrap justify-center">{pages}</div>
      <button
        onClick={() => onPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="btn btn-outline text-xs disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  );
}

export default function Data() {
  const [data,         setData]         = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [pageSize,     setPageSize]     = useState(20);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [searchTerm,   setSearchTerm]   = useState('');

  useEffect(() => {
    apiClient.getAllData()
      .then((r) => {
        const records = r.data.records || [];
        setData(records);
        setFilteredData(records);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredData(term ? data.filter((r) => r.timestamp.toLowerCase().includes(term)) : data);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const startIdx      = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIdx, startIdx + pageSize);
  const totalPages    = Math.ceil(filteredData.length / pageSize);

  const exportCSV = () => {
    const headers = COLUMNS.map((c) => c.label);
    const rows    = filteredData.map((r) =>
      COLUMNS.map((c) => {
        const v = r[c.key];
        return c.fmt ? c.fmt(v) : v;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const a   = document.createElement('a');
    a.href     = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = `air-quality-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-6 space-y-4 pb-14">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-slate-900">Dữ liệu chi tiết</h1>
        <button onClick={exportCSV} className="btn btn-secondary text-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo thời gian…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
          {/* Page size */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">Dòng/trang</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(+e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-5 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Tổng: <span className="num font-semibold text-slate-800">{data.length}</span> bản ghi</span>
          <span>Lọc: <span className="num font-semibold text-teal-700">{filteredData.length}</span></span>
          <span>Trang: <span className="num font-semibold text-slate-800">{currentPage}/{totalPages || 1}</span></span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm">Đang tải dữ liệu…</p>
        </div>
      ) : paginatedData.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className={
                        c.align === 'right'  ? 'text-right' :
                        c.align === 'center' ? 'text-center' : ''
                      }
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((record, idx) => (
                  <tr key={idx}>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.key}
                        className={
                          c.align === 'right'  ? 'text-right num text-slate-700' :
                          c.align === 'center' ? 'text-center' : 'text-slate-700'
                        }
                      >
                        {c.key === 'ventilation_status' ? (
                          <span className={`badge ${record.ventilation_status === 'Open' ? 'badge-green' : 'badge-slate'}`}>
                            {record.ventilation_status}
                          </span>
                        ) : c.fmt ? c.fmt(record[c.key]) : record[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card h-48 flex items-center justify-center text-slate-400 text-sm">
          Không tìm thấy dữ liệu phù hợp
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPage={setCurrentPage} />
    </div>
  );
}
