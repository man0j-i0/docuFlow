# Verifies the approval endpoints + audit read API (Phase 5, PR 3):
#   - admin can submit_review -> approve, driving review -> pending_approval -> approved
#   - each transition is auditable and readable via GET /audit
#   - the state machine still guards approve (a second approve -> 409)
#   - approve is admin-only (reviewer -> 403)
#   - the audit API is read-only (POST /audit -> 405)
#
# Needs an application in 'review'. If none exists, upload + extract one first
# (via the UI or test_job_polling.ps1).

$ErrorActionPreference = "Stop"
$base = "http://localhost/api/v1"

function Tok($e) {
    (Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType 'application/json' `
        -Body (@{ email = $e; password = "devpass123" } | ConvertTo-Json)).access
}
function Code($block) { try { & $block | Out-Null; 200 } catch { $_.Exception.Response.StatusCode.value__ } }

$AH = @{ Authorization = "Bearer $(Tok 'admin@docuflow.local')" }
$RH = @{ Authorization = "Bearer $(Tok 'reviewer@docuflow.local')" }

$app = (Invoke-RestMethod -Uri "$base/applications?status=review" -Headers $AH).results | Select-Object -First 1
if (-not $app) { "no application in 'review' - upload+extract one first"; exit 1 }
$id = $app.id
"using application: $id"

# 1. reviewer cannot approve (admin-only) -> 403
"reviewer approve  : $(Code { Invoke-RestMethod -Uri "$base/applications/$id/approve" -Method Post -Headers $RH })  (want 403)"

# 2. submit_review (review -> pending_approval), then approve (-> approved)
Invoke-RestMethod -Uri "$base/applications/$id/submit_review" -Method Post -Headers $AH | Out-Null
$approved = Invoke-RestMethod -Uri "$base/applications/$id/approve" -Method Post -Headers $AH
"after approve     : $($approved.status)  (want approved)"

# 3. second approve is blocked by the state machine -> 409
"double approve    : $(Code { Invoke-RestMethod -Uri "$base/applications/$id/approve" -Method Post -Headers $AH })  (want 409)"

# 4. audit API is read-only -> POST 405
"post to /audit    : $(Code { Invoke-RestMethod -Uri "$base/audit" -Method Post -Headers $AH -ContentType 'application/json' -Body '{}' })  (want 405)"

# 5. read the audit trail for this application
"`n--- audit trail for this application ---"
(Invoke-RestMethod -Uri "$base/audit?entity_type=Application&entity_id=$id" -Headers $AH).results |
    Select-Object action, actor_email,
        @{ n = 'from'; e = { $_.old_value.status } },
        @{ n = 'to'; e = { $_.new_value.status } } |
    Format-Table -AutoSize
