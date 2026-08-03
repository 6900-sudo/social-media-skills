"""QA scoring for Reel scripts (Step 6 of the skill).

These are mechanical checks against the non-negotiable rules. A human or Claude
still owns the creative pass; this just flags the common violations so nothing
below 95/100 ships.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class Violation:
    rule: str
    detail: str
    penalty: int


# Rough spoken-word rate used to estimate read-aloud duration.
_WORDS_PER_SECOND = 2.5
_MAX_DURATION_SECONDS = 45


def _section(text: str, header: str) -> str:
    """Return the body under a `## header ...` block, or empty string."""
    pattern = re.compile(
        rf"^##\s+{re.escape(header)}.*?$(.*?)(?=^##\s|\Z)",
        re.IGNORECASE | re.MULTILINE | re.DOTALL,
    )
    match = pattern.search(text)
    return match.group(1).strip() if match else ""


def _hook_text(text: str) -> str:
    return _section(text, "Hook")


def _spoken_words(text: str) -> list[str]:
    """Words from the script's spoken sections (Hook, Point, CTA), not prose."""
    spoken: list[str] = []
    for header in ("Hook", "Point 1", "Point 2", "CTA"):
        spoken.extend(re.findall(r"[A-Za-z']+", _section(text, header)))
    return spoken


def score_script(text: str) -> tuple[int, list[Violation]]:
    """Return (score out of 100, violations)."""
    violations: list[Violation] = []

    hook = _hook_text(text)
    first_word = next(iter(re.findall(r"[A-Za-z']+", hook)), "")
    if first_word.lower() == "i":
        violations.append(
            Violation("hook-opens-with-I", "Hook opens with 'I'. Use this/you/a fact/a name.", 15)
        )

    # Em dashes and semicolons are banned.
    if "—" in text:
        violations.append(Violation("no-em-dash", "Contains an em dash (—).", 10))
    if ";" in text:
        violations.append(Violation("no-semicolon", "Contains a semicolon (;).", 10))

    # "link in bio" is banned; use comment automation.
    if re.search(r"link in bio", text, re.IGNORECASE):
        violations.append(Violation("no-link-in-bio", "Uses 'link in bio'.", 10))

    # Three or more staccato fragments in a row.
    if _has_staccato_run(text):
        violations.append(
            Violation("staccato-run", "Three or more short fragments in a row. Combine them.", 10)
        )

    # Comment trigger must be a single caps word.
    trigger = _section(text, "Comment trigger")
    if trigger:
        token = trigger.strip().splitlines()[0].strip()
        if not re.fullmatch(r"[A-Z]{2,}", token):
            violations.append(
                Violation("bad-trigger", f"Comment trigger '{token}' is not a single caps word.", 10)
            )

    # 2 points maximum.
    if _section(text, "Point 3"):
        violations.append(Violation("too-many-points", "3 points found. Maximum is 2.", 10))

    # Duration estimate from spoken words.
    words = _spoken_words(text)
    if words:
        estimate = len(words) / _WORDS_PER_SECOND
        if estimate > _MAX_DURATION_SECONDS:
            violations.append(
                Violation(
                    "too-long",
                    f"~{estimate:.0f}s read-aloud (>{_MAX_DURATION_SECONDS}s). Trim it.",
                    10,
                )
            )

    score = max(0, 100 - sum(v.penalty for v in violations))
    return score, violations


def _has_staccato_run(text: str) -> bool:
    """Detect 3+ consecutive very short sentences (<= 3 words)."""
    sentences = re.split(r"[.!?\n]+", text)
    run = 0
    for sentence in sentences:
        words = re.findall(r"[A-Za-z']+", sentence)
        if 0 < len(words) <= 3:
            run += 1
            if run >= 3:
                return True
        else:
            run = 0
    return False


def format_report(score: int, violations: list[Violation]) -> str:
    lines = [f"QA score: {score}/100"]
    if not violations:
        lines.append("No violations. Ready to ship.")
    else:
        lines.append("Violations:")
        for v in violations:
            lines.append(f"  - [{v.rule}] {v.detail} (-{v.penalty})")
        if score < 95:
            lines.append("Below the 95/100 gate. Fix violations before delivering.")
    return "\n".join(lines)
