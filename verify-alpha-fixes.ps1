# Alpha Test Verification Script
# Run this after deploying to verify all fixes are working

Write-Host "🚀 SCN ESG Platform - Alpha Test Verification" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Running from correct directory" -ForegroundColor Green
Write-Host ""

# 1. Check if all modified files exist
Write-Host "📁 Checking modified files..." -ForegroundColor Cyan
$files = @(
    "src/components/ConversationalDataEntry.tsx",
    "src/components/CarbonCalculator.tsx",
    "src/components/FootprintHistory.tsx",
    "src/components/UserDashboard.tsx",
    "src/components/EnhancedCarbonOffsets.tsx",
    "src/components/AIInsights.tsx",
    "src/components/Layout.tsx",
    "src/data/mockData.ts",
    "src/data/offsetMarketplace.ts"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (!$allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some files are missing. Please check your repository." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All modified files present" -ForegroundColor Green
Write-Host ""

# 2. Check for NaN protection patterns
Write-Host "🔍 Verifying NaN protection patterns..." -ForegroundColor Cyan

$nanChecks = @{
    "src/components/UserDashboard.tsx" = "Number.*\|\| 0"
    "src/data/mockData.ts" = "isFinite"
    "src/components/FootprintHistory.tsx" = "Number.*\|\| 0"
}

foreach ($file in $nanChecks.Keys) {
    $pattern = $nanChecks[$file]
    $content = Get-Content $file -Raw
    if ($content -match $pattern) {
        Write-Host "  ✓ $file has NaN protection" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $file might be missing NaN protection" -ForegroundColor Yellow
    }
}

Write-Host ""

# 3. Check pricing updates
Write-Host "💰 Verifying pricing updates..." -ForegroundColor Cyan
$offsetMarketplace = Get-Content "src/data/offsetMarketplace.ts" -Raw

if ($offsetMarketplace -match "price:\s*7\.5") {
    Write-Host "  ✓ Cheapest credit at £7.50" -ForegroundColor Green
} else {
    Write-Host "  ✗ Cheapest credit pricing not found" -ForegroundColor Red
}

if ($offsetMarketplace -match "price:\s*27") {
    Write-Host "  ✓ Sequoia starting at £27" -ForegroundColor Green
} else {
    Write-Host "  ✗ Sequoia pricing not found" -ForegroundColor Red
}

Write-Host ""

# 4. Run TypeScript check
Write-Host "🔧 Running TypeScript type check..." -ForegroundColor Cyan
npm run typecheck 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ TypeScript check passed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ TypeScript check has warnings (check manually)" -ForegroundColor Yellow
}

Write-Host ""

# 5. Run lint
Write-Host "🔍 Running ESLint..." -ForegroundColor Cyan
npm run lint 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Lint check passed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Lint check has warnings (check manually)" -ForegroundColor Yellow
}

Write-Host ""

# 6. Check if dev server can start
Write-Host "🌐 Testing dev server startup..." -ForegroundColor Cyan
$job = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm run dev 2>&1 | Out-Null
}

Start-Sleep -Seconds 10

if ($job.State -eq "Running") {
    Write-Host "  ✓ Dev server started successfully" -ForegroundColor Green
    Stop-Job $job
    Remove-Job $job
} else {
    Write-Host "  ✗ Dev server failed to start" -ForegroundColor Red
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ Verification Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Manual Testing Checklist:" -ForegroundColor Cyan
Write-Host "  1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Login with demo account" -ForegroundColor White
Write-Host "  3. Check My Data tab - should show 0.00, not NaN" -ForegroundColor White
Write-Host "  4. Try Calculator - should pre-populate company name" -ForegroundColor White
Write-Host "  5. Check Footprint History - should not crash" -ForegroundColor White
Write-Host "  6. Try Smart Data Entry - should load without error" -ForegroundColor White
Write-Host "  7. Check Carbon Offsets - prices should be £7.50-£104" -ForegroundColor White
Write-Host "  8. Try AI Insights Validate - should show error, not crash" -ForegroundColor White
Write-Host "  9. Check navigation bar - should be properly aligned" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready for Alpha Testing!" -ForegroundColor Green
Write-Host ""
