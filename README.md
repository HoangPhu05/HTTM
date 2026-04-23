# 🏫 Hệ thống Giám sát Chất lượng Không khí trong Phòng học

> Giám sát môi trường thời gian thực + Điều khiển thiết bị IoT bằng **Fuzzy Logic Control** qua MQTT

---

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng](#tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [IoT & MQTT](#iot--mqtt)
- [Fuzzy Logic Control](#fuzzy-logic-control)
- [API Endpoints](#api-endpoints)
- [Ngưỡng cảnh báo](#ngưỡng-cảnh-báo)

---

## 🎯 Tổng quan

Hệ thống bao gồm 3 tầng chính:

| Tầng | Công nghệ | Vai trò |
|------|-----------|---------|
| **Frontend** | React + Vite + Tailwind | Dashboard giám sát & điều khiển |
| **Backend** | FastAPI + Python | Fuzzy Logic, MQTT broker, REST API |
| **IoT** | ESP32 + MQTT | Nhận lệnh, điều khiển LED/thiết bị thực |

### Các chỉ số được theo dõi

| Chỉ số | Đơn vị |
|--------|--------|
| 🌡️ Nhiệt độ | °C |
| 💧 Độ ẩm | % |
| ☁️ CO2 | ppm |
| 💨 PM2.5 | µg/m³ |
| 🏭 PM10 | µg/m³ |
| 🚫 TVOC | ppb |
| ⚡ CO | ppm |
| 👥 Số người | người |

---

## 🏗️ Kiến trúc hệ thống

```
CSV Dataset
    │
    ▼
Backend (FastAPI)
    ├── DataService       — đọc từng hàng CSV mỗi 5s
    ├── FuzzyController   — tính mức thông gió (0–100%)
    ├── AlertChecker      — so sánh ngưỡng, tạo cảnh báo
    ├── IoTController     — gửi lệnh qua MQTT
    └── REST API          — cung cấp dữ liệu cho Frontend
          │
          ▼
    MQTT Broker (Mosquitto :1883)
          │
          ▼
    ESP32 (PubSubClient)
          ├── GPIO 25 — LED Xanh  → Quạt mức Thấp  (1–33%)
          ├── GPIO 26 — LED Vàng  → Quạt mức Trung (34–66%)
          ├── GPIO 27 — LED Đỏ   → Quạt mức Cao   (67–100%)
          ├── GPIO 32 — LED Trắng → Cửa (Mở/Đóng)
          └── GPIO 33 — LED Cam  → Đèn phòng (Bật/Tắt)
```

---

## ✨ Tính năng

### Dashboard
- Thẻ chỉ số môi trường với màu trạng thái (🟢🟡🔴)
- Cập nhật tự động mỗi **5 giây**
- Biểu đồ CO2 & PM2.5, Nhiệt độ & Độ ẩm (20 điểm gần nhất)
- Panel cảnh báo realtime

### Điều khiển IoT
- **Chế độ Tự động**: Fuzzy Logic tự gửi lệnh MQTT mỗi 5 giây
- **Chế độ Thủ công**: Người dùng điều khiển trực tiếp quạt/đèn/cửa
- Slider tốc độ quạt 0–100% + preset Tắt / Low / Med / Max
- Trạng thái kết nối MQTT realtime

### Fuzzy Logic Control
- Input: CO2, PM2.5, Độ ẩm, Số người
- Output: Mức thông gió 0–100% → Fan Status (Off/Low/Medium/High)
- Hiển thị Fuzzification, Active Rules, giải thích bằng tiếng Việt

### Bảng dữ liệu
- Phân trang (10/20/50/100 dòng/trang)
- Tìm kiếm theo thời gian
- Xuất CSV

---

## 🔧 Yêu cầu hệ thống

### Backend
- Python **3.9+**
- `fastapi`, `uvicorn`, `pandas`, `numpy`, `paho-mqtt`

### Frontend
- Node.js **16+**
- React 18, Vite, Tailwind CSS, Recharts

### MQTT Broker
- [Mosquitto](https://mosquitto.org/download/) (Windows/Linux/Mac)

### ESP32 (tuỳ chọn)
- Arduino IDE + thư viện: **PubSubClient** (Nick O'Leary), **ArduinoJson** (Benoit Blanchon)

---

## 📦 Cài đặt

### 1. Clone dự án
```bash
git clone https://github.com/HoangPhu05/HTTM.git
cd HTTM
```

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend
```bash
cd frontend
npm install
```

### 4. MQTT Broker (Mosquitto)
```bash
# Windows — chỉnh C:\Program Files\mosquitto\mosquitto.conf
listener 1883 0.0.0.0
allow_anonymous true

# Khởi động
net start mosquitto
# hoặc
mosquitto -c mosquitto.conf -v
```

---

## 🚀 Chạy ứng dụng

### Terminal 1 — Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
→ API: **http://localhost:8000**  
→ Swagger: **http://localhost:8000/docs**

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```
→ UI: **http://localhost:5173**

### ESP32
1. Mở `esp32/main_mqtt/main_mqtt.ino` bằng Arduino IDE
2. Chỉnh `WIFI_SSID`, `WIFI_PASSWORD`, `MQTT_BROKER` (IP máy chạy Mosquitto)
3. Upload lên board

---

## 📁 Cấu trúc dự án

```
HTTM/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── StatCard.jsx       # Thẻ chỉ số
│       │   ├── AlertPanel.jsx     # Panel cảnh báo
│       │   ├── Chart.jsx          # Biểu đồ Recharts
│       │   ├── ControlOutput.jsx  # Kết quả Fuzzy
│       │   └── IoTControl.jsx     # Điều khiển thiết bị
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Charts.jsx
│           ├── Alerts.jsx
│           ├── FuzzyDetails.jsx
│           ├── Data.jsx
│           └── About.jsx
│
├── backend/
│   ├── main.py                    # FastAPI app + auto-loop thread
│   ├── fuzzy/
│   │   └── fuzzy_controller.py    # Fuzzy Logic (fuzzify→rules→defuzzify)
│   ├── services/
│   │   └── data_service.py        # Đọc CSV tuần tự
│   ├── utils/
│   │   ├── alert_checker.py       # Kiểm tra ngưỡng cảnh báo
│   │   └── iot_controller.py      # MQTT client (paho)
│   └── requirements.txt
│
├── esp32/
│   ├── main_mqtt/
│   │   └── main_mqtt.ino          # Firmware ESP32 chính
│   └── test_led.ino               # Test LED lúc cài đặt
│
├── data/
│   └── dataset.csv                # 1000 bản ghi mẫu
│
└── README.md
```

---

## 📡 IoT & MQTT

### MQTT Topics

| Topic | Hướng | Mô tả |
|-------|-------|-------|
| `devices/control/fan/command` | Backend → ESP32 | Điều khiển quạt |
| `devices/control/door/command` | Backend → ESP32 | Điều khiển cửa |
| `devices/control/light/command` | Backend → ESP32 | Điều khiển đèn |
| `devices/status/fan` | ESP32 → Backend | Trạng thái quạt |
| `devices/status/door` | ESP32 → Backend | Trạng thái cửa |
| `devices/status/light` | ESP32 → Backend | Trạng thái đèn |

### Payload mẫu

```json
// Backend → ESP32 (quạt)
{ "device": "fan", "command": "set_speed", "value": 75 }

// ESP32 → Backend (quạt)
{ "device": "fan", "speed": 75, "running": true, "level": "high" }
```

### Logic điều khiển tự động

```
Quạt  : speed = ventilation_level (0–100%) từ Fuzzy Logic
Cửa   : mở khi CO2 > 1000 ppm
Đèn   : bật khi occupancy_count > 0
```

### GPIO ESP32

| GPIO | LED | Chức năng |
|------|-----|-----------|
| 25 | 🟢 Xanh | Quạt mức Thấp (1–33%) |
| 26 | 🟡 Vàng | Quạt mức Trung (34–66%) |
| 27 | 🔴 Đỏ | Quạt mức Cao (67–100%) |
| 32 | ⚪ Trắng | Cửa (sáng = mở) |
| 33 | 🟠 Cam | Đèn phòng (sáng = bật) |

---

## 🧠 Fuzzy Logic Control

### Cơ sở luật (Rule Base)

| # | Điều kiện | Kết quả | Trọng số |
|---|-----------|---------|---------|
| R1 | CO2 Cao **HOẶC** PM2.5 Cao | Quạt Cao | 1.0 |
| R2 | CO2 Trung **VÀ** Độ ẩm Cao | Quạt Trung | 0.8 |
| R3 | CO2 Thấp **VÀ** PM2.5 Thấp **VÀ** Người Thấp | Quạt Thấp | 0.9 |
| R4 | Người Cao | Quạt Cao | 0.7 |
| R5 | PM2.5 Cao | Quạt Cao | 0.85 |
| R6 | CO2 Trung **HOẶC** Người Trung | Quạt Trung | 0.6 |

### Membership Functions

| Biến | Thấp | Trung | Cao |
|------|------|-------|-----|
| CO2 (ppm) | 0–800 | 600–1800 | 1000–2000 |
| PM2.5 (µg/m³) | 0–35 | 25–100 | 75–200 |
| Độ ẩm (%) | 0–40 | 35–70 | 65–100 |
| Số người | 0–15 | 10–45 | 35–60 |

### Defuzzification → Fan Status

| Mức thông gió | Fan Status | LED |
|---------------|-----------|-----|
| < 15% | Off | Tắt |
| 15–32% | Low | 🟢 |
| 33–66% | Medium | 🟡 |
| ≥ 67% | High | 🔴 |

---

## 🔌 API Endpoints

### Dữ liệu
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/current-data` | Dữ liệu & Fuzzy output hiện tại |
| GET | `/api/data-history/{count}` | N bản ghi gần nhất |
| GET | `/api/all-data` | Toàn bộ dữ liệu (có phân trang) |

### Cảnh báo & Điều khiển
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/alerts` | Cảnh báo hiện tại |
| GET | `/api/control-output` | Kết quả Fuzzy Logic |
| POST | `/api/fuzzy-control` | Chạy Fuzzy với params tuỳ chỉnh |

### IoT Devices
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/devices/status` | Trạng thái thiết bị + MQTT |
| POST | `/api/devices/fan/control?speed=75` | Điều khiển quạt |
| POST | `/api/devices/door/control?open=true` | Điều khiển cửa |
| POST | `/api/devices/light/control?on=true` | Điều khiển đèn |
| POST | `/api/devices/manual-mode?enabled=true` | Bật/tắt chế độ thủ công |
| GET | `/api/devices/auto-loop` | Trạng thái auto-loop |

> Swagger UI: **http://localhost:8000/docs**

---

## 🚨 Ngưỡng cảnh báo

| Chỉ số | 🟢 Bình thường | 🟡 Cảnh báo | 🔴 Nguy hiểm |
|--------|--------------|------------|-------------|
| CO2 | < 800 ppm | 800–1200 ppm | ≥ 1200 ppm |
| PM2.5 | < 35 µg/m³ | 35–75 µg/m³ | ≥ 75 µg/m³ |
| PM10 | < 50 µg/m³ | 50–150 µg/m³ | ≥ 150 µg/m³ |
| TVOC | < 200 ppb | 200–400 ppb | ≥ 400 ppb |
| CO | < 4 ppm | 4–9 ppm | ≥ 9 ppm |
| Nhiệt độ | 16–28°C | 14–30°C | — |
| Độ ẩm | 40–70% | < 40% / > 70% | — |

---

## 🐛 Troubleshooting

**Backend lỗi port 8000**
```bash
# Windows — tìm và kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**MQTT không kết nối**
```bash
# Kiểm tra Mosquitto đang chạy
netstat -an | findstr 1883
# Kiểm tra IP trong esp32/main_mqtt/main_mqtt.ino và .env backend
```

**ESP32 không upload**
- Giữ nút BOOT trong lúc upload
- Giảm tốc độ upload xuống 115200 baud

---

## 📄 License

Free for educational and research purposes.

---

**Phiên bản**: 2.0.0  
**Nhóm**: Nhóm 3
