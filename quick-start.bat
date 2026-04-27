@echo off
REM Sales Minimarket Frontend - Quick Start (Windows)

cls
echo.
echo 🚀 Sales Minimarket Frontend - Quick Start
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js tidak terinstall. Silakan install Node.js 20.19.0+ atau 22.12.0+
    echo    Download di: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js: 
node --version
echo ✓ npm: 
npm --version
echo.

:menu
cls
echo.
echo 📋 Pilih aksi:
echo ================
echo 1) Install dependencies (npm install)
echo 2) Start development server (npm run dev)
echo 3) Build untuk production (npm run build)
echo 4) Type check (npm run type-check)
echo 5) Format code (npm run format)
echo 0) Exit
echo.

set /p choice="Masukkan pilihan (0-5): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto typecheck
if "%choice%"=="5" goto format
if "%choice%"=="0" exit /b 0

echo ❌ Pilihan tidak valid!
pause
goto menu

:install
cls
echo.
echo 📦 Installing dependencies...
echo.
call npm install
echo.
echo ✓ Dependencies installed!
echo.
echo 💡 Next: Jalankan quick-start.bat lagi dan pilih opsi 2 untuk start dev server
echo.
pause
goto menu

:dev
cls
echo.
echo 🔥 Starting development server...
echo 📱 Aplikasi akan berjalan di: http://localhost:5173
echo.
echo Tekan Ctrl+C untuk stop server
echo.
call npm run dev
pause
goto menu

:build
cls
echo.
echo 📦 Building untuk production...
echo.
call npm run build
echo.
echo ✓ Build complete! Output di folder /dist
echo.
echo 📋 Langkah selanjutnya:
echo    1. Upload /dist folder ke web server
echo    2. Configure CORS di Odoo backend
echo    3. Update VITE_API_BASE_URL di .env.local untuk production
echo.
pause
goto menu

:typecheck
cls
echo.
echo 🔍 Running type check...
echo.
call npm run type-check
echo.
pause
goto menu

:format
cls
echo.
echo ✨ Formatting code...
echo.
call npm run format
echo.
echo ✓ Code formatted!
echo.
pause
goto menu
