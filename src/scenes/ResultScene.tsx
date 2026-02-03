import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ChatInterface } from "../components/ChatInterface";
import { MessageBubble } from "../components/MessageBubble";
import { TypingAnimation } from "../components/TypingAnimation";
import { springPresets, seconds } from "../lib/timing";
import { colors } from "../lib/colors";
import { loadBrandFonts } from "../lib/fonts";

loadBrandFonts();

const USER_MESSAGE =
  "Book a dentist appointment for Charlie next Thursday afternoon. We have Delta Dental.";

const RESULT_MESSAGE =
  "Done. Charlie's dentist appointment is Thursday at 2:30pm with Dr. Patel. Confirmation sent to your email.";

/**
 * Scene 3: "It gets done" (~8s / 240 frames)
 *
 * The payoff. After a 1-second anticipation pause, the response
 * types in — confirming the task is actually done. The assistant
 * message bubble has a subtle lime accent border to tie it to Duckbill.
 *
 * The contrast between "AI can't do this" and "it's done" is the
 * share trigger — the impossible just happened in a chat interface.
 */
export const ResultScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The response bubble appears after a 1s anticipation pause
  const responseDelay = seconds(1);

  // Checkmark/completion indicator
  const completionOpacity = interpolate(
    frame,
    [seconds(6), seconds(6.5)],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <ChatInterface>
      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User's original message — static, already sent */}
      <MessageBubble variant="user" delay={0}>
        {USER_MESSAGE}
      </MessageBubble>

      {/* Handoff status — already shown, static */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingLeft: 8,
          paddingTop: 4,
          paddingBottom: 16,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: colors.brand[400],
          }}
        />
        <span
          style={{
            color: colors.neutral[400],
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          Handed off to Duckbill
        </span>
      </div>

      {/* Response message — types in with accent border */}
      <MessageBubble variant="assistant" accentBorder delay={responseDelay}>
        <TypingAnimation
          text={RESULT_MESSAGE}
          startFrame={responseDelay + seconds(0.4)}
          charsPerSecond={28}
          fps={fps}
        />
      </MessageBubble>

      {/* Subtle completion indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 8,
          paddingTop: 4,
          opacity: completionOpacity,
        }}
      >
        <span style={{ color: colors.brand[400], fontSize: 18 }}>✓</span>
        <span
          style={{
            color: colors.neutral[500],
            fontSize: 17,
            fontWeight: 400,
          }}
        >
          Task completed
        </span>
      </div>

      {/* Input bar */}
      <div
        style={{
          marginTop: 24,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#333333",
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
