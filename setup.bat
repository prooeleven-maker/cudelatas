@echo off
echo 🚀 License Key Validation System Setup
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Git is not installed. You will need it for GitHub deployment.
    echo    Download from: https://git-scm.com/downloads
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check for .env.local
if not exist ".env.local" (
    echo.
    echo 📝 Creating .env.local file...
    copy .env.example .env.local
    echo ✅ .env.local created from .env.example
    echo.
    echo ⚠️  IMPORTANT: Please edit .env.local with your Supabase credentials!
    echo    You need to:
    echo    1. Create a Supabase project at https://supabase.com
    echo    2. Get your project URL and API keys
    echo    3. Update the values in .env.local
) else (
    echo.
    echo ✅ .env.local already exists
)

echo.
echo 🗄️  Database Setup:
echo 1. Go to your Supabase project SQL Editor
echo 2. Run the SQL from sql/schema.sql
echo.
echo 👤 Admin User Setup:
echo 1. Go to Authentication ^> Users in Supabase
echo 2. Create a new user (this will be your admin account)
echo.
echo 🌐 Development:
echo Run 'npm run dev' to start the development server
echo.
echo 🚀 GitHub + Vercel Deployment:
echo 1. Create a new repository on GitHub
echo 2. Run the Git commands below
echo 3. Connect to Vercel and deploy
echo.
echo 📖 For detailed instructions, see README.md
echo.
echo 🎉 Setup complete! Happy coding!

pause