@echo off
REM Artillery Game - Simple Server Launcher (Windows)
REM This script starts a local web server to run the game

echo ==========================================
echo   Artillery Game - Server Launcher
echo ==========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Python HTTP server...
    echo Game will be available at: http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8080
    exit /b 0
)

REM Check if Node.js is available
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting http-server Node.js...
    echo Game will be available at: http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    npx http-server -p 8080
    exit /b 0
)

REM Check if PHP is available
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting PHP built-in server...
    echo Game will be available at: http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    php -S localhost:8080
    exit /b 0
)

echo ERROR: No web server found!
echo.
echo Please install one of the following:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads
echo.
echo Or manually run:
echo   python -m http.server 8080
echo.
pause
exit /b 1
