#!/bin/bash
# Launch Script for Code Warrior Application (macOS/Linux)

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Code Warrior - Backend & Frontend Launcher              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Working Directory: $SCRIPT_DIR"
echo ""

# Stop any existing Node processes
echo "🛑 Stopping any existing Node processes..."
pkill -f "node server.js" 2>/dev/null
sleep 2
echo "✅ Cleanup complete"
echo ""

# Start Backend Server
echo "🚀 Starting Backend Server..."
cd "$SCRIPT_DIR/backend"
export NODE_ENV=development
node server.js &
BACKEND_PID=$!
echo "✅ Backend Server Started (Process ID: $BACKEND_PID)"
echo "   📍 URL: http://localhost:5000"
sleep 2
echo ""

# Start Frontend Server
echo "🚀 Starting Frontend Server..."
cd "$SCRIPT_DIR/frontend"
npm start &
FRONTEND_PID=$!
echo "✅ Frontend Server Started (Process ID: $FRONTEND_PID)"
echo "   📍 URL: http://localhost:3000"
echo ""

# Verify
sleep 5
echo "🔍 Verifying Server Status..."
if lsof -Pi :5000,3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Both Servers are Running!"
else
    echo "⚠️  Could not verify server status"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Application is Ready! 🎉                      ║"
echo "║                                                            ║"
echo "║ Access your application:                                  ║"
echo "║   • Frontend: http://localhost:3000                        ║"
echo "║   • Backend:  http://localhost:5000                        ║"
echo "║                                                            ║"
echo "║ Backend PID:  $BACKEND_PID                                 ║"
echo "║ Frontend PID: $FRONTEND_PID                                ║"
echo "║                                                            ║"
echo "║ To stop servers, use: kill $BACKEND_PID $FRONTEND_PID     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Keep the script running
wait
