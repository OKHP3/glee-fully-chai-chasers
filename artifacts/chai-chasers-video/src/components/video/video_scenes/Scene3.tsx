import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.slideLeft}
    >
      <div className="absolute inset-0 bg-[#120d36]/80" />

      {/* Hero Screenshot */}
      <motion.div
        className="absolute top-[18vh] right-[8vw] z-20 w-[50vw] rounded-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.7)] border border-white/20"
        initial={{ opacity: 0, x: 100, rotate: 2 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        exit={{ opacity: 0, x: -100, rotate: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/replay-captures/treat-time.png`}
          alt="Treat Time feature"
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(245,158,11,0.2)] pointer-events-none" />
      </motion.div>

      {/* Typography */}
      <motion.div
        className="absolute left-[8vw] top-[25vh] z-30 w-[35vw]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'circOut' }}
      >
        <p className="font-mono text-cyan-300 tracking-[0.2em] text-sm md:text-base uppercase mb-2">
          Collect to Unlock
        </p>
        <h2 className="font-display font-bold text-[4.5vw] text-white leading-tight mb-6 drop-shadow-lg">
          Fill the <span className="text-gradient-gold">Treat Jar</span>
        </h2>
        <p className="text-slate-200 text-[1.6vw] font-medium leading-relaxed drop-shadow-md">
          Collect Chicken Comets, Salmon Stars, and Bougie Bites as you spin.
        </p>
        <p className="text-warning text-[1.4vw] font-bold mt-4 tracking-wide uppercase">
          Fill a bag of 24 to unlock the Sparkle Wheel!
        </p>
      </motion.div>
    </motion.div>
  );
}
