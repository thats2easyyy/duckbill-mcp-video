import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  Img,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { springPresets, FRAMES_PER_BEAT, computeNextBeatOffset } from "../lib/timing";
import { lightMode, colors } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";

loadBrandFonts();

// ── Inline SVG icon components ──────────────────────────────

const ICON_SIZE = 22;
const ICON_COLOR = colors.neutral[600];

const PhoneIcon: React.FC = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const CalendarIcon: React.FC = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── Capability data ──────────────────────────────────────

interface Capability {
  label: string;
  icon: React.ReactNode;
}

const CAPABILITIES: Capability[] = [
  { label: "phone calls", icon: <PhoneIcon /> },
  { label: "reservations", icon: <CalendarIcon /> },
  { label: "appointments", icon: <ClockIcon /> },
  { label: "research", icon: <SearchIcon /> },
];

// ── Beat-synced timing ──────────────────────────────────

/** Spacing between chip entrances in beats */
const CHIP_BEAT_SPACING = 2;

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

// ── Component ───────────────────────────────────────────

interface CapabilitiesSceneProps {
  globalFrameOffset?: number;
}

export const CapabilitiesScene: React.FC<CapabilitiesSceneProps> = ({
  globalFrameOffset = 561,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalFrame = frame + globalFrameOffset;

  // Auto-compute beat phase offset from global position
  const beatPhaseOffset = computeNextBeatOffset(globalFrameOffset);

  // Audio data (null while loading, then AudioData object)
  const audioData = useAudioData(AUDIO_SRC);

  // Extract bass amplitude for audio-reactive effects
  let amplitude = 0;
  if (audioData) {
    const visualization = visualizeAudio({
      audioData,
      frame: globalFrame,
      fps,
      numberOfSamples: 32,
    });
    const bassBins = visualization.slice(1, 6);
    amplitude = bassBins.reduce((s, v) => s + v, 0) / bassBins.length;
  }

  // Header entrance — smooth spring
  const headerEntrance = spring({
    frame,
    fps,
    config: springPresets.smooth,
  });

  const headerTranslateY = interpolate(headerEntrance, [0, 1], [15, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Header exit — fade out starting at frame 135 over 30 frames
  const headerExitOpacity = interpolate(frame, [135, 165], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SVG background Ken Burns scale
  const svgScale = interpolate(frame, [0, 180], [1.0, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Audio-reactive background glow
  const glowOpacity = interpolate(amplitude, [0, 0.5], [0.05, 0.35], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const glowRadius = interpolate(amplitude, [0, 0.5], [200, 350], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: lightMode.canvas,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Brand photo background */}
      <Img
        src={staticFile("images/DTS_SOJOURN_Franco_Dupuy_Photos_ID10765 1.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          objectFit: "cover",
          opacity: 0.1,
          transform: `scale(${svgScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Audio-reactive radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: glowRadius * 2,
          height: glowRadius * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(145, 221, 197, ${glowOpacity}) 0%, rgba(235, 252, 114, ${glowOpacity * 0.5}) 50%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          opacity: headerEntrance * headerExitOpacity,
          transform: `translateY(${headerTranslateY}px)`,
          marginBottom: 30,
        }}
      >
        <span
          style={{
            fontSize: 44,
            fontWeight: 400,
            color: colors.neutral[900],
          }}
        >
          Duckbill handles your
        </span>
      </div>

      {/* Stacking chip container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {CAPABILITIES.map((cap, i) => {
          const chipEntranceFrame = Math.round(
            beatPhaseOffset + i * CHIP_BEAT_SPACING * FRAMES_PER_BEAT
          );

          // Exit: staggered chip exit starting at frame 135
          const exitStart = 135 + i * 6;
          const exitOpacity = interpolate(frame, [exitStart, exitStart + 25], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const exitTranslateY = interpolate(frame, [exitStart, exitStart + 25], [0, -40], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Don't render before entrance or after fully exited
          if (frame < chipEntranceFrame) return null;
          if (exitOpacity <= 0) return null;

          const localFrame = frame - chipEntranceFrame;

          // Bouncy spring for scale overshoot: 0 → ~1.12 → 1.0
          const entranceSpring = spring({
            frame: localFrame,
            fps,
            config: springPresets.bouncy,
          });

          // Scale: overshoot to 1.12, then settle to 1.0
          const entranceScale = interpolate(
            entranceSpring,
            [0, 1],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          // Slide up from 30px
          const slideY = interpolate(
            entranceSpring,
            [0, 1],
            [30, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          // Audio-reactive breathing — subtle scale pulse on all visible chips
          const breathScale = 1.0 + amplitude * 0.025;

          const finalScale = entranceScale * breathScale;

          return (
            <div
              key={cap.label}
              style={{
                opacity: entranceSpring * exitOpacity,
                transform: `translateY(${slideY + exitTranslateY}px) scale(${finalScale})`,
                transformOrigin: "center center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 28px",
                  borderRadius: 22,
                  backgroundColor: colors.cream[50],
                  border: `1.5px solid ${colors.cream[300]}`,
                }}
              >
                {cap.icon}
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: colors.neutral[900],
                  }}
                >
                  {cap.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
