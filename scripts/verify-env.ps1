# .env 설정 확인 및 개발 서버 실행 안내
param(
  [switch]$StartDev
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $Root ".env"

if (-not (Test-Path $envPath)) {
  Write-Host ".env 파일이 없습니다." -ForegroundColor Red
  Write-Host "먼저 실행하세요: .\scripts\setup-all.ps1"
  exit 1
}

$lines = Get-Content $envPath
$url = ($lines | Where-Object { $_ -match '^VITE_SUPABASE_URL=' }) -replace '^VITE_SUPABASE_URL=', ''
$anon = ($lines | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' }) -replace '^VITE_SUPABASE_ANON_KEY=', ''

if (-not $url -or $url -match 'your-project' -or -not $anon -or $anon -match 'your-anon') {
  Write-Host ".env에 유효한 Supabase 값이 없습니다." -ForegroundColor Red
  exit 1
}

Write-Host ".env 설정 확인 완료" -ForegroundColor Green
Write-Host "  VITE_SUPABASE_URL=$url"
Write-Host "  VITE_SUPABASE_ANON_KEY=$($anon.Substring(0, [Math]::Min(20, $anon.Length)))..."

if ($StartDev) {
  Write-Host ""
  Write-Host "개발 서버를 시작합니다..."
  Set-Location $Root
  npm run dev
} else {
  Write-Host ""
  Write-Host "개발 서버 실행: npm run dev"
}
