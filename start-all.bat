@echo off
echo ========================================
echo Starting Alburhan Regional Application
echo ========================================
echo.
echo This will start both Backend and Frontend
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to continue...
pause >nul

start "Alburhan Backend" cmd /k "python main.py"
timeout /t 3 >nul
start "Alburhan Frontend" cmd /k "cd frontend-next && npm run dev"

echo.
echo Both services are starting in separate windows...
echo.
pause
