export default function Slide07IceNotes() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #0D0722 0%, #170A38 100%)' }}
    >
      {/* Teal glow right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 44% 55% at 80% 50%, rgba(94,212,196,0.09) 0%, transparent 62%)',
        }}
      />

      {/* Right: illustrated Ice Notes card */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center justify-center"
        style={{ width: '44%', paddingRight: '5vw', paddingLeft: '2vw' }}
      >
        <div
          style={{
            width: '100%',
            background: 'rgba(28,12,65,0.85)',
            border: '1px solid rgba(94,212,196,0.28)',
            borderRadius: '1.5vw',
            padding: '2.8vh 2.5vw',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Card eyebrow */}
          <div
            className="font-body text-accent"
            style={{
              fontSize: '1.5vw',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '1.5vh',
            }}
          >
            Ice Notes
          </div>
          <div
            style={{ height: '1px', background: 'rgba(94,212,196,0.22)', marginBottom: '1.8vh' }}
          />
          {/* Ingredient name */}
          <div
            className="font-display text-primary"
            style={{ fontSize: '2.8vw', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5vh' }}
          >
            Cardamom
          </div>
          <div
            style={{ height: '1px', background: 'rgba(94,212,196,0.16)', marginBottom: '1.5vh' }}
          />
          {/* Fact text */}
          <div
            className="font-body text-text text-pretty"
            style={{ fontSize: '1.7vw', lineHeight: 1.55, marginBottom: '1.8vh', opacity: 0.88 }}
          >
            Bright, floral and citrus-spiced, with a cooling menthol warmth. A foundational spice in the chai blend.
          </div>
          <div
            style={{ height: '1px', background: 'rgba(94,212,196,0.16)', marginBottom: '1.8vh' }}
          />
          {/* Profile rows — inline, no .map() */}
          <div style={{ marginBottom: '1.2vh' }}>
            <div
              className="font-body text-accent"
              style={{
                fontSize: '1.5vw',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.3vh',
              }}
            >
              Flavor
            </div>
            <div className="font-body text-text" style={{ fontSize: '1.7vw', lineHeight: 1.4, opacity: 0.82 }}>
              bright, citrus, floral
            </div>
          </div>
          <div style={{ marginBottom: '1.2vh' }}>
            <div
              className="font-body text-accent"
              style={{
                fontSize: '1.5vw',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.3vh',
              }}
            >
              Chai Role
            </div>
            <div className="font-body text-text" style={{ fontSize: '1.7vw', lineHeight: 1.4, opacity: 0.82 }}>
              base spice blend
            </div>
          </div>
          <div style={{ marginBottom: '1.2vh' }}>
            <div
              className="font-body text-accent"
              style={{
                fontSize: '1.5vw',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.3vh',
              }}
            >
              Source
            </div>
            <div className="font-body text-text" style={{ fontSize: '1.7vw', lineHeight: 1.4, opacity: 0.82 }}>
              Guatemala highlands
            </div>
          </div>
          <div>
            <div
              className="font-body text-accent"
              style={{
                fontSize: '1.5vw',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.3vh',
              }}
            >
              Gathering
            </div>
            <div className="font-body text-text" style={{ fontSize: '1.7vw', lineHeight: 1.4, opacity: 0.82 }}>
              hand-harvested pods
            </div>
          </div>
        </div>
      </div>

      {/* Left content */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: '59%', paddingLeft: '8vw', paddingRight: '3vw' }}
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
          Education
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '3.6vw', fontWeight: 700, lineHeight: 1.1, marginBottom: '2.5vh' }}
        >
          Ice Notes — Chai Education
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
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.85vw', lineHeight: 1.55 }}>
            After every spin, the active chai ingredient surfaces in the Ice Notes panel
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.85vw', lineHeight: 1.55 }}>
            Each entry has: ingredient name, flavour profile, chai role, source region, and gathering method
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.85vw', lineHeight: 1.55 }}>
            On mobile: a fixed card at the bottom of the screen
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '1.85vw', lineHeight: 1.55 }}>
            On desktop (900px+): reflows into a full-height side panel beside the reels — ingredient name, full fact text, and each profile field on its own row
          </div>
        </div>
      </div>
    </div>
  );
}
