const base = import.meta.env.BASE_URL;

export default function Slide14WhatIBuilt() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#08041A' }}
    >
      {/* Full-bleed background: game art at low opacity */}
      <img
        src={`${base}game-wide.jpg`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '65% 30%', opacity: 0.15 }}
        alt=""
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(8,4,26,0.85) 0%, rgba(13,7,34,0.75) 60%, rgba(8,4,26,0.9) 100%)',
        }}
      />

      {/* Gold radial glow center-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 35% 52%, rgba(90,30,165,0.4) 0%, transparent 60%)',
        }}
      />

      {/* Content: centered in left 65% */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '70%', paddingLeft: '8vw', paddingRight: '5vw' }}
      >
        <div
          className="font-body text-accent"
          style={{
            fontSize: '1.5vw',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '2vh',
          }}
        >
          In Summary
        </div>
        <div
          className="font-display text-primary"
          style={{ fontSize: '5.5vw', fontWeight: 900, lineHeight: 0.98, marginBottom: '3.5vh' }}
        >
          What I Built
        </div>
        <div
          style={{
            width: '5vw',
            height: '3px',
            background: '#5ED4C4',
            borderRadius: '2px',
            marginBottom: '4vh',
          }}
        />

        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.5vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.2vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2.1vw', lineHeight: 1.55 }}>
            A complete, playable game — game engine, UI, animation, RTP math, and progression system
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.5vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.2vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2.1vw', lineHeight: 1.55 }}>
            An original visual design system from scratch: palette, type, iconography, component library
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.5vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.2vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2.1vw', lineHeight: 1.55 }}>
            A responsive layout that works elegantly at every breakpoint without a CSS framework
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-accent"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.2vh' }}
          />
          <div
            className="font-body text-pretty"
            style={{ fontSize: '2.1vw', lineHeight: 1.55, color: '#F2C84B', fontWeight: 500 }}
          >
            A project I'm proud of: opinionated, polished, and genuinely fun to play
          </div>
        </div>
      </div>

      {/* Right: decorative vertical rule */}
      <div
        className="absolute top-[15vh] right-[12vw] bottom-[15vh]"
        style={{ width: '1px', background: 'linear-gradient(180deg, transparent, rgba(94,212,196,0.25) 30%, rgba(94,212,196,0.25) 70%, transparent)' }}
      />
    </div>
  );
}
