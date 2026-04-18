# 🚀 Quick Start Guide

## Fastest Way to Run

### Option 1: Windows Batch Script (Recommended for Windows)
```batch
install.bat
```
Then open two terminals:
```batch
# Terminal 1
cd backend
venv\Scripts\activate
python main.py

# Terminal 2
cd frontend
npm run dev
```

### Option 2: Linux/Mac Shell Script
```bash
chmod +x install.sh
./install.sh
```
Then open two terminals:
```bash
# Terminal 1
cd backend && source venv/bin/activate && python main.py

# Terminal 2
cd frontend && npm run dev
```

### Option 3: Manual Installation (All Platforms)

**Backend Setup:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

**Frontend Setup (New Terminal):**
```bash
cd frontend
npm install
npm run dev
```

## Accessing the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation (Swagger):** http://localhost:8000/docs
- **API Documentation (ReDoc):** http://localhost:8000/redoc

## Verify Installation

Run the backend test suite:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python tests/test_fuzzy_controller.py
python tests/test_data_service.py
python tests/test_alert_checker.py
```

## Troubleshooting

**Issue: Port 8000 already in use**
```bash
# Find what's using port 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows
```

**Issue: Python version**
Ensure you have Python 3.9+:
```bash
python --version
```

**Issue: Node version**
Ensure you have Node 16+:
```bash
node --version
```

**Issue: Module not found**
Reinstall dependencies:
```bash
cd backend && pip install --upgrade -r requirements.txt
cd frontend && npm install
```

## Next Steps

1. Visit the Dashboard at http://localhost:5173
2. Explore the Charts page to see real-time data
3. Test the Fuzzy Logic details with custom inputs
4. Check the Alerts page for threshold information
5. Read the About page for system architecture

## Need More Help?

See the full README.md for:
- Detailed API documentation
- Fuzzy Logic Control explanation
- Feature descriptions
- Project structure overview
