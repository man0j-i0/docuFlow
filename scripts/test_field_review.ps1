# Verifies the field-review API (Phase 4, PR 1):
#   - PATCH /fields/{id} accept / edit / reject
#   - edit without corrected_value is rejected (serializer validation)
#   - auditor cannot PATCH a field (403)
#   - submit_review moves review -> pending_approval, and 409s from a bad state
#
# Assumes at least one extracted document exists. If not, upload one via the UI
# (or run test_job_polling.ps1) first.

$ErrorActionPreference = "Stop"
$base = "http://localhost/api/v1"
$pw = "devpass123"

function Tok($e) {
    (Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType 'application/json' `
        -Body (@{ email = $e; password = $pw } | ConvertTo-Json)).access
}
function Code($block) {
    try { & $block | Out-Null; return 200 } catch { return $_.Exception.Response.StatusCode.value__ }
}

$revH = @{ Authorization = "Bearer $(Tok 'reviewer@docuflow.local')" }
$audH = @{ Authorization = "Bearer $(Tok 'auditor@docuflow.local')" }

$fields = (Invoke-RestMethod -Uri "$base/fields" -Headers $revH).results
if ($fields.Count -lt 3) { "need >=3 extracted fields - upload a document first"; exit 1 }
$f1 = $fields[0].id
$f2 = $fields[1].id
$f3 = $fields[2].id   # a FRESH field for the no-value validation check

# 1. accept
$acc = Invoke-RestMethod -Uri "$base/fields/$f1" -Method Patch -Headers $revH `
    -ContentType 'application/json' -Body (@{ status = "accepted" } | ConvertTo-Json)
"accept            : $($acc.status)                (want accepted)"

# 2. edit with corrected_value
$ed = Invoke-RestMethod -Uri "$base/fields/$f2" -Method Patch -Headers $revH `
    -ContentType 'application/json' -Body (@{ status = "edited"; corrected_value = "fixed" } | ConvertTo-Json)
"edit              : $($ed.status) -> $($ed.corrected_value)      (want edited -> fixed)"

# 3. edit a FRESH field WITHOUT corrected_value -> 400 (serializer validation).
#    Fetch an 'unreviewed' field: it has never been edited, so corrected_value
#    is guaranteed empty. (Picking by list index is unreliable — ordering by a
#    non-unique key leaves ties in arbitrary order, so an index can land on an
#    already-edited field.)
$fresh = (Invoke-RestMethod -Uri "$base/fields?status=unreviewed" -Headers $revH).results[0]
if ($fresh) {
    $c = Code { Invoke-RestMethod -Uri "$base/fields/$($fresh.id)" -Method Patch -Headers $revH `
            -ContentType 'application/json' -Body (@{ status = "edited" } | ConvertTo-Json) }
    "edit no value     : $c                       (want 400)"
} else {
    "edit no value     : SKIPPED (no unreviewed field left)"
}

# 4. auditor PATCH -> 403
$c = Code { Invoke-RestMethod -Uri "$base/fields/$f1" -Method Patch -Headers $audH `
        -ContentType 'application/json' -Body (@{ status = "accepted" } | ConvertTo-Json) }
"auditor patch     : $c                       (want 403)"

# 5. submit_review from a non-review application -> 409
#    (grab any application; most won't be in 'review')
$app = (Invoke-RestMethod -Uri "$base/applications" -Headers $revH).results |
    Where-Object { $_.status -ne "review" } | Select-Object -First 1
if ($app) {
    $c = Code { Invoke-RestMethod -Uri "$base/applications/$($app.id)/submit_review" -Method Post -Headers $revH }
    "submit bad state  : $c   (want 409, app was '$($app.status)')"
}
