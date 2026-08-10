import { useEffect, useState } from "react";
import "./_group.css";

function PawIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 10.5c-1.7.2-3.3-1.8-2.8-3.4.4-1.4 1.8-1.8 2.8-.7.8.9.8 2.9 0 4.1Zm7.6 0c1.7.2 3.3-1.8 2.8-3.4-.4-1.4-1.8-1.8-2.8-.7-.8.9-.8 2.9 0 4.1ZM5.7 14c-1.3-.9-3.3-.2-3.4 1.4-.1 1.3 1.3 2.2 2.5 1.7 1.1-.4 1.8-2.3.9-3.1Zm12.6 0c1.3-.9 3.3-.2 3.4 1.4.1 1.3-1.3 2.2-2.5 1.7-1.1-.4-1.8-2.3-.9-3.1Zm-6.3-1.8c-2.8 0-5.5 2.4-5.1 5 .3 2.2 3 2.2 5.1 1.2 2.1 1 4.8 1 5.1-1.2.4-2.6-2.3-5-5.1-5Z"/></svg>;
}

export function Polished() {
  const [started, setStarted] = useState(false);

  // Baloo 2 is self-hosted via @font-face in src/index.css (public/fonts/).
  return (
    <main className="chai-splash">
      <div className="chai-splash__orb" aria-hidden="true" />
      <section className="chai-splash__art" aria-label="Joey and Phoebe under a cosmic chai sky">
        <img src="/__mockup/images/chai-chase-splash.png" alt="Illustrated cats Joey and Phoebe with cosmic iced chai treasures" />
      </section>
      <section className="chai-splash__content">
        <div className="chai-splash__inner">
          <p className="chai-splash__eyebrow">A cozy cosmic collectible game</p>
          <h1>Glee-fully<br />Chai Chasers</h1>
          <p className="chai-splash__hook">Chase sparkling treasures with Joey and Phoebe while building the perfect iced chai.</p>
          <div className="chai-splash__actions">
            <button className="chai-splash__primary" onClick={() => setStarted(true)} type="button">
              {started ? "The chase is on" : "Start the Chai Chase"}
            </button>
            <button className="chai-splash__secondary" type="button" onClick={() => document.querySelector(".chai-splash__loop")?.scrollIntoView({ behavior: "smooth" })}>
              How it works ↓
            </button>
          </div>
          <div className="chai-splash__loop" aria-label="The three-step chai chase loop">
            <div className="chai-splash__step"><span className="chai-splash__step-icon">✦</span><span className="chai-splash__step-label">Sparkle</span></div>
            <span className="chai-splash__connector" aria-hidden="true" />
            <div className="chai-splash__step"><span className="chai-splash__step-icon"><PawIcon /></span><span className="chai-splash__step-label">Collect treats</span></div>
            <span className="chai-splash__connector" aria-hidden="true" />
            <div className="chai-splash__step"><span className="chai-splash__step-icon">★</span><span className="chai-splash__step-label">Grow the Cascade</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}