#!/bin/bash

echo "🚀 License Key Validation System Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local with your Supabase credentials!"
    echo "   You need to:"
    echo "   1. Create a Supabase project at https://supabase.com"
    echo "   2. Get your project URL and API keys"
    echo "   3. Update the values in .env.local"
else
    echo ""
    echo "✅ .env.local already exists"
fi

echo ""
echo "🗄️  Database Setup:"
echo "1. Go to your Supabase project SQL Editor"
echo "2. Run the SQL from sql/schema.sql"
echo ""
echo "👤 Admin User Setup:"
echo "1. Go to Authentication > Users in Supabase"
echo "2. Create a new user (this will be your admin account)"
echo ""
echo "🌐 Development:"
echo "Run 'npm run dev' to start the development server"
echo ""
echo "🚀 Deployment:"
echo "Run 'vercel' to deploy to Vercel"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "🎉 Setup complete! Happy coding!"