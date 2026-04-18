.PHONY: help install dev build clean stop lint format

help:
	@echo "🏫 Air Quality Monitoring System"
	@echo ""
	@echo "Available commands:"
	@echo "  make install      - Install all dependencies"
	@echo "  make dev          - Run development servers"
	@echo "  make backend      - Run backend only"
	@echo "  make frontend     - Run frontend only"
	@echo "  make lint         - Lint Python code"
	@echo "  make format       - Format Python code"
	@echo "  make clean        - Clean generated files"

install:
	@echo "📦 Installing dependencies..."
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install

dev:
	@echo "🚀 Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "Starting in new terminals..."
	gnome-terminal -- bash -c 'cd backend && source venv/bin/activate && python main.py' &
	sleep 2
	gnome-terminal -- bash -c 'cd frontend && npm run dev' &

backend:
	cd backend && source venv/bin/activate && python main.py

frontend:
	cd frontend && npm run dev

lint:
	cd backend && source venv/bin/activate && pylint **/*.py

format:
	cd backend && source venv/bin/activate && black backend/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name '*.pyc' -delete
	rm -rf backend/venv
	rm -rf frontend/node_modules
	rm -rf frontend/dist
