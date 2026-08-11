import { motion, useReducedMotion } from 'framer-motion';
import { getSceneTransition } from '@/lib/video/animations';

export function Scene7() {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...getSceneTransition('fadeBlur', prefersReduced ?? false)}
    >
      <div className="absolute inset-0 bg-[#0a0a20]" />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] bg-gradient-to-tr from-accent/30 to-pink-600/30"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Decorative Assets */}
      <motion.div
        className="absolute left-[15vw] top-[30vh] w-48 h-48 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/generated/chai-cup.png')` }}
        initial={{ opacity: 0, y: 50, rotate: -20 }}
        animate={{ opacity: 1, y: 0, rotate: -10 }}
        transition={{ delay: 0.5, duration: 1, type: 'spring' }}
      />
      <motion.div
        className="absolute right-[15vw] bottom-[30vh] w-48 h-48 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/generated/firefly-jar.png')` }}
        initial={{ opacity: 0, y: -50, rotate: 20 }}
        animate={{ opacity: 1, y: 0, rotate: 10 }}
        transition={{ delay: 0.7, duration: 1, type: 'spring' }}
      />

      <div className="relative z-20 text-center flex flex-col items-center">
        <motion.h2
          className="font-display font-medium text-3xl text-slate-300 tracking-[0.2em] uppercase mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Join the chase
        </motion.h2>

        <motion.h1
          className="font-display font-bold text-[7vw] leading-tight text-white mb-12 drop-shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.3, type: 'spring' }}
        >
          Glee-fully <span className="text-gradient-gold">Chai Chasers</span>
        </motion.h1>

        {/* Hero SPARKLE Button CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 2 }}
        >
          <div className="px-16 py-6 rounded-full bg-gradient-to-r from-accent to-pink-500 shadow-[0_0_60px_rgba(217,70,239,0.6)] border-2 border-white/30 cursor-pointer">
            <span className="font-display font-bold text-4xl tracking-widest text-white">SPARKLE!</span>
          </div>
          <p className="text-slate-400 mt-6 font-mono tracking-widest text-sm">
            PLAY FREE NOW
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
