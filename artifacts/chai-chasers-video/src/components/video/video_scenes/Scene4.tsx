import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  // Scene 4 duration: 9s
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Show Browser Window
      setTimeout(() => setPhase(2), 2000),  // "Built in public" text
      setTimeout(() => setPhase(3), 4000),  // Butterfly flies in
      setTimeout(() => setPhase(4), 5500),  // Final emotional payoff
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...sceneTransitions.splitHorizontal}
    >
      <div className="absolute inset-0 bg-[#0a0a20]/80 backdrop-blur-md" />

      {/* 3D Browser Window (Arcade Page) */}
      <motion.div
        className="absolute top-[15vh] w-[60vw] rounded-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/20 z-20"
        initial={{ opacity: 0, y: 100, rotateX: 30, transformPerspective: 1000 }}
        animate={
          phase >= 1 
            ? { opacity: 1, y: 0, rotateX: 10, scale: 0.9, transformPerspective: 1000 } 
            : { opacity: 0, y: 100 }
        }
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Browser Chrome */}
        <div className="h-8 bg-slate-900 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <img 
          src={`${import.meta.env.BASE_URL}images/glee-fully-arcade.png`} 
          alt="Arcade" 
          className="w-full object-cover border-none block" 
        />
      </motion.div>

      {/* Replit Designathon Badge */}
      <motion.div
        className="absolute top-[25vh] right-[15vw] z-30"
        initial={{ opacity: 0, scale: 0, rotate: -20 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1, rotate: 10 } : { opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="bg-bg-light/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
          <p className="font-display font-bold text-lg text-white">REPLIT</p>
          <p className="font-display font-bold text-3xl text-gradient-uniglee uppercase tracking-wider">Designathon</p>
          <p className="text-slate-400 mt-2 font-mono text-sm">Built in public.</p>
        </div>
      </motion.div>

      {/* UniGlee Butterfly */}
      <motion.div
        className="absolute left-[20vw] bottom-[30vh] z-40 w-48 h-48 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/generated/uniglee.png')` }}
        initial={{ opacity: 0, x: -150, y: 150, scale: 0.5 }}
        animate={
          phase >= 3 
            ? { 
                opacity: 1, 
                x: 0, 
                y: 0, 
                scale: 1,
                rotate: [-5, 5, -5] 
              } 
            : { opacity: 0 }
        }
        transition={{ 
          opacity: { duration: 1 },
          scale: { duration: 1, type: 'spring' },
          x: { duration: 1.5, ease: 'easeOut' },
          y: { duration: 1.5, ease: 'easeOut' },
          rotate: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
        }}
      />

      {/* Payoff Text */}
      <motion.div
        className="absolute bottom-[15vh] w-full text-center z-40"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1, ease: 'circOut' }}
      >
        <h2 className="font-display font-bold text-4xl text-white mb-2">
          Built as a gift.
        </h2>
        <h2 className="font-display font-bold text-5xl text-gradient-gold">
          Free for everyone.
        </h2>
      </motion.div>

    </motion.div>
  );
}
