@echo off
echo ========================================
echo   Instalando dependencias del backend
echo ========================================
echo.

echo [1/3] Instalando dependencias principales...
pip install flask==3.0.3 flask-cors==4.0.1 python-dotenv==1.0.1
pip install firebase-admin==6.5.0
pip install google-generativeai==0.7.2
pip install marshmallow==3.21.3
pip install numpy PyMuPDF reportlab==4.2.2

echo.
echo [2/3] Instalando Pillow (compatible con Python 3.14)...
pip install --upgrade Pillow

echo.
echo [3/3] Instalando EasyOCR (puede tardar varios minutos)...
pip install easyocr==1.7.2

echo.
echo ========================================
echo   Instalacion completada
echo ========================================
echo.
pause
