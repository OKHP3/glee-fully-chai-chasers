import { motion, useReducedMotion } from 'framer-motion';
import { getSceneTransition, reducedTransition } from '@/lib/video/animations';

export function Scene5() {
  const prefersReduced = useReducedMotion();
  const rm = prefersReduced ?? false;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...getSceneTransition('slideUp', rm)}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0b12] to-[#2d1b1e]/90" />

      <div className="absolute top-[10vh] w-full text-center z-30">
        <motion.p
          className="font-mono text-warning tracking-[0.25em] text-sm md:text-lg uppercase mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedTransition(rm, { delay: 0.3 })}
        >
          Quick-Fire Feature
        </motion.p>
        <motion.h2
          className="font-display font-bold text-[5vw] text-white leading-none drop-shadow-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reducedTransition(rm, { duration: 0.8, type: 'spring' })}
        >
          <span className="text-gradient-gold">Bold Chai</span> Pump
        </motion.h2>
      </div>

      {/* Hero Screenshot */}
      <motion.div
        className="absolute bottom-[5vh] z-20 w-[65vw] rounded-t-3xl overflow-hidden border-t-2 border-x-2 border-white/20 shadow-[0_-30px_100px_rgba(245,158,11,0.25)]"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: '0%' }}
        exit={{ opacity: 0, y: '100%' }}
        transition={reducedTransition(rm, { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 })}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/replay-captures/bold-chai.png`}
          alt="Bold Chai Pump feature"
          className="w-full h-auto object-cover"
        />

        {/* Playful Overlay text */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={reducedTransition(rm, { delay: 2.5, duration: 1 })}
        >
          <p className="font-display font-bold text-4xl text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] px-8 py-4 bg-black/40 rounded-full backdrop-blur-sm">
            Pump the giant chai cup to win multipliers!
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
