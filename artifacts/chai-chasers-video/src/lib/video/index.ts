// Video template library - hook and animation presets

export { useVideoPlayer, useSceneTimer } from './hooks';
export type {
  SceneDurations,
  UseVideoPlayerOptions,
  UseVideoPlayerReturn,
} from './hooks';

export {
  springs,
  easings,
  sceneTransitions,
  elementAnimations,
  charVariants,
  charContainerVariants,
  staggerConfigs,
  containerVariants,
  itemVariants,
  staggerDelay,
  customSpring,
  withDelay,
  getSceneTransition,
  REDUCED_MOTION_TRANSITION,
} from './animations';
