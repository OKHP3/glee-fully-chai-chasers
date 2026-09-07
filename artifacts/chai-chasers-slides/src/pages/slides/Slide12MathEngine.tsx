export default function Slide12MathEngine() {
  const statCards: { value: string; label: string; gold?: boolean }[] = [
    { value: '20', label: 'pure-function modules', gold: true },
    { value: '178', label: 'passing tests' },
    { value: '40', label: 'fixed paylines' },
    { value: '5 × 4', label: 'reel grid' },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #0D0722 0%, #15093A 100%)' }}
    >
      {/* Accent glow — teal on the right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 55% at 82% 48%, rgba(94,212,196,0.09) 0%, rgba(242,200,75,0.05) 45%, transparent 62%)',
        }}
      />

      {/* Right zone: stat cards */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col items-stretch justify-center"
        style={{ width: '32%', paddingLeft: '1vw', paddingRight: '4.5vw', gap: '1.8vh' }}
      >
        {statCards.map(({ value, label, gold }) => (
          <div
            key={label}
            style={{
              padding: '1.4vh 1.6vw',
              background: gold
                ? 'rgba(242,200,75,0.08)'
                : 'rgba(94,212,196,0.07)',
              border: `1px solid ${gold ? 'rgba(242,200,75,0.22)' : 'rgba(94,212,196,0.2)'}`,
              borderRadius: '0.6vw',
            }}
          >
            <div
              className="font-display"
              style={{
                fontSize: '2.8vw',
                fontWeight: 800,
                color: gold ? '#F2C84B' : '#5ED4C4',
                lineHeight: 1,
                marginBottom: '0.5vh',
                letterSpacing: '-0.01em',
              }}
            >
              {value}
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
              {label}
            </div>
          </div>
        ))}
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
          Engine
        </div>

        {/* Headline */}
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '4vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          Built for Real Math
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

        {/* Bullet: modules */}
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            20 pure-function TypeScript modules — every rule lives in one place and is tested in isolation
          </div>
        </div>

        {/* Bullet: RNG */}
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Seeded deterministic RNG — the same seed always produces the same game, making bugs reproducible and RTP measurable
          </div>
        </div>

        {/* Bullet: paylines */}
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            40 paylines evaluated from scratch on every cascade step — no caching, no shortcuts
          </div>
        </div>

        {/* Bullet: tests */}
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            178 tests across 24 files guard every rule and edge case — guards against regression as the engine grows
          </div>
        </div>
      </div>
    </div>
  );
}
