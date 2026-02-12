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
import { INTRO_SCENE_DURATION, FRAMES_PER_BEAT } from "../lib/timing";

loadBrandFonts();

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — IntroScene
 *
 * BPM 130 @ 30fps ≈ 13.85 frames/beat
 * Beat pattern: 4 – 2 – 2 (setup… boom… ba-BAM!)
 *
 *    0f  [beat 0]   P1 "AI is getting scary good" — words stagger in (4f apart)
 *   55f  [beat 4]   P1 scales down → snap off ↓ P2 "but" snaps on, scales down
 *   83f  [beat 6]   P2 snap off ↓ P3 "some things" snaps on, scales down
 *  111f  [beat 8]   P3 snap off ↓ P4 "still need a human" words punch in one by one (bouncy spring)
 *  150f             Global exit — scale 1.0 → 0.8, opacity → 0 (snappy spring)
 *  165f             Scene ends
 * ───────────────────────────────────────────────────────── */

// ── Timing ──────────────────────────────────────────────

const BEAT_TARGETS = [0, 4, 6, 8];

const TIMING = {
  phraseEnter: BEAT_TARGETS.map((b) => Math.round(b * FRAMES_PER_BEAT)),
  //           → [0, 55, 83, 111]
  wordStagger: 4,      // frames between words in phrase 1
  exitStart:   150,    // global exit begins
  exitFrames:  10,     // global exit duration
};

// ── Phrase data ─────────────────────────────────────────

interface PhraseConfig {
  text: string;
  emphasized: boolean;
  staggerWords: boolean;
}

const PHRASES: PhraseConfig[] = [
  { text: "AI is getting scary good", emphasized: false, staggerWords: true },
  { text: "but",                       emphasized: false, staggerWords: false },
  { text: "some things",               emphasized: false, staggerWords: false },
  { text: "still need a human",        emphasized: true,  staggerWords: true },
];

// ── Spring configs ──────────────────────────────────────

const SPRINGS = {
  base:     { damping: 100, stiffness: 220 },  // smooth settle
  emphasis: { damping: 15,  stiffness: 200 },  // bouncy punch
  exit:     { damping: 100, stiffness: 300 },    // snappy exit
};

// ── Element configs ─────────────────────────────────────

const ENTER = {
  base: {
    offsetY:      20,    // px to slide up from
    initialScale: 0.98,
    finalScale:   1.0,
  },
  emphasis: {
    offsetY:      30,    // px to slide up from (bigger punch)
    initialScale: 0.7,
    finalScale:   1.0,
  },
};

const EXIT = {
  globalScale: 0.8,     // scale down to on global exit
  slideY:      -10,     // px to slide up on phrase exit
};

// Instant-swap transitions: scale down then snap
const SWAP = {
  scaleDownLead:   9,     // P1: frames before exit to begin shrinking
  scaleDownTarget: 0.6,   // P1: scale at snap
  midScaleTarget:  0.85,  // P2/P3: scale at snap (less dramatic)
};

const BACKGROUND = {
  opacity:    0.18,     // sky photo opacity
  scaleStart: 1.0,     // Ken Burns start
  scaleEnd:   1.06,    // Ken Burns end
};

const TEXT = {
  fontSize:   66,
  fontWeight: 500 as const,
};

const AUDIO_SRC = staticFile("audio/Skyline Stutter.mp3");

// ── Scene ───────────────────────────────────────────────

interface IntroSceneProps {
  globalFrameOffset?: number;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  globalFrameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalFrame = frame + globalFrameOffset;

  // Audio-reactive amplitude
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

  // Global exit — smooth spring (replaces linear interpolate)
  const exitSpring = spring({
    frame: Math.max(0, frame - TIMING.exitStart),
    fps,
    config: SPRINGS.exit,
  });
  const isExiting = frame >= TIMING.exitStart;
  const exitScale = isExiting
    ? interpolate(exitSpring, [0, 1], [1, EXIT.globalScale])
    : 1;
  const exitOpacity = isExiting
    ? interpolate(exitSpring, [0, 1], [1, 0])
    : 1;

  // Backup fade at scene end
  const fadeOut = interpolate(
    frame,
    [INTRO_SCENE_DURATION - 5, INTRO_SCENE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Ken Burns scale
  const bgScale = interpolate(
    frame,
    [0, INTRO_SCENE_DURATION],
    [BACKGROUND.scaleStart, BACKGROUND.scaleEnd],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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
      {/* Sky photo background — Ken Burns */}
      <Img
        src={staticFile("images/DTS_Philia_Daniel_Far\u00F2_Photos_ID4676 2.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          objectFit: "cover",
          opacity: BACKGROUND.opacity,
          transform: `scale(${bgScale})`,
          zIndex: 0,
        }}
      />

      {/* Phrase container — all phrases stacked, individually animated */}
      <div
        style={{
          position: "relative",
          width: 900,
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${exitScale})`,
          opacity: exitOpacity,
          zIndex: 1,
        }}
      >
        {PHRASES.map((phrase, i) => (
          <PhraseLayer
            key={i}
            phrase={phrase}
            index={i}
            amplitude={amplitude}
          />
        ))}
      </div>
    </div>
  );
};

// ── PhraseLayer — each phrase has its own spring-driven enter/exit ──

const PhraseLayer: React.FC<{
  phrase: PhraseConfig;
  index: number;
  amplitude: number;
}> = ({ phrase, index, amplitude }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterFrame = TIMING.phraseEnter[index];
  const exitFrame =
    index < PHRASES.length - 1
      ? TIMING.phraseEnter[index + 1]
      : TIMING.exitStart;

  const enterConfig = phrase.emphasized ? ENTER.emphasis : ENTER.base;
  const springConfig = phrase.emphasized ? SPRINGS.emphasis : SPRINGS.base;

  // Enter spring — starts at enterFrame
  const enterProgress = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: springConfig,
  });

  // Exit spring — starts at exitFrame (smooth ease-out)
  const exitProgress = spring({
    frame: Math.max(0, frame - exitFrame),
    fps,
    config: SPRINGS.exit,
  });

  const hasEntered = frame >= enterFrame;
  const hasExited = frame >= exitFrame;

  // P1/P2/P3 snap off; P2/P3/P4 snap on
  const isInstantExit = index <= 2;
  const isInstantEnter = index >= 1;

  // ── Opacity ──
  const enterOpacity = isInstantEnter
    ? (hasEntered ? 1 : 0)                                    // snap on
    : (hasEntered ? Math.min(1, enterProgress) : 0);
  const exitOpacity = isInstantExit
    ? (hasExited ? 0 : 1)                                     // snap off
    : (hasExited ? interpolate(exitProgress, [0, 1], [1, 0]) : 1);
  const opacity = enterOpacity * exitOpacity;

  // ── Y position ──
  const enterY = isInstantEnter
    ? 0                                                        // no slide
    : (hasEntered ? interpolate(enterProgress, [0, 1], [enterConfig.offsetY, 0]) : enterConfig.offsetY);
  const exitY = isInstantExit
    ? 0                                                        // no slide
    : (hasExited ? interpolate(exitProgress, [0, 1], [0, EXIT.slideY]) : 0);

  // ── Scale ──
  // P4 (emphasized): bouncy spring scale 0.7 → 1.0
  // P2/P3: no enter scale anim (appear at full size)
  // P1: staggered words handle their own scale
  const enterScale = (phrase.staggerWords || (isInstantEnter && !phrase.emphasized))
    ? enterConfig.finalScale                                   // staggered words or P2/P3: no container scale
    : (hasEntered
        ? interpolate(enterProgress, [0, 1], [enterConfig.initialScale, enterConfig.finalScale])
        : enterConfig.initialScale);

  // Scale-down before snap-off
  let preExitScale = 1;
  if (isInstantExit) {
    if (index === 0) {
      // P1: spring-based shrink in final frames
      const scaleDownStart = exitFrame - SWAP.scaleDownLead;
      if (frame >= scaleDownStart) {
        preExitScale = interpolate(
          spring({ frame: frame - scaleDownStart, fps, config: SPRINGS.base }),
          [0, 1],
          [1, SWAP.scaleDownTarget],
        );
      }
    } else {
      // P2/P3: linear shrink over full visible duration
      preExitScale = interpolate(
        frame,
        [enterFrame, exitFrame],
        [1, SWAP.midScaleTarget],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
    }
  }

  // Audio-reactive scale
  const audioScale = phrase.emphasized
    ? 1.0 + amplitude * 0.04
    : 1.0 + amplitude * 0.025;

  // Skip rendering invisible phrases
  if (opacity <= 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        textAlign: "center",
        lineHeight: 1.3,
        opacity,
        transform: `translateY(${enterY + exitY}px) scale(${enterScale * audioScale * preExitScale})`,
      }}
    >
      {phrase.staggerWords ? (
        phrase.emphasized ? (
          <StaggeredPunchWords text={phrase.text} startFrame={enterFrame} />
        ) : (
          <StaggeredWords text={phrase.text} startFrame={enterFrame} />
        )
      ) : (
        <span
          style={{
            display: "inline-block",
            fontSize: TEXT.fontSize,
            fontWeight: TEXT.fontWeight,
            color: lightMode.bodyText,
          }}
        >
          {phrase.text}
        </span>
      )}
    </div>
  );
};

// ── StaggeredPunchWords — word-by-word bouncy entrance, all stay visible ──

const PUNCH_STAGGER = 5; // frames between word entrances

const StaggeredPunchWords: React.FC<{
  text: string;
  startFrame: number;
}> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.7em",
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * PUNCH_STAGGER;
        const localFrame = frame - wordStart;
        const progress = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: SPRINGS.emphasis,
        });

        const opacity = localFrame < 0 ? 0 : Math.min(1, progress);
        const translateY =
          localFrame < 0
            ? ENTER.emphasis.offsetY
            : interpolate(progress, [0, 1], [ENTER.emphasis.offsetY, 0]);
        const scale =
          localFrame < 0
            ? ENTER.emphasis.initialScale
            : interpolate(
                progress,
                [0, 1],
                [ENTER.emphasis.initialScale, ENTER.emphasis.finalScale],
              );

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize: TEXT.fontSize,
              fontWeight: TEXT.fontWeight,
              color: lightMode.bodyText,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

// ── StaggeredWords — word-by-word spring entrance for phrase 1 ──

const StaggeredWords: React.FC<{
  text: string;
  startFrame: number;
}> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.7em",
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * TIMING.wordStagger;
        const localFrame = frame - wordStart;
        const progress = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: SPRINGS.base,
        });

        const opacity = localFrame < 0 ? 0 : Math.min(1, progress);
        const translateY =
          localFrame < 0
            ? ENTER.base.offsetY
            : interpolate(progress, [0, 1], [ENTER.base.offsetY, 0]);
        const scale =
          localFrame < 0
            ? ENTER.base.initialScale
            : interpolate(
                progress,
                [0, 1],
                [ENTER.base.initialScale, ENTER.base.finalScale],
              );

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize: TEXT.fontSize,
              fontWeight: TEXT.fontWeight,
              color: lightMode.bodyText,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
