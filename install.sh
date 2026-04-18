#!/bin/bash
# Installation script for Linux/Mac

echo "🏫 Installing Air Quality Monitoring System..."
echo ""

# Check Python
echo "Checking Python..."
python3 --version || { echo "Python 3 is required"; exit 1; }

# Check Node.js
echo "Checking Node.js..."
node --version || { echo "Node.js is required"; exit 1; }

echo ""
echo "📦 Installing Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo ""
echo "📦 Installing Frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To run the application:"
echo "  Terminal 1: cd backend && source venv/bin/activate && python main.py"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
