#!/bin/bash

echo "Checking Node.js and npm installation..."
echo ""

if command -v node &> /dev/null; then
    echo "✅ Node.js is installed!"
    echo "   Version: $(node --version)"
else
    echo "❌ Node.js is not installed"
fi

echo ""

if command -v npm &> /dev/null; then
    echo "✅ npm is installed!"
    echo "   Version: $(npm --version)"
else
    echo "❌ npm is not installed"
fi

echo ""

if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "🎉 Installation complete! You can now proceed with:"
    echo "   cd web_app/backend && npm install"
    echo "   cd ../frontend && npm install"
else
    echo "⚠️  Please complete the Node.js installer that should be open on your screen."
fi
