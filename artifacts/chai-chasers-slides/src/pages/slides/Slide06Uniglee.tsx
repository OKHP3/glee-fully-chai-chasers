const base = import.meta.env.BASE_URL;

export default function Slide06Uniglee() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #0D0722 0%, #150830 55%, #0B0620 100%)' }}
    >
      {/* Right decorative zone: UniGlee butterfly */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center overflow-hidden"
        style={{ width: '40%' }}
      >
        {/* Soft radial glow behind butterfly */}
        <div
          className="absolute"
          style={{
            width: '38vw',
            height: '38vw',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(180,100,255,0.18) 0%, rgba(94,212,196,0.08) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <img
          src={`${base}uniglee.png`}
          alt="UniGlee butterfly"
          style={{
            width: '32vw',
            height: '32vw',
            objectFit: 'contain',
            mixBlendMode: 'screen',
            position: 'relative',
            filter: 'brightness(1.1) saturate(1.2)',
          }}
        />
      </div>

      {/* Left content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '69%', paddingLeft: '8vw', paddingRight: '3vw' }}
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
          Bonus Round
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '4vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          UniGlee — The Bonus Round
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
            Triggered when a UniGlee butterfly symbol fills a reel
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            The screen fills with rising butterflies; a full-screen takeover announces the marathon
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            6–15 free spins play out automatically with enhanced win multipliers
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            A chapter-style narrative (Joey's Laundry Helper) plays out during the marathon with its own header and cabinet skin
          </div>
        </div>
      </div>
    </div>
  );
}
