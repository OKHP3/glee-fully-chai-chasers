import { motion, useReducedMotion } from 'framer-motion';
import { getSceneTransition, reducedTransition } from '@/lib/video/animations';

export function Scene2() {
  const prefersReduced = useReducedMotion();
  const rm = prefersReduced ?? false;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...getSceneTransition('zoomThrough', rm)}
    >
      <div className="absolute inset-0 bg-[#0a0a20]/60" />

      {/* Live Game Board Capture */}
      <motion.div
        className="absolute top-[10vh] left-[5vw] z-20 w-[60vw] rounded-2xl overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, x: -100, rotateY: 15, transformPerspective: 1200 }}
        animate={{ opacity: 1, x: 0, rotateY: 5, transformPerspective: 1200 }}
        exit={{ opacity: 0, x: 50, rotateY: -10 }}
        transition={reducedTransition(rm, { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 })}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/replay-captures/live-game-board.jpg`}
          alt="Live game board"
          className="w-full h-auto object-cover"
        />
        {/* Glow behind the board */}
        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(217,70,239,0.2)] pointer-events-none" />
      </motion.div>

      {/* Typography block on the right */}
      <motion.div
        className="absolute right-[5vw] top-[30vh] z-30 w-[25vw] flex flex-col gap-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={reducedTransition(rm, { duration: 1, delay: 0.8, ease: 'circOut' })}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedTransition(rm, { delay: 1.2, duration: 0.8 })}
        >
          <h2 className="font-display font-bold text-[3.5vw] text-white leading-tight">
            Meet <span className="text-gradient-magenta">Joey</span><br />
            & <span className="text-gradient-gold">Phoebe</span>
          </h2>
          <p className="text-slate-300 text-[1.4vw] mt-4 leading-relaxed font-medium">
            Spin the reels in this cozy night-garden. Watch out for floating saucers and aurora ribbons as you chase the perfect chai.
          </p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="flex gap-4 mt-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedTransition(rm, { delay: 2, duration: 0.6, type: 'spring' })}
        >
          <div className="w-16 h-1 bg-gradient-to-r from-accent to-pink-500 rounded-full" />
          <div className="w-4 h-1 bg-white/30 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
