export default function Slide11Craft() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(148deg, #0D0722 0%, #160A35 100%)' }}
    >
      {/* Warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 45% 55% at 80% 48%, rgba(242,200,75,0.09) 0%, rgba(94,212,196,0.04) 50%, transparent 65%)',
        }}
      />

      {/* Right decorative zone: sparkle/diamond pattern */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center overflow-hidden"
        style={{ width: '34%' }}
      >
        {/* Central diamond */}
        <div
          style={{
            position: 'absolute',
            width: '6vw',
            height: '6vw',
            background: 'rgba(242,200,75,0.08)',
            border: '1px solid rgba(242,200,75,0.2)',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Outer diamond */}
        <div
          style={{
            position: 'absolute',
            width: '12vw',
            height: '12vw',
            border: '1px solid rgba(242,200,75,0.1)',
            transform: 'rotate(45deg)',
          }}
        />
        {/* Orbit ring */}
        <div
          style={{
            position: 'absolute',
            width: '18vw',
            height: '18vw',
            borderRadius: '50%',
            border: '1px solid rgba(94,212,196,0.1)',
          }}
        />
        {/* Small sparkle dots */}
        <div
          style={{
            position: 'absolute',
            top: '28%',
            right: '22%',
            width: '0.6vw',
            height: '0.6vw',
            borderRadius: '50%',
            background: '#F2C84B',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '32%',
            left: '20%',
            width: '0.4vw',
            height: '0.4vw',
            borderRadius: '50%',
            background: '#5ED4C4',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '15%',
            width: '0.5vw',
            height: '0.5vw',
            borderRadius: '50%',
            background: '#F2C84B',
            opacity: 0.4,
          }}
        />
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
          Polish
        </div>
        <div
          className="font-display text-primary"
          style={{ fontSize: '4.5vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          Craft Details
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
            SPARKLE button triggers an iridescent shimmer sweep across the game title on every press
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Cat pop-ins animate with a drop-in-from-above hop and exit after timed pose sequence
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Ice Notes ingredient transitions with a cross-fade so the card shell never flickers
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Bonus round overlays re-enable SPARKLE so it doubles as a universal 'continue' button
          </div>
        </div>
      </div>
    </div>
  );
}
