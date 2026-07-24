$pw = "devpass123"
function Tok($e){ (Invoke-RestMethod -Uri http://localhost/api/v1/auth/login -Method Post -ContentType 'application/json' -Body (@{email=$e;password=$pw}|ConvertTo-Json)).access }

$rev = Tok "reviewer@docuflow.local"
$aud = Tok "auditor@docuflow.local"

# get a REAL application id (create one as reviewer if the list is empty)
$apps = (Invoke-RestMethod -Uri http://localhost/api/v1/applications -Headers @{Authorization="Bearer $rev"}).results
if ($apps.Count -eq 0) {
  $apps = ,(Invoke-RestMethod -Uri http://localhost/api/v1/applications -Method Post -Headers @{Authorization="Bearer $rev"} -ContentType 'application/json' -Body (@{title="perm probe"}|ConvertTo-Json))
}
$appId = $apps[0].id
"using application: $appId"

# auditor tries to presign an upload → must be 403 now
try {
  Invoke-RestMethod -Uri "http://localhost/api/v1/applications/$appId/documents" -Method Post -Headers @{Authorization="Bearer $aud"} -ContentType 'application/json' -Body (@{filename="x.pdf";content_type="application/pdf"}|ConvertTo-Json) | Out-Null
  "auditor presign: UNEXPECTED 200"
} catch {
  "auditor presign: $($_.Exception.Response.StatusCode.value__) (want 403)"
}
