# PLMA Lite — Supabase 클라우드 프로젝트 생성 및 연결 스크립트
# 사용법:
#   1) Access Token 방식
#      .\scripts\setup-supabase.ps1 -AccessToken "sbp_..." -DbPassword "YourSecurePassword123!"
#   2) 이미 `npx supabase login` 완료한 경우
#      .\scripts\setup-supabase.ps1 -DbPassword "YourSecurePassword123!"

param(
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
  [Parameter(Mandatory = $true)]
  [string]$DbPassword,
  [string]$ProjectName = "plma-lite",
  [string]$Region = "ap-northeast-2"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-Supabase {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & npx supabase @Args
  if ($LASTEXITCODE -ne 0) {
    throw "supabase 명령 실패: supabase $($Args -join ' ')"
  }
}

Write-Host "=== PLMA Lite Supabase 프로젝트 설정 ===" -ForegroundColor Cyan

if ($AccessToken) {
  Write-Host "Access Token으로 로그인 중..."
  Invoke-Supabase login --token $AccessToken
} else {
  Write-Host "저장된 Supabase 로그인 세션을 확인합니다..."
}

$orgsJson = & npx supabase orgs list --output json 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Supabase 인증이 필요합니다." -ForegroundColor Yellow
  Write-Host "다음 중 하나를 실행한 뒤 이 스크립트를 다시 실행해 주세요:"
  Write-Host "  npx supabase login"
  Write-Host "  또는 Access Token 발급: https://supabase.com/dashboard/account/tokens"
  exit 1
}

$orgs = @($orgsJson | ConvertFrom-Json)
if (-not $orgs -or $orgs.Count -eq 0) {
  throw "연결된 Supabase Organization이 없습니다. https://supabase.com/dashboard 에서 조직을 먼저 만드세요."
}

$orgId = $orgs[0].id
$orgName = $orgs[0].name
Write-Host "Organization: $orgName ($orgId)"

Write-Host "프로젝트 목록 조회 중..."
$projectsJson = & npx supabase projects list --output json
$projects = @($projectsJson | ConvertFrom-Json)
$project = $projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1

if ($project) {
  Write-Host "기존 프로젝트를 사용합니다: $ProjectName" -ForegroundColor Yellow
} else {
  Write-Host "프로젝트 생성 중: $ProjectName (리전: $Region) ..."
  Invoke-Supabase projects create $ProjectName --org-id $orgId --db-password $DbPassword --region $Region --yes

  $projectsJson = & npx supabase projects list --output json
  $projects = @($projectsJson | ConvertFrom-Json)
  $project = $projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1

  if (-not $project) {
    throw "생성된 프로젝트를 찾지 못했습니다."
  }
}

$projectRef = $project.id
Write-Host "프로젝트 ref: $projectRef"

Write-Host "프로젝트 연결(link) 중..."
Invoke-Supabase link --project-ref $projectRef --password $DbPassword --yes

Write-Host "DB 마이그레이션 적용 중..."
Invoke-Supabase db push --linked --yes

Write-Host "API 키 조회 중..."
$keysJson = & npx supabase projects api-keys --project-ref $projectRef --output json
$keys = $keysJson | ConvertFrom-Json
$anonKey = ($keys | Where-Object { $_.name -eq "anon" }).api_key
$serviceRoleKey = ($keys | Where-Object { $_.name -eq "service_role" }).api_key
$supabaseUrl = "https://$projectRef.supabase.co"

$envContent = @"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$anonKey

# Edge Functions secrets (배포 시 설정)
# OPENAI_API_KEY=sk-...
# SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
"@

$envPath = Join-Path $Root ".env"
$envContent | Out-File -FilePath $envPath -Encoding utf8NoBOM

$localConfigPath = Join-Path $Root ".supabase.local.json"
@{
  project_ref = $projectRef
  supabase_url = $supabaseUrl
  service_role_key = $serviceRoleKey
} | ConvertTo-Json | Out-File -FilePath $localConfigPath -Encoding utf8NoBOM

Write-Host ""
Write-Host "=== 완료 ===" -ForegroundColor Green
Write-Host "프로젝트 URL : $supabaseUrl"
Write-Host "프로젝트 ref : $projectRef"
Write-Host ".env 파일    : $envPath"
Write-Host ""
Write-Host "다음 단계:"
Write-Host "  1. npm run dev"
Write-Host "  2. Edge Functions 배포:"
Write-Host "     npx supabase secrets set OPENAI_API_KEY=sk-..."
Write-Host "     npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey"
Write-Host "     npx supabase functions deploy generate-storytelling"
Write-Host "     npx supabase functions deploy generate-diary"
