# Edge Functions 시크릿 설정 및 배포
param(
  [string]$OpenAIApiKey = $env:OPENAI_API_KEY,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
  [string]$LocalConfigPath = (Join-Path (Split-Path $PSScriptRoot -Parent) ".supabase.local.json")
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Test-SupabaseAuth {
  $null = & npx supabase orgs list --output json 2>&1
  return $LASTEXITCODE -eq 0
}

function Invoke-Supabase {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & npx supabase @Args
  if ($LASTEXITCODE -ne 0) {
    throw "supabase 명령 실패: supabase $($Args -join ' ')"
  }
}

if (-not (Test-SupabaseAuth)) {
  & "$PSScriptRoot\ensure-supabase-auth.ps1"
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

if (-not $ServiceRoleKey -and (Test-Path $LocalConfigPath)) {
  $local = Get-Content $LocalConfigPath -Raw | ConvertFrom-Json
  $ServiceRoleKey = $local.service_role_key
}

if (-not $OpenAIApiKey) {
  $secure = Read-Host "OpenAI API Key (sk-...) 입력" -AsSecureString
  $OpenAIApiKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
}

if (-not $OpenAIApiKey) {
  throw "OPENAI_API_KEY가 필요합니다."
}

if (-not $ServiceRoleKey) {
  throw "SUPABASE_SERVICE_ROLE_KEY가 필요합니다. setup-supabase.ps1을 먼저 실행하세요."
}

Write-Host "Edge Functions 시크릿 설정 중..." -ForegroundColor Cyan
Invoke-Supabase secrets set "OPENAI_API_KEY=$OpenAIApiKey"
Invoke-Supabase secrets set "SUPABASE_SERVICE_ROLE_KEY=$ServiceRoleKey"

Write-Host "Edge Functions 배포 중..." -ForegroundColor Cyan
Invoke-Supabase functions deploy generate-storytelling
Invoke-Supabase functions deploy generate-diary

Write-Host ""
Write-Host "Edge Functions 배포 완료!" -ForegroundColor Green
