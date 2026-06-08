# Supabase CLI 인증 확인 및 로그인
param(
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

$ErrorActionPreference = "Stop"

function Test-SupabaseAuth {
  $output = & npx supabase orgs list --output json 2>&1
  return $LASTEXITCODE -eq 0
}

if (Test-SupabaseAuth) {
  Write-Host "Supabase 인증이 확인되었습니다." -ForegroundColor Green
  exit 0
}

Write-Host "Supabase 인증이 필요합니다." -ForegroundColor Yellow

if ($AccessToken) {
  Write-Host "Access Token으로 로그인 중..."
  & npx supabase login --token $AccessToken
  if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
  Write-Host "브라우저 로그인을 시작합니다..."
  Write-Host "인증 완료 후 이 창으로 돌아와 주세요."
  & npx supabase login
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

if (-not (Test-SupabaseAuth)) {
  Write-Host "인증에 실패했습니다." -ForegroundColor Red
  exit 1
}

Write-Host "로그인 완료!" -ForegroundColor Green
