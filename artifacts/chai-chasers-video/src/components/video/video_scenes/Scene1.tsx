import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.fadeBlur}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-gradient-to-t from-[#0a0a20] via-[#0a0a20]/90 to-transparent z-10 pointer-events-none" />

      {/* Hero Arcade Screenshot Background */}
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 1.1, y: 50 }}
        animate={{ opacity: 0.6, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/glee-fully-arcade.png`}
          alt="Glee-fully Arcade Cabinet"
          className="w-[90vw] h-auto object-contain rounded-2xl drop-shadow-[0_0_50px_rgba(251,191,36,0.2)] border border-white/10"
        />
      </motion.div>

      <div className="relative w-full h-full flex flex-col items-center justify-end pb-[15vh]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="text-center z-20"
        >
          <motion.h1 
            className="font-display font-bold text-[7vw] leading-none tracking-tight text-white mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 1.5, type: 'spring', stiffness: 100 }}
          >
            Glee-fully<br />
            <span className="text-gradient-gold">Chai Chasers</span>
          </motion.h1>

          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
          >
            <p className="text-[2vw] text-slate-200 font-medium tracking-wide">
              A cozy slot game with a night-garden aesthetic.
            </p>
            <p className="text-[1.8vw] text-warning font-bold tracking-widest uppercase mt-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              The chase is on.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
