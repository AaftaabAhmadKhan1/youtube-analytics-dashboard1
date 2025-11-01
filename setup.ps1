# 🚀 Quick Setup Script for Windows

Write-Host "🎬 YouTube Analytics Dashboard - Setup Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Download the LTS version (18.x or higher)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host ""

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not available!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Check for .env.local
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your YouTube API key!" -ForegroundColor Red
    Write-Host ""
} else {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local and add your YouTube API key" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To deploy to Vercel:" -ForegroundColor Yellow
Write-Host "1. Install Vercel CLI: npm i -g vercel" -ForegroundColor White
Write-Host "2. Run: vercel" -ForegroundColor White
Write-Host "3. Follow the prompts" -ForegroundColor White
Write-Host ""
Write-Host "For more details, see README-NEXTJS.md and DEPLOYMENT.md" -ForegroundColor Gray
Write-Host ""
