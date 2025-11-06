#!/bin/bash

# Artillery Game - Simple Server Launcher
# This script starts a local web server to run the game

echo "=========================================="
echo "  Artillery Game - Server Launcher"
echo "=========================================="
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Starting Python 3 HTTP server..."
    echo "Game will be available at: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8080
    exit 0
fi

# Check if Python is available
if command -v python &> /dev/null; then
    echo "Starting Python HTTP server..."
    echo "Game will be available at: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8080
    exit 0
fi

# Check if PHP is available
if command -v php &> /dev/null; then
    echo "Starting PHP built-in server..."
    echo "Game will be available at: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:8080
    exit 0
fi

# Check if npx is available (Node.js)
if command -v npx &> /dev/null; then
    echo "Starting http-server (Node.js)..."
    echo "Game will be available at: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx http-server -p 8080
    exit 0
fi

echo "ERROR: No web server found!"
echo ""
echo "Please install one of the following:"
echo "  - Python 3: apt install python3"
echo "  - Node.js: apt install nodejs npm"
echo "  - PHP: apt install php"
echo ""
echo "Or manually run:"
echo "  python3 -m http.server 8080"
echo ""
exit 1
