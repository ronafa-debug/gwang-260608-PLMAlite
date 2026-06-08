# Add server-side keys to .env
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $Root ".env"

if (-not (Test-Path $envPath)) {
  Write-Host ".env file not found. Run setup first."
  exit 1
}

Write-Host "Add server-side keys to .env"
Write-Host "Get service_role from Supabase Dashboard -> Project Settings -> API"
Write-Host ""

$openai = Read-Host "OpenAI API Key (sk-...)"
$serviceRole = Read-Host "Supabase service_role key"

$content = Get-Content $envPath -Raw

$content = $content -replace '(?m)^OPENAI_API_KEY=.*$', "OPENAI_API_KEY=$openai"
$content = $content -replace '(?m)^SUPABASE_SERVICE_ROLE_KEY=.*$', "SUPABASE_SERVICE_ROLE_KEY=$serviceRole"

if ($content -notmatch 'OPENAI_API_KEY=') {
  $content += "`nOPENAI_API_KEY=$openai"
}
if ($content -notmatch 'SUPABASE_SERVICE_ROLE_KEY=') {
  $content += "`nSUPABASE_SERVICE_ROLE_KEY=$serviceRole"
}

$content | Out-File -FilePath $envPath -Encoding utf8NoBOM -NoNewline
Write-Host "Updated .env successfully." -ForegroundColor Green
