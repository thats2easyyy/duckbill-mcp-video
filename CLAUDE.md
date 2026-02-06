# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills

Always use `/remotion-best-practices` when working with Remotion code in this project.

## Project Overview

Remotion-based promotional video for Duckbill MCP. Renders a ~29-second, 1080×1080 square video at 30 FPS. The composition is a TransitionSeries of 5 scenes with 15-frame fade transitions between them.

## Commands

```bash
# Launch interactive Remotion studio (preview + edit)
npm run studio

# Render final video (H.264, CRF 18) to ./out/duckbill-mcp-promo.mp4
npm run render
```

## Architecture

### Composition Flow

`DuckbillPromo.tsx` orchestrates the full video as a `TransitionSeries`:

```
IntroScene (156f) → StoryScene (300f) → CapabilitiesScene (180f) → LLMCompatibilityScene (150f) → TaglineScene (150f)
```

Each scene is also registered individually in `Root.tsx` for isolated preview in the studio.

### Key Directories

- `src/scenes/` — Self-contained scene components, each owning its own frame-based animation logic
- `src/components/` — Reusable animated components (message bubbles, status chips, kinetic text)
- `src/lib/` — Shared utilities: timing (`seconds()`, BPM, spring presets), colors (brand palette), fonts (PPNeueMontreal), exchanges (story content + phase timing)
- `public/` — Static assets: fonts (OTF), audio (MP3), images, logos, SVGs

### Timing System (`src/lib/timing.ts`)

- `FPS = 30` used everywhere; `seconds(s)` converts to frame count
- `BPM = 130` for beat-synced animations (CapabilitiesScene)
- Spring presets: `smooth` (damping 200), `snappy` (damping 20), `bouncy` (damping 8)
- Beat alignment via `computeNextBeatOffset()`

### Story Data (`src/lib/exchanges.ts`)

Contains the chat narrative content and computes phase timing (when text streams, tool calls appear, camera zooms, etc.). Phase offsets are derived from character counts and stream speeds.

### Brand System (`src/lib/colors.ts`)

Light-mode palette with tokens: `canvas` (#FAF9F7), `lime` (#eefb86), `mint` (#72C4A4), neutrals. Gradients defined for backgrounds and cards.

## Important Patterns

- **Deterministic rendering**: All randomness must use seeded generators (see `DisintegratingText.tsx`). Remotion renders frames independently, so `Math.random()` breaks reproducibility.
- **Frame-based animation**: Components receive frame offsets and use `useCurrentFrame()`, `spring()`, `interpolate()`, and `interpolateColors()` — no CSS animations.
- **Audio integration**: `CapabilitiesScene` uses `visualizeAudio()` for beat-reactive effects. Audio playback is in `DuckbillPromo.tsx` with volume envelope.
- **Tailwind CSS v4**: Configured via webpack override in `remotion.config.ts`. Available in all components.
- **Custom fonts**: PPNeueMontreal (book/medium/bold) loaded via `@remotion/fonts` in `src/lib/fonts.ts`. Always include fallback stack.
