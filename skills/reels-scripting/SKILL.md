---
name: reels-scripting
description: >
  Turn a reference Instagram Reel into a script for your own Reel, tuned to your voice and repurposed from your newsletter content. Takes a Reel URL or Notion reference link, uses Apify to scrape the video, sends it to Gemini 2.5 Flash for full transcript + hook + structure analysis, then writes a new script applying the same patterns to your newsletter topic. Use this skill whenever the user says "script a reel", "reels scripting", "turn this into a reel", pastes an Instagram Reel URL, or references their Notion outlier reels database. Requires APIFY_API_TOKEN and GOOGLE_AI_API_KEY environment variables.
---

# Reels Scripting

## CRITICAL: Auto-start on load

When this skill triggers, go straight to Step 1. Do not summarise.

## Prerequisites

This skill needs:

- `APIFY_API_TOKEN` environment variable (Instagram scraping)
- `GOOGLE_AI_API_KEY` environment variable (Gemini 2.5 Flash video analysis)
- Python 3.9+ with `apify-client` and `google-genai`

If either env var is missing, tell the user to run:

```
! export APIFY_API_TOKEN=your_token
! export GOOGLE_AI_API_KEY=your_key
```

Then stop until both are set.

## The pipeline CLI

Steps 3 to 7 run through the [`reels-pipeline/cli.py`](../../reels-pipeline/) CLI in this repo (also set up at `/root/reels-pipeline/`). Install its requirements once with `pip install -r reels-pipeline/requirements.txt`, then run the commands from that directory. Step 7 (render) additionally uses the [`reel-video`](../../reel-video/) Remotion project — run `npm install` in it once.

The fastest route is the full pipeline in one command:

```
python cli.py run "<reel-url>" --topic "<topic>" --audience "<audience from about-me.md>" --trigger <WORD>
```

That runs scrape → analyse → write → score end to end. Run the individual commands (Steps 3 to 6 below) when you want to inspect the output between stages, or re-run just one.

The CLI does the scraping, Gemini analysis, scaffolding, and mechanical QA. It does **not** replace the voice work: Steps 1, 2, and the creative pass in Step 5 are still yours. Read the voice files and write the lines yourself.

## Step 1. Get the reference

Ask:

> Paste the reference Reel URL or Notion link. This is the outlier Reel you want to reverse-engineer the format from.

Wait for the URL.

If the user pastes a Notion link, follow it via WebFetch, locate the Instagram Reel URL on the page, and extract it. If no Reel URL is found on the Notion page, ask the user to paste the Reel URL directly.

## Step 2. Get the newsletter topic

Ask:

> What's the topic from your newsletter you want to repurpose into this Reel? Paste the relevant newsletter section, or type the core idea in a sentence.

Wait for the topic. Read newsletter-voice.md, voice.md, and about-me.md from the project if they exist, so the script matches the user's voice.

## Step 3. Scrape and download the Reel

```
python cli.py scrape "<reel-url>"
```

This tries `apify/instagram-reel-scraper` (`directUrls`, then `urls`), falls back to `apify/instagram-scraper`, downloads the video to `~/Desktop/Reels/downloads/{username}_{shortCode}.mp4`, and writes the raw scrape to `~/Desktop/Reels/reel_data_{shortCode}.json`. Confirm file size and metadata (views, likes, comments, caption first 200 chars) before continuing.

If the scrape fails across all three actor variants, the CLI reports the failure and stops. Do not fabricate analysis.

## Step 4. Analyse with Gemini 2.5 Flash

```
python cli.py analyze "<video-path>" --audience "<audience from about-me.md>"
```

This sends the downloaded video to Gemini 2.5 Flash and saves the analysis. The exact prompt the CLI sends — and therefore what the analysis covers — is:

```
I'm studying this Reel to write my own script in a similar style for my audience of [AUDIENCE FROM about-me.md].

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
```

The analysis is saved to `~/Desktop/Reels/analysis_reference_{shortCode}.md`.

## Step 5. Write the new Reel script

```
python cli.py write --topic "<topic>" --analysis "<analysis-path>" --trigger <WORD>
```

This scaffolds `~/Desktop/Reels/reel-[slug].md` in the structure below, pre-filled with the reference metrics. Then do the creative pass yourself: using the analysis from Step 4, the newsletter topic from Step 2, and the user's voice files, fill the hook, points, CTA, and caption in the user's voice.

Apply these rules (non-negotiable):

### Hook
- Never open with "I". Use "this", "you", a fact, or a name drop.
- Proven formats: "This changed... forever" / negative flip ("X is useless unless...") / capability statement.
- Hook creates curiosity or pattern interrupt within 3 seconds.
- Mirror the hook's word count and structure from the reference analysis.

### Body
- British English. Short sentences. No em dashes, no semicolons.
- Use "you" and "just" conversationally ("you just drop in...").
- Never merge three or more staccato fragments. Combine into one flowing sentence.
- Never state the conclusion. Let the facts do the work.
- No "link in bio". Use comment automation.

### Comment trigger
- Single caps word only (SCRIPT, WIKI, PROMPTS, VIDEO).
- Must directly relate to what is being promised.
- No quotes, no "below", no trailing punctuation.

### CTA
- "Comment [WORD] and I'll send you [specific thing]"
- Short. No "the link to my full" padding.

### Duration and structure
- Target 30 to 45 seconds total.
- 2 key points maximum, not 3.
- Caption mirrors the script. Update both together.

### Script file structure

```
# Reel: [title]

## Reference analysis
- URL: [reel url]
- Views: [number]
- Key technique: [from Gemini analysis]

## Duration target
30-45 seconds

## Hook (0-3s)
[Exact words]

## Point 1 ([start]-[end]s)
[Exact words]

## Point 2 ([start]-[end]s)
[Exact words]

## CTA ([start]-[end]s)
[Exact words including "Comment [WORD]"]

---

## Caption
[Mirror the script, formatted for Instagram]

## Comment trigger
[WORD]

## Deliverable
[What the comment trigger unlocks]

---

## Visual notes
[Cuts, B-roll ideas, text overlays]
```

## Step 6. QA loop

```
python cli.py score "<script-path>"
```

This runs the mechanical checks (opening "I", staccato runs, comment-trigger format, point count, read-aloud duration, em dashes, semicolons, "link in bio") and exits non-zero until the script clears 95/100. Use it as the first gate, then apply your own judgement on top for what the checks cannot catch (voice match, whether the conclusion is stated). Every violation must be fixed. Re-score until the script hits 95/100. Never show the user anything below 95.

Common violations to check:
- Opens with "I"
- Staccato fragments of three or more
- States the conclusion
- Multi-word or stylised comment trigger
- Duration over 45 seconds when read aloud
- 3 points instead of 2
- Caption does not mirror script

## Step 7. Render the video

After the script is approved, offer:

> Two paths from here:
>
> 1. Record it yourself.
> 2. Auto-generate the video from this script.

For path 2, use the `reel-video` Remotion project (repo-root sibling; run `npm install` in it once). The flow:

1. **Voiceover (ElevenLabs).** Synthesise the spoken lines (hook + both points + CTA) into `reel-video/public/vo/{slug}.mp3` using the ElevenLabs MCP `text_to_speech` tool. Note the audio length in seconds.
2. **Render.** From `reels-pipeline/`, run:

   ```
   python cli.py render <script.md> --vo vo/{slug}.mp3 --vo-dur <seconds>
   ```

   This parses the script into the `ScriptReel` composition (hook, points, CTA, VO-tracked captions) and renders `reel-video/out/{slug}.mp4`. `--vo-dur` sizes the video to the voiceover so it never cuts off.

To drive one of the project's bespoke compositions instead of the generic `ScriptReel`, pass `--composition <id> --props <json|@file>` (see `reel-video/src/Root.tsx` for ids and prop shapes).

## Rules

- Never skip the 95/100 QA gate.
- Always read voice.md and about-me.md before writing. Voice match is non-negotiable.
- Never invent metrics from the reference Reel. Use only what Apify returns.
- British English. No em dashes. No semicolons.
- Every script deliverable includes the exact caption and comment trigger alongside the script. Never deliver just the script.
- If the reference Reel scrape fails across all three actor variants, report the failure and stop. Do not fabricate analysis.
- Gemini 2.5 Flash is the model. Do not substitute without the user's approval.
