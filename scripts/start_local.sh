#!/usr/bin/env bash
set -e

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Print banner if it exists
if [ -x "$SCRIPT_DIR/banner.sh" ]; then
    "$SCRIPT_DIR/banner.sh"
fi

echo "🚀 Starting DotUp local development environment..."

# Change to project root
cd "$PROJECT_ROOT"

# Ensure .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "⚠️  No .env file found. Creating from .env.example..."
        cp .env.example .env
    else
        echo "❌ No .env or .env.example found. Please create a .env file."
        exit 1
    fi
fi

# Stop existing containers if running
docker compose down

# Build and start services in detached mode
echo "🏗️  Building and starting services..."
docker compose up --build -d

echo "⏳ Waiting for services to become healthy..."
sleep 5

docker compose ps

echo ""
echo "✅ DotUp is running!"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:8000"
echo "   - Database: localhost:5432"
echo ""
echo "💡 Use 'docker compose logs -f' to view logs."
