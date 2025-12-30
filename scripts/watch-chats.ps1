# Poll the database for changes to chat messages and print the latest message when it changes.
# Usage: Run this in a separate PowerShell window.

$intervalSeconds = 2
$lastCount = -1

while ($true) {
    try {
        $query = "SELECT count(*)::int AS cnt FROM public.messages;"
        $count = docker exec -e PGPASSWORD=postgres supabase_db_project-CBA-AI-Foundry psql -U supabase_admin -d postgres -t -c \"$query\" 2>$null | ForEach-Object { $_.Trim() }
        if (-not [int]::TryParse($count, [ref]$null)) {
            Start-Sleep -Seconds $intervalSeconds
            continue
        }
        $count = [int]$count
        if ($count -ne $lastCount) {
            $lastCount = $count
            Write-Host "[watch-chats] messages count: $count"
            $latest = docker exec -e PGPASSWORD=postgres supabase_db_project-CBA-AI-Foundry psql -U supabase_admin -d postgres -t -c \"SELECT id, session_id, role, substring(content for 200) AS content_snippet, timestamp FROM public.messages ORDER BY timestamp DESC LIMIT 1;\" 2>$null
            Write-Host "[watch-chats] latest:"
            Write-Host $latest
        }
    } catch {
        Write-Host "watch error: $_"
    }
    Start-Sleep -Seconds $intervalSeconds
}
