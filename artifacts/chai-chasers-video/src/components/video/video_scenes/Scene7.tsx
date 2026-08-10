import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';
import { useEffect, useState } from 'react';

const MOMENTS = [
  {
    src: `${import.meta.env.BASE_URL}images/replay-captures/uniglee-capture.png`,
    eyebrow: 'RARE REPLAY',
    title: 'UniGlee capture',
    copy: 'A rainbow butterfly opens an 80-spin marathon.',
  },
  {
    src: `${import.meta.env.BASE_URL}images/replay-captures/treat-time.png`,
    eyebrow: 'CAT-POWERED MOMENT',
    title: 'Treat Time',
    copy: 'Stock the jar, and Joey and Phoebe can make a good run better.',
  },
  {
    src: `${import.meta.env.BASE_URL}images/replay-captures/bold-chai.png`,
    eyebrow: 'QUICK-FIRE FEATURE',
    title: 'Bold Chai',
    copy: 'When the pump appears, the countdown is on.',
  },
] as const;

export function Scene7() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setActive(1), 6000),
      window.setTimeout(() => setActive(2), 12000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const moment = MOMENTS[active];
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden z-10"
      {...sceneTransitions.perspectiveFlip}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#120d36] via-[#0b1029] to-[#22102b]" />
      <div className="absolute top-[10vh] left-[8vw] z-20">
        <p className="font-mono uppercase tracking-[.25em] text-cyan-200 text-sm">Original details, distinct moments</p>
        <h2 className="font-display font-bold text-[4.4vw] text-white mt-2 leading-none">The chase keeps<br /><span className="text-gradient-gold">changing shape.</span></h2>
      </div>

      <motion.div
        key={moment.title}
        className="absolute right-[8vw] top-[18vh] z-20 w-[53vw] rounded-[1.8rem] overflow-hidden border border-white/25 shadow-[0_30px_90px_rgba(0,0,0,.55)]"
        initial={{ opacity: 0, x: 110, rotate: 3 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        exit={{ opacity: 0, x: -110, rotate: -3 }}
        transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={moment.src} alt={`${moment.title} from a current engine replay`} className="block w-full" />
        <div className="absolute inset-x-0 bottom-0 p-7 bg-gradient-to-t from-[#080515] via-[#080515]/85 to-transparent">
          <p className="font-mono text-xs tracking-[.22em] text-cyan-200">{moment.eyebrow}</p>
          <h3 className="font-display font-bold text-4xl text-white mt-2">{moment.title}</h3>
          <p className="text-lg text-slate-200 mt-1">{moment.copy}</p>
        </div>
      </motion.div>

      <div className="absolute left-[8vw] bottom-[14vh] z-20 flex gap-3">
        {MOMENTS.map((item, index) => (
          <div key={item.title} className={`h-2 rounded-full transition-all duration-500 ${active === index ? 'w-24 bg-warning' : 'w-8 bg-white/30'}`} />
        ))}
      </div>
    </motion.div>
  );
}
