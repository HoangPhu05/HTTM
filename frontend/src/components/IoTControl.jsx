import React, { useState, useEffect } from 'react';
import api from '../services/api';

/* ── Toggle switch pill ─────────────────────────────────────── */
function Toggle({ checked, onChange, disabled, colorOn = 'bg-blue-500' }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed
        ${checked ? colorOn : 'bg-slate-300'}`}
    >
      <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow
        transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

/* ── Speed preset button ────────────────────────────────────── */
function SpeedBtn({ label, value, current, onClick, disabled }) {
  const active = current === value;
  const colors = {
    0:   'bg-slate-100 text-slate-500 border-slate-200',
    33:  'bg-emerald-500 text-white border-emerald-500',
    66:  'bg-amber-500  text-white border-amber-500',
    100: 'bg-red-500    text-white border-red-500',
  };
  const idle = {
    0:   'hover:bg-slate-200 border-slate-200 text-slate-500',
    33:  'hover:bg-emerald-50 border-emerald-300 text-emerald-600',
    66:  'hover:bg-amber-50  border-amber-300  text-amber-600',
    100: 'hover:bg-red-50    border-red-300    text-red-600',
  };
  return (
    <button
      onClick={() => onClick(value)}
      disabled={disabled}
      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-40
        ${active ? colors[value] : idle[value]}`}
    >
      {label}
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function IoTControl() {
  const [fanOn,    setFanOn]    = useState(false);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [lightOn,  setLightOn]  = useState(false);
  const [mqtt,     setMqtt]     = useState(false);
  const [manual,   setManual]   = useState(false);  // tắt auto-loop khi bật
  const [busy,     setBusy]     = useState(false);
  const [toast,    setToast]    = useState(null);

  // Poll trạng thái thiết bị mỗi 3s
  useEffect(() => {
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, []);

  const poll = async () => {
    try {
      const r = await api.get('/devices/status');
      const d = r.data.devices || {};
      setFanOn(!!d.fan);
      setFanSpeed(typeof d.fan_speed === 'number' ? d.fan_speed : (d.fan ? 50 : 0));
      setDoorOpen(!!d.door);
      setLightOn(!!d.light);
      setMqtt(r.data.mqtt_connected);
    } catch { /* silent */ }
  };

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  // Bật/tắt auto-loop trên backend
  const toggleManual = async (val) => {
    setManual(val);
    try {
      await api.post(`/devices/auto-loop?enabled=${!val}&interval=5`);
      notify(val ? 'Chế độ thủ công — auto-loop tạm dừng' : 'Chế độ tự động bật lại');
    } catch { notify('Lỗi đổi chế độ', false); }
  };

  /* ── Fan ── */
  const sendFan = async (speed) => {
    setBusy(true);
    try {
      const r = await api.post(`/devices/fan/control?speed=${speed}`);
      if (r.data.success) {
        setFanSpeed(speed);
        setFanOn(speed > 0);
        notify(`Quạt: ${speed > 0 ? speed + '%' : 'TẮT'}`);
      }
    } catch { notify('Lỗi điều khiển quạt', false); }
    finally { setBusy(false); }
  };

  const toggleFan = (on) => sendFan(on ? (fanSpeed > 0 ? fanSpeed : 50) : 0);

  /* ── Light ── */
  const toggleLight = async (on) => {
    setBusy(true);
    try {
      const r = await api.post(`/devices/light/control?on=${on}`);
      if (r.data.success) {
        setLightOn(on);
        notify(`Đèn phòng: ${on ? 'BẬT' : 'TẮT'}`);
      }
    } catch { notify('Lỗi điều khiển đèn', false); }
    finally { setBusy(false); }
  };

  /* ── Door ── */
  const toggleDoor = async (open) => {
    setBusy(true);
    try {
      const r = await api.post(`/devices/door/control?open=${open}`);
      if (r.data.success) {
        setDoorOpen(open);
        notify(`Cửa: ${open ? 'MỞ' : 'ĐÓNG'}`);
      }
    } catch { notify('Lỗi điều khiển cửa', false); }
    finally { setBusy(false); }
  };

  const canControl = mqtt && manual;

  return (
    <div className="card space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Điều khiển Thiết bị IoT
        </p>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
          ${mqtt ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${mqtt ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {mqtt ? 'MQTT OK' : 'MQTT Ngắt'}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`text-sm px-3 py-2 rounded-lg font-medium text-center
          ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {toast.ok ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Manual mode toggle */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors
        ${manual ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {manual ? '🖐 Chế độ thủ công' : '🤖 Chế độ tự động'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {manual ? 'Auto-loop tạm dừng — bạn điều khiển trực tiếp'
                    : 'Fuzzy Logic tự gửi lệnh mỗi 5 giây'}
          </p>
        </div>
        <Toggle
          checked={manual}
          onChange={toggleManual}
          colorOn="bg-violet-500"
        />
      </div>

      {!canControl && (
        <p className="text-xs text-center text-slate-400">
          {!mqtt ? '⚠️ Chưa kết nối MQTT' : '💡 Bật chế độ thủ công để điều khiển'}
        </p>
      )}

      {/* 3 device cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* ── Quạt ── */}
        <div className={`rounded-xl border p-4 space-y-3 transition-opacity
          ${!canControl ? 'opacity-50' : ''} bg-blue-50 border-blue-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💨</span>
              <span className="text-sm font-semibold text-slate-700">Quạt</span>
            </div>
            <Toggle
              checked={fanOn}
              onChange={toggleFan}
              disabled={!canControl || busy}
              colorOn="bg-blue-500"
            />
          </div>

          {/* Speed value */}
          <div className="text-center">
            <span className="text-2xl font-bold text-blue-600">{fanSpeed}</span>
            <span className="text-xs text-slate-400 ml-1">%</span>
          </div>

          {/* Slider */}
          <input
            type="range" min="0" max="100" step="1"
            value={fanSpeed}
            onChange={e => setFanSpeed(+e.target.value)}
            onMouseUp={e  => canControl && !busy && sendFan(+e.target.value)}
            onTouchEnd={e => canControl && !busy && sendFan(+e.target.value)}
            disabled={!canControl || busy}
            className="w-full accent-blue-500 disabled:opacity-40"
          />

          {/* Presets */}
          <div className="flex gap-1.5">
            <SpeedBtn label="Tắt"  value={0}   current={fanOn ? fanSpeed : 0} onClick={v => canControl && sendFan(v)} disabled={!canControl || busy} />
            <SpeedBtn label="Low"  value={33}  current={fanOn ? fanSpeed : 0} onClick={v => canControl && sendFan(v)} disabled={!canControl || busy} />
            <SpeedBtn label="Med"  value={66}  current={fanOn ? fanSpeed : 0} onClick={v => canControl && sendFan(v)} disabled={!canControl || busy} />
            <SpeedBtn label="Max"  value={100} current={fanOn ? fanSpeed : 0} onClick={v => canControl && sendFan(v)} disabled={!canControl || busy} />
          </div>
        </div>

        {/* ── Đèn phòng ── */}
        <div className={`rounded-xl border p-4 space-y-3 transition-opacity
          ${!canControl ? 'opacity-50' : ''} bg-amber-50 border-amber-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="text-sm font-semibold text-slate-700">Đèn phòng</span>
            </div>
            <Toggle
              checked={lightOn}
              onChange={toggleLight}
              disabled={!canControl || busy}
              colorOn="bg-amber-400"
            />
          </div>

          {/* Status visual */}
          <div className={`flex items-center justify-center h-16 rounded-lg transition-colors
            ${lightOn ? 'bg-amber-100' : 'bg-slate-100'}`}>
            <span className={`text-4xl transition-all ${lightOn ? 'opacity-100' : 'opacity-20'}`}>
              💡
            </span>
          </div>

          <p className={`text-center text-sm font-semibold
            ${lightOn ? 'text-amber-600' : 'text-slate-400'}`}>
            {lightOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </p>

          {/* Bật / Tắt buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => toggleLight(false)}
              disabled={!canControl || busy || !lightOn}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-300
                bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >Tắt</button>
            <button
              onClick={() => toggleLight(true)}
              disabled={!canControl || busy || lightOn}
              className="flex-1 py-2 text-sm font-semibold rounded-lg
                bg-amber-400 hover:bg-amber-500 text-white disabled:opacity-40 transition-colors"
            >Bật</button>
          </div>
        </div>

        {/* ── Cửa ── */}
        <div className={`rounded-xl border p-4 space-y-3 transition-opacity
          ${!canControl ? 'opacity-50' : ''} bg-emerald-50 border-emerald-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚪</span>
              <span className="text-sm font-semibold text-slate-700">Cửa</span>
            </div>
            <Toggle
              checked={doorOpen}
              onChange={toggleDoor}
              disabled={!canControl || busy}
              colorOn="bg-emerald-500"
            />
          </div>

          {/* Status visual */}
          <div className={`flex items-center justify-center h-16 rounded-lg transition-colors
            ${doorOpen ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            <span className="text-4xl">
              {doorOpen ? '🔓' : '🔒'}
            </span>
          </div>

          <p className={`text-center text-sm font-semibold
            ${doorOpen ? 'text-emerald-600' : 'text-slate-400'}`}>
            {doorOpen ? 'ĐANG MỞ' : 'ĐANG ĐÓNG'}
          </p>

          {/* Mở / Đóng buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => toggleDoor(false)}
              disabled={!canControl || busy || !doorOpen}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-300
                bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >Đóng</button>
            <button
              onClick={() => toggleDoor(true)}
              disabled={!canControl || busy || doorOpen}
              className="flex-1 py-2 text-sm font-semibold rounded-lg
                bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 transition-colors"
            >Mở</button>
          </div>
        </div>

      </div>
    </div>
  );
}
