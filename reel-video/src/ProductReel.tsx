//  (2026-06-02): ProductReel — 15s PAIN -> SOLUTION direct-response video for a
// yourstore.com digital product. the creator: "high retention video of ppl's pain
// points and how my product on my site, personalized to that specific digital product, is
// the solution." Reuses the StoryTipDeep 3D engine (DepthDiorama camera-stage, hinge type,
// 3D product box, flip-card deck, motion blur, ElevenLabs VO) with a sales narrative + a
// red->gold color shift at the problem->solution pivot.
//
// 450f/15s, 1080x1920. Beats: PAIN HOOK 0-90 / PAINS 90-180 / PRODUCT REVEAL 180-255 /
// WHAT'S INSIDE 255-360 / OFFER+CTA 360-450. Data from your product data.
// Chromium 3D traps respected (no CSS blur on 3D nodes, backface-hidden + opacity-gate,
// translateZ=half-axis, grain/vignette outside the stage, deterministic random()).
import React from 'react';
import {
  AbsoluteFill, Audio, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, Easing, random,
} from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';

export interface ProductReelProps {
  slug?: string;
  productName?: string;
  price?: string;
  accentA?: string;
  accentB?: string;
  painHook?: string;
  agitate?: string;
  pains?: string[];
  solutionLabel?: string;
  whatsInside?: string[];
  outcome?: string;
  cta?: string;
  store?: string;
  voSrc?: string;
  mbSamples?: number;
}

const FONT = '"Segoe UI", "Helvetica Neue", "Arial Black", system-ui, sans-serif';
const MONO = '"Consolas", "SF Mono", monospace';
const PAIN_A = '#F43F5E', PAIN_B = '#EF4444';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
const shade = (hex: string, pct: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = c(((n >> 16) & 255) * (1 + pct)), g = c(((n >> 8) & 255) * (1 + pct)), b = c((n & 255) * (1 + pct));
  return `rgb(${r},${g},${b})`;
};

const ProductScene: React.FC<ProductReelProps> = ({
  productName = 'YOUR PRODUCT',
  price = '$XX',
  accentA = '#F59E0B',
  accentB = '#F97316',
  painHook = 'STARTING AN AI AGENCY?',
  agitate = "You've got nothing to show a client.",
  pains = ['50 tutorials deep — still no system', 'No mockups to pitch with', 'No pages, no outreach, no pipeline'],
  solutionLabel = 'YOUR PRODUCT',
  whatsInside = ['Deliverable one', 'Deliverable two', 'Deliverable three', 'Deliverable four', 'Bonus resource'],
  outcome = 'Launch your agency this week.',
  cta = 'START',
  store = 'yourstore.com',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const breathe = Math.sin(frame / 26) * 0.5 + 0.5;
  const progress = interpolate(frame, [3, durationInFrames - 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pivot = ramp(frame, 175, 205); // 0 = problem (red), 1 = solution (gold)

  // camera orbit
  const leanAt = (b: number) => spring({ frame: frame - b, fps, config: { damping: 14, stiffness: 90, mass: 1.1 } }) * interpolate(frame - b, [0, 40], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * 2.2;
  const yaw = Math.sin(frame / 150) * 5 + (frame >= 90 ? leanAt(90) : 0) + (frame >= 180 ? leanAt(180) : 0) + (frame >= 255 ? leanAt(255) : 0) + (frame >= 360 ? leanAt(360) : 0);
  const pitch = Math.cos(frame / 190) * 3;
  const counterRot = -yaw * 0.45;

  const o1x = Math.sin(frame / 58) * 90, o1y = Math.cos(frame / 72) * 70;
  const o2x = Math.cos(frame / 50) * 110, o2y = Math.sin(frame / 66) * 90;
  const orbScale = 1 + breathe * 0.08;

  const panel = (start: number, end: number | null) => {
    const inP = start === 0 ? 1 : clamp01(spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 120, mass: 1 } }));
    const outP = end === null ? 0 : clamp01(spring({ frame: frame - end, fps, config: { damping: 18, stiffness: 120, mass: 1 } }));
    const rotY = (1 - inP) * 90 - outP * 90;
    const opacity = clamp01(interpolate(Math.abs(rotY), [0, 50, 70], [1, 1, 0])) * inP * (1 - outP);
    const bright = interpolate(Math.abs(rotY), [0, 90], [1, 0.4]);
    return { rotY, opacity, bright };
  };
  const pPain = panel(0, 90);
  const pPains = panel(90, 180);
  const pSol = panel(180, 255);
  const pInside = panel(255, 360);
  const pOffer = panel(360, null);

  const depthShadow = (col: string) => Array.from({ length: 12 }, (_, d) => `0 ${d}px 0 rgba(8,4,18,${(0.9 - d * 0.05).toFixed(2)})`).join(',') + `, 0 22px 34px ${col}55`;
  const HingeWords = ({ text, baseStart, stagger, size, col }: { text: string; baseStart: number; stagger: number; size: number; col: string }) => {
    const ws = String(text).toUpperCase().split(/\s+/).filter(Boolean);
    return (
      <h1 style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0 20px', perspective: 1400, perspectiveOrigin: '50% 0%', color: '#fff', fontSize: size, fontWeight: 900, lineHeight: 1.0, letterSpacing: -2 }}>
        {ws.map((w, i) => {
          const local = frame - (baseStart + i * stagger);
          const s = spring({ frame: local, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
          const rotX = interpolate(s, [0, 1], [-92, 0]);
          const o = interpolate(local, [0, 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return <span key={i} style={{ display: 'inline-block', transformStyle: 'preserve-3d', transformOrigin: '50% 0%', backfaceVisibility: 'hidden', transform: `rotateX(${rotX}deg)`, opacity: o, textShadow: depthShadow(col) }}>{w}</span>;
        })}
      </h1>
    );
  };

  // 3D product box (solution reveal hero)
  const boxRy = interpolate(frame - 185, [0, 60], [-180, -12], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) + (frame > 245 ? (frame - 245) * 0.25 : 0);
  const boxRx = Math.sin(frame / 40) * 7 - 8;
  const boxPop = clamp01(spring({ frame: frame - 184, fps, config: { damping: 12, stiffness: 150 } }));
  const EDGE = 320, HALF = EDGE / 2;
  const boxFaces = [
    `rotateY(0deg) translateZ(${HALF}px)`, `rotateY(90deg) translateZ(${HALF}px)`,
    `rotateY(180deg) translateZ(${HALF}px)`, `rotateY(-90deg) translateZ(${HALF}px)`,
    `rotateX(90deg) translateZ(${HALF}px)`, `rotateX(-90deg) translateZ(${HALF}px)`,
  ];

  const ctaSpring = clamp01(spring({ frame: frame - 372, fps, config: { damping: 12, stiffness: 140, mass: 0.8 } }));
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.84, 1]);
  const shimmerX = interpolate(((frame - 372) % 36) / 36, [0, 1], [-60, 160]);
  const arrowNudge = Math.sin(frame / 6) * 6;

  const dust = Array.from({ length: 16 }, (_, i) => {
    const bx = random('x' + i) * width, by = random('y' + i) * height;
    const dy = Math.sin(frame / (24 + random('s' + i) * 30) + i) * 22;
    const dx = Math.cos(frame / (30 + random('t' + i) * 26) + i) * 14;
    return { x: bx + dx, y: by + dy, size: 2 + random('r' + i) * 4, op: (0.1 + random('o' + i) * 0.2) * (0.5 + breathe * 0.5), key: i };
  });

  const planeBase: React.CSSProperties = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden' };

  return (
    <AbsoluteFill style={{ backgroundColor: '#04020A', fontFamily: FONT }}>
      <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: '50% 42%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)` }}>

          {/* BG plane — aurora crossfades red(problem) -> gold(solution) */}
          <div style={{ ...planeBase, transform: 'translateZ(-520px) scale(1.42)' }}>
            <AbsoluteFill style={{ background: 'linear-gradient(165deg, #0F0307 0%, #0C0518 55%, #05030D 100%)' }} />
            {/* red orbs */}
            <div style={{ position: 'absolute', top: 100, left: '50%', width: 1000, height: 1000, marginLeft: -500, borderRadius: '50%', background: `radial-gradient(circle, ${PAIN_A}55 0%, ${PAIN_A}00 62%)`, filter: 'blur(70px)', opacity: 1 - pivot, transform: `translate(${o1x}px, ${o1y}px) scale(${orbScale})` }} />
            <div style={{ position: 'absolute', bottom: 60, left: -120, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${PAIN_B}4d 0%, ${PAIN_B}00 60%)`, filter: 'blur(80px)', opacity: 1 - pivot, transform: `translate(${o2x}px, ${o2y}px) scale(${orbScale})` }} />
            {/* gold orbs */}
            <div style={{ position: 'absolute', top: 100, left: '50%', width: 1000, height: 1000, marginLeft: -500, borderRadius: '50%', background: `radial-gradient(circle, ${accentA}55 0%, ${accentA}00 62%)`, filter: 'blur(70px)', opacity: pivot, transform: `translate(${o1x}px, ${o1y}px) scale(${orbScale})` }} />
            <div style={{ position: 'absolute', bottom: 60, left: -120, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${accentB}4d 0%, ${accentB}00 60%)`, filter: 'blur(80px)', opacity: pivot, transform: `translate(${o2x}px, ${o2y}px) scale(${orbScale})` }} />
            {dust.map((d) => <div key={d.key} style={{ position: 'absolute', left: d.x, top: d.y, width: d.size, height: d.size, borderRadius: '50%', background: '#fff', opacity: d.op }} />)}
          </div>

          {/* MID plane — PAINS + WHAT'S INSIDE */}
          <div style={{ ...planeBase, transform: 'translateZ(-120px) scale(1.09)' }}>
            {/* PAINS */}
            <div style={{ position: 'absolute', top: 520, left: 64, right: 64, transformStyle: 'preserve-3d', transform: `rotateY(${pPains.rotY}deg)`, opacity: pPains.opacity, filter: `brightness(${pPains.bright})` }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4, color: PAIN_A, marginBottom: 30, transform: `rotateY(${counterRot}deg)` }}>SOUND FAMILIAR?</div>
              {pains.map((p, i) => {
                const start = 100 + i * 18;
                const s = clamp01(spring({ frame: frame - start, fps, config: { damping: 16, stiffness: 130 } }));
                const x = interpolate(s, [0, 1], [-30, 0]);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 26, opacity: s, transform: `translateX(${x}px) rotateY(${counterRot}deg)` }}>
                    <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 900, color: '#fff', background: `linear-gradient(135deg, ${PAIN_A}, ${PAIN_B})`, boxShadow: `0 0 ${s * 20}px ${PAIN_A}88` }}>✗</div>
                    <div style={{ fontSize: 50, fontWeight: 700, color: '#F4E9EC', lineHeight: 1.12 }}>{p}</div>
                  </div>
                );
              })}
            </div>
            {/* WHAT'S INSIDE */}
            <div style={{ position: 'absolute', top: 470, left: 64, right: 64, transformStyle: 'preserve-3d', transform: `rotateX(5deg) rotateY(${pInside.rotY}deg)`, opacity: pInside.opacity, filter: `brightness(${pInside.bright})` }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4, color: accentA, marginBottom: 28, transform: `rotateX(-5deg) rotateY(${counterRot}deg)` }}>WHAT'S INSIDE</div>
              {whatsInside.map((it, i) => {
                const start = 266 + i * 13;
                const s = clamp01(spring({ frame: frame - start, fps, config: { damping: 15, stiffness: 140 } }));
                const y = interpolate(s, [0, 1], [24, 0]);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, opacity: s, transform: `translateY(${y}px) rotateX(-5deg)`, padding: '14px 20px', borderRadius: 16, background: 'rgba(8,6,18,0.72)', border: `1px solid ${accentA}44` }}>
                    <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff', background: `linear-gradient(135deg, ${accentA}, ${accentB})`, boxShadow: `0 0 ${s * 16}px ${accentA}88` }}>✓</div>
                    <div style={{ fontSize: 44, fontWeight: 700, color: '#F6F0E6', lineHeight: 1.1 }}>{it}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FG plane — PAIN HOOK + PRODUCT BOX + OFFER/CTA */}
          <div style={{ ...planeBase, transform: 'translateZ(90px) scale(0.94)' }}>
            {/* PAIN HOOK */}
            <div style={{ position: 'absolute', top: 300, left: 64, right: 64, transformStyle: 'preserve-3d', transform: `rotateY(${pPain.rotY}deg)`, opacity: pPain.opacity, filter: `brightness(${pPain.bright})` }}>
              <div style={{ transform: `rotateY(${counterRot}deg)` }}>
                <HingeWords text={painHook} baseStart={6} stagger={5} size={108} col={PAIN_A} />
              </div>
              <div style={{ marginTop: 34, opacity: clamp01(ramp(frame, 50, 72)), fontSize: 46, fontWeight: 700, color: PAIN_A, lineHeight: 1.2, transform: `rotateY(${counterRot}deg)` }}>{agitate}</div>
            </div>

            {/* PRODUCT REVEAL — 3D box + name */}
            <div style={{ position: 'absolute', top: 260, left: 64, right: 64, transformStyle: 'preserve-3d', transform: `rotateY(${pSol.rotY}deg)`, opacity: pSol.opacity, filter: `brightness(${pSol.bright})` }}>
              <div style={{ transform: `rotateY(${counterRot}deg)`, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 5, color: accentA, opacity: ramp(frame, 186, 204) }}>THE FIX →</div>
                <div style={{ marginTop: 18, fontSize: 76, fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: -2, opacity: ramp(frame, 196, 216), textShadow: `0 0 50px ${accentA}66` }}>{solutionLabel}</div>
              </div>
              {/* 3D product box */}
              <div style={{ position: 'absolute', left: '50%', top: 520, width: EDGE, height: EDGE, marginLeft: -HALF, perspective: 900, perspectiveOrigin: '50% 42%', opacity: clamp01(ramp(frame, 184, 200)) }}>
                <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `scale(${interpolate(boxPop, [0, 1], [0.3, 1])}) rotateX(${boxRx}deg) rotateY(${boxRy}deg)` }}>
                  {boxFaces.map((ft, fi) => (
                    <div key={fi} style={{ position: 'absolute', width: EDGE, height: EDGE, backfaceVisibility: 'hidden', transform: ft, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 22, border: `1px solid ${accentA}88`, background: fi === 0 ? `linear-gradient(135deg, ${accentA}, ${accentB})` : shade(accentA, -0.6), boxShadow: `inset 0 0 70px ${accentA}55` }}>
                      {fi === 0 ? <>
                        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 2, color: '#fff', textAlign: 'center', padding: '0 20px', lineHeight: 1.1 }}>{productName}</div>
                        <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,0.4)' }}>{price}</div>
                      </> : <div style={{ fontSize: 60, fontWeight: 900, color: '#fff', opacity: 0.25 }}>★</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OFFER + CTA */}
            <div style={{ position: 'absolute', bottom: 200, left: 64, right: 64, transformStyle: 'preserve-3d', transform: `rotateY(${pOffer.rotY}deg)`, opacity: pOffer.opacity }}>
              <div style={{ transform: `rotateY(${counterRot}deg)`, textAlign: 'center', marginBottom: 30 }}>
                <div style={{ fontSize: 130, fontWeight: 900, color: '#fff', letterSpacing: -4, lineHeight: 1.0, textShadow: `0 0 50px ${accentA}77` }}>{price}</div>
                <div style={{ marginTop: 12, fontSize: 46, fontWeight: 800, color: accentA, lineHeight: 1.1 }}>{outcome}</div>
                <div style={{ marginTop: 16, fontSize: 30, fontWeight: 600, color: '#CFCDE8', fontFamily: MONO, letterSpacing: 1 }}>{store}</div>
              </div>
              <div style={{ transform: `scale(${ctaScale}) rotateY(${counterRot}deg)`, transformOrigin: 'center' }}>
                <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${accentA} 0%, ${accentB} 100%)`, borderRadius: 28, padding: '34px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0 26px 70px ${accentA}${breathe > 0.5 ? '88' : '55'}` }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${shimmerX}%`, width: '40%', background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)', transform: 'skewX(-18deg)' }} />
                  <p style={{ margin: 0, color: '#fff', fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 14 }}>
                    Reply <span style={{ background: 'rgba(0,0,0,0.38)', padding: '6px 20px', borderRadius: 14, fontFamily: MONO, fontWeight: 700 }}>{cta}</span>
                  </p>
                  <p style={{ margin: '12px 0 0 0', color: '#FFFFFFdd', fontSize: 29, fontWeight: 500 }}>to grab it <span style={{ display: 'inline-block', transform: `translateX(${arrowNudge}px)` }}>→</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </AbsoluteFill>

      {/* flat overlays */}
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px', mixBlendMode: 'overlay', opacity: 0.07 + breathe * 0.04, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 36, left: 48, right: 48, height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${PAIN_A}, ${accentA})`, boxShadow: `0 0 14px ${accentA}cc` }} />
      </div>
      <div style={{ position: 'absolute', top: 86, left: 56, display: 'flex', alignItems: 'center', opacity: interpolate(frame, [4, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <span style={{ color: '#9D9ABF', fontSize: 28, letterSpacing: 6, fontWeight: 700 }}>YOUR BRAND</span>
      </div>
      <div style={{ position: 'absolute', bottom: 56, left: 0, right: 0, textAlign: 'center', color: '#6E6A8C', fontSize: 24, fontFamily: MONO, letterSpacing: 2, opacity: 0.6 }}>{store} · @yourhandle</div>
    </AbsoluteFill>
  );
};

// CameraMotionBlur wrapper (real motion blur, 3D-safe). Audio stays outside the blur.
export const ProductReel: React.FC<ProductReelProps> = (props) => {
  const samples = props.mbSamples ?? 6;
  return (
    <AbsoluteFill style={{ backgroundColor: '#04020A' }}>
      {props.voSrc ? <Audio src={staticFile(props.voSrc)} /> : null}
      <CameraMotionBlur samples={samples} shutterAngle={180}>
        <ProductScene {...props} />
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
