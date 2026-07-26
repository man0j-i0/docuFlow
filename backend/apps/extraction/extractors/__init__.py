from django.conf import settings

from .base import ExtractorBackend
from .mock import MockExtractor


def get_extractor() -> ExtractorBackend:
    """Selected by the EXTRACTOR_BACKEND setting. Defaults to mock."""
    backend = getattr(settings, "EXTRACTOR_BACKEND", "mock")

    if backend == "mock":
        return MockExtractor()

    # The real backend (Tesseract + Claude) plugs in here behind the same
    # interface — no caller changes. Deferred; mock is the default.
    raise ValueError(f"Unknown EXTRACTOR_BACKEND: {backend!r}")
