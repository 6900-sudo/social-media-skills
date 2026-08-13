# reel-video ↔ reels-pipeline

This Remotion project is the render stage of the reels pipeline (Step 7 of the
`reels-scripting` skill). The `reels-pipeline` CLI hands an approved script to it.

## ScriptReel

`src/ScriptReel.tsx` is a generic composition that renders a written reel script
(`reel-[slug].md`: hook / points / CTA) as a vertical 1080×1920 reel. It reuses
this project's own `KineticCaptions` (VO-tracked word captions) and `FitText`
(anti-truncation headline sizing) over a self-contained animated gradient
backdrop (no three.js, so headless renders never depend on the GLSL bundle).

Props: `{ title?, hook, points[], cta, caption?, trigger?, accentA?, accentB?, voSrc?, voDurS? }`.
`Root.tsx` sizes it from `voDurS` (VO length in seconds) via `calculateMetadata`,
falling back to 45s.

## Rendering from the pipeline

From `reels-pipeline/`:

```bash
# ScriptReel from a written script (+ optional voiceover)
python cli.py render <script.md> --vo vo/<slug>.mp3 --vo-dur <seconds>

# any bespoke composition, with your own props (passthrough)
python cli.py render --composition ProductReel --props @props.json
```

Output lands in `reel-video/out/<slug>.mp4`. Voiceover mp3s go in
`public/vo/` (referenced by the `voSrc` prop as `vo/<slug>.mp3`).

### Headless environments

Where Remotion cannot download its bundled Chromium, set
`REMOTION_BROWSER_EXECUTABLE` to a preinstalled Chrome **headless-shell** binary
and the CLI passes it through:

```bash
export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell
```

Use the `chrome-headless-shell` build — the full `chrome` binary rejects
Remotion's headless mode.

## Compositions not yet in this tree

`Root.tsx` has commented-out registrations for compositions whose source files
have not been added yet: `SystemsReel`, `TerminalReel`, `StoryTipReel`,
`StoryTipDeep`, `StoryOvernight`, `StoryNews`, `StoryCinematic` (and its
`src/scenes/*` engine). Drop each file into `src/` and uncomment its import +
`<Composition>` block to restore it.
