/**
 * Gameplay Direction — Mobile (390×844)
 * Touch-first layout · clear hierarchy · accessible contrast
 * Design exploration only — do not apply to any artifact.
 */
import { useEffect } from "react";

const KF = `
/* Fonts are self-hosted via @font-face in src/index.css (public/fonts/) */
@keyframes gm-pulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes gm-shimmer{0%,100%{box-shadow:0 0 0 1.5px rgba(242,200,75,.55),0 0 12px rgba(242,200,75,.22)}50%{box-shadow:0 0 0 1.5px rgba(242,200,75,.95),0 0 26px rgba(242,200,75,.48)}}
@keyframes gm-pop{0%{transform:scale(.75);opacity:0}65%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@keyframes gm-drift{0%,100%{transform:translate(0,0);opacity:.85}50%{transform:translate(2px,-4px);opacity:1}}
@keyframes gm-rise{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes gm-star{0%,100%{opacity:.18}50%{opacity:.52}}
`;

const C = {
  void:"#06081a",night:"#0c0f2e",surface:"#12173f",panel:"#181e50",
  border:"#252d72",gold:"#f2c84b",goldDim:"#c8a535",mint:"#5ed4c4",
  orange:"#f47b3f",cream:"#fff8ee",creamDim:"rgba(255,248,238,.72)",
  muted:"#8b89b6",firefly:"#a8ff78",winBg:"rgba(242,200,75,.10)",
  winBorder:"rgba(242,200,75,.58)",
};

type Sym = "cup"|"leaf"|"moon"|"bell"|"crystal"|"spark"|"wild";
const SYM:Record<Sym,{icon:string;color:string}> = {
  cup:{icon:"☕",color:C.gold},leaf:{icon:"🍃",color:C.mint},
  moon:{icon:"🌙",color:"#b8a0f5"},bell:{icon:"🔔",color:"#f5c86a"},
  crystal:{icon:"💎",color:"#82d8ff"},spark:{icon:"✦",color:C.gold},
  wild:{icon:"🐱",color:C.orange},
};

type Row5=[Sym,Sym,Sym,Sym,Sym];
const GRID:Row5[]=[
  ["leaf","moon","spark","bell","crystal"],
  ["cup","cup","cup","cup","cup"],   // ← WIN ROW
  ["moon","leaf","wild","moon","spark"],
  ["bell","crystal","spark","cup","moon"],
];
const WIN_ROW=1;

function Stars(){
  const s=Array.from({length:28},(_,i)=>({x:(i*71+11)%100,y:(i*53+7)%100,r:i%4===0?1.2:0.65,d:(i*.41)%3.5,dur:2+(i*.23)%2.5}));
  return(
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} aria-hidden>
      {s.map((p,i)=><circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#fff" style={{animation:`gm-star ${p.dur}s ${p.d}s ease-in-out infinite`,opacity:.22}}/>)}
    </svg>
  );
}

function Cell({sym,win,mult}:{sym:Sym;win:boolean;mult?:boolean}){
  const s=SYM[sym];
  return(
    <div style={{
      position:"relative",width:66,height:84,
      background:win?C.winBg:C.surface,
      border:`1.5px solid ${win?C.winBorder:C.border}`,
      borderRadius:10,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:2,
      animation:win?"gm-shimmer 2s ease-in-out infinite":undefined,
      overflow:"hidden",
    }}>
      {win&&<div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 60%,rgba(242,200,75,.14),transparent 70%)",borderRadius:10,pointerEvents:"none"}}/>}
      <span style={{fontSize:26,lineHeight:1,filter:win?`drop-shadow(0 0 6px ${s.color}99)`:undefined}}>{s.icon}</span>
      <span style={{fontSize:7.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:win?C.gold:C.muted}}>{sym==="wild"?"WILD":sym.toUpperCase()}</span>
      {mult&&win&&(
        <div style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,color:C.night,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 8px rgba(242,200,75,.5)`}}>×3</div>
      )}
      {win&&<div style={{position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:C.gold,animation:"gm-pulse 1.2s infinite"}}/>}
    </div>
  );
}

export function Mobile(){
  useEffect(()=>{document.body.style.cssText="margin:0;padding:0;overflow:hidden;background:#06081a";},[]);
  const fireflyCount=4;

  return(
    <div style={{width:390,height:844,overflow:"hidden",fontFamily:"system-ui,sans-serif",background:C.void,position:"relative",display:"flex",flexDirection:"column"}}>
      <style>{KF}</style>
      <Stars/>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",width:320,height:320,left:"50%",top:"38%",transform:"translate(-50%,-50%)",borderRadius:"50%",background:"radial-gradient(circle,rgba(94,212,196,.07),transparent 70%)",filter:"blur(30px)"}}/>
      </div>

      {/* ── TOP HUD ── */}
      <header style={{position:"relative",zIndex:10,height:52,display:"flex",alignItems:"center",padding:"0 14px",background:`linear-gradient(180deg,${C.night},rgba(12,15,46,.92))`,borderBottom:`1px solid ${C.border}`,gap:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
          <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${C.mint},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>☕</div>
          <span style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:13,fontWeight:800,color:C.cream,letterSpacing:"-.02em",whiteSpace:"nowrap"}}>Glee-fully <span style={{color:C.gold}}>Chai Chasers</span></span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase"}}>LVL</div>
            <div style={{fontSize:13,fontWeight:800,color:C.mint}}>3</div>
          </div>
          <div style={{width:1,height:20,background:C.border}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:7,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase"}}>COINS</div>
            <div style={{fontSize:13,fontWeight:800,color:C.cream}}>840</div>
          </div>
        </div>
      </header>

      {/* ── WIN BANNER ── */}
      <div style={{flexShrink:0,margin:"8px 14px 0",padding:"9px 14px",background:`linear-gradient(90deg,rgba(242,200,75,.12),rgba(242,200,75,.2),rgba(242,200,75,.12))`,border:`1px solid rgba(242,200,75,.5)`,borderRadius:12,display:"flex",alignItems:"center",gap:12,animation:"gm-pop .5s ease both",boxShadow:`0 3px 16px rgba(242,200,75,.18)`,zIndex:2,position:"relative"}}>
        <div style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:18,fontWeight:800,color:C.gold,textShadow:`0 0 12px rgba(242,200,75,.7)`}}>BIG WIN</div>
        <div style={{width:1,height:22,background:"rgba(242,200,75,.35)"}}/>
        <div>
          <div style={{fontSize:8,fontWeight:700,color:C.goldDim,letterSpacing:"0.12em",textTransform:"uppercase"}}>Awarded</div>
          <div style={{fontSize:20,fontWeight:800,color:C.cream,fontFamily:"'Baloo 2',system-ui,sans-serif",lineHeight:1}}>+240 <span style={{fontSize:11,color:C.gold}}>coins</span></div>
        </div>
        <div style={{marginLeft:"auto",fontSize:9,color:C.creamDim,lineHeight:1.4}}>Base 80 ×<br/><span style={{color:C.gold,fontWeight:700}}>×3 Mult</span></div>
      </div>

      {/* ── PAYLINE PILL ── */}
      <div style={{flexShrink:0,display:"flex",justifyContent:"center",margin:"8px 0 0",zIndex:2,position:"relative"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"4px 14px",background:"rgba(242,200,75,.08)",border:`1px solid rgba(242,200,75,.25)`,borderRadius:20}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.gold,animation:"gm-pulse 1s infinite"}}/>
          <span style={{fontSize:9.5,fontWeight:700,color:C.gold,letterSpacing:"0.08em"}}>PAYLINE 2 · CHAI CUP ×5 · CASCADE ACTIVE</span>
        </div>
      </div>

      {/* ── REEL GRID ── */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:2}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,66px)",gridTemplateRows:"repeat(4,84px)",gap:6}} role="grid">
          {GRID.flatMap((row,ri)=>row.map((sym,ci)=>(
            <Cell key={`${ri}-${ci}`} sym={sym} win={ri===WIN_ROW} mult={ri===WIN_ROW&&ci===3}/>
          )))}
        </div>
      </div>

      {/* ── COLLECTION STRIP ── */}
      <div style={{flexShrink:0,margin:"0 14px 8px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"10px 14px",display:"flex",gap:14,alignItems:"center",position:"relative",zIndex:2}}>
        {/* Treat jar */}
        <div style={{flex:1}}>
          <div style={{fontSize:8.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>🫙 Treat Jar</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {[{icon:"🍗",c:2,a:"#f5c86a"},{icon:"🐟",c:4,a:"#82d8ff"},{icon:"💎",c:1,a:"#d4a4ff"}].map(t=>(
              <div key={t.icon} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <span style={{fontSize:16}}>{t.icon}</span>
                <div style={{width:36,height:5,borderRadius:3,background:"rgba(255,255,255,.07)",overflow:"hidden"}}>
                  <div style={{width:`${(t.c/5)*100}%`,height:"100%",background:t.a,borderRadius:3}}/>
                </div>
                <span style={{fontSize:8,fontWeight:700,color:t.a}}>{t.c}/5</span>
              </div>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div style={{width:1,height:52,background:C.border}}/>
        {/* Firefly meter */}
        <div style={{flex:"0 0 auto"}}>
          <div style={{fontSize:8.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>🫙 Firefly</div>
          <div style={{display:"flex",gap:4}}>
            {Array.from({length:6}).map((_,i)=>{
              const lit=i<fireflyCount;
              return(
                <div key={i} style={{width:20,height:20,borderRadius:"50%",background:lit?"radial-gradient(circle,#d4ffb0,#a8ff78 50%,#52cc2a)":C.panel,border:`1.5px solid ${lit?"#a8ff78":C.border}`,boxShadow:lit?"0 0 8px rgba(168,255,120,.5)":"none",animation:lit?`gm-drift ${1.5+i*.4}s ease-in-out infinite`:undefined,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {lit?"✨":""}
                </div>
              );
            })}
          </div>
          <div style={{fontSize:8.5,color:C.creamDim,marginTop:4,textAlign:"center"}}>{fireflyCount}/6</div>
        </div>
      </div>

      {/* ── BET CONSOLE (docked bottom) ── */}
      <footer style={{flexShrink:0,height:68,display:"flex",alignItems:"center",padding:"0 14px",gap:10,background:`linear-gradient(0deg,${C.night},rgba(12,15,46,.95))`,borderTop:`1px solid ${C.border}`,position:"relative",zIndex:10}}>
        {/* Bet control */}
        <div style={{display:"flex",alignItems:"center",gap:0,background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",flexShrink:0}}>
          <button style={{width:36,height:44,background:"transparent",border:"none",color:C.muted,fontSize:18,cursor:"pointer",borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Decrease bet">−</button>
          <div style={{padding:"0 10px",textAlign:"center"}}>
            <div style={{fontSize:7.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase"}}>BET</div>
            <div style={{fontSize:16,fontWeight:800,color:C.cream,fontFamily:"'Baloo 2',system-ui,sans-serif"}}>20</div>
          </div>
          <button style={{width:36,height:44,background:"transparent",border:"none",color:C.gold,fontSize:18,cursor:"pointer",borderLeft:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Increase bet">+</button>
        </div>
        {/* SPARKLE */}
        <button style={{flex:1,height:52,border:"none",borderRadius:13,background:`linear-gradient(160deg,${C.gold},#e5a800 60%,#c8860a)`,boxShadow:`0 5px 0 #8a5a00,0 8px 22px rgba(242,200,75,.35)`,color:C.night,fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:17,fontWeight:800,letterSpacing:"0.04em",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,position:"relative",overflow:"hidden"}} aria-label="Sparkle — spin">
          <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%)",pointerEvents:"none"}}/>
          <span style={{fontSize:18}}>✦</span> SPARKLE!
        </button>
        {/* Auto */}
        <button style={{width:44,height:52,borderRadius:10,background:C.panel,border:`1px solid ${C.border}`,color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,flexShrink:0}}>
          <span style={{fontSize:14}}>↺</span>
          <span style={{fontSize:8}}>Auto</span>
        </button>
      </footer>
    </div>
  );
}
