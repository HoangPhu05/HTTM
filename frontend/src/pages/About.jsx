import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const ARCH_STEPS = [
  { icon: '📊', label: 'Dữ liệu cảm biến / CSV',      desc: 'Đọc dữ liệu từ file CSV hoặc cảm biến thực tế',         color: 'bg-blue-50 border-blue-200 text-blue-700'     },
  { icon: '⚙️', label: 'Xử lý & Chuẩn hóa',          desc: 'Làm sạch, điền thiếu, kiểm tra giới hạn',               color: 'bg-violet-50 border-violet-200 text-violet-700'},
  { icon: '🔍', label: 'Kiểm tra Ngưỡng',             desc: 'So sánh với các ngưỡng định nghĩa sẵn',                  color: 'bg-amber-50 border-amber-200 text-amber-700'  },
  { icon: '🧠', label: 'Fuzzy Logic Control',          desc: 'Fuzzification → Rule Evaluation → Defuzzification',     color: 'bg-purple-50 border-purple-200 text-purple-700'},
  { icon: '🌬️', label: 'Điều khiển Thông gió',        desc: 'Xuất mức quạt: Low / Medium / High qua MQTT',           color: 'bg-emerald-50 border-emerald-200 text-emerald-700'},
  { icon: '📱', label: 'Dashboard & Cảnh báo',        desc: 'Giao diện web hiển thị trực quan kết quả realtime',     color: 'bg-rose-50 border-rose-200 text-rose-700'     },
];

const STACK = [
  { group: 'Frontend',  color: 'text-blue-600',   items: ['⚛️ React 18', '🎨 Tailwind CSS', '📊 Recharts', '⚡ Vite'] },
  { group: 'Backend',   color: 'text-emerald-600', items: ['🐍 Python 3.9+', '⚡ FastAPI', '📊 Pandas / NumPy', '🔄 Uvicorn'] },
  { group: 'IoT / Data',color: 'text-purple-600',  items: ['📡 MQTT (Paho)', '📁 CSV Dataset', '🔢 Fuzzy Logic', '🔄 Dữ liệu mô phỏng'] },
];

const About = () => {
  const [sysInfo, setSysInfo] = useState(null);

  useEffect(() => {
    apiClient.getSystemInfo().then(r => setSysInfo(r.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="card bg-gradient-to-br from-blue-600 to-emerald-600 text-white border-0">
          <div className="flex items-start gap-4">
            <div className="text-5xl shrink-0">🏫</div>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                {sysInfo?.name ?? 'Hệ thống Giám sát Chất lượng Không khí'}
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {sysInfo?.description ?? 'Điều khiển thiết bị thông gió bằng Fuzzy Logic Control'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {sysInfo?.features?.map((f, i) => (
                  <span key={i} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Kiến trúc Hệ thống
          </p>
          <div className="space-y-2">
            {ARCH_STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 ${s.color}`}>
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{s.desc}</p>
                  </div>
                </div>
                {i < ARCH_STEPS.length - 1 && (
                  <div className="text-center text-slate-300 text-lg leading-none">↓</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Params + Targets */}
        {sysInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Chỉ số Theo dõi
              </p>
              <ul className="space-y-1.5">
                {sysInfo.parameters.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Mục tiêu Điều khiển
              </p>
              <ul className="space-y-1.5">
                {[
                  'CO2 < 800 ppm',
                  'PM2.5 < 35 µg/m³',
                  'Độ ẩm 40 – 70 %',
                  'Tối ưu mức thông gió',
                  'Phản ứng nhanh với thay đổi',
                ].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tech stack */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Công nghệ Sử dụng
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STACK.map(s => (
              <div key={s.group}>
                <p className={`text-sm font-bold mb-2 ${s.color}`}>{s.group}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-600">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Research background */}
        <div className="card border-l-4 border-l-blue-400 bg-blue-50/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Nền tảng Khoa học
          </p>
          <div className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
            <p>
              <span className="font-semibold">Fuzzy Logic Control</span> dựa trên lý thuyết tập mờ —
              thay vì nhị phân có/không, mỗi giá trị được ánh xạ vào mức độ thành viên của nhiều tập mờ,
              mô phỏng cách suy luận tự nhiên của con người.
            </p>
            <p>
              Hệ thống kết hợp nhiều chỉ số môi trường (CO2, PM2.5, độ ẩm, số người) để đưa ra
              quyết định điều khiển thông gió liên tục, không cắt cứng theo ngưỡng.
            </p>
            <p>
              <span className="font-semibold">Lợi ích:</span> Tiết kiệm năng lượng, cải thiện chất lượng
              không khí, phản ứng mềm mại với thay đổi và thích nghi với nhiều điều kiện khác nhau.
            </p>
          </div>
        </div>

        {/* Project info */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Thông tin Dự án
          </p>
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Đề tài</p>
              <p className="font-semibold">
                Hệ thống giám sát chất lượng không khí trong phòng học và điều khiển thiết bị bằng Fuzzy Logic Control
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Mục đích</p>
              <p>
                Xây dựng hệ thống thông minh giám sát và điều khiển chất lượng không khí,
                cải thiện sức khỏe và hiệu suất học tập của học sinh trong lớp học.
              </p>
            </div>
            {sysInfo && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Phiên bản</p>
                <p className="font-mono font-semibold">{sysInfo.version}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
