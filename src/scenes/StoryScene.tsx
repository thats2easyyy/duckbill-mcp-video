import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { ChatInterface } from "../components/ChatInterface";
import { MessageBubble } from "../components/MessageBubble";
import { ToolCallChip } from "../components/ToolCallChip";
import { CallStatusChip } from "../components/CallStatusChip";
import {
  EXCHANGES,
  computeStoryPhaseTiming,
} from "../lib/exchanges";
import { lightMode } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";
import { springPresets } from "../lib/timing";

loadBrandFonts();

// Pre-compute phase timings (deterministic, no hooks needed)
const exchange = EXCHANGES[0];
const timing = computeStoryPhaseTiming(exchange);

const CROSSFADE_FRAMES = 20;

/**
 * Highlight "@Duckbill" mentions in user text with bold styling.
 */
function highlightDuckbill(text: string): React.ReactNode {
  const parts = text.split("@Duckbill");
  if (parts.length === 1) return text;

  return parts.reduce<React.ReactNode[]>((acc, part, i) => {
    if (i > 0) {
      acc.push(
        <span key={`db-${i}`} style={{ fontWeight: 500 }}>
          @Duckbill
        </span>
      );
    }
    if (part) acc.push(part);
    return acc;
  }, []);
}

/**
 * ChipSlot — spring-animated height wrapper that prevents layout shift.
 *
 * Before startFrame the slot has height 0 and is invisible.
 * At startFrame it springs open to `height` px so the flex column
 * expands smoothly rather than jumping.
 */
const ChipSlot: React.FC<{
  startFrame: number;
  height?: number;
  children: React.ReactNode;
}> = ({ startFrame, height = 48, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < -1) return null; // Mount 1 frame early so spring starts at 0

  const heightProgress = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: springPresets.snappy,
  });

  const currentHeight = interpolate(heightProgress, [0, 1], [0, height], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        height: currentHeight,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
};

/**
 * StoryScene — 615 frames (20.5s at 30fps).
 *
 * Opens mid-conversation with a pre-rendered AI research response,
 * streams in a follow-up action, zooms the camera in, shows a tool-call
 * chip with shimmer, runs the phone call, emphasizes a human is handling
 * the task, and streams the Duckbill result.
 *
 * Phases:
 *   1. Pre-rendered chat (0–59)    — user prompt + AI response fully visible
 *   2. Follow-up streams (60–~149) — character-by-character typing
 *   3. Camera zoom (120–179)       — scale 1→1.4, translateY pushes research up
 *   4. Tool call chip (180–269)    — "Connecting to Duckbill..." → "Connected to Duckbill"
 *   5. Phone call (270–389)        — "Calling Presidio Hill School ●●●"
 *   6. Human + result (390–509)    — "Human assistant connected" + Duckbill result
 *   7. Hold (510–614)              — hold, TransitionSeries fades to TaglineScene
 */
export const StoryScene: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Gentle fade-in for entire scene ──
  const fadeIn = interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ── Phase 2: Follow-up streaming (character-by-character) ──
  const showFollowUp = frame >= timing.followUpStreamStart;
  const followUpCharIndex = showFollowUp
    ? Math.floor(
        interpolate(
          frame,
          [timing.followUpStreamStart, timing.followUpStreamEnd],
          [0, exchange.followUpText.length],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        )
      )
    : 0;
  const followUpDisplayText = exchange.followUpText.slice(0, followUpCharIndex);

  // ── Phase 3: Camera zoom ──
  const scale = interpolate(
    frame,
    [0, timing.zoomStart, timing.zoomEnd, 615],
    [1.0, 1.0, 1.4, 1.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const zoomTranslateY = interpolate(
    frame,
    [0, timing.zoomStart, timing.zoomEnd, 615],
    [0, 0, -280, -280],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Phase 6: Duckbill result streaming ──
  const showDuckbill = frame >= timing.duckbillStreamStart;
  const duckbillCharIndex = showDuckbill
    ? Math.floor(
        interpolate(
          frame,
          [timing.duckbillStreamStart, timing.duckbillStreamEnd],
          [0, exchange.duckbillResponse.length],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        )
      )
    : 0;
  const duckbillDisplayText = exchange.duckbillResponse.slice(
    0,
    duckbillCharIndex
  );

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: lightMode.canvas,
        position: "relative",
        overflow: "hidden",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
      }}
    >
      {/* Camera zoom container */}
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeIn,
          transform: `scale(${scale}) translateY(${zoomTranslateY}px)`,
          transformOrigin: "center bottom",
        }}
      >
        <ChatInterface>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Phase 1: Pre-rendered user prompt (fully visible from frame 0) */}
            <MessageBubble variant="user" animateEntrance={false}>
              {exchange.promptText}
            </MessageBubble>

            {/* Phase 1: Pre-rendered AI response (fully visible from frame 0) */}
            <MessageBubble variant="assistant" animateEntrance={false}>
              {exchange.aiResponse}
            </MessageBubble>

            {/* Phase 2: Follow-up streams in character-by-character */}
            {showFollowUp && (
              <MessageBubble variant="user" delay={timing.followUpStreamStart}>
                {highlightDuckbill(followUpDisplayText)}
              </MessageBubble>
            )}

            {/* Phase 4: Tool call chip — 3-state: Connecting → Connected → Human assistant connected */}
            <ChipSlot startFrame={timing.toolCallStart} height={54}>
              <ToolCallChip
                startFrame={timing.toolCallStart}
                connectedStart={timing.toolCallConnectedStart}
                humanConnectedStart={timing.humanConnectedStart}
              />
            </ChipSlot>

            {/* Phase 5: Call status chip — starts cream, transitions to mint + checkmark at frame 390 */}
            <ChipSlot startFrame={timing.callChipStart} height={60}>
              <CallStatusChip
                label={exchange.callTarget}
                startFrame={timing.callChipStart}
                connectedStart={timing.humanConnectedStart}
                hero
              />
            </ChipSlot>

            {/* Phase 6: Duckbill result streams in */}
            {showDuckbill && (
              <MessageBubble
                variant="duckbill"
                delay={timing.duckbillStreamStart}
              >
                {duckbillDisplayText}
              </MessageBubble>
            )}
          </div>
        </ChatInterface>
      </div>
    </div>
  );
};
