const base = import.meta.env.BASE_URL;

export default function Slide01Cover() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #08041A 0%, #160A38 100%)' }}
    >
      {/* Purple glow behind title */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 70% at 22% 55%, rgba(90,30,165,0.55) 0%, transparent 65%)',
        }}
      />

      {/* Right panel: game art */}
      <div className="absolute top-0 right-0 bottom-0" style={{ width: '52%' }}>
        <img
          src={`${base}game-wide.jpg`}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          style={{ objectPosition: '60% 30%' }}
          alt="Glee-fully Chai Chasers"
        />
        {/* Blend into left panel */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #08041A 0%, rgba(8,4,26,0.55) 22%, transparent 50%)',
          }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(8,4,26,0.6) 0%, transparent 40%)' }}
        />
      </div>

      {/* Left panel: content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '62%', paddingLeft: '8vw', paddingRight: '4vw' }}
      >
        <div
          className="font-body text-accent mb-[3vh]"
          style={{
            fontSize: '1.5vw',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          Portfolio Project
        </div>

        <div
          className="font-display text-primary"
          style={{ fontSize: '7.5vw', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.02em' }}
        >
          Glee-fully
        </div>
        <div
          className="font-display text-primary"
          style={{
            fontSize: '7.5vw',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            marginBottom: '3.5vh',
          }}
        >
          Chai Chasers
        </div>

        <div
          style={{
            width: '5vw',
            height: '3px',
            background: '#5ED4C4',
            borderRadius: '2px',
            marginBottom: '3.5vh',
          }}
        />

        <div
          className="font-body text-text text-pretty"
          style={{ fontSize: '2vw', fontWeight: 400, lineHeight: 1.6, maxWidth: '34vw' }}
        >
          A cozy, illustrated browser slot game brewed with TypeScript and a lot of care.
        </div>
      </div>
    </div>
  );
}
