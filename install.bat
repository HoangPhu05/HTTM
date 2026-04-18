@echo off
REM Installation script for Windows

echo 🏫 Installing Air Quality Monitoring System...
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1 || (
    echo Python is required
    exit /b 1
)

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1 || (
    echo Node.js is required
    exit /b 1
)

echo.
echo 📦 Installing Backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo.
echo 📦 Installing Frontend...
cd frontend
call npm install
cd ..

echo.
echo ✅ Installation complete!
echo.
echo To run the application:
echo   Terminal 1: cd backend && venv\Scripts\activate && python main.py
echo   Terminal 2: cd frontend && npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
