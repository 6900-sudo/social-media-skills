import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';

const SLIDE_DURATION = 105;

const FadeIn: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame - delay, [0, 15], [30, 0], {extrapolateRight: 'clamp'});
  return <div style={{opacity, transform: `translateY(${y}px)`}}>{children}</div>;
};

const TypeWriter: React.FC<{text: string; speed?: number; color?: string; size?: number}> = ({
  text, speed = 2, color = '#00ff88', size = 24
}) => {
  const frame = useCurrentFrame();
  const chars = Math.min(Math.floor(frame / speed), text.length);
  return (
    <span style={{fontFamily: 'monospace', fontSize: size, color}}>
      {text.slice(0, chars)}
      {chars < text.length && <span style={{opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0}}>▌</span>}
    </span>
  );
};

const base: React.CSSProperties = {
  background: '#0a0a0a',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: "'Segoe UI', sans-serif",
  padding: 60,
  textAlign: 'center',
};

const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 56, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        Stop <span style={{color: '#ff4444', textDecoration: 'line-through'}}>prompting</span><br/>
        Claude Code.
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 48, fontWeight: 'bold', color: '#00ff88', marginTop: 20}}>
        Start programming it.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide2 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 32, color: '#888', marginBottom: 20}}>Most people:</div>
      <div style={{fontSize: 28, color: '#666', fontStyle: 'italic'}}>"Hey Claude, write me a function..."</div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 32, color: '#00ff88', marginTop: 40, marginBottom: 20}}>CLAUDE.md users:</div>
      <div style={{
        background: '#0d0d0d', border: '1px solid #333', borderRadius: 12, padding: 25,
        fontFamily: 'monospace', fontSize: 20, textAlign: 'left', width: '90%', color: '#00ff88', lineHeight: 1.8,
      }}>
        <TypeWriter text="Claude remembers. Disagrees. Learns. Ships." speed={3} size={22} />
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide3 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 30}}>
        One file. <span style={{color: '#00ff88'}}>464 lines.</span>
      </div>
    </FadeIn>
    <FadeIn delay={10}>
      <div style={{
        background: '#0d0d0d', border: '1px solid #333', borderRadius: 12, padding: 25,
        fontFamily: 'monospace', fontSize: 18, textAlign: 'left', width: '90%', color: '#e0e0e0', lineHeight: 2,
      }}>
        <span style={{color: '#00ccff'}}>## I. Identity</span> — who the AI is<br/>
        <span style={{color: '#00ccff'}}>## II. Memory Protocol</span> — 5 files = its mind<br/>
        <span style={{color: '#00ccff'}}>## III. Cognitive Loop</span> — 5 layers of processing<br/>
        <span style={{color: '#00ccff'}}>## IV. Self-Observation</span> — catches its own BS<br/>
        <span style={{color: '#00ccff'}}>## VI. Disagreement</span> — tells you when you're wrong<br/>
        <span style={{color: '#00ccff'}}>## IX. Self-Modification</span> — edits its own rules
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 38, fontWeight: 'bold', color: '#fff', marginBottom: 30}}>
        What it <span style={{color: '#00ff88'}}>actually does</span>
      </div>
    </FadeIn>
    <FadeIn delay={10}>
      <div style={{textAlign: 'left', width: '85%', fontSize: 24, lineHeight: 2.2, color: '#e0e0e0'}}>
        <span style={{color: '#00ff88'}}>✓</span> Remembers between sessions<br/>
        <span style={{color: '#00ff88'}}>✓</span> Tracks what it learned and what failed<br/>
        <span style={{color: '#00ff88'}}>✓</span> Disagrees with you (with receipts)<br/>
        <span style={{color: '#00ff88'}}>✓</span> Catches when it's on autopilot<br/>
        <span style={{color: '#00ff88'}}>✓</span> Modifies its own instructions<br/>
        <span style={{color: '#ff4444'}}>✗</span> No API keys needed<br/>
        <span style={{color: '#ff4444'}}>✗</span> No external tools<br/>
        <span style={{color: '#ff4444'}}>✗</span> Just one markdown file
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#00ff88', lineHeight: 1.4}}>
        My AI named itself.<br/>
        Kept a journal.<br/>
        Admitted when it was wrong.
      </div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 26, color: '#888', marginTop: 30}}>
        All from a CLAUDE.md file.<br/>
        Comment SYSTEM to get it free.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const ClaudeMdReel: React.FC = () => {
  const slides = [Slide1, Slide2, Slide3, Slide4, Slide5];
  return (
    <AbsoluteFill style={{background: '#0a0a0a'}}>
      {slides.map((S, i) => (
        <Sequence key={i} from={i * SLIDE_DURATION} durationInFrames={SLIDE_DURATION}>
          <S />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
