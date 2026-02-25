@echo off
REM Batch script to launch Code Warrior Application
REM Works on Windows Command Prompt

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║    Code Warrior - Backend ^& Frontend Launcher (Batch)      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Get directory
set "SCRIPT_DIR=%~dp0"
echo 📁 Working Directory: %SCRIPT_DIR%
echo.

REM Stop Node processes
echo 🛑 Stopping any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Cleanup complete
echo.

REM Start Backend
echo 🚀 Starting Backend Server...
set "BACKEND_PATH=%SCRIPT_DIR%backend"
start "Code Warrior - Backend" cmd /k "cd /d %BACKEND_PATH% && set NODE_ENV=development && node server.js"
timeout /t 3 /nobreak >nul
echo ✅ Backend Server Started
echo    📍 URL: http://localhost:5000
echo.

REM Start Frontend
echo 🚀 Starting Frontend Server...
set "FRONTEND_PATH=%SCRIPT_DIR%frontend"
start "Code Warrior - Frontend" cmd /k "cd /d %FRONTEND_PATH% && npm start"
timeout /t 5 /nobreak >nul
echo ✅ Frontend Server Started
echo    📍 URL: http://localhost:3000
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║    Application is Ready! 🎉                                ║
echo ║                                                            ║
echo ║ Access your application:                                  ║
echo ║   • Frontend: http://localhost:3000                        ║
echo ║   • Backend:  http://localhost:5000                        ║
echo ║                                                            ║
echo ║ Note: Servers are running in separate windows.            ║
echo ║ Close the windows to stop the servers.                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

timeout /t 3 /nobreak >nul
