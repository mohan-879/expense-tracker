@echo off
title Starting DSClub Expense Tracker
echo =======================================================
echo   Starting DSClub Expense Tracker (Backend + Frontend)
echo =======================================================
echo.
echo [1/2] Launching Backend on Port 5000...
start "DSClub Backend (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend on Port 3000...
start "DSClub Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo   Both services are starting!
echo   - Backend API: http://localhost:5000
echo   - Frontend:    http://localhost:3000
echo =======================================================
pause
