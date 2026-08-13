//  (the creator /goal "hand-code After-Effects-level motion graphics"): a genuinely CRAFTED motion-graphics piece.
// The fix for the amateur shader/particle/text reels — this applies real MG discipline:
//   • restrained palette (near-black + ONE violet + a cyan accent used sparingly)
//   • CUSTOM easing curves (easeOutExpo entrances, easeInOutQuint draws — never linear/default-spring)
//   • layered depth + focal hierarchy (blurred gradient-mesh bg → sharp dot-field mid → bloomed rings fg)
//   • texture pass (animated film grain + vignette + bloom) — imperfection reads premium
//   • choreography + restraint (staggered builds, one event at a time, a slow camera breath)
// Pure motion graphics, NO text. Frame-deterministic → renders headless. 1080x1920, 6s @ 30fps.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';

// ---------- design tokens ----------
const INK = '#070710';
const VIOLET = [124, 92, 255];   // #7c5cff
const CYAN = [34, 211, 238];     // #22d3ee
const WHITE = [233, 238, 255];

const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOutQuint = Easing.bezier(0.87, 0, 0.13, 1);
const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const mix = (c1: number[], c2: number[], t: number) =>
  `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;

// ---------- background: drifting gradient mesh (heavily blurred, low opacity = depth) ----------
const GradientMesh: React.FC = () => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 28], [0, 1], {extrapolateRight: 'clamp', easing: easeOutCubic});
  const x1 = interpolate(f, [0, 180], [30, 58]);
  const y1 = interpolate(f, [0, 180], [34, 26]);
  const x2 = interpolate(f, [0, 180], [72, 46]);
  const y2 = interpolate(f, [0, 180], [70, 78]);
  const breathe = 0.5 + 0.5 * Math.sin(f / 34);
  return (
    <AbsoluteFill
      style={{
        opacity: rise * 0.9,
        filter: 'blur(90px)',
        background:
          `radial-gradient(46% 40% at ${x1}% ${y1}%, rgba(96,64,220,${0.42 * breathe}) 0%, transparent 60%),` +
          `radial-gradient(44% 38% at ${x2}% ${y2}%, rgba(20,120,160,${0.30 * (1 - breathe)}) 0%, transparent 60%),` +
          `radial-gradient(70% 55% at 50% 120%, rgba(60,40,150,0.28) 0%, transparent 70%)`,
      }}
    />
  );
};

// ---------- midground: a dot-matrix field with a traveling wave (the focal motion) ----------
const DotField: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const COLS = 21;
  const ROWS = 38;
  const marginX = width * 0.13;
  const marginY = height * 0.1;
  const stepX = (width - marginX * 2) / (COLS - 1);
  const stepY = (height - marginY * 2) / (ROWS - 1);
  const cx = (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2;
  const t = f / 30;

  const dots: React.ReactNode[] = [];
  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      const x = marginX + gx * stepX;
      const y = marginY + gy * stepY;
      const dGrid = Math.hypot(gx - cx, gy - cy);
      // radial edge-fade: the field is a focused central instrument that dissolves to nothing —
      // no hard rectangular crop, no floating top/bottom bands.
      const edgeFade = 1 - smoothstep(5.5, 12.5, dGrid);
      if (edgeFade <= 0.01) continue;
      // staggered intro: dots ignite outward from center
      const introStart = 18 + dGrid * 2.0;
      const intro = interpolate(f, [introStart, introStart + 16], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: easeOutExpo,
      });
      if (intro <= 0) continue;
      // traveling radial wave from center → a breathing ripple (lower freq reads as rings, not stripes)
      const wave = Math.sin(dGrid * 0.62 - t * 2.0);
      const inten = Math.max(0, wave) ** 1.7; // sharpen crests, calm troughs
      const r = (1.8 + inten * 4.4) * intro * (0.55 + 0.45 * edgeFade);
      const op = (0.2 + inten * 0.72) * intro * edgeFade; // baseline keeps a calm instrument always present
      const col = mix(VIOLET, CYAN, Math.min(1, inten * 1.2));
      dots.push(
        <circle key={`${gx}-${gy}`} cx={x} cy={y} r={r} fill={col} opacity={op} />
      );
    }
  }
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{filter: 'drop-shadow(0 0 6px rgba(124,92,255,0.35))'}}>
        {dots}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- foreground: concentric "signal" rings that draw on, + a rotating tick arc (bloomed) ----------
const SignalRings: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  const ring = (radius: number, start: number, color: string, w: number, glow: number) => {
    const circ = 2 * Math.PI * radius;
    const draw = interpolate(f, [start, start + 34], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeInOutQuint,
    });
    if (draw <= 0) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - draw)}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{filter: `drop-shadow(0 0 ${glow}px ${color})`}}
      />
    );
  };

  // rotating tick arc on the outer ring
  const arcR = 300;
  const arcCirc = 2 * Math.PI * arcR;
  const arcReveal = interpolate(f, [70, 95], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo});
  const arcRot = interpolate(f, [70, 180], [0, 240], {easing: easeOutCubic});
  const cyanCss = `rgb(${CYAN.join(',')})`;
  const whiteCss = `rgb(${WHITE.join(',')})`;
  const violetCss = `rgb(${VIOLET.join(',')})`;

  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        {ring(150, 56, violetCss, 2.5, 10)}
        {ring(300, 64, cyanCss, 2, 14)}
        {ring(470, 78, 'rgba(124,92,255,0.55)', 1.5, 8)}
        {/* rotating tick arc */}
        <circle
          cx={cx}
          cy={cy}
          r={arcR}
          fill="none"
          stroke={whiteCss}
          strokeWidth={3}
          strokeDasharray={`${arcCirc * 0.06} ${arcCirc}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          opacity={arcReveal * 0.9}
          transform={`rotate(${arcRot - 90} ${cx} ${cy})`}
          style={{filter: `drop-shadow(0 0 10px ${whiteCss})`}}
        />
        {/* core node */}
        <circle cx={cx} cy={cy} r={interpolate(f, [50, 70], [0, 7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo}) * (1 + 0.12 * Math.sin(f / 7))} fill={whiteCss} style={{filter: `drop-shadow(0 0 16px ${cyanCss})`}} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- texture: animated film grain (real <feTurbulence>, reseeded per frame) ----------
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const seed = (f * 7) % 211;
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.5, pointerEvents: 'none'}}>
      <svg width={width} height={height}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.16" intercept="0" />
          </feComponentTransfer>
        </filter>
        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- texture: vignette ----------
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(72% 60% at 50% 46%, transparent 0%, transparent 42%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);

export const FluxMG: React.FC = () => {
  const f = useCurrentFrame();
  // slow "camera breath" — a subtle push that makes the frame feel alive without moving anything literally
  const scale = interpolate(f, [0, 180], [1.0, 1.05], {easing: easeOutCubic});
  // global fade-up off pure black, and a gentle settle at the tail
  const masterIn = interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp', easing: easeOutCubic});
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, opacity: masterIn}}>
        <GradientMesh />
        <DotField />
        <SignalRings />
      </AbsoluteFill>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
