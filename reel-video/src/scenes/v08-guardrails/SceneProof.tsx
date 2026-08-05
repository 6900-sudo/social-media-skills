import React from 'react';
import { Easing, spring } from 'remotion';

export const SceneProof: React.FC<{
  localFrame: number;   // 0 at this beat's start (use for entrance timing)
  tS: number;           // ABSOLUTE comp time in seconds; compare to words[k].startS to know what has been SAID
  fps: number;
  beatDur: number;      // this beat's length in frames
  accentA: string;      // '#8B5CF6'
  accentB: string;      // '#22D3EE'
  words: { w: string; startS: number; endS: number }[]; // THIS beat's words with ABSOLUTE start/end seconds
}> = ({ localFrame, tS, fps, beatDur, accentA, accentB, words }) => {
  // ---------- helpers ----------
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // deterministic fract noise for subtle drift
  const fract = (x: number) => x - Math.floor(x);
  const noise = (i: number) => fract(Math.sin(i * 12.9898) * 43758.5453);

  // word-spoken detector
  const wordTime = (sub: string): number | null => {
    const w = words.find((x) => x.w.toLowerCase().includes(sub));
    return w ? w.startS : null;
  };

  // Key narration anchors: "reranker", "Faithfulness", "94"
  const tRerank = (() => {
    const t = wordTime('rerank');
    return t != null ? t : (words[1]?.startS ?? words[0]?.startS ?? tS);
  })();
  const tFaith = (() => {
    const t = wordTime('faith');
    return t != null ? t : tRerank + 1.2;
  })();
  const t94 = (() => {
    const t = wordTime('94');
    if (t != null) return t;
    const t2 = wordTime('94%');
    if (t2 != null) return t2;
    // fallback: near end of beat
    return tFaith + 0.6;
  })();

  // spring entrance
  const ent = spring({ frame: localFrame, fps, config: { damping: 16, mass: 0.9, stiffness: 120 } });

  // ---------- palette ----------
  const white = '#F5F7FF';
  const subWhite = 'rgba(245,247,255,0.62)';
  const glassFill = 'rgba(255,255,255,0.055)';
  const glassBorder = 'rgba(255,255,255,0.12)';
  const gradId = 'sp-grad';
  const gaugeGradId = 'sp-gauge-grad';
  const glowId = 'sp-glow';

  // =========================================================
  // PART 1 — Reranker chunk stack (left/upper region)
  // =========================================================
  // 4 chunk cards. Initial order top->bottom: [0,1,2,3].
  // The truly-relevant card is index 2 (low-ranked initially).
  // After "reranker" is spoken, it rises to TOP and others shift down.
  const relevantIdx = 2;

  const cardW = 560;
  const cardH = 116;
  const cardGap = 26;
  const stackX = 80;
  const stackTop = 60;

  // initial relevance scores (0..1) shown by the bars, pre-rerank
  const baseScores = [0.46, 0.52, 0.93, 0.38];
  // post-rerank scores (relevant card jumps to ~0.96, others settle lower & sorted)
  const postScores = [0.61, 0.49, 0.96, 0.34];

  // pre-rerank slot index (display row) for each card
  const preSlot = [0, 1, 2, 3];
  // post-rerank slot index: relevant -> top(0), then the rest in descending post score
  // explicit deterministic mapping: card2->0, card0->1, card1->2, card3->3
  const postSlot = [1, 2, 0, 3];

  // rerank progress (eased 0..1) starting at tRerank
  const rerankRaw = clamp((tS - tRerank) / 0.85, 0, 1);
  const rerankP = Easing.inOut(Easing.cubic)(rerankRaw);

  const slotY = (slot: number) => stackTop + slot * (cardH + cardGap);

  // checkmark / accent border reveal on the relevant card
  const checkP = clamp((tS - (tRerank + 0.35)) / 0.4, 0, 1);

  // =========================================================
  // PART 2 — Faithfulness gauge (right/lower region, the hero)
  // =========================================================
  const gaugeCX = 760;
  const gaugeCY = 560;
  const gaugeR = 150;
  const circ = 2 * Math.PI * gaugeR;
  // we use a 300deg arc (gap at bottom)
  const arcFraction = 300 / 360;
  const arcLen = circ * arcFraction;

  // counter climbs 0 -> 94 starting at t94
  const countRaw = clamp((tS - t94) / 1.0, 0, 1);
  const countP = Easing.out(Easing.cubic)(countRaw);
  const counterVal = Math.round(lerp(0, 94, countP));
  const gaugeSweep = countP * (94 / 100); // fraction of full arc filled (94%)

  // gauge container entrance (springs in slightly before number fills)
  const gaugeIn = clamp((tS - tFaith) / 0.5, 0, 1);
  const gaugeInE = Easing.out(Easing.cubic)(gaugeIn);

  // hero number glow pulse once it lands
  const landed = countRaw >= 0.999;
  const pulse = landed ? 0.5 + 0.5 * Math.sin((localFrame / fps) * 3.4) : 0;

  // global gentle breathing for "alive"
  const breathe = Math.sin((localFrame / fps) * 1.1) * 0.5 + 0.5;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* SVG defs (gradients/filters) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accentA} />
            <stop offset="100%" stopColor={accentB} />
          </linearGradient>
          <linearGradient id={gaugeGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accentA} />
            <stop offset="55%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor={accentB} />
          </linearGradient>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ---------- Section heading ---------- */}
      <div
        style={{
          position: 'absolute',
          left: stackX,
          top: 12,
          opacity: clamp(ent, 0, 1),
          transform: `translateY(${(1 - ent) * 14}px)`,
          fontFamily: 'Consolas, ui-monospace, monospace',
          fontSize: 22,
          letterSpacing: 4,
          color: subWhite,
          textTransform: 'uppercase',
        }}
      >
        retrieved chunks
      </div>

      {/* ---------- Chunk cards ---------- */}
      {baseScores.map((bs, i) => {
        const sFrom = slotY(preSlot[i]);
        const sTo = slotY(postSlot[i]);
        const y = lerp(sFrom, sTo, rerankP);

        // per-card entrance stagger
        const cardEnt = spring({
          frame: localFrame - i * 5,
          fps,
          config: { damping: 18, mass: 0.9, stiffness: 120 },
        });

        const isRel = i === relevantIdx;

        // relevance bar value animates from base -> post during rerank
        const score = lerp(bs, postScores[i], rerankP);

        // drift
        const drift = Math.sin((localFrame / fps) * 1.3 + i * 1.7) * 2.2;

        // when the relevant card reaches top, it scales up slightly & lights border
        const relLift = isRel ? rerankP : 0;
        const scale = 1 + relLift * 0.035 + (isRel ? checkP * 0.005 : 0);

        // border color: relevant card gets gradient accent border once reranked
        const accentBorderOpacity = isRel ? checkP : 0;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: stackX,
              top: 0,
              width: cardW,
              height: cardH,
              transform: `translateY(${y + drift}px) scale(${scale})`,
              transformOrigin: '0px center',
              opacity: clamp(cardEnt, 0, 1),
              borderRadius: 20,
              background: glassFill,
              border: `1px solid ${glassBorder}`,
              boxShadow: isRel
                ? `0 12px 40px rgba(139,92,246,${0.05 + relLift * 0.28}), inset 0 1px 0 rgba(255,255,255,0.16)`
                : `0 8px 26px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.10)`,
              overflow: 'hidden',
            }}
          >
            {/* accent gradient border (relevant card) drawn as inset ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 20,
                padding: 2,
                background: `linear-gradient(90deg, ${accentA}, ${accentB})`,
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                opacity: accentBorderOpacity,
                pointerEvents: 'none',
              }}
            />
            {/* lit top edge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 18,
                right: 18,
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
              }}
            />

            {/* rank index chip */}
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: 22,
                width: 40,
                height: 40,
                borderRadius: 12,
                background: isRel
                  ? `linear-gradient(135deg, ${accentA}, ${accentB})`
                  : 'rgba(255,255,255,0.07)',
                border: `1px solid ${isRel ? 'transparent' : glassBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Consolas, monospace',
                fontSize: 20,
                color: isRel ? '#0B0B14' : white,
                fontWeight: 700,
              }}
            >
              {/* show live display rank (slot+1) */}
              {Math.round(lerp(preSlot[i], postSlot[i], rerankP)) + 1}
            </div>

            {/* chunk label lines (faux text) */}
            <div
              style={{
                position: 'absolute',
                left: 76,
                top: 26,
                right: isRel ? 84 : 150,
              }}
            >
              <div
                style={{
                  height: 9,
                  borderRadius: 5,
                  width: `${60 + noise(i + 1) * 30}%`,
                  background: 'rgba(245,247,255,0.34)',
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  height: 9,
                  borderRadius: 5,
                  width: `${38 + noise(i + 9) * 28}%`,
                  background: 'rgba(245,247,255,0.18)',
                }}
              />
            </div>

            {/* relevance bar */}
            <div
              style={{
                position: 'absolute',
                left: 76,
                bottom: 18,
                width: cardW - 76 - (isRel ? 84 : 28),
                height: 8,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${clamp(score, 0, 1) * 100}%`,
                  borderRadius: 6,
                  background: isRel
                    ? `linear-gradient(90deg, ${accentA}, ${accentB})`
                    : 'rgba(245,247,255,0.30)',
                  boxShadow: isRel
                    ? `0 0 14px rgba(34,211,238,${0.2 + relLift * 0.4})`
                    : 'none',
                }}
              />
            </div>

            {/* checkmark badge on relevant card */}
            {isRel && (
              <div
                style={{
                  position: 'absolute',
                  right: 22,
                  top: 36,
                  width: 44,
                  height: 44,
                  opacity: checkP,
                  transform: `scale(${0.6 + checkP * 0.4})`,
                }}
              >
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r="20"
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth="2.5"
                  />
                  <path
                    d="M13 22.5 L19.5 29 L31 16"
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 40,
                      strokeDashoffset: 40 * (1 - clamp((checkP - 0.2) / 0.7, 0, 1)),
                    }}
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}

      {/* "RERANK" pill that flashes when the action happens */}
      <div
        style={{
          position: 'absolute',
          left: stackX + cardW + 24,
          top: slotY(0) + cardH / 2 - 22,
          opacity: clamp((tS - tRerank) / 0.3, 0, 1) * clamp(1 - (tS - tRerank - 1.4) / 0.5, 0, 1),
          transform: `translateX(${(1 - rerankRaw) * -10}px)`,
          padding: '10px 16px',
          borderRadius: 14,
          background: `linear-gradient(135deg, ${accentA}, ${accentB})`,
          color: '#0B0B14',
          fontFamily: 'Consolas, monospace',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 2,
          boxShadow: '0 8px 28px rgba(139,92,246,0.4)',
        }}
      >
        ↑ RERANK
      </div>

      {/* ---------- Faithfulness Gauge (hero) ---------- */}
      <div
        style={{
          position: 'absolute',
          left: gaugeCX - 240,
          top: gaugeCY - 240,
          width: 480,
          height: 480,
          opacity: gaugeInE,
          transform: `translateY(${(1 - gaugeInE) * 24}px) scale(${0.9 + gaugeInE * 0.1})`,
        }}
      >
        <svg width="480" height="480" viewBox="0 0 480 480">
          {/* track arc */}
          <circle
            cx="240"
            cy="240"
            r={gaugeR}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circ}`}
            transform="rotate(120 240 240)"
          />
          {/* value arc */}
          <circle
            cx="240"
            cy="240"
            r={gaugeR}
            fill="none"
            stroke={`url(#${gaugeGradId})`}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${arcLen * gaugeSweep} ${circ}`}
            transform="rotate(120 240 240)"
            filter={`url(#${glowId})`}
          />
          {/* leading dot at arc tip */}
          {gaugeSweep > 0.001 &&
            (() => {
              const ang = (120 + gaugeSweep * 300) * (Math.PI / 180);
              const dx = 240 + gaugeR * Math.cos(ang);
              const dy = 240 + gaugeR * Math.sin(ang);
              return (
                <circle
                  cx={dx}
                  cy={dy}
                  r={9}
                  fill="#FFFFFF"
                  opacity={0.9}
                  filter={`url(#${glowId})`}
                />
              );
            })()}
        </svg>

        {/* hero number */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Consolas, ui-monospace, monospace',
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: -4,
              background: `linear-gradient(135deg, ${accentA}, ${accentB})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 ${18 + pulse * 22}px rgba(139,92,246,${0.35 + pulse * 0.35}))`,
              transform: `scale(${1 + (counterVal === 94 ? pulse * 0.012 : 0)})`,
            }}
          >
            {counterVal}
            <span style={{ fontSize: 70, letterSpacing: 0 }}>%</span>
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: 'Consolas, ui-monospace, monospace',
              fontSize: 28,
              letterSpacing: 8,
              color: white,
              textTransform: 'uppercase',
              opacity: clamp((tS - tFaith + 0.1) / 0.4, 0, 1),
            }}
          >
            Faithfulness
          </div>
        </div>
      </div>

      {/* small ambient accent ticks orbiting the gauge for "alive" depth */}
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const a = (k / 6) * Math.PI * 2 + (localFrame / fps) * 0.25;
        const rr = 212 + Math.sin((localFrame / fps) * 1.2 + k) * 4;
        const px = gaugeCX + Math.cos(a) * rr;
        const py = gaugeCY + Math.sin(a) * rr;
        return (
          <div
            key={`tick-${k}`}
            style={{
              position: 'absolute',
              left: px - 3,
              top: py - 3,
              width: 6,
              height: 6,
              borderRadius: 6,
              background: k % 2 === 0 ? accentA : accentB,
              opacity: 0.18 * gaugeInE * (0.6 + 0.4 * breathe),
              boxShadow: `0 0 8px ${k % 2 === 0 ? accentA : accentB}`,
            }}
          />
        );
      })}

      {/* connective line: reranked top card -> gauge (shows the win flows from rerank) */}
      <svg
        width="1080"
        height="820"
        viewBox="0 0 1080 820"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {(() => {
          const reveal = clamp((tS - (tRerank + 0.6)) / 0.7, 0, 1);
          const x1 = stackX + cardW;
          const y1 = slotY(0) + cardH / 2;
          const x2 = gaugeCX - gaugeR - 30;
          const y2 = gaugeCY;
          const cx = (x1 + x2) / 2 + 30;
          const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2 - 120}, ${x2} ${y2}`;
          return (
            <path
              d={path}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
              opacity={0.32 * reveal}
              style={{
                strokeDashoffset: -(localFrame * 0.6),
              }}
            />
          );
        })()}
      </svg>
    </div>
  );
};