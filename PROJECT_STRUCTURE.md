# Project Structure

```
HTTM/ (Air Quality Monitoring System)
│
├── backend/                          # Python FastAPI Backend
│   ├── main.py                       # Main FastAPI application (350 lines)
│   │                                  # - 10+ API endpoints
│   │                                  # - CORS middleware configuration
│   │                                  # - Service initialization
│   │
│   ├── fuzzy/                        # Fuzzy Logic Control Module
│   │   ├── __init__.py
│   │   └── fuzzy_controller.py       # Main fuzzy logic implementation (380 lines)
│   │       ├── MembershipFunction class
│   │       ├── FuzzyVariable class
│   │       └── FuzzyController class with 6 rules
│   │
│   ├── services/                     # Business Logic Services
│   │   ├── __init__.py
│   │   └── data_service.py           # CSV data loading and simulation (120 lines)
│   │       ├── DataService class
│   │       ├── load_data()
│   │       ├── get_current_record()
│   │       └── get_latest_records()
│   │
│   ├── utils/                        # Utility Functions
│   │   ├── __init__.py
│   │   └── alert_checker.py          # Alert generation and thresholds (150 lines)
│   │       ├── AlertChecker class
│   │       ├── THRESHOLDS dictionary
│   │       └── Alert enumeration
│   │
│   ├── tests/                        # Unit Tests
│   │   ├── __init__.py
│   │   ├── test_fuzzy_controller.py  # Fuzzy logic tests
│   │   ├── test_data_service.py      # Data service tests
│   │   └── test_alert_checker.py     # Alert system tests
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── requirements-dev.txt          # Development dependencies
│   ├── health_check.py               # Installation verification script
│   └── venv/                         # Virtual environment (created after install)
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx                   # Main router component (25 lines)
│   │   │                              # Tab-based navigation for 6 pages
│   │   │
│   │   ├── main.jsx                  # React entry point (10 lines)
│   │   │
│   │   ├── index.css                 # Global styles with Tailwind
│   │   │
│   │   ├── pages/                    # Page Components
│   │   │   ├── Dashboard.jsx         # Main monitoring dashboard (200 lines)
│   │   │   │   ├── Real-time data display with stat cards
│   │   │   │   ├── Auto-refresh every 5 seconds
│   │   │   │   ├── Current alerts panel
│   │   │   │   └── Mini charts for CO2 and temperature
│   │   │   │
│   │   │   ├── Charts.jsx            # Detailed charting page (150 lines)
│   │   │   │   ├── Data range selector (10/20/50/all samples)
│   │   │   │   ├── Parameter toggle checkboxes
│   │   │   │   └── Multi-series line charts with Recharts
│   │   │   │
│   │   │   ├── Alerts.jsx            # Alert management page (180 lines)
│   │   │   │   ├── Alert summary statistics
│   │   │   │   ├── Alert list with color coding
│   │   │   │   ├── Threshold information table
│   │   │   │   └── Recommendations section
│   │   │   │
│   │   │   ├── FuzzyDetails.jsx      # Fuzzy logic testing (350 lines)
│   │   │   │   ├── Slider inputs for 4 parameters
│   │   │   │   ├── Real-time control output
│   │   │   │   ├── Fuzzification details visualization
│   │   │   │   ├── 6 fuzzy rules explanation
│   │   │   │   └── Membership function reference
│   │   │   │
│   │   │   ├── Data.jsx              # Data table with pagination (280 lines)
│   │   │   │   ├── Searchable timestamp filter
│   │   │   │   ├── Pagination (10/20/50/100 per page)
│   │   │   │   ├── CSV export function
│   │   │   │   └── Responsive table layout
│   │   │   │
│   │   │   └── About.jsx             # System information (300 lines)
│   │   │       ├── System info card
│   │   │       ├── Architecture flow diagram
│   │   │       ├── Technology stack details
│   │   │       └── Specifications table
│   │   │
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── StatCard.jsx          # Metric display card with status
│   │   │   ├── Header.jsx            # Page title and subtitle
│   │   │   ├── Navbar.jsx            # Navigation tabs
│   │   │   ├── AlertPanel.jsx        # Alert list display
│   │   │   ├── Chart.jsx             # Recharts wrapper component
│   │   │   └── ControlOutput.jsx     # Ventilation control display
│   │   │
│   │   └── services/                 # API Integration
│   │       └── api.js                # Axios HTTP client (30 lines)
│   │           ├── Base configuration
│   │           └── API endpoint methods
│   │
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML template (15 lines)
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration with Tailwind
│   ├── package.json                  # NPM dependencies and scripts
│   ├── package-lock.json             # NPM lock file (created after npm install)
│   ├── .env.example                  # Environment variables template
│   └── node_modules/                 # Dependencies (created after npm install)
│
├── data/                             # Data Files
│   └── dataset.csv                   # Environmental sensor data (1000+ rows)
│       ├── 10 columns: Timestamp, Temperature, Humidity, 
│       │             CO2, PM2.5, PM10, TVOC, CO, Occupancy_Count, Ventilation_Status
│       └── Real-world environmental sensor readings
│
├── .vscode/                          # VS Code Settings
│   └── settings.json                 # Python and JavaScript formatting rules
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore patterns
│
├── Makefile                          # Build automation commands
│   ├── make install
│   ├── make dev (run both servers)
│   ├── make backend (backend only)
│   └── make frontend (frontend only)
│
├── install.sh                        # Installation script for Linux/Mac
├── install.bat                       # Installation script for Windows
│
├── README.md                         # Main documentation (500+ lines)
│   ├── Project overview
│   ├── Feature list
│   ├── System requirements
│   ├── Installation instructions
│   ├── Running instructions
│   ├── API endpoints reference
│   ├── Fuzzy logic explanation
│   └── Troubleshooting guide
│
├── QUICKSTART.md                     # Quick start guide
│   ├── Fastest installation methods
│   ├── Accessing the application
│   ├── Docker deployment
│   └── Troubleshooting tips
│
├── API_REFERENCE.md                  # Complete API documentation
│   ├── All endpoints with examples
│   ├── Request/response formats
│   ├── Error handling
│   └── Testing examples (cURL, Python, etc.)
│
├── CONTRIBUTING.md                   # Contribution guidelines
├── LICENSE                           # MIT License
│
└── PROJECT_STRUCTURE.md              # This file

```

## Directory Summary

| Directory | Purpose | Key Files | Size |
|-----------|---------|-----------|------|
| backend/ | FastAPI server with fuzzy logic | main.py, fuzzy_controller.py | ~1500 lines |
| frontend/ | React UI with Tailwind CSS | App.jsx, 6 pages, components/ | ~2500 lines |
| data/ | Environmental sensor data | dataset.csv | 1000+ rows |
| .vscode/ | VS Code project settings | settings.json | Dev environment |
| tests/ | Unit and integration tests | 3 test suites | ~300 lines |

## File Statistics

- **Total Python Files:** 8 (1 main, 1 controller, 1 service, 1 utils, 3 tests, 2 configs)
- **Total JavaScript/JSX Files:** 14 (1 main app, 6 pages, 6 components, 1 service)
- **Configuration Files:** 10+ (.env, docker-compose, Dockerfile, Makefile, etc.)
- **Documentation Files:** 4 (README, QUICKSTART, API_REFERENCE, CONTRIBUTING)
- **Total Lines of Code:** 5000+

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│           React Frontend (Port 5173)         │
│  Dashboard | Charts | Alerts | Fuzzy | Data │
└────────────────────┬────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────┐
│       FastAPI Backend (Port 8000)            │
│        - Data Service Layer                  │
│        - Fuzzy Logic Controller              │
│        - Alert Checker                       │
│        - API Routes                          │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         CSV Data Layer (dataset.csv)         │
│    Environmental Sensor Data (1000+ rows)    │
└─────────────────────────────────────────────┘
```

## Getting Started

1. Read README.md for detailed overview
2. Run QUICKSTART.md for fastest setup
3. Check API_REFERENCE.md for API details
4. Use PROJECT_STRUCTURE.md (this file) for navigation
5. Run `python health_check.py` in backend/ to verify installation
