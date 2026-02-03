import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ChatInterface } from "../components/ChatInterface";
import { MessageBubble } from "../components/MessageBubble";
import { TypingAnimation } from "../components/TypingAnimation";
import { springPresets, seconds } from "../lib/timing";
import { loadBrandFonts } from "../lib/fonts";

loadBrandFonts();

const USER_MESSAGE =
  "Book a dentist appointment for Charlie next Thursday afternoon. We have Delta Dental.";

/**
 * Scene 1: "You're already here" (~8s / 240 frames)
 *
 * The viewer sees a familiar dark-mode chat interface — it could be
 * Claude, ChatGPT, anything. A user message types out character by
 * character. This IS the viral hook: it looks like their own screen.
 *
 * The message bubble springs in, then the typing animation reveals
 * the text at a natural 25 chars/second pace.
 */
export const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Input bar at the bottom, simulating where the user "typed"
  const inputBarOpacity = interpolate(frame, [0, seconds(0.5)], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // The message bubble appears after a brief pause
  const bubbleDelay = seconds(0.8);

  // After the message is fully typed, show a subtle "sending" state
  const typingDuration = Math.ceil((USER_MESSAGE.length / 25) * fps);
  const messageComplete = frame > bubbleDelay + typingDuration + seconds(0.5);

  // Subtle slide up of the message once "sent"
  const sentSlide = messageComplete
    ? interpolate(
        frame,
        [bubbleDelay + typingDuration + seconds(0.5), bubbleDelay + typingDuration + seconds(1)],
        [0, -8],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
      )
    : 0;

  return (
    <ChatInterface>
      {/* Spacer to push content down */}
      <div style={{ flex: 1 }} />

      {/* User message bubble */}
      <div style={{ transform: `translateY(${sentSlide}px)` }}>
        <MessageBubble variant="user" delay={bubbleDelay}>
          <TypingAnimation
            text={USER_MESSAGE}
            startFrame={bubbleDelay + seconds(0.3)}
            charsPerSecond={25}
            fps={fps}
          />
        </MessageBubble>
      </div>

      {/* Input bar at bottom */}
      <div
        style={{
          marginTop: 24,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#333333",
          opacity: inputBarOpacity,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <span
          style={{
            color: "#696969",
            fontSize: 22,
            fontWeight: 400,
          }}
        >
          Message...
        </span>
      </div>
    </ChatInterface>
  );
};
