$pw="devpass123"
$tok = (Invoke-RestMethod -Uri http://localhost/api/v1/auth/login -Method Post -ContentType 'application/json' -Body (@{email="reviewer@docuflow.local";password=$pw}|ConvertTo-Json)).access
$H = @{Authorization="Bearer $tok"}

$app = Invoke-RestMethod -Uri http://localhost/api/v1/applications -Method Post -Headers $H -ContentType 'application/json' -Body (@{title="Upload test"}|ConvertTo-Json)

# 1. presign
$init = Invoke-RestMethod -Uri "http://localhost/api/v1/applications/$($app.id)/documents" -Method Post -Headers $H -ContentType 'application/json' -Body (@{filename="test.pdf";content_type="application/pdf"}|ConvertTo-Json)
"doc: $($init.document.id) | status: $($init.document.status)"

# 2. PUT straight to MinIO — no auth header, the URL is the credential
"dummy pdf content" | Out-File -Encoding ascii test.pdf
Invoke-RestMethod -Uri $init.upload_url -Method Put -InFile test.pdf -ContentType 'application/pdf'

# 3. complete
$done = Invoke-RestMethod -Uri "http://localhost/api/v1/documents/$($init.document.id)/complete" -Method Post -Headers $H
"status=$($done.status) size=$($done.size_bytes) checksum=$($done.checksum)"

# 4. download round-trip
$dl = Invoke-RestMethod -Uri "http://localhost/api/v1/documents/$($init.document.id)/file" -Headers $H
Invoke-WebRequest -Uri $dl.url -OutFile roundtrip.pdf
Get-Content roundtrip.pdf
