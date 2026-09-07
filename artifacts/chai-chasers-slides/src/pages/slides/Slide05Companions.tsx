const base = import.meta.env.BASE_URL;

export default function Slide05Companions() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#0D0722' }}
    >
      {/* Right: saucer cats */}
      <div className="absolute top-0 right-0 bottom-0" style={{ width: '48%' }}>
        <img
          src={`${base}saucer-cats.png`}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 50%' }}
          alt="Joey and Phoebe in the flying saucer"
        />
        {/* Blend left */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #0D0722 0%, rgba(13,7,34,0.4) 20%, transparent 45%)',
          }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, rgba(13,7,34,0.55) 0%, transparent 35%)' }}
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
          Characters
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '3.8vw', fontWeight: 700, lineHeight: 1.08, marginBottom: '2.5vh' }}
        >
          Companion Characters
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
            Joey (gray, slender) and Phoebe (tuxedo, full-figured) arrive randomly in a flying saucer
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            They pop in from above the reels with a chai-related quip, cycle through poses (strut to eat or strut to unimpressed), then fly off
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            Joey is a discerning gourmand — bougie tastes, expensive treats only. Phoebe is quantity-first and happily eats anything
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.9vw', lineHeight: 1.55 }}>
            Cat visits can be triggered by Treat Jar rewards — a feed-the-cat loop inside the game
          </div>
        </div>
      </div>
    </div>
  );
}
