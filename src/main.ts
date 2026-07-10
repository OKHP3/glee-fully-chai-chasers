/**
 * Entry point — walking skeleton.
 * Real UI lands per docs/DESIGN-SPEC.md §6 after decisions D1/D2 settle
 * (docs/DECISION-LOG.md). This placeholder proves the deploy pipeline
 * and the iOS audio-unlock splash pattern.
 */
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="h-full w-full flex flex-col items-center justify-center gap-6"
       style="background: linear-gradient(#1a1f3c, #2d1f4c)">
    <div class="text-6xl">🎰🦋</div>
    <h1 class="text-2xl font-bold text-amber-100 text-center px-8">
      Glee-fully Chai Chasers
    </h1>
    <p class="text-amber-200/70 text-center px-10">
      Hold up, doing a sparkle sort&hellip;<br/>(under construction, gleefully)
    </p>
    <button id="tap-in"
      class="mt-4 px-8 py-4 rounded-2xl bg-orange-600 text-white text-lg font-semibold active:scale-95 transition-transform">
      Tap to open the Toolbox 🧰
    </button>
  </div>
`;

// iOS requires a user gesture to unlock AudioContext — this button is that gesture.
document.querySelector("#tap-in")?.addEventListener("click", () => {
  // audio.init() goes here
  console.log("Toolbox opened. Audio unlocked. Freak'n facts on facts.");
});
