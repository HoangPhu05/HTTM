## 🚀 **HTTM 2.0 SETUP GUIDE**

### 📋 **What's New**

✅ **LSTM Time Series Prediction Model**
- Predicts air quality for next 5 minutes
- Trained on 1000 historical data points
- Features: CO2, PM2.5, PM10, Humidity, Temperature, Occupancy, TVOC, CO

✅ **Hybrid Fuzzy Logic Controller**
- Combines current sensor readings + predictions
- Makes proactive decisions (not just reactive)
- Automatically chooses MAX ventilation for safety

✅ **Enhanced Dashboard**
- Shows current vs predicted values
- Visual indicators for changes (↑↓)
- Alerts when significant changes detected
- Reasoning for decisions

✅ **New API Endpoints**
- `GET /api/current-data` - Current + predicted data
- `GET /api/predictions` - Just predictions
- `GET /api/hybrid-decision` - Decision details

---

### ⚙️ **Installation Steps**

#### **Step 1: Install ML Dependencies**
```bash
cd backend

# Install TensorFlow, scikit-learn, statsmodels
pip install tensorflow scikit-learn statsmodels

# Or install from requirements.txt
pip install -r requirements.txt
```

**⏱️ Note:** TensorFlow is ~350MB - may take 5-10 minutes
- If too slow, you can skip tensorflow and use ARIMA (lightweight alternative)
- To use ARIMA only: `pip install statsmodels` (skip tensorflow)

#### **Step 2: Run Backend**
```bash
cd backend
python main.py
```

**Expected Log Output:**
```
Loaded 1000 rows from dataset.csv
🤖 Initializing LSTM Predictor...
   🚀 Training new model on dataset... (first time, ~5 min)
   OR
   📂 Loading existing model...
✅ LSTM Predictor ready for predictions

Air Quality Monitoring System started
[AutoLoop] Thread started - interval=5s
[AutoLoop] Background thread launched (alive=True)

INFO: Uvicorn running on http://0.0.0.0:8000
```

#### **Step 3: Run Frontend**
```bash
cd frontend
npm run dev
```

Open browser: **http://localhost:5173**

---

### 🔍 **Testing Predictions**

#### **Test Current Data Endpoint**
```bash
curl http://localhost:8000/api/current-data
```

Response includes:
```json
{
  "data": {
    "co2": 850,
    "pm25": 45,
    ...
  },
  "control": {
    "ventilation_level": 50,
    "fan_status": "MEDIUM",
    ...
  },
  "predicted_data": {
    "CO2": 900,
    "PM2.5": 50,
    ...
  },
  "hybrid_decision": {
    "current_reading": 50,
    "predicted_reading": 70,
    "ventilation_level": 70,  ← Final decision (MAX)
    "alert_message": "⚠️ CO2 will increase...",
    ...
  }
}
```

#### **Test Predictions Endpoint**
```bash
curl http://localhost:8000/api/predictions
```

Response:
```json
{
  "status": "available",
  "predicted_values": {
    "CO2": 900,
    "PM2.5": 50,
    "PM10": 60,
    "Humidity": 65,
    "Temperature": 24,
    "Occupancy_Count": 32,
    "TVOC": 280,
    "CO": 2.5
  }
}
```

#### **Test Hybrid Decision Endpoint**
```bash
curl http://localhost:8000/api/hybrid-decision
```

---

### 📊 **Dashboard Features**

#### **Current Status Panel** (Left)
- Shows real-time sensor values
- Displays fuzzy logic output for current data
- Updates every 5 seconds

#### **Prediction Panel** (Right)
- Shows predicted values for next 5 minutes
- Shows change arrows (↑↓) with magnitude
- Displays predicted fuzzy output

#### **Hybrid Decision** (Full Width)
- **Current Ventilation**: Fuzzy output from current data
- **Predicted Ventilation**: Fuzzy output from predicted data
- **Final Decision**: MAX(current, predicted)
- **Alert**: If change > 15%, shows warning
- **Reasoning**: Why this decision was made

---

### ⚡ **Key Concepts**

#### **Proactive vs Reactive Control**
```
BEFORE (v1.0):
CO2 = 850 ppm → Fuzzy says 50% → Device already running at 50%
CO2 rises to 900 ppm (OH NO!) → Too late, air already bad

AFTER (v2.0):
CO2 = 850 ppm → LSTM predicts 900 ppm
Fuzzy(current) = 50%, Fuzzy(predicted) = 70%
MAX(50%, 70%) = 70% → Device PREEMPTIVELY runs at 70%
CO2 doesn't rise as much → Better air quality! ✅
```

#### **Strategy: Maximum Value**
```
Why use MAX(current, predicted)?
- Safety-first approach
- If prediction shows air quality getting worse → increase ventilation now
- Prevents reactive response to bad conditions
- More proactive and responsive to trends
```

---

### 🐛 **Troubleshooting**

| Problem | Solution |
|---------|----------|
| "No module named tensorflow" | `pip install tensorflow` |
| LSTM training very slow | Reduce epochs in data_service.py: `epochs=20` instead of 50 |
| LSTM not loading model | First run trains new model - wait for "✅ LSTM ready" |
| Predictions not showing in dashboard | Check backend logs for prediction errors |
| "DISCONNECTED" MQTT error | Normal - no ESP32 connected. System still works locally |

#### **If TensorFlow Installation Fails**
You can use lightweight ARIMA predictor instead:

```python
# In backend/main.py, replace:
# predictor = LSTMPredictor()
# with:
predictor = SimpleARIMAPredictor()
predictor.train(data_service.data)
```

Then only install: `pip install statsmodels scikit-learn`

---

### 📁 **Modified Files Summary**

**Backend:**
- ✅ `models/lstm_predictor.py` - NEW: LSTM + ARIMA models
- ✅ `models/__init__.py` - NEW
- ✅ `fuzzy/hybrid_controller.py` - NEW: Hybrid decision logic
- ✅ `fuzzy/__init__.py` - MODIFIED: Export hybrid controller
- ✅ `services/data_service.py` - MODIFIED: Add prediction methods
- ✅ `main.py` - MODIFIED: Integrate hybrid logic + new endpoints
- ✅ `requirements.txt` - MODIFIED: Add tensorflow, scikit-learn, statsmodels

**Frontend:**
- ✅ `components/PredictionPanel.jsx` - NEW: Display current vs predicted
- ✅ `pages/Dashboard.jsx` - MODIFIED: Import & use PredictionPanel

**Documentation:**
- ✅ `HTTM_2.0_HYBRID_SYSTEM.md` - Comprehensive guide
- ✅ `SETUP_GUIDE.md` - This file

---

### 🎯 **Next Steps**

1. **Install dependencies**: Follow Step 1 above
2. **Run backend**: Should auto-train LSTM on first run
3. **Run frontend**: Dashboard will show predictions
4. **Check predictions**: Open `http://localhost:5173` → Scroll down to "Dự báo & Quyết định Hybrid"
5. **Monitor logs**: Backend logs show prediction updates

---

### 📈 **Performance Notes**

| Component | Time | Notes |
|-----------|------|-------|
| LSTM Model Training | 5-10 min | First run only, then loads cached model |
| Inference per cycle | <100ms | Run every 5 seconds, no UI lag |
| Frontend Update | <1s | React re-renders with new data |
| Total latency | ~5s | Matches auto-loop interval |

---

### 🎓 **Understanding the System**

```
┌────────────────────────────────────────────┐
│  HTTM 2.0: Hybrid Intelligent System       │
└────────────────────────────────────────────┘

[CSV Data]
    ↓
[DataService] ← Loads 1000 rows, normalizes
    ├─ Current Record: CO2=850, PM2.5=45
    ├─ Last 20 rows: [record1, record2, ..., record20]
    └─ [LSTM] → Predict: CO2=900, PM2.5=50
         ↓
[FuzzyController]
    ├─ Fuzzy(current) → 50%
    ├─ Fuzzy(predicted) → 70%
    └─ [HybridController] → MAX(50%, 70%) = 70%
         ↓
[Device Control]
    ├─ Fan: 70% speed
    ├─ Door: Semi-Open
    └─ Light: Auto
         ↓
[MQTT] → ESP32
    ├─ Takes action
    └─ Real-world ventilation
         ↓
[Dashboard] ← User sees everything
    ├─ Current: 850 ppm
    ├─ Predicted: 900 ppm ↑
    ├─ Alert: "⚠️ CO2 rising!"
    └─ Decision: 70% ventilation
```

---

### 📞 **Support**

Questions about:
- LSTM training process?
- Fuzzy logic rules?
- Hybrid decision strategy?
- API responses?

Check `HTTM_2.0_HYBRID_SYSTEM.md` for detailed explanations!

---

**Last Updated:** April 2024
**Version:** 2.0.0
