export default function Slide02Project() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(155deg, #0D0722 0%, #160A35 55%, #0F0828 100%)' }}
    >
      {/* Warm glow lower-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 45% 55% at 82% 65%, rgba(242,200,75,0.07) 0%, transparent 60%)',
        }}
      />

      {/* Right decorative zone: ghost number */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center overflow-hidden"
        style={{ width: '35%' }}
      >
        <div
          className="font-display"
          style={{
            fontSize: '22vw',
            fontWeight: 900,
            color: 'rgba(242,200,75,0.055)',
            letterSpacing: '-0.06em',
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          01
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
          Overview
        </div>
        <div
          className="font-display text-primary"
          style={{ fontSize: '4.5vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          The Project
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
            A fully original slot game — no engine, no framework, just TypeScript and the browser
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Built around chai culture: every spin celebrates an ingredient from your cup
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Designed to feel warm and playful, not predatory — no real money, no dark patterns
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Playable in the browser at any viewport from a 360px phone to a 1440px desktop
          </div>
        </div>
      </div>
    </div>
  );
}
