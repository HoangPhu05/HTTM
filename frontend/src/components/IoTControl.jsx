import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Toggle({ checked, onChange, disabled, colorOn = 'bg-teal-600' }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed
        ${checked ? colorOn : 'bg-slate-300'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow
          transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SpeedBtn({ label, value, current, onClick, disabled }) {
  const active = current === value;
  const variants = {
    0:   { active: 'bg-slate-700 text-white border-slate-700', idle: 'border-slate-200 text-slate-500 hover:bg-slate-50' },
    33:  { active: 'bg-emerald-600 text-white border-emerald-600', idle: 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700' },
    66:  { active: 'bg-amber-500 text-white border-amber-500', idle: 'border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700' },
    100: { active: 'bg-red-600 text-white border-red-600', idle: 'border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-700' },
  };
  const v = variants[value] ?? variants[0];
  return (
    <button
      onClick={() => onClick(value)}
      disabled={disabled}
      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all disabled:opacity-40
        ${active ? v.active : v.idle}`}
    >
      {label}
    </button>
  );
}

export default function IoTControl() {
  const [fanOn,    setFanOn]    = useState(false);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [lightOn,  setLightOn]  = useState(false);
  const [mqtt,     setMqtt]     = useState(false);
  const [manual,   setManual]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [toast,    setToast]    = useState(null);

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

  const toggleManual = async (val) => {
    try {
      await api.post(`/devices/manual-mode?enabled=${val}`);
      setManual(val);
      notify(val ? 'Chế độ thủ công — điều khiển trực tiếp' : 'Chế độ tự động đã bật lại');
    } catch {
      notify('Lỗi khi đổi chế độ', false);
    }
  };

  const sendFan = async (speed) => {
    setBusy(true);
    try {
      const r = await api.post(`/devices/fan/control?speed=${speed}`);
      if (r.data.success) {
        setFanSpeed(speed);
        setFanOn(speed > 0);
        notify(`Quạt: ${speed > 0 ? speed + '%' : 'Tắt'}`);
      }
    } catch { notify('Lỗi điều khiển quạt', false); }
    finally  { setBusy(false); }
  };

  const toggleLight = async (on) => {
    setBusy(true);
    try {
      const r = await api.post(`/devices/light/control?on=${on}`);
      if (r.data.success) {
        setLightOn(on);
        notify(`Đèn: ${on ? 'Bật' : 'Tắt'}`);
      }
    } catch { notify('Lỗi điều khiển đèn', false); }
    finally  { setBusy(false); }
  };

  const toggleDoor = async (open) => {
    setBusy(true);
    try {
      const r = await api.post(`/devices/door/control?open=${open}`);
      if (r.data.success) {
        setDoorOpen(open);
        notify(`Cửa: ${open ? 'Mở' : 'Đóng'}`);
      }
    } catch { notify('Lỗi điều khiển cửa', false); }
    finally  { setBusy(false); }
  };

  const toggleFan = (on) => sendFan(on ? (fanSpeed > 0 ? fanSpeed : 50) : 0);
  const canControl = mqtt && manual;

  return (
    <div className="card space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Điều khiển thiết bị</p>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          mqtt ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${mqtt ? 'bg-emerald-500 live-dot' : 'bg-red-500'}`} />
          {mqtt ? 'MQTT kết nối' : 'MQTT ngắt'}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg font-medium ${
          toast.ok ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-700'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${toast.ok ? 'bg-teal-500' : 'bg-red-500'}`} />
          {toast.msg}
        </div>
      )}

      {/* Mode toggle */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
        manual ? 'border-violet-200 bg-violet-50/60' : 'border-slate-200 bg-slate-50/60'
      }`}>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {manual ? 'Chế độ thủ công' : 'Chế độ tự động'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {manual
              ? 'Fuzzy Logic tạm dừng — bạn điều khiển trực tiếp'
              : 'Fuzzy Logic tự gửi lệnh định kỳ'}
          </p>
        </div>
        <Toggle checked={manual} onChange={toggleManual} colorOn="bg-violet-500" />
      </div>

      {!canControl && (
        <p className="text-xs text-center text-slate-400 -mt-1">
          {!mqtt ? 'Chưa kết nối MQTT' : 'Bật chế độ thủ công để điều khiển trực tiếp'}
        </p>
      )}

      {/* Device cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Fan */}
        <div className={`rounded-xl border p-4 space-y-3 transition-opacity bg-blue-50/60 border-blue-200 ${!canControl ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💨</span>
              <span className="text-sm font-semibold text-slate-700">Quạt</span>
            </div>
            <Toggle checked={fanOn} onChange={toggleFan} disabled={!canControl || busy} colorOn="bg-blue-500" />
          </div>
          <div className="text-center">
            <span className="num text-2xl font-semibold text-blue-700">{fanSpeed}</span>
            <span className="text-xs text-slate-400 ml-1">%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={fanSpeed}
            onChange={(e) => setFanSpeed(+e.target.value)}
            onMouseUp={(e) => canControl && !busy && sendFan(+e.target.value)}
            onTouchEnd={(e) => canControl && !busy && sendFan(+e.target.value)}
            disabled={!canControl || busy}
            className="w-full accent-blue-500 disabled:opacity-40"
          />
          <div className="flex gap-1.5">
            <SpeedBtn label="Tắt" value={0}   current={fanOn ? fanSpeed : 0} onClick={(v) => canControl && sendFan(v)} disabled={!canControl || busy} />
            <SpeedBtn label="Thấp" value={33}  current={fanOn ? fanSpeed : 0} onClick={(v) => canControl && sendFan(v)} disabled={!canControl || busy} />
            <SpeedBtn label="Vừa" value={66}  current={fanOn ? fanSpeed : 0} onClick={(v) => canControl && sendFan(v)} disabled={!canControl || busy} />
            <SpeedBtn label="Max" value={100} current={fanOn ? fanSpeed : 0} onClick={(v) => canControl && sendFan(v)} disabled={!canControl || busy} />
          </div>
        </div>

        {/* Light */}
        <div className={`rounded-xl border p-4 space-y-3 transition-opacity bg-amber-50/60 border-amber-200 ${!canControl ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="text-sm font-semibold text-slate-700">Đèn phòng</span>
            </div>
            <Toggle checked={lightOn} onChange={toggleLight} disabled={!canControl || busy} colorOn="bg-amber-400" />
          </div>
          <div className={`flex items-center justify-center h-16 rounded-lg transition-colors ${
            lightOn ? 'bg-amber-100' : 'bg-slate-100'
          }`}>
            <span className={`text-4xl transition-opacity ${lightOn ? 'opacity-100' : 'opacity-20'}`}>💡</span>
          </div>
          <p className={`text-center text-sm font-semibold ${lightOn ? 'text-amber-700' : 'text-slate-400'}`}>
            {lightOn ? 'Đang bật' : 'Đang tắt'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleLight(false)}
              disabled={!canControl || busy || !lightOn}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >Tắt</button>
            <button
              onClick={() => toggleLight(true)}
              disabled={!canControl || busy || lightOn}
              className="flex-1 py-2 text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-500 text-white disabled:opacity-40 transition-colors"
            >Bật</button>
          </div>
        </div>

        {/* Door */}
        <div className={`rounded-xl border p-4 space-y-3 transition-opacity bg-emerald-50/60 border-emerald-200 ${!canControl ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚪</span>
              <span className="text-sm font-semibold text-slate-700">Cửa</span>
            </div>
            <Toggle checked={doorOpen} onChange={toggleDoor} disabled={!canControl || busy} colorOn="bg-emerald-500" />
          </div>
          <div className={`flex items-center justify-center h-16 rounded-lg transition-colors ${
            doorOpen ? 'bg-emerald-100' : 'bg-slate-100'
          }`}>
            <span className="text-4xl">{doorOpen ? '🔓' : '🔒'}</span>
          </div>
          <p className={`text-center text-sm font-semibold ${doorOpen ? 'text-emerald-700' : 'text-slate-400'}`}>
            {doorOpen ? 'Đang mở' : 'Đang đóng'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleDoor(false)}
              disabled={!canControl || busy || !doorOpen}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >Đóng</button>
            <button
              onClick={() => toggleDoor(true)}
              disabled={!canControl || busy || doorOpen}
              className="flex-1 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 transition-colors"
            >Mở</button>
          </div>
        </div>

      </div>
    </div>
  );
}
