@echo off
cd /d %~dp0..
echo Deploying Edge Functions via Supabase CLI...
call npx.cmd supabase functions deploy generate-storytelling generate-diary --project-ref tbecxrfbcqifrwuhoaik --no-verify-jwt --use-api
if errorlevel 1 (
  echo.
  echo CLI deploy failed. The app now uses /api routes on Vercel instead.
  echo For local dev, add OPENAI_API_KEY and SUPABASE_SERVICE_ROLE_KEY to .env
  pause
  exit /b 1
)
echo Deploy complete.
pause
