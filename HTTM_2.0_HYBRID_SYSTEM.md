## 🚀 HTTM 2.0: HYBRID FUZZY + PREDICTION SYSTEM

### Nâng Cấp Chính

#### **Trước (v1.0):**
```
Sensor Data (hiện tại)
    ↓
[Fuzzy Logic] → Ventilation 50%
    ↓
[Device Control] → Fan bật 50%
```
**Problem:** Chỉ phản ứng với hiện tại, không biết trước

---

#### **Bây Giờ (v2.0):**
```
Sensor Data (hiện tại)              Last 20 rows (lịch sử)
    ↓                                      ↓
[Fuzzy Logic] → 50%          [LSTM Predictor] → Dự đoán 5p tiếp
    ↓                                      ↓
    └──────────[Hybrid Controller]────────┘
                     ↓
            [Make Decision] → max(50%, 70%) = 70%
                     ↓
            [Device Control] → Fan bật 70% (PROACTIVE)
                     ↓
            [Dashboard] → Hiển thị cả current + predicted + alert
```

**Lợi Ích:**
- ✅ **Dự báo trước:** CO2 sẽ tăng? → Bật fan ngay
- ✅ **Chủ động điều khiển:** Không chờ tình huống xấu xảy ra
- ✅ **Thông minh hơn:** Kết hợp rule-based + data-driven
- ✅ **Người dùng thấy rõ:** Dashboard hiển thị trend

---

### 📐 **Kiến Trúc Hệ Thống**

```
┌───────────────────────────────────────────────────────┐
│              HTTM 2.0 Architecture                     │
└───────────────────────────────────────────────────────┘

1. DATA LAYER
   ├─ Real-time Sensor / CSV Dataset
   ├─ Data preprocessing (normalize, ffill/bfill)
   └─ Historical data buffer (last 20 readings)

2. PREDICTION LAYER
   ├─ LSTM Neural Network (trained on 1000 rows)
   │  - Input: Last 20 readings (100 min)
   │  - Output: Predicted values for next 5 min
   │  - Features: CO2, PM2.5, PM10, Humidity, Temp, Occupancy, TVOC, CO
   └─ Weights saved as: backend/models/lstm_model.h5

3. FUZZY LOGIC LAYER
   ├─ FuzzyController (existing, unchanged)
   │  - 4 Input variables: CO2, PM2.5, Humidity, Occupancy
   │  - 6 IF-THEN rules
   │  - Output: Ventilation level (0-100%)
   └─ Applied to BOTH current + predicted values

4. HYBRID DECISION LAYER
   ├─ HybridFuzzyController (new)
   │  - Decision 1: Fuzzy(current_sensors) = 50%
   │  - Decision 2: Fuzzy(predicted_sensors) = 70%
   │  - Final: max(50%, 70%) = 70%
   │  - Alert: "⚠️ CO2 sẽ tăng +50 ppm"
   └─ Strategy: Proactive (use max for safety)

5. CONTROL LAYER
   ├─ Device Commands
   │  - Fan: Speed 0-100%
   │  - Door: Open/Semi-Open/Closed
   │  - Light: Off/Auto/On
   └─ MQTT → ESP32

6. PRESENTATION LAYER
   ├─ Dashboard (React/Vite)
   │  - Current readings + fuzzy output
   │  - Predicted readings + predicted output
   │  - Alert + reasoning
   │  - 5-minute trend graph
   └─ APIs
       - /api/current-data (current + predicted)
       - /api/predictions (just predictions)
       - /api/hybrid-decision (current vs predicted)
```

---

### 🎯 **3 Modes Hoạt Động**

```
1. AUTO MODE (Default)
   ├─ Backend chạy inference mỗi 5 giây
   ├─ LSTM dự đoán giá trị kế tiếp
   ├─ Hybrid controller quyết định
   ├─ MQTT gửi command tự động
   └─ User chỉ xem dashboard

2. MANUAL MODE
   ├─ Backend vẫn chạy inference (dashboard cập nhật)
   ├─ NHƯNG không gửi MQTT
   ├─ User click buttons → gửi MQTT từ frontend
   └─ Backend theo dõi device state từ IoT

3. MONITOR MODE
   ├─ Chỉ xem dữ liệu, không điều khiển
   ├─ Dùng cho quản lý xem tình trạng phòng
   └─ Report trends & alerts
```

---

### 📊 **Data Flow Example**

```
Thời điểm: 10:00 AM
──────────────────────────────────────────────────

CURRENT DATA (từ CSV row 200):
  CO2: 850 ppm
  PM2.5: 45 µg/m³
  Humidity: 62%
  Occupancy: 28 người

FUZZY LOGIC (hiện tại):
  Fuzzify: CO2_Medium(41.7%) + Occupancy_Medium(49%)
  Rule 6 fires: 49% strength
  Output: Ventilation = 50%

PREDICTION (LSTM - dùng rows 180-199):
  Input: 20 readings (100 phút lịch sử)
  Model: LSTM layer + Dense layer
  Output (denormalized):
    CO2: 900 ppm    ↑+50 ppm
    PM2.5: 50 µg/m³  ↑+5 µg/m³
    Humidity: 65%    ↑+3%
    Occupancy: 32 người ↑+4 người

FUZZY LOGIC (dự đoán):
  Fuzzify predicted: CO2_Medium(46%) + Occupancy_Medium(55%)
  Rule 6 fires: 55% strength
  Output: Ventilation_predicted = 65%

HYBRID DECISION:
  Current ventilation: 50%
  Predicted ventilation: 65%
  Final decision: max(50%, 65%) = 65%
  Change detected: YES (+15%)
  Alert: "⚠️ Air quality will worsen - CO2 rising +50 ppm!"
  
DEVICE COMMANDS:
  Fan speed: 65% (tăng từ 50%)
  Door: Semi-Open (giữ nguyên)
  Light: Auto (giữ nguyên)
  
MQTT → ESP32:
  {"fan": 65, "door": "semi-open", "light": "auto"}

DASHBOARD UPDATE:
  [Current] CO2: 850 | Ventilation: 50%
  [Predicted] CO2: 900 | Ventilation: 65% ↑
  [Alert] ⚠️ CO2 sẽ tăng trong 5 phút!
```

---

### 📁 **File Structure (Changes)**

```
backend/
├─ models/                    # NEW
│  ├─ __init__.py
│  ├─ lstm_predictor.py       # NEW: LSTM + ARIMA
│  └─ lstm_model.h5           # Generated after training
│
├─ fuzzy/
│  ├─ fuzzy_controller.py     # Existing (unchanged)
│  ├─ hybrid_controller.py    # NEW: Hybrid decision
│  └─ __init__.py
│
├─ services/
│  ├─ data_service.py         # MODIFIED: + prediction methods
│  └─ __init__.py
│
├─ main.py                     # MODIFIED: + hybrid logic
├─ requirements.txt            # MODIFIED: + tensorflow, scikit-learn
└─ ...

frontend/
├─ src/
│  ├─ components/
│  │  ├─ PredictionCard.jsx   # NEW
│  │  ├─ HybridDecision.jsx   # NEW
│  │  └─ TrendChart.jsx       # NEW
│  ├─ pages/
│  │  └─ Dashboard.jsx        # MODIFIED
│  └─ ...
└─ ...
```

---

### 🔌 **New API Endpoints**

```
1. GET /api/current-data
   Returns: current_data + control + predicted_data + hybrid_decision

2. GET /api/predictions
   Returns: predicted_values for next 5 minutes
   
3. GET /api/hybrid-decision
   Returns: current_vent + predicted_vent + final_decision + alert
   
4. GET /api/predictions/chart-data (New - optional)
   Returns: Historical + predicted trend for graphing
```

---

### ⚙️ **Training Process**

```
On Backend Startup:
├─ Load 1000 rows dari CSV
├─ Normalize: MinMax (0-1)
├─ Create sequences: (800, 20, 8)
├─ Train LSTM:
│  - Architecture: LSTM(64) → LSTM(32) → Dense(16) → Dense(8)
│  - Optimizer: Adam
│  - Loss: MSE
│  - Epochs: 50 (configurable)
│  - Time: ~5-10 minutes (first time, GPU optional)
└─ Save model → lstm_model.h5

On Inference (every 5 sec):
├─ Get last 20 readings from CSV buffer
├─ Normalize
├─ Forward through LSTM: (1, 20, 8) → (8,)
├─ Denormalize back to original scale
└─ Return as dict: {'CO2': 900, 'PM2.5': 50, ...}
```

---

### ✅ **Quick Start**

```bash
# 1. Install dependencies
pip install -r requirements.txt
# (This includes tensorflow - will take 5-10 min)

# 2. Run backend
python main.py
# Logs will show:
#   "Loading LSTM model..."
#   "Training new model on dataset..." (first time)
#   "✅ LSTM ready"
#   "[AutoLoop] #1 [AUTO] -> 50% (Medium) | Predicted: 65% | MQTT=OK"

# 3. Check APIs
curl http://localhost:8000/api/current-data
curl http://localhost:8000/api/predictions
curl http://localhost:8000/api/hybrid-decision

# 4. Open frontend
http://localhost:5173
# Dashboard will show:
#   [Current] CO2: 850 ppm
#   [Predicted] CO2: 900 ppm ↑
#   [Alert] ⚠️ ...
```

---

### 🐛 **Troubleshooting**

```
Q: TensorFlow installation quá lâu?
A: Bình thường (file ~350MB). Nếu quá 30 phút → Ctrl+C, 
   chỉ cài scikit-learn (fallback ARIMA).

Q: Error: "No module named tensorflow"?
A: pip install tensorflow

Q: Model training quá chậm?
A: - Giảm epochs: 50 → 20 trong data_service.py
   - Dùng ARIMA thay LSTM (cài statsmodels)
   - Enable GPU: Install tensorflow-gpu

Q: LSTM prediction kém chính xác?
A: Bình thường cho dataset nhỏ (1000 rows).
   - Thêm rows vào dataset
   - Tăng epochs: 50 → 100
   - Điều chỉnh LSTM architecture

Q: Mốn dùng ARIMA thay LSTM?
A: Uncomment ở main.py:
   # predictor = SimpleARIMAPredictor()
   predictor.train(data_service.data)
   # Rồi dùng bình thường như LSTM
```

---

### 🎓 **Concept: Hybrid Approach**

Tại sao KHÔNG dùng pure Machine Learning?
```
ML Only (❌ Tại sao không?):
├─ Black box: Không biết tại sao quyết định như vậy
├─ Data hungry: Cần 10,000+ rows để tốt
├─ Slow inference: 50-100ms per prediction
└─ Khó customize: Phải retrain khi thay rule

Fuzzy Only (❌ Tại sao không?):
├─ Cần expert knowledge: Khó viết rules chính xác
├─ Không học từ dữ liệu lịch sử
├─ Phản ứng quá chậm (reactive)
└─ Khó xử lý edge cases

Hybrid (✅ Tốt nhất):
├─ LSTM: Học pattern từ dữ liệu, dự đoán trend
├─ Fuzzy: Quyết định dựa trên logic, dễ hiểu
├─ Kết hợp: Proactive + Interpretable
└─ Linh hoạt: Dễ debug & customize
```

---

### 📈 **Improvement Ideas for Future**

```
1. Multi-step prediction
   Current: 1 step (5 min)
   Future: 12 steps (60 min ahead) → Better planning

2. Ensemble prediction
   Combine LSTM + ARIMA + Prophet
   → More robust predictions

3. Anomaly detection
   Detect unusual sensor patterns
   → Alert user early

4. Scheduled control
   Predict peak hours (lunch, break)
   → Proactive ventilation scheduling

5. User feedback loop
   User can rate predictions
   → Retrain model with feedback

6. Dashboard alerts
   Email/SMS notification when alert triggered
   → Real-time notification
```

---

### 📞 **Support**

Mệnh đề có gì thắc mắc về:
- LSTM training process?
- Fuzzy logic rules?
- API endpoints?
- Frontend integration?

Hãy hỏi! 🎯
