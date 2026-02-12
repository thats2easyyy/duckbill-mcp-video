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
import { lightMode, colors } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";
import {
  springPresets,
  FRAMES_PER_BEAT,
  snapLocalToBeat,
  NOW_YOU_CAN_GLOBAL_OFFSET,
} from "../lib/timing";
import { DuckbillLogo } from "../components/DuckbillLogo";

loadBrandFonts();

// ── LLM platform data ──────────────────────────────────────

interface LLMPlatform {
  logoFile: string;
  targetX: number; // final X offset from CENTER_X
  targetY: number; // final Y offset below duckbill logo
  bobSpeed: number; // sine frequency multiplier for floating
  bobAmount: number; // pixels of vertical float
  staggerDelay: number; // frames after phase start
}

const ONE_BEAT = Math.round(FRAMES_PER_BEAT);

const PLATFORMS: LLMPlatform[] = [
  { logoFile: "logos/logo-black.png", targetX: -240, targetY: 180, bobSpeed: 0.045, bobAmount: 8, staggerDelay: 0 },
  { logoFile: "logos/chatgpt logo.svg", targetX: 80, targetY: 190, bobSpeed: 0.055, bobAmount: 6, staggerDelay: ONE_BEAT },
  { logoFile: "logos/claude-color.svg", targetX: -80, targetY: 200, bobSpeed: 0.038, bobAmount: 10, staggerDelay: ONE_BEAT * 2 },
  { logoFile: "logos/Google-gemini-icon.svg.png", targetX: 250, targetY: 185, bobSpeed: 0.05, bobAmount: 7, staggerDelay: ONE_BEAT * 3 },
];

const CENTER_X = 540;
const CENTER_Y = 630;
const ICON_CONTAINER_SIZE = 80;

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

// ── Logo image with fallback ────────────────────────────────

const LogoImage: React.FC<{ src: string }> = ({ src }) => {
  try {
    return (
      <Img
        src={staticFile(src)}
        style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6 }}
      />
    );
  } catch {
    return null;
  }
};

// ── Component ───────────────────────────────────────────────

interface NowYouCanSceneProps {
  globalFrameOffset?: number;
}

export const NowYouCanScene: React.FC<NowYouCanSceneProps> = ({
  globalFrameOffset = NOW_YOU_CAN_GLOBAL_OFFSET,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalFrame = frame + globalFrameOffset;

  // ── Audio data for beat-reactive effects ──
  const audioData = useAudioData(AUDIO_SRC);

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

  // ── Beat-synced timing ──
  const textDelay = snapLocalToBeat(15, globalFrameOffset);
  const logoDelay = snapLocalToBeat(25, globalFrameOffset);
  const llmPhaseStart = snapLocalToBeat(40, globalFrameOffset);
  const exitStart = snapLocalToBeat(137, globalFrameOffset);

  // ── Ken Burns scale for phone photo backdrop ──
  const photoScale = interpolate(frame, [0, 160], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Text entrance (beat-snapped, snappy spring) ──
  const textSpring = spring({
    frame: Math.max(0, frame - textDelay),
    fps,
    config: springPresets.snappy,
  });
  const textOpacity = textSpring;
  const textTranslateY = interpolate(textSpring, [0, 1], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Logo entrance (beat-snapped, bouncy) ──
  const logoSpring = spring({
    frame: Math.max(0, frame - logoDelay),
    fps,
    config: springPresets.bouncy,
  });
  const entranceScale = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Logo blend: entrance spring → breathing + audio-reactive ──
  const blendToBreathing = interpolate(frame, [logoDelay + 20, logoDelay + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breathing = 1 + 0.015 * Math.sin(frame * 0.06) + amplitude * 0.03;
  const finalLogoScale = entranceScale * (1 - blendToBreathing) + breathing * blendToBreathing;

  // ── Text + icons exit (beat-snapped) ──
  const exitOpacity = interpolate(frame, [exitStart, exitStart + 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Logo exit (slightly faster to avoid ghosting during crossfade) ──
  const logoExitOpacity = interpolate(frame, [exitStart + 3, exitStart + 13], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Audio glow fade-in ──
  const glowFadeIn = interpolate(frame, [logoDelay + 40, logoDelay + 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: lightMode.canvas,
        position: "relative",
        overflow: "hidden",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
      }}
    >
      {/* Phone photo backdrop */}
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
          transform: `scale(${photoScale})`,
          pointerEvents: "none",
        }}
      />

      {/* "Now available through MCP" */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: textOpacity * exitOpacity,
          transform: `translateY(${textTranslateY}px)`,
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontWeight: 500,
            color: colors.neutral[900],
          }}
        >
          Get human help, inside your AI
        </span>
      </div>

      {/* Audio-reactive radial glow behind logo */}
      {(() => {
        const clampOpts = { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const };
        const glowRadius = interpolate(amplitude, [0, 0.5], [120, 200], clampOpts);
        const glowOpacity = interpolate(amplitude, [0, 0.5], [0.03, 0.2], clampOpts) * glowFadeIn;
        return (
          <div
            style={{
              position: "absolute",
              left: CENTER_X,
              top: CENTER_Y,
              transform: "translate(-50%, -50%)",
              width: glowRadius * 2,
              height: glowRadius * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(145, 221, 197, ${glowOpacity}) 0%, rgba(235, 252, 114, ${glowOpacity * 0.5}) 50%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        );
      })()}

      {/* Duckbill logo — blends from bounce entrance to breathing + audio-reactive */}
      <div
        style={{
          position: "absolute",
          left: CENTER_X - 40,
          top: CENTER_Y - 40,
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${finalLogoScale})`,
          transformOrigin: "center center",
          opacity: logoExitOpacity,
        }}
      >
        <DuckbillLogo size={80} />
      </div>

      {/* LLM platform icons popping out below duckbill logo */}
      {PLATFORMS.map((platform, index) => {
        const popStartFrame = llmPhaseStart + platform.staggerDelay;

        // Don't render before entrance starts
        if (frame < popStartFrame) return null;

        const localFrame = frame - popStartFrame;

        // Pop-out spring (bouncy emergence from logo center)
        const popSpring = spring({
          frame: localFrame,
          fps,
          config: { damping: 12, stiffness: 120 },
        });

        // Animate from logo center to target position
        const x = CENTER_X + platform.targetX * popSpring;
        const y = CENTER_Y + platform.targetY * popSpring;

        // Floating bob (kicks in after spring settles, ~30 frames)
        const bobBlend = interpolate(localFrame, [25, 50], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const bob = Math.sin(localFrame * platform.bobSpeed) * platform.bobAmount * bobBlend;

        // Scale: pop from 0 to 1 with slight audio reactivity
        const iconScale = popSpring * (1.0 + amplitude * 0.02);

        // Icons exit (beat-synced)
        const iconExitOpacity = interpolate(frame, [exitStart, exitStart + 20], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y + bob,
              transform: `translate(-50%, -50%) scale(${iconScale})`,
              transformOrigin: "center center",
              opacity: popSpring * iconExitOpacity,
            }}
          >
            <div
              style={{
                width: ICON_CONTAINER_SIZE,
                height: ICON_CONTAINER_SIZE,
                borderRadius: 16,
                backgroundColor: colors.cream[50],
                border: `1.5px solid ${colors.cream[300]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogoImage src={platform.logoFile} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
