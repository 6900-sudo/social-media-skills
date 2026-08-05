"""Parse a written reel script (`reel-[slug].md`) into render props.

Turns the markdown the writer emits (Step 5) into the prop shape the Remotion
`ScriptReel` composition expects. Reuses the section slicer from ``rules`` so the
header handling stays consistent with the QA scorer.
"""

from __future__ import annotations

import re
from pathlib import Path

from .rules import _section


def _clean(block: str) -> str:
    """Collapse a section body to a single line, dropping placeholder lines."""
    lines = []
    for raw in block.splitlines():
        line = raw.strip()
        if not line or line == "---":
            continue
        # Skip untouched scaffold placeholders like "[Exact words.]".
        if line.startswith("[") and line.endswith("]"):
            continue
        lines.append(line)
    return " ".join(lines).strip()


def _title(text: str) -> str:
    match = re.search(r"^#\s+Reel:\s*(.+)$", text, re.MULTILINE)
    return match.group(1).strip() if match else "reel"


def _points(text: str) -> list[str]:
    points = []
    for i in range(1, 11):  # Point 1..Point 10
        body = _clean(_section(text, f"Point {i}"))
        if not body:
            break
        points.append(body)
    return points


def _trigger(text: str, cta: str) -> str | None:
    explicit = _clean(_section(text, "Comment trigger"))
    if explicit:
        token = explicit.split()[0]
        if re.fullmatch(r"[A-Z]{2,}", token):
            return token
    match = re.search(r"\bComment\s+([A-Z]{2,})\b", cta)
    return match.group(1) if match else None


def parse_script(path: str | Path) -> dict:
    """Parse a reel script markdown file into ScriptReel props."""
    text = Path(path).read_text()
    cta = _clean(_section(text, "CTA"))
    props: dict = {
        "title": _title(text),
        "hook": _clean(_section(text, "Hook")),
        "points": _points(text),
        "cta": cta,
        "caption": _clean(_section(text, "Caption")),
    }
    trigger = _trigger(text, cta)
    if trigger:
        props["trigger"] = trigger
    return props
