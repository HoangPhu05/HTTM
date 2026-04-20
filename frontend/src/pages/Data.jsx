import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const COLUMNS = [
  { key: 'timestamp',        label: 'Thời gian',       align: 'left',  fmt: v => v },
  { key: 'temperature',      label: 'Nhiệt độ (°C)',   align: 'right', fmt: v => v.toFixed(1) },
  { key: 'humidity',         label: 'Độ ẩm (%)',       align: 'right', fmt: v => v.toFixed(1) },
  { key: 'co2',              label: 'CO2 (ppm)',        align: 'right', fmt: v => v.toFixed(0) },
  { key: 'pm25',             label: 'PM2.5 (µg/m³)',   align: 'right', fmt: v => v.toFixed(1) },
  { key: 'pm10',             label: 'PM10 (µg/m³)',    align: 'right', fmt: v => v.toFixed(1) },
  { key: 'tvoc',             label: 'TVOC (ppb)',       align: 'right', fmt: v => v.toFixed(1) },
  { key: 'co',               label: 'CO (ppm)',         align: 'right', fmt: v => v.toFixed(2) },
  { key: 'occupancy_count',  label: 'Số người',         align: 'right', fmt: v => v },
  { key: 'ventilation_status', label: 'Thông gió',     align: 'center', fmt: null },
];

const Pagination = ({ currentPage, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const delta = 2;
  let last = 0;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - delta && p <= currentPage + delta)) {
      if (last && p - last > 1) pages.push(<span key={`e${p}`} className="px-1 text-slate-400 text-sm">…</span>);
      pages.push(
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            currentPage === p ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >{p}</button>
      );
      last = p;
    }
  }
  return (
    <div className="card flex items-center justify-between gap-2">
      <button onClick={() => onPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
        className="btn btn-ghost border border-slate-200 text-sm disabled:opacity-40">◀ Trước</button>
      <div className="flex items-center gap-1 flex-wrap justify-center">{pages}</div>
      <button onClick={() => onPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
        className="btn btn-ghost border border-slate-200 text-sm disabled:opacity-40">Sau ▶</button>
    </div>
  );
};

const Data = () => {
  const [data, setData]               = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pageSize, setPageSize]       = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm]   = useState('');

  useEffect(() => {
    apiClient.getAllData()
      .then(r => {
        const records = r.data.records || [];
        setData(records);
        setFilteredData(records);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredData(term ? data.filter(r => r.timestamp.toLowerCase().includes(term)) : data);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const startIdx      = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIdx, startIdx + pageSize);
  const totalPages    = Math.ceil(filteredData.length / pageSize);

  const exportCSV = () => {
    const headers = COLUMNS.map(c => c.label);
    const rows = filteredData.map(r =>
      COLUMNS.map(c => {
        const v = r[c.key];
        return c.fmt ? c.fmt(v) : v;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = `air-quality-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Dữ liệu Chi tiết</h1>
          <button onClick={exportCSV} className="btn btn-secondary text-sm">
            ↓ Xuất CSV
          </button>
        </div>

        {/* Toolbar */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm theo thời gian…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
            {/* Page size */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 whitespace-nowrap">Dòng/trang</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(+e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-4 pt-3 border-t border-slate-100 text-sm">
            <div><span className="text-slate-500">Tổng: </span><span className="font-bold text-slate-800">{data.length}</span></div>
            <div><span className="text-slate-500">Lọc: </span><span className="font-bold text-blue-600">{filteredData.length}</span></div>
            <div><span className="text-slate-500">Trang: </span><span className="font-bold text-slate-800">{currentPage}/{totalPages || 1}</span></div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-sm">Đang tải dữ liệu…</p>
          </div>
        ) : paginatedData.length > 0 ? (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {COLUMNS.map(c => (
                      <th
                        key={c.key}
                        className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                          c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      {COLUMNS.map(c => (
                        <td
                          key={c.key}
                          className={`px-4 py-2.5 ${
                            c.align === 'right' ? 'text-right font-mono text-slate-700' :
                            c.align === 'center' ? 'text-center' : 'text-slate-600'
                          }`}
                        >
                          {c.key === 'ventilation_status' ? (
                            <span className={`badge ${
                              record.ventilation_status === 'Open' ? 'badge-success' : 'badge-neutral'
                            }`}>
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
    </div>
  );
};

export default Data;
