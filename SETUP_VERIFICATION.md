# 🔍 Setup Verification Guide

## Pre-Installation Checks

### System Requirements
Run this command to check your system:

```bash
# Check Python version
python --version
# Expected: Python 3.9 or higher

# Check Node.js version
node --version
# Expected: v16.0.0 or higher

# Check npm version
npm --version
# Expected: v7.0.0 or higher
```

---

## Installation Completion Verification

### Backend Verification

#### 1. Virtual Environment Created
```bash
cd backend
# Windows
ls venv\Scripts
# Expected: python.exe, pip.exe, activate.bat

# Linux/Mac
ls -la venv/bin
# Expected: python, pip, activate
```

#### 2. Dependencies Installed
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

pip list
# Expected: fastapi, pandas, numpy, uvicorn, scikit-fuzzy
```

#### 3. Run Health Check
```bash
cd backend
python health_check.py
# Expected: ✅ All checks passed! Ready to run.
```

### Frontend Verification

#### 1. Dependencies Installed
```bash
cd frontend
ls -la node_modules
# Expected: >1000 directories (packages)

npm list
# Expected: Lists all installed packages
```

#### 2. Key Packages Installed
```bash
cd frontend
npm ls react recharts axios tailwindcss vite
# Expected: All packages listed with versions
```

#### 3. Build System Ready
```bash
cd frontend
npm run build
# Expected: Successfully builds dist/ folder
```

### Data File Verification

#### 1. CSV File Exists and Valid
```bash
cd ..
head -5 data/dataset.csv
# Expected: First 5 rows with proper headers
```

#### 2. Check File Size
```bash
wc -l data/dataset.csv  # Linux/Mac
# or
findstr /c: data\dataset.csv | find /c: ^   # Windows
# Expected: 1000+ lines
```

---

## Runtime Verification

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**In another terminal, verify API:**
```bash
# Health check
curl http://localhost:8000/api/health

# Expected response:
# {"status": "healthy", ...}
```

### Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v... 05:xx:xx AM [vite] ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verify in browser:**
- Visit: http://localhost:5173
- Expected: Dashboard page loads with data

---

## Functional Verification

### 1. Dashboard Page
- [ ] Page loads without errors
- [ ] Displays 8+ sensor parameters with current values
- [ ] Status cards show appropriate colors (green/yellow/red)
- [ ] Auto-refresh works (data updates every 5 seconds)
- [ ] Charts display data trends
- [ ] Control output shows ventilation level

### 2. Charts Page
- [ ] Page loads with line chart
- [ ] Range selector buttons work (10/20/50/all)
- [ ] Parameter checkboxes toggle series on/off
- [ ] Chart updates when range changes
- [ ] Legend shows selected parameters

### 3. Alerts Page
- [ ] Shows alert summary statistics
- [ ] Displays current alerts (if any) with colors
- [ ] Threshold information table appears
- [ ] Recommendations section visible
- [ ] Counts match alert summary

### 4. Fuzzy Details Page
- [ ] Four sliders appear for inputs (CO2, PM2.5, Humidity, Occupancy)
- [ ] Slider values update in real-time
- [ ] Control output updates when sliders move
- [ ] Fuzzification details show membership values
- [ ] Rule explanation displays applicable rules
- [ ] Membership function reference visible

### 5. Data Page
- [ ] Data table loads with first 10 rows
- [ ] Search/filter works with timestamp
- [ ] Pagination buttons work (10/20/50/100 per page)
- [ ] Page navigation works correctly
- [ ] CSV export button generates downloadable file
- [ ] Table displays all 10 columns correctly

### 6. About Page
- [ ] System info card displays correct data
- [ ] Architecture diagram shows flowing
- [ ] Technology stack visible in grid
- [ ] Specifications table appears
- [ ] Fuzzy logic explanation present

---

## API Endpoint Verification

Test all endpoints:

### Health & Status
```bash
curl http://localhost:8000/api/health
# Expected: {status: "healthy", ...}

curl http://localhost:8000/api/system-info
# Expected: {name: "...", version: "...", ...}
```

### Data Endpoints
```bash
curl http://localhost:8000/api/current-data
# Expected: {temperature, humidity, co2, pm25, ...}

curl http://localhost:8000/api/data/latest?count=50
# Expected: array of 50 records

curl http://localhost:8000/api/data/history?limit=100
# Expected: array of 100 records
```

### Fuzzy Control
```bash
curl http://localhost:8000/api/control-output
# Expected: {ventilation_level, fan_status, ...}

curl -X POST http://localhost:8000/api/fuzzy-control \
  -H "Content-Type: application/json" \
  -d '{"co2": 1200, "pm25": 45, "humidity": 60, "occupancy": 35}'
# Expected: {ventilation_level, fan_status, ...}
```

### Alert Endpoints
```bash
curl http://localhost:8000/api/alerts
# Expected: {alerts: [...], count: X, hasAlerts: bool}

curl http://localhost:8000/api/alerts/summary
# Expected: {total, danger, warning, normal, hasAlerts}

curl http://localhost:8000/api/thresholds
# Expected: {thresholds: {...}}
```

### API Documentation
```
Visit: http://localhost:8000/docs
# Expected: Swagger UI with all endpoints listed
# Try: Click on endpoints and use "Try it out" button
```

---

## Performance Verification

### Backend Performance
```bash
# Check response time
time curl http://localhost:8000/api/current-data
# Expected: < 100ms response time

# Monitor CPU/Memory
# Windows: Task Manager > Performance
# Linux: top or htop command
# Expected: Low CPU usage, mem < 500MB
```

### Frontend Performance
```bash
# In browser console (F12)
console.time('API-Request');
fetch('http://localhost:8000/api/current-data').then(r => r.json()).then(() => console.timeEnd('API-Request'));
# Expected: < 100ms response time
```

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected:** Fully functional in all modern browsers

---

## Troubleshooting Checklist

### If Backend Won't Start
- [ ] Python 3.9+ installed? (`python --version`)
- [ ] Virtual environment activated? (`pip list` shows fastapi)
- [ ] Port 8000 free? (`lsof -i :8000` on Linux/Mac)
- [ ] CSV file exists? (`ls data/dataset.csv`)
- [ ] Dependencies installed? (`pip install -r requirements.txt`)

### If Frontend Won't Start
- [ ] Node 16+ installed? (`node --version`)
- [ ] npm installed? (`npm --version`)
- [ ] Dependencies installed? (`npm ls react`)
- [ ] Port 5173 free? (`lsof -i :5173` on Linux/Mac)
- [ ] Clear npm cache: `npm cache clean --force`

### If APIs Return Errors
- [ ] Backend running on port 8000?
- [ ] Check API docs: `http://localhost:8000/docs`
- [ ] Check console for error messages
- [ ] Verify CSV file has data: `wc -l data/dataset.csv`

### If Page Loads Slowly
- [ ] Check network tab in browser (F12)
- [ ] Verify API response times
- [ ] Check backend CPU/memory usage
- [ ] Restart both servers

---

## Unit Test Verification

Run the test suites:

```bash
cd backend
source venv/bin/activate

# Test Fuzzy Controller
python tests/test_fuzzy_controller.py
# Expected: ✅ All tests passed!

# Test Data Service
python tests/test_data_service.py
# Expected: ✅ All data service tests passed!

# Test Alert Checker
python tests/test_alert_checker.py
# Expected: ✅ All alert checker tests passed!
```

---

---

## Final Verification Checklist

Before considering setup complete:

### Code ✅
- [ ] All source files present (50+ files)
- [ ] No syntax errors in any file
- [ ] All imports resolve correctly
- [ ] Tests pass successfully

### Documentation ✅
- [ ] README.md complete and readable
- [ ] QUICKSTART.md accessible
- [ ] API_REFERENCE.md comprehensive
- [ ] PROJECT_STRUCTURE.md accurate

### Functionality ✅
- [ ] All 6 pages load and function
- [ ] All 10+ API endpoints work
- [ ] Fuzzy logic control responsive
- [ ] Data displays and updates
- [ ] Alerts generate correctly
- [ ] Charts render properly

### Performance ✅
- [ ] API response < 200ms
- [ ] Page load < 2 seconds
- [ ] Auto-refresh works smoothly
- [ ] No console errors
- [ ] No memory leaks over 10 min

### Deployment ✅
- [ ] Can start both servers
- [ ] Can access both UIs
- [ ] Swagger docs available
- [ ] Health check passes
- [ ] Environment variables configurable

---

## Sign-Off

If all checks pass, your installation is **COMPLETE** and ready for:
- Development work
- Testing and validation
- Demonstration to stakeholders
- Production deployment (with additional hardening)

**Next Steps:**
1. Review README.md for usage details
2. Explore the application UI
3. Read Fuzzy Logic explanation in About page
4. Test API endpoints with Swagger UI
5. Modify thresholds/rules as needed for your classroom environment

---

**Need Help?**
- Check QUICKSTART.md for common issues
- See README.md Troubleshooting section
- Review API_REFERENCE.md for endpoint details
- Check browser console (F12) for error messages
- Check terminal output for server errors

**Status:** Ready for production use ✅
