import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';

// Brand brand colors
const PURPLE = '#7C3AED';
const CYAN = '#22D3EE';
const BG = '#080810';
const WHITE = '#FFFFFF';
const DIM = '#888';
const SUBTLE = '#1a1a2e';

const base: React.CSSProperties = {
  background: BG,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: "'Segoe UI', sans-serif",
  padding: 60,
  textAlign: 'center',
};

// --- Utility Components ---

const FadeIn: React.FC<{children: React.ReactNode; delay?: number; duration?: number}> = ({
  children, delay = 0, duration = 18,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const y = interpolate(frame - delay, [0, duration], [30, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return <div style={{opacity, transform: `translateY(${y}px)`}}>{children}</div>;
};

const CountUp: React.FC<{value: number; prefix?: string; suffix?: string; color?: string; size?: number}> = ({
  value, prefix = '', suffix = '', color = CYAN, size = 72,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 50, stiffness: 60}});
  const current = Math.round(value * progress);
  return (
    <div style={{fontSize: size, fontWeight: 'bold', color, fontFamily: 'monospace'}}>
      {prefix}{current.toLocaleString()}{suffix}
    </div>
  );
};

const GlowText: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({
  children, color = PURPLE, size = 56,
}) => (
  <div style={{
    fontSize: size,
    fontWeight: 'bold',
    color,
    textShadow: `0 0 40px ${color}66, 0 0 80px ${color}33`,
  }}>
    {children}
  </div>
);

const PurpleLine: React.FC<{width?: number}> = ({width = 120}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = spring({frame, fps, config: {damping: 30}}) * width;
  return (
    <div style={{
      width: w,
      height: 4,
      background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
      borderRadius: 2,
      margin: '16px auto',
    }} />
  );
};

const Watermark = () => (
  <div style={{position: 'absolute', bottom: 40, color: '#333', fontSize: 20}}>
    yoursite.com
  </div>
);

// --- Slide 1: Title Card (frames 0-90) ---
const TitleCard = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <GlowText color={PURPLE} size={28}>YOUR BRAND</GlowText>
    </FadeIn>
    <PurpleLine width={200} />
    <FadeIn delay={15}>
      <div style={{fontSize: 64, fontWeight: 'bold', color: WHITE, lineHeight: 1.2, marginTop: 10}}>
        248 Websites.
      </div>
    </FadeIn>
    <FadeIn delay={30}>
      <div style={{fontSize: 64, fontWeight: 'bold', color: CYAN, lineHeight: 1.2}}>
        One System.
      </div>
    </FadeIn>
    <FadeIn delay={50}>
      <div style={{fontSize: 24, color: DIM, marginTop: 24}}>
        AI-built. Human-closed.
      </div>
    </FadeIn>
    <Watermark />
  </AbsoluteFill>
);

// --- Slide 2: Stat Counter (frames 90-180) ---
const StatCounter = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 28, color: DIM, marginBottom: 30}}>The numbers so far:</div>
    </FadeIn>
    <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
      <div>
        <CountUp value={857} suffix=" Leads" color={CYAN} size={64} />
      </div>
      <div>
        <CountUp value={3} suffix=" Counties" color={PURPLE} size={64} />
      </div>
      <div>
        <CountUp value={25} suffix=" Industries" color={WHITE} size={64} />
      </div>
    </div>
    <FadeIn delay={40}>
      <div style={{fontSize: 22, color: DIM, marginTop: 30}}>All from one automated pipeline.</div>
    </FadeIn>
    <Watermark />
  </AbsoluteFill>
);

// --- Slide 3: Portfolio Grid (frames 180-360) ---
const BUSINESSES = [
  {name: 'Elite Plumbing Co', industry: 'Plumbing', color: '#3B82F6'},
  {name: 'Iron Forge Gym', industry: 'Fitness', color: '#EF4444'},
  {name: 'Fresh Roots Landscaping', industry: 'Landscaping', color: '#22C55E'},
  {name: 'Bright Smile Dental', industry: 'Dental', color: '#06B6D4'},
  {name: 'Summit Roofing LLC', industry: 'Roofing', color: '#F59E0B'},
  {name: 'Zen Flow Yoga', industry: 'Wellness', color: '#A855F7'},
  {name: 'Rapid Auto Repair', industry: 'Auto', color: '#EC4899'},
  {name: 'Golden Crust Bakery', industry: 'Food', color: '#F97316'},
  {name: 'Clear View Windows', industry: 'Cleaning', color: '#14B8A6'},
  {name: 'Atlas Law Group', industry: 'Legal', color: '#6366F1'},
  {name: 'Comfort HVAC Pros', industry: 'HVAC', color: '#0EA5E9'},
  {name: 'Pine Valley Realty', industry: 'Real Estate', color: '#84CC16'},
];

const MockupCard: React.FC<{biz: typeof BUSINESSES[0]; delay: number; index: number}> = ({biz, delay, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame: frame - delay, fps, config: {damping: 20, stiffness: 100}});
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <div style={{
      opacity,
      transform: `scale(${Math.min(scale, 1)})`,
      width: 280,
      height: 180,
      background: SUBTLE,
      borderRadius: 12,
      border: `2px solid ${biz.color}44`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      overflow: 'hidden',
    }}>
      <div style={{width: 40, height: 40, borderRadius: 8, background: biz.color, marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 20, color: WHITE, fontWeight: 'bold'}}>
        {biz.name[0]}
      </div>
      <div style={{fontSize: 16, fontWeight: 'bold', color: WHITE, marginBottom: 4}}>{biz.name}</div>
      <div style={{fontSize: 12, color: biz.color, textTransform: 'uppercase', letterSpacing: 1}}>{biz.industry}</div>
    </div>
  );
};

const PortfolioGrid = () => (
  <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 120}}>
    <FadeIn>
      <div style={{fontSize: 32, fontWeight: 'bold', color: WHITE, marginBottom: 8}}>Built for every industry</div>
      <div style={{fontSize: 20, color: DIM, marginBottom: 30}}>Each one AI-generated in under 60 seconds</div>
    </FadeIn>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16,
      width: '100%',
      maxWidth: 960,
    }}>
      {BUSINESSES.map((biz, i) => (
        <MockupCard key={i} biz={biz} delay={10 + i * 6} index={i} />
      ))}
    </div>
    <Watermark />
  </AbsoluteFill>
);

// --- Slide 4: Before/After (frames 360-540) ---
const BeforeAfter = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slideProgress = spring({frame: Math.max(0, frame - 30), fps, config: {damping: 30}});
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 32, fontWeight: 'bold', color: WHITE, marginBottom: 40}}>The transformation</div>
      </FadeIn>
      <div style={{display: 'flex', gap: 40, alignItems: 'center'}}>
        {/* Before */}
        <FadeIn delay={10}>
          <div style={{
            width: 380,
            height: 500,
            background: '#111',
            borderRadius: 16,
            border: '2px solid #333',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
          }}>
            <div style={{fontSize: 60, marginBottom: 16}}>X</div>
            <div style={{fontSize: 24, fontWeight: 'bold', color: '#ff4444', marginBottom: 10}}>BEFORE</div>
            <div style={{fontSize: 18, color: '#666', lineHeight: 1.6, textAlign: 'center'}}>
              No website<br/>
              No online presence<br/>
              Lost leads daily<br/>
              Word of mouth only
            </div>
          </div>
        </FadeIn>
        {/* Arrow */}
        <FadeIn delay={40}>
          <div style={{
            fontSize: 48,
            color: CYAN,
            opacity: slideProgress,
            transform: `translateX(${(1 - slideProgress) * -20}px)`,
          }}>
            &rarr;
          </div>
        </FadeIn>
        {/* After */}
        <FadeIn delay={50}>
          <div style={{
            width: 380,
            height: 500,
            background: SUBTLE,
            borderRadius: 16,
            border: `2px solid ${PURPLE}`,
            boxShadow: `0 0 40px ${PURPLE}33`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
          }}>
            <div style={{fontSize: 60, marginBottom: 16, filter: 'grayscale(0)'}}>&#10003;</div>
            <div style={{fontSize: 24, fontWeight: 'bold', color: '#22C55E', marginBottom: 10}}>AFTER</div>
            <div style={{fontSize: 18, color: '#ccc', lineHeight: 1.6, textAlign: 'center'}}>
              Professional website<br/>
              Google-indexed<br/>
              Lead capture form<br/>
              Automated follow-up
            </div>
          </div>
        </FadeIn>
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// --- Slide 5: Pipeline Visualization (frames 540-720) ---
const PIPELINE_STEPS = [
  {label: 'Scrape', icon: '&#128269;', desc: 'Find businesses without sites'},
  {label: 'Build', icon: '&#9889;', desc: 'AI generates the website'},
  {label: 'Send', icon: '&#9993;', desc: 'Cold outreach with preview'},
  {label: 'Follow Up', icon: '&#128257;', desc: 'Automated 3-touch sequence'},
  {label: 'Close', icon: '&#128176;', desc: '$500/site, recurring revenue'},
];

const PipelineViz = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 180}}>
      <FadeIn>
        <div style={{fontSize: 32, fontWeight: 'bold', color: WHITE, marginBottom: 12}}>The Pipeline</div>
        <div style={{fontSize: 20, color: DIM, marginBottom: 40}}>Fully automated. End to end.</div>
      </FadeIn>
      <div style={{display: 'flex', flexDirection: 'column', gap: 20, width: '85%'}}>
        {PIPELINE_STEPS.map((step, i) => {
          const delay = 15 + i * 18;
          const progress = spring({frame: Math.max(0, frame - delay), fps, config: {damping: 25, stiffness: 120}});
          const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
          const barWidth = progress * 100;
          return (
            <div key={i} style={{opacity}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6}}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12,
                  background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: 24, color: WHITE,
                }} dangerouslySetInnerHTML={{__html: step.icon}} />
                <div>
                  <div style={{fontSize: 24, fontWeight: 'bold', color: WHITE}}>{step.label}</div>
                  <div style={{fontSize: 16, color: DIM}}>{step.desc}</div>
                </div>
              </div>
              <div style={{height: 6, background: '#1a1a2e', borderRadius: 3, overflow: 'hidden'}}>
                <div style={{
                  height: '100%',
                  width: `${barWidth}%`,
                  background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
                  borderRadius: 3,
                }} />
              </div>
            </div>
          );
        })}
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// --- Slide 6: ROI Stats (frames 720-900) ---
const ROIStats = () => (
  <AbsoluteFill style={base}>
    <FadeIn>
      <div style={{fontSize: 28, color: DIM, marginBottom: 20}}>The math is stupid simple:</div>
    </FadeIn>
    <FadeIn delay={15}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 30,
      }}>
        <GlowText color={CYAN} size={52}>$500</GlowText>
        <div style={{fontSize: 36, color: DIM}}>&rarr;</div>
        <GlowText color={'#22C55E'} size={52}>$23,400/yr</GlowText>
      </div>
    </FadeIn>
    <FadeIn delay={35}>
      <div style={{
        fontSize: 80,
        fontWeight: 'bold',
        color: PURPLE,
        textShadow: `0 0 60px ${PURPLE}55`,
        fontFamily: 'monospace',
      }}>
        46x ROI
      </div>
    </FadeIn>
    <PurpleLine width={300} />
    <FadeIn delay={55}>
      <div style={{fontSize: 22, color: DIM, marginTop: 10, lineHeight: 1.6}}>
        Per client. Per year.<br/>
        Infrastructure cost: ~$20/month.
      </div>
    </FadeIn>
    <Watermark />
  </AbsoluteFill>
);

// --- Slide 7: Social Proof (frames 900-1080) ---
const SocialProof = () => {
  const stats = [
    {label: 'Websites Built', value: '248', color: CYAN},
    {label: 'Leads Generated', value: '857', color: PURPLE},
    {label: 'Avg Response Rate', value: '12%', color: '#22C55E'},
    {label: 'Close Rate', value: '8.5%', color: '#F59E0B'},
    {label: 'Revenue Pipeline', value: '$42K', color: CYAN},
  ];
  return (
    <AbsoluteFill style={{...base, justifyContent: 'flex-start', paddingTop: 180}}>
      <FadeIn>
        <div style={{fontSize: 32, fontWeight: 'bold', color: WHITE, marginBottom: 8}}>Real results</div>
        <div style={{fontSize: 20, color: DIM, marginBottom: 30}}>From a one-person operation with AI</div>
      </FadeIn>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: '80%'}}>
        {stats.map((stat, i) => {
          const frame = useCurrentFrame();
          const delay = 12 + i * 12;
          const opacity = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
          const x = interpolate(frame - delay, [0, 12], [-40, 0], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
          return (
            <div key={i} style={{
              opacity,
              transform: `translateX(${x}px)`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              background: SUBTLE,
              borderRadius: 12,
              borderLeft: `4px solid ${stat.color}`,
            }}>
              <div style={{fontSize: 22, color: '#ccc'}}>{stat.label}</div>
              <div style={{fontSize: 32, fontWeight: 'bold', color: stat.color, fontFamily: 'monospace'}}>{stat.value}</div>
            </div>
          );
        })}
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

// --- Slide 8: CTA (frames 1080-1200) ---
const CTASlide = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = Math.sin(frame / 15) * 0.03 + 1;
  const btnScale = spring({frame: Math.max(0, frame - 30), fps, config: {damping: 12, stiffness: 80}});
  return (
    <AbsoluteFill style={base}>
      <FadeIn>
        <div style={{fontSize: 28, color: DIM, marginBottom: 16}}>Want to see what your competitors have?</div>
      </FadeIn>
      <FadeIn delay={15}>
        <div style={{fontSize: 52, fontWeight: 'bold', color: WHITE, lineHeight: 1.3, marginBottom: 30}}>
          Get Your Free<br/>
          <span style={{color: CYAN}}>Website Preview</span>
        </div>
      </FadeIn>
      <div style={{
        transform: `scale(${btnScale * pulse})`,
        background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
        padding: '24px 60px',
        borderRadius: 16,
        fontSize: 28,
        fontWeight: 'bold',
        color: WHITE,
        boxShadow: `0 0 40px ${PURPLE}55, 0 0 80px ${CYAN}33`,
        marginBottom: 20,
      }}>
        DM &quot;WEBSITE&quot; to start
      </div>
      <FadeIn delay={50}>
        <div style={{fontSize: 20, color: DIM, marginTop: 10}}>
          No commitment. See your site in 24 hours.
        </div>
      </FadeIn>
      <Watermark />
    </AbsoluteFill>
  );
};

// --- Slide 9: Logo Outro (frames 1200-1350) ---
const LogoOutro = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 15, stiffness: 60}});
  const glowIntensity = interpolate(frame, [0, 60, 90, 120], [0, 1, 0.7, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...base, justifyContent: 'center'}}>
      <div style={{
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 140,
          height: 140,
          borderRadius: 28,
          background: `linear-gradient(135deg, ${PURPLE}, ${CYAN})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 72,
          fontWeight: 'bold',
          color: WHITE,
          boxShadow: `0 0 ${60 * glowIntensity}px ${PURPLE}66, 0 0 ${120 * glowIntensity}px ${CYAN}33`,
          marginBottom: 30,
        }}>
          F
        </div>
        <div style={{
          fontSize: 44,
          fontWeight: 'bold',
          color: WHITE,
          letterSpacing: 2,
          marginBottom: 8,
        }}>
          YOUR BRAND
        </div>
        <div style={{
          fontSize: 22,
          color: PURPLE,
          letterSpacing: 6,
          textTransform: 'uppercase',
          marginBottom: 30,
        }}>
          Agency
        </div>
        <PurpleLine width={250} />
        <FadeIn delay={30}>
          <div style={{
            fontSize: 26,
            color: CYAN,
            marginTop: 20,
            fontFamily: 'monospace',
          }}>
            yoursite.com
          </div>
        </FadeIn>
        <FadeIn delay={45}>
          <div style={{fontSize: 20, color: DIM, marginTop: 16}}>
            AI-powered websites for local businesses
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};

// --- Main Composition ---
const SLIDES: {component: React.FC; from: number; duration: number}[] = [
  {component: TitleCard, from: 0, duration: 90},
  {component: StatCounter, from: 90, duration: 90},
  {component: PortfolioGrid, from: 180, duration: 180},
  {component: BeforeAfter, from: 360, duration: 180},
  {component: PipelineViz, from: 540, duration: 180},
  {component: ROIStats, from: 720, duration: 180},
  {component: SocialProof, from: 900, duration: 180},
  {component: CTASlide, from: 1080, duration: 120},
  {component: LogoOutro, from: 1200, duration: 150},
];

export const PortfolioReel: React.FC = () => {
  return (
    <AbsoluteFill style={{background: BG}}>
      {SLIDES.map((slide, i) => {
        const S = slide.component;
        return (
          <Sequence key={i} from={slide.from} durationInFrames={slide.duration}>
            <S />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
