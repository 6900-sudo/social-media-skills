"""Write the new Reel script scaffold (Step 5 of the skill).

The creative pass belongs to Claude/you, but this emits the exact file
structure the skill mandates, pre-filled with the reference metrics and a
pointer to the Gemini analysis so nothing gets dropped.
"""

from __future__ import annotations

import re
from pathlib import Path

from .config import Config
from .scraper import ReelData


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "reel"


SCRIPT_TEMPLATE = """\
# Reel: {title}

## Reference analysis
- URL: {url}
- Views: {views}
- Key technique: {key_technique}

## Duration target
30-45 seconds

## Hook (0-3s)
[Exact words. Never open with "I". Use "this", "you", a fact, or a name.]

## Point 1 ([start]-[end]s)
[Exact words.]

## Point 2 ([start]-[end]s)
[Exact words.]

## CTA ([start]-[end]s)
Comment {trigger} and I'll send you [specific thing].

---

## Caption
[Mirror the script, formatted for Instagram.]

## Comment trigger
{trigger}

## Deliverable
[What the comment trigger unlocks.]

---

## Visual notes
[Cuts, B-roll ideas, text overlays.]

---

## Newsletter topic
{topic}

## Gemini analysis
{analysis_ref}
"""


def write_script(
    reel: ReelData,
    topic: str,
    config: Config,
    analysis_path: str | Path | None = None,
    title: str | None = None,
    trigger: str = "SCRIPT",
) -> Path:
    """Write the script scaffold and return its path."""
    config.workdir.mkdir(parents=True, exist_ok=True)
    title = title or f"{reel.username} format on {topic}".strip()
    slug = slugify(title)

    analysis_ref = (
        f"See {analysis_path}" if analysis_path else "[Paste key findings here.]"
    )
    body = SCRIPT_TEMPLATE.format(
        title=title,
        url=reel.url,
        views=reel.metrics.get("views") or "[from Apify]",
        key_technique="[most important technique from the Gemini analysis]",
        trigger=trigger,
        topic=topic or "[newsletter topic]",
        analysis_ref=analysis_ref,
    )
    path = config.workdir / f"reel-{slug}.md"
    path.write_text(body)
    return path


def save_analysis(reel: ReelData, analysis: str, config: Config) -> Path:
    config.workdir.mkdir(parents=True, exist_ok=True)
    path = config.workdir / f"analysis_reference_{reel.short_code}.md"
    path.write_text(analysis)
    return path
