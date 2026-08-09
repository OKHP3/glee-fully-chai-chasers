import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';
import { useEffect, useMemo, useState } from 'react';
import standardAtlas from '@game-assets/atlases/standard-symbol-atlas.webp';

// Stable per-tile random values — computed once at module load, never during render
const TILE_COUNT = 20;
const TILE_DATA = Array.from({ length: TILE_COUNT }, () => ({
  beamUp: Math.random() > 0.5,
  dropDelay: Math.random() * 0.5,
  beamDelay: Math.random() * 1.5,
}));

// Coordinates mirror src/ui/asset-manifest.ts. The reel is intentionally
// rendered from the production atlas, never from emoji or placeholder art.
const BOARD_SYMBOLS = [
  [0, 0], [1, 0], [2, 0], [3, 0],
  [0, 1], [1, 1], [2, 1], [3, 1],
  [0, 2], [1, 2], [2, 2], [3, 2],
  [0, 3], [1, 3], [2, 3], [3, 3],
  [0, 1], [1, 0], [2, 3], [3, 0],
] as const;

export function Scene2() {
  const [phase, setPhase] = useState(0);

  // Choreography for Scene 2 (Duration: 10s)
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),   // Show Sparkle Button
      setTimeout(() => setPhase(2), 2000),  // Button clicked! 
      setTimeout(() => setPhase(3), 2500),  // Cascades start
      setTimeout(() => setPhase(4), 5000),  // Cascades chain, text appears
      setTimeout(() => setPhase(5), 7000),  // Firefly jar fills
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.zoomThrough}
    >
      <div className="absolute inset-0 bg-[#0a0a20]/70" />

      {/* Hero SPARKLE Button */}
      <motion.div
        className="absolute bottom-[20vh] z-30"
        initial={{ opacity: 0, y: 100 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          animate={phase === 2 ? { scale: 0.9, y: 5 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="px-12 py-4 rounded-full bg-gradient-to-r from-accent to-pink-500 shadow-[0_0_40px_rgba(217,70,239,0.5)] border-2 border-white/20"
        >
          <span className="font-display font-bold text-3xl tracking-widest text-white">SPARKLE!</span>
        </motion.div>
      </motion.div>

      {/* Production-symbol board: a visual shorthand for the live 5×4 game. */}
      <div className="absolute top-[20vh] w-[60vw] h-[50vh] grid grid-cols-5 gap-4 perspective-[1000px]">
        {TILE_DATA.map((tile, i) => (
          <motion.div
            key={i}
            className="w-full h-full flex items-center justify-center rounded-xl glass-panel text-4xl"
            initial={{ opacity: 0, y: -200, rotateX: 45 }}
            animate={
              phase >= 3
                ? { 
                    opacity: [0, 1, 0.8],
                    y: 0, 
                    rotateX: 0,
                    // Cascade beam up effect if phase >= 4 — use stable per-tile flag
                    ...(phase >= 4 && tile.beamUp ? {
                      y: -200,
                      opacity: 0,
                      scale: 1.5,
                      filter: 'blur(10px)',
                    } : {})
                  }
                : { opacity: 0, y: -200 }
            }
            transition={{ 
              duration: 0.8, 
              delay: phase >= 4 ? tile.beamDelay : tile.dropDelay,
              ease: 'circOut'
            }}
          >
            <span
              className="w-[78%] h-[78%] bg-no-repeat rounded-lg drop-shadow-[0_3px_4px_rgba(0,0,0,0.42)]"
              style={{
                backgroundImage: `url(${standardAtlas})`,
                backgroundSize: '400% 400%',
                backgroundPosition: `${(BOARD_SYMBOLS[i][0] / 3) * 100}% ${(BOARD_SYMBOLS[i][1] / 3) * 100}%`,
              }}
              aria-hidden="true"
            />
          </motion.div>
        ))}
      </div>

      {/* Kinetic Typography */}
      <div className="absolute left-[5vw] top-[30vh] z-40">
        <motion.h2
          className="font-display font-bold text-[5vw] text-white leading-tight"
          initial={{ opacity: 0, x: -50, clipPath: 'inset(0 100% 0 0)' }}
          animate={phase >= 4 ? { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Winning symbols<br />
          <span className="text-gradient-magenta">beam up.</span>
        </motion.h2>
      </div>

      <div className="absolute right-[5vw] top-[45vh] z-40 text-right">
        <motion.h2
          className="font-display font-bold text-[5vw] text-white leading-tight"
          initial={{ opacity: 0, x: 50, clipPath: 'inset(0 0 0 100%)' }}
          animate={phase >= 4 ? { opacity: 1, x: 0, clipPath: 'inset(0 0 0 0%)' } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          New ones<br />
          <span className="text-gradient-aurora">tumble down.</span>
        </motion.h2>
      </div>

      {/* Firefly Jar Fill */}
      <motion.div
        className="absolute right-[10vw] bottom-[15vh] z-50 flex items-center gap-6"
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 5 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="text-right">
          <p className="font-display font-bold text-2xl text-warning">FIREFLY CASCADE</p>
          <p className="text-slate-300 font-medium">Reach 6 for free spins</p>
        </div>
        <div className="relative w-32 h-32 rounded-2xl glass-panel overflow-hidden border-warning/50 border-2">
          {/* Jar image overlay */}
          <div 
            className="absolute inset-0 bg-contain bg-center bg-no-repeat z-10"
            style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/generated/firefly-jar.jpg')` }}
          />
          {/* Fill meter */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-warning/40 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-0"
            initial={{ height: '0%' }}
            animate={phase >= 5 ? { height: '100%' } : { height: '0%' }}
            transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
