#!/bin/bash
# Local Testing Script for Sketch2Shop
# This script helps you start all services locally

echo "🚀 Sketch2Shop - Local Testing Setup"
echo ""

# Check if .env files exist
if [ ! -f "python-api/.env" ]; then
    echo "⚠️  python-api/.env not found!"
    echo "   Creating template from .env.example..."
    cp python-api/.env.example python-api/.env 2>/dev/null || echo "GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001
DEBUG=false" > python-api/.env
    echo "   ✏️  Please edit python-api/.env with your GEMINI_API_KEY"
    echo ""
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "   Creating template from .env.example..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "SERPAPI_KEY=your_serpapi_key_here
PORT=5002" > backend/.env
    echo "   ✏️  Please edit backend/.env with your SERPAPI_KEY"
    echo ""
fi

# Check if API keys are set
if grep -q "your_gemini_api_key_here" python-api/.env 2>/dev/null || grep -q "your_serpapi_key_here" backend/.env 2>/dev/null; then
    echo "⚠️  Please update .env files with your actual API keys!"
    echo "   Edit: python-api/.env and backend/.env"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

echo "📋 Starting services..."
echo ""
echo "You'll need 3 terminal windows. Here's what to run:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TERMINAL 1 - Python API:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "cd python-api"
echo "source venv/bin/activate  # or: venv\\Scripts\\activate (Windows)"
echo "python app.py"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TERMINAL 2 - Backend:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "cd backend"
echo "npm start"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TERMINAL 3 - Frontend:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "cd frontend/shop-a-sketch"
echo "npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once all services are running:"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🔧 Python API: http://localhost:5001"
echo "  🔧 Backend: http://localhost:5002"
echo ""
echo "📖 See TEST-LOCAL.md for detailed instructions"
echo ""
