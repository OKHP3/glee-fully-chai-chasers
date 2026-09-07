const base = import.meta.env.BASE_URL;

export default function Slide04Gameplay() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #0D0722 0%, #18093C 100%)' }}
    >
      {/* Right decorative zone: reel symbol grid */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center overflow-hidden"
        style={{ width: '40%' }}
      >
        {/* Soft edge vignette so image fades into the bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, #0D0722 0%, rgba(13,7,34,0.5) 18%, transparent 40%), ' +
              'linear-gradient(0deg, #0D0722 0%, rgba(13,7,34,0.4) 12%, transparent 30%), ' +
              'linear-gradient(180deg, #0D0722 0%, rgba(13,7,34,0.4) 12%, transparent 30%)',
            zIndex: 2,
          }}
        />
        <img
          src={`${base}standard-symbol-atlas.png`}
          alt="Game reel symbols"
          style={{
            width: '38vw',
            height: '38vw',
            objectFit: 'cover',
            mixBlendMode: 'screen',
            opacity: 0.45,
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Left content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '58%', paddingLeft: '8vw', paddingRight: '2vw' }}
      >
        <div
          className="font-body text-accent"
          style={{
            fontSize: '1.5vw',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '2vh',
          }}
        >
          Mechanics
        </div>
        <div
          className="font-display text-primary"
          style={{ fontSize: '4.5vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          Gameplay Loop
        </div>
        <div
          style={{
            width: '4vw',
            height: '2px',
            background: '#5ED4C4',
            borderRadius: '1px',
            marginBottom: '3.5vh',
          }}
        />

        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            5×4 reel grid with 20 configurable paylines
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Bet stepper (1–10×) controls risk; coin balance persists across sessions
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Win tiers: single line to multi-line to full-board cascade, each with escalating celebration
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Tuned RTP (Return to Player) via Monte Carlo simulation fleet — balanced for fun, not extraction
          </div>
        </div>
      </div>
    </div>
  );
}
