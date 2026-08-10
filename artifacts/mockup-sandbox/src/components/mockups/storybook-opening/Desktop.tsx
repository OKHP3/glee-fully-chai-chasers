/**
 * Chai Chase Storybook Opening — Desktop (1440×900)
 * A polished two-page-spread opening moment that leads clearly into Sparkle play.
 * Retro-Bright Midnight PNW brand · Design exploration only.
 */
import { useEffect } from "react";

const KF = `
/* Fonts are self-hosted via @font-face in src/index.css (public/fonts/) */
@keyframes sb-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes sb-drift{0%,100%{transform:translate(0,0) scale(1);opacity:.7}50%{transform:translate(3px,-6px) scale(1.12);opacity:1}}
@keyframes sb-pulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes sb-flicker{0%,100%{opacity:.8}45%{opacity:1}50%{opacity:.6}55%{opacity:1}}
@keyframes sb-star{0%,100%{opacity:.18;transform:scale(1)}50%{opacity:.62;transform:scale(1.3)}}
@keyframes sb-orb{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
`;

const C = {
  void:"#06081a",night:"#070d20",surface:"#0f1535",panel:"#181e50",
  border:"#252d72",gold:"#f2c84b",goldDim:"#c8a535",mint:"#5ed4c4",
  orange:"#f47b3f",orangeDim:"#c05a25",cream:"#fff8ee",creamDim:"rgba(255,248,238,.75)",
  parchment:"#f5edd8",parchmentDim:"#e8dac0",muted:"#8b89b6",
  auroraTeal:"rgba(65,184,183,.18)",auroraOrange:"rgba(244,123,63,.14)",
};

function StarField(){
  const s=Array.from({length:55},(_,i)=>({x:(i*67+13)%100,y:(i*43+9)%100,r:i%6===0?1.4:i%3===0?0.9:0.55,d:(i*.37)%4,dur:2.2+(i*.21)%2.8}));
  return(
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} aria-hidden>
      {s.map((p,i)=><circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#fff" style={{animation:`sb-star ${p.dur}s ${p.d}s ease-in-out infinite`,opacity:.22}}/>)}
    </svg>
  );
}

function FireflyDot({x,y,delay}:{x:number;y:number;delay:number}){
  return(
    <div style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:6,height:6,borderRadius:"50%",background:"radial-gradient(circle,#d4ffb0,#a8ff78)",boxShadow:"0 0 8px rgba(168,255,120,.7)",animation:`sb-drift ${2.2+delay}s ${delay}s ease-in-out infinite`,pointerEvents:"none"}}/>
  );
}

const FIREFLIES=[{x:12,y:32,d:.3},{x:28,y:54,d:.7},{x:18,y:68,d:1.1},{x:38,y:42,d:.5},{x:8,y:78,d:.9},{x:44,y:26,d:1.4}];

export function Desktop(){
  useEffect(()=>{document.body.style.cssText="margin:0;padding:0;overflow:hidden;background:#06081a";},[]);

  return(
    <div style={{width:1440,height:900,overflow:"hidden",fontFamily:"system-ui,sans-serif",display:"flex",background:C.void,position:"relative"}}>
      <style>{KF}</style>

      {/* ════════════════════════════════════════
          LEFT PAGE — Illustrated Night Scene
      ════════════════════════════════════════ */}
      <div style={{
        flex:"0 0 50%",height:"100%",
        background:`
          radial-gradient(ellipse at 30% 20%, ${C.auroraTeal}, transparent 45%),
          radial-gradient(ellipse at 75% 65%, ${C.auroraOrange}, transparent 38%),
          linear-gradient(160deg, #06081a 0%, #0a0e28 55%, #120820 100%)
        `,
        position:"relative",overflow:"hidden",
      }}>
        <StarField/>
        {FIREFLIES.map((f,i)=><FireflyDot key={i} x={f.x} y={f.y} delay={f.d}/>)}

        {/* Aurora ribbons */}
        <div style={{position:"absolute",top:"8%",left:"-10%",right:"-5%",height:"35%",pointerEvents:"none",zIndex:1}}>
          <div style={{position:"absolute",top:"10%",left:"5%",right:"15%",height:3,background:"linear-gradient(90deg,transparent,rgba(94,212,196,.35),rgba(65,184,183,.55),transparent)",filter:"blur(6px)",borderRadius:2,animation:"sb-pulse 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:"26%",left:"15%",right:"5%",height:2,background:"linear-gradient(90deg,transparent,rgba(155,135,245,.25),rgba(94,212,196,.35),transparent)",filter:"blur(5px)",borderRadius:2,animation:"sb-pulse 5.5s 1s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:"42%",left:0,right:"25%",height:2,background:"linear-gradient(90deg,transparent,rgba(244,123,63,.18),rgba(242,200,75,.22),transparent)",filter:"blur(5px)",borderRadius:2,animation:"sb-pulse 6s 2s ease-in-out infinite"}}/>
        </div>

        {/* Mountain silhouette */}
        <svg style={{position:"absolute",bottom:0,left:0,right:0,zIndex:2}} viewBox="0 0 720 280" preserveAspectRatio="none" aria-hidden>
          <path d="M0 280 L0 200 L80 120 L160 180 L260 60 L360 160 L440 90 L520 150 L600 80 L720 140 L720 280 Z" fill="rgba(6,8,26,.9)"/>
          <path d="M0 280 L0 230 L120 170 L200 210 L300 140 L400 200 L500 155 L600 190 L700 155 L720 170 L720 280 Z" fill="rgba(6,8,26,.98)"/>
        </svg>

        {/* Character art */}
        <div style={{position:"absolute",inset:0,zIndex:3,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:100}}>
          <div style={{position:"relative",width:"80%",maxWidth:420}}>
            {/* Glow behind characters */}
            <div style={{position:"absolute",bottom:-20,left:"50%",transform:"translateX(-50%)",width:300,height:200,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(65,184,183,.16),transparent 70%)",filter:"blur(20px)",animation:"sb-orb 6s ease-in-out infinite"}}/>
            <img src="/__mockup/images/chai-chase-splash.png" alt="Joey and Phoebe in a cosmic chai garden" style={{width:"100%",height:"auto",objectFit:"contain",filter:"drop-shadow(0 8px 32px rgba(65,184,183,.22))",position:"relative",zIndex:1}}/>
          </div>
        </div>

        {/* Bottom vignette */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:200,background:`linear-gradient(0deg,${C.void} 0%,rgba(6,8,26,.6) 55%,transparent 100%)`,zIndex:4,pointerEvents:"none"}}/>

        {/* Chapter ornament top-left */}
        <div style={{position:"absolute",top:28,left:28,zIndex:5}}>
          <div style={{fontSize:9.5,fontWeight:700,letterSpacing:"0.22em",color:"rgba(94,212,196,.65)",textTransform:"uppercase",marginBottom:6}}>Glee-fully Presents</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${C.mint},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🥤</div>
            <span style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:15,fontWeight:800,color:C.cream,letterSpacing:"-.02em"}}>Chai Chasers</span>
          </div>
        </div>

        {/* "Chapter One" label bottom-left */}
        <div style={{position:"absolute",bottom:28,left:32,zIndex:6,animation:"sb-rise .8s ease both"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",color:"rgba(94,212,196,.6)",textTransform:"uppercase"}}>Chapter One</div>
          <div style={{fontFamily:"'Lora',Georgia,serif",fontSize:18,fontStyle:"italic",color:"rgba(255,248,238,.55)",marginTop:2}}>The Chase Begins</div>
        </div>

        {/* Page number */}
        <div style={{position:"absolute",bottom:28,right:32,zIndex:6,fontSize:10,color:"rgba(255,248,238,.3)",fontWeight:600}}>I</div>

        {/* Ornate corner flourishes (CSS only) */}
        {[{top:0,left:0},{top:0,right:0,transform:"scaleX(-1)"},{bottom:0,left:0,transform:"scaleY(-1)"},{bottom:0,right:0,transform:"scale(-1)"}].map((pos,i)=>(
          <div key={i} style={{position:"absolute",...pos as any,width:42,height:42,zIndex:7,pointerEvents:"none"}}>
            <svg viewBox="0 0 42 42" style={{width:42,height:42,opacity:.3}}>
              <path d="M2 2 L2 16 M2 2 L16 2" stroke="rgba(94,212,196,.8)" strokeWidth={1} fill="none" strokeLinecap="round"/>
              <circle cx={2} cy={2} r={2} fill="rgba(242,200,75,.8)"/>
              <path d="M10 2 L10 8 M2 10 L8 10" stroke="rgba(94,212,196,.5)" strokeWidth={.8} fill="none"/>
            </svg>
          </div>
        ))}
      </div>

      {/* ── SPINE ── */}
      <div style={{flex:"0 0 3px",height:"100%",background:`linear-gradient(180deg,${C.border},#3a4490,${C.border})`,boxShadow:"2px 0 24px rgba(0,0,0,.6),-2px 0 24px rgba(0,0,0,.5)",zIndex:10}}/>

      {/* ════════════════════════════════════════
          RIGHT PAGE — Storybook Text
      ════════════════════════════════════════ */}
      <div style={{
        flex:"0 0 calc(50% - 3px)",height:"100%",
        background:`linear-gradient(165deg,${C.parchment} 0%,#ede4c8 55%,${C.parchmentDim} 100%)`,
        position:"relative",overflow:"hidden",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"48px 60px",
      }}>
        {/* Parchment texture */}
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)",backgroundSize:"18px 18px",pointerEvents:"none"}}/>

        {/* Corner flourishes (matching left page style, inverted palette) */}
        {[{top:0,left:0},{top:0,right:0,transform:"scaleX(-1)"},{bottom:0,left:0,transform:"scaleY(-1)"},{bottom:0,right:0,transform:"scale(-1)"}].map((pos,i)=>(
          <div key={i} style={{position:"absolute",...pos as any,width:42,height:42,zIndex:2,pointerEvents:"none"}}>
            <svg viewBox="0 0 42 42" style={{width:42,height:42,opacity:.25}}>
              <path d="M2 2 L2 16 M2 2 L16 2" stroke="rgba(176,120,40,.9)" strokeWidth={1} fill="none" strokeLinecap="round"/>
              <circle cx={2} cy={2} r={2} fill="rgba(176,120,40,.9)"/>
              <path d="M10 2 L10 8 M2 10 L8 10" stroke="rgba(176,120,40,.6)" strokeWidth={.8} fill="none"/>
            </svg>
          </div>
        ))}

        {/* Content */}
        <div style={{position:"relative",zIndex:3,maxWidth:520,width:"100%",display:"flex",flexDirection:"column",gap:0}}>

          {/* Eyebrow */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,animation:"sb-rise .5s ease both"}}>
            <div style={{width:24,height:1,background:"rgba(176,120,40,.5)"}}/>
            <span style={{fontSize:9.5,fontWeight:700,letterSpacing:"0.22em",color:"rgba(139,100,40,.75)",textTransform:"uppercase"}}>A Glee-fully Story</span>
            <div style={{flex:1,height:1,background:"rgba(176,120,40,.5)"}}/>
          </div>

          {/* Title */}
          <h1 style={{
            margin:"0 0 6px",
            fontFamily:"'Baloo 2',system-ui,sans-serif",
            fontSize:52,fontWeight:800,lineHeight:.92,
            letterSpacing:"-.04em",
            color:"#2a1a08",
            animation:"sb-rise .6s .1s ease both",
          }}>
            Glee-fully<br/>
            <span style={{color:C.orange}}>Chai&nbsp;</span>
            <span style={{color:"#1a3060"}}>Chasers</span>
          </h1>

          {/* Subtitle */}
          <div style={{fontFamily:"'Lora',Georgia,serif",fontSize:16,fontStyle:"italic",color:"rgba(80,52,18,.65)",marginBottom:28,animation:"sb-rise .6s .2s ease both"}}>
            A cozy cosmic collectible game for two very opinionated cats.
          </div>

          {/* Ornamental divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28,animation:"sb-rise .6s .3s ease both"}}>
            <div style={{flex:1,height:1,background:"rgba(176,120,40,.3)"}}/>
            <span style={{color:"rgba(176,120,40,.6)",fontSize:14}}>✦</span>
            <div style={{flex:1,height:1,background:"rgba(176,120,40,.3)"}}/>
          </div>

          {/* Narrative opening copy */}
          <div style={{animation:"sb-rise .7s .35s ease both"}}>
            <p style={{margin:"0 0 16px",fontSize:15,lineHeight:1.8,color:"#3a2510",fontFamily:"Georgia,serif"}}>
              On a midnight Pacific Northwest shore, where fireflies drift like tiny green moons and the aurora braids itself through the cedar tops, two very particular cats discovered something sparkling in the tide pools.
            </p>
            <p style={{margin:"0 0 24px",fontSize:15,lineHeight:1.8,color:"#3a2510",fontFamily:"Georgia,serif"}}>
              <strong style={{fontWeight:700}}>Joey</strong> — slender, gray, and constitutionally skeptical — peered at it from a safe distance.{" "}
              <strong style={{fontWeight:700}}>Phoebe</strong> already had her paw in it.
            </p>
          </div>

          {/* Game loop teaser */}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:30,padding:"14px 18px",background:"rgba(255,248,238,.6)",border:"1px solid rgba(176,120,40,.2)",borderRadius:12,animation:"sb-rise .7s .45s ease both"}}>
            {[{icon:"✦",label:"Sparkle the reels",c:"#c8860a"},{icon:"🫙",label:"Collect treats",c:"#217a60"},{icon:"★",label:"Grow the cascade",c:"#2a5090"}].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:7,flex:1}}>
                {i>0&&<div style={{width:1,height:28,background:"rgba(176,120,40,.2)"}}/>}
                <div style={{width:24,height:24,borderRadius:6,background:`${s.c}18`,border:`1px solid ${s.c}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:s.c,flexShrink:0}}>{s.icon}</div>
                <span style={{fontSize:10.5,fontWeight:600,color:"#3a2510",lineHeight:1.3}}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{display:"flex",flexDirection:"column",gap:12,animation:"sb-rise .7s .55s ease both"}}>
            <button style={{
              padding:"0 28px",height:60,borderRadius:16,
              background:`linear-gradient(160deg,${C.orange},${C.orangeDim})`,
              boxShadow:`0 6px 0 #8a3a10,0 10px 28px rgba(244,123,63,.3)`,
              border:"none",color:C.cream,
              fontFamily:"'Baloo 2',system-ui,sans-serif",
              fontSize:19,fontWeight:800,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              position:"relative",overflow:"hidden",
            }}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,.15) 50%,transparent 65%)",pointerEvents:"none"}}/>
              <span style={{fontSize:20}}>✦</span> Begin the Chai Chase
            </button>
            <button style={{padding:"0 28px",height:42,borderRadius:10,background:"transparent",border:"1.5px solid rgba(58,37,16,.25)",color:"rgba(58,37,16,.6)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              How it works ↓
            </button>
          </div>
        </div>

        {/* Page number */}
        <div style={{position:"absolute",bottom:28,right:36,zIndex:4,fontSize:10,color:"rgba(58,37,16,.3)",fontWeight:600,fontFamily:"Georgia,serif",fontStyle:"italic"}}>II</div>

        {/* Subtle ink wash at very bottom */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"linear-gradient(0deg,rgba(176,120,40,.12),transparent)",zIndex:2}}/>
      </div>
    </div>
  );
}
