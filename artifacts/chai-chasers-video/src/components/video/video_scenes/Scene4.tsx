import { motion, useReducedMotion } from 'framer-motion';
import { getSceneTransition } from '@/lib/video/animations';
import wheelHeroArt from '@game-assets/optimized/joey-phoebe-wheel.webp';

export function Scene4() {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...getSceneTransition('perspectiveFlip', prefersReduced ?? false)}
    >
      <div className="absolute inset-0 bg-[#22102b]/80" />

      {/* Typography on the left */}
      <motion.div
        className="absolute left-[8vw] top-[30vh] z-30 w-[35vw]"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 1, delay: 0.2, ease: 'circOut' }}
      >
        <h2 className="font-display font-bold text-[5vw] text-white leading-tight mb-4">
          The <span className="text-gradient-magenta">Sparkle Wheel</span>
        </h2>
        <p className="text-slate-200 text-[1.8vw] font-medium leading-relaxed drop-shadow-md">
          Joey and Phoebe spin the wheel for free spins or wild rains!
        </p>
      </motion.div>

      {/* Sparkle Wheel Art and Screenshot */}
      <motion.div
        className="absolute right-[8vw] top-[15vh] flex items-center justify-center z-20 w-[45vw] h-[70vh]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Real Screenshot Behind */}
        <motion.div
          className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(217,70,239,0.3)] opacity-60 mix-blend-screen"
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/replay-captures/joey-phoebe-sparkle-wheel.png`}
            alt="Sparkle Wheel Screenshot"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Hero Wheel Art Layered on top */}
        <motion.div
          className="relative z-30 w-full h-full flex items-center justify-center"
          initial={{ y: 50, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring', bounce: 0.4 }}
        >
          {/* Animated rim around the wheel */}
          <motion.div
            className="absolute w-[60%] h-[60%] rounded-full border-4 border-dashed border-accent/80"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <img
            src={wheelHeroArt}
            alt="Joey and Phoebe on the Sparkle Wheel"
            className="w-[85%] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
