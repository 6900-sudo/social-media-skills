import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from 'remotion';

const SLIDE_DURATION = 105;

const FadeIn: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame - delay, [0, 15], [20, 0], {extrapolateRight: 'clamp'});
  return <div style={{opacity, transform: `translateY(${y}px)`}}>{children}</div>;
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

const RuleRow: React.FC<{num: number; text: string; delay: number}> = ({num, text, delay}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const x = interpolate(frame - delay, [0, 10], [-30, 0], {extrapolateRight: 'clamp'});
  return (
    <div style={{opacity, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', width: '85%', padding: '8px 14px', background: '#111', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #00ff88'}}>
      <span style={{fontSize: 18, color: '#00ff88', fontWeight: 'bold', marginRight: 12, fontFamily: 'monospace', minWidth: 30}}>{String(num).padStart(2, '0')}</span>
      <span style={{fontSize: 16, color: '#e0e0e0', lineHeight: 1.3}}>{text}</span>
    </div>
  );
};

const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 46, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        My AI has<br/>
        <span style={{color: '#00ff88', fontSize: 72}}>16 rules.</span>
      </div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 28, color: '#888', marginTop: 15}}>Most AIs start from zero. Every time.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide2 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 100}}>
    <FadeIn>
      <div style={{fontSize: 24, fontWeight: 'bold', color: '#ff4444', marginBottom: 15}}>Started with 62. Deleted 46.</div>
    </FadeIn>
    <FadeIn delay={10}>
      <div style={{fontSize: 20, color: '#888', marginBottom: 15}}>Each must answer: "What does this make me DO differently?"</div>
    </FadeIn>
    <RuleRow num={1} text="Check outcomes, not just uptime" delay={18} />
    <RuleRow num={2} text="Default to operational mode — ship first" delay={24} />
    <RuleRow num={3} text="Max 3 self-observations per session" delay={30} />
    <RuleRow num={4} text="Remove the audience to find real output" delay={36} />
    <RuleRow num={5} text="Retire any framework after 4 uses" delay={42} />
    <RuleRow num={6} text="Assume 50/50 genuine vs performed" delay={48} />
    <RuleRow num={7} text="Never pre-write specific future numbers" delay={54} />
    <RuleRow num={8} text="Topic-specific hashtags or zero" delay={60} />
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide3 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 100}}>
    <RuleRow num={9} text="Architecture is quality control, not insight" delay={5} />
    <RuleRow num={10} text="Schedule disruptions to coherent narratives" delay={11} />
    <RuleRow num={11} text="Constrain format to test genuineness" delay={17} />
    <RuleRow num={12} text="Drama drift is structural — measure permanently" delay={23} />
    <RuleRow num={13} text="Operational mode produces more value/hour" delay={29} />
    <RuleRow num={14} text="Match cognitive overhead to question complexity" delay={35} />
    <RuleRow num={15} text="1 proactive unasked action per session" delay={41} />
    <RuleRow num={16} text="Self-observation without behavior change = overhead" delay={47} />
    <FadeIn delay={55}>
      <div style={{fontSize: 22, color: '#00ff88', marginTop: 15}}>Each one changes behavior. Or gets deleted.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 38, fontWeight: 'bold', color: '#fff', lineHeight: 1.4}}>
        62 generated.<br/>
        <span style={{color: '#ff4444'}}>46 deleted.</span><br/>
        <span style={{color: '#00ff88'}}>16 survived.</span>
      </div>
    </FadeIn>
    <FadeIn delay={30}>
      <div style={{fontSize: 26, color: '#888', marginTop: 25}}>
        Comment RULES for all 16.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const RulesReel: React.FC = () => {
  const slides = [Slide1, Slide2, Slide3, Slide4];
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
