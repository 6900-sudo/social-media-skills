#!/usr/bin/env python3
"""Command-line interface for the reels pipeline.

Implements the reels-scripting skill as a scriptable CLI:

    scrape   -> Apify scrape + video download        (Step 3)
    analyze  -> Gemini 2.5 Flash video analysis        (Step 4)
    write    -> new Reel script scaffold               (Step 5)
    score    -> QA the script against the rules        (Step 6)
    render   -> render the script to an MP4 (Remotion)  (Step 7)
    run      -> scrape + analyze + write end to end

Examples:
    python cli.py run "https://www.instagram.com/reel/CxAbC123/" \\
        --topic "Why AI agents beat prompt libraries" --trigger SCRIPT
    python cli.py score ~/Desktop/Reels/reel-my-format.md
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from reels_pipeline import __version__
from reels_pipeline.analyzer import AnalysisError, analyse_video
from reels_pipeline.config import Config, MissingCredentials
from reels_pipeline.rules import format_report, score_script
from reels_pipeline.scraper import ScrapeError, download_reel, scrape_reel
from reels_pipeline.scriptfile import parse_script
from reels_pipeline.writer import save_analysis, write_script


def _config(args: argparse.Namespace) -> Config:
    return Config.load(workdir=getattr(args, "workdir", None))


def _print_reel_summary(reel) -> None:
    m = reel.metrics
    print(f"  username:   {reel.username}")
    print(f"  short code: {reel.short_code}")
    print(f"  views:      {m.get('views')}")
    print(f"  likes:      {m.get('likes')}")
    print(f"  comments:   {m.get('comments')}")
    caption = reel.caption.replace("\n", " ")[:200]
    print(f"  caption:    {caption}")
    if reel.video_path:
        size_mb = reel.video_path.stat().st_size / (1024 * 1024)
        print(f"  video:      {reel.video_path} ({size_mb:.1f} MB)")


def cmd_scrape(args: argparse.Namespace) -> int:
    config = _config(args)
    reel = scrape_reel(args.url, config)
    download_reel(reel, config)
    print("Scraped and downloaded Reel:")
    _print_reel_summary(reel)
    print(f"  raw data:   {reel.data_path}")
    return 0


def cmd_analyze(args: argparse.Namespace) -> int:
    config = _config(args)
    analysis = analyse_video(args.video, config, audience=args.audience)
    out = Path(args.output) if args.output else config.workdir / "analysis.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(analysis)
    print(f"Analysis written to {out}")
    return 0


def cmd_write(args: argparse.Namespace) -> int:
    from reels_pipeline.scraper import ReelData, short_code_from_url

    config = _config(args)
    reel = ReelData(
        url=args.url or "[reel url]",
        short_code=short_code_from_url(args.url or ""),
        username=args.username,
        video_url="",
        raw={},
        metrics={"views": args.views},
    )
    path = write_script(
        reel,
        topic=args.topic,
        config=config,
        analysis_path=args.analysis,
        title=args.title,
        trigger=args.trigger,
    )
    print(f"Script scaffold written to {path}")
    return 0


def cmd_score(args: argparse.Namespace) -> int:
    text = Path(args.script).read_text()
    score, violations = score_script(text)
    print(format_report(score, violations))
    return 0 if score >= 95 else 1


def cmd_run(args: argparse.Namespace) -> int:
    config = _config(args)

    print(f"[1/3] Scraping {args.url} ...")
    reel = scrape_reel(args.url, config)
    download_reel(reel, config)
    _print_reel_summary(reel)

    print("\n[2/3] Analysing with Gemini 2.5 Flash ...")
    analysis = analyse_video(reel.video_path, config, audience=args.audience)
    analysis_path = save_analysis(reel, analysis, config)
    print(f"  analysis: {analysis_path}")

    print("\n[3/3] Writing script scaffold ...")
    script_path = write_script(
        reel,
        topic=args.topic,
        config=config,
        analysis_path=analysis_path,
        title=args.title,
        trigger=args.trigger,
    )
    print(f"  script:   {script_path}")

    text = script_path.read_text()
    score, violations = score_script(text)
    print("\n" + format_report(score, violations))
    print(
        "\nNext: fill in the scaffold in your voice using the analysis, "
        "then re-run `score` until it hits 95/100."
    )
    return 0


def _resolve_project(args: argparse.Namespace) -> Path:
    if getattr(args, "project", None):
        return Path(args.project).expanduser().resolve()
    # cli.py lives in reels-pipeline/; reel-video is its sibling at the repo root.
    return Path(__file__).resolve().parent.parent / "reel-video"


def _load_props(spec: str | None) -> dict:
    if not spec:
        return {}
    if spec.startswith("@"):
        return json.loads(Path(spec[1:]).expanduser().read_text())
    return json.loads(spec)


def cmd_render(args: argparse.Namespace) -> int:
    project = _resolve_project(args)
    if not (project / "package.json").exists():
        print(f"error: Remotion project not found at {project}. Pass --project.", file=sys.stderr)
        return 2
    if not (project / "node_modules").exists():
        print(
            f"error: dependencies not installed. Run: (cd {project} && npm install)",
            file=sys.stderr,
        )
        return 2

    if args.composition:
        composition = args.composition
        props = _load_props(args.props)
        slug = args.out_slug or composition
    else:
        if not args.script:
            print(
                "error: provide a script path, or use --composition <id> --props <json>.",
                file=sys.stderr,
            )
            return 2
        composition = "ScriptReel"
        props = parse_script(args.script)
        slug = Path(args.script).stem.replace("reel-", "") or "scriptreel"

    if args.vo:
        props["voSrc"] = args.vo
    if args.vo_dur is not None:
        props["voDurS"] = args.vo_dur

    out = Path(args.out).expanduser() if args.out else (project / "out" / f"{slug}.mp4")
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = ["npx", "remotion", "render", composition, str(out), f"--props={json.dumps(props)}"]
    if args.frames:
        cmd.append(f"--frames={args.frames}")
    # In locked-down environments Remotion cannot download its Chromium; point it
    # at a preinstalled browser via REMOTION_BROWSER_EXECUTABLE when set.
    browser = os.environ.get("REMOTION_BROWSER_EXECUTABLE")
    if browser:
        cmd.append(f"--browser-executable={browser}")
    print(f"Rendering {composition} -> {out}")
    print("  props:", json.dumps(props)[:300])
    try:
        result = subprocess.run(cmd, cwd=str(project))
    except FileNotFoundError:
        print("error: npx not found. Install Node.js 18+ to render.", file=sys.stderr)
        return 2
    if result.returncode != 0:
        print(f"error: remotion render failed (exit {result.returncode}).", file=sys.stderr)
        return result.returncode
    print(f"Done: {out}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="cli.py",
        description="Reels pipeline: scrape -> analyse -> script an Instagram Reel.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument(
        "--workdir",
        help="Where to write downloads and scripts (default: ~/Desktop/Reels).",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_scrape = sub.add_parser("scrape", help="Scrape + download a reference Reel.")
    p_scrape.add_argument("url", help="Instagram Reel URL.")
    p_scrape.set_defaults(func=cmd_scrape)

    p_analyze = sub.add_parser("analyze", help="Analyse a downloaded Reel with Gemini.")
    p_analyze.add_argument("video", help="Path to the downloaded .mp4.")
    p_analyze.add_argument("--audience", default="[your audience]", help="Audience description.")
    p_analyze.add_argument("--output", help="Where to write the analysis markdown.")
    p_analyze.set_defaults(func=cmd_analyze)

    p_write = sub.add_parser("write", help="Write a new Reel script scaffold.")
    p_write.add_argument("--topic", required=True, help="Newsletter topic to repurpose.")
    p_write.add_argument("--url", help="Reference Reel URL.")
    p_write.add_argument("--username", default="reference", help="Reference creator username.")
    p_write.add_argument("--views", help="Reference view count.")
    p_write.add_argument("--analysis", help="Path to the Gemini analysis file.")
    p_write.add_argument("--title", help="Script title.")
    p_write.add_argument("--trigger", default="SCRIPT", help="Comment trigger word (caps).")
    p_write.set_defaults(func=cmd_write)

    p_score = sub.add_parser("score", help="QA-score a script against the rules.")
    p_score.add_argument("script", help="Path to the script markdown.")
    p_score.set_defaults(func=cmd_score)

    p_run = sub.add_parser("run", help="Full pipeline: scrape -> analyse -> write.")
    p_run.add_argument("url", help="Instagram Reel URL.")
    p_run.add_argument("--topic", required=True, help="Newsletter topic to repurpose.")
    p_run.add_argument("--audience", default="[your audience]", help="Audience description.")
    p_run.add_argument("--title", help="Script title.")
    p_run.add_argument("--trigger", default="SCRIPT", help="Comment trigger word (caps).")
    p_run.set_defaults(func=cmd_run)

    p_render = sub.add_parser("render", help="Render a script (or any composition) to MP4 via Remotion.")
    p_render.add_argument("script", nargs="?", help="Path to reel-[slug].md (renders ScriptReel).")
    p_render.add_argument("--composition", help="Render this composition id instead of ScriptReel (passthrough).")
    p_render.add_argument("--props", help="Props JSON string or @file (passthrough mode).")
    p_render.add_argument("--vo", help="Voiceover path relative to public/ (e.g. vo/slug.mp3).")
    p_render.add_argument("--vo-dur", type=float, dest="vo_dur", help="Voiceover length in seconds (sizes ScriptReel).")
    p_render.add_argument("--project", help="Path to the reel-video Remotion project (default: sibling of the repo).")
    p_render.add_argument("--out", help="Output MP4 path (default: <project>/out/<slug>.mp4).")
    p_render.add_argument("--out-slug", dest="out_slug", help="Slug for the default output filename (passthrough mode).")
    p_render.add_argument("--frames", help="Frame range to render, e.g. 0-60 (quick preview).")
    p_render.set_defaults(func=cmd_render)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except (MissingCredentials, ScrapeError, AnalysisError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
