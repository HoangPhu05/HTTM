import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const ARCH_STEPS = [
  { n: '1', label: 'Dữ liệu cảm biến',     desc: 'Đọc dữ liệu từ file CSV hoặc cảm biến thực tế',              color: 'border-l-blue-400 bg-blue-50/40'      },
  { n: '2', label: 'Xử lý & Chuẩn hóa',   desc: 'Làm sạch, điền giá trị thiếu, kiểm tra giới hạn hợp lệ',    color: 'border-l-violet-400 bg-violet-50/40'  },
  { n: '3', label: 'Kiểm tra ngưỡng',      desc: 'So sánh từng chỉ số với các ngưỡng cảnh báo định nghĩa sẵn', color: 'border-l-amber-400 bg-amber-50/40'    },
  { n: '4', label: 'Fuzzy Logic Control',  desc: 'Fuzzification → Rule Evaluation → Defuzzification',          color: 'border-l-purple-400 bg-purple-50/40'  },
  { n: '5', label: 'Điều khiển thông gió', desc: 'Xuất mức quạt Low / Medium / High qua giao thức MQTT',       color: 'border-l-teal-400 bg-teal-50/40'      },
  { n: '6', label: 'Dashboard & Cảnh báo', desc: 'Giao diện web hiển thị kết quả và cảnh báo theo thời gian thực', color: 'border-l-emerald-400 bg-emerald-50/40'},
];

const STACK = [
  {
    group: 'Frontend',
    color: 'text-blue-700',
    dot: 'bg-blue-400',
    items: ['React 18', 'Tailwind CSS', 'Recharts', 'Vite'],
  },
  {
    group: 'Backend',
    color: 'text-emerald-700',
    dot: 'bg-emerald-400',
    items: ['Python 3.9+', 'FastAPI', 'Pandas / NumPy', 'Uvicorn'],
  },
  {
    group: 'IoT / Điều khiển',
    color: 'text-purple-700',
    dot: 'bg-purple-400',
    items: ['MQTT (Paho)', 'CSV Dataset', 'Fuzzy Logic', 'Dữ liệu mô phỏng'],
  },
];

const TARGETS = [
  'CO₂ dưới 800 ppm',
  'PM2.5 dưới 35 µg/m³',
  'Độ ẩm 40 – 70 %',
  'Tối ưu hóa mức thông gió',
  'Phản ứng mềm mại với thay đổi đột ngột',
];

export default function About() {
  const [sysInfo, setSysInfo] = useState(null);

  useEffect(() => {
    apiClient.getSystemInfo().then((r) => setSysInfo(r.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 py-6 space-y-6 pb-14">

      {/* Hero */}
      <div className="card bg-slate-800 border-slate-700 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold leading-snug">
              {sysInfo?.name ?? 'Hệ thống giám sát chất lượng không khí'}
            </h1>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              {sysInfo?.description ?? 'Điều khiển thiết bị thông gió tự động bằng Fuzzy Logic Control'}
            </p>
            {sysInfo?.features?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {sysInfo.features.map((f, i) => (
                  <span key={i} className="text-xs bg-white/10 text-slate-300 px-2.5 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Architecture */}
      <section className="card">
        <p className="text-sm font-semibold text-slate-700 mb-4">Kiến trúc hệ thống</p>
        <div className="space-y-2">
          {ARCH_STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-3 border-l-[3px] rounded-lg px-4 py-3 ${s.color}`}>
                <span className="num w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
              {i < ARCH_STEPS.length - 1 && (
                <div className="ml-7 text-slate-300 text-xs leading-none">│</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Params + Targets */}
      {sysInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm font-semibold text-slate-700 mb-3">Chỉ số theo dõi</p>
            <ul className="space-y-2">
              {sysInfo.parameters.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <p className="text-sm font-semibold text-slate-700 mb-3">Mục tiêu điều khiển</p>
            <ul className="space-y-2">
              {TARGETS.map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tech stack */}
      <section className="card">
        <p className="text-sm font-semibold text-slate-700 mb-4">Công nghệ sử dụng</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STACK.map((s) => (
            <div key={s.group}>
              <p className={`text-xs font-semibold mb-2.5 ${s.color}`}>{s.group}</p>
              <ul className="space-y-1.5">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Research background */}
      <section className="card bg-slate-50/70 border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-3">Nền tảng khoa học</p>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            <span className="font-semibold text-slate-800">Fuzzy Logic Control</span> dựa trên lý thuyết
            tập mờ — thay vì phân loại nhị phân có/không, mỗi giá trị được ánh xạ vào mức độ thành viên
            của nhiều tập mờ, mô phỏng cách suy luận tự nhiên của con người.
          </p>
          <p>
            Hệ thống kết hợp nhiều chỉ số môi trường (CO₂, PM2.5, độ ẩm, số người) để đưa ra quyết định
            điều khiển thông gió liên tục, không cắt cứng theo ngưỡng cố định.
          </p>
          <p>
            <span className="font-semibold text-slate-800">Lợi ích:</span> Tiết kiệm năng lượng, cải thiện
            chất lượng không khí, phản ứng mềm mại và thích nghi với nhiều điều kiện khác nhau.
          </p>
        </div>
      </section>

      {/* Project info */}
      <section className="card">
        <p className="text-sm font-semibold text-slate-700 mb-4">Thông tin dự án</p>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-1">Đề tài</p>
            <p className="font-semibold text-slate-800">
              Hệ thống giám sát chất lượng không khí trong phòng học và điều khiển thiết bị bằng Fuzzy Logic Control
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Mục đích</p>
            <p className="text-slate-600">
              Xây dựng hệ thống thông minh giám sát và tự động điều khiển thiết bị thông gió,
              góp phần cải thiện sức khỏe và hiệu suất học tập của học sinh trong lớp học.
            </p>
          </div>
          {sysInfo && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Phiên bản</p>
              <p className="num font-semibold text-slate-800">{sysInfo.version}</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
