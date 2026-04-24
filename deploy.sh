#!/bin/bash
cd /c/Users/rento/easystreetmarkets
export PATH="/c/nvm4w/nodejs:$PATH"
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

export NEXT_PUBLIC_SUPABASE_URL="https://ykpgulbugkxiqldvgsjs.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcGd1bGJ1Z2t4aXFsZHZnc2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjg3MzYsImV4cCI6MjA5MTY0NDczNn0.LXfF2HMU6UFQnQtxcVe7vx27exaqWP82exLFb91Getc"
export GA4_MEASUREMENT_SECRET="mock_if_needed_but_lets_keep_it_clean"

# Use the exact sequence
NODE_OPTIONS="--max-old-space-size=8192" CI=1 NEXT_TELEMETRY_DISABLED=1 ./node_modules/.bin/next build
NODE_OPTIONS="--max-old-space-size=8192" ./node_modules/.bin/opennextjs-cloudflare build --skipNextBuild
NODE_OPTIONS="--max-old-space-size=8192" ./node_modules/.bin/wrangler deploy
