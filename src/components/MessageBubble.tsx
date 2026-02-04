import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { springPresets } from "../lib/timing";
import { lightMode } from "../lib/colors";

/**
 * A chat message bubble with optional spring-animated entrance.
 *
 * Light mode variant for the "Finally Free" redesign:
 * - "user": right-aligned, soft blue-gray background (#E8EFF5)
 * - "assistant": left-aligned, white with subtle border
 * - "duckbill": left-aligned, white with lime (#eefb86) border
 *
 * Set `animateEntrance={false}` to skip the built-in spring — useful
 * when the parent (e.g. StoryScene) controls opacity/transform externally.
 */
export const MessageBubble: React.FC<{
  children: React.ReactNode;
  variant?: "user" | "assistant" | "duckbill";
  delay?: number;
  animateEntrance?: boolean;
}> = ({
  children,
  variant = "user",
  delay = 0,
  animateEntrance = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let opacity = 1;
  let translateY = 0;

  if (animateEntrance) {
    const entrance = spring({
      frame: frame - delay,
      fps,
      config: springPresets.snappy,
    });

    translateY = interpolate(entrance, [0, 1], [30, 0], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });

    opacity = entrance;
  }

  const isUser = variant === "user";
  const isDuckbill = variant === "duckbill";

  const backgroundColor = isUser
    ? lightMode.userBubble
    : lightMode.aiBubbleBg;

  const border = isDuckbill
    ? `2px solid ${lightMode.duckbillBubbleBorder}`
    : isUser
      ? "none"
      : `1.5px solid ${lightMode.aiBubbleBorder}`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "14px 20px",
          borderRadius: isUser ? "24px 24px 4px 24px" : "24px 24px 24px 4px",
          backgroundColor,
          color: lightMode.bodyText,
          fontSize: 22,
          lineHeight: 1.5,
          fontWeight: 400,
          border,
          whiteSpace: "pre-line",
        }}
      >
        {children}
      </div>
    </div>
  );
};
