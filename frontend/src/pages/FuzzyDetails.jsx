import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import ControlOutput from '../components/ControlOutput';

const SLIDERS = [
  { name: 'co2',       label: 'CO₂',      unit: 'ppm',   min: 0, max: 2000, color: 'text-blue-700',   accent: 'accent-blue-600'   },
  { name: 'pm25',      label: 'PM2.5',    unit: 'µg/m³', min: 0, max: 200,  color: 'text-red-700',    accent: 'accent-red-600'    },
  { name: 'humidity',  label: 'Độ ẩm',    unit: '%',     min: 0, max: 100,  color: 'text-emerald-700',accent: 'accent-emerald-600'},
  { name: 'occupancy', label: 'Số người', unit: 'người', min: 0, max: 60,   color: 'text-amber-700',  accent: 'accent-amber-500'  },
];

const RULES = [
  { id: 1, condition: 'CO₂ cao  HOẶC  PM2.5 cao',                    output: 'Ventilation = High',   level: 'high'   },
  { id: 2, condition: 'CO₂ trung bình  VÀ  Độ ẩm cao',              output: 'Ventilation = Medium', level: 'medium' },
  { id: 3, condition: 'CO₂ thấp  VÀ  PM2.5 thấp  VÀ  Số người thấp', output: 'Ventilation = Low',   level: 'low'    },
  { id: 4, condition: 'Số người cao',                                  output: 'Ventilation = High',   level: 'high'   },
  { id: 5, condition: 'PM2.5 cao',                                     output: 'Ventilation = High',   level: 'high'   },
  { id: 6, condition: 'CO₂ trung bình  HOẶC  Số người trung bình',   output: 'Ventilation = Medium', level: 'medium' },
];

const RULE_STYLE = {
  high:   'border-l-red-400 bg-red-50/50',
  medium: 'border-l-amber-400 bg-amber-50/50',
  low:    'border-l-emerald-400 bg-emerald-50/50',
};

const MF_TABLE = [
  { var: 'CO₂ (ppm)',     sets: [{ label: 'Low', range: '0 – 800',    c: 'badge-green' }, { label: 'Medium', range: '600 – 1800', c: 'badge-amber' }, { label: 'High', range: '1000 – 2000', c: 'badge-red' }] },
  { var: 'PM2.5 (µg/m³)', sets: [{ label: 'Low', range: '0 – 35',     c: 'badge-green' }, { label: 'Medium', range: '25 – 100',   c: 'badge-amber' }, { label: 'High', range: '75 – 200',    c: 'badge-red' }] },
  { var: 'Độ ẩm (%)',     sets: [{ label: 'Low', range: '0 – 40',     c: 'badge-green' }, { label: 'Normal', range: '35 – 70',    c: 'badge-amber' }, { label: 'High', range: '65 – 100',    c: 'badge-red' }] },
  { var: 'Số người',      sets: [{ label: 'Low', range: '0 – 15',     c: 'badge-green' }, { label: 'Medium', range: '10 – 45',   c: 'badge-amber' }, { label: 'High', range: '35 – 60',     c: 'badge-red' }] },
];

const STEPS = [
  { n: '1', label: 'Fuzzification',   desc: 'Chuyển giá trị thực sang tập mờ — Low, Medium, High' },
  { n: '2', label: 'Rule Evaluation', desc: 'Đánh giá các luật IF-THEN bằng toán tử AND / OR' },
  { n: '3', label: 'Defuzzification', desc: 'Tổng hợp kết quả bằng phương pháp Centroid' },
];

export default function FuzzyDetails() {
  const [control,      setControl]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [running,      setRunning]      = useState(false);
  const [message,      setMessage]      = useState(null);
  const [applyControl, setApplyControl] = useState(false);
  const [inputs,       setInputs]       = useState({ co2: 800, pm25: 30, humidity: 55, occupancy: 20 });

  useEffect(() => {
    apiClient.getControlOutput()
      .then((r) => setControl(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleRun = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const r = await apiClient.runFuzzyControl(
        inputs.co2, inputs.pm25, inputs.humidity, inputs.occupancy, applyControl
      );
      setControl({
        ventilation_level: r.data.output?.ventilation_level ?? 0,
        fan_status:        r.data.output?.fan_status ?? 'Unknown',
        explanation:       r.data.output?.explanation ?? '',
        fuzzification:     r.data.fuzzification || {},
        active_rules:      r.data.active_rules || [],
        rule_count:        r.data.active_rules?.length || 0,
      });
      if (applyControl) {
        setMessage({ ok: true, text: `Đã áp dụng: mức thông gió ${(r.data.output?.ventilation_level ?? 0).toFixed(0)}%` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ ok: false, text: 'Lỗi khi chạy Fuzzy Control' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-6 space-y-6 pb-14">

      <h1 className="text-lg font-semibold text-slate-900">Fuzzy Logic Control</h1>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Left: inputs */}
        <div className="xl:col-span-2 space-y-5">

          {/* Slider inputs */}
          <div className="card space-y-5">
            <p className="text-sm font-semibold text-slate-700">Giá trị đầu vào</p>

            {SLIDERS.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-sm font-medium text-slate-600">{s.label}</label>
                  <span className={`num text-lg font-semibold ${s.color}`}>
                    {s.name === 'occupancy'
                      ? Math.round(inputs[s.name])
                      : inputs[s.name].toFixed(s.name === 'co2' ? 0 : 1)}
                    <span className="text-xs font-normal text-slate-400 ml-1">{s.unit}</span>
                  </span>
                </div>
                <input
                  type="range"
                  name={s.name}
                  min={s.min}
                  max={s.max}
                  value={inputs[s.name]}
                  onChange={handleChange}
                  className={`w-full ${s.accent}`}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>{s.min}</span>
                  <span>{s.max} {s.unit}</span>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={handleRun}
                disabled={running}
                className="flex-1 btn btn-primary text-sm disabled:opacity-60 justify-center"
              >
                {running ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang chạy…
                  </>
                ) : 'Chạy Fuzzy Control'}
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={applyControl}
                  onChange={(e) => setApplyControl(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                Áp dụng thiết bị
              </label>
            </div>

            {message && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg font-medium ${
                message.ok ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${message.ok ? 'bg-teal-500' : 'bg-red-500'}`} />
                {message.text}
              </div>
            )}
          </div>

          {/* Process steps */}
          <div className="card space-y-4">
            <p className="text-sm font-semibold text-slate-700">Quy trình Fuzzy Logic</p>
            {STEPS.map(({ n, label, desc }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: result */}
        <div className="xl:col-span-3">
          <ControlOutput control={control} loading={loading} />
        </div>
      </div>

      {/* Rule base */}
      <section className="card">
        <p className="text-sm font-semibold text-slate-700 mb-4">Cơ sở luật</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {RULES.map((r) => (
            <div key={r.id} className={`border-l-[3px] rounded-lg px-4 py-3 ${RULE_STYLE[r.level]}`}>
              <div className="flex items-start gap-2">
                <span className="num text-xs font-bold text-slate-400 mt-0.5 shrink-0 w-5">R{r.id}</span>
                <div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">IF </span>{r.condition}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 mt-1">→ {r.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership functions */}
      <section className="card">
        <p className="text-sm font-semibold text-slate-700 mb-4">Membership Functions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {MF_TABLE.map((v) => (
            <div key={v.var}>
              <p className="text-xs font-semibold text-slate-600 mb-2.5">{v.var}</p>
              <div className="space-y-2">
                {v.sets.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <span className={`badge ${s.c} shrink-0`}>{s.label}</span>
                    <span className="num text-xs text-slate-500">{s.range}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
