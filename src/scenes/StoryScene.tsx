import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ChatInterface } from "../components/ChatInterface";
import { MessageBubble } from "../components/MessageBubble";
import { ToolCallChip } from "../components/ToolCallChip";
import { CallStatusChip } from "../components/CallStatusChip";
import { EXCHANGES, computeStoryPhaseTiming } from "../lib/exchanges";
import { lightMode } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";
import { STORY_GLOBAL_OFFSET, snapLocalToBeat } from "../lib/timing";

loadBrandFonts();

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — StoryScene
 *
 * 250 frames (8.3s at 30fps). Opens clean, user message
 * types in centered, runs a Duckbill phone call, shows result.
 *
 *    0f             Scene fades in (spring, ~20f settle)
 *  ~15f  [phase 1]  User message "ask duckbill to call..." streams in char-by-char
 *  ~63f             User message typing finishes
 *  ~70f  [phase 2]  Tool call chip: "Connecting to Duckbill..." shimmer (wrench icon)
 *  ~95f             Tool call chip: → "Connected to Duckbill" ✓ (spring crossfade)
 * ~100f  [phase 3]  Call status chip: "Calling Presidio Hill School ●●●"
 * ~140f  [phase 4]  Human connected ✓, Duckbill result streams in
 * ~187f             Duckbill result finishes streaming — reading time begins
 *  225f             Global exit — scale 1.0 → 0.92, opacity → 0 (spring)
 *  250f             Scene ends
 *
 * (~N = beat-snapped, exact frame depends on global offset)
 * ───────────────────────────────────────────────────────── */

// ── Timing ──────────────────────────────────────────────

// exitStart is computed inside the component via snapLocalToBeat

// ── Spring configs ──────────────────────────────────────

const SPRINGS = {
  entrance: { damping: 200 },                   // smooth fade-in
  exit:     { damping: 200 },                   // smooth ease-out
};

// ── Element configs ─────────────────────────────────────

const EXIT = {
  finalScale:   0.92,  // scale down to
};

const exchange = EXCHANGES[0];

// ── ChipSlot — spring-animated height wrapper ───────────

const ChipSlot: React.FC<{
  startFrame: number;
  height?: number;
  children: React.ReactNode;
}> = ({ startFrame, height = 48, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < -1) return null;

  const heightProgress = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 200 },  // smooth, no bounce — prevents layout jitter
  });

  const currentHeight = interpolate(heightProgress, [0, 1], [0, height], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div style={{ height: currentHeight, flexShrink: 0 }}>
      {children}
    </div>
  );
};

// ── Scene ───────────────────────────────────────────────

interface StorySceneProps {
  globalFrameOffset?: number;
}

export const StoryScene: React.FC<StorySceneProps> = ({
  globalFrameOffset = STORY_GLOBAL_OFFSET,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const timing = computeStoryPhaseTiming(exchange, globalFrameOffset);

  // ── Beat-snapped exit ──
  const exitStart = snapLocalToBeat(225, globalFrameOffset);

  // ── Entrance — spring fade-in ──
  const fadeIn = spring({
    frame,
    fps,
    config: SPRINGS.entrance,
  });

  // ── Exit — spring ──
  const isExiting = frame >= exitStart;
  const exitSpring = spring({
    frame: Math.max(0, frame - exitStart),
    fps,
    config: SPRINGS.exit,
  });
  const exitScale = isExiting
    ? interpolate(exitSpring, [0, 1], [1, EXIT.finalScale])
    : 1;
  const exitOpacity = isExiting
    ? interpolate(exitSpring, [0, 1], [1, 0])
    : 1;

  // ── Follow-up streaming (char-by-char) ──
  const showFollowUp = frame >= timing.followUpStreamStart;
  const followUpCharIndex = showFollowUp
    ? Math.floor(
        interpolate(
          frame,
          [timing.followUpStreamStart, timing.followUpStreamEnd],
          [0, exchange.followUpText.length],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
        ),
      )
    : 0;
  const followUpDisplayText = exchange.followUpText.slice(0, followUpCharIndex);

  // ── Duckbill result streaming ──
  const showDuckbill = frame >= timing.duckbillStreamStart;
  const duckbillCharIndex = showDuckbill
    ? Math.floor(
        interpolate(
          frame,
          [timing.duckbillStreamStart, timing.duckbillStreamEnd],
          [0, exchange.duckbillResponse.length],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
        ),
      )
    : 0;
  const duckbillDisplayText = exchange.duckbillResponse.slice(
    0,
    duckbillCharIndex,
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
      {/* Exit animation wrapper */}
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeIn * exitOpacity,
          transform: `scale(${exitScale})`,
          transformOrigin: "center center",
        }}
      >
        <ChatInterface>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Phase 1: User message streams in */}
            {showFollowUp && (
              <MessageBubble
                variant="user"
                delay={timing.followUpStreamStart}
              >
                {followUpDisplayText}
              </MessageBubble>
            )}

            {/* Phase 2: Tool call chip */}
            <ChipSlot startFrame={timing.toolCallStart} height={64}>
              <ToolCallChip
                startFrame={timing.toolCallStart}
                connectedStart={timing.toolCallConnectedStart}
              />
            </ChipSlot>

            {/* Phase 3: Call status chip */}
            <ChipSlot startFrame={timing.callChipStart} height={64}>
              <CallStatusChip
                label={exchange.callTarget}
                startFrame={timing.callChipStart}
                connectedStart={timing.humanConnectedStart}
              />
            </ChipSlot>

            {/* Phase 4: Duckbill result */}
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
