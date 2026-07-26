# Verifies the MockExtractor runs and is deterministic (same file -> same output).
# No DB, no HTTP — exercises the extractor interface in isolation.
#
# The script is piped into `manage.py shell` via stdin rather than passed with
# -c, because -c mangles multi-line strings and strips quotes through the
# PowerShell -> docker layer.

$py = @'
from apps.extraction.extractors import get_extractor

ex = get_extractor()
print("backend:", type(ex).__name__)

r1 = ex.extract(file_bytes=b"hello world", filename="a.pdf", content_type="application/pdf")
r2 = ex.extract(file_bytes=b"hello world", filename="a.pdf", content_type="application/pdf")

print("field count:", len(r1.fields))
for f in r1.fields:
    print("  ", f.key, "=", f.value, "(", f.confidence, ") bbox=", f.bbox)

same = [f.confidence for f in r1.fields] == [f.confidence for f in r2.fields]
print("deterministic:", same)

# A different file must produce different output.
r3 = ex.extract(file_bytes=b"different", filename="b.pdf", content_type="application/pdf")
differs = [f.value for f in r1.fields] != [f.value for f in r3.fields]
print("varies by input:", differs)

print("RESULT:", "PASS" if (same and differs and len(r1.fields) == 5) else "FAIL")
'@

$py | docker compose exec -T backend python manage.py shell
