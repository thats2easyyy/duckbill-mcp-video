import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, interpolateColors } from "remotion";
import { springPresets } from "../lib/timing";
import { colors } from "../lib/colors";
import { fontFamily } from "../lib/fonts";

/**
 * Animated phone-call status pill.
 *
 * Visual: [📞 Calling Presidio Hill School ● ● ●]
 *
 * Animation lifecycle:
 *   0–12:  Pill springs in (translateY + opacity), phone icon 3 frames later
 *   12+:   Dots pulse in staggered wave
 *   connectedStart: Background transitions from cream → mint over 10 frames
 *   completionStart: Pill expands into rounded rect with confirmation text,
 *          dots fade out, background transitions to white
 *
 * Hero mode (hero={true}):
 *   - Larger phone icon (24px), label font (22px), padding (14px 28px)
 *   - Box-shadow glow pulsing
 *   - Completion height: 100px, text 18px
 */
export const CallStatusChip: React.FC<{
  label: string;
  startFrame: number;
  connectedStart?: number;
  completionText?: string;
  completionStart?: number;
  hero?: boolean;
}> = ({ label, startFrame, connectedStart, completionText, completionStart, hero = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;

  // ── Hero-mode dimensions ──
  const iconSize = hero ? 24 : 18;
  const labelFontSize = hero ? 22 : 16;
  const chipPadding = hero ? "14px 28px" : "0px 20px";
  const completionHeight = hero ? 100 : 90;
  const completionFontSize = hero ? 18 : 16;

  // ── Entrance (spring in over ~12 frames) ──
  const entranceProgress = spring({
    frame: localFrame,
    fps,
    config: springPresets.snappy,
  });

  // translateY removed — ChipSlot's height spring handles the entrance animation

  // ── Phone icon entrance (3 frames delayed, with scale overshoot) ──
  const phoneProgress = spring({
    frame: localFrame - 3,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const phoneScale = interpolate(phoneProgress, [0, 0.7, 1], [0, 1.15, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const opacity = entranceProgress;

  // ── Color transition: cream → mint (over 10 frames at connectedStart) ──
  const connectedLocalFrame = connectedStart !== undefined ? frame - connectedStart : -1;
  const colorProgress = connectedStart !== undefined
    ? interpolate(connectedLocalFrame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 1; // No connectedStart → start at mint (backwards compat)

  // Colors stay cream throughout — no green transition
  const chipBg = colors.cream[50];
  const chipBorder = colors.cream[300];
  const iconColor = colors.neutral[600];
  const dotColor = colors.neutral[600];

  // ── Completion transition ──
  const isCompleting = completionStart !== undefined && frame >= completionStart;
  const completionLocalFrame = isCompleting ? frame - completionStart : 0;

  const completionProgress = isCompleting
    ? spring({
        frame: completionLocalFrame,
        fps,
        config: { damping: 200 },
      })
    : 0;

  // Dots fade out during completion
  const dotsOpacity = isCompleting
    ? interpolate(completionLocalFrame, [0, 8], [1, 0], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 1;

  // Phone icon adjustments during completion
  const completionPhoneScale = isCompleting
    ? interpolate(completionProgress, [0, 1], [1, 0.85])
    : 1;
  const completionPhoneOpacity = isCompleting
    ? interpolate(completionProgress, [0, 1], [1, 0.6])
    : 1;

  // ── Hero glow (box-shadow pulsing) ──
  const ringCycle = localFrame % 30;
  const glowRadius = hero && localFrame >= 6 && localFrame < 100 && !isCompleting
    ? interpolate(ringCycle, [0, 20], [4, 20], { extrapolateRight: "clamp" })
    : 0;
  const glowOpacity = hero && localFrame >= 6 && localFrame < 100 && !isCompleting
    ? interpolate(ringCycle, [0, 20], [0.4, 0], { extrapolateRight: "clamp" })
    : 0;

  // ── Border pulse (gentle opacity oscillation) ──
  const borderPulse =
    localFrame >= 12 && localFrame < 100 && !isCompleting
      ? 0.8 + 0.2 * Math.sin((localFrame - 12) * 0.25)
      : 1;

  // Compute the final border color — use pulsing opacity when no connectedStart,
  // otherwise blend between cream and mint with the pulse
  const finalBorderColor = localFrame >= 12 && localFrame < 100 && !isCompleting
    ? interpolateColors(borderPulse, [0.8, 1], [
        `rgba(235, 233, 227, 0.8)`,
        chipBorder,
      ])
    : chipBorder;

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
          flexDirection: "column",
          gap: isCompleting ? 6 : 0,
          height: interpolate(completionProgress, [0, 1], [hero ? 52 : 44, completionHeight]),
          borderRadius: interpolate(completionProgress, [0, 1], [hero ? 26 : 22, 16]),
          padding: isCompleting
            ? `${interpolate(completionProgress, [0, 1], [0, 12])}px ${hero ? 28 : 20}px`
            : chipPadding,
          backgroundColor: isCompleting
            ? interpolateColors(completionProgress, [0, 1], [chipBg, '#FFFFFF'])
            : chipBg,
          border: `${interpolate(completionProgress, [0, 1], [1.5, 2])}px solid ${
            isCompleting
              ? interpolateColors(completionProgress, [0, 1], [chipBorder, colors.cream[300]])
              : finalBorderColor
          }`,
          boxShadow: glowRadius > 0
            ? `0 0 ${glowRadius}px rgba(209, 209, 209, ${glowOpacity})`
            : 'none',
          justifyContent: "center",
          fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        }}
      >
        {/* Top row: phone icon + label + dots */}
        <div style={{ display: "flex", alignItems: "center", gap: hero ? 12 : 10 }}>
          {/* Phone icon → Checkmark crossfade */}
          <div style={{ position: "relative", width: iconSize, height: iconSize, flexShrink: 0 }}>
            {/* Phone icon SVG — fades out at connectedStart */}
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: `scale(${phoneScale * completionPhoneScale})`,
                opacity: completionPhoneOpacity * (1 - colorProgress),
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <path
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                fill={iconColor}
              />
            </svg>
            {/* Checkmark icon — fades in at connectedStart */}
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: colorProgress,
              }}
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke={iconColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Label text */}
          <span
            style={{
              color: colors.neutral[800],
              fontSize: labelFontSize,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>

          {/* Pulsing dots — fade out during completion AND when connected */}
          <div style={{
            opacity: dotsOpacity * (1 - colorProgress),
            width: interpolate(colorProgress, [0, 1], [hero ? 33 : 25, 0], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            }),
            marginLeft: interpolate(colorProgress, [0, 1], [0, hero ? -12 : -10], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            }),
            overflow: "hidden",
          }}>
            <PulsingDots localFrame={localFrame} hero={hero} dotColor={dotColor} />
          </div>
        </div>

        {/* Bottom row: completion text */}
        {isCompleting && completionText && (
          <div style={{
            color: colors.neutral[800],
            fontSize: completionFontSize,
            fontWeight: 400,
            lineHeight: 1.4,
            opacity: interpolate(completionLocalFrame, [0, 6], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            }),
            paddingLeft: hero ? 36 : 28,
          }}>
            {completionText}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Three dots that pulse in a staggered wave pattern.
 * Each dot is offset by ~5 frames for a cascading effect.
 */
const PulsingDots: React.FC<{ localFrame: number; hero?: boolean; dotColor?: string }> = ({ localFrame, hero = false, dotColor }) => {
  const dotSize = hero ? 7 : 5;
  const color = dotColor || colors.mint[600];

  return (
    <div style={{ display: "flex", gap: hero ? 5 : 4, alignItems: "center", marginLeft: 2 }}>
      {[0, 1, 2].map((i) => {
        // 24-frame cycle (~0.8s at 30fps), staggered by 5 frames per dot
        const phase = ((localFrame - i * 5) % 24) / 24;
        const dotOpacity = 0.3 + 0.7 * Math.sin(phase * Math.PI);
        const dotScale = 0.8 + 0.2 * Math.sin(phase * Math.PI);

        return (
          <div
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: dotOpacity,
              transform: `scale(${dotScale})`,
            }}
          />
        );
      })}
    </div>
  );
};
