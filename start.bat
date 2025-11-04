@echo off
REM Scorched Earth Artillery Game - Launcher Script (Windows)
REM This script starts the game server and opens it in your browser

setlocal

set PORT=8080
set URL=http://localhost:%PORT%/index.html

echo ==========================================
echo   Scorched Earth - Artillery Game
echo ==========================================
echo.

REM Kill any existing servers on this port
echo Checking for existing servers...
taskkill /F /FI "WINDOWTITLE eq python*" /FI "IMAGENAME eq python.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Python HTTP server on port %PORT%...
    echo Game URL: %URL%
    echo.

    REM Start server in background
    start /B python -m http.server %PORT% >nul 2>&1

    REM Wait for server to start
    timeout /t 2 /nobreak >nul

    echo Server started successfully!
    echo.
    echo Opening browser...
    start %URL%

    echo.
    echo ==========================================
    echo   CONTROLS:
    echo ==========================================
    echo   1. Drag from tank to aim and fire
    echo   2. Press '1' for Rail Gun (fast)
    echo   3. Press '2' for RPG (rocket)
    echo   4. Press ESC to cancel shot
    echo.
    echo Press Ctrl+C to stop the server
    echo ==========================================
    echo.

    REM Keep window open
    pause
    exit /b 0
)

REM Check if Node.js is available
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting http-server (Node.js) on port %PORT%...
    echo Game URL: %URL%
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    start %URL%
    npx http-server -p %PORT%
    exit /b 0
)

REM Check if PHP is available
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting PHP built-in server on port %PORT%...
    echo Game URL: %URL%
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    start %URL%
    php -S localhost:%PORT%
    exit /b 0
)

echo ERROR: No web server found!
echo.
echo Please install Python:
echo   https://www.python.org/downloads/
echo.
echo Or manually run:
echo   python -m http.server %PORT%
echo.
pause
exit /b 1
