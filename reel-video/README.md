# Remotion — Local Video Templates

This folder is a self-contained **Remotion** project. Remotion builds video out of
React code: each scene is a component (text, colors, timing, motion) and Remotion
renders it to a finished MP4. It runs entirely on your machine — no API, no render
farm, **$0 per render**.

## Install

```bash
npm install
```

(Node 18+ recommended. First install pulls Remotion + a headless Chromium.)

## Preview in the studio

```bash
npx remotion studio
```

Opens a live preview where you can scrub every composition, edit props, and see
changes instantly. This is the fastest way to dial a template in before rendering.

## Render to a file

```bash
npx remotion render <CompositionId> out.mp4
```

`<CompositionId>` is the `id` of any `<Composition>` registered in
`src/Root.tsx` (e.g. `StoryCinematic`, `StoryTipReel`, `ProductReel`,
`ShaderMGReel`). Pass props for the data-driven ones:

```bash
npx remotion render ProductReel out.mp4 --props='{"productName":"Your Product","price":"$XX"}'
```

## What's inside

- **`src/*Reel.tsx` and `src/scenes/*`** — fill-in-the-blanks video templates.
  Swap the text/data (in the component's `defaultProps` or via `--props`), then
  re-render. They're examples that teach the technique — kinetic typography, data
  counters, caption sync, cinematic 3D-depth stories, motion-graphics backdrops.
- **`src/components/`** — the reusable building blocks you'll pull into your own
  compositions:
  - `KineticCaptions` — word-level captions that track a voiceover (the #1
    short-form retention lever).
  - `FitText` — auto-sizes a headline to the largest font that fits N lines.
  - `AuroraShader` — a GLSL domain-warped "aurora" background with a slow baked
    camera fly; brand colors are uniforms, so any scene can re-grade it.

## Workflow tips

- Preview in `remotion studio` first — never full-render a template you haven't
  eyeballed. Scrub the timeline, then render.
- Every `.tsx` is one template. Duplicate it, rename the composition `id` in
  `src/Root.tsx`, and change the copy/data to make it yours.
- All compositions are vertical (1080×1920) by default — retune `width`/`height`
  in `src/Root.tsx` for other aspect ratios.
- Voiceover/audio: drop your own tracks in `public/` and reference them with
  Remotion's `staticFile()`. (This kit ships the engine, not sample audio.)

## Wiring in a voiceover

`public/vo/` is set up for this. Render a voice track into it, then pass its path
to a composition that accepts a `voSrc` prop:

```bash
# 1. make the voiceover (from the generators dir)
node ../gen-vo.cjs --in narration.txt --out public/vo/my-reel.mp3

# 2. render the reel with the voice wired in
npx remotion render <CompositionId> out.mp4 --props='{"voSrc":"vo/my-reel.mp3"}'
```

Inside the composition, load it with `<Audio src={staticFile(voSrc)} />` and sync
your `KineticCaptions` to it — the voiceover becomes the spine the visuals follow.
