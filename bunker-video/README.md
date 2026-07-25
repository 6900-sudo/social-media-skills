# Bunker Essentials — Educational Explainer Video

A 30-second vertical explainer (1080×1920, 30fps) built with
[Remotion](https://www.remotion.dev/): **"How Having a Bunker & Stocking the
Essentials Works."**

## Scenes

1. **The 72-Hour Rule** — bunker cross-section draws itself; a clock counts 0→72 hrs.
2. **Priorities, In Order** — the survival "Rule of Threes" stack (air → water → food → security).
3. **Store the Basics** — water jug fills, cans stack; count-ups for 14-day / 2000-kcal supply.
4. **Keep It Running** — air / power / medical systems come online with green checks.
5. **Prepared, Not Scared** — particle finale with a self-drawing shield-check and rotation reminder.

## Design system

- Background `#0a0a0a`, white text, indigo `#6366f1` accent, green `#22c55e` emphasis.
- Inter (400/600/800), self-hosted in `public/fonts/` so renders never touch the network.
- All icons/diagrams are inline SVG components — no external assets.
- Spring entrances (`damping: 200`), staggered reveals, 12-frame fade transitions,
  stroke-dashoffset draw-on animations, and `interpolate()` count-ups with tabular-nums.
- Every element stays inside the platform safe zone (150px top, 170px bottom, 60px sides).

## Commands

```bash
npm install         # install dependencies
npm start           # launch Remotion Studio (preview in browser)
npm run build       # render out/video.mp4
```

Or render directly:

```bash
npx remotion render BunkerEssentials out/bunker-essentials.mp4
```
