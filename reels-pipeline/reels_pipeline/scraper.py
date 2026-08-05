"""Scrape and download a reference Instagram Reel via Apify.

Mirrors Step 3 of the reels-scripting skill: try the reel scraper first, then
fall back through two more actor variants before giving up.
"""

from __future__ import annotations

import json
import re
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .config import Config

# (actor id, run input) tried in order. The first to return an item with a
# playable video URL wins.
_ACTOR_VARIANTS: list[tuple[str, dict[str, Any]]] = [
    ("apify/instagram-reel-scraper", {"directUrls": ["{url}"], "resultsLimit": 1}),
    ("apify/instagram-reel-scraper", {"urls": ["{url}"], "resultsLimit": 1}),
    (
        "apify/instagram-scraper",
        {"directUrls": ["{url}"], "resultsType": "posts", "resultsLimit": 1},
    ),
]

_SHORTCODE_RE = re.compile(r"/(?:reel|reels|p|tv)/([A-Za-z0-9_-]+)")


class ScrapeError(RuntimeError):
    """Raised when every Apify actor variant fails to return a usable Reel."""


@dataclass
class ReelData:
    """A scraped Reel plus the paths we wrote to disk."""

    url: str
    short_code: str
    username: str
    video_url: str
    raw: dict[str, Any]
    video_path: Path | None = None
    data_path: Path | None = None
    metrics: dict[str, Any] = field(default_factory=dict)

    @property
    def caption(self) -> str:
        return str(self.raw.get("caption") or self.raw.get("text") or "")


def short_code_from_url(url: str) -> str:
    match = _SHORTCODE_RE.search(url)
    return match.group(1) if match else "reel"


def _fill(run_input: dict[str, Any], url: str) -> dict[str, Any]:
    filled: dict[str, Any] = {}
    for key, value in run_input.items():
        if isinstance(value, list):
            filled[key] = [v.format(url=url) if isinstance(v, str) else v for v in value]
        else:
            filled[key] = value.format(url=url) if isinstance(value, str) else value
    return filled


def _extract_video_url(item: dict[str, Any]) -> str | None:
    for key in ("videoUrl", "video_url", "videoUrlHd", "displayUrl"):
        value = item.get(key)
        if isinstance(value, str) and value.startswith("http") and ".mp4" in value:
            return value
    # instagram-scraper posts nest the video under videoVersions/videoUrl.
    for key in ("videoUrl", "video_url"):
        value = item.get(key)
        if isinstance(value, str) and value.startswith("http"):
            return value
    return None


def _extract_metrics(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "views": item.get("videoViewCount")
        or item.get("videoPlayCount")
        or item.get("views"),
        "likes": item.get("likesCount") or item.get("likes"),
        "comments": item.get("commentsCount") or item.get("comments"),
        "username": item.get("ownerUsername") or item.get("username"),
    }


def scrape_reel(url: str, config: Config) -> ReelData:
    """Scrape a Reel, trying each actor variant until one returns a video."""
    token = config.require_apify()
    try:  # apify-client is optional at import time so `--help` always works.
        from apify_client import ApifyClient
    except ImportError as exc:  # pragma: no cover - depends on install state
        raise ScrapeError(
            "apify-client is not installed. Run: pip install apify-client"
        ) from exc

    client = ApifyClient(token)
    errors: list[str] = []

    for actor_id, run_input in _ACTOR_VARIANTS:
        filled = _fill(run_input, url)
        try:
            run = client.actor(actor_id).call(run_input=filled)
        except Exception as exc:  # noqa: BLE001 - report and try the next variant
            errors.append(f"{actor_id} {list(run_input)}: {exc}")
            continue

        dataset_id = (run or {}).get("defaultDatasetId")
        if not dataset_id:
            errors.append(f"{actor_id}: no dataset returned")
            continue

        items = list(client.dataset(dataset_id).iterate_items())
        if not items:
            errors.append(f"{actor_id}: 0 items")
            continue

        item = items[0]
        video_url = _extract_video_url(item)
        if not video_url:
            errors.append(f"{actor_id}: item had no video URL")
            continue

        metrics = _extract_metrics(item)
        short_code = str(item.get("shortCode") or short_code_from_url(url))
        username = str(metrics.get("username") or "unknown")
        return ReelData(
            url=url,
            short_code=short_code,
            username=username,
            video_url=video_url,
            raw=item,
            metrics=metrics,
        )

    raise ScrapeError(
        "All Apify actor variants failed to return a usable Reel:\n  - "
        + "\n  - ".join(errors)
    )


def download_reel(reel: ReelData, config: Config) -> ReelData:
    """Download the video and persist the raw scrape JSON."""
    config.ensure_dirs()
    downloads = config.workdir / "downloads"
    video_path = downloads / f"{reel.username}_{reel.short_code}.mp4"

    with urllib.request.urlopen(reel.video_url) as response, open(video_path, "wb") as fh:
        while chunk := response.read(1 << 16):
            fh.write(chunk)

    data_path = config.workdir / f"reel_data_{reel.short_code}.json"
    data_path.write_text(json.dumps(reel.raw, indent=2, default=str))

    reel.video_path = video_path
    reel.data_path = data_path
    return reel
