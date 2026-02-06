import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { lightMode, colors } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";
import {
  springPresets,
  FRAMES_PER_BEAT,
  computeNextBeatOffset,
  LLM_GLOBAL_OFFSET,
} from "../lib/timing";
import { DuckbillLogo } from "../components/DuckbillLogo";

loadBrandFonts();

// ── LLM platform data ──────────────────────────────────────

interface LLMPlatform {
  name: string;
  logoFile: string;
  angle: number; // degrees: top=270, right=0, bottom=90, left=180
  staggerDelay: number; // frames after ring expansion starts
}

const PLATFORMS: LLMPlatform[] = [
  { name: "Claude", logoFile: "logos/claude-color.svg", angle: 270, staggerDelay: 0 * Math.round(FRAMES_PER_BEAT) },
  { name: "ChatGPT", logoFile: "logos/chatgpt logo.svg", angle: 0, staggerDelay: 1 * Math.round(FRAMES_PER_BEAT) },
  { name: "Gemini", logoFile: "logos/Google-gemini-icon.svg.png", angle: 90, staggerDelay: 2 * Math.round(FRAMES_PER_BEAT) },
  { name: "Cursor", logoFile: "logos/cursorIcon.jpeg", angle: 180, staggerDelay: 3 * Math.round(FRAMES_PER_BEAT) },
];

const CENTER_X = 540;
const CENTER_Y = 580;
const RING_RADIUS = 240;

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

// ── Try loading logos, fall back to text-only ───────────────

const LogoImage: React.FC<{ src: string }> = ({ src }) => {
  try {
    return (
      <Img
        src={staticFile(src)}
        style={{ width: 24, height: 24, objectFit: "contain" }}
      />
    );
  } catch {
    return null;
  }
};

// ── Component ───────────────────────────────────────────────

interface LLMCompatibilitySceneProps {
  globalFrameOffset?: number;
}

export const LLMCompatibilityScene: React.FC<LLMCompatibilitySceneProps> = ({
  globalFrameOffset = LLM_GLOBAL_OFFSET,
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

  // ── Beat-aligned ring start ──
  const beatPhaseOffset = computeNextBeatOffset(globalFrameOffset);

  // ── Background Ken Burns ──
  const bgScale = interpolate(frame, [0, 150], [1.0, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Header entrance (frames 0-20) ──
  const headerSpring = spring({
    frame,
    fps,
    config: springPresets.smooth,
  });

  const headerTranslateY = interpolate(headerSpring, [0, 1], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = headerSpring;

  // ── Header exit (frames 120-140) ──
  const headerExitOpacity = interpolate(frame, [120, 140], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Logo entrance (frames 8-25) ──
  const logoSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: springPresets.bouncy,
  });

  const logoScale = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Logo ambient breathing (frames 58-150) — sine baseline + audio reactivity ──
  const logoBreathing = 1 + 0.015 * Math.sin(frame * 0.06) + amplitude * 0.03;
  const finalLogoScale = frame < 8 ? logoScale : logoScale * logoBreathing;

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
      {/* Ken Burns background photo */}
      <Img
        src={staticFile(
          "images/DTS_Philia_Daniel_Far\u00F2_Photos_ID4676 4.png"
        )}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          objectFit: "cover",
          opacity: 0.12,
          transform: `scale(${bgScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Header text */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: headerOpacity * headerExitOpacity,
          transform: `translateY(${headerTranslateY}px)`,
        }}
      >
        <span
          style={{
            fontSize: 44,
            fontWeight: 400,
            color: colors.neutral[900],
          }}
        >
          Now available through MCP
        </span>
      </div>

      {/* Audio-reactive radial glow behind logo */}
      {(() => {
        const clampOpts = { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const };
        const glowRadius = interpolate(amplitude, [0, 0.5], [120, 200], clampOpts);
        const glowOpacity = interpolate(amplitude, [0, 0.5], [0.03, 0.2], clampOpts);
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

      {/* Duckbill logo at center — stays visible through exit */}
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
        }}
      >
        <DuckbillLogo size={80} />
      </div>

      {/* LLM platform pills on ring */}
      {PLATFORMS.map((platform, index) => {
        // Beat-aligned ring start: ~1 beat after scene start + stagger
        const ringStartFrame = beatPhaseOffset + 14 + platform.staggerDelay;

        // Ring expansion spring
        const pillSpring = spring({
          frame: Math.max(0, frame - ringStartFrame),
          fps,
          config: springPresets.bouncy,
        });

        // Radial position: expand from center to ring
        const currentRadius = interpolate(pillSpring, [0, 1], [0, RING_RADIUS], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const pillScale = interpolate(pillSpring, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) * (1.0 + amplitude * 0.02);

        // Calculate position on ring
        const angleRad = (platform.angle * Math.PI) / 180;
        const x = CENTER_X + currentRadius * Math.cos(angleRad);
        const y = CENTER_Y + currentRadius * Math.sin(angleRad);

        // Ambient floating (frames 58-120)
        const floatY =
          frame >= 58
            ? Math.sin(frame * 0.08 + index * 1.2) * 3
            : 0;

        // Exit fade (frames 120-140) — pills fade out, logo stays
        const pillExitOpacity = interpolate(frame, [120, 140], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Don't render before entrance starts
        if (frame < ringStartFrame) return null;

        return (
          <div
            key={platform.name}
            style={{
              position: "absolute",
              left: x,
              top: y + floatY,
              transform: `translate(-50%, -50%) scale(${pillScale})`,
              transformOrigin: "center center",
              opacity: pillSpring * pillExitOpacity,
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
                whiteSpace: "nowrap",
              }}
            >
              <LogoImage src={platform.logoFile} />
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.neutral[900],
                }}
              >
                {platform.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
