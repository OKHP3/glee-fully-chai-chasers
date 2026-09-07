const base = import.meta.env.BASE_URL;

export default function Slide03VisualDesign() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0D0722' }}
    >
      {/* Right: illustrated symbol art */}
      <div className="absolute top-0 right-0 bottom-0" style={{ width: '48%' }}>
        <img
          src={`${base}game-cabinet.jpg`}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 35%' }}
          alt="Illustrated game symbols and characters"
        />
        {/* Blend left */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #0D0722 0%, rgba(13,7,34,0.38) 18%, transparent 42%)',
          }}
        />
        {/* Vignette bottom */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(13,7,34,0.65) 0%, transparent 38%)' }}
        />
      </div>

      {/* Left content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '56%', paddingLeft: '8vw', paddingRight: '3vw' }}
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
          Aesthetics
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '3.8vw', fontWeight: 700, lineHeight: 1.08, marginBottom: '2.5vh' }}
        >
          Visual Design System
        </div>
        <div
          style={{
            width: '4vw',
            height: '2px',
            background: '#5ED4C4',
            borderRadius: '1px',
            marginBottom: '3vh',
          }}
        />

        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            Deep indigo cabinet with butter-gold accents and mint highlights
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            Custom illustrated symbols: butterflies, moon lockets, VHS tapes, aurora pendants, iced chai cups
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            Ornate marquee header with twinkling gold bulbs and animated sparkle shimmer
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            Every UI state — win tiers, bonus rounds, level-ups — has its own visual language
          </div>
        </div>
      </div>
    </div>
  );
}
