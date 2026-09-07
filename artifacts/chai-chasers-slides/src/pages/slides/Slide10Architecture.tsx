export default function Slide10Architecture() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #0D0722 0%, #15093A 100%)' }}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 50% at 80% 48%, rgba(242,200,75,0.07) 0%, rgba(94,212,196,0.05) 45%, transparent 62%)',
        }}
      />

      {/* Right decorative zone: tech tags */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col items-start justify-center"
        style={{ width: '34%', paddingLeft: '1vw', paddingRight: '4vw', gap: '1.5vh' }}
      >
        <div
          style={{
            padding: '0.9vh 1.6vw',
            background: 'rgba(242,200,75,0.1)',
            border: '1px solid rgba(242,200,75,0.25)',
            borderRadius: '0.5vw',
          }}
        >
          <span
            className="font-body text-primary"
            style={{ fontSize: '1.8vw', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            TypeScript
          </span>
        </div>
        <div
          style={{
            padding: '0.9vh 1.6vw',
            background: 'rgba(94,212,196,0.08)',
            border: '1px solid rgba(94,212,196,0.22)',
            borderRadius: '0.5vw',
          }}
        >
          <span
            className="font-body text-accent"
            style={{ fontSize: '1.8vw', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            Vite
          </span>
        </div>
        <div
          style={{
            padding: '0.9vh 1.6vw',
            background: 'rgba(242,200,75,0.08)',
            border: '1px solid rgba(242,200,75,0.2)',
            borderRadius: '0.5vw',
          }}
        >
          <span
            className="font-body text-primary"
            style={{ fontSize: '1.8vw', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            Inline SVG
          </span>
        </div>
        <div
          style={{
            padding: '0.9vh 1.6vw',
            background: 'rgba(94,212,196,0.08)',
            border: '1px solid rgba(94,212,196,0.2)',
            borderRadius: '0.5vw',
          }}
        >
          <span
            className="font-body text-accent"
            style={{ fontSize: '1.8vw', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            pnpm Monorepo
          </span>
        </div>
        <div
          style={{
            padding: '0.9vh 1.6vw',
            background: 'rgba(155,139,184,0.1)',
            border: '1px solid rgba(155,139,184,0.2)',
            borderRadius: '0.5vw',
          }}
        >
          <span
            className="font-body text-muted"
            style={{ fontSize: '1.8vw', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            Zero UI Frameworks
          </span>
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
          Stack
        </div>
        <div
          className="font-display text-primary text-balance"
          style={{ fontSize: '4vw', fontWeight: 700, lineHeight: 1.05, marginBottom: '2.5vh' }}
        >
          Technical Architecture
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
            100% TypeScript, zero UI frameworks — the entire game is vanilla browser code
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Vite for bundling and HMR during development
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw', marginBottom: '2.2vh' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            SVG-based game assets: all symbols, saucers, and UI icons are inline SVG — no image sprites
          </div>
        </div>
        <div className="flex items-start" style={{ gap: '1.2vw' }}>
          <div
            className="flex-shrink-0 bg-primary"
            style={{ width: '1.2vw', height: '2px', borderRadius: '1px', marginTop: '1.1vh' }}
          />
          <div className="font-body text-text text-pretty" style={{ fontSize: '2vw', lineHeight: 1.55 }}>
            Pnpm monorepo: game artifact, API server, video artifact, and mockup sandbox as workspace packages
          </div>
        </div>
      </div>
    </div>
  );
}
