import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/colors";
import { fontFamily } from "../lib/fonts";

/**
 * Animated 2-state tool call chip:
 *   1. "Connecting to Duckbill..." — cream, shimmer + text shimmer, wrench icon
 *   2. "Connected to Duckbill"     — cream, wrench icon (at connectedStart)
 *
 * Entrance is handled by ChipSlot's height spring — this chip only fades in via opacity.
 */
export const ToolCallChip: React.FC<{
  startFrame: number;
  connectedStart: number;
}> = ({ startFrame, connectedStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // ── Entrance spring (opacity only — no translateY, ChipSlot handles that) ──
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const opacity = entranceProgress;

  // ── Transition: "Connecting..." → "Connected" (spring crossfade at connectedStart) ──
  const connectedLocalFrame = frame - connectedStart;
  const connectedProgress = spring({
    frame: Math.max(0, connectedLocalFrame),
    fps,
    config: { damping: 200 },
  });

  // ── Colors stay cream throughout — no green ──
  const bgColor = colors.cream[50];
  const borderColor = colors.cream[300];
  const iconStroke = colors.neutral[600];

  // ── Background shimmer (repeats every 30 frames), fades out with connection ──
  const shimmerCycle = localFrame % 30;
  const shimmerX = interpolate(shimmerCycle, [0, 30], [-100, 100]);
  const shimmerOpacity = 1 - connectedProgress;


  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
          borderRadius: 26,
          backgroundColor: bgColor,
          border: `1.5px solid ${borderColor}`,
          position: "relative",
          overflow: "hidden",
          fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        }}
      >
        {/* Shimmer overlay — fades out when connected */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)`,
            transform: `translateX(${shimmerX}%)`,
            opacity: shimmerOpacity,
            pointerEvents: "none",
          }}
        />

        {/* Tool/wrench icon — stays visible throughout */}
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            stroke={iconStroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Label — hard swap to avoid crossfade blur on near-identical text */}
        <span
          style={{
            color: colors.neutral[800],
            fontSize: 26,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {connectedProgress > 0.5 ? "Connected to Duckbill" : "Connecting to Duckbill..."}
        </span>
      </div>
    </div>
  );
};
