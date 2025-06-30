@echo off
echo ===============================
echo 🚀 Starting Shelf Guardian App...
echo ===============================

:: Change to project directory
cd /d "C:\Users\ASUS\Documents\Expiry app (hacakthon)\expiry-wise-shelf-guardian-main"

:: Check if directory change worked
if not exist package.json (
    echo ❌ Error: Not inside a Node.js project folder!
    pause
    exit /b
)

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

:: Open browser
start http://localhost:5173

:: Start the Vite development server
echo 🚀 Running Vite dev server...
call npm run dev

pause
