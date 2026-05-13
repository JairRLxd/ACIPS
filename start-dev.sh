#!/bin/bash

# Script para iniciar el proyecto ACIPS en modo desarrollo
# Ejecuta tanto el backend como el frontend

echo "🚀 Iniciando ACIPS en modo desarrollo..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -d ".vscode/backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar archivo .env del backend
if [ ! -f ".vscode/backend/.env" ]; then
    echo -e "${RED}❌ Error: No existe .vscode/backend/.env${NC}"
    echo "   Copia .vscode/backend/.env.example a .vscode/backend/.env y configúralo"
    exit 1
fi

# Verificar archivo .env del frontend
if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}❌ Error: No existe frontend/.env${NC}"
    echo "   Copia frontend/.env.example a frontend/.env y configúralo"
    exit 1
fi

# Función para matar procesos al salir
cleanup() {
    echo ""
    echo -e "${BLUE}🛑 Deteniendo servicios...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo -e "${BLUE}📦 Iniciando Backend (Python/Flask)...${NC}"
cd .vscode/backend
python app/main.py &
BACKEND_PID=$!
cd ../..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (Vite/React)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Servicios iniciados:${NC}"
echo -e "   Backend:  http://localhost:5000"
echo -e "   Frontend: http://localhost:5173"
echo ""
echo -e "${BLUE}💡 Presiona Ctrl+C para detener ambos servicios${NC}"
echo ""

# Mantener el script corriendo
wait
