import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  // Scene 3 duration: 10s
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Show Treat Jar
      setTimeout(() => setPhase(2), 2000),  // Joey & Phoebe pop in
      setTimeout(() => setPhase(3), 4500),  // Sparkle Wheel appears
      setTimeout(() => setPhase(4), 5500),  // Wheel spins
      setTimeout(() => setPhase(5), 7500),  // Wheel results
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.perspectiveFlip}
    >
      {/* Treat Jar Section */}
      <motion.div
        className="absolute left-[10vw] top-[20vh] w-[35vw]"
        initial={{ opacity: 0, x: -100 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
      >
        <h2 className="font-display font-bold text-5xl text-white mb-6">
          Stock the <span className="text-gradient-gold">Treat Jar</span>
        </h2>
        
        <div className="space-y-6">
          <motion.div 
            className="flex items-center gap-4 glass-panel p-4 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-4xl">🐟</div>
            <div>
              <p className="font-bold text-xl text-white">Chicken Comets & Salmon Stars</p>
              <p className="text-slate-300">Phoebe will help for anything!</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4 glass-panel p-4 rounded-2xl border-primary/30"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-4xl">🥩</div>
            <div>
              <p className="font-bold text-xl text-primary">Bougie Bites</p>
              <p className="text-slate-300">Joey holds out for the good stuff.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sparkle Wheel Section */}
      <motion.div
        className="absolute right-[10vw] top-[25vh] flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <h3 className="font-display font-bold text-3xl text-center text-white mb-8">
          Joey & Phoebe's<br />
          <span className="text-gradient-magenta text-5xl">Sparkle Wheel</span>
        </h3>
        
        <div className="relative w-[30vh] h-[30vh]">
          {/* Wheel */}
          <motion.div
            className="absolute inset-0 rounded-full border-8 border-white/10"
            style={{ 
              background: 'conic-gradient(from 0deg, var(--color-primary) 0 120deg, var(--color-accent) 120deg 240deg, var(--color-success) 240deg 360deg)',
              boxShadow: '0 0 50px rgba(217, 70, 239, 0.4)'
            }}
            animate={
              phase >= 4 
                ? { rotate: [0, 1080 + 120] } // Spins 3 times + lands on accent
                : { rotate: 0 }
            }
            transition={{ duration: 2.5, ease: [0.2, 0.8, 0.2, 1] }}
          />
          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-bg-dark border-4 border-white z-10" />
          
          {/* Pointer */}
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white z-20" />
        </div>

        {/* Results */}
        <div className="mt-12 h-24 flex items-center justify-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={phase >= 5 ? { opacity: 1, scale: 1, rotate: 10 } : { opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-24 h-32 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/generated/chai-cup.jpg')` }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={phase >= 5 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-left"
          >
            <p className="font-display font-bold text-3xl text-gradient-uniglee">Iced Chai Wild Rain!</p>
            <p className="text-white font-medium mt-2">Wilds toss onto the board</p>
          </motion.div>
        </div>
      </motion.div>

    </motion.div>
  );
}
