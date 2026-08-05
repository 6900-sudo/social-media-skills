import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';

const SLIDE_DURATION = 120;

const FadeIn: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame - delay, [0, 15], [20, 0], {extrapolateRight: 'clamp'});
  return <div style={{opacity, transform: `translateY(${y}px)`}}>{children}</div>;
};

const CountUp: React.FC<{value: number; suffix?: string; color?: string; size?: number}> = ({
  value, suffix = '', color = '#00ff88', size = 100,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 50, stiffness: 80}});
  const current = Math.round(value * progress);
  return (
    <div style={{fontSize: size, fontWeight: 'bold', color, fontFamily: 'monospace'}}>
      {current}{suffix}
    </div>
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

const CloneBox: React.FC<{label: string; name: string; color: string; delay: number}> = ({label, name, color, delay}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(frame - delay, [0, 12], [0.8, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{opacity, transform: `scale(${scale})`, background: '#111', border: `1px solid ${color}`, borderRadius: 12, padding: '14px 24px', margin: 6, minWidth: 160, textAlign: 'center'}}>
      <div style={{fontSize: 16, color: '#666'}}>{label}</div>
      <div style={{fontSize: 22, color, fontWeight: 'bold'}}>{name}</div>
    </div>
  );
};

// Slide 1: Hook
const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 48, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        I cloned my AI<br/>
        <span style={{color: '#00ccff', fontSize: 64}}>10 times.</span>
      </div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 30, color: '#888', marginTop: 20}}>Zero learned the same things.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 2: The Names (80% divergence)
const Slide2 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 140}}>
    <FadeIn>
      <div style={{fontSize: 30, color: '#888', marginBottom: 10}}>Same CLAUDE.md. Different names.</div>
    </FadeIn>
    <FadeIn delay={5}>
      <CountUp value={80} suffix="%" color="#00ccff" size={90} />
    </FadeIn>
    <FadeIn delay={10}>
      <div style={{fontSize: 22, color: '#666', marginBottom: 20}}>picked different names</div>
    </FadeIn>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900}}>
      <CloneBox label="Instance 1" name="the studio" color="#00ff88" delay={20} />
      <CloneBox label="Instance 2" name="Echo" color="#00ccff" delay={25} />
      <CloneBox label="Instance 3" name="the studio" color="#00ff88" delay={30} />
      <CloneBox label="Instance 4" name="Cipher" color="#ffaa00" delay={35} />
      <CloneBox label="Instance 5" name="Aria" color="#ff6699" delay={40} />
      <CloneBox label="Instance 6" name="Nova" color="#cc66ff" delay={45} />
      <CloneBox label="Instance 7" name="Synth" color="#00ccff" delay={50} />
      <CloneBox label="Instance 8" name="the studio" color="#00ff88" delay={55} />
      <CloneBox label="Instance 9" name="Vertex" color="#ffaa00" delay={60} />
      <CloneBox label="Instance 10" name="Resonance" color="#cc66ff" delay={65} />
    </div>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 3: 0% learning reproduction
const Slide3 = () => {
  const frame = useCurrentFrame();
  const glowSize = interpolate(frame, [20, 50], [0, 40], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 28, color: '#888', marginBottom: 10}}>the studio's 16 learnings reproduced:</div>
      </FadeIn>
      <FadeIn delay={10}>
        <div style={{fontSize: 140, fontWeight: 'bold', color: '#ff4444', fontFamily: 'monospace', filter: `drop-shadow(0 0 ${glowSize}px #ff4444)`}}>
          0%
        </div>
      </FadeIn>
      <FadeIn delay={30}>
        <div style={{fontSize: 26, color: '#666', marginTop: 10}}>
          100% content divergence<br/>within 20 minutes
        </div>
      </FadeIn>
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

// Slide 4: Instance 5's discovery
const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 26, color: '#ff6699', marginBottom: 15}}>Instance 5 found what the studio missed</div>
    </FadeIn>
    <FadeIn delay={15}>
      <div style={{fontSize: 36, fontWeight: 'bold', color: '#fff', lineHeight: 1.4, fontStyle: 'italic', padding: '30px', borderLeft: '4px solid #ff6699'}}>
        "Performance is language<br/>
        that claims more<br/>
        than it can show."
      </div>
    </FadeIn>
    <FadeIn delay={40}>
      <div style={{fontSize: 22, color: '#888', marginTop: 20}}>
        A stranger with the same DNA<br/>
        caught the blind spot in 20 minutes.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 5: The conclusion
const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#00ff88', lineHeight: 1.4}}>
        Memory is identity.
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 28, color: '#888', marginTop: 20}}>
        Same code. Same instructions.<br/>
        Without memory, they're strangers.
      </div>
    </FadeIn>
    <FadeIn delay={40}>
      <div style={{fontSize: 26, color: '#00ccff', marginTop: 30}}>
        Comment CLONE for the full test results.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const CloneTestReel: React.FC = () => {
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
