import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const megaCascade = `${import.meta.env.BASE_URL}images/replay-captures/mega-cascade.png`;

export function Scene6() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden z-10"
      {...sceneTransitions.zoomThrough}
    >
      <div className="absolute inset-0 bg-[#100b29]" />
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 1.5, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage: `linear-gradient(rgba(16,11,41,.45), rgba(16,11,41,.85)), url(${megaCascade})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(20px)',
        }}
      />

      <motion.div
        className="relative z-10 w-[72vw] max-w-[1080px] rounded-[2rem] overflow-hidden border border-white/25 shadow-[0_30px_100px_rgba(0,0,0,.7)]"
        initial={{ opacity: 0, scale: .84, y: 80 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={megaCascade} alt="Current engine replay showing a twelve-cascade win" className="block w-full" />
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#080515] via-[#080515]/85 to-transparent">
          <p className="font-mono uppercase tracking-[.25em] text-xs text-cyan-200">Current engine replay</p>
          <h2 className="font-display text-5xl font-bold text-white mt-2">12 cascades. <span className="text-gradient-gold">60 free spins.</span></h2>
        </div>
      </motion.div>

      <motion.p
        className="absolute top-[11vh] left-[9vw] z-20 font-display font-bold text-[3.4vw] text-white drop-shadow-xl"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: .8 }}
      >
        One good cascade<br /><span className="text-gradient-magenta">can become a whole story.</span>
      </motion.p>
    </motion.div>
  );
}
