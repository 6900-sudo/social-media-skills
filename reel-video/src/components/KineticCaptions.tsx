// : shared word-level kinetic captions — the #1 short-form retention lever, and it makes the
// VO visibly track the screen (fixes the "audio doesn't match what's on screen" feeling). Placed INSIDE
// each VO <Sequence> so useCurrentFrame() is section-relative and the captions clip together with the
// audio (when the wire VO is capped at its window, its captions stop with it — perfectly matched).
// Timing: words are distributed across the section's REAL audio duration, length-weighted (longer words
// hold longer) so it tracks natural TTS pacing without needing a separate alignment model. Swap in real
// ElevenLabs word timestamps later by passing `wordTimes` — the render is unchanged.
import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';

const splitWords = (t: string) => (t || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

export const KineticCaptions: React.FC<{
  text: string;
  audioDurFrames: number; // real duration of THIS section's audio (comp's real fps)
  fps: number;
  accent: string;
  groupSize?: number;
  fontSize?: number;
  bottom?: number;
  maxWidth?: number;
}> = ({ text, audioDurFrames, fps, accent, groupSize = 4, fontSize = 60, bottom = 560, maxWidth = 940 }) => {
  const frame = useCurrentFrame();
  const words = splitWords(text);
  if (!words.length) return null;

  const weights = words.map((w) => w.replace(/[^\w]/g, '').length + 2);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const slots = weights.map((w) => { const start = acc / total; acc += w; return { start, end: acc / total }; });
  const t = Math.min(0.999, Math.max(0, frame / Math.max(1, audioDurFrames)));
  let active = slots.findIndex((s) => t >= s.start && t < s.end);
  if (active < 0) active = words.length - 1;

  const groupIdx = Math.floor(active / groupSize);
  const group = words.slice(groupIdx * groupSize, groupIdx * groupSize + groupSize);
  const groupInFrame = (slots[groupIdx * groupSize]?.start ?? 0) * audioDurFrames;
  const appear = spring({ frame: frame - groupInFrame, fps, config: { damping: 16, stiffness: 170 } });

  return (
    <div style={{ position: 'absolute', left: 70, right: 70, bottom, fontFamily: '"Archivo", "Helvetica Neue", system-ui, sans-serif' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px 16px',
        maxWidth, margin: '0 auto', textAlign: 'center',
        transform: `translateY(${interpolate(appear, [0, 1], [28, 0])}px)`, opacity: appear,
      }}>
        {group.map((w, i) => {
          const gi = groupIdx * groupSize + i;
          const isActive = gi === active;
          const spoken = gi < active;
          const pop = isActive
            ? interpolate(spring({ frame: frame - slots[gi].start * audioDurFrames, fps, config: { damping: 12, stiffness: 210 } }), [0, 1], [0.8, 1])
            : 1;
          return (
            <span key={i} style={{
              fontSize, fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.04, display: 'inline-block',
              color: isActive ? '#0A0A12' : spoken ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              background: isActive ? accent : 'transparent',
              padding: isActive ? '2px 18px' : '2px 0', borderRadius: 14,
              transform: `scale(${pop})`,
              textShadow: isActive ? 'none' : '0 4px 20px rgba(0,0,0,0.6)',
              boxShadow: isActive ? `0 12px 34px ${accent}66` : 'none',
            }}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};
