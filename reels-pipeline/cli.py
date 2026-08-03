#!/usr/bin/env python3
"""Command-line interface for the reels pipeline.

Implements the reels-scripting skill as a scriptable CLI:

    scrape   -> Apify scrape + video download        (Step 3)
    analyze  -> Gemini 2.5 Flash video analysis        (Step 4)
    write    -> new Reel script scaffold               (Step 5)
    score    -> QA the script against the rules        (Step 6)
    run      -> scrape + analyze + write end to end

Examples:
    python cli.py run "https://www.instagram.com/reel/CxAbC123/" \\
        --topic "Why AI agents beat prompt libraries" --trigger SCRIPT
    python cli.py score ~/Desktop/Reels/reel-my-format.md
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from reels_pipeline import __version__
from reels_pipeline.analyzer import AnalysisError, analyse_video
from reels_pipeline.config import Config, MissingCredentials
from reels_pipeline.rules import format_report, score_script
from reels_pipeline.scraper import ScrapeError, download_reel, scrape_reel
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
