import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export interface DisintegratingTextProps {
  /** The text to disintegrate */
  text: string;
  /** Frame at which disintegration begins */
  startFrame: number;
  /** Duration of disintegration in frames (default: 30) */
  duration?: number;
  /** Font size in pixels (default: 64) */
  fontSize?: number;
  /** Font weight (default: 500) */
  fontWeight?: number;
  /** Text color (default: #292929) */
  color?: string;
  /** Random seed for consistent particle behavior (default: 42) */
  seed?: number;
}

/**
 * Seeded random number generator for deterministic particle behavior.
 * Remotion requires deterministic renders, so we can't use Math.random().
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

interface ParticleData {
  char: string;
  vx: number; // velocity x
  vy: number; // velocity y (upward bias initially)
  rotation: number; // rotation speed
  delay: number; // staggered start delay (0-0.3)
}

/**
 * DisintegratingText — Text that explodes into individual character particles.
 *
 * Each character receives randomized velocity, rotation, and slight delay
 * for a staggered scatter effect. Gravity pulls particles downward over time.
 */
export const DisintegratingText: React.FC<DisintegratingTextProps> = ({
  text,
  startFrame,
  duration = 30,
  fontSize = 64,
  fontWeight = 500,
  color = "#292929",
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pre-compute particle data for each character (deterministic)
  const particles = useMemo<ParticleData[]>(() => {
    const random = seededRandom(seed);
    return text.split("").map((char) => ({
      char,
      vx: (random() - 0.5) * 300, // -150 to 150 px/s
      vy: (random() - 0.5) * 200 - 100, // -200 to 0 px/s (upward bias)
      rotation: (random() - 0.5) * 720, // -360 to 360 deg/s
      delay: random() * 0.3, // 0-30% delay
    }));
  }, [text, seed]);

  const localFrame = frame - startFrame;
  const gravity = 400; // px/s²

  // Before disintegration starts, render normal text
  if (localFrame < 0) {
    return (
      <span
        style={{
          display: "inline-flex",
          justifyContent: "center",
          fontSize,
          fontWeight,
          color,
          whiteSpace: "pre",
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {particles.map((particle, index) => {
        // Time in seconds, accounting for per-particle delay
        const delayFrames = particle.delay * duration;
        const particleLocalFrame = Math.max(0, localFrame - delayFrames);
        const t = particleLocalFrame / fps;

        // Physics: x = vx * t, y = vy * t + 0.5 * g * t²
        const x = particle.vx * t;
        const y = particle.vy * t + 0.5 * gravity * t * t;
        const rotation = particle.rotation * t;

        // Fade out and scale down
        const progress = interpolate(localFrame, [0, duration], [0, 1], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(progress, [0, 0.5, 1], [1, 0.8, 0]);
        const scale = interpolate(progress, [0, 1], [1, 0.6]);

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight,
              color,
              opacity,
              transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
              willChange: "transform, opacity",
              whiteSpace: "pre",
            }}
          >
            {particle.char}
          </span>
        );
      })}
    </span>
  );
};
