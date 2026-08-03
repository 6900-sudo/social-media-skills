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
- For the CLI path: Python 3.9+ with `apify-client` and `google-genai` (see "Two ways to run" below)
- For the manual path: Node.js 18+ and the `apify-client` and `@google/generative-ai` packages

If either env var is missing, tell the user to run:

```
! export APIFY_API_TOKEN=your_token
! export GOOGLE_AI_API_KEY=your_key
```

Then stop until both are set.

## Two ways to run this

There is a scriptable CLI that packages Steps 3 to 6 (scrape, analyse, write, score) as commands: [`reels-pipeline/cli.py`](../../reels-pipeline/) in this repo (also set up at `/root/reels-pipeline/`). It uses the same Apify actors, the same Gemini 2.5 Flash prompt, and the same script structure and QA rules described below.

- **CLI path (recommended when the pipeline is installed):** run the `python cli.py ...` command shown under each step. Fastest end to end: `python cli.py run "<reel-url>" --topic "<topic>"`.
- **Manual path (fallback):** write and run the Node.js scripts described in each step. Use this when the CLI is not available.

Either way, Steps 1, 2, and 5's voice-matching still need you: read the voice files and do the creative pass. The CLI scaffolds and guards; it does not replace the voice work.

The CLI's requirements are `apify-client` and `google-genai` (install with `pip install -r reels-pipeline/requirements.txt`).

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

**CLI:** `python cli.py scrape "<reel-url>"` — scrapes, downloads the video to `~/Desktop/Reels/downloads/`, and writes the raw JSON. Skip the manual steps below if you use it.

**Manual:** Create `~/Desktop/Reels/` if it does not exist. Write a Node.js script at `~/Desktop/Reels/analyse-reel.js` that:

1. Uses `apify-client` to call `apify/instagram-reel-scraper` with `{ directUrls: [reelUrl], resultsLimit: 1 }`. If that returns no items, fall back to `{ urls: [reelUrl], resultsLimit: 1 }`, then `apify/instagram-scraper` with `{ directUrls: [reelUrl], resultsType: 'posts', resultsLimit: 1 }`.
2. Extracts `videoUrl` from the returned item.
3. Downloads the video to `~/Desktop/Reels/downloads/{username}_{shortCode}.mp4`.
4. Saves raw scrape data to `~/Desktop/Reels/reel_data_{shortCode}.json`.

Run the script. Confirm file size and metadata (views, likes, comments, caption first 200 chars) before continuing.

## Step 4. Analyse with Gemini 2.5 Flash

**CLI:** `python cli.py analyze "<video-path>" --audience "<audience from about-me.md>"` — sends the video to Gemini 2.5 Flash with the exact prompt below and saves the analysis. Skip the manual steps if you use it.

**Manual:** Extend the Node script (or run a second pass) that:

1. Reads the downloaded `.mp4` as base64.
2. Calls `genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })`.
3. Sends the video with this exact prompt:

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

Save the analysis to `~/Desktop/Reels/analysis_reference_{shortCode}.md`.

## Step 5. Write the new Reel script

**CLI:** `python cli.py write --topic "<topic>" --analysis "<analysis-path>" --trigger <WORD>` scaffolds `~/Desktop/Reels/reel-[slug].md` in the exact structure below, pre-filled with the reference metrics. You still do the creative pass: fill the hook, points, CTA, and caption in the user's voice using the analysis and voice files.

Using the analysis from Step 4, the newsletter topic from Step 2, and the user's voice files, write a new Reel script to `~/Desktop/Reels/reel-[slug].md`.

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

**CLI:** `python cli.py score "<script-path>"` runs the mechanical checks (opening "I", staccato runs, comment-trigger format, point count, read-aloud duration, em dashes, semicolons, "link in bio") and exits non-zero until the script clears 95/100. Use it as the first gate, then apply your own judgement on top for anything the checks cannot catch (voice match, whether the conclusion is stated).

Score the script against the rules in Step 5. Every violation must be fixed. Re-score until the script hits 95/100. Never show the user anything below 95.

Common violations to check:
- Opens with "I"
- Staccato fragments of three or more
- States the conclusion
- Multi-word or stylised comment trigger
- Duration over 45 seconds when read aloud
- 3 points instead of 2
- Caption does not mirror script

## Step 7. Offer the pipeline

After the script is approved, offer:

> Two paths from here:
>
> 1. Record it yourself.
> 2. Auto-generate with ElevenLabs (voice) + HeyGen (avatar) + Remotion (motion graphics). If you have the my-video project configured, run `npm run pipeline:claude-routines` with this script config.

## Rules

- Never skip the 95/100 QA gate.
- Always read voice.md and about-me.md before writing. Voice match is non-negotiable.
- Never invent metrics from the reference Reel. Use only what Apify returns.
- British English. No em dashes. No semicolons.
- Every script deliverable includes the exact caption and comment trigger alongside the script. Never deliver just the script.
- If the reference Reel scrape fails across all three actor variants, report the failure and stop. Do not fabricate analysis.
- Gemini 2.5 Flash is the model. Do not substitute without the user's approval.
