import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface BackgroundEffectsProps {
  currentScene: number;
}

// Stable random values computed once at module load — never re-computed during renders
const FIREFLY_COUNT = 15;
const FIREFLY_DATA = Array.from({ length: FIREFLY_COUNT }, () => ({
  x0: Math.random() * 100,
  y0: Math.random() * 100,
  x1: Math.random() * 100,
  y1: Math.random() * 100,
  x2: Math.random() * 100,
  y2: Math.random() * 100,
  dur: 10 + Math.random() * 10,
}));

export function BackgroundEffects({ currentScene }: BackgroundEffectsProps) {
  // We use the full game splash as a parallax background for scene 1, 
  // then we transition to abstract cosmic gradients for later scenes.
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#0a0a20]">
      {/* Aurora glow blobs that shift position based on scene */}
      <motion.div
        className="absolute rounded-full blur-[100px] opacity-40 mix-blend-screen"
        animate={{
          x: currentScene === 0 ? '-10vw' : currentScene === 2 ? '50vw' : '20vw',
          y: currentScene === 0 ? '-20vh' : currentScene === 1 ? '40vh' : '-10vh',
          scale: currentScene === 3 ? 1.5 : 1,
          backgroundColor: currentScene === 4 ? '#d946ef' : '#10b981',
          width: '60vw',
          height: '60vh',
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute rounded-full blur-[120px] opacity-30 mix-blend-screen"
        animate={{
          x: currentScene === 1 ? '70vw' : currentScene === 3 ? '10vw' : '60vw',
          y: currentScene === 0 ? '60vh' : currentScene === 4 ? '50vh' : '20vh',
          scale: currentScene === 1 ? 2 : 1,
          backgroundColor: currentScene === 0 ? '#3b82f6' : '#8b5cf6',
          width: '50vw',
          height: '50vh',
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />

      {/* Persistent Fireflies - stable positions, no Math.random() during render */}
      <div className="absolute inset-0 opacity-20">
        {FIREFLY_DATA.map((f, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-warning shadow-[0_0_8px_2px_rgba(245,158,11,0.8)]"
            initial={{
              x: `${f.x0}vw`,
              y: `${f.y0}vh`,
            }}
            animate={{
              y: [`${f.y1}vh`, `${f.y2}vh`],
              x: [`${f.x1}vw`, `${f.x2}vw`],
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: f.dur,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* The main hero splash image - heavily used in scene 1, fades to just a subtle backdrop later */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}images/glee-fully-arcade.png')`,
        }}
        animate={{
          scale: currentScene === 0 ? 1 : currentScene === 1 ? 1.2 : 1.3,
          y: currentScene === 0 ? 0 : currentScene === 1 ? '-20vh' : '-30vh',
          opacity: currentScene === 0 ? 1 : currentScene === 4 ? 0 : 0.15,
          filter: currentScene === 0 ? 'blur(0px)' : 'blur(10px)',
        }}
        transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
      />
      
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}
