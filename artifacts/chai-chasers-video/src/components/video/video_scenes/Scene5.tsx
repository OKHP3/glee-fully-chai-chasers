import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

// Stable outro sparkle data computed once at module load
const OUTRO_SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  width: Math.random() * 4 + 2,
  left: `${Math.random() * 100}vw`,
  top: `${Math.random() * 100}vh`,
  color: i % 2 === 0 ? '#fbbf24' : '#d946ef',
  duration: 2 + Math.random() * 2,
  delay: Math.random() * 3,
}));

export function Scene5() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...sceneTransitions.fadeBlur}
    >
      <div className="absolute inset-0 bg-[#0a0a20]" />
      
      {/* Background glow specific to scene 5 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full blur-[120px] bg-accent/20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-20 text-center">
        {/* Play Icon/Symbol */}
        <motion.div
          className="mb-8 mx-auto w-24 h-24 rounded-full border border-white/20 flex items-center justify-center glass-panel"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
        >
          <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-2" />
        </motion.div>

        <motion.h2
          className="font-display font-medium text-2xl text-slate-300 tracking-[0.2em] uppercase mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Play
        </motion.h2>

        <motion.h1
          className="font-display font-bold text-6xl md:text-[6vw] leading-tight text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          Glee-fully <span className="text-gradient-gold">Chai Chasers</span>
        </motion.h1>

        <motion.div
          className="inline-block relative"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          transition={{ duration: 1, delay: 2, ease: 'circOut' }}
        >
          <p className="font-mono text-xl md:text-2xl text-slate-300 tracking-wider">
            okhp3.github.io/glee-fully-chai-chasers/
          </p>
          {/* Animated underline */}
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-warning to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 2.5, ease: 'circOut' }}
          />
        </motion.div>
      </div>

      {/* Floating Sparkles for outro — positions stable from module-level constants */}
      {OUTRO_SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: s.width + 'px',
            height: s.width + 'px',
            backgroundColor: s.color,
            left: s.left,
            top: s.top,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: -50 }}
          transition={{ 
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay
          }}
        />
      ))}
    </motion.div>
  );
}
