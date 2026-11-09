import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { StoryShort, calcStoryMetadata, StoryProps } from "./videos/story/StoryShort";
import { DEMO_STORYBOARD } from "./videos/story/demo";

// BridgeShort: the upstream template (reference / regression only, MIT, Mr omi).
// StoryShort: AI Reels Studio's generic engine; the storyboard arrives as inputProps (projects/<id>/storyboard/storyboard.json).
export const Root: React.FC = () => (
  <>
    <Composition id="StoryShort" component={StoryShort} durationInFrames={DEMO_STORYBOARD.durationInFrames} fps={30} width={1080} height={1920}
      defaultProps={{ storyboard: DEMO_STORYBOARD } as StoryProps} calculateMetadata={calcStoryMetadata} />
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
