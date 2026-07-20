@echo off
echo Starting MedLook Application...

echo.
echo Starting ML Server (Python Flask)...
start "ML Server" cmd /k "cd ML && python start_ml_server.py"

echo.
echo Waiting for ML server to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Backend (Spring Boot)...
start "Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo.
echo Starting Frontend (React)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All applications are starting...
echo ML Server: http://localhost:5000
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
