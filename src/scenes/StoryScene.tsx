import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
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
import { springPresets, STORY_SCENE_DURATION, STORY_GLOBAL_OFFSET } from "../lib/timing";

loadBrandFonts();

const exchange = EXCHANGES[0];

const CROSSFADE_FRAMES = 20;

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

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
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
};

/**
 * StoryScene — 300 frames (10s at 30fps).
 *
 * Opens mid-conversation with a pre-rendered AI research response,
 * streams in a follow-up action, zooms the camera in, shows a tool-call
 * chip with shimmer (appearing mid-zoom), runs the phone call, shows
 * a human-connected sub-label, and streams the Duckbill result.
 *
 * Phases:
 *   1. Pre-rendered chat (0–39)    — user prompt + AI response fully visible
 *   2. Follow-up streams (40–~79)  — character-by-character typing
 *   3. Camera zoom (40–130)        — scale 1→1.4, translateY pushes research up
 *   4. Tool call chip (80–125)     — "Connecting to Duckbill..." shimmer → "Connected"
 *   5. Phone call (125–185)        — "Calling Presidio Hill School ●●●"
 *   6. Human + result (185–299)    — sub-label + Duckbill result streams, then fade
 */
interface StorySceneProps {
  globalFrameOffset?: number;
}

export const StoryScene: React.FC<StorySceneProps> = ({
  globalFrameOffset = STORY_GLOBAL_OFFSET,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pre-compute phase timings (deterministic, based on globalFrameOffset)
  const timing = computeStoryPhaseTiming(exchange, globalFrameOffset);

  // Audio data for reactive effects
  const globalFrame = frame + globalFrameOffset;
  const audioData = useAudioData(AUDIO_SRC);

  let amplitude = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      audioData,
      frame: globalFrame,
      fps,
      numberOfSamples: 32,
    });
    const bassBins = visualization.slice(1, 6);
    amplitude = bassBins.reduce((s, v) => s + v, 0) / bassBins.length;
  }

  // Subtle audio-reactive scale pulse for the chat container
  const audioScale = 1.0 + amplitude * 0.008;

  // ── Gentle fade-in for entire scene ──
  const fadeIn = interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ── Exit animation: scale-down + fade out (frames 240–285) ──
  const exitScale = interpolate(frame, [240, 285], [1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [240, 285], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
    [0, timing.zoomStart, timing.zoomEnd, STORY_SCENE_DURATION],
    [1.0, 1.0, 1.4, 1.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const zoomTranslateY = interpolate(
    frame,
    [0, timing.zoomStart, timing.zoomEnd, STORY_SCENE_DURATION],
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
      {/* Exit animation wrapper */}
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
          transformOrigin: "center center",
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
            transform: `scale(${scale * audioScale}) translateY(${zoomTranslateY}px)`,
            transformOrigin: "center 60%",
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

              {/* Phase 4: Tool call chip — 2-state: Connecting → Connected */}
              <ChipSlot startFrame={timing.toolCallStart} height={54}>
                <ToolCallChip
                  startFrame={timing.toolCallStart}
                  connectedStart={timing.toolCallConnectedStart}
                />
              </ChipSlot>

              {/* Phase 5: Call status chip — stays cream, checkmark at humanConnectedStart */}
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
    </div>
  );
};
