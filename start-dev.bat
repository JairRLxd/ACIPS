@echo off
REM Script para iniciar el proyecto ACIPS en modo desarrollo (Windows)
REM Ejecuta tanto el backend como el frontend

echo.
echo ========================================
echo   ACIPS - Iniciando modo desarrollo
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist ".vscode\backend" (
    echo ERROR: No se encuentra la carpeta .vscode\backend
    echo Ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: No se encuentra la carpeta frontend
    echo Ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Verificar archivo .env del backend
if not exist ".vscode\backend\.env" (
    echo ERROR: No existe .vscode\backend\.env
    echo Copia .vscode\backend\.env.example a .vscode\backend\.env y configuralo
    pause
    exit /b 1
)

REM Verificar archivo .env del frontend
if not exist "frontend\.env" (
    echo ERROR: No existe frontend\.env
    echo Copia frontend\.env.example a frontend\.env y configuralo
    pause
    exit /b 1
)

echo [1/2] Iniciando Backend (Python/Flask)...
echo.
start "ACIPS Backend" cmd /k "cd .vscode\backend && python app\main.py"

REM Esperar un poco para que el backend inicie
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (Vite/React)...
echo.
start "ACIPS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servicios iniciados correctamente
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo Cierra las ventanas de terminal para detener los servicios
echo.
pause
