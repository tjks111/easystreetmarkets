$env:PATH = "C:\nvm4w\nodejs;" + $env:PATH
$env:NEXT_PUBLIC_SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjg3MzYsImV4cCI6MjA5MTY0NDczNn0.LXfF2HMU6UFQnQtxcVe7vx27exaqWP82exLFb91Getc"
$env:NODE_OPTIONS = "--max-old-space-size=8192"
$env:CI = "1"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Write-Host "Building Next.js..."
# node .\node_modules\next\dist\bin\next build
# if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building OpenNext..."
& .\node_modules\.bin\opennextjs-cloudflare.cmd build --skipNextBuild
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploying with Wrangler..."
& .\node_modules\.bin\wrangler.cmd deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deployment completed!"
