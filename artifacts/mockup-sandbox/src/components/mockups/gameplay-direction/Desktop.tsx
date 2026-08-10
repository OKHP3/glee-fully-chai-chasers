/**
 * Gameplay Direction — Desktop
 * Design exploration: cozy chai-house cosmic atmosphere, clearer visual hierarchy,
 * accessible contrast, legible reel outcomes, collection progress, and player-status feedback.
 * Static mockup — no gameplay logic. Do not apply to any artifact.
 */

import { useEffect } from "react";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  void:       "#06081a",
  night:      "#0c0f2e",
  surface:    "#12173f",
  panel:      "#181e50",
  lift:       "#1e2560",
  border:     "#252d72",
  borderSoft: "rgba(94,212,196,0.18)",
  gold:       "#f2c84b",
  goldDim:    "#c8a535",
  goldGlow:   "rgba(242,200,75,0.22)",
  goldFlash:  "rgba(242,200,75,0.40)",
  mint:       "#5ed4c4",
  mintDim:    "#41b8b7",
  mintGlow:   "rgba(94,212,196,0.16)",
  orange:     "#f47b3f",
  cream:      "#fff8ee",
  creamDim:   "rgba(255,248,238,0.70)",
  muted:      "#8b89b6",
  mutedSoft:  "rgba(139,137,182,0.55)",
  firefly:    "#a8ff78",
  winBg:      "rgba(242,200,75,0.10)",
  winBorder:  "rgba(242,200,75,0.60)",
  redDim:     "rgba(244,123,63,0.18)",
};

const KEYFRAMES = `
/* Fonts are self-hosted via @font-face in src/index.css (public/fonts/) */

@keyframes gd-pulse    { 0%,100%{opacity:.55}  50%{opacity:1} }
@keyframes gd-drift    { 0%,100%{transform:translate(0,0) scale(1);opacity:.8} 40%{transform:translate(2px,-4px) scale(1.18);opacity:1} 70%{transform:translate(-2px,2px) scale(.9);opacity:.65} }
@keyframes gd-shimmer  { 0%,100%{box-shadow:0 0 0 1.5px rgba(242,200,75,.55),0 0 14px rgba(242,200,75,.22)} 50%{box-shadow:0 0 0 1.5px rgba(242,200,75,.95),0 0 30px rgba(242,200,75,.48),0 0 55px rgba(242,200,75,.18)} }
@keyframes gd-win-pop  { 0%{transform:scale(.72) translateY(4px);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
@keyframes gd-bar-fill { from{width:0} to{width:var(--fill)} }
@keyframes gd-star-twinkle { 0%,100%{opacity:.18} 50%{opacity:.55} }
@keyframes gd-firefly  { 0%,100%{transform:translate(0,0);opacity:.85} 50%{transform:translate(3px,-5px);opacity:1} }
@keyframes gd-rise     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Atlas sprite helpers ──────────────────────────────────────────────────────
const STD_ATLAS = "/__mockup/assets/atlases/standard-symbol-atlas.png";
const SPC_ATLAS = "/__mockup/assets/atlases/special-symbol-atlas.png";

/** Compute background-position for a 4-col atlas. */
function bp(col: number, totalCols: number, row: number, totalRows: number) {
  const x = totalCols === 1 ? 0 : (col / (totalCols - 1)) * 100;
  const y = totalRows === 1 ? 0 : (row / (totalRows - 1)) * 100;
  return `${x.toFixed(2)}% ${y.toFixed(2)}%`;
}

/** Inline atlas sprite rendered as a sized div. */
function Sprite({ atlas, col, row, totalCols, totalRows, size = 52 }:
  { atlas: string; col: number; row: number; totalCols: number; totalRows: number; size?: number }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size, flexShrink: 0,
      backgroundImage: `url('${atlas}')`,
      backgroundSize: `${totalCols * 100}% ${totalRows * 100}%`,
      backgroundPosition: bp(col, totalCols, row, totalRows),
      backgroundRepeat: "no-repeat",
      imageRendering: "auto",
    }} aria-hidden="true" />
  );
}

function StdSprite({ col, row, size }: { col: number; row: number; size?: number }) {
  return <Sprite atlas={STD_ATLAS} col={col} row={row} totalCols={4} totalRows={4} size={size} />;
}
function SpcSprite({ col, row, size }: { col: number; row: number; size?: number }) {
  return <Sprite atlas={SPC_ATLAS} col={col} row={row} totalCols={4} totalRows={2} size={size} />;
}

// ─── Symbol definitions ────────────────────────────────────────────────────────
// Maps demo symbol names → real atlas positions from src/ui/asset-manifest.ts
type Sym = "tumbler"|"butterfly"|"crystal"|"chai"|"candle"|"yarn"|"wild_chai"|"uniglee";

const SYM: Record<Sym, {
  color: string; bg: string; isSpecial?: boolean;
  col: number; row: number;
}> = {
  tumbler:    { col:0, row:0, color:"#f2c84b", bg:"rgba(242,200,75,0.12)" },   // standard
  butterfly:  { col:1, row:0, color:"#5ed4c4", bg:"rgba(94,212,196,0.10)"  },
  crystal:    { col:3, row:0, color:"#82d8ff", bg:"rgba(130,216,255,0.10)" },
  chai:       { col:0, row:1, color:"#b8a0f5", bg:"rgba(184,160,245,0.10)" },
  candle:     { col:1, row:1, color:"#f5c86a", bg:"rgba(245,200,106,0.10)" },
  yarn:       { col:3, row:2, color:"#f2c84b", bg:"rgba(242,200,75,0.08)"  },
  wild_chai:  { col:0, row:1, color:"#f47b3f", bg:"rgba(244,123,63,0.14)", isSpecial:true  },  // special atlas
  uniglee:    { col:0, row:0, color:"#d4a4ff", bg:"rgba(212,164,255,0.12)", isSpecial:true },  // special atlas
};

type Row5 = [Sym,Sym,Sym,Sym,Sym];
const GRID: Row5[] = [
  ["butterfly", "chai",    "yarn",    "candle",  "crystal" ],
  ["tumbler",   "tumbler", "tumbler", "tumbler", "tumbler" ], // ← WIN ROW
  ["chai",      "butterfly","wild_chai","chai",   "yarn"    ],
  ["candle",    "crystal", "yarn",    "tumbler", "chai"    ],
];
const WIN_ROW  = 1;
const MULT_COL = 3; // ×3 multiplier badge on this win-row cell

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarField() {
  const stars = Array.from({length:48},(_,i)=>({
    x: (i*73+17)%100, y:(i*47+11)%100,
    r: i%5===0?1.5:i%3===0?1:0.7,
    delay: (i*0.37)%4,
    dur:   2.5 + (i*0.19)%2.5,
  }));
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} aria-hidden>
      {stars.map((s,i)=>(
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff"
          style={{animation:`gd-star-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,opacity:.25}} />
      ))}
    </svg>
  );
}

function ReelCell({ sym, winRow, isMultCell }: { sym:Sym; winRow:boolean; isMultCell:boolean }) {
  const s = SYM[sym];
  const isWild = sym === "wild_chai";
  const isUni  = sym === "uniglee";
  const label  = isWild ? "WILD CHAI" : isUni ? "UNIGLEE" : sym.replace("_"," ").toUpperCase();
  return (
    <div style={{
      position:"relative",
      width:156, height:126,
      background: winRow ? C.winBg : C.surface,
      border: `1.5px solid ${winRow ? C.winBorder : C.border}`,
      borderRadius:12,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      gap:2,
      animation: winRow ? "gd-shimmer 2s ease-in-out infinite" : undefined,
      transition:"background .2s",
      overflow:"hidden",
    }}>
      {/* win row inner glow */}
      {winRow && <div style={{position:"absolute",inset:0,borderRadius:12,background:"radial-gradient(circle at 50% 60%, rgba(242,200,75,0.12), transparent 70%)",pointerEvents:"none"}} />}

      {/* Atlas sprite */}
      <div style={{filter: winRow ? `drop-shadow(0 0 8px ${s.color}99)` : undefined, flexShrink:0}}>
        {s.isSpecial
          ? <SpcSprite col={s.col} row={s.row} size={56} />
          : <StdSprite col={s.col} row={s.row} size={56} />}
      </div>

      <span style={{
        fontSize:9, fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase",
        color: winRow ? C.gold : C.muted,
      }}>{label}</span>

      {/* WILD badge */}
      {isWild && (
        <div style={{
          position:"absolute", top:6, left:6,
          padding:"2px 6px", borderRadius:6,
          background:C.orange, color:C.cream,
          fontSize:8, fontWeight:800, letterSpacing:"0.1em",
          textTransform:"uppercase",
        }}>WILD</div>
      )}

      {/* Multiplier badge */}
      {isMultCell && winRow && (
        <div style={{
          position:"absolute", top:6, right:6,
          width:28, height:28, borderRadius:"50%",
          background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,
          color:C.night, fontSize:9, fontWeight:800,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 12px ${C.goldGlow}`,
          animation:"gd-win-pop .4s ease both",
        }}>×3</div>
      )}

      {/* Win row win-line indicator dot */}
      {winRow && (
        <div style={{
          position:"absolute", left:"50%", bottom:4,
          transform:"translateX(-50%)",
          width:5, height:5, borderRadius:"50%",
          background:C.gold,
          boxShadow:`0 0 6px ${C.gold}`,
          animation:"gd-pulse 1.2s ease-in-out infinite",
        }} />
      )}
    </div>
  );
}

function TopHud() {
  return (
    <header style={{
      position:"relative", zIndex:10,
      height:56,
      display:"flex", alignItems:"center",
      padding:"0 24px",
      background:`linear-gradient(180deg,${C.night} 0%,rgba(12,15,46,.92) 100%)`,
      borderBottom:`1px solid ${C.border}`,
      gap:16,
    }}>
      {/* Logo wordmark */}
      <div style={{display:"flex",alignItems:"center",gap:10,flex:"0 0 auto"}}>
        <div style={{
          width:34,height:34,borderRadius:8,
          background:`linear-gradient(135deg,${C.mint},${C.gold})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          overflow:"hidden",
        }}>
          <StdSprite col={0} row={0} size={34} />
        </div>
        <span style={{
          fontFamily:"'Baloo 2',system-ui,sans-serif",
          fontSize:17, fontWeight:800, color:C.cream, letterSpacing:"-.02em",
        }}>Glee-fully <span style={{color:C.gold}}>Chai Chasers</span></span>
      </div>

      {/* Spacer */}
      <div style={{flex:1}} />

      {/* Status chips */}
      <HudChip label="LEVEL" value="3" accent={C.mint} icon="✦" />
      <div style={{width:1,height:24,background:C.border}} />
      <HudChip label="SPARKS" value="1,240" accent={C.gold} icon="★" />
      <div style={{width:1,height:24,background:C.border}} />
      <HudChip label="BALANCE" value="840 coins" accent={C.cream} icon="◈" bold />

      {/* Settings icon */}
      <button style={{
        marginLeft:8,width:34,height:34,borderRadius:8,
        background:"transparent",border:`1px solid ${C.border}`,
        color:C.muted,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",
      }} aria-label="Settings">⚙</button>
    </header>
  );
}

function HudChip({label,value,accent,icon,bold}:{label:string;value:string;accent:string;icon:string;bold?:boolean}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
      <span style={{fontSize:8.5,fontWeight:700,letterSpacing:"0.14em",color:C.muted,textTransform:"uppercase"}}>{label}</span>
      <span style={{
        fontSize:13.5, fontWeight:bold?800:700,
        color:accent, display:"flex",alignItems:"center",gap:4,
      }}>
        <span style={{fontSize:11}}>{icon}</span> {value}
      </span>
    </div>
  );
}

function LeftPanel() {
  return (
    <aside style={{
      flex:"0 0 200px",
      display:"flex", flexDirection:"column",
      background:`linear-gradient(180deg,${C.night} 0%,${C.void} 100%)`,
      borderRight:`1px solid ${C.border}`,
      overflow:"hidden", position:"relative",
      gap:0,
    }}>
      {/* Character art fills the panel */}
      <div style={{
        flex:1, position:"relative", overflow:"hidden",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",
        padding:"0 0 20px",
      }}>
        {/* Atmospheric glow behind characters */}
        <div style={{
          position:"absolute", bottom:-20, left:"50%", transform:"translateX(-50%)",
          width:220, height:220, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(94,212,196,0.14),transparent 70%)",
          filter:"blur(20px)",
          animation:"gd-pulse 5s ease-in-out infinite",
        }} />
        <img
          src="/__mockup/images/chai-chase-splash.png"
          alt="Joey and Phoebe cats in a cosmic chai garden"
          style={{
            width:"100%",height:"100%",objectFit:"cover",
            objectPosition:"center top",
            position:"absolute",inset:0,
          }}
        />
        {/* Bottom fade-to-void */}
        <div style={{
          position:"absolute",inset:0,
          background:`linear-gradient(0deg,${C.void} 0%,rgba(6,8,26,.6) 30%,transparent 60%)`,
        }} />
        {/* Character name tags */}
        <div style={{
          position:"relative",zIndex:2,
          display:"flex",gap:6,
        }}>
          {["Joey 😼","Phoebe 😸"].map(n=>(
            <div key={n} style={{
              padding:"3px 8px", borderRadius:20,
              background:"rgba(12,15,46,.82)",border:`1px solid ${C.border}`,
              color:C.creamDim, fontSize:9.5, fontWeight:700,
              backdropFilter:"blur(8px)",
            }}>{n}</div>
          ))}
        </div>
      </div>

      {/* Chase status footer */}
      <div style={{
        padding:"12px 14px",
        background:C.surface,
        borderTop:`1px solid ${C.border}`,
      }}>
        <div style={{fontSize:8.5,fontWeight:700,letterSpacing:"0.14em",color:C.muted,marginBottom:6,textTransform:"uppercase"}}>Chase Streak</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {[1,2,3,4,5].map(i=>(
            <div key={i} style={{
              width:24,height:24,borderRadius:6,fontSize:13,
              display:"flex",alignItems:"center",justifyContent:"center",
              background:i<=3?`rgba(242,200,75,0.18)`:C.panel,
              border:`1px solid ${i<=3?C.goldDim:C.border}`,
              color:i<=3?C.gold:C.muted,
            }}>★</div>
          ))}
        </div>
        <div style={{fontSize:10,color:C.creamDim,marginTop:6}}>3 of 5 · +25% Sparkle bonus</div>
      </div>
    </aside>
  );
}

function CenterPanel() {
  return (
    <main style={{
      flex:1,
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"18px 20px",
      gap:12,
      position:"relative",zIndex:2,
    }}>
      {/* Win announcement banner */}
      <WinBanner />

      {/* Payline label */}
      <div style={{
        display:"flex",alignItems:"center",gap:10,
        padding:"5px 16px",
        background:"rgba(242,200,75,0.08)",
        border:`1px solid rgba(242,200,75,0.25)`,
        borderRadius:20,
      }}>
        <div style={{width:5,height:5,borderRadius:"50%",background:C.gold,animation:"gd-pulse 1s infinite"}} />
        <span style={{fontSize:10.5,fontWeight:700,color:C.gold,letterSpacing:"0.1em"}}>
          PAYLINE 2 ACTIVE · CHAI CUP ×5 · CASCADE IN PROGRESS
        </span>
      </div>

      {/* Reel grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(5,156px)",
        gridTemplateRows:"repeat(4,126px)",
        gap:8,
      }} role="grid" aria-label="Slot reels">
        {GRID.flatMap((row,ri)=>
          row.map((sym,ci)=>(
            <ReelCell key={`${ri}-${ci}`} sym={sym} winRow={ri===WIN_ROW} isMultCell={ri===WIN_ROW&&ci===MULT_COL} />
          ))
        )}
      </div>

      {/* Win line visual overlay */}
      <WinLineOverlay />
    </main>
  );
}

function WinBanner() {
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:16,
      padding:"10px 24px",
      background:`linear-gradient(90deg,rgba(242,200,75,0.12),rgba(242,200,75,0.22),rgba(242,200,75,0.12))`,
      border:`1px solid rgba(242,200,75,0.5)`,
      borderRadius:14,
      animation:"gd-win-pop .5s ease both",
      boxShadow:`0 4px 24px rgba(242,200,75,0.18)`,
    }}>
      <div style={{
        fontSize:24,fontWeight:800,
        fontFamily:"'Baloo 2',system-ui,sans-serif",
        color:C.gold,
        textShadow:`0 0 16px rgba(242,200,75,.7)`,
        letterSpacing:"0.02em",
      }}>BIG WIN</div>
      <div style={{width:1,height:28,background:"rgba(242,200,75,0.35)"}} />
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.goldDim,letterSpacing:"0.12em",textTransform:"uppercase"}}>Awarded</div>
        <div style={{
          fontSize:26,fontWeight:800,color:C.cream,
          fontFamily:"'Baloo 2',system-ui,sans-serif",
          lineHeight:1.1,
        }}>+240 <span style={{fontSize:14,color:C.gold}}>coins</span></div>
      </div>
      <div style={{width:1,height:28,background:"rgba(242,200,75,0.35)"}} />
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        <div style={{fontSize:9.5,fontWeight:700,color:C.goldDim,letterSpacing:"0.12em",textTransform:"uppercase"}}>Breakdown</div>
        <div style={{fontSize:11,color:C.creamDim}}>Base 80 × Bet 1 × <span style={{color:C.gold,fontWeight:700}}>×3 Multiplier</span></div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{
            width:8,height:8,borderRadius:"50%",
            background:C.gold,
            animation:`gd-pulse ${1+i*0.3}s ${i*0.2}s ease-in-out infinite`,
            opacity:0.7,
          }} />
        ))}
      </div>
    </div>
  );
}

function WinLineOverlay() {
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:8,
      padding:"6px 14px",
      background:"rgba(12,15,46,0.9)",
      border:`1px solid ${C.border}`,
      borderRadius:10,
      backdropFilter:"blur(8px)",
    }}>
      <span style={{fontSize:10,color:C.muted,fontWeight:600}}>CASCADE</span>
      {[1,2,3].map(i=>(
        <div key={i} style={{
          width:22,height:22,borderRadius:6,fontSize:11,
          display:"flex",alignItems:"center",justifyContent:"center",
          background:i===1?`rgba(242,200,75,0.25)`:C.surface,
          border:`1px solid ${i===1?C.gold:C.border}`,
          color:i===1?C.gold:C.muted,fontWeight:700,
        }}>{i}</div>
      ))}
      <span style={{fontSize:10,color:C.muted,fontWeight:600}}>step {1} of up to 3</span>
      <span style={{fontSize:10,color:C.creamDim,marginLeft:8}}>
        Next cascade redrops 5 symbols — watch the jar!
      </span>
    </div>
  );
}

// ─── Progress bar utility ──────────────────────────────────────────────────────
function ProgressBar({fill, accent, bg}: {fill:number; accent:string; bg:string}) {
  return (
    <div style={{
      height:8, borderRadius:4,
      background:"rgba(255,255,255,0.07)",
      overflow:"hidden",
      position:"relative",
    }}>
      <div style={{
        position:"absolute",left:0,top:0,height:"100%",
        width:`${fill*100}%`,
        borderRadius:4,
        background:`linear-gradient(90deg,${bg},${accent})`,
        boxShadow:`0 0 6px ${accent}66`,
        animation:`gd-bar-fill .8s ease both`,
        "--fill":`${fill*100}%`,
      } as any} />
    </div>
  );
}

function RightPanel() {
  // treat_chicken=std col0 row3 | treat_salmon=std col1 row3 | treat_bougie=std col2 row3
  const treats = [
    { name:"Chicken Comets", col:0, row:3, count:2, max:5, fill:0.4, accent:"#f5c86a", bg:"#c8922a" },
    { name:"Salmon Stars",   col:1, row:3, count:4, max:5, fill:0.8, accent:"#82d8ff", bg:"#3a90cc" },
    { name:"Bougie Bites",   col:2, row:3, count:1, max:5, fill:0.2, accent:"#d4a4ff", bg:"#8854d0" },
  ];
  const fireflyCount = 4;
  const fireflyMax   = 6;

  return (
    <aside style={{
      flex:"0 0 260px",
      display:"flex",flexDirection:"column",
      background:`linear-gradient(180deg,${C.night} 0%,${C.void} 100%)`,
      borderLeft:`1px solid ${C.border}`,
      overflow:"hidden",
      position:"relative",
    }}>
      {/* Panel header */}
      <div style={{
        padding:"12px 16px 10px",
        borderBottom:`1px solid ${C.border}`,
        background:C.surface,
      }}>
        <div style={{fontSize:9.5,fontWeight:700,letterSpacing:"0.16em",color:C.mint,textTransform:"uppercase"}}>
          ✦ Collection Status
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:16}}>

        {/* Last Win card */}
        <div style={{
          padding:"10px 14px",
          background:`linear-gradient(135deg,rgba(242,200,75,0.12),rgba(242,200,75,0.06))`,
          border:`1px solid rgba(242,200,75,0.4)`,
          borderRadius:12,
          animation:"gd-win-pop .45s ease both",
        }}>
          <div style={{fontSize:9,fontWeight:700,color:C.goldDim,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>Last Win</div>
          <div style={{
            fontSize:22,fontWeight:800,color:C.gold,
            fontFamily:"'Baloo 2',system-ui,sans-serif",
            lineHeight:1,
          }}>+240</div>
          <div style={{fontSize:10,color:C.creamDim,marginTop:2}}>coins · BIG WIN · Payline 2</div>
        </div>

        {/* Treat Jar section */}
        <section>
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            marginBottom:10,
          }}>
            <div style={{fontSize:10,fontWeight:700,color:C.cream,letterSpacing:"0.06em"}}>🫙 Treat Jar</div>
            <div style={{
              fontSize:9,fontWeight:700,color:C.mint,
              padding:"2px 8px",borderRadius:10,
              background:C.mintGlow,border:`1px solid rgba(94,212,196,0.3)`,
            }}>2 → Free Spins</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {treats.map(t=>(
              <div key={t.name}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <StdSprite col={t.col} row={t.row} size={28} />
                    <div>
                      <div style={{fontSize:10.5,fontWeight:700,color:C.cream}}>{t.name}</div>
                    </div>
                  </div>
                  <div style={{
                    fontSize:12,fontWeight:800,color:t.accent,
                    background:`rgba(255,255,255,0.05)`,
                    padding:"2px 7px",borderRadius:8,
                    border:`1px solid rgba(255,255,255,0.09)`,
                  }}>
                    {t.count}<span style={{fontSize:9,fontWeight:600,color:C.muted,marginLeft:2}}>/{t.max}</span>
                  </div>
                </div>
                <ProgressBar fill={t.fill} accent={t.accent} bg={t.bg} />
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{height:1,background:C.border}} />

        {/* Firefly Cascade Meter */}
        <section>
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            marginBottom:10,
          }}>
            <div style={{fontSize:10,fontWeight:700,color:C.cream,letterSpacing:"0.06em"}}>
              🫙 Firefly Cascade
            </div>
            <div style={{fontSize:10,fontWeight:800,color:C.firefly}}>
              {fireflyCount}<span style={{color:C.muted,fontWeight:600}}>/{fireflyMax}</span>
            </div>
          </div>
          {/* Firefly dots */}
          <div style={{
            display:"flex",gap:8,
            padding:"12px 14px",
            background:C.panel,
            borderRadius:12,
            border:`1px solid ${C.border}`,
            justifyContent:"center",
          }}>
            {Array.from({length:fireflyMax}).map((_,i)=>{
              const lit = i < fireflyCount;
              return (
                <div key={i} style={{
                  width:28,height:28,borderRadius:"50%",
                  background: lit ? "radial-gradient(circle,#d4ffb0,#a8ff78 50%,#52cc2a)" : C.surface,
                  border: `1.5px solid ${lit ? "#a8ff78" : C.border}`,
                  boxShadow: lit ? "0 0 10px rgba(168,255,120,0.5),0 0 20px rgba(168,255,120,0.2)" : "none",
                  animation: lit ? `gd-firefly ${1.5+i*0.4}s ease-in-out infinite` : undefined,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:12,
                }}>
                  {lit ? <span style={{fontSize:10}}>✦</span> : null}
                </div>
              );
            })}
          </div>
          <div style={{fontSize:10,color:C.creamDim,textAlign:"center",marginTop:6}}>
            {fireflyMax - fireflyCount} more to trigger <span style={{color:C.firefly,fontWeight:700}}>Firefly Cascade</span>
          </div>
        </section>

        {/* Divider */}
        <div style={{height:1,background:C.border}} />

        {/* UniGlee hint */}
        <section style={{
          padding:"10px 12px",
          background:"rgba(212,164,255,0.07)",
          border:"1px solid rgba(212,164,255,0.22)",
          borderRadius:12,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <SpcSprite col={0} row={0} size={20} />
            <span style={{fontSize:10,fontWeight:700,color:"#d4a4ff"}}>UniGlee Capture</span>
          </div>
          <div style={{fontSize:10,color:C.creamDim,lineHeight:1.5}}>
            Land UniGlee on reels 3–5 to unlock a{" "}
            <span style={{color:"#d4a4ff",fontWeight:700}}>Spin Marathon</span>.
            Currently available on next spin.
          </div>
        </section>
      </div>
    </aside>
  );
}

function BetConsole() {
  return (
    <footer style={{
      height:76,
      display:"flex",alignItems:"center",
      padding:"0 24px",
      gap:20,
      background:`linear-gradient(0deg,${C.night},rgba(12,15,46,.95))`,
      borderTop:`1px solid ${C.border}`,
      position:"relative",zIndex:10,
    }}>

      {/* Bet controls */}
      <div style={{
        display:"flex",alignItems:"center",gap:0,
        background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",
        flex:"0 0 auto",
      }}>
        <button style={{
          width:38,height:44,background:"transparent",border:"none",
          color:C.muted,fontSize:18,cursor:"pointer",
          borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",
        }} aria-label="Decrease bet">−</button>
        <div style={{
          padding:"0 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:1,
        }}>
          <span style={{fontSize:8.5,fontWeight:700,letterSpacing:"0.14em",color:C.muted,textTransform:"uppercase"}}>Bet</span>
          <span style={{fontSize:17,fontWeight:800,color:C.cream,fontFamily:"'Baloo 2',system-ui,sans-serif"}}>20</span>
        </div>
        <button style={{
          width:38,height:44,background:"transparent",border:"none",
          color:C.gold,fontSize:18,cursor:"pointer",
          borderLeft:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",
        }} aria-label="Increase bet">+</button>
      </div>

      {/* Quick bet chips */}
      <div style={{display:"flex",gap:6,flex:"0 0 auto"}}>
        {[10,20,50,100].map(v=>(
          <button key={v} style={{
            padding:"6px 12px",borderRadius:8,
            background: v===20 ? `rgba(242,200,75,0.18)` : C.panel,
            border: `1px solid ${v===20 ? C.gold : C.border}`,
            color: v===20 ? C.gold : C.muted,
            fontSize:11,fontWeight:700,cursor:"pointer",
          }}>{v}</button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{flex:1}} />

      {/* Balance readout */}
      <div style={{textAlign:"right",flex:"0 0 auto"}}>
        <div style={{fontSize:8.5,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase"}}>Balance</div>
        <div style={{fontSize:20,fontWeight:800,color:C.cream,fontFamily:"'Baloo 2',system-ui,sans-serif"}}>
          840 <span style={{fontSize:13,color:C.gold}}>coins</span>
        </div>
      </div>

      {/* SPARKLE CTA */}
      <button style={{
        flex:"0 0 auto",
        height:52,
        padding:"0 40px",
        border:"none",borderRadius:14,
        background:`linear-gradient(160deg,${C.gold} 0%,#e5a800 60%,#c8860a 100%)`,
        boxShadow:`0 6px 0 #8a5a00, 0 10px 28px rgba(242,200,75,0.35)`,
        color:C.night,
        fontFamily:"'Baloo 2',system-ui,sans-serif",
        fontSize:18,fontWeight:800,
        letterSpacing:"0.04em",
        cursor:"pointer",
        display:"flex",alignItems:"center",gap:8,
        position:"relative",overflow:"hidden",
      }} aria-label="Sparkle — spin the reels">
        {/* Shimmer highlight */}
        <div style={{
          position:"absolute",inset:0,
          background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.18) 50%,transparent 65%)",
          pointerEvents:"none",
        }} />
        <span style={{fontSize:20}}>✦</span> SPARKLE!
      </button>

      {/* Auto-spin */}
      <button style={{
        height:52,padding:"0 16px",borderRadius:12,
        background:C.panel,border:`1px solid ${C.border}`,
        color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",
        display:"flex",flexDirection:"column",alignItems:"center",gap:1,
      }}>
        <span style={{fontSize:16}}>↺</span>
        <span>Auto</span>
      </button>
    </footer>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function Desktop() {
  useEffect(()=>{
    document.body.style.cssText = "margin:0;padding:0;overflow:hidden;background:#06081a";
  },[]);

  return (
    <div style={{
      width:1440,height:900,overflow:"hidden",
      fontFamily:"system-ui,sans-serif",
      background:C.void,
      position:"relative",
      display:"flex",flexDirection:"column",
      animation:"gd-rise .5s ease both",
    }}>
      <style>{KEYFRAMES}</style>
      <StarField />
      {/* Ambient light blooms */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",width:700,height:700,left:"40%",top:"30%",transform:"translate(-50%,-50%)",borderRadius:"50%",background:"radial-gradient(circle,rgba(94,212,196,0.06),transparent 65%)",filter:"blur(50px)"}} />
        <div style={{position:"absolute",width:500,height:500,right:80,top:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(242,200,75,0.05),transparent 65%)",filter:"blur(40px)"}} />
      </div>
      <TopHud />
      <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative",zIndex:2}}>
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <BetConsole />
    </div>
  );
}
