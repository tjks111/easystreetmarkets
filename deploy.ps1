if (Test-Path .env.local) {
  Get-Content .env.local | ForEach-Object {
    if ($_ -match '^\s*([^#\s][^=]*?)\s*=\s*(.*)$') {
      Set-Item -Path "env:$($matches[1])" -Value $matches[2]
    }
  }
}

# Provide defaults if not in .env.local
if (-not $env:CLOUDFLARE_API_TOKEN) {
    Write-Warning "CLOUDFLARE_API_TOKEN is not set in .env.local"
}
if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
    $env:NEXT_PUBLIC_SUPABASE_URL = "https://ykpgulbugkxiqldvgsjs.supabase.co"
}
if (-not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjg3MzYsImV4cCI6MjA5MTY0NDczNn0.LXfF2HMU6UFQnQtxcVe7vx27exaqWP82exLFb91Getc"
}
$env:NODE_OPTIONS = "--max-old-space-size=8192"
$env:CI = "1"
$env:NEXT_TELEMETRY_DISABLED = "1"

Write-Host "Building Next.js app..."
& ".\node_modules\.bin\next.cmd" build
if ($LASTEXITCODE -ne 0) { throw "Next.js build failed" }

Write-Host "Building OpenNextJS Cloudflare adapter..."
& ".\node_modules\.bin\opennextjs-cloudflare.cmd" build --skipNextBuild
if ($LASTEXITCODE -ne 0) { throw "OpenNextJS Cloudflare build failed" }

Write-Host "Deploying to Cloudflare Workers..."
& ".\node_modules\.bin\wrangler.cmd" deploy
if ($LASTEXITCODE -ne 0) { throw "Wrangler deploy failed" }
