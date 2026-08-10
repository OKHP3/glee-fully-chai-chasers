export default function Slide13RTPSimulation() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #0D0722 0%, #15093A 100%)' }}
    >
      {/* Accent glow — gold on the right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 45% 55% at 82% 48%, rgba(242,200,75,0.10) 0%, rgba(94,212,196,0.05) 50%, transparent 65%)',
        }}
      />

      {/* Right zone: RTP stat cards */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col items-stretch justify-center"
        style={{ width: '32%', paddingLeft: '1vw', paddingRight: '4.5vw', gap: '2vh' }}
      >
        {/* Hero RTP card */}
        <div
          style={{
            padding: '2vh 1.6vw',
            background: 'rgba(242,200,75,0.09)',
            border: '1px solid rgba(242,200,75,0.28)',
            borderRadius: '0.6vw',
          }}
        >
          <div
            className="font-display"
            style={{
              fontSize: '3.8vw',
              fontWeight: 900,
              color: '#F2C84B',
              lineHeight: 1,
              marginBottom: '0.6vh',
              letterSpacing: '-0.02em',
            }}
          >
            98.70%
          </div>
          <div
            className="font-body"
            style={{
              fontSize: '1.1vw',
              color: 'rgba(255,238,197,0.65)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Full-game RTP
          </div>
        </div>

        {/* Spins card */}
        <div
          style={{
            padding: '1.4vh 1.6vw',
            background: 'rgba(94,212,196,0.07)',
            border: '1px solid rgba(94,212,196,0.2)',
            borderRadius: '0.6vw',
          }}
        >
          <div
            className="font-display"
            style={{
              fontSize: '2.6vw',
              fontWeight: 800,
              color: '#5ED4C4',
              lineHeight: 1,
              marginBottom: '0.5vh',
              letterSpacing: '-0.01em',
            }}
          >
            2,000,000
          </div>
          <div
            className="font-body"
            style={{
              fontSize: '1.1vw',
              color: 'rgba(255,238,197,0.6)',
              fontWeight: 500,
              letterSpacing: '0.03em',
            }}
          >
            paid spins simulated
          </div>
        </div>

        {/* Seeds card */}
        <div
          style={{
            padding: '1.4vh 1.6vw',
            background: 'rgba(155,139,184,0.08)',
            border: '1px solid rgba(155,139,184,0.2)',
            borderRadius: '0.6vw',
          }}
        >
          <div
            className="font-display"
            style={{
              fontSize: '2.6vw',
              fontWeight: 800,
              color: '#9B8BB8',
              lineHeight: 1,
              marginBottom: '0.5vh',
              letterSpacing: '-0.01em',
            }}
          >
            40
          </div>
          <div
            className="font-body"
            style={{
              fontSize: '1.1vw',
              color: 'rgba(255,238,197,0.6)',
              fontWeight: 500,
              letterSpacing: '0.03em',
            }}
          >
            independent seeds
          </div>
        </div>
      </div>

      {/* Left content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '68%', paddingLeft: '8vw', paddingRight: '3vw' }}
      >
        {/* Section label */}
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
          Probability
        </div>

        {/* Headline */}
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '4vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          I Built My Own Simulator
        </div>

        {/* Teal rule */}
        <div
          style={{
            width: '4vw',
            height: '2px',
            background: '#5ED4C4',
            borderRadius: '1px',
            marginBottom: '3.5vh',
          }}
        />

        {/* Bullet: what RTP is */}
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            RTP (return-to-player) is the % of coins a game returns over many plays — balancing it prevents runaway wins or losses
          </div>
        </div>

        {/* Bullet: why I built the harness */}
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            No off-the-shelf tool existed for this game's rules, so I wrote a Monte Carlo harness (<span style={{ color: '#5ED4C4', fontFamily: 'monospace' }}>sim-agent.ts</span>) that plays every bonus through the same engine code the game uses
          </div>
        </div>

        {/* Bullet: methodology */}
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            2,000,000 paid spins — 40 seeds × 50,000 each — converged to a full-game RTP of <span style={{ color: '#F2C84B', fontWeight: 700 }}>98.70%</span>
          </div>
        </div>

        {/* Bullet: per-feature breakdown */}
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Per-feature: Firefly free spins 10.6% · UniGlee 7.5% · Doorbell Panic 5.0% · Morning Treat Time 4.4% · Treat Jar 4.3%
          </div>
        </div>
      </div>
    </div>
  );
}
