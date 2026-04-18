# 📚 Air Quality Monitoring System - Complete Guide

## Welcome! 👋

This is the **Air Quality Monitoring System in Classrooms with Fuzzy Logic Control** - a full-stack web application for real-time environmental monitoring and automated ventilation control.

---

## 📖 Documentation Index

### Getting Started (Start Here!)
1. **[QUICKSTART.md](QUICKSTART.md)** - Fastest way to get the app running
   - 3 installation methods (script-based, manual, Docker)
   - Accessing the application
   - Basic troubleshooting

2. **[README.md](README.md)** - Comprehensive project overview
   - Project objectives and features
   - System requirements
   - Detailed installation steps
   - Complete running instructions
   - Full API documentation
   - Fuzzy logic detailed explanation
   - Project structure
   - Extended troubleshooting

### Reference Materials
3. **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API documentation
   - All 10+ endpoints with request/response examples
   - Error handling and codes
   - Rate limiting information
   - Testing examples (cURL, Python, Swagger)

4. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Codebase navigation
   - Complete directory tree
   - File descriptions and purposes
   - Architecture layers diagram
   - File statistics

5. **[SETUP_VERIFICATION.md](SETUP_VERIFICATION.md)** - Verify your installation
   - Pre-installation checks
   - Post-installation verification
   - Runtime validation
   - Functional testing checklist
   - Performance verification
   - Troubleshooting guide

### Administrative
6. **[DELIVERY_CHECKLIST.md](DELIVERY_CHECKLIST.md)** - Project completion status
   - File creation checklist
   - Feature completeness verification
   - Code quality assessment
   - Documentation coverage
   - Deployment readiness

7. **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
   - Development setup
   - Code style guidelines
   - Testing requirements
   - Issue reporting

8. **[LICENSE](LICENSE)** - MIT License

---

## 🚀 Quick Start (30 seconds)

### Option A: Windows (Easiest)
```batch
install.bat
cd backend && venv\Scripts\activate && python main.py
# In new terminal:
cd frontend && npm run dev
```

### Option B: Linux/Mac
```bash
chmod +x install.sh
./install.sh
cd backend && source venv/bin/activate && python main.py
# In new terminal:
cd frontend && npm run dev
```

Then open: **http://localhost:5173**

---

## 📋 What's Included

### ✅ Complete Application
- **Backend:** Python FastAPI with Fuzzy Logic Control (1500+ lines)
- **Frontend:** React + Tailwind CSS with 6 pages (2500+ lines)
- **Data:** 1000+ rows of environmental sensor data
- **Tests:** Unit tests for all major modules

### ✅ Ready to Deploy
- Docker support with docker-compose
- Installation scripts for all platforms
- Configuration files for all environments
- Health check and verification scripts

### ✅ Comprehensive Documentation
- Setup guides (3 methods)
- API reference with examples
- Fuzzy logic explanation
- Project structure documentation
- Code contribution guidelines

---

## 📊 Application Features

### 🏠 Dashboard
- Real-time sensor data display
- Color-coded status indicators
- Auto-refreshing every 5 seconds
- Current alerts panel
- Mini charts for key metrics
- Ventilation control output

### 📈 Charts
- Multi-parameter visualization
- Configurable data ranges (10/20/50/all)
- Interactive toggle for parameters
- Line charts with legends and tooltips

### 🚨 Alerts
- Threshold-based alert generation
- Alert summary with danger/warning counts
- Detailed threshold information
- Environmental recommendations

### 🧠 Fuzzy Details
- Interactive fuzzy logic testing
- 4 input sliders (CO2, PM2.5, Humidity, Occupancy)
- Real-time fuzzification visualization
- 6 fuzzy rules explanation
- Membership function reference

### 📊 Data Management
- Full dataset view with pagination
- Search/filter by timestamp
- CSV export functionality
- Large dataset support (1000+ rows)

### ℹ️ About
- System information display
- Architecture flow diagram
- Technology stack details
- Fuzzy logic explanation
- Research background

---

## 🎯 Key Metrics

| Component | Value |
|-----------|-------|
| **Total Files** | 60+ |
| **Lines of Code** | 5000+ |
| **API Endpoints** | 10+ |
| **Frontend Pages** | 6 |
| **React Components** | 12 |
| **Test Cases** | 15+ |
| **Data Records** | 1000+ |
| **Fuzzy Rules** | 6 |
| **Monitored Parameters** | 8 |

---

## 🛠️ Technology Stack

### Backend
- **Python 3.9+** - Programming language
- **FastAPI** - Web framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical operations
- **scikit-fuzzy** - Fuzzy logic support
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Deployment
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Linux/Windows/Mac** - Multi-platform

---

## 📦 Installation Methods

### Method 1: Automated Scripts (Recommended)
```bash
# Windows
install.bat

# Linux/Mac
./install.sh
```

### Method 2: Manual Installation
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Method 3: Docker
```bash
docker-compose up
```

---

## ⚙️ System Requirements

**Minimum:**
- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- 500 MB disk space
- 2 GB RAM recommended

**Optional:**
- Docker 20.10+ (for containerized deployment)
- Git (for version control)

---

## ✨ Fuzzy Logic Control System

### Input Parameters
1. **CO2 Level** (0-2000 ppm) → Low/Medium/High
2. **PM2.5** (0-200 µg/m³) → Low/Medium/High
3. **Humidity** (0-100%) → Low/Medium/High
4. **Occupancy** (0-60 people) → Low/Medium/High

### Output
- **Ventilation Level** (0-100%) - Smooth fan speed control

### Rules (Examples)
- IF CO2 is HIGH → Increase ventilation
- IF PM2.5 is HIGH → Increase ventilation
- IF Occupancy is HIGH → Increase ventilation
- IF Humidity is HIGH → Increase ventilation
- IF All parameters are NORMAL → Decrease ventilation
- IF Multiple HIGHS → Maximum ventilation

### Processing
1. **Fuzzification** - Convert crisp inputs to fuzzy sets
2. **Rule Evaluation** - Apply 6 fuzzy rules
3. **Defuzzification** - Convert fuzzy output to crisp value (centroid method)

---

## 🔍 File Organization

```
HTTM/
├── backend/          # FastAPI server + Fuzzy Logic
├── frontend/         # React web application
├── data/             # Environmental sensor data (CSV)
├── .vscode/          # VS Code configuration
├── README.md         # Main documentation
├── QUICKSTART.md     # Quick start guide
├── API_REFERENCE.md  # API documentation
├── PROJECT_STRUCTURE.md
├── SETUP_VERIFICATION.md
├── DELIVERY_CHECKLIST.md
├── CONTRIBUTING.md
├── LICENSE
├── docker-compose.yml
├── Dockerfile.*      # Docker configurations
├── Makefile          # Build automation
└── install.*         # Installation scripts
```

---

## 🎓 Learning Path

### For Users
1. Read [QUICKSTART.md](QUICKSTART.md) (5 minutes)
2. Run installation script (10 minutes)
3. Visit http://localhost:5173 and explore dashboard (5 minutes)
4. Test Fuzzy Details page with sliders (5 minutes)
5. Check About page for system architecture (5 minutes)

### For Developers
1. Read [README.md](README.md) (15 minutes)
2. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (10 minutes)
3. Explore source code in backend/ and frontend/ (20 minutes)
4. Check [API_REFERENCE.md](API_REFERENCE.md) (10 minutes)
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines (5 minutes)

### For DevOps/Deployment
1. Check [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) (10 minutes)
2. Review `docker-compose.yml` and `Dockerfile.*` (5 minutes)
3. Test Docker build: `docker-compose build` (5 minutes)
4. Deploy with: `docker-compose up` (2 minutes)

---

## ✅ Verification Steps

After installation, verify everything works:

```bash
# 1. Check health
cd backend && python health_check.py

# 2. Run tests
python tests/test_fuzzy_controller.py
python tests/test_data_service.py
python tests/test_alert_checker.py

# 3. Start servers
python main.py  # Backend Terminal 1
npm run dev     # Frontend Terminal 2 (cd frontend first)

# 4. Verify in browser
# - Frontend: http://localhost:5173
# - API docs: http://localhost:8000/docs
```

---

## 🆘 Getting Help

### Common Issues
- **Port already in use** → See [QUICKSTART.md](QUICKSTART.md#troubleshooting)
- **Python/Node not found** → Check [README.md](README.md#requirements)
- **Dependencies failed** → See [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md#troubleshooting-checklist)
- **API errors** → Check [API_REFERENCE.md](API_REFERENCE.md#error-responses)

### Documentation Map
- **Setup issues:** [QUICKSTART.md](QUICKSTART.md)
- **How to use:** [README.md](README.md)
- **API questions:** [API_REFERENCE.md](API_REFERENCE.md)
- **Code structure:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Verify installation:** [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md)
- **Want to contribute:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🎉 Next Steps

1. **Install** the application using one of the three methods
2. **Verify** installation with health check
3. **Explore** the dashboard and other pages
4. **Test** the Fuzzy Logic with custom inputs
5. **Examine** the API documentation
6. **Read** the detailed documentation for insights
7. **Modify** configuration for your specific classroom needs
8. **Deploy** to production when ready

---

## 📞 Support Resources

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | Get running fast | 5-10 min |
| [README.md](README.md) | Complete overview | 20-30 min |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoints | 15-20 min |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Code organization | 10-15 min |
| [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) | Verify your setup | 10-15 min |
| [DELIVERY_CHECKLIST.md](DELIVERY_CHECKLIST.md) | What's included | 10 min |

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎯 Starting Point Recommendations

**First-time users:** Start with [QUICKSTART.md](QUICKSTART.md)
**Want details:** Read [README.md](README.md)  
**Integration needed:** Check [API_REFERENCE.md](API_REFERENCE.md)
**Exploring code:** Use [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

**Version:** 1.0.0  
**Created:** January 2024  
**Status:** ✅ Ready for Production

👉 **[START HERE: QUICKSTART.md](QUICKSTART.md)**
