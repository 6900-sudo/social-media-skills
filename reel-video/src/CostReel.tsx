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
  const y = interpolate(frame - delay, [0, 15], [20, 0], {extrapolateRight: 'clamp'});
  return <div style={{opacity, transform: `translateY(${y}px)`}}>{children}</div>;
};

const CountUp: React.FC<{value: number; prefix?: string; suffix?: string; color?: string; size?: number; decimals?: number}> = ({
  value, prefix = '', suffix = '', color = '#00ff88', size = 100, decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 50, stiffness: 80}});
  const current = (value * progress).toFixed(decimals);
  return (
    <div style={{fontSize: size, fontWeight: 'bold', color, fontFamily: 'monospace'}}>
      {prefix}{current}{suffix}
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

const CostRow: React.FC<{tool: string; cost: string; status: string; color: string; delay: number}> = ({tool, cost, status, color, delay}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const x = interpolate(frame - delay, [0, 10], [-30, 0], {extrapolateRight: 'clamp'});
  return (
    <div style={{opacity, transform: `translateX(${x}px)`, display: 'flex', justifyContent: 'space-between', width: '90%', padding: '12px 20px', background: '#111', borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${color}`}}>
      <span style={{fontSize: 22, color: '#e0e0e0'}}>{tool}</span>
      <span style={{fontSize: 22, color, fontFamily: 'monospace', fontWeight: 'bold'}}>{cost}</span>
    </div>
  );
};

const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 52, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        I spent<br/>
        <span style={{color: '#ff4444', fontSize: 72}}>$2,847</span><br/>
        on AI tools this month.
      </div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 28, color: '#888', marginTop: 20}}>Most of it was wasted.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide2 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 180}}>
    <FadeIn>
      <div style={{fontSize: 34, fontWeight: 'bold', color: '#fff', marginBottom: 25}}>What I <span style={{color: '#ff4444'}}>killed</span></div>
    </FadeIn>
    <CostRow tool="Cursor Pro" cost="$20/mo" status="killed" color="#ff4444" delay={10} />
    <CostRow tool="ChatGPT Plus" cost="$20/mo" status="killed" color="#ff4444" delay={18} />
    <CostRow tool="Midjourney" cost="$30/mo" status="killed" color="#ff4444" delay={26} />
    <CostRow tool="Jasper AI" cost="$49/mo" status="killed" color="#ff4444" delay={34} />
    <CostRow tool="Copy.ai" cost="$36/mo" status="killed" color="#ff4444" delay={42} />
    <FadeIn delay={50}>
      <div style={{fontSize: 24, color: '#ff4444', marginTop: 15}}>= $155/mo eliminated</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide3 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 180}}>
    <FadeIn>
      <div style={{fontSize: 34, fontWeight: 'bold', color: '#fff', marginBottom: 25}}>What <span style={{color: '#00ff88'}}>survived</span></div>
    </FadeIn>
    <CostRow tool="Claude Code Pro" cost="$20/mo" status="keep" color="#00ff88" delay={10} />
    <CostRow tool="Claude API" cost="$5-15/mo" status="keep" color="#00ff88" delay={18} />
    <CostRow tool="AWS Lightsail" cost="$3.50/mo" status="keep" color="#00ff88" delay={26} />
    <CostRow tool="LangSmith" cost="$0" status="free" color="#00ccff" delay={34} />
    <CostRow tool="Letta" cost="$0" status="free" color="#00ccff" delay={42} />
    <FadeIn delay={50}>
      <div style={{fontSize: 24, color: '#00ff88', marginTop: 15}}>= $28-38/mo total</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 32, color: '#888', marginBottom: 10}}>Monthly savings</div>
    </FadeIn>
    <FadeIn delay={5}>
      <CountUp value={117} prefix="$" suffix="/mo" color="#00ff88" size={90} />
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 28, color: '#888', marginTop: 20}}>
        $155 killed. $38 kept.<br/>
        Better output on less spend.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#00ff88', lineHeight: 1.4}}>
        The stack that does everything<br/>
        costs less than one tool<br/>
        I was paying for.
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 26, color: '#888', marginTop: 30}}>
        Comment STACK to get the full breakdown.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const CostReel: React.FC = () => {
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
