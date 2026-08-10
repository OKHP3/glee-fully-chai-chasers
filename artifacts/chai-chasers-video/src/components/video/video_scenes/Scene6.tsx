import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene6() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden z-10"
      {...sceneTransitions.zoomThrough}
    >
      <div className="absolute inset-0 bg-[#080515]" />
      
      {/* Background Mega Cascade blurry parallax */}
      <motion.div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 1.5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/replay-captures/mega-cascade.png)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(20px)',
        }}
      />

      <div className="absolute top-[8vh] left-[8vw] z-30">
        <motion.p
          className="font-mono uppercase tracking-[.25em] text-sm text-cyan-300"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Rare Replay
        </motion.p>
        <motion.h2
          className="font-display font-bold text-[4.5vw] text-white mt-2 leading-tight"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          The <span className="text-gradient-uniglee">UniGlee</span> Trigger
        </motion.h2>
        <motion.p
          className="text-[1.8vw] text-slate-300 font-medium mt-4 max-w-[30vw]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          A rainbow butterfly opens an 80-spin marathon. Chains of wins unlock the mega cascade.
        </motion.p>
      </div>

      {/* Main Cascade Screenshot */}
      <motion.div
        className="absolute bottom-[10vh] right-[5vw] z-20 w-[55vw] rounded-[2rem] overflow-hidden border border-white/25 shadow-[0_30px_100px_rgba(0,0,0,.7)]"
        initial={{ opacity: 0, scale: .84, y: 80 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/replay-captures/mega-cascade.png`} 
          alt="Mega cascade showing 12 cascades" 
          className="block w-full" 
        />
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#080515] via-[#080515]/85 to-transparent">
          <h2 className="font-display text-5xl font-bold text-white">12 cascades. <span className="text-gradient-gold">60 free spins.</span></h2>
        </div>
      </motion.div>

      {/* UniGlee Butterfly overlapping */}
      <motion.div
        className="absolute top-[20vh] right-[45vw] z-40 w-56 h-56 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_40px_rgba(217,70,239,0.8)]"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/generated/uniglee.png')` }}
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: [0, 10, -5, 0] }}
        transition={{ 
          opacity: { delay: 2, duration: 0.8 },
          scale: { delay: 2, duration: 0.8, type: 'spring' },
          rotate: { delay: 2.5, duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      />
    </motion.div>
  );
}
