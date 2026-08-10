$slugs = Get-Content "D:\AI Tools practice SRC\Electric Vehicle Model Comparision\EVLYFE\EVLYFE\tool-output\evindia-blog-slugs.txt" | Where-Object { $_ -ne "" } | Select-Object -Skip 1
$fetchDir = "D:\AI Tools practice SRC\Electric Vehicle Model Comparision\EVLYFE\EVLYFE\tool-output\evindia-blog-fetch"
$logFile = "D:\AI Tools practice SRC\Electric Vehicle Model Comparision\EVLYFE\EVLYFE\tool-output\fetch-progress.txt"

$success = 0
$failed = 0
$skipped = 0
$results = @()

Write-Output "Starting fetch of $($slugs.Count) blog slugs..."

for ($i = 0; $i -lt $slugs.Count; $i++) {
    $slug = $slugs[$i].Trim()
    $outFile = Join-Path $fetchDir "$slug.json"
    
    # Skip if already fetched
    if (Test-Path $outFile) {
        $skipped++
        continue
    }
    
    $url = "https://evindia.online/blog/$slug"
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
        $content = $response.Content
        
        # Check if content is too large (>5MB)
        if ($content.Length -gt 5242880) {
            Write-Output "[$($i+1)/$($slugs.Count)] SKIP (too large): $slug ($([math]::Round($content.Length/1MB, 1))MB)"
            $failed++
            $results += "$slug|TOO_LARGE|$($content.Length)"
            continue
        }
        
        # Extract __NEXT_DATA__ JSON
        $nextDataMatch = [regex]::Match($content, '<script id="__NEXT_DATA__" type="application/json">(.*?)</script>')
        if ($nextDataMatch.Success) {
            $nextData = $nextDataMatch.Groups[1].Value
            Set-Content -Path $outFile -Value $nextData -Encoding UTF8
            $success++
            Write-Output "[$($i+1)/$($slugs.Count)] OK: $slug"
        } else {
            # Save raw HTML as fallback
            Set-Content -Path $outFile -Value $content -Encoding UTF8
            $success++
            Write-Output "[$($i+1)/$($slugs.Count)] OK (raw HTML): $slug"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $failed++
        Write-Output "[$($i+1)/$($slugs.Count)] FAIL ($statusCode): $slug"
        $results += "$slug|$statusCode|0"
    }
    
    # Rate limit: small delay between requests
    Start-Sleep -Milliseconds 200
}

Write-Output "`nDone! Success: $success, Failed: $failed, Skipped: $skipped"
$results | Out-File $logFile -Encoding UTF8
