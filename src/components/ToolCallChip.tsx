import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, interpolateColors } from "remotion";
import { springPresets } from "../lib/timing";
import { colors } from "../lib/colors";
import { fontFamily } from "../lib/fonts";

/**
 * Animated 3-state chat chip that morphs through:
 *   1. "Connecting to Duckbill..." — cream, shimmer, link icon
 *   2. "Connected to Duckbill"     — mint, checkmark (at connectedStart)
 *   3. "Human assistant connected"  — mint, pulsing green dot (at humanConnectedStart)
 *
 * Entrance is handled by ChipSlot's height spring — this chip only fades in via opacity.
 */
export const ToolCallChip: React.FC<{
  startFrame: number;
  connectedStart: number;
  humanConnectedStart: number;
}> = ({ startFrame, connectedStart, humanConnectedStart }) => {
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

  // ── Transition 1: cream → mint + "Connecting..." → "Connected" (10 frames at connectedStart) ──
  const connectedLocalFrame = frame - connectedStart;
  const colorProgress = interpolate(connectedLocalFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ── Transition 2: "Connected to Duckbill" → "Human assistant connected" (10 frames at humanConnectedStart) ──
  const humanLocalFrame = frame - humanConnectedStart;
  const humanProgress = interpolate(humanLocalFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ── Interpolated colors: cream → mint ──
  const bgColor = interpolateColors(colorProgress, [0, 1], [colors.cream[50], colors.mint[100]]);
  const borderColor = interpolateColors(colorProgress, [0, 1], [colors.cream[300], colors.mint[400]]);
  const iconStroke = interpolateColors(colorProgress, [0, 1], [colors.neutral[600], colors.mint[700]]);

  // ── Shimmer position (repeats every 30 frames), fades out with connection ──
  const shimmerCycle = localFrame % 30;
  const shimmerX = interpolate(shimmerCycle, [0, 30], [-100, 100]);
  const shimmerOpacity = 1 - colorProgress;

  // ── Pulsing green dot for "Human assistant connected" state ──
  const dotLocalFrame = frame - humanConnectedStart;
  const dotOpacity = 0.5 + 0.5 * Math.sin(Math.max(0, dotLocalFrame) * 0.2);

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

        {/* Icon container — crossfades through 3 states */}
        <div style={{ position: "relative", width: 18, height: 18, flexShrink: 0 }}>
          {/* State 1: Link icon — fades out at connectedStart */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: "absolute", top: 0, left: 0, opacity: 1 - colorProgress }}
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

          {/* State 2: Checkmark icon — fades in at connectedStart, fades out at humanConnectedStart */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: "absolute", top: 0, left: 0, opacity: colorProgress * (1 - humanProgress) }}
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke={iconStroke}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* State 3: Pulsing green dot — fades in at humanConnectedStart */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: colors.mint[600],
              opacity: humanProgress * dotOpacity,
            }}
          />
        </div>

        {/* Label — crossfade through 3 states */}
        <div style={{ position: "relative", height: 22 }}>
          {/* State 1: "Connecting to Duckbill..." — fades out at connectedStart */}
          <span
            style={{
              color: colors.neutral[800],
              fontSize: 18,
              fontWeight: 500,
              whiteSpace: "nowrap",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: 1 - colorProgress,
            }}
          >
            Connecting to Duckbill...
          </span>
          {/* State 2: "Connected to Duckbill" — fades in at connectedStart, fades out at humanConnectedStart */}
          <span
            style={{
              color: colors.neutral[800],
              fontSize: 18,
              fontWeight: 500,
              whiteSpace: "nowrap",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: colorProgress * (1 - humanProgress),
            }}
          >
            Connected to Duckbill
          </span>
          {/* State 3: "Human assistant connected" — fades in at humanConnectedStart */}
          <span
            style={{
              color: colors.neutral[800],
              fontSize: 18,
              fontWeight: 500,
              whiteSpace: "nowrap",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: humanProgress,
            }}
          >
            Human assistant connected
          </span>
          {/* Invisible spacer — uses longest text to hold width */}
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              whiteSpace: "nowrap",
              visibility: "hidden",
            }}
          >
            Human assistant connected
          </span>
        </div>
      </div>
    </div>
  );
};
