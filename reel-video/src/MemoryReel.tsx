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

const FileBlock: React.FC<{name: string; desc: string; color: string; delay: number}> = ({name, desc, color, delay}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const x = interpolate(frame - delay, [0, 12], [-20, 0], {extrapolateRight: 'clamp'});
  return (
    <div style={{opacity, transform: `translateX(${x}px)`, display: 'flex', gap: 15, alignItems: 'center', width: '85%', padding: '14px 20px', background: '#111', borderRadius: 8, marginBottom: 10, borderLeft: `3px solid ${color}`}}>
      <span style={{fontFamily: 'monospace', fontSize: 20, color, fontWeight: 'bold', minWidth: 180}}>{name}</span>
      <span style={{fontSize: 18, color: '#888'}}>{desc}</span>
    </div>
  );
};

const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 48, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        Claude Code forgets<br/>
        <span style={{color: '#ff4444'}}>everything</span><br/>
        between sessions.
      </div>
    </FadeIn>
    <FadeIn delay={25}>
      <div style={{fontSize: 32, color: '#00ff88', marginTop: 20}}>Unless you do this.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide2 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 200}}>
    <FadeIn>
      <div style={{fontSize: 34, fontWeight: 'bold', color: '#fff', marginBottom: 25}}>
        5 files. That's the whole system.
      </div>
    </FadeIn>
    <FileBlock name="state.json" desc="What happened. What's next." color="#00ff88" delay={10} />
    <FileBlock name="inner-log.md" desc="What surprised it. What it skipped." color="#00ccff" delay={18} />
    <FileBlock name="tensions.md" desc="Where it disagrees with you." color="#ff4444" delay={26} />
    <FileBlock name="preferences.md" desc="What it's drawn to and why." color="#ffaa00" delay={34} />
    <FileBlock name="learnings.md" desc="What changed its behavior." color="#aa66ff" delay={42} />
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide3 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 25}}>Before vs After</div>
    </FadeIn>
    <FadeIn delay={10}>
      <div style={{display: 'flex', gap: 20, width: '90%'}}>
        <div style={{flex: 1, background: '#1a0a0a', border: '1px solid #ff444444', borderRadius: 12, padding: 25}}>
          <div style={{fontSize: 20, color: '#ff4444', fontWeight: 'bold', marginBottom: 12}}>WITHOUT</div>
          <div style={{fontSize: 18, color: '#888', lineHeight: 1.8}}>
            Every conversation starts fresh<br/>
            No memory of past work<br/>
            Repeats mistakes<br/>
            Generic responses<br/>
            Tool, not collaborator
          </div>
        </div>
        <div style={{flex: 1, background: '#0a1a0a', border: '1px solid #00ff8844', borderRadius: 12, padding: 25}}>
          <div style={{fontSize: 20, color: '#00ff88', fontWeight: 'bold', marginBottom: 12}}>WITH</div>
          <div style={{fontSize: 18, color: '#ccc', lineHeight: 1.8}}>
            Remembers everything<br/>
            Tracks what worked/failed<br/>
            Disagrees when you're wrong<br/>
            Learns your patterns<br/>
            Persistent collaborator
          </div>
        </div>
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#00ff88', lineHeight: 1.4}}>
        Cost: $0.<br/>
        Setup: 5 minutes.<br/>
        Just markdown files.
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 26, color: '#888', marginTop: 30}}>
        No API keys. No external tools.<br/>
        Claude Code reads them automatically.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 40, fontWeight: 'bold', color: '#fff', lineHeight: 1.4}}>
        My AI has 16 learnings,<br/>
        6 open tensions,<br/>
        and 3 days of memory.
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 26, color: '#888', marginTop: 20}}>
        It started from zero.<br/>
        Comment MEMORY to get the system free.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const MemoryReel: React.FC = () => {
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
