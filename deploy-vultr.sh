#!/bin/bash
# Vultr Deployment Script for Sketch2Shop
# Run this script on your Vultr VPS instance

set -e

echo "🚀 Starting Sketch2Shop deployment on Vultr..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    apt update
    apt install docker-compose -y
fi

# Verify .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# API Keys (REQUIRED - Update these!)
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here

# Frontend API URLs (Update with your server IP or domain)
VITE_PYTHON_API_URL=http://$(hostname -I | awk '{print $1}'):5001
VITE_NODE_API_URL=http://$(hostname -I | awk '{print $1}'):5002
EOF
    echo "✏️  Please edit .env file with your API keys before continuing!"
    echo "   Run: nano .env"
    exit 1
fi

# Check if API keys are set
if grep -q "your_serpapi_key_here" .env || grep -q "your_gemini_key_here" .env; then
    echo "⚠️  Please update .env file with your actual API keys!"
    echo "   Run: nano .env"
    exit 1
fi

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw allow 5001/tcp 2>/dev/null || true
ufw allow 5002/tcp 2>/dev/null || true
ufw --force enable || true

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait a moment for services to start
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Services are running at:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}')"
echo "   Python API: http://$(hostname -I | awk '{print $1}'):5001"
echo "   Backend: http://$(hostname -I | awk '{print $1}'):5002"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Stop: docker-compose stop"
echo "   Status: docker-compose ps"
echo ""
