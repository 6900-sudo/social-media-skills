"""Analyse a downloaded Reel with Gemini 2.5 Flash (Step 4 of the skill)."""

from __future__ import annotations

import time
from pathlib import Path

from .config import Config

ANALYSIS_PROMPT_TEMPLATE = """\
I'm studying this Reel to write my own script in a similar style for my audience of {audience}.

## Full Transcript
- Transcribe EVERY word with timestamps

## Hook
- Exact first words spoken
- Word count of the hook
- What makes it stop the scroll?

## Language Patterns
- Average sentence length
- You/your vs I/me ratio
- Transitions between points
- Where are the 'just' minimisers?

## Structure
- Total duration
- Section breakdown with timings
- What's the before/after moment?
- What's the CTA?

## One key insight
- The single most important technique to learn from this Reel
"""


class AnalysisError(RuntimeError):
    """Raised when Gemini analysis cannot be completed."""


def build_prompt(audience: str) -> str:
    return ANALYSIS_PROMPT_TEMPLATE.format(audience=audience or "[your audience]")


def analyse_video(
    video_path: str | Path,
    config: Config,
    audience: str = "[your audience]",
) -> str:
    """Send the video to Gemini 2.5 Flash and return the markdown analysis."""
    video_path = Path(video_path)
    if not video_path.exists():
        raise AnalysisError(f"Video not found: {video_path}")

    api_key = config.require_google()
    try:  # optional import keeps `--help` usable without the SDK installed
        import google.generativeai as genai
    except ImportError as exc:  # pragma: no cover - depends on install state
        raise AnalysisError(
            "google-generativeai is not installed. "
            "Run: pip install google-generativeai"
        ) from exc

    genai.configure(api_key=api_key)

    # The File API handles videos of any size; inline base64 only suits tiny clips.
    uploaded = genai.upload_file(path=str(video_path))
    uploaded = _wait_until_active(genai, uploaded)

    model = genai.GenerativeModel(config.gemini_model)
    prompt = build_prompt(audience)
    response = model.generate_content([prompt, uploaded])

    text = getattr(response, "text", None)
    if not text:
        raise AnalysisError("Gemini returned an empty analysis.")
    return text


def _wait_until_active(genai, uploaded, timeout: float = 300.0):
    """Poll the uploaded file until Gemini finishes processing it."""
    deadline = time.time() + timeout
    while getattr(uploaded.state, "name", "ACTIVE") == "PROCESSING":
        if time.time() > deadline:
            raise AnalysisError("Timed out waiting for Gemini to process the video.")
        time.sleep(3)
        uploaded = genai.get_file(uploaded.name)
    if getattr(uploaded.state, "name", "ACTIVE") == "FAILED":
        raise AnalysisError("Gemini failed to process the uploaded video.")
    return uploaded
