import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

// Stable sparkle positions computed once at module load
const SPARKLES = Array.from({ length: 8 }, () => ({
  left: `${30 + Math.random() * 40}vw`,
  bottom: `${20 + Math.random() * 40}vh`,
  yTarget: -50 - Math.random() * 100,
  duration: 2 + Math.random() * 2,
  delay: 1.5 + Math.random() * 3,
}));

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.fadeBlur}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#0a0a20] via-[#0a0a20]/90 to-transparent z-10" />

      <div className="relative w-full h-full flex flex-col items-center justify-end pb-[15vh]">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="text-center z-20"
        >
          <motion.h1 
            className="font-display font-bold text-[6vw] leading-none tracking-tight text-white mb-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: 'circOut' }}
          >
            Glee-fully<br />
            <span className="text-gradient-gold">Chai Chasers</span>
          </motion.h1>

          <motion.p
            className="text-[1.8vw] text-slate-200 font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
          >
            Joey and Phoebe are ready.
          </motion.p>
          
          <motion.p
            className="text-[1.8vw] text-warning font-bold tracking-widest uppercase mt-2"
            initial={{ opacity: 0, letterSpacing: '0em' }}
            animate={{ opacity: 1, letterSpacing: '0.15em' }}
            transition={{ duration: 1.5, delay: 3, ease: 'easeOut' }}
          >
            The chai chase is on.
          </motion.p>
        </motion.div>
      </div>

      {/* Floating sparkles — positions stable from module-level constants */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: s.left,
            bottom: s.bottom,
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)'
          }}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.5, 0],
            y: s.yTarget
          }}
          transition={{ 
            duration: s.duration, 
            delay: s.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.div>
  );
}
