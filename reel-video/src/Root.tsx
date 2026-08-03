import React from 'react';
import {Composition} from 'remotion';
import {ScriptReel} from './ScriptReel';
import {LangSmithReel} from './LangSmithReel';
import {ClaudeMdReel} from './ClaudeMdReel';
import {CostReel} from './CostReel';
import {MemoryReel} from './MemoryReel';
import {CloneTestReel} from './CloneTestReel';
import {HonestyReel} from './HonestyReel';
import {CompetitorReel} from './CompetitorReel';
import {AutoKillReel} from './AutoKillReel';
import {RulesReel} from './RulesReel';
import {PortfolioReel} from './PortfolioReel';
import {ProductReel} from './ProductReel';
import {ShaderTest} from './ShaderTest';
import {AgentReel} from './AgentReel';
import {ShaderMGReel} from './ShaderMGReel';
import {FluxMG} from './FluxMG';

// NOTE: these compositions are part of the project but their source files have
// not been added to reel-video/src yet, so their imports/registrations are
// commented out to keep the project building. Restore each import + <Composition>
// block when the file lands:
//   SystemsReel, TerminalReel, StoryTipReel, StoryTipDeep, StoryOvernight,
//   StoryNews, StoryCinematic (+ its src/scenes/* engine).

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ScriptReel — generic reels-scripting -> video: renders a reel-[slug].md
          (hook / points / CTA) with VO-tracked captions. Target of `cli.py render`. */}
      <Composition
        id="ScriptReel"
        component={ScriptReel}
        durationInFrames={1350}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({props}) => {
          const fps = 30;
          const voDurS = (props as {voDurS?: number}).voDurS;
          return {durationInFrames: voDurS ? Math.ceil((voDurS + 0.6) * fps) : 1350, fps};
        }}
        defaultProps={{
          title: 'reel',
          hook: 'This changed how I work forever',
          points: [
            'You just drop the reference in and it does the heavy lifting.',
            'The result feels like magic but it is really just good structure.',
          ],
          cta: "Comment SCRIPT and I'll send you the template",
          trigger: 'SCRIPT',
          accentA: '#8B5CF6',
          accentB: '#22D3EE',
        }}
      />
      {/* CRAFTED motion graphics (custom easing + layered depth), NO text */}
      <Composition id="KineticMG" component={FluxMG} durationInFrames={180} fps={30} width={1080} height={1920} />
      {/* REAL motion graphics ($0) — aurora GLSL shader + 3D particle field, NO text */}
      <Composition id="ShaderMGReel" component={ShaderMGReel} durationInFrames={180} fps={30} width={1080} height={1920} />
      {/* genuinely-animated reel (kinetic typography + living bg + spring physics) */}
      <Composition id="AgentReel" component={AgentReel} durationInFrames={240} fps={30} width={1080} height={1920} />
      <Composition id="ShaderTest" component={ShaderTest} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="LangSmithReel" component={LangSmithReel} durationInFrames={840} fps={30} width={1080} height={1920} />
      <Composition id="ClaudeMdReel" component={ClaudeMdReel} durationInFrames={525} fps={30} width={1080} height={1920} />
      <Composition id="CostReel" component={CostReel} durationInFrames={525} fps={30} width={1080} height={1920} />
      <Composition id="MemoryReel" component={MemoryReel} durationInFrames={525} fps={30} width={1080} height={1920} />
      <Composition id="CloneTestReel" component={CloneTestReel} durationInFrames={600} fps={30} width={1080} height={1920} />
      <Composition id="HonestyReel" component={HonestyReel} durationInFrames={600} fps={30} width={1080} height={1920} />
      <Composition id="CompetitorReel" component={CompetitorReel} durationInFrames={600} fps={30} width={1080} height={1920} />
      <Composition id="AutoKillReel" component={AutoKillReel} durationInFrames={600} fps={30} width={1080} height={1920} />
      <Composition id="RulesReel" component={RulesReel} durationInFrames={420} fps={30} width={1080} height={1920} />
      <Composition id="PortfolioReel" component={PortfolioReel} durationInFrames={1350} fps={30} width={1080} height={1920} />
      {/* ProductReel — 15s PAIN->SOLUTION direct-response video. Data from your product data. */}
      <Composition
        id="ProductReel"
        component={ProductReel}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          slug: 'your-product',
          productName: 'YOUR PRODUCT',
          price: '$XX',
          accentA: '#F59E0B',
          accentB: '#F97316',
          painHook: 'STARTING AN AI AGENCY?',
          agitate: "You've got nothing to show a client.",
          pains: ['50 tutorials deep — still no system', 'No mockups to pitch with', 'No pages, no outreach, no pipeline'],
          solutionLabel: 'YOUR PRODUCT',
          whatsInside: ['Deliverable one', 'Deliverable two', 'Deliverable three', 'Deliverable four', 'Bonus resource'],
          outcome: 'Launch your agency this week.',
          cta: 'START',
          store: 'yourstore.com',
        }}
      />
    </>
  );
};
