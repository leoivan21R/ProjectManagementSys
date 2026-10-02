@echo off
title Sistema de Gestion de Proyectos (PMS)
chcp 65001 > nul
cls

echo ===================================================================
echo     🚀 SISTEMA DE GESTIÓN DE PROYECTOS (PMS)
echo ===================================================================
echo.

:: Cambiar al directorio exacto del proyecto
cd /d "%~dp0"

echo [1/3] Verificando instalacion de Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: No se encontro Node.js en tu computadora.
    echo Por favor descargalo e instalalo desde: https://nodejs.org
    echo Despues de instalarlo, vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)
echo    ✔️ Node.js detectado correctamente.

echo.
echo [2/3] Verificando librerias del proyecto...
if not exist "node_modules\" (
    echo    Descargando librerias necesarias (esto solo toma un momento la primera vez)...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ERROR: Ocurrio un problema al instalar las dependencias con npm install.
        pause
        exit /b 1
    )
) else (
    echo    ✔️ Librerias listas.
)

echo.
echo [3/3] Encendiendo el servidor de la aplicacion...
echo.
echo ===================================================================
echo   🌐 La aplicacion se abrira en tu navegador en:
echo      👉 http://localhost:3000
echo.
echo   ⚠️  REGLA DE ORO:
echo      Mantén esta ventana negra ABIERTA mientras uses el sistema.
echo      Si cierras esta ventana, la aplicacion se apaga.
echo.
echo   🛑 Para apagarla cuando termines de trabajar:
echo      Presiona las teclas Ctrl + C en este teclado y escribe S (Si).
echo ===================================================================
echo.

:: Lanzar apertura automatica del navegador en 3 segundos en segundo plano
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Arrancar el servidor de desarrollo
call npm run dev

pause
