$pw = "devpass123"
function Tok($e){ (Invoke-RestMethod -Uri http://localhost/api/v1/auth/login -Method Post -ContentType 'application/json' -Body (@{email=$e;password=$pw}|ConvertTo-Json)).access }
$rev = Tok "reviewer@docuflow.local"
$aud = Tok "auditor@docuflow.local"

# 1. reviewer creates → 201, owner is the reviewer
$body = @{ title="Test application"; description="hello" } | ConvertTo-Json
$app = Invoke-RestMethod -Uri http://localhost/api/v1/applications -Method Post -Body $body -ContentType 'application/json' -Headers @{Authorization="Bearer $rev"}
"created: $($app.id) | status=$($app.status) | owner=$($app.owner.email)"

# 2. mass-assignment probe — status and owner must be IGNORED
$evil = @{ title="Evil"; status="approved"; owner="00000000-0000-0000-0000-000000000000" } | ConvertTo-Json
$e = Invoke-RestMethod -Uri http://localhost/api/v1/applications -Method Post -Body $evil -ContentType 'application/json' -Headers @{Authorization="Bearer $rev"}
"escalation: status=$($e.status) (want draft) | owner=$($e.owner.email) (want reviewer@)"

# 3. auditor can read
"auditor list: " + (Invoke-RestMethod -Uri http://localhost/api/v1/applications -Headers @{Authorization="Bearer $aud"}).count

# 4. auditor CANNOT create → must be 403
try { Invoke-RestMethod -Uri http://localhost/api/v1/applications -Method Post -Body $body -ContentType 'application/json' -Headers @{Authorization="Bearer $aud"} | Out-Null; "auditor create: UNEXPECTED 200" }
catch { "auditor create: $($_.Exception.Response.StatusCode.value__) (want 403)" }
