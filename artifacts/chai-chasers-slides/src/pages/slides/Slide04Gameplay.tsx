export default function Slide04Gameplay() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #0D0722 0%, #18093C 100%)' }}
    >
      {/* Mint glow right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 42% 55% at 82% 48%, rgba(94,212,196,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Right decorative zone: ghost stat */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ width: '34%' }}
      >
        <div
          className="font-display"
          style={{
            fontSize: '11vw',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'rgba(94,212,196,0.09)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          5×4
        </div>
        <div
          className="font-body"
          style={{
            fontSize: '1.5vw',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(94,212,196,0.2)',
            marginTop: '0.5vh',
          }}
        >
          reel grid
        </div>
      </div>

      {/* Left content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '68%', paddingLeft: '8vw', paddingRight: '3vw' }}
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
