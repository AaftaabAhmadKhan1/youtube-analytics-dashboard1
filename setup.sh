#!/bin/bash

# YouTube Analytics Dashboard - Setup Script for macOS/Linux

echo "🎬 YouTube Analytics Dashboard - Setup Script"
echo "============================================="
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Download the LTS version (18.x or higher)"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION detected"
echo ""

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available!"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed successfully"
echo ""

# Check for .env.local
echo "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local file"
    echo "⚠️  IMPORTANT: Edit .env.local and add your YouTube API key!"
    echo ""
else
    echo "✅ .env.local exists"
fi

# Summary
echo ""
echo "============================================="
echo "✅ Setup Complete!"
echo "============================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your YouTube API key"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "To deploy to Vercel:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Run: vercel"
echo "3. Follow the prompts"
echo ""
echo "For more details, see README-NEXTJS.md and DEPLOYMENT.md"
echo ""
