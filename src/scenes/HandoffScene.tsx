import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ChatInterface } from "../components/ChatInterface";
import { MessageBubble } from "../components/MessageBubble";
import { springPresets, seconds } from "../lib/timing";
import { colors, gradients } from "../lib/colors";
import { loadBrandFonts } from "../lib/fonts";

loadBrandFonts();

const USER_MESSAGE =
  "Book a dentist appointment for Charlie next Thursday afternoon. We have Delta Dental.";

/**
 * Scene 2: "Duckbill takes over" (~8s / 240 frames)
 *
 * The reveal moment. The user's message is already visible (sent state).
 * A subtle Duckbill accent — a lime dot and "Handed off to Duckbill"
 * status — fades in, signaling that a real human is picking this up.
 *
 * A gradient wash (the Duckbill primary gradient) pulses across
 * the background as a subtle atmospheric shift.
 */
export const HandoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The gradient background pulse — subtle opacity wave
  const gradientOpacity = interpolate(
    frame,
    [seconds(1), seconds(3), seconds(5), seconds(7)],
    [0, 0.08, 0.05, 0.08],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Status indicator entrance
  const statusEntrance = spring({
    frame: frame - seconds(1.5),
    fps,
    config: springPresets.smooth,
  });

  const statusTranslateY = interpolate(statusEntrance, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // "Handed off" text entrance
  const textEntrance = spring({
    frame: frame - seconds(2.5),
    fps,
    config: springPresets.smooth,
  });

  // Lime dot pulse
  const dotScale = interpolate(
    frame,
    [seconds(1.5), seconds(2), seconds(2.5), seconds(3)],
    [0, 1.2, 1, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <ChatInterface>
      {/* Gradient overlay for the atmospheric shift */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradients.primary,
          opacity: gradientOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User message — already sent, static */}
      <MessageBubble variant="user" delay={0}>
        {USER_MESSAGE}
      </MessageBubble>

      {/* Handoff status indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingLeft: 8,
          paddingTop: 8,
          opacity: statusEntrance,
          transform: `translateY(${statusTranslateY}px)`,
        }}
      >
        {/* Lime accent dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: colors.brand[400],
            transform: `scale(${dotScale})`,
          }}
        />
        <span
          style={{
            color: colors.neutral[400],
            fontSize: 20,
            fontWeight: 500,
            opacity: textEntrance,
          }}
        >
          Handed off to Duckbill
        </span>
      </div>

      {/* Subtle "a human is on it" subtext */}
      <div
        style={{
          paddingLeft: 30,
          paddingTop: 6,
          opacity: interpolate(
            frame,
            [seconds(3.5), seconds(4.5)],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          ),
        }}
      >
        <span
          style={{
            color: colors.neutral[600],
            fontSize: 17,
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          A human is on it.
        </span>
      </div>

      {/* Input bar — dimmed to show the conversation is "in progress" */}
      <div
        style={{
          marginTop: 24,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#333333",
          opacity: 0.5,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
        }}
      >
        <span style={{ color: "#696969", fontSize: 22 }}>Message...</span>
      </div>
    </ChatInterface>
  );
};
