# PLMA Lite — Supabase 전체 설정 (인증 → 프로젝트 → .env → Edge Functions)
# 대화형 터미널에서 실행하세요:
#   .\scripts\setup-all.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PLMA Lite — Supabase 전체 설정" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "민감 정보는 채팅이 아닌 이 터미널에만 입력됩니다."
Write-Host ""

# 1) 인증
& "$PSScriptRoot\ensure-supabase-auth.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2) DB 비밀번호
$dbSecure = Read-Host "Postgres DB 비밀번호 입력 (12자 이상 권장)" -AsSecureString
$dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbSecure)
)

if ($dbPassword.Length -lt 8) {
  Write-Host "DB 비밀번호는 8자 이상이어야 합니다." -ForegroundColor Red
  exit 1
}

# 3) 프로젝트 생성 + .env
& "$PSScriptRoot\setup-supabase.ps1" -DbPassword $dbPassword
if ($LASTEXITCODE -ne 0) { exit 1 }

# 4) Edge Functions (선택)
$deploy = Read-Host "Edge Functions도 지금 배포할까요? (y/N)"
if ($deploy -eq 'y' -or $deploy -eq 'Y') {
  & "$PSScriptRoot\setup-edge-secrets.ps1"
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host ""
Write-Host "설정이 완료되었습니다. 앱을 실행하려면:" -ForegroundColor Green
Write-Host "  npm run dev"
Write-Host ""
Read-Host "Enter 키를 누르면 종료합니다"
