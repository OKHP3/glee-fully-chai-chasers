/**
 * Chai Chase Cinematic Mobile Hero — 390×844
 * Portrait hero · strong tap affordance · reduced-motion-friendly visual hierarchy.
 * Retro-Bright Midnight PNW brand · Design exploration only.
 */
import { useEffect } from "react";

const KF = `
/* Fonts are self-hosted via @font-face in src/index.css (public/fonts/) */
@keyframes cm-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes cm-pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes cm-drift{0%,100%{transform:translate(0,0) scale(1);opacity:.8}50%{transform:translate(2px,-5px) scale(1.15);opacity:1}}
@keyframes cm-star{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:.65;transform:scale(1.4)}}
@keyframes cm-shimmer{0%,100%{background-position:200% center}to{background-position:-200% center}}
@media (prefers-reduced-motion:reduce){
  *{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}
}
`;

const C = {
  void:"#06081a",night:"#070d20",surface:"#12173f",panel:"#181e50",
  border:"#252d72",gold:"#f2c84b",goldDim:"#c8a535",mint:"#5ed4c4",
  orange:"#f47b3f",orangeDim:"#c05a25",cream:"#fff8ee",creamDim:"rgba(255,248,238,.75)",
  muted:"#8b89b6",firefly:"#a8ff78",auroraTeal:"rgba(65,184,183,.22)",auroraOrange:"rgba(244,123,63,.15)",
};

function Stars(){
  const s=Array.from({length:32},(_,i)=>({x:(i*71+17)%100,y:(i*47+11)%100,r:i%5===0?1.2:0.6,d:(i*.41)%4,dur:2.5+(i*.2)%2.5}));
  return(
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} aria-hidden>
      {s.map((p,i)=><circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#fff" style={{animation:`cm-star ${p.dur}s ${p.d}s ease-in-out infinite`,opacity:.22}}/>)}
    </svg>
  );
}

export function Hero(){
  useEffect(()=>{document.body.style.cssText="margin:0;padding:0;overflow:hidden;background:#06081a";},[]);

  return(
    <div style={{width:390,height:844,overflow:"hidden",fontFamily:"system-ui,sans-serif",background:C.void,position:"relative",display:"flex",flexDirection:"column"}}>
      <style>{KF}</style>

      {/* ── HERO ART ZONE (top ~62% = 524px) ── */}
      <div style={{position:"relative",height:524,flexShrink:0,overflow:"hidden"}}>
        {/* Aurora atmosphere */}
        <div style={{position:"absolute",inset:0,zIndex:1,background:`
          radial-gradient(ellipse at 30% 18%, ${C.auroraTeal}, transparent 50%),
          radial-gradient(ellipse at 78% 60%, ${C.auroraOrange}, transparent 45%),
          linear-gradient(165deg, #06081a 0%, #080e28 60%, #130825 100%)
        `}}/>
        <Stars/>

        {/* Aurora ribbons */}
        <div style={{position:"absolute",top:"12%",left:0,right:0,zIndex:2,pointerEvents:"none"}}>
          <div style={{height:2,margin:"0 10% 0 5%",background:"linear-gradient(90deg,transparent,rgba(94,212,196,.4),rgba(65,184,183,.55),transparent)",filter:"blur(4px)",animation:"cm-pulse 4.5s ease-in-out infinite"}}/>
          <div style={{height:1.5,margin:"8px 20% 0 15%",background:"linear-gradient(90deg,transparent,rgba(155,135,245,.3),rgba(94,212,196,.35),transparent)",filter:"blur(4px)",animation:"cm-pulse 6s 1.2s ease-in-out infinite"}}/>
        </div>

        {/* Mountain silhouettes */}
        <svg style={{position:"absolute",bottom:0,left:0,right:0,zIndex:3}} viewBox="0 0 390 160" preserveAspectRatio="none" aria-hidden>
          <path d="M0 160 L0 110 L50 60 L100 100 L160 30 L220 90 L270 50 L320 85 L390 40 L390 160 Z" fill="rgba(4,6,18,.85)"/>
          <path d="M0 160 L0 130 L70 95 L120 120 L190 80 L250 115 L300 90 L360 110 L390 95 L390 160 Z" fill="rgba(4,6,18,.98)"/>
        </svg>

        {/* Character art */}
        <div style={{position:"absolute",inset:0,zIndex:4,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:60}}>
          <div style={{position:"relative",width:"86%"}}>
            <div style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",width:260,height:120,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(65,184,183,.14),transparent 70%)",filter:"blur(16px)",animation:"cm-pulse 6s ease-in-out infinite"}}/>
            <img src="/__mockup/images/chai-chase-splash.png" alt="Joey and Phoebe in the cosmic chai garden" style={{width:"100%",height:"auto",objectFit:"contain",display:"block",filter:"drop-shadow(0 6px 24px rgba(65,184,183,.2))",position:"relative",zIndex:1}}/>
          </div>
        </div>

        {/* Fireflies */}
        {[{x:8,y:35,d:.4},{x:22,y:55,d:.9},{x:78,y:42,d:1.3},{x:88,y:68,d:.6}].map((f,i)=>(
          <div key={i} style={{position:"absolute",left:`${f.x}%`,top:`${f.y}%`,width:5,height:5,borderRadius:"50%",background:"radial-gradient(circle,#d4ffb0,#a8ff78)",boxShadow:"0 0 7px rgba(168,255,120,.7)",animation:`cm-drift ${2+f.d}s ${f.d}s ease-in-out infinite`,zIndex:5,pointerEvents:"none"}}/>
        ))}

        {/* Logo — top-left */}
        <div style={{position:"absolute",top:20,left:18,zIndex:10,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.mint},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>☕</div>
          <div>
            <div style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:12.5,fontWeight:800,color:C.cream,lineHeight:1,letterSpacing:"-.02em"}}>Glee-fully</div>
            <div style={{fontSize:8.5,fontWeight:700,color:C.gold,letterSpacing:"0.06em"}}>Chai Chasers</div>
          </div>
        </div>

        {/* Gradient fade to content panel */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:200,background:`linear-gradient(0deg,${C.panel} 0%,rgba(24,30,80,.95) 30%,rgba(24,30,80,.7) 60%,transparent 100%)`,zIndex:6,pointerEvents:"none"}}/>
      </div>

      {/* ── CONTENT PANEL (bottom ~38% = 320px) ── */}
      <div style={{
        flex:1,
        background:`linear-gradient(180deg,${C.panel},#0e1230)`,
        borderTop:"none",
        display:"flex",flexDirection:"column",
        padding:"0 22px 24px",
        position:"relative",zIndex:7,
        overflow:"hidden",
      }}>
        {/* Frosted glass inner top seam */}
        <div style={{height:1,background:`linear-gradient(90deg,transparent,rgba(94,212,196,.3),rgba(242,200,75,.2),transparent)`,marginBottom:18,marginTop:2}}/>

        {/* Eyebrow */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,animation:"cm-rise .5s ease both"}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:C.mint,animation:"cm-pulse 1.5s infinite"}}/>
          <span style={{fontSize:9.5,fontWeight:700,letterSpacing:"0.16em",color:C.mint,textTransform:"uppercase"}}>A cozy cosmic collectible game</span>
        </div>

        {/* Hook copy */}
        <p style={{margin:"0 0 16px",fontSize:14.5,lineHeight:1.65,color:C.creamDim,animation:"cm-rise .6s .1s ease both"}}>
          Chase sparkling treasures with <strong style={{color:C.cream,fontWeight:700}}>Joey</strong> and <strong style={{color:C.cream,fontWeight:700}}>Phoebe</strong> while building the perfect iced chai on a midnight Pacific Northwest shore.
        </p>

        {/* Three-step loop — compact horizontal */}
        <div style={{display:"flex",gap:8,marginBottom:20,animation:"cm-rise .6s .2s ease both"}}>
          {[{icon:"✦",label:"Sparkle"},{icon:"🫙",label:"Collect"},{icon:"★",label:"Cascade"}].map((s,i)=>(
            <div key={i} style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:"rgba(255,255,255,.05)",border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{width:22,height:22,borderRadius:6,background:`rgba(94,212,196,.1)`,border:`1px solid rgba(94,212,196,.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.mint,flexShrink:0}}>{s.icon}</div>
              <span style={{fontSize:10,fontWeight:600,color:C.creamDim,lineHeight:1.2}}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA — large tap target */}
        <button style={{
          width:"100%",height:60,
          border:"none",borderRadius:16,
          background:`linear-gradient(160deg,${C.gold},#e5a800 60%,#c8860a)`,
          boxShadow:`0 5px 0 #8a5a00,0 9px 24px rgba(242,200,75,.35)`,
          color:C.night,
          fontFamily:"'Baloo 2',system-ui,sans-serif",
          fontSize:19,fontWeight:800,letterSpacing:"0.04em",
          cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          position:"relative",overflow:"hidden",
          marginBottom:12,
          animation:"cm-rise .6s .3s ease both",
        }} aria-label="Start the Chai Chase — Sparkle the reels">
          <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%)",pointerEvents:"none"}}/>
          <span style={{fontSize:21}}>✦</span> Start the Chai Chase
        </button>

        {/* Ghost secondary */}
        <button style={{
          width:"100%",height:44,
          border:`1.5px solid rgba(255,248,238,.2)`,borderRadius:12,
          background:"transparent",
          color:C.creamDim,fontSize:13,fontWeight:600,cursor:"pointer",
          animation:"cm-rise .6s .4s ease both",
          marginBottom:14,
        }}>
          How it works ↓
        </button>

        {/* Reduced motion note */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:"rgba(255,255,255,.04)",borderRadius:8,border:`1px solid rgba(255,255,255,.06)`}}>
          <span style={{fontSize:11,color:C.muted}}>⚙</span>
          <span style={{fontSize:9,color:C.muted,lineHeight:1.4}}>Respects your device's Reduce Motion preference — all animations are non-essential.</span>
        </div>
      </div>
    </div>
  );
}
