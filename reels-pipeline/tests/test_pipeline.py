"""Offline tests for the parts of the pipeline that need no API calls."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from reels_pipeline.rules import score_script  # noqa: E402
from reels_pipeline.scraper import short_code_from_url  # noqa: E402
from reels_pipeline.scriptfile import parse_script  # noqa: E402
from reels_pipeline.writer import slugify  # noqa: E402


def test_short_code_from_url():
    assert short_code_from_url("https://www.instagram.com/reel/CxAbC123/") == "CxAbC123"
    assert short_code_from_url("https://instagram.com/p/AbC_9-x/") == "AbC_9-x"
    assert short_code_from_url("not-a-url") == "reel"


def test_slugify():
    assert slugify("Why AI Agents Win!") == "why-ai-agents-win"
    assert slugify("   ") == "reel"


def test_score_clean_script():
    text = """\
# Reel: test

## Hook (0-3s)
This changed everything about how you work.

## Point 1 (3-20s)
You just drop the reference into the tool and it does the heavy lifting for you.

## Point 2 (20-40s)
The result feels like magic but it is really just good structure doing the work.

## CTA (40-45s)
Comment SCRIPT and I'll send you the template.

## Comment trigger
SCRIPT
"""
    score, violations = score_script(text)
    assert score == 100, violations


def test_parse_script(tmp_path=None):
    import tempfile

    md = """\
# Reel: AI agents beat prompt libraries

## Hook (0-3s)
This changed how you build with AI forever.

## Point 1 (3-20s)
You just drop the reference in and it does the heavy lifting for you.

## Point 2 (20-40s)
The result feels like magic but it is really just good structure.

## CTA (40-45s)
Comment SCRIPT and I'll send you the template.

## Caption
[Mirror the script.]

## Comment trigger
SCRIPT
"""
    d = tempfile.mkdtemp()
    p = Path(d) / "reel-ai-agents.md"
    p.write_text(md)
    props = parse_script(p)
    assert props["title"] == "AI agents beat prompt libraries"
    assert props["hook"].startswith("This changed how you build")
    assert len(props["points"]) == 2
    assert "heavy lifting" in props["points"][0]
    assert props["cta"].startswith("Comment SCRIPT")
    assert props["trigger"] == "SCRIPT"
    # Untouched placeholder caption is dropped, not rendered literally.
    assert props["caption"] == ""


def test_score_flags_violations():
    text = """\
# Reel: bad

## Hook (0-3s)
I built this thing — it is great; really.

## Point 1
Do this.

## Point 2
Do that.

## Point 3
And more.

## CTA
Just click the link in bio.

## Comment trigger
send me the script
"""
    score, violations = score_script(text)
    rules = {v.rule for v in violations}
    assert "hook-opens-with-I" in rules
    assert "no-em-dash" in rules
    assert "no-semicolon" in rules
    assert "no-link-in-bio" in rules
    assert "too-many-points" in rules
    assert "bad-trigger" in rules
    assert score < 95


if __name__ == "__main__":
    import traceback

    failures = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"PASS {name}")
            except Exception:  # noqa: BLE001
                failures += 1
                print(f"FAIL {name}")
                traceback.print_exc()
    raise SystemExit(1 if failures else 0)
