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
import { lightMode } from "../lib/colors";
import { fontFamily, loadBrandFonts } from "../lib/fonts";
import {
  springPresets,
  INTRO_SCENE_DURATION,
  FRAMES_PER_BEAT,
} from "../lib/timing";

loadBrandFonts();

/**
 * Phrase config with different animation styles for variety.
 */
type AnimationStyle = "slideUp" | "scaleIn" | "fadeIn";

interface PhraseConfig {
  text: string;
  style: AnimationStyle;
}

const PHRASES: PhraseConfig[] = [
  { text: "AI can do almost anything.", style: "slideUp" },
  { text: "But can it", style: "fadeIn" },
  { text: "pick up the phone?", style: "scaleIn" },
];

// Beat-aligned phrase start frames (computed at module level for determinism)
// Phrase 1 at beat 0, phrase 2 at beat 4, phrase 3 at beat 8
const PHRASE_BEAT_TARGETS = [0, 4, 8];
const PHRASE_START_FRAMES = PHRASE_BEAT_TARGETS.map((beatNum) =>
  Math.round(beatNum * FRAMES_PER_BEAT)
);
// Exit starts after last phrase has had time to display (5 beats hold = 69 frames)
const LAST_PHRASE_HOLD = 69;
const EXIT_START =
  PHRASE_START_FRAMES[PHRASE_START_FRAMES.length - 1] + LAST_PHRASE_HOLD; // beat 13 ≈ frame 180
const EXIT_DURATION = 30;

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

/**
 * IntroScene — 210 frames (7.0s at 30fps).
 *
 * Kinetic typography opening:
 *   - 3 phrases appear centered, one at a time, beat-aligned
 *   - "AI can do almost anything." (slideUp — classic setup)
 *   - "But can it" (fadeIn — quiet pivot)
 *   - "pick up the phone?" (scaleIn — punchy payoff)
 *   - Each phrase exits before the next enters
 *   - Final exit animation: scale down + fade out
 *   - Audio-reactive scale pulse on active phrase
 */

interface IntroSceneProps {
  globalFrameOffset?: number;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  globalFrameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalFrame = frame + globalFrameOffset;

  // Audio data for audio-reactive effects
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

  // Determine which phrase is active based on beat-aligned start frames
  let phraseIndex = 0;
  for (let i = PHRASE_START_FRAMES.length - 1; i >= 0; i--) {
    if (frame >= PHRASE_START_FRAMES[i]) {
      phraseIndex = i;
      break;
    }
  }
  const isExiting = frame >= EXIT_START;
  const currentPhrase = PHRASES[phraseIndex];

  // Phrase exit dissolve — fade out in last 8 frames before next phrase starts
  // Skip for the last phrase: the exit animation handles its fade-out instead
  const phraseLocalFrame = frame - PHRASE_START_FRAMES[phraseIndex];
  const isLastPhrase = phraseIndex === PHRASES.length - 1;
  const nextPhraseStart = isLastPhrase
    ? EXIT_START
    : PHRASE_START_FRAMES[phraseIndex + 1];
  const phraseDuration = nextPhraseStart - PHRASE_START_FRAMES[phraseIndex];
  const phraseExitOpacity = isExiting || isLastPhrase
    ? 1
    : interpolate(
        phraseLocalFrame,
        [phraseDuration - 8, phraseDuration],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  // Exit animation: scale down and fade out
  const exitProgress = interpolate(
    frame,
    [EXIT_START, EXIT_START + EXIT_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitScale = isExiting ? interpolate(exitProgress, [0, 1], [1, 0.8]) : 1;
  const exitOpacity = isExiting ? interpolate(exitProgress, [0, 1], [1, 0]) : 1;

  // Fade out at the very end (backup)
  const fadeOut = interpolate(
    frame,
    [INTRO_SCENE_DURATION - 5, INTRO_SCENE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        backgroundColor: lightMode.canvas,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif`,
        opacity: fadeOut,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sky photo background — Ken Burns scale 1.0 → 1.06 */}
      <Img
        src={staticFile("images/DTS_Philia_Daniel_Far\u00F2_Photos_ID4676 2.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          objectFit: "cover",
          opacity: 0.18,
          transform: `scale(${interpolate(frame, [0, INTRO_SCENE_DURATION], [1.0, 1.06], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
          zIndex: 0,
        }}
      />
      <div
        style={{
          width: 900,
          textAlign: "center",
          lineHeight: 1.3,
          transform: `scale(${exitScale * (1.0 + amplitude * 0.025)})`,
          opacity: exitOpacity * phraseExitOpacity,
          zIndex: 1,
        }}
      >
        <AnimatedPhrase
          key={phraseIndex}
          phrase={currentPhrase.text}
          style={currentPhrase.style}
          startFrame={PHRASE_START_FRAMES[phraseIndex]}
        />
      </div>
    </div>
  );
};

/**
 * Get animation properties based on style
 */
function getAnimationProps(
  style: AnimationStyle,
  progress: number
): { opacity: number; transform: string } {
  switch (style) {
    case "slideUp": {
      const translateY = interpolate(progress, [0, 1], [40, 0]);
      const opacity = interpolate(progress, [0, 1], [0, 1]);
      return { opacity, transform: `translateY(${translateY}px)` };
    }
    case "scaleIn": {
      const scale = interpolate(progress, [0, 1], [0.5, 1]);
      const opacity = interpolate(progress, [0, 1], [0, 1]);
      return { opacity, transform: `scale(${scale})` };
    }
    case "fadeIn": {
      const opacity = interpolate(progress, [0, 1], [0, 1]);
      const scale = interpolate(progress, [0, 1], [0.95, 1]);
      return { opacity, transform: `scale(${scale})` };
    }
  }
}

/**
 * Get initial (hidden) animation properties based on style
 */
function getInitialProps(style: AnimationStyle): { opacity: number; transform: string } {
  switch (style) {
    case "slideUp":
      return { opacity: 0, transform: "translateY(40px)" };
    case "scaleIn":
      return { opacity: 0, transform: "scale(0.5)" };
    case "fadeIn":
      return { opacity: 0, transform: "scale(0.95)" };
  }
}

/**
 * AnimatedPhrase — Animates words with stagger and configurable style
 */
const AnimatedPhrase: React.FC<{
  phrase: string;
  style: AnimationStyle;
  startFrame: number;
}> = ({ phrase, style, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = phrase.split(" ");

  const STAGGER_FRAMES = 5; // frames between each word

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.7em",
      }}
    >
      {words.map((word, index) => {
        const wordStart = startFrame + index * STAGGER_FRAMES;
        const localFrame = frame - wordStart;

        const progress = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: springPresets.snappy,
        });

        // Before animation starts
        if (localFrame < 0) {
          const initial = getInitialProps(style);
          return (
            <span
              key={index}
              style={{
                display: "inline-block",
                fontSize: 64,
                fontWeight: 500,
                color: lightMode.bodyText,
                ...initial,
              }}
            >
              {word}
            </span>
          );
        }

        const animProps = getAnimationProps(style, progress);

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              fontSize: 64,
              fontWeight: 500,
              color: lightMode.bodyText,
              opacity: animProps.opacity,
              transform: animProps.transform,
              willChange: "transform, opacity",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
