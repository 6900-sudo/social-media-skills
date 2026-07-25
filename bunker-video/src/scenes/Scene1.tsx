import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";
import {
  SafeFrame,
  Header,
  Rise,
  CountUp,
  DrawPath,
  useEnter,
} from "../components";

// Scene 1 — Hook: "The 72-Hour Rule" with an underground bunker cross-section.
export const Scene1: React.FC = () => {
  const shield = useEnter(30, 12);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <SafeFrame>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <Header kicker="Survival Basics" title={"The 72-Hour\nRule".replace("\n", " ")} />

          {/* Bunker cross-section diagram */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg width={760} height={620} viewBox="0 0 760 620">
              {/* Sky / ground line */}
              <DrawPath
                d="M40 190 L720 190"
                length={680}
                delay={18}
                duration={30}
                stroke={COLORS.muted}
                strokeWidth={6}
              />
              {/* Dirt hatching above room */}
              <DrawPath
                d="M120 190 L160 150 M240 190 L280 150 M360 190 L400 150 M480 190 L520 150 M600 190 L640 150"
                length={310}
                delay={26}
                duration={30}
                stroke="#3f3f46"
                strokeWidth={5}
              />

              {/* Bunker room box */}
              <DrawPath
                d="M180 260 L580 260 L580 540 L180 540 Z"
                length={1360}
                delay={30}
                duration={55}
                stroke={COLORS.accent}
                strokeWidth={9}
              />

              {/* Hatch on top */}
              <DrawPath
                d="M340 260 L340 190 L420 190 L420 260"
                length={230}
                delay={48}
                duration={28}
                stroke={COLORS.accentSoft}
                strokeWidth={8}
              />

              {/* Ladder down into room */}
              <DrawPath
                d="M368 200 L368 470 M392 200 L392 470 M368 240 L392 240 M368 290 L392 290 M368 340 L392 340 M368 390 L392 390 M368 440 L392 440"
                length={1200}
                delay={62}
                duration={40}
                stroke={COLORS.success}
                strokeWidth={5}
              />

              {/* Supply shelves inside */}
              <DrawPath
                d="M210 500 L300 500 M210 500 L210 460 L300 460 L300 500 M225 460 L225 440 L245 440 L245 460 M260 460 L260 435 L282 435 L282 460"
                length={520}
                delay={78}
                duration={35}
                stroke={COLORS.muted}
                strokeWidth={5}
              />
              {/* Water barrel inside */}
              <DrawPath
                d="M490 500 L540 500 L540 445 L490 445 Z M490 465 L540 465"
                length={330}
                delay={86}
                duration={30}
                stroke={COLORS.accentSoft}
                strokeWidth={5}
              />
            </svg>
          </div>

          {/* Clock count-up + explanation */}
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <Rise delay={70} distance={30}>
              <div
                style={{
                  fontSize: 150,
                  fontWeight: 800,
                  color: COLORS.success,
                  lineHeight: 1,
                }}
              >
                <CountUp from={0} to={72} delay={72} duration={50} />
                <span style={{ fontSize: 64, color: COLORS.white }}> hrs</span>
              </div>
            </Rise>
            <Rise delay={92} distance={24}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  color: COLORS.muted,
                  marginTop: 10,
                  maxWidth: 820,
                  marginInline: "auto",
                  lineHeight: 1.3,
                }}
              >
                When disaster hits, help can take days. A bunker buys you time.
              </div>
            </Rise>
          </div>

          {/* Floating shield accent */}
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 4,
              transform: `scale(${shield})`,
              opacity: shield,
            }}
          >
            <svg width={90} height={90} viewBox="0 0 90 90">
              <path
                d="M45 8 L78 20 V46 C78 66 63 78 45 84 C27 78 12 66 12 46 V20 Z"
                fill="none"
                stroke={COLORS.accent}
                strokeWidth={6}
                strokeLinejoin="round"
              />
              <path
                d="M31 45 L41 55 L60 33"
                fill="none"
                stroke={COLORS.success}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </SafeFrame>
    </AbsoluteFill>
  );
};
