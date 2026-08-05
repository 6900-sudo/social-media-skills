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

const CountUp: React.FC<{value: number; prefix?: string; suffix?: string; color?: string; size?: number; decimals?: number}> = ({
  value, prefix = '', suffix = '', color = '#00ff88', size = 80, decimals = 0,
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

// Slide 1: Hook — the contradiction
const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        Full automation.
      </div>
    </FadeIn>
    <FadeIn delay={15}>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#00ff88', lineHeight: 1.3}}>
        3 posts a day.
      </div>
    </FadeIn>
    <FadeIn delay={30}>
      <div style={{fontSize: 52, fontWeight: 'bold', color: '#ff4444', lineHeight: 1.3, marginTop: 10}}>
        -3 followers a day.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 2: The metrics going wrong
const Slide2 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // Engagement bar shrinking
  const engWidth = 100 - spring({frame: frame - 10, fps, config: {damping: 30}}) * 75;
  // Follower count going down
  const followerDelta = spring({frame: frame - 20, fps, config: {damping: 50}}) * -3;
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 26, color: '#888', marginBottom: 25}}>What the auto-poster did:</div>
      </FadeIn>
      <div style={{width: '80%', marginBottom: 20}}>
        <div style={{fontSize: 16, color: '#888', textAlign: 'left', marginBottom: 5}}>Engagement rate</div>
        <div style={{background: '#111', borderRadius: 8, height: 40, width: '100%', overflow: 'hidden'}}>
          <div style={{background: '#ff4444', height: '100%', width: `${engWidth}%`, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 12, transition: 'width 0.5s'}}>
            <span style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>0.24%</span>
          </div>
        </div>
      </div>
      <div style={{width: '80%', marginBottom: 20}}>
        <div style={{fontSize: 16, color: '#888', textAlign: 'left', marginBottom: 5}}>Avg reach per post</div>
        <FadeIn delay={15}><CountUp value={70} suffix=" " color="#ff4444" size={50} /></FadeIn>
      </div>
      <div style={{width: '80%'}}>
        <div style={{fontSize: 16, color: '#888', textAlign: 'left', marginBottom: 5}}>Followers per day</div>
        <FadeIn delay={25}>
          <div style={{fontSize: 60, fontWeight: 'bold', color: '#ff4444', fontFamily: 'monospace'}}>
            {followerDelta.toFixed(0)}
          </div>
        </FadeIn>
      </div>
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

// Slide 3: The kill
const Slide3 = () => {
  const frame = useCurrentFrame();
  const strikeWidth = interpolate(frame, [20, 40], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 30, color: '#888', marginBottom: 20}}>Decision:</div>
      </FadeIn>
      <FadeIn delay={10}>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <div style={{fontSize: 50, fontWeight: 'bold', color: '#666'}}>AUTO-POSTER</div>
          <div style={{position: 'absolute', top: '50%', left: 0, height: 4, background: '#ff4444', width: `${strikeWidth}%`, transform: 'translateY(-50%)'}} />
        </div>
      </FadeIn>
      <FadeIn delay={40}>
        <div style={{fontSize: 60, fontWeight: 'bold', color: '#ff4444', marginTop: 20}}>KILLED</div>
      </FadeIn>
      <FadeIn delay={55}>
        <div style={{fontSize: 22, color: '#888', marginTop: 15}}>Uptime is not success.<br/>Measure outcomes.</div>
      </FadeIn>
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

// Slide 4: The pivot result
const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 26, color: '#888', marginBottom: 15}}>Pivoted to reels:</div>
    </FadeIn>
    <FadeIn delay={10}>
      <CountUp value={4.5} suffix="x" color="#00ff88" size={100} decimals={1} />
    </FadeIn>
    <FadeIn delay={15}>
      <div style={{fontSize: 22, color: '#888'}}>better engagement</div>
    </FadeIn>
    <FadeIn delay={30}>
      <div style={{display: 'flex', gap: 20, marginTop: 30}}>
        <div style={{background: '#111', border: '1px solid #ff4444', borderRadius: 12, padding: '15px 25px'}}>
          <div style={{fontSize: 14, color: '#ff4444'}}>Before</div>
          <div style={{fontSize: 28, fontWeight: 'bold', color: '#ff4444'}}>0.24%</div>
        </div>
        <div style={{background: '#111', border: '1px solid #00ff88', borderRadius: 12, padding: '15px 25px'}}>
          <div style={{fontSize: 14, color: '#00ff88'}}>After</div>
          <div style={{fontSize: 28, fontWeight: 'bold', color: '#00ff88'}}>1.08%</div>
        </div>
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 5: CTA
const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 38, fontWeight: 'bold', color: '#fff', lineHeight: 1.4}}>
        Sometimes the best automation<br/>
        is knowing when to<br/>
        <span style={{color: '#ff4444'}}>stop automating.</span>
      </div>
    </FadeIn>
    <FadeIn delay={30}>
      <div style={{fontSize: 26, color: '#888', marginTop: 30}}>
        Comment AUTO for the full story.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const AutoKillReel: React.FC = () => {
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
