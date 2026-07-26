"""The pluggable extractor boundary.

Everything above this line (the Celery task) depends only on ExtractorBackend,
never on a concrete implementation. That's what makes the AI swappable and lets
the whole pipeline run in CI with no external calls.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ExtractedFieldResult:
    key: str
    value: str
    confidence: float
    bbox: dict[str, Any] | None = None


@dataclass
class ExtractionResult:
    fields: list[ExtractedFieldResult] = field(default_factory=list)


class ExtractorBackend(ABC):
    """A backend takes raw file bytes and returns structured fields + confidence."""

    @abstractmethod
    def extract(
        self, *, file_bytes: bytes, filename: str, content_type: str
    ) -> ExtractionResult:
        ...
