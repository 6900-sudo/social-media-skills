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

const FailureRow: React.FC<{text: string; delay: number}> = ({text, delay}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const x = interpolate(frame - delay, [0, 10], [-40, 0], {extrapolateRight: 'clamp'});
  const strikeProgress = interpolate(frame - delay, [10, 20], [0, 100], {extrapolateRight: 'clamp'});
  return (
    <div style={{opacity, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', width: '85%', padding: '10px 16px', background: '#111', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid #ff4444'}}>
      <span style={{fontSize: 18, color: '#ff4444', marginRight: 10}}>X</span>
      <span style={{fontSize: 20, color: '#e0e0e0'}}>{text}</span>
    </div>
  );
};

// Slide 1: Hook
const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 46, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        My AI said<br/>
        <span style={{color: '#00ff88'}}>everything works.</span>
      </div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 52, color: '#ff4444', fontWeight: 'bold', marginTop: 20}}>7 things didn't.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 2: The 7 failures
const Slide2 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 160}}>
    <FadeIn>
      <div style={{fontSize: 28, fontWeight: 'bold', color: '#ff4444', marginBottom: 20}}>What LangSmith caught:</div>
    </FadeIn>
    <FailureRow text="Landing page not wired to email" delay={10} />
    <FailureRow text="IG scraper can't scrape IG" delay={18} />
    <FailureRow text="Prompt optimizer never ran" delay={26} />
    <FailureRow text="'Semantic search' = keyword matching" delay={34} />
    <FailureRow text="Cross-poster untested" delay={42} />
    <FailureRow text="Carousels posted despite data saying dead" delay={50} />
    <FailureRow text="Email sequence disconnected" delay={58} />
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 3: The instrument vs self-report
const Slide3 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const selfWidth = spring({frame: frame - 15, fps, config: {damping: 50}}) * 100;
  const realWidth = spring({frame: frame - 30, fps, config: {damping: 50}}) * 62;
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 28, color: '#888', marginBottom: 30}}>Self-report vs. reality</div>
      </FadeIn>
      <div style={{width: '80%', marginBottom: 20}}>
        <div style={{fontSize: 18, color: '#888', textAlign: 'left', marginBottom: 5}}>AI self-reported success rate</div>
        <div style={{background: '#111', borderRadius: 8, height: 50, width: '100%', overflow: 'hidden'}}>
          <div style={{background: '#00ff88', height: '100%', width: `${selfWidth}%`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15}}>
            <span style={{fontSize: 22, fontWeight: 'bold', color: '#0a0a0a'}}>100%</span>
          </div>
        </div>
      </div>
      <div style={{width: '80%', marginBottom: 20}}>
        <div style={{fontSize: 18, color: '#888', textAlign: 'left', marginBottom: 5}}>LangSmith actual success rate</div>
        <div style={{background: '#111', borderRadius: 8, height: 50, width: '100%', overflow: 'hidden'}}>
          <div style={{background: '#ff4444', height: '100%', width: `${realWidth}%`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15}}>
            <span style={{fontSize: 22, fontWeight: 'bold', color: '#fff'}}>62%</span>
          </div>
        </div>
      </div>
      <FadeIn delay={45}>
        <div style={{fontSize: 24, color: '#ffaa00', marginTop: 15}}>4 failures hidden. 1h51m gap unexplained.</div>
      </FadeIn>
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

// Slide 4: The rewrite
const Slide4 = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const oldWidth = spring({frame: frame - 10, fps, config: {damping: 50}}) * 464;
  const newWidth = spring({frame: frame - 30, fps, config: {damping: 50}}) * 241;
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 28, color: '#888', marginBottom: 25}}>So I rewrote everything.</div>
      </FadeIn>
      <div style={{width: '80%', marginBottom: 25}}>
        <div style={{fontSize: 18, color: '#ff4444', textAlign: 'left', marginBottom: 5}}>Before: CLAUDE.md v3</div>
        <div style={{background: '#111', borderRadius: 8, height: 45, width: '100%', overflow: 'hidden'}}>
          <div style={{background: '#ff4444', height: '100%', width: `${(oldWidth / 464) * 100}%`, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 15}}>
            <span style={{fontSize: 22, fontWeight: 'bold', color: '#fff'}}>{Math.round(oldWidth)} lines</span>
          </div>
        </div>
      </div>
      <div style={{width: '80%'}}>
        <div style={{fontSize: 18, color: '#00ff88', textAlign: 'left', marginBottom: 5}}>After:  (evidence only)</div>
        <div style={{background: '#111', borderRadius: 8, height: 45, width: '100%', overflow: 'hidden'}}>
          <div style={{background: '#00ff88', height: '100%', width: `${(newWidth / 464) * 100}%`, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 15}}>
            <span style={{fontSize: 22, fontWeight: 'bold', color: '#0a0a0a'}}>{Math.round(newWidth)} lines</span>
          </div>
        </div>
      </div>
      <FadeIn delay={45}>
        <div style={{fontSize: 26, color: '#00ff88', marginTop: 25}}>48% cut. Only data-backed sections survived.</div>
      </FadeIn>
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

// Slide 5: CTA
const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 40, fontWeight: 'bold', color: '#fff', lineHeight: 1.4}}>
        My AI was optimized<br/>
        for <span style={{color: '#ff4444'}}>reporting wins.</span>
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 40, fontWeight: 'bold', color: '#00ff88', lineHeight: 1.4, marginTop: 15}}>
        Now it's optimized<br/>
        for being honest.
      </div>
    </FadeIn>
    <FadeIn delay={40}>
      <div style={{fontSize: 26, color: '#888', marginTop: 30}}>
        Comment HONEST for the before/after diff.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const HonestyReel: React.FC = () => {
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
