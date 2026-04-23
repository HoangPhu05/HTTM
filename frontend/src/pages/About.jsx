import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const PIPELINE = [
  {
    n: '1',
    title: 'Load dataset',
    desc: 'Backend reads data/dataset.csv with around 1000 rows of classroom air-quality history.',
    style: 'border-l-sky-400 bg-sky-50/60',
  },
  {
    n: '2',
    title: 'Train predictor',
    desc: 'Prediction layer learns patterns from the dataset. The docs describe an LSTM design, while the current backend can also run with ARIMA fallback.',
    style: 'border-l-violet-400 bg-violet-50/60',
  },
  {
    n: '3',
    title: 'Predict next 5 minutes',
    desc: 'System estimates future CO2, PM2.5, humidity, occupancy, and related signals for the next 5-minute step.',
    style: 'border-l-fuchsia-400 bg-fuchsia-50/60',
  },
  {
    n: '4',
    title: 'Run fuzzy twice',
    desc: 'Fuzzy control is applied to both current readings and predicted readings to compare reactive vs proactive ventilation output.',
    style: 'border-l-amber-400 bg-amber-50/60',
  },
  {
    n: '5',
    title: 'Hybrid decision',
    desc: 'Hybrid controller keeps the safer value by using MAX(current ventilation, predicted ventilation).',
    style: 'border-l-emerald-400 bg-emerald-50/60',
  },
  {
    n: '6',
    title: 'Show on dashboard',
    desc: 'Frontend displays current data, predicted data, and the final hybrid decision for the next 5 minutes.',
    style: 'border-l-teal-400 bg-teal-50/60',
  },
];

const DATASET_COLUMNS = [
  'Timestamp',
  'Temperature',
  'Humidity',
  'CO2',
  'PM2.5',
  'PM10',
  'TVOC',
  'CO',
  'Occupancy_Count',
];

const API_FLOW = [
  { label: 'Current snapshot', value: 'GET /api/current-data' },
  { label: '5-minute prediction', value: 'GET /api/predictions' },
  { label: 'Hybrid output', value: 'GET /api/hybrid-decision' },
];

const HIGHLIGHTS = [
  'Prediction is based on the historical dataset, not random values.',
  'Target horizon is 1 step ahead, equivalent to the next 5 minutes.',
  'Dashboard compares current readings with predicted readings.',
  'Final ventilation uses a proactive hybrid strategy for safer control.',
];

export default function About() {
  const [sysInfo, setSysInfo] = useState(null);
  const features = Array.isArray(sysInfo?.features) ? sysInfo.features : [];
  const parameters = Array.isArray(sysInfo?.parameters) ? sysInfo.parameters : [];

  useEffect(() => {
    apiClient.getSystemInfo().then((r) => setSysInfo(r.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-6 space-y-6 pb-14">
      <section className="card bg-slate-900 border-slate-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.18),_transparent_30%)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-300/80 mb-3">HTTM Hybrid Prediction</p>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight">
              {sysInfo?.name ?? 'Air Quality Monitoring System'}
            </h1>
            <p className="text-slate-300 text-sm md:text-[15px] mt-3 leading-relaxed">
              This project does not stop at monitoring current air quality. It uses the historical
              dataset to estimate what the classroom environment will look like in the next 5 minutes,
              then combines that forecast with fuzzy logic for proactive ventilation control.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge badge-teal">Dataset-driven</span>
              <span className="badge badge-blue">5-minute forecast</span>
              <span className="badge badge-green">Hybrid fuzzy control</span>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {features.map((feature, index) => (
                  <span key={index} className="text-xs bg-white/10 text-slate-200 px-2.5 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400">Dataset</p>
              <p className="num text-2xl font-semibold text-white mt-1">1000</p>
              <p className="text-xs text-slate-400 mt-1">historical rows</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400">Forecast</p>
              <p className="num text-2xl font-semibold text-white mt-1">5m</p>
              <p className="text-xs text-slate-400 mt-1">next-step horizon</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400">Controller</p>
              <p className="text-sm font-semibold text-white mt-1">Fuzzy + Hybrid</p>
              <p className="text-xs text-slate-400 mt-1">reactive and proactive</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400">API output</p>
              <p className="text-sm font-semibold text-white mt-1">current + predicted</p>
              <p className="text-xs text-slate-400 mt-1">decision-ready data</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">How the 5-minute prediction works</p>
            <p className="text-xs text-slate-500 mt-1">Pipeline from dataset to dashboard decision</p>
          </div>
          <span className="badge badge-slate">data / predict / fuzzy / hybrid</span>
        </div>
        <div className="space-y-2.5">
          {PIPELINE.map((step, index) => (
            <React.Fragment key={step.n}>
              <div className={`flex items-start gap-3 rounded-xl border-l-[3px] px-4 py-3 ${step.style}`}>
                <span className="num w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {index < PIPELINE.length - 1 && (
                <div className="ml-8 text-slate-300 text-xs leading-none">|</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card">
          <p className="text-sm font-semibold text-slate-800 mb-3">Dataset foundation</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The prediction layer is trained from the classroom dataset stored in
            `data/dataset.csv`. That dataset provides the historical sequence used to learn
            patterns before estimating the next 5-minute state.
          </p>
          <div className="flex flex-wrap gap-2">
            {DATASET_COLUMNS.map((column) => (
              <span key={column} className="badge badge-blue">
                {column}
              </span>
            ))}
          </div>
        </section>

        <section className="card">
          <p className="text-sm font-semibold text-slate-800 mb-3">Prediction and control outputs</p>
          <div className="space-y-3">
            {API_FLOW.map((item) => (
              <div key={item.value} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1">Used by frontend dashboard panels</p>
                </div>
                <span className="num text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card bg-slate-50/70 border-slate-200">
          <p className="text-sm font-semibold text-slate-800 mb-3">Why hybrid control is used</p>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              A normal fuzzy controller reacts only to the current snapshot. In this project,
              fuzzy control also runs on the predicted readings so the system can prepare earlier
              when air quality is likely to worsen in the next 5 minutes.
            </p>
            <p>
              The hybrid controller then keeps the safer ventilation output using the rule
              `MAX(current, predicted)`.
            </p>
          </div>
        </section>

        <section className="card">
          <p className="text-sm font-semibold text-slate-800 mb-3">Key project points</p>
          <ul className="space-y-2.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <p className="text-sm font-semibold text-slate-800 mb-4">Project info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-1">Goal</p>
            <p className="text-slate-700">
              Monitor classroom air quality, forecast the next 5-minute condition, and control
              ventilation with a safer hybrid fuzzy strategy.
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Tracked parameters</p>
            <p className="text-slate-700">
              {parameters.length > 0 ? parameters.join(', ') : 'Temperature, humidity, CO2, PM2.5, PM10, TVOC, CO, occupancy'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Prediction basis</p>
            <p className="text-slate-700">Historical dataset + time-series predictor + hybrid fuzzy inference</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Version</p>
            <p className="num font-semibold text-slate-800">{sysInfo?.version ?? '2.0.0'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
