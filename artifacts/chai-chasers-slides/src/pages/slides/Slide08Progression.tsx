export default function Slide08Progression() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(148deg, #0D0722 0%, #160A35 100%)' }}
    >
      {/* Gold glow right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 52% at 80% 50%, rgba(242,200,75,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Right decorative zone: progress systems */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col justify-center"
        style={{ width: '34%', paddingRight: '5vw', paddingLeft: '1vw', gap: '3.5vh' }}
      >
        {/* Sparks XP bar */}
        <div>
          <div
            className="font-body text-muted"
            style={{
              fontSize: '1.5vw',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1vh',
            }}
          >
            Sparks XP
          </div>
          <div
            style={{
              height: '1.4vh',
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '0.7vh',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '72%',
                height: '100%',
                background: 'linear-gradient(90deg, #F2C84B, #FFE08A)',
                borderRadius: '0.7vh',
              }}
            />
          </div>
          <div
            className="font-body"
            style={{ fontSize: '1.5vw', color: '#F2C84B', marginTop: '0.6vh', fontWeight: 600 }}
          >
            Level 7 — 72%
          </div>
        </div>

        {/* Treat Jar */}
        <div>
          <div
            className="font-body text-muted"
            style={{
              fontSize: '1.5vw',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1vh',
            }}
          >
            Treat Jar
          </div>
          <div className="flex" style={{ gap: '0.5vw' }}>
            <div style={{ width: '2.2vw', height: '2.2vw', borderRadius: '50%', background: '#5ED4C4' }} />
            <div style={{ width: '2.2vw', height: '2.2vw', borderRadius: '50%', background: '#5ED4C4' }} />
            <div style={{ width: '2.2vw', height: '2.2vw', borderRadius: '50%', background: '#5ED4C4' }} />
            <div style={{ width: '2.2vw', height: '2.2vw', borderRadius: '50%', background: '#5ED4C4' }} />
            <div style={{ width: '2.2vw', height: '2.2vw', borderRadius: '50%', background: '#5ED4C4' }} />
            <div
              style={{
                width: '2.2vw',
                height: '2.2vw',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(94,212,196,0.2)',
              }}
            />
            <div
              style={{
                width: '2.2vw',
                height: '2.2vw',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(94,212,196,0.2)',
              }}
            />
            <div
              style={{
                width: '2.2vw',
                height: '2.2vw',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(94,212,196,0.2)',
              }}
            />
          </div>
          <div
            className="font-body"
            style={{ fontSize: '1.5vw', color: '#5ED4C4', marginTop: '0.6vh', fontWeight: 600 }}
          >
            5 treats collected
          </div>
        </div>

        {/* Firefly Cascade */}
        <div>
          <div
            className="font-body text-muted"
            style={{
              fontSize: '1.5vw',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '1vh',
            }}
          >
            Firefly Cascade
          </div>
          <div
            style={{
              height: '1.4vh',
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '0.7vh',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '41%',
                height: '100%',
                background: 'linear-gradient(90deg, #5ED4C4, #8AEBE2)',
                borderRadius: '0.7vh',
              }}
            />
          </div>
          <div
            className="font-body"
            style={{ fontSize: '1.5vw', color: '#5ED4C4', marginTop: '0.6vh', fontWeight: 600 }}
          >
            41% to free spins
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
          Systems
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '4.2vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          Progression &amp; Rewards
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
            Sparks XP earned on every spin; fills a level bar in the playing field header
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Level-up triggers an animated celebration with saucer crash landing and coin reward
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Treat Jar: collects treat symbols (chicken comets, salmon stars) earned from winning spins
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Firefly Cascade meter: fills toward a free-spin bonus trigger — a second parallel progress system
          </div>
        </div>
      </div>
    </div>
  );
}
