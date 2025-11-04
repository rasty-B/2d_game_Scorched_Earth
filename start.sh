#!/bin/bash

# Scorched Earth Artillery Game - Launcher Script
# This script starts the game server and opens it in your browser

PORT=8080
URL="http://localhost:$PORT/index.html?t=$(date +%s)"

echo "=========================================="
echo "  Scorched Earth - Artillery Game"
echo "=========================================="
echo ""

# Kill any existing servers on this port
echo "Checking for existing servers..."
pkill -f "python3 -m http.server $PORT" 2>/dev/null || true
pkill -f "python -m SimpleHTTPServer $PORT" 2>/dev/null || true
sleep 1

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "🚀 Starting Python 3 HTTP server on port $PORT..."
    echo "📡 Game URL: $URL"
    echo ""

    # Start server in background
    python3 -m http.server $PORT > /dev/null 2>&1 &
    SERVER_PID=$!

    # Wait for server to start
    sleep 2

    echo "✅ Server started (PID: $SERVER_PID)"
    echo ""
    echo "Opening browser..."

    # Try to open browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "$URL" &
    elif command -v open &> /dev/null; then
        open "$URL" &
    elif command -v start &> /dev/null; then
        start "$URL" &
    else
        echo "⚠️  Could not auto-open browser. Please open manually:"
        echo "   $URL"
    fi

    echo ""
    echo "=========================================="
    echo "  CONTROLS:"
    echo "=========================================="
    echo "  1. Drag from tank to aim and fire"
    echo "  2. Press '1' for Rail Gun (fast)"
    echo "  3. Press '2' for RPG (rocket)"
    echo "  4. Press ESC to cancel shot"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=========================================="
    echo ""

    # Wait for Ctrl+C
    trap "echo ''; echo 'Stopping server...'; kill $SERVER_PID 2>/dev/null; echo '✅ Server stopped.'; exit 0" INT TERM

    wait $SERVER_PID
    exit 0
fi

# Check if Python is available
if command -v python &> /dev/null; then
    echo "🚀 Starting Python HTTP server on port $PORT..."
    echo "📡 Game URL: $URL"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer $PORT
    exit 0
fi

# Check if PHP is available
if command -v php &> /dev/null; then
    echo "🚀 Starting PHP built-in server on port $PORT..."
    echo "📡 Game URL: $URL"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:$PORT
    exit 0
fi

echo "❌ ERROR: No web server found!"
echo ""
echo "Please install Python 3:"
echo "  - Ubuntu/Debian: sudo apt install python3"
echo "  - MacOS: brew install python3"
echo ""
echo "Or manually run:"
echo "  python3 -m http.server $PORT"
echo ""
exit 1
