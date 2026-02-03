import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { ChatScene } from "./scenes/ChatScene";
import { HandoffScene } from "./scenes/HandoffScene";
import { ResultScene } from "./scenes/ResultScene";
import { CTAScene } from "./scenes/CTAScene";
import { sceneFrames } from "./lib/timing";

/**
 * Main composition — orchestrates all 4 scenes sequentially.
 *
 * Each scene is wrapped in a <Sequence> with calculated `from` offsets.
 * Inside each Sequence, useCurrentFrame() returns LOCAL frame (starting at 0),
 * which is exactly what each scene component expects.
 *
 * premountFor is set to 1 second (30 frames) so the next scene's
 * fonts and assets preload before it becomes visible.
 */
export const DuckbillPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  const chatStart = 0;
  const handoffStart = sceneFrames.chat;
  const resultStart = handoffStart + sceneFrames.handoff;
  const ctaStart = resultStart + sceneFrames.result;

  return (
    <>
      <Sequence
        from={chatStart}
        durationInFrames={sceneFrames.chat}
        name="Chat"
        premountFor={1 * fps}
      >
        <ChatScene />
      </Sequence>

      <Sequence
        from={handoffStart}
        durationInFrames={sceneFrames.handoff}
        name="Handoff"
        premountFor={1 * fps}
      >
        <HandoffScene />
      </Sequence>

      <Sequence
        from={resultStart}
        durationInFrames={sceneFrames.result}
        name="Result"
        premountFor={1 * fps}
      >
        <ResultScene />
      </Sequence>

      <Sequence
        from={ctaStart}
        durationInFrames={sceneFrames.cta}
        name="CTA"
        premountFor={1 * fps}
      >
        <CTAScene />
      </Sequence>
    </>
  );
};
