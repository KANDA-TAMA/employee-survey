
# Vercel Deployment Helper Script

Write-Host "Starting Vercel Deployment Setup..." -ForegroundColor Cyan

# Check for npx availability
$npxPath = Get-Command npx -ErrorAction SilentlyContinue
if ($null -eq $npxPath) {
    Write-Error "npx is not found. Please install Node.js."
    exit 1
}

Write-Host "Running Vercel Deploy..." -ForegroundColor Green
Write-Host "If asked to log in, please follow the prompts in the browser." -ForegroundColor Yellow

# Use cmd /c to bypass PowerShell execution policy for npx
cmd /c npx vercel

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment initiated successfully!" -ForegroundColor Green
    Write-Host "To deploy to production, run: cmd /c npx vercel --prod" -ForegroundColor Cyan
} else {
    Write-Error "Deployment failed."
}
