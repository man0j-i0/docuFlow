# Verifies the application state machine (Phase 5, PR 1):
#   - legal transitions apply and log a StateTransition row (in one transaction)
#   - illegal transitions raise InvalidTransition (nothing changes)
#   - the full legal chain draft -> ... -> archived works
#   - submit_review is a detail route (needs a pk) and does not 404
#
# Part A drives the transition() service directly via the shell (deterministic).
# Part B checks the submit_review HTTP route.

$ErrorActionPreference = "Stop"

# ---------- Part A: state machine service ----------
$py = @'
from apps.applications.models import Application, StateTransition
from apps.applications.workflow import transition, InvalidTransition, can_transition
from apps.users.models import User

admin = User.objects.filter(role="admin").first()

# fresh throwaway application in draft
app = Application.objects.create(title="__state_machine_test__", owner=admin)
ok = True

# 1. full legal chain
chain = ["uploaded", "extracting", "review", "pending_approval", "approved", "archived"]
for target in chain:
    transition(app, target, actor=admin)
print("final status :", app.status, "(want archived)")
ok = ok and app.status == "archived"

# 2. every step logged, in order
logged = StateTransition.objects.filter(application=app).count()
print("transitions  :", logged, "(want 6)")
ok = ok and logged == 6

# 3. an illegal jump raises and changes nothing
before = app.status
try:
    transition(app, "review", actor=admin)   # archived -> review is illegal
    print("illegal jump : ALLOWED (bad)")
    ok = False
except InvalidTransition as e:
    print("illegal jump : blocked ->", e)
app.refresh_from_db()
ok = ok and app.status == before

# 4. can_transition matches the map
print("can review->pending_approval :", can_transition("review", "pending_approval"), "(want True)")
print("can review->draft            :", can_transition("review", "draft"), "(want False)")
ok = ok and can_transition("review", "pending_approval") and not can_transition("review", "draft")

# cleanup (also removes its transitions via CASCADE)
app.delete()

print("PART A:", "PASS" if ok else "FAIL")
'@

$py | docker compose exec -T backend python manage.py shell

# ---------- Part B: submit_review route ----------
"`n--- Part B: submit_review HTTP route ---"
$base = "http://localhost/api/v1"
$tok = (Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType 'application/json' `
    -Body (@{ email = "reviewer@docuflow.local"; password = "devpass123" } | ConvertTo-Json)).access
$H = @{ Authorization = "Bearer $tok" }

$app = (Invoke-RestMethod -Uri "$base/applications" -Headers $H).results | Select-Object -First 1
if (-not $app) { "no application to test route on - create one first"; exit }

try {
    $r = Invoke-RestMethod -Uri "$base/applications/$($app.id)/submit_review" -Method Post -Headers $H
    "submit_review : 200 (app was in review)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 404) { "submit_review : 404" }
    else { "submit_review : $code (valid route; 409 = not in review state)" }
}
