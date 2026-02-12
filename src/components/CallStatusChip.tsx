import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/colors";
import { fontFamily } from "../lib/fonts";

/**
 * Animated 2-state call chip (matches ToolCallChip structure):
 *   1. "Calling {target}..." — cream, shimmer, phone icon
 *   2. "Called {target}"     — cream, phone icon (at connectedStart)
 *
 * Entrance is handled by ChipSlot's height spring — this chip only fades in via opacity.
 */
export const CallStatusChip: React.FC<{
  label: string;
  startFrame: number;
  connectedStart: number;
}> = ({ label, startFrame, connectedStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // ── Entrance spring (opacity only — ChipSlot handles height) ──
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const opacity = entranceProgress;

  // ── Transition: "Calling..." → "Called" (spring crossfade at connectedStart) ──
  const connectedLocalFrame = frame - connectedStart;
  const connectedProgress = spring({
    frame: Math.max(0, connectedLocalFrame),
    fps,
    config: { damping: 200 },
  });

  // ── Colors — cream throughout ──
  const bgColor = colors.cream[50];
  const borderColor = colors.cream[300];
  const iconColor = colors.neutral[600];

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
        {/* Background shimmer overlay — fades out when connected */}
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

        {/* Phone icon — stays visible throughout */}
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
            fill={iconColor}
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
          {connectedProgress > 0.5 ? `Called ${label}` : `Calling ${label}...`}
        </span>
      </div>
    </div>
  );
};
