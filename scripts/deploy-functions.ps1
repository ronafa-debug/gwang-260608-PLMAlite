# Deploy Edge Functions (optional - app uses /api routes by default)
param(
  [string]$ProjectRef = "tbecxrfbcqifrwuhoaik"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-Supabase {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & npx.cmd supabase @Args
  if ($LASTEXITCODE -ne 0) {
    throw "supabase command failed: supabase $($Args -join ' ')"
  }
}

Write-Host "Deploying Edge Functions to project: $ProjectRef"

& "$PSScriptRoot\ensure-supabase-auth.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

$keysJson = & npx.cmd supabase projects api-keys --project-ref $ProjectRef --output json
$keys = $keysJson | ConvertFrom-Json
$serviceRoleKey = ($keys | Where-Object { $_.name -eq "service_role" }).api_key

if ($serviceRoleKey) {
  Invoke-Supabase secrets set "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey" --project-ref $ProjectRef
}

Invoke-Supabase functions deploy generate-storytelling generate-diary `
  --project-ref $ProjectRef `
  --no-verify-jwt `
  --use-api

Write-Host "Deploy complete." -ForegroundColor Green
