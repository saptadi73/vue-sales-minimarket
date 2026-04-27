#!/bin/bash

# Sales Minimarket Frontend - Quick Start Script

echo "🚀 Sales Minimarket Frontend - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak terinstall. Silakan install Node.js 20.19.0+ atau 22.12.0+"
    echo "   Download di: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

# Ask user for action
echo "Pilih aksi:"
echo "1) Install dependencies (npm install)"
echo "2) Start development server (npm run dev)"
echo "3) Build untuk production (npm run build)"
echo "4) Type check (npm run type-check)"
echo "5) Format code (npm run format)"
echo ""

read -p "Masukkan pilihan (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 Installing dependencies..."
        npm install
        echo "✓ Dependencies installed!"
        echo ""
        echo "💡 Next: Run './quick-start.sh' dan pilih opsi 2 untuk start dev server"
        ;;
    2)
        echo ""
        echo "🔥 Starting development server..."
        echo "📱 Aplikasi akan berjalan di: http://localhost:5173"
        echo ""
        npm run dev
        ;;
    3)
        echo ""
        echo "📦 Building untuk production..."
        npm run build
        echo "✓ Build complete! Output di folder /dist"
        echo ""
        echo "📋 Langkah selanjutnya:"
        echo "  1. Upload /dist folder ke web server"
        echo "  2. Configure CORS di Odoo backend"
        echo "  3. Update API_BASE_URL di .env.local untuk production"
        ;;
    4)
        echo ""
        echo "🔍 Running type check..."
        npm run type-check
        ;;
    5)
        echo ""
        echo "✨ Formatting code..."
        npm run format
        echo "✓ Code formatted!"
        ;;
    *)
        echo "❌ Pilihan tidak valid!"
        exit 1
        ;;
esac

echo ""
echo "✓ Selesai!"
