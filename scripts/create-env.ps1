# .env 파일 생성 (Supabase API 키 입력)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $Root ".env"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PLMA Lite — .env 파일 만들기" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Supabase 대시보드 → Project Settings → API 에서"
Write-Host "아래 두 값을 복사해 붙여넣으세요."
Write-Host ""

$url = Read-Host "1) Project URL (예: https://abcdefgh.supabase.co)"
$anon = Read-Host "2) anon public key (eyJ... 로 시작하는 긴 문자열)"

if (-not $url -or -not $anon) {
  Write-Host "값이 비어 있습니다. 다시 실행해 주세요." -ForegroundColor Red
  exit 1
}

$content = @"
VITE_SUPABASE_URL=$url
VITE_SUPABASE_ANON_KEY=$anon
"@

$content | Out-File -FilePath $envPath -Encoding utf8NoBOM

Write-Host ""
Write-Host ".env 파일이 생성되었습니다!" -ForegroundColor Green
Write-Host "  $envPath"
Write-Host ""
Write-Host "다음 단계: npm run dev"
Write-Host ""
Read-Host "Enter 키를 누르면 종료합니다"
