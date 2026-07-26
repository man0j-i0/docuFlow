import hashlib

from .base import ExtractedFieldResult, ExtractionResult, ExtractorBackend


class MockExtractor(ExtractorBackend):
    """Deterministic fake extractor — no keys, no cost, CI-safe.

    Produces a fixed set of fields. Confidence is derived from a hash of the
    file bytes, so the same file always yields the same 'AI' output — which is
    exactly what makes tests reproducible.
    """

    FIELD_KEYS = ["invoice_number", "date", "total_amount", "vendor_name", "tax_id"]

    def extract(
        self, *, file_bytes: bytes, filename: str, content_type: str
    ) -> ExtractionResult:
        digest = hashlib.sha256(file_bytes).hexdigest()

        results = []
        for i, key in enumerate(self.FIELD_KEYS):
            # Deterministic pseudo-values + confidences seeded from the digest.
            seed = int(digest[i * 4 : i * 4 + 4], 16)
            confidence = round(0.55 + (seed % 45) / 100, 2)  # 0.55–0.99
            results.append(
                ExtractedFieldResult(
                    key=key,
                    value=f"{key}_{digest[i * 6 : i * 6 + 6]}",
                    confidence=confidence,
                    bbox={
                        "page": 1,
                        "x": 0.1,
                        "y": 0.1 + i * 0.12,
                        "width": 0.3,
                        "height": 0.05,
                    },
                )
            )
        return ExtractionResult(fields=results)
