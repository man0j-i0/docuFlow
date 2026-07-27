# Verifies the extraction pipeline end to end via the HTTP API only:
# presign -> PUT to MinIO -> complete (auto-enqueues) -> poll GET /jobs/{id}
# until it reaches a terminal state -> confirm fields are readable.
#
# This mirrors exactly what the frontend does: it polls because the work is
# async and completes on the worker's timeline, not when complete() returns.

$ErrorActionPreference = "Stop"
$base = "http://localhost/api/v1"
$pw = "devpass123"

function Tok($e) {
    (Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType 'application/json' `
        -Body (@{ email = $e; password = $pw } | ConvertTo-Json)).access
}

$tok = Tok "reviewer@docuflow.local"
$H = @{ Authorization = "Bearer $tok" }

# application to attach to
$app = Invoke-RestMethod -Uri "$base/applications" -Method Post -Headers $H `
    -ContentType 'application/json' -Body (@{ title = "polling test" } | ConvertTo-Json)

# 1. presign
$init = Invoke-RestMethod -Uri "$base/applications/$($app.id)/documents" -Method Post -Headers $H `
    -ContentType 'application/json' `
    -Body (@{ filename = "poll.pdf"; content_type = "application/pdf" } | ConvertTo-Json)
$docId = $init.document.id
"presigned: doc=$docId"

# 2. PUT bytes straight to MinIO (no auth header — the URL is the credential)
"dummy pdf for polling test" | Out-File -Encoding ascii poll.pdf
Invoke-RestMethod -Uri $init.upload_url -Method Put -InFile poll.pdf -ContentType 'application/pdf' | Out-Null

# 3. complete -> auto-enqueues extraction; document returns 'extracting'
$done = Invoke-RestMethod -Uri "$base/documents/$docId/complete" -Method Post -Headers $H
"after complete: doc status = $($done.status)   (expect extracting)"

# 4. poll the job until it reaches a terminal state
$job = (Invoke-RestMethod -Uri "$base/jobs?document=$docId" -Headers $H).results[0]
$terminal = @("succeeded", "failed", "dead")
$tries = 0
while ($job.status -notin $terminal -and $tries -lt 15) {
    Start-Sleep -Seconds 1
    $job = Invoke-RestMethod -Uri "$base/jobs/$($job.id)" -Headers $H
    $tries++
    "  poll #$tries -> job status = $($job.status)"
}

# 5. confirm fields are readable
$fields = (Invoke-RestMethod -Uri "$base/fields?document=$docId" -Headers $H).results
"job final : $($job.status)"
"fields    : $($fields.Count)"

$ok = ($job.status -eq "succeeded") -and ($fields.Count -eq 5)
"RESULT: " + $(if ($ok) { "PASS" } else { "FAIL" })

Remove-Item poll.pdf -ErrorAction SilentlyContinue
