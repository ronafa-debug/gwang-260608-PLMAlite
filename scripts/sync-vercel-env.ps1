# .env의 서버 환경 변수를 Vercel 프로젝트에 동기화합니다.
# 사용법: .\scripts\sync-vercel-env.ps1
# 환경 변수 변경 후 반드시 재배포: npx vercel --prod

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $Root ".env"

if (-not (Test-Path $envPath)) {
  throw ".env 파일이 없습니다. .env.example을 복사해 설정해 주세요."
}

function Get-EnvValue([string]$Name) {
  $line = Get-Content $envPath | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -split '=', 2)[1].Trim()
}

$vars = @(
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
)

Write-Host "=== Vercel 환경 변수 동기화 ===" -ForegroundColor Cyan

foreach ($name in $vars) {
  $value = Get-EnvValue $name
  if (-not $value) {
    Write-Host "건너뜀 (값 없음): $name" -ForegroundColor Yellow
    continue
  }

  Write-Host "설정 중: $name"
  $value | npx vercel env add $name production --force 2>&1 | Out-Null
  $value | npx vercel env add $name preview --force 2>&1 | Out-Null
}

Write-Host ""
Write-Host "완료. 변경 사항을 적용하려면 재배포하세요:" -ForegroundColor Green
Write-Host "  npx vercel --prod"
