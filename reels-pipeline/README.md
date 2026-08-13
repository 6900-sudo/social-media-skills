# Reels Pipeline

A scriptable CLI implementation of the [`reels-scripting`](../skills/reels-scripting/SKILL.md)
skill. It reverse-engineers an outlier Instagram Reel and scaffolds a new script
in your voice, repurposed from your newsletter.

Pipeline stages (mirroring the skill):

1. **scrape** — Apify scrapes the reference Reel and downloads the video.
2. **analyze** — Gemini 2.5 Flash transcribes it and breaks down hook, language,
   structure, and the one key technique.
3. **write** — emits the exact script scaffold the skill mandates, pre-filled
   with the reference metrics and a pointer to the analysis.
4. **score** — mechanically QA-scores a script against the non-negotiable rules
   (no opening "I", single-caps comment trigger, 2 points max, ≤45s, no em
   dashes or semicolons, no "link in bio").

The creative pass — filling the scaffold in your voice — stays with you or
Claude. The CLI does the plumbing and the guardrails.

## Setup

```bash
cd reels-pipeline
python3 -m pip install -r requirements.txt
cp .env.example .env   # then fill in your tokens
```

Required environment variables (via `.env` or your shell):

| Variable | Used for |
|---|---|
| `APIFY_API_TOKEN` | Instagram scraping |
| `GOOGLE_AI_API_KEY` | Gemini 2.5 Flash video analysis |

## Usage

Full pipeline:

```bash
python cli.py run "https://www.instagram.com/reel/CxAbC123/" \
  --topic "Why AI agents beat prompt libraries" \
  --audience "marketers who want AI leverage" \
  --trigger SCRIPT
```

Individual stages:

```bash
python cli.py scrape  "https://www.instagram.com/reel/CxAbC123/"
python cli.py analyze ~/Desktop/Reels/downloads/creator_CxAbC123.mp4 --audience "marketers"
python cli.py write   --topic "AI agents" --trigger SCRIPT --analysis ~/Desktop/Reels/analysis_reference_CxAbC123.md
python cli.py score   ~/Desktop/Reels/reel-ai-agents.md
```

Outputs land in `~/Desktop/Reels/` by default (override with `--workdir`).
`score` exits non-zero until the script clears the 95/100 gate, so it drops
into CI or a pre-commit check.

## Notes

- If every Apify actor variant fails, the CLI reports the failure and stops. It
  never fabricates analysis.
- Gemini 2.5 Flash is the model. Do not substitute without approval.
- `apify-client` and `google-genai` are imported lazily, so `--help`,
  `write`, and `score` work before those packages are installed.
