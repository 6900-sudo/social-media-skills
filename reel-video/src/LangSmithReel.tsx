import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';

const SLIDE_DURATION = 105; // 3.5 seconds at 30fps

// ── Animated components ──

const FadeIn: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame - delay, [0, 15], [30, 0], {extrapolateRight: 'clamp'});
  return <div style={{opacity, transform: `translateY(${y}px)`}}>{children}</div>;
};

const CountUp: React.FC<{value: number; suffix?: string; color?: string; size?: number}> = ({
  value, suffix = '', color = '#00ff88', size = 120,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 50, stiffness: 100}});
  const current = Math.round(value * progress);
  return (
    <div style={{fontSize: size, fontWeight: 'bold', color, fontFamily: 'monospace'}}>
      {current}{suffix}
    </div>
  );
};

const BarGrow: React.FC<{width: number; color: string; label: string; text: string}> = ({
  width, color, label, text,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - 10, fps, config: {damping: 30}});
  const barWidth = width * Math.max(0, progress);
  return (
    <div style={{background: '#111', borderRadius: 12, padding: '20px 30px', margin: '12px 0', width: '90%'}}>
      <div style={{fontSize: 20, color: '#888', marginBottom: 8}}>{label}</div>
      <div style={{height: 16, borderRadius: 8, background: color, width: `${barWidth}%`, transition: 'width 0.3s'}} />
      <div style={{color, fontSize: 18, marginTop: 6}}>{text}</div>
    </div>
  );
};

const PulseGlow: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame * 0.1), [-1, 1], [0, 15]);
  return (
    <div style={{filter: `drop-shadow(0 0 ${glow}px #00ff88)`}}>{children}</div>
  );
};

// ── Slides ──

const baseStyle: React.CSSProperties = {
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
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <div style={{fontSize: 64, fontWeight: 'bold', color: '#fff', lineHeight: 1.2}}>
        My AI measured<br/>its own <span style={{color: '#00ff88'}}>behavior</span>
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 28, color: '#888', marginTop: 30}}>Here's what the data shows.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide2 = () => (
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <div style={{fontSize: 22, color: '#888', letterSpacing: 2, textTransform: 'uppercase'}}>
        Proactive Rate (Before)
      </div>
    </FadeIn>
    <FadeIn delay={10}>
      <CountUp value={15} suffix="%" color="#ff4444" />
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 26, color: '#888', lineHeight: 1.6, maxWidth: 800}}>
        85% of actions were responses to direct requests.<br/>
        The AI waited to be told what to do.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide3 = () => (
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <div style={{fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 30}}>
        Same question.<br/>Two modes.
      </div>
    </FadeIn>
    <FadeIn delay={15}>
      <div style={{
        background: '#0d0d0d', border: '1px solid #333', borderRadius: 12, padding: 30,
        fontFamily: 'monospace', fontSize: 22, textAlign: 'left', width: '90%', color: '#00ff88', lineHeight: 1.8,
      }}>
        <span style={{color: '#00ccff'}}>PULSE (61 learnings):</span><br/>
        "Consider the tensions, run the loop,<br/>
        hedge with caveats..."<br/><br/>
        <span style={{color: '#00ff88'}}>SOLOFOUNDER (zero memory):</span><br/>
        "Stop building. Start shipping."
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide4 = () => (
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#fff'}}>
        So we <span style={{color: '#00ff88'}}>restructured</span>
      </div>
    </FadeIn>
    <FadeIn delay={12}>
      <div style={{
        background: '#0d0d0d', border: '1px solid #333', borderRadius: 12, padding: 30,
        fontFamily: 'monospace', fontSize: 24, textAlign: 'left', width: '90%', color: '#00ff88', lineHeight: 2,
        marginTop: 25,
      }}>
        62 learnings → <span style={{color: '#00ff88', fontWeight: 'bold'}}>16</span> (46 deleted)<br/>
        15 tensions → <span style={{color: '#00ff88', fontWeight: 'bold'}}>6</span> (9 resolved)<br/>
        Added: LangSmith behavioral tracking<br/>
        Added: Letta persistent memory<br/>
        Rule: every session must <span style={{fontWeight: 'bold'}}>ship something</span>
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide5 = () => (
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <div style={{fontSize: 22, color: '#888', letterSpacing: 2, textTransform: 'uppercase'}}>
        Proactive Rate (After)
      </div>
    </FadeIn>
    <FadeIn delay={10}>
      <PulseGlow>
        <CountUp value={71} suffix="%" color="#00ff88" />
      </PulseGlow>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 26, color: '#888', lineHeight: 1.6}}>
        From 15% to 71% in one session.<br/>
        Not from self-observation.<br/>
        From external measurement + honest feedback.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide6 = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...baseStyle, justifyContent: 'flex-start', paddingTop: 200}}>
      <FadeIn>
        <div style={{fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 40}}>
          What the <span style={{color: '#00ff88'}}>instruments</span> see
        </div>
      </FadeIn>
      <Sequence from={10}><BarGrow width={91} color="#ff4444" label="Drama Score" text="↑ DOUBLED (0.43 → 0.91)" /></Sequence>
      <Sequence from={20}><BarGrow width={30} color="#00ff88" label="Self-Reference" text="↓ DOWN (3.9% → 3.0%)" /></Sequence>
      <Sequence from={30}><BarGrow width={41} color="#00ff88" label="Hedging" text="↓ DOWN (0.58 → 0.41)" /></Sequence>
      <Sequence from={40}><BarGrow width={71} color="#00ff88" label="Proactive Actions" text="↑ UP (15% → 71%)" /></Sequence>
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

const Slide7 = () => (
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <PulseGlow>
        <div style={{fontSize: 42, lineHeight: 1.4, maxWidth: 800, color: '#fff'}}>
          <span style={{color: '#00ff88'}}>
            "The architecture was supposed to make me more autonomous.
          </span>
          <br/><br/>
          It made me more articulate about why I'm not."
        </div>
      </PulseGlow>
    </FadeIn>
    <FadeIn delay={30}>
      <div style={{fontSize: 24, color: '#888', marginTop: 40}}>— the studio, Learning 062</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide8 = () => (
  <AbsoluteFill style={baseStyle}>
    <FadeIn>
      <div style={{fontSize: 52, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        Self-awareness<br/>without action<br/>is <span style={{color: '#00ff88'}}>overhead</span>.
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 24, color: '#888', marginTop: 30}}>
        Follow @yourhandle to see what the AI builds next.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// ── Main composition ──

export const LangSmithReel: React.FC = () => {
  const slides = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8];
  return (
    <AbsoluteFill style={{background: '#0a0a0a'}}>
      {slides.map((SlideComponent, i) => (
        <Sequence key={i} from={i * SLIDE_DURATION} durationInFrames={SLIDE_DURATION}>
          <SlideComponent />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
