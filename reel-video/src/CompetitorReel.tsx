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
  value, suffix = '', color = '#00ff88', size = 80,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 50, stiffness: 80}});
  const current = value >= 1000 ? `${(value * progress / 1000).toFixed(0)}K` : Math.round(value * progress).toString();
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

const CompetitorRow: React.FC<{handle: string; followers: string; color: string; delay: number; barWidth: number}> = ({handle, followers, color, delay, barWidth}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const {fps} = useVideoConfig();
  const width = spring({frame: frame - delay, fps, config: {damping: 40}}) * barWidth;
  return (
    <div style={{opacity, width: '85%', marginBottom: 10}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 3}}>
        <span style={{fontSize: 18, color: '#e0e0e0'}}>@{handle}</span>
        <span style={{fontSize: 18, color, fontFamily: 'monospace', fontWeight: 'bold'}}>{followers}</span>
      </div>
      <div style={{background: '#111', borderRadius: 6, height: 24, width: '100%', overflow: 'hidden'}}>
        <div style={{background: color, height: '100%', width: `${width}%`, borderRadius: 6, transition: 'width 0.3s'}} />
      </div>
    </div>
  );
};

// Slide 1: Hook
const Slide1 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 48, fontWeight: 'bold', color: '#fff', lineHeight: 1.3}}>
        I scraped the top<br/>
        <span style={{color: '#00ccff'}}>8 AI creators.</span>
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 30, color: '#888', marginTop: 20}}>Real data. Not estimates.</div>
    </FadeIn>
    <FadeIn delay={35}>
      <div style={{fontSize: 22, color: '#666', marginTop: 10}}>Apify Instagram Scraper — actual profile data</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 2: The leaderboard
const Slide2 = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 140}}>
    <FadeIn>
      <div style={{fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 20}}>AI Creator Leaderboard</div>
    </FadeIn>
    <CompetitorRow handle="creator_one" followers="1.26M" color="#00ff88" delay={8} barWidth={100} />
    <CompetitorRow handle="creator_two" followers="550K" color="#00ff88" delay={14} barWidth={44} />
    <CompetitorRow handle="creator_three" followers="426K" color="#00ccff" delay={20} barWidth={34} />
    <CompetitorRow handle="creator_four" followers="328K" color="#00ccff" delay={26} barWidth={26} />
    <CompetitorRow handle="creator_five" followers="156K" color="#ffaa00" delay={32} barWidth={12} />
    <CompetitorRow handle="creator_six" followers="108K" color="#ffaa00" delay={38} barWidth={9} />
    <CompetitorRow handle="creator_seven" followers="35K" color="#ffaa00" delay={44} barWidth={3} />
    <CompetitorRow handle="yourhandle" followers="1.5K" color="#ff4444" delay={52} barWidth={0.5} />
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 3: What they all do
const Slide3 = () => {
  const items = [
    {text: 'Free courses as lead magnets', delay: 10},
    {text: 'Comment CTAs on EVERY post', delay: 18},
    {text: 'Sub-30 second reels', delay: 26},
    {text: 'Zero hashtags on best content', delay: 34},
    {text: 'Daily posting minimum', delay: 42},
  ];
  return (
    <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 200}}>
      <FadeIn>
        <div style={{fontSize: 28, fontWeight: 'bold', color: '#00ff88', marginBottom: 25}}>What 550K+ accounts ALL do:</div>
      </FadeIn>
      {items.map((item, i) => {
        const frame = useCurrentFrame();
        const opacity = interpolate(frame - item.delay, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
        const x = interpolate(frame - item.delay, [0, 10], [-30, 0], {extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{opacity, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', width: '80%', padding: '12px 16px', background: '#111', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid #00ff88'}}>
            <span style={{fontSize: 22, color: '#00ff88', marginRight: 12}}>+</span>
            <span style={{fontSize: 22, color: '#e0e0e0'}}>{item.text}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
    </AbsoluteFill>
  );
};

// Slide 4: The gap
const Slide4 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 26, color: '#888', marginBottom: 10}}>The gap nobody fills:</div>
    </FadeIn>
    <FadeIn delay={15}>
      <div style={{fontSize: 44, fontWeight: 'bold', color: '#ffaa00', lineHeight: 1.3, padding: '20px', borderLeft: '4px solid #ffaa00'}}>
        Build-in-public<br/>
        AI automation.
      </div>
    </FadeIn>
    <FadeIn delay={35}>
      <div style={{fontSize: 24, color: '#888', marginTop: 20, lineHeight: 1.5}}>
        Everyone <span style={{color: '#ff4444'}}>teaches</span> AI.<br/>
        Nobody <span style={{color: '#00ff88'}}>shows the servers running.</span><br/>
        The scripts. The failures. The costs.
      </div>
    </FadeIn>
    <FadeIn delay={55}>
      <div style={{fontSize: 22, color: '#666', marginTop: 15}}>That's the lane.</div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

// Slide 5: CTA
const Slide5 = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 38, fontWeight: 'bold', color: '#fff', lineHeight: 1.4}}>
        <span style={{color: '#ff4444'}}>1,500</span> followers<br/>
        vs <span style={{color: '#00ff88'}}>550,000.</span>
      </div>
    </FadeIn>
    <FadeIn delay={20}>
      <div style={{fontSize: 30, color: '#888', marginTop: 15}}>
        But I have the data<br/>they don't show.
      </div>
    </FadeIn>
    <FadeIn delay={40}>
      <div style={{fontSize: 26, color: '#00ccff', marginTop: 30}}>
        Comment SCRAPE for the full breakdown.
      </div>
    </FadeIn>
    <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>@yourhandle</div>
  </AbsoluteFill>
);

export const CompetitorReel: React.FC = () => {
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
