import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import ControlOutput from '../components/ControlOutput';

const SLIDERS = [
  { name: 'co2',       label: 'CO2',      unit: 'ppm',   min: 0, max: 2000, color: 'text-blue-600',   accent: '#3b82f6' },
  { name: 'pm25',      label: 'PM2.5',    unit: 'µg/m³', min: 0, max: 200,  color: 'text-red-500',    accent: '#ef4444' },
  { name: 'humidity',  label: 'Độ ẩm',    unit: '%',     min: 0, max: 100,  color: 'text-emerald-600',accent: '#10b981' },
  { name: 'occupancy', label: 'Số người', unit: 'người', min: 0, max: 60,   color: 'text-amber-600',  accent: '#f59e0b' },
];

const RULES = [
  { id: 1, condition: 'CO2 cao  HOẶC  PM2.5 cao',                      output: 'Ventilation = High',   color: 'border-l-red-400'    },
  { id: 2, condition: 'CO2 trung bình  VÀ  Độ ẩm cao',                 output: 'Ventilation = Medium', color: 'border-l-amber-400'  },
  { id: 3, condition: 'CO2 thấp  VÀ  PM2.5 thấp  VÀ  Số người thấp',  output: 'Ventilation = Low',    color: 'border-l-emerald-400'},
  { id: 4, condition: 'Số người cao',                                   output: 'Ventilation = High',   color: 'border-l-red-400'    },
  { id: 5, condition: 'PM2.5 cao',                                      output: 'Ventilation = High',   color: 'border-l-red-400'    },
  { id: 6, condition: 'CO2 trung bình  HOẶC  Số người trung bình',     output: 'Ventilation = Medium', color: 'border-l-amber-400'  },
];

const MF_TABLE = [
  { var: 'CO2 (ppm)',    sets: [{ label: 'Low', range: '0 – 800', c: 'emerald' }, { label: 'Medium', range: '600 – 1800', c: 'amber' }, { label: 'High', range: '1000 – 2000', c: 'red' }] },
  { var: 'PM2.5 (µg/m³)',sets: [{ label: 'Low', range: '0 – 35',  c: 'emerald' }, { label: 'Medium', range: '25 – 100',   c: 'amber' }, { label: 'High', range: '75 – 200',    c: 'red' }] },
  { var: 'Độ ẩm (%)',    sets: [{ label: 'Low', range: '0 – 40',  c: 'emerald' }, { label: 'Normal', range: '35 – 70',    c: 'amber' }, { label: 'High', range: '65 – 100',    c: 'red' }] },
  { var: 'Số người',     sets: [{ label: 'Low', range: '0 – 15',  c: 'emerald' }, { label: 'Medium', range: '10 – 45',   c: 'amber' }, { label: 'High', range: '35 – 60',     c: 'red' }] },
];

const COLOR_MAP = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700' };

const FuzzyDetails = () => {
  const [control, setControl]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [running, setRunning]       = useState(false);
  const [message, setMessage]       = useState(null);
  const [applyControl, setApplyControl] = useState(false);
  const [inputs, setInputs] = useState({ co2: 800, pm25: 30, humidity: 55, occupancy: 20 });

  useEffect(() => {
    apiClient.getControlOutput()
      .then(r => setControl(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
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
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <h1 className="text-xl font-bold text-slate-800">Fuzzy Logic Control</h1>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* Left column: inputs + reference */}
          <div className="xl:col-span-2 space-y-5">

            {/* Input sliders */}
            <div className="card space-y-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Giá trị đầu vào
              </p>

              {SLIDERS.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-sm font-medium text-slate-600">{s.label}</label>
                    <span className={`text-lg font-bold ${s.color}`}>
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
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>{s.min}</span>
                    <span>{s.max} {s.unit}</span>
                  </div>
                </div>
              ))}

              {/* Run button */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="flex-1 btn btn-primary text-sm disabled:opacity-60"
                >
                  {running ? '⏳ Đang chạy…' : '▶ Chạy Fuzzy Control'}
                </button>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={applyControl}
                    onChange={e => setApplyControl(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  Áp dụng thiết bị
                </label>
              </div>

              {message && (
                <div className={`text-sm text-center px-3 py-2 rounded-lg font-medium ${
                  message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.ok ? '✅' : '❌'} {message.text}
                </div>
              )}
            </div>

            {/* Fuzzy steps explanation */}
            <div className="card space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Quy trình Fuzzy Logic
              </p>
              {[
                { step: '1', label: 'Fuzzification', color: 'bg-blue-500',    desc: 'Chuyển giá trị thực → tập mờ (Low / Medium / High)' },
                { step: '2', label: 'Rule Evaluation',color: 'bg-purple-500', desc: 'Đánh giá các luật IF-THEN với AND / OR' },
                { step: '3', label: 'Defuzzification', color: 'bg-emerald-500',desc: 'Tính giá trị crisp bằng phương pháp Centroid' },
              ].map(({ step, label, color, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className={`${color} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: result */}
          <div className="xl:col-span-3">
            <ControlOutput control={control} loading={loading} />
          </div>
        </div>

        {/* Rule base */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Cơ sở luật — Rule Base
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {RULES.map(r => (
              <div key={r.id} className={`border-l-4 ${r.color} bg-slate-50 rounded-lg px-4 py-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-400 mt-0.5 shrink-0">R{r.id}</span>
                  <div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-700">IF</span> {r.condition}
                    </p>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                      → {r.output}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership functions */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Membership Functions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {MF_TABLE.map(v => (
              <div key={v.var}>
                <p className="text-sm font-semibold text-slate-700 mb-2">{v.var}</p>
                <div className="space-y-1.5">
                  {v.sets.map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${COLOR_MAP[s.c]}`}>
                        {s.label}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{s.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FuzzyDetails;
