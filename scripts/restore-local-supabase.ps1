<#
PowerShell script to restore a pg_dump custom-format (.backup) into the local Supabase Postgres container.
Place your backup file in the repository root (default name used: db_cluster-25-03-2025@13-19-10.backup)
Run from the repo root (PowerShell):
  powershell -ExecutionPolicy Bypass -File .\scripts\restore-local-supabase.ps1
Or specify a different backup filename:
  powershell -ExecutionPolicy Bypass -File .\scripts\restore-local-supabase.ps1 -BackupFile mydump.backup
#>
param(
  [string]$BackupFile = "db_cluster-25-03-2025@13-19-10.backup"
)

# Resolve paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RepoRoot = Resolve-Path "$ScriptDir\.." | Select-Object -First 1
$BackupPath = Join-Path $RepoRoot $BackupFile

if (-not (Test-Path $BackupPath)) {
  Write-Error "Backup file not found: $BackupPath"
  exit 1
}

Write-Host "Backup found: $BackupPath"

# Ensure Docker is available
try {
  docker version > $null 2>&1
} catch {
  Write-Error "Docker does not appear to be running or is not in PATH. Start Docker Desktop and retry."
  exit 1
}

# Try to identify the Supabase DB container
$dbContainer = docker ps --filter "name=supabase" --format "{{.Names}}" | Select-Object -First 1
if (-not $dbContainer) {
  # fallback: pick a container with 'db' in the name
  $dbContainer = docker ps --format "{{.Names}}" | Where-Object { $_ -match 'db' } | Select-Object -First 1
}

if (-not $dbContainer) {
  Write-Error "Could not detect a Supabase/Postgres container. Run 'docker ps' and provide the container name." 
  docker ps
  exit 1
}

Write-Host "Using DB container: $dbContainer"

# Copy backup into container
Write-Host "Copying backup into container..."
$containerTarget = "${dbContainer}:/tmp/backup.backup"
docker cp "$BackupPath" "$containerTarget"
if ($LASTEXITCODE -ne 0) {
  Write-Error "docker cp failed"
  exit 1
}

# Run pg_restore inside container
Write-Host "Starting restore (pg_restore). This may take a while..."
# Use --no-owner and --clean to avoid ownership/role issues and to overwrite existing objects
docker exec -i ${dbContainer} pg_restore -U postgres -d postgres --no-owner --clean /tmp/backup.backup
if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_restore failed. Try running with --verbose or inspect container logs."
  exit 1
}

Write-Host "Restore finished. Running quick verification (list tables)..."

docker exec -it ${dbContainer} psql -U postgres -d postgres -c "\dt"

Write-Host "Done. If you need the anon/public key or API URL for local Supabase, check the 'supabase start' output or look in the .supabase folder."
Write-Host "Next: update .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart the dev server."
