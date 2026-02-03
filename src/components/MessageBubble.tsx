import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { springPresets } from "../lib/timing";

/**
 * A chat message bubble with spring-animated entrance.
 *
 * The bubble slides up and fades in using Remotion's spring() for
 * physically-based easing. The `variant` prop controls styling:
 * - "user": right-aligned, darker background
 * - "assistant": left-aligned, slightly lighter, optional accent border
 */
export const MessageBubble: React.FC<{
  children: React.ReactNode;
  variant?: "user" | "assistant";
  accentBorder?: boolean;
  delay?: number;
}> = ({ children, variant = "user", accentBorder = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: springPresets.snappy,
  });

  const translateY = interpolate(entrance, [0, 1], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const isUser = variant === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        opacity: entrance,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "20px 28px",
          borderRadius: isUser ? "24px 24px 4px 24px" : "24px 24px 24px 4px",
          backgroundColor: isUser ? "#3d3d3d" : "#333333",
          color: "#f0f0f0",
          fontSize: 28,
          lineHeight: 1.5,
          fontWeight: 400,
          border: accentBorder ? "2px solid #eefb86" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};
