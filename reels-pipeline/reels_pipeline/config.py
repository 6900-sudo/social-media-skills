"""Configuration and environment handling for the reels pipeline."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


DEFAULT_WORKDIR = Path.home() / "Desktop" / "Reels"
GEMINI_MODEL = "gemini-2.5-flash"


def _load_dotenv() -> None:
    """Best-effort load of a local .env file.

    Uses python-dotenv if available, otherwise falls back to a tiny parser so
    the CLI works even before dependencies are installed.
    """
    env_path = Path.cwd() / ".env"
    if not env_path.exists():
        return
    try:  # pragma: no cover - exercised only when python-dotenv is installed
        from dotenv import load_dotenv

        load_dotenv(env_path)
        return
    except ImportError:
        pass

    for raw in env_path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


@dataclass
class Config:
    """Resolved runtime configuration."""

    apify_token: str | None
    google_api_key: str | None
    workdir: Path
    gemini_model: str = GEMINI_MODEL

    @classmethod
    def load(cls, workdir: str | os.PathLike[str] | None = None) -> "Config":
        _load_dotenv()
        base = Path(workdir).expanduser() if workdir else DEFAULT_WORKDIR
        return cls(
            apify_token=os.environ.get("APIFY_API_TOKEN"),
            google_api_key=os.environ.get("GOOGLE_AI_API_KEY"),
            workdir=base,
        )

    def require_apify(self) -> str:
        if not self.apify_token:
            raise MissingCredentials(
                "APIFY_API_TOKEN is not set. Run: export APIFY_API_TOKEN=your_token"
            )
        return self.apify_token

    def require_google(self) -> str:
        if not self.google_api_key:
            raise MissingCredentials(
                "GOOGLE_AI_API_KEY is not set. Run: export GOOGLE_AI_API_KEY=your_key"
            )
        return self.google_api_key

    def ensure_dirs(self) -> None:
        (self.workdir / "downloads").mkdir(parents=True, exist_ok=True)


class MissingCredentials(RuntimeError):
    """Raised when a required API credential is not configured."""
