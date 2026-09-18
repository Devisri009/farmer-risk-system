@echo off
echo ========================================
echo    Starting FarmVista System...
echo ========================================

start cmd /k "cd /d %~dp0backend && set PYTHONPATH=%~dp0backend && call venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 5000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Vite on port 5173)...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo SUCCESS: Both services are launching.
echo   Backend  -> http://localhost:5000
echo   Frontend -> http://localhost:5173
echo ========================================