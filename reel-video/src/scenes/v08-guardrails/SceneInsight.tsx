import React from 'react';
import { interpolate, spring, Easing } from 'remotion';

/**
 * VIDEO #2 — SceneInsight: difficulty-based ROUTING into isometric lanes.
 *
 * Concept: request chips fall onto a central ROUTER / diamond gate. The gate
 * inspects each chip's tiny difficulty meter and FLINGS it down one of THREE
 * diverging lanes drawn in isometric perspective:
 *   - CHEAP  (wide, catches ~80%, fills fast)
 *   - MID    (medium)
 *   - PREMIUM (thin, only the rare ~20% hard ones)
 * Live per-lane tallies climb and SNAP to 80% / 20% as those words are spoken.
 *
 * Synchronized layers (>=6):
 *   1. Isometric lane floor + depth grid (staged build-out)
 *   2. Falling request-chip spawner (deterministic particle stream into gate)
 *   3. Router diamond gate w/ difficulty-meter inspection + pulse
 *   4. In-flight routed particles (parabolic fling down assigned lane)
 *   5. Catch-basin liquid fill per lane (volume accumulates)
 *   6. Live tally counters (climb, snap to 80% / 20% on word-sync)
 *   7. Title chip + bottom caption (idea statement)
 *
 * NOVELTY: particle-system + isometric/3D-perspective lanes + physics-ish
 * fling + liquid fill + bar-style tallies. Reuses NONE of video #1's
 * node-field / similarity-ring / fabricated-card / glitch devices.
 */
export const SceneInsight: React.FC<{
  localFrame: number;
  tS: number;
  fps: number;
  beatDur: number;
  accentA: string;
  accentB: string;
  words: { w: string; startS: number; endS: number }[];
}> = ({ localFrame, tS, fps, beatDur, accentA, accentB, words }) => {
  // ---------- helpers ----------
  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const fract = (x: number) => x - Math.floor(x);
  const rnd = (seed: number) => fract(Math.sin(seed * 12.9898) * 43758.5453);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const spoke = (sub: string): boolean => {
    const w = words.find((x) => x.w.toLowerCase().includes(sub.toLowerCase()));
    return w ? tS >= w.startS : false;
  };
  const wordStart = (sub: string): number | null => {
    const w = words.find((x) => x.w.toLowerCase().includes(sub.toLowerCase()));
    return w ? w.startS : null;
  };
  const sinceWord = (sub: string, dur: number): number => {
    const s = wordStart(sub);
    if (s == null) return 0;
    return clamp((tS - s) / dur);
  };

  const spr = (delay: number, damping = 16, stiffness = 120) =>
    spring({ frame: localFrame - delay, fps, config: { damping, stiffness, mass: 1 } });
  const eased = (v: number, from = 0, to = 1) =>
    interpolate(v, [0, 1], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // ---------- stage geometry (1080 x 820) ----------
  const t = localFrame / fps;
  const breathe = Math.sin(t * 1.7) * 0.5 + 0.5;

  // Gate sits high-center; lanes fan DOWN + OUT in isometric perspective.
  const GATE = { x: 540, y: 196 };

  // Three lanes. xEnd = horizontal center at the FAR (bottom) end.
  // width = lane half-width at bottom. share = target % of traffic.
  type Lane = {
    id: 'cheap' | 'mid' | 'premium';
    label: string;
    xEnd: number;
    bottomHalfW: number; // half-width at the catch basin
    share: number; // final fraction
    hue: 'a' | 'b' | 'mix';
  };
  const LANES: Lane[] = [
    { id: 'cheap', label: 'CHEAP', xEnd: 232, bottomHalfW: 150, share: 0.8, hue: 'b' },
    { id: 'mid', label: 'MID', xEnd: 540, bottomHalfW: 78, share: 0.0, hue: 'mix' },
    { id: 'premium', label: 'PREMIUM', xEnd: 866, bottomHalfW: 46, share: 0.2, hue: 'a' },
  ];

  const BASIN_Y = 690; // y of catch basins (far end)
  const laneColor = (l: Lane) => (l.hue === 'a' ? accentA : l.hue === 'b' ? accentB : '#A8B0FF');

  // point along a lane: u=0 at gate, u=1 at basin. returns {x,y,halfW,scale}
  const lanePoint = (l: Lane, u: number) => {
    // perspective ease: things accelerate apart toward the viewer (bottom)
    const pe = u * u * 0.55 + u * 0.45;
    const x = lerp(GATE.x, l.xEnd, pe);
    const y = lerp(GATE.y + 34, BASIN_Y, u);
    const halfW = lerp(10, l.bottomHalfW, pe);
    const scale = lerp(0.4, 1, u); // near gate small, near viewer large
    return { x, y, halfW, scale };
  };

  // ---------- staged build-out timeline (localFrame) ----------
  const titleP = eased(spr(0, 18));
  const laneBuild = (i: number) => eased(spr(6 + i * 4, 15, 90)); // lanes draw in
  const gateP = eased(spr(10, 14, 140)); // gate snaps in
  const streamP = eased(spr(20, 18)); // chip stream begins

  // ---------- word-sync for the % snap ----------
  // "eighty" -> cheap snaps to 80 ; "twenty" -> premium snaps to 20.
  const eightyP = spoke('eighty') ? sinceWord('eighty', 0.5) : 0;
  const twentyP = spoke('twenty') ? sinceWord('twenty', 0.5) : 0;
  const routeArmed = spoke('route') || spoke('rout') || localFrame > 26;

  // ---------- PARTICLE SYSTEM ----------
  // A stream of request chips. Each particle i has:
  //  - a spawn phase (loops), travels DOWN into gate, gets inspected, then
  //    is flung down its destination lane.
  // Deterministic difficulty -> lane assignment giving ~80/~/20 split.
  const N = 26; // particles in flight rotation
  const cycleFrames = 150; // full life of one particle (fall->inspect->route)
  const fallFrames = 34; // frames to fall into gate
  const inspectFrames = 12; // pause at gate while difficulty meter reads

  type P = {
    i: number;
    age: number; // 0..cycleFrames
    lane: Lane;
    diff: number; // 0..1 difficulty
    laneIdx: number;
  };

  const assignLane = (diff: number): number => {
    // ~80% easy -> cheap(0), ~? mid(1), ~20% hard -> premium(2)
    if (diff < 0.66) return 0; // cheap (easy 80%)
    if (diff < 0.8) return 1; // mid (handful)
    return 2; // premium (hard 20%)
  };

  const particles: P[] = [];
  for (let i = 0; i < N; i++) {
    const phase = rnd(i + 1) * cycleFrames; // stagger
    const speed = 1; // uniform
    const age = ((localFrame * speed + phase) % cycleFrames);
    const diff = rnd(i * 3 + 7); // deterministic difficulty
    const laneIdx = assignLane(diff);
    particles.push({ i, age, lane: LANES[laneIdx], diff, laneIdx });
  }

  // a particle's screen pos + scale + opacity given its age
  const particlePose = (p: P) => {
    const spawnX = GATE.x + (rnd(p.i + 41) - 0.5) * 230;
    const spawnY = -60 - rnd(p.i + 13) * 90;
    let x = spawnX;
    let y = spawnY;
    let scale = 0.55;
    let opacity = 1;
    let stage: 'fall' | 'inspect' | 'route' = 'fall';
    let routeU = 0;

    if (p.age < fallFrames) {
      // FALL toward gate (ease-in gravity)
      const f = p.age / fallFrames;
      const g = f * f; // accel
      x = lerp(spawnX, GATE.x, Easing.out(Easing.cubic)(f));
      y = lerp(spawnY, GATE.y, g);
      scale = lerp(0.55, 0.62, f);
      opacity = clamp(f * 3);
      stage = 'fall';
    } else if (p.age < fallFrames + inspectFrames) {
      // INSPECT — hover at gate, tiny shimmy while difficulty meter reads
      const f = (p.age - fallFrames) / inspectFrames;
      x = GATE.x + Math.sin(f * Math.PI * 4) * 3;
      y = GATE.y + Math.sin(f * Math.PI * 2) * 2;
      scale = 0.62 + Math.sin(f * Math.PI) * 0.06;
      opacity = 1;
      stage = 'inspect';
    } else {
      // ROUTE — flung down assigned lane (parabolic-ish), grows w/ perspective
      const rf = (p.age - fallFrames - inspectFrames) /
        (cycleFrames - fallFrames - inspectFrames);
      routeU = Easing.inOut(Easing.quad)(rf);
      const lp = lanePoint(p.lane, routeU);
      // slight arc bias off the spine for liveliness
      const arc = Math.sin(routeU * Math.PI) * 14 * (rnd(p.i + 99) - 0.5);
      x = lp.x + arc;
      y = lp.y;
      scale = lp.scale;
      opacity = clamp((1 - rf) * 2.2); // fade as it lands
      stage = 'route';
    }
    return { x, y, scale, opacity, stage, routeU };
  };

  // ---------- live tallies ----------
  // base climbing counts (deterministic over localFrame), then OVERRIDDEN by
  // word-sync snaps for cheap(80) & premium(20).
  const climb = clamp((localFrame - 24) / 70); // 0..1 base fill
  const cheapBase = Math.round(lerp(0, 72, climb));
  const premiumBase = Math.round(lerp(0, 14, climb));
  const midBase = Math.round(lerp(0, 8, climb));

  const cheapVal = eightyP > 0
    ? Math.round(lerp(cheapBase, 80, Easing.out(Easing.cubic)(eightyP)))
    : cheapBase;
  const premiumVal = twentyP > 0
    ? Math.round(lerp(premiumBase, 20, Easing.out(Easing.cubic)(twentyP)))
    : premiumBase;
  const midVal = midBase;

  const laneVal = (l: Lane) =>
    l.id === 'cheap' ? cheapVal : l.id === 'premium' ? premiumVal : midVal;

  // basin fill level 0..1 for each lane (drives liquid)
  const laneFill = (l: Lane) =>
    clamp(laneVal(l) / 100 + (l.id === 'mid' ? 0.04 : 0));

  // snap flash when a lane locks its number
  const cheapSnapFlash = eightyP > 0 && eightyP < 1 ? (1 - eightyP) : 0;
  const premiumSnapFlash = twentyP > 0 && twentyP < 1 ? (1 - twentyP) : 0;

  // ---------- build lane outline path (trapezoid in iso perspective) ----------
  const laneOutline = (l: Lane) => {
    const a = lanePoint(l, 0);
    const b = lanePoint(l, 1);
    const x1 = a.x - a.halfW, x2 = a.x + a.halfW;
    const x3 = b.x + b.halfW, x4 = b.x - b.halfW;
    return `M ${x1} ${a.y} L ${x2} ${a.y} L ${x3} ${b.y} L ${x4} ${b.y} Z`;
  };
  // interior depth-rungs (perspective floor grid)
  const laneRungs = (l: Lane, build: number) => {
    const rungs: { d: string; o: number }[] = [];
    const count = 6;
    for (let r = 1; r <= count; r++) {
      const u = r / (count + 1);
      if (u > build) break;
      const lp = lanePoint(l, u);
      rungs.push({
        d: `M ${lp.x - lp.halfW} ${lp.y} L ${lp.x + lp.halfW} ${lp.y}`,
        o: lerp(0.06, 0.22, u),
      });
    }
    return rungs;
  };

  // ---------- styles ----------
  const chipStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: 'rgba(8,6,18,0.66)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 14,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 10px 34px rgba(0,0,0,0.4)',
    ...extra,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: 'system-ui, "Archivo", sans-serif' }}>
      {/* ===== Title chip ===== */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '50%',
          transform: `translateX(-50%) translateY(${(1 - titleP) * -22}px)`,
          opacity: titleP,
          zIndex: 40,
        }}
      >
        <div style={chipStyle({ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 12 })}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 3,
              transform: 'rotate(45deg)',
              background: `linear-gradient(135deg, ${accentA}, ${accentB})`,
              boxShadow: `0 0 14px ${accentB}`,
            }}
          />
          <span
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: 28,
              letterSpacing: 2,
              color: '#F5F7FF',
              fontWeight: 600,
            }}
          >
            route by difficulty
          </span>
        </div>
      </div>

      {/* ===== SVG: lanes (floor), gate, particles, basins ===== */}
      <svg
        width={1080}
        height={820}
        viewBox="0 0 1080 820"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="laneFloorA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentB} stopOpacity="0.04" />
            <stop offset="100%" stopColor={accentB} stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="laneFloorMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A8B0FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#A8B0FF" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="laneFloorP" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentA} stopOpacity="0.05" />
            <stop offset="100%" stopColor={accentA} stopOpacity="0.18" />
          </linearGradient>
          <radialGradient id="gateGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentB} stopOpacity="0.85" />
            <stop offset="60%" stopColor={accentA} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accentA} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="streamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5F7FF" stopOpacity="0" />
            <stop offset="100%" stopColor="#F5F7FF" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* ---- LAYER 1: isometric lane floors + depth grid ---- */}
        {LANES.map((l, i) => {
          const build = laneBuild(i);
          if (build <= 0.01) return null;
          const fillId =
            l.id === 'cheap' ? 'laneFloorA' : l.id === 'mid' ? 'laneFloorMid' : 'laneFloorP';
          const col = laneColor(l);
          // animate the far edge growing outward (build)
          const bEnd = lanePoint(l, build);
          const a = lanePoint(l, 0);
          const path = `M ${a.x - a.halfW} ${a.y} L ${a.x + a.halfW} ${a.y} L ${
            bEnd.x + bEnd.halfW
          } ${bEnd.y} L ${bEnd.x - bEnd.halfW} ${bEnd.y} Z`;
          return (
            <g key={`lane-${l.id}`}>
              {/* floor fill */}
              <path d={path} fill={`url(#${fillId})`} opacity={0.9} />
              {/* side rails */}
              <path
                d={laneOutline(l)}
                fill="none"
                stroke={col}
                strokeWidth={3}
                strokeOpacity={0.55 * build}
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px ${col})` }}
                strokeDasharray={1000}
                strokeDashoffset={(1 - build) * 1000}
              />
              {/* depth rungs */}
              {laneRungs(l, build).map((rg, k) => (
                <path
                  key={`rung-${l.id}-${k}`}
                  d={rg.d}
                  stroke={col}
                  strokeWidth={1.4}
                  strokeOpacity={rg.o}
                />
              ))}
              {/* moving "traffic flow" pulse line down the spine */}
              {build > 0.6 && (
                <path
                  d={`M ${a.x} ${a.y} L ${lanePoint(l, 1).x} ${lanePoint(l, 1).y}`}
                  stroke={col}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                  strokeDasharray="3 14"
                  strokeDashoffset={-localFrame * 2.4}
                />
              )}
            </g>
          );
        })}

        {/* ---- LAYER 5: catch-basin liquid fill (volume accumulates) ---- */}
        {LANES.map((l) => {
          const build = laneBuild(LANES.indexOf(l));
          if (build < 0.9) return null;
          const b = lanePoint(l, 1);
          const fill = laneFill(l);
          // basin = small trapezoid pool at the bottom; liquid rises by `fill`
          const poolH = 46;
          const top = b.y - poolH * fill;
          const wTop = b.halfW * (0.7 + 0.3 * fill);
          const col = laneColor(l);
          return (
            <g key={`basin-${l.id}`} opacity={clamp((build - 0.9) * 10)}>
              {/* pool container outline */}
              <path
                d={`M ${b.x - b.halfW} ${b.y - poolH} L ${b.x + b.halfW} ${
                  b.y - poolH
                } L ${b.x + b.halfW * 1.05} ${b.y + 6} L ${b.x - b.halfW * 1.05} ${b.y + 6} Z`}
                fill="rgba(8,6,18,0.5)"
                stroke={col}
                strokeOpacity={0.35}
                strokeWidth={1.6}
              />
              {/* liquid */}
              <path
                d={`M ${b.x - wTop} ${top} L ${b.x + wTop} ${top} L ${
                  b.x + b.halfW * 1.05
                } ${b.y + 6} L ${b.x - b.halfW * 1.05} ${b.y + 6} Z`}
                fill={col}
                fillOpacity={0.32}
              />
              {/* liquid surface highlight (wobble) */}
              <path
                d={`M ${b.x - wTop} ${top + Math.sin(t * 3) * 1.5} Q ${b.x} ${
                  top - 3 + Math.sin(t * 3 + 1) * 2
                } ${b.x + wTop} ${top + Math.sin(t * 3 + 2) * 1.5}`}
                fill="none"
                stroke={col}
                strokeWidth={2.4}
                strokeOpacity={0.8}
                style={{ filter: `drop-shadow(0 0 5px ${col})` }}
              />
            </g>
          );
        })}

        {/* ---- LAYER 2: falling request-chip stream guide (subtle) ---- */}
        {streamP > 0.05 && (
          <line
            x1={GATE.x}
            y1={-30}
            x2={GATE.x}
            y2={GATE.y - 30}
            stroke="url(#streamGrad)"
            strokeWidth={2}
            strokeOpacity={0.4 * streamP}
            strokeDasharray="2 10"
            strokeDashoffset={-localFrame * 3}
          />
        )}

        {/* ---- LAYER 4: routed particles (fall -> inspect -> fling) ---- */}
        {particles.map((p) => {
          if (streamP <= 0.02) return null;
          const pose = particlePose(p);
          if (pose.opacity <= 0.02) return null;
          // route gate must be armed before flinging; before that, recycle as faint
          const armed = routeArmed || pose.stage === 'fall';
          const baseOp = pose.opacity * streamP * (armed ? 1 : 0.4);
          const col =
            pose.stage === 'route'
              ? laneColor(p.lane)
              : p.diff > 0.8
              ? accentA
              : '#D7DCFF';
          const sz = 13 * pose.scale;
          return (
            <g
              key={`p-${p.i}`}
              transform={`translate(${pose.x}, ${pose.y})`}
              opacity={baseOp}
            >
              {/* trailing comet on route */}
              {pose.stage === 'route' && (
                <line
                  x1={0}
                  y1={0}
                  x2={(GATE.x - pose.x) * 0.06}
                  y2={(GATE.y - pose.y) * 0.06}
                  stroke={col}
                  strokeWidth={sz * 0.5}
                  strokeOpacity={0.3}
                  strokeLinecap="round"
                />
              )}
              {/* the request chip = small rounded square (token) */}
              <rect
                x={-sz}
                y={-sz * 0.7}
                width={sz * 2}
                height={sz * 1.4}
                rx={4}
                fill="rgba(8,6,18,0.7)"
                stroke={col}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 ${5 * pose.scale}px ${col})` }}
              />
              {/* tiny difficulty meter inside chip (fills w/ difficulty) */}
              <rect
                x={-sz * 0.7}
                y={sz * 0.2}
                width={sz * 1.4}
                height={3}
                rx={1.5}
                fill="rgba(255,255,255,0.18)"
              />
              <rect
                x={-sz * 0.7}
                y={sz * 0.2}
                width={sz * 1.4 * p.diff}
                height={3}
                rx={1.5}
                fill={p.diff > 0.8 ? accentA : accentB}
              />
            </g>
          );
        })}

        {/* ---- LAYER 3: ROUTER diamond gate (inspects + flings) ---- */}
        {gateP > 0.02 && (
          <g
            transform={`translate(${GATE.x}, ${GATE.y}) scale(${eased(gateP, 0.5, 1)})`}
            opacity={gateP}
          >
            {/* ambient glow */}
            <circle r={86} fill="url(#gateGlow)" opacity={0.5 + breathe * 0.3} />
            {/* outer diamond */}
            <g transform={`rotate(${Math.sin(t * 1.2) * 4})`}>
              <path
                d="M 0 -54 L 54 0 L 0 54 L -54 0 Z"
                fill="rgba(8,6,18,0.8)"
                stroke={accentB}
                strokeWidth={4}
                style={{ filter: `drop-shadow(0 0 14px ${accentB})` }}
              />
              {/* inner rotating diamond */}
              <path
                d="M 0 -30 L 30 0 L 0 30 L -30 0 Z"
                fill="none"
                stroke={accentA}
                strokeWidth={2.5}
                strokeOpacity={0.85}
                transform={`rotate(${-localFrame * 1.6})`}
              />
            </g>
            {/* difficulty meter readout (center) — sweeps as it inspects */}
            <g transform="rotate(0)">
              <rect x={-22} y={-3} width={44} height={6} rx={3} fill="rgba(255,255,255,0.16)" />
              <rect
                x={-22}
                y={-3}
                width={44 * (0.5 + 0.5 * Math.sin(t * 6))}
                height={6}
                rx={3}
                fill={accentB}
                style={{ filter: `drop-shadow(0 0 6px ${accentB})` }}
              />
            </g>
            {/* three exit ports (lit toward each lane) */}
            {LANES.map((l) => {
              const dir = Math.atan2(BASIN_Y - GATE.y, l.xEnd - GATE.x);
              const px = Math.cos(dir) * 50;
              const py = Math.sin(dir) * 50;
              const active = routeArmed;
              return (
                <circle
                  key={`port-${l.id}`}
                  cx={px}
                  cy={py}
                  r={6}
                  fill={laneColor(l)}
                  opacity={active ? 0.55 + breathe * 0.4 : 0.25}
                  style={{ filter: `drop-shadow(0 0 6px ${laneColor(l)})` }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* ===== Lane labels + LIVE TALLY counters (HTML overlay) ===== */}
      {LANES.map((l, i) => {
        const build = laneBuild(i);
        if (build < 0.5) return null;
        const b = lanePoint(l, 1);
        const val = laneVal(l);
        const col = laneColor(l);
        const isCheap = l.id === 'cheap';
        const isPrem = l.id === 'premium';
        const snapFlash = isCheap ? cheapSnapFlash : isPrem ? premiumSnapFlash : 0;
        const locked = (isCheap && eightyP > 0.6) || (isPrem && twentyP > 0.6);
        // label width scales with lane prominence
        const cardW = isCheap ? 260 : isPrem ? 168 : 150;
        return (
          <div
            key={`tally-${l.id}`}
            style={{
              position: 'absolute',
              left: b.x - cardW / 2,
              top: b.y + 16,
              width: cardW,
              opacity: clamp((build - 0.5) * 2),
              transform: `translateY(${(1 - clamp((build - 0.5) * 2)) * 14}px) scale(${
                1 + snapFlash * 0.06
              })`,
              textAlign: 'center',
            }}
          >
            {/* lane name */}
            <div
              style={{
                fontFamily: 'Consolas, monospace',
                fontSize: isCheap ? 30 : 26,
                letterSpacing: 3,
                fontWeight: 700,
                color: '#F5F7FF',
                marginBottom: 4,
                textShadow: `0 0 14px ${col}`,
              }}
            >
              {l.label}
            </div>
            {/* big tally % */}
            <div
              style={{
                fontFamily: 'Consolas, monospace',
                fontWeight: 800,
                fontSize: isCheap ? 116 : isPrem ? 84 : 62,
                lineHeight: 0.92,
                color: col,
                textShadow: locked
                  ? `0 0 28px ${col}, 0 0 56px ${col}`
                  : `0 0 16px ${col}`,
                transform: `translateY(${snapFlash * -4}px)`,
              }}
            >
              {val}
              <span style={{ fontSize: isCheap ? 56 : 40, opacity: 0.8 }}>%</span>
            </div>
            {/* descriptor */}
            <div
              style={{
                marginTop: 2,
                fontFamily: 'system-ui, sans-serif',
                fontSize: isCheap ? 20 : 17,
                fontWeight: 600,
                letterSpacing: 0.5,
                color: 'rgba(245,247,255,0.62)',
              }}
            >
              {isCheap ? 'cheap model · easy bulk' : isPrem ? 'premium · hard only' : 'fallback'}
            </div>
            {/* lock pill on snap */}
            {locked && (
              <div
                style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 11px',
                  borderRadius: 10,
                  background: `${col}22`,
                  border: `1px solid ${col}`,
                  fontFamily: 'Consolas, monospace',
                  fontSize: 14,
                  letterSpacing: 2,
                  color: col,
                  fontWeight: 700,
                }}
              >
                LOCKED
              </div>
            )}
          </div>
        );
      })}

      {/* ===== bottom caption that states the idea ===== */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: eased(spr(14, 18)),
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: 'rgba(245,247,255,0.82)',
            letterSpacing: 0.4,
          }}
        >
          route by difficulty ·
        </span>
        <span
          style={{
            fontFamily: 'Consolas, monospace',
            fontSize: 22,
            fontWeight: 700,
            color: accentB,
            letterSpacing: 0.4,
            textShadow: `0 0 12px ${accentB}`,
          }}
        >
          cheap 80%
        </span>
        <span
          style={{
            fontFamily: 'Consolas, monospace',
            fontSize: 22,
            fontWeight: 700,
            color: 'rgba(245,247,255,0.4)',
          }}
        >
          /
        </span>
        <span
          style={{
            fontFamily: 'Consolas, monospace',
            fontSize: 22,
            fontWeight: 700,
            color: accentA,
            letterSpacing: 0.4,
            textShadow: `0 0 12px ${accentA}`,
          }}
        >
          premium 20%
        </span>
      </div>
    </div>
  );
};
