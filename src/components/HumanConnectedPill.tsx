import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { springPresets } from "../lib/timing";
import { colors } from "../lib/colors";
import { fontFamily } from "../lib/fonts";

/**
 * "Human assistant connected" status pill with pulsing green live dot.
 *
 * Visual: Mint chip with green dot oscillating opacity via Math.sin,
 * springs in from below with snappy preset.
 *
 * Appears after the phone call ringing phase to emphasize that a
 * real human is handling the task.
 */
export const HumanConnectedPill: React.FC<{
  startFrame: number;
}> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // ── Entrance spring ──
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: springPresets.snappy,
  });

  const translateY = interpolate(entranceProgress, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = entranceProgress;

  // ── Green dot pulse ──
  const dotOpacity = 0.5 + 0.5 * Math.sin(localFrame * 0.2);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          borderRadius: 20,
          backgroundColor: colors.mint[100],
          border: `1.5px solid ${colors.mint[400]}`,
          fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        }}
      >
        {/* Pulsing green live dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: colors.mint[600],
            opacity: dotOpacity,
            flexShrink: 0,
          }}
        />

        {/* Label */}
        <span
          style={{
            color: colors.neutral[800],
            fontSize: 16,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Human assistant connected
        </span>
      </div>
    </div>
  );
};
