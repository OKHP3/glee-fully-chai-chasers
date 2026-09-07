export default function Slide09Responsive() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0D0722 0%, #16093A 100%)' }}
    >
      {/* Subtle accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 38% 50% at 80% 52%, rgba(94,212,196,0.07) 0%, transparent 58%)',
        }}
      />

      {/* Right decorative zone: device frames */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center"
        style={{ width: '34%', paddingRight: '3vw', gap: '1.5vw' }}
      >
        {/* Mobile frame */}
        <div className="flex flex-col items-center" style={{ gap: '0.8vh' }}>
          <div
            style={{
              width: '4vw',
              height: '8.5vw',
              borderRadius: '0.5vw',
              border: '2px solid rgba(94,212,196,0.35)',
              background: 'rgba(94,212,196,0.05)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Simulated single-column game */}
            <div
              style={{
                position: 'absolute',
                top: '8%',
                left: '10%',
                right: '10%',
                height: '55%',
                background: 'rgba(242,200,75,0.2)',
                borderRadius: '0.3vw',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '10%',
                right: '10%',
                height: '20%',
                background: 'rgba(94,212,196,0.15)',
                borderRadius: '0.3vw',
              }}
            />
          </div>
          <div
            className="font-body text-muted"
            style={{ fontSize: '1.5vw', fontWeight: 500, letterSpacing: '0.06em' }}
          >
            360px
          </div>
        </div>

        {/* Tablet frame */}
        <div className="flex flex-col items-center" style={{ gap: '0.8vh' }}>
          <div
            style={{
              width: '5.5vw',
              height: '8.5vw',
              borderRadius: '0.5vw',
              border: '2px solid rgba(242,200,75,0.3)',
              background: 'rgba(242,200,75,0.04)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '8%',
                left: '8%',
                right: '8%',
                height: '50%',
                background: 'rgba(242,200,75,0.2)',
                borderRadius: '0.3vw',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8%',
                left: '8%',
                right: '8%',
                height: '22%',
                background: 'rgba(94,212,196,0.12)',
                borderRadius: '0.3vw',
              }}
            />
          </div>
          <div
            className="font-body text-muted"
            style={{ fontSize: '1.5vw', fontWeight: 500, letterSpacing: '0.06em' }}
          >
            600px
          </div>
        </div>

        {/* Desktop frame */}
        <div className="flex flex-col items-center" style={{ gap: '0.8vh' }}>
          <div
            style={{
              width: '8vw',
              height: '5.5vw',
              borderRadius: '0.5vw',
              border: '2px solid rgba(242,200,75,0.35)',
              background: 'rgba(242,200,75,0.04)',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
            }}
          >
            {/* Game column */}
            <div
              style={{
                flex: 1,
                margin: '8%',
                marginRight: '4%',
                background: 'rgba(242,200,75,0.18)',
                borderRadius: '0.3vw',
              }}
            />
            {/* Side panel */}
            <div
              style={{
                width: '28%',
                margin: '8%',
                marginLeft: 0,
                background: 'rgba(94,212,196,0.18)',
                borderRadius: '0.3vw',
              }}
            />
          </div>
          <div
            className="font-body text-muted"
            style={{ fontSize: '1.5vw', fontWeight: 500, letterSpacing: '0.06em' }}
          >
            900px+
          </div>
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
          Layout
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '4vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          Responsive Engineering
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
            Mobile-first layout: single column, cabinet fills the viewport height
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            At 600px+: padded card with rounded corners, ice notes bottom bar
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            At 900px+: CSS Grid two-column layout — game on the left, ice notes side panel on the right
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Cabinet frame uses aspect-ratio 5/4 with max-height: 100% to prevent symbol clipping at any viewport size
          </div>
        </div>
      </div>
    </div>
  );
}
