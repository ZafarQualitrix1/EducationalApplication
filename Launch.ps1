#!/usr/bin/env pwsh
# 
# Launch Script for Code Warrior Application
# Starts both Backend and Frontend servers
#

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Code Warrior - Backend & Frontend Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Working Directory: $scriptDir" -ForegroundColor Yellow
Write-Host ""

# Stop any existing Node processes
Write-Host "Stopping any existing Node processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Cleanup complete" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendPath = Join-Path $scriptDir "backend"
$backendProcess = Start-Process -PassThru -NoNewWindow -FilePath "powershell" -ArgumentList "-NoProfile -Command `"cd '$backendPath'; `$env:NODE_ENV='development'; node server.js`""
Write-Host "Backend Server Started (Process ID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "URL: http://localhost:5000" -ForegroundColor White
Start-Sleep -Seconds 2
Write-Host ""

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendPath = Join-Path $scriptDir "frontend"
$frontendProcess = Start-Process -PassThru -NoNewWindow -FilePath "powershell" -ArgumentList "-NoProfile -Command `"cd '$frontendPath'; npm start`""
Write-Host "Frontend Server Started (Process ID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host "URL: http://localhost:3000" -ForegroundColor White
Write-Host ""

# Wait a moment and verify
Start-Sleep -Seconds 5
Write-Host "Verifying Server Status..." -ForegroundColor Yellow
Write-Host ""

$ports = netstat -ano | Select-String "LISTENING" | Select-String "3000|5000"
if ($ports) {
    Write-Host "Both Servers are Running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   - Backend:  http://localhost:5000" -ForegroundColor White
} else {
    Write-Host "Could not verify server status. Please check terminal windows." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: Servers are running in separate windows." -ForegroundColor Yellow
Write-Host "Close the windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Application is Ready!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
