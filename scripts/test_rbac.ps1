$base  = "http://localhost/api/v1/auth"
$pw    = "devpass123"
$roles = @("admin", "reviewer", "auditor")

function Get-Token($email, $pw) {
    $body = @{ email = $email; password = $pw } | ConvertTo-Json
    (Invoke-RestMethod -Uri "$base/login" -Method Post -Body $body -ContentType 'application/json').access
}

$tokens = @{}
foreach ($r in $roles) { $tokens[$r] = Get-Token "$r@docuflow.local" $pw }

$expected = @{
    "rbac/admin"    = @{ admin = 200; reviewer = 403; auditor = 403 }
    "rbac/reviewer" = @{ admin = 200; reviewer = 200; auditor = 403 }
    "rbac/audit"    = @{ admin = 403; reviewer = 403; auditor = 200 }
}

"{0,-16} {1,7} {2,9} {3,8}   result" -f "endpoint", "admin", "reviewer", "auditor"
"-" * 56

$allPass = $true
foreach ($ep in "rbac/admin", "rbac/reviewer", "rbac/audit") {
    $got = @{}
    foreach ($r in $roles) {
        try {
            Invoke-RestMethod -Uri "$base/$ep" -Headers @{ Authorization = "Bearer $($tokens[$r])" } | Out-Null
            $got[$r] = 200
        } catch {
            $got[$r] = $_.Exception.Response.StatusCode.value__
        }
    }
    $ok = ($got.admin -eq $expected[$ep].admin) -and
          ($got.reviewer -eq $expected[$ep].reviewer) -and
          ($got.auditor -eq $expected[$ep].auditor)
    if (-not $ok) { $allPass = $false }
    $mark = if ($ok) { "PASS" } else { "FAIL" }
    "{0,-16} {1,7} {2,9} {3,8}   {4}" -f $ep, $got.admin, $got.reviewer, $got.auditor, $mark
}

""
if ($allPass) { "ALL PASS" } else { "SOME FAILED" }