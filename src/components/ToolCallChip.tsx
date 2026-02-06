import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { springPresets } from "../lib/timing";
import { colors } from "../lib/colors";
import { fontFamily } from "../lib/fonts";

/**
 * Animated 2-state chat chip:
 *   1. "Connecting to Duckbill..." — cream, shimmer, link icon
 *   2. "Connected to Duckbill"     — cream, checkmark (at connectedStart)
 *
 * Entrance is handled by ChipSlot's height spring — this chip only fades in via opacity.
 * "Human assistant connected" is rendered separately in StoryScene as a sub-label.
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
    config: springPresets.snappy,
  });

  const opacity = entranceProgress;

  // ── Transition: "Connecting..." → "Connected" (10 frames at connectedStart) ──
  const connectedLocalFrame = frame - connectedStart;
  const connectedProgress = interpolate(connectedLocalFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ── Colors stay cream throughout — no green ──
  const bgColor = colors.cream[50];
  const borderColor = colors.cream[300];
  const iconStroke = colors.neutral[600];

  // ── Shimmer position (repeats every 30 frames), fades out with connection ──
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
          gap: 10,
          padding: "12px 24px",
          borderRadius: 22,
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

        {/* Icon container — crossfades between link and checkmark */}
        <div style={{ position: "relative", width: 18, height: 18, flexShrink: 0 }}>
          {/* State 1: Link icon — fades out at connectedStart */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: "absolute", top: 0, left: 0, opacity: 1 - connectedProgress }}
          >
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
              stroke={iconStroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
              stroke={iconStroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* State 2: Checkmark icon — fades in at connectedStart */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: "absolute", top: 0, left: 0, opacity: connectedProgress }}
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke={iconStroke}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Label — crossfade between 2 states */}
        <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
          {/* State 1: "Connecting to Duckbill..." — fades out at connectedStart */}
          <span
            style={{
              color: colors.neutral[800],
              fontSize: 22,
              fontWeight: 500,
              whiteSpace: "nowrap",
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              opacity: 1 - connectedProgress,
            }}
          >
            Connecting to Duckbill...
          </span>
          {/* State 2: "Connected to Duckbill" — fades in at connectedStart */}
          <span
            style={{
              color: colors.neutral[800],
              fontSize: 22,
              fontWeight: 500,
              whiteSpace: "nowrap",
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              opacity: connectedProgress,
            }}
          >
            Connected to Duckbill
          </span>
          {/* Invisible spacer to hold width */}
          <span
            style={{
              fontSize: 22,
              fontWeight: 500,
              whiteSpace: "nowrap",
              visibility: "hidden",
            }}
          >
            Connecting to Duckbill...
          </span>
        </div>
      </div>
    </div>
  );
};
