import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence } from 'framer-motion';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { BackgroundEffects } from './video_scenes/BackgroundEffects';

export const SCENE_DURATIONS: Record<string, number> = {
  scene1: 14000,
  scene2: 20000,
  scene3: 18000,
  scene6: 22000,
  scene7: 18000,
  scene4: 14000,
  scene5: 14000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  scene1: Scene1,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
  scene6: Scene6,
  scene7: Scene7,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const voice = voiceRef.current;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (audio) {
      audio.volume = 0.22;
      if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) audio.currentTime = targetTime;
      audio.play().catch(() => {});
    }
    if (voice) {
      voice.volume = 0.92;
      if (Math.abs(voice.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) voice.currentTime = targetTime;
      voice.play().catch(() => {});
    }
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <>
      <div
        className="w-full h-screen overflow-hidden relative"
        style={{ backgroundColor: 'var(--color-bg-dark)' }}
      >
        {/* Background elements that persist across scenes for continuous motion */}
        <BackgroundEffects currentScene={sceneIndex} />

        {/* mode="sync" to overlap transitions */}
        <AnimatePresence mode="sync">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
      </div>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        loop
        muted={muted}
      />
      <audio
        ref={voiceRef}
        src={`${import.meta.env.BASE_URL}audio/chai-chasers-third-cut-voiceover.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </>
  );
}
