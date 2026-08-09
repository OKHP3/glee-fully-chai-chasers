/**
 * Progress Feedback — Playful (1440×900)
 * Expressive but non-distracting visual feedback for collection progress,
 * reel outcomes, streaks, and player status.
 * Design exploration only — do not apply to any artifact.
 */
import { useEffect } from "react";

const KF = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap');
@keyframes pf-pulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes pf-pop{0%{transform:scale(.72);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes pf-bar{from{width:0}to{width:var(--w)}}
@keyframes pf-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(2px,-4px) scale(1.15)}}
@keyframes pf-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pf-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes pf-star{0%,100%{opacity:.2}50%{opacity:.6}}
@keyframes pf-cascade{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)}}
`;

const C = {
  void:"#06081a",night:"#0c0f2e",surface:"#12173f",panel:"#181e50",
  border:"#252d72",gold:"#f2c84b",goldDim:"#c8a535",mint:"#5ed4c4",
  orange:"#f47b3f",cream:"#fff8ee",creamDim:"rgba(255,248,238,.72)",
  muted:"#8b89b6",firefly:"#a8ff78",dustyPink:"#e8a0b4",auroraPurple:"#9b87f5",
};

function SectionHeader({title,sub,accent}:{title:string;sub:string;accent:string}){
  return(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <div style={{width:3,height:18,background:accent,borderRadius:2}}/>
        <span style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:16,fontWeight:800,color:C.cream}}>{title}</span>
      </div>
      <div style={{fontSize:10.5,color:C.muted,paddingLeft:13}}>{sub}</div>
    </div>
  );
}

function WinCard({label,amount,ratio,accent,glow,delay="0s"}:{label:string;amount:string;ratio:string;accent:string;glow:string;delay?:string}){
  return(
    <div style={{padding:"12px 14px",background:`linear-gradient(135deg,${glow},rgba(0,0,0,0))`,border:`1.5px solid ${accent}55`,borderRadius:12,animation:`pf-pop .5s ${delay} ease both`}}>
      <div style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:18,fontWeight:800,color:accent,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:26,fontWeight:800,color:C.cream,lineHeight:1}}>{amount}</div>
      <div style={{fontSize:9.5,color:C.creamDim,marginTop:4}}>{ratio} · Cascades possible</div>
    </div>
  );
}

function TreatBar({icon,name,fill,accent,animDelay}:{icon:string;name:string;fill:number;accent:string;animDelay:string}){
  const complete=fill>=1;
  return(
    <div style={{padding:"8px 12px",background:complete?`rgba(242,200,75,0.08)`:C.surface,border:`1px solid ${complete?"rgba(242,200,75,.35)":C.border}`,borderRadius:10,transition:"all .3s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:18,animation:complete?`pf-bounce 1.5s ${animDelay} ease-in-out infinite`:undefined}}>{icon}</span>
          <span style={{fontSize:11,fontWeight:700,color:complete?C.gold:C.cream}}>{name}</span>
        </div>
        <span style={{fontSize:11,fontWeight:800,color:accent,padding:"1px 6px",background:`${accent}18`,border:`1px solid ${accent}40`,borderRadius:8}}>
          {Math.round(fill*5)}/5 {complete&&"✓"}
        </span>
      </div>
      <div style={{height:7,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${fill*100}%`,background:`linear-gradient(90deg,${accent}88,${accent})`,borderRadius:4,boxShadow:complete?`0 0 8px ${accent}66`:undefined,"--w":`${fill*100}%`} as any}/>
      </div>
      {complete&&(
        <div style={{marginTop:6,fontSize:9.5,fontWeight:700,color:C.gold,animation:"pf-pop .4s ease both",display:"flex",alignItems:"center",gap:5}}>
          <span style={{animation:"pf-pulse 1s infinite"}}>★</span> Treat Jar Bonus · +3 Free Spins awarded!
        </div>
      )}
    </div>
  );
}

function FireflyDot({lit,i}:{lit:boolean;i:number}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <div style={{
        width:28,height:28,borderRadius:"50%",
        background:lit?"radial-gradient(circle,#d4ffb0,#a8ff78 50%,#52cc2a)":C.panel,
        border:`1.5px solid ${lit?"#a8ff78":C.border}`,
        boxShadow:lit?"0 0 12px rgba(168,255,120,.55),0 0 24px rgba(168,255,120,.2)":"none",
        animation:lit?`pf-drift ${1.6+i*.38}s ease-in-out infinite`:undefined,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
      }}>{lit?"✨":""}</div>
      <div style={{width:1,height:8,background:lit?"#a8ff7855":C.border}}/>
    </div>
  );
}

function CascadeStep({n,active}:{n:number;active:boolean}){
  return(
    <div style={{
      width:44,height:44,borderRadius:10,
      background:active?`linear-gradient(135deg,rgba(242,200,75,.25),rgba(242,200,75,.1))`:C.surface,
      border:`1.5px solid ${active?"rgba(242,200,75,.65)":C.border}`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
      boxShadow:active?"0 0 14px rgba(242,200,75,.2)":"none",
    }}>
      <span style={{fontSize:13,fontWeight:800,color:active?C.gold:C.muted}}>{n}</span>
      <span style={{fontSize:7.5,color:active?C.goldDim:C.muted,letterSpacing:"0.08em"}}>DROP</span>
    </div>
  );
}

function StreakBadge({count,active}:{count:number;active:boolean}){
  return(
    <div style={{
      padding:"8px 14px",borderRadius:10,
      background:active?`linear-gradient(135deg,rgba(244,123,63,.2),rgba(244,123,63,.08))`:C.surface,
      border:`1px solid ${active?"rgba(244,123,63,.5)":C.border}`,
      display:"flex",alignItems:"center",gap:8,
    }}>
      {Array.from({length:5}).map((_,i)=>(
        <div key={i} style={{
          width:22,height:22,borderRadius:6,fontSize:10,
          background:i<count?`rgba(244,123,63,.22)`:C.panel,
          border:`1px solid ${i<count?C.orange:C.border}`,
          color:i<count?C.orange:C.muted,
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:i<count&&active?`pf-bounce 1.2s ${i*.15}s ease-in-out infinite`:undefined,
        }}>★</div>
      ))}
      <div style={{marginLeft:4}}>
        <div style={{fontSize:10,fontWeight:700,color:active?C.orange:C.muted}}>{count} of 5</div>
        {active&&<div style={{fontSize:9,color:C.creamDim}}>+{count*10}% Sparkle Bonus</div>}
      </div>
    </div>
  );
}

function LevelBadge({from:f,to:t,active}:{from:number;to:number;active:boolean}){
  return(
    <div style={{
      padding:"10px 14px",borderRadius:12,overflow:"hidden",
      background:active?`linear-gradient(135deg,rgba(155,135,245,.2),rgba(94,212,196,.1))`:C.surface,
      border:`1px solid ${active?"rgba(155,135,245,.55)":C.border}`,
      position:"relative",
    }}>
      {active&&<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(155,135,245,.12),transparent 70%)",pointerEvents:"none"}}/>}
      <div style={{fontSize:9.5,fontWeight:700,color:active?C.auroraPurple:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>
        {active?"✦ LEVEL UP!":"Level"}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:22,fontWeight:800,color:active?"#c0b0ff":C.muted,fontFamily:"'Baloo 2',system-ui,sans-serif",textDecoration:active?"line-through":undefined,opacity:active?.6:1}}>{f}</div>
        {active&&<div style={{fontSize:14,color:C.auroraPurple,animation:"pf-bounce 1s ease-in-out infinite"}}>→</div>}
        <div style={{fontSize:28,fontWeight:800,color:C.cream,fontFamily:"'Baloo 2',system-ui,sans-serif",animation:active?"pf-pop .4s ease both":undefined}}>{t}</div>
      </div>
      {active&&<div style={{fontSize:10,color:C.creamDim,marginTop:4}}>+200 Sparks · New multiplier unlocked</div>}
    </div>
  );
}

export function Playful(){
  useEffect(()=>{document.body.style.cssText="margin:0;padding:0;overflow:hidden;background:#06081a";},[]);

  return(
    <div style={{width:1440,height:900,overflow:"hidden",fontFamily:"system-ui,sans-serif",background:C.void,position:"relative",display:"flex",flexDirection:"column"}}>
      <style>{KF}</style>
      {/* Ambient blooms */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",width:600,height:300,left:"25%",top:0,background:"radial-gradient(ellipse,rgba(155,135,245,.06),transparent 70%)",filter:"blur(40px)"}}/>
        <div style={{position:"absolute",width:500,height:300,right:"10%",bottom:0,background:"radial-gradient(ellipse,rgba(94,212,196,.05),transparent 70%)",filter:"blur(40px)"}}/>
      </div>

      {/* ── HEADER ── */}
      <header style={{position:"relative",zIndex:10,height:60,display:"flex",alignItems:"center",padding:"0 32px",background:`linear-gradient(180deg,${C.night},rgba(12,15,46,.9))`,borderBottom:`1px solid ${C.border}`,gap:16,flexShrink:0}}>
        <span style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:18,fontWeight:800,color:C.cream}}>Progress Feedback — <span style={{color:C.gold}}>Playful</span></span>
        <div style={{width:1,height:24,background:C.border}}/>
        <span style={{fontSize:11,color:C.muted}}>Expressive · Non-distracting · Accessible contrast · All states shown</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {[C.gold,C.mint,C.orange,C.dustyPink].map((c,i)=>(<div key={i} style={{width:8,height:8,borderRadius:"50%",background:c,animation:`pf-pulse ${1.2+i*.3}s ${i*.2}s infinite`}}/>))}
        </div>
      </header>

      {/* ── FOUR COLUMN BOARD ── */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,overflow:"hidden",position:"relative",zIndex:2}}>

        {/* ── COL 1: WIN MOMENTS ── */}
        <div style={{padding:"20px 18px",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
          <SectionHeader title="Win Moments" sub="Outcome feedback at 3 magnitudes" accent={C.gold}/>
          <WinCard label="NICE WIN" amount="+20 coins" ratio="1× bet" accent={C.mint} glow="rgba(94,212,196,.10)" delay="0s"/>
          <WinCard label="BIG WIN" amount="+240 coins" ratio="12× bet · ×3 mult" accent={C.gold} glow="rgba(242,200,75,.12)" delay=".1s"/>
          <WinCard label="HUGE WIN" amount="+1,200 coins" ratio="60× bet · cascade" accent={C.orange} glow="rgba(244,123,63,.14)" delay=".2s"/>
          <div style={{marginTop:4,padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Status line (small win)</div>
            <div style={{fontSize:12.5,color:C.creamDim}}>+20 coins <span style={{color:C.mint}}>✦</span></div>
            <div style={{fontSize:9.5,color:C.muted,marginTop:6}}>Used for sub-1× wins — keeps noise low</div>
          </div>
          <div style={{marginTop:4,padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Design principles</div>
            {["Glow scales with win magnitude","Gold for wins, mint for collection, orange for streak","No flashing — pulse only","Banner fades after 2.5s","WCAG AA contrast on all states"].map(p=>(
              <div key={p} style={{fontSize:9.5,color:C.creamDim,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                <span style={{color:C.mint,flexShrink:0}}>·</span>{p}
              </div>
            ))}
          </div>
        </div>

        {/* ── COL 2: TREAT JAR PROGRESS ── */}
        <div style={{padding:"20px 18px",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
          <SectionHeader title="Treat Jar Progress" sub="Four collection states per treat type" accent={C.mint}/>
          <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>Phoebe's picks (quantity-first)</div>
          <TreatBar icon="🍗" name="Chicken Comets" fill={0} accent="#f5c86a" animDelay="0s"/>
          <TreatBar icon="🍗" name="Chicken Comets" fill={0.4} accent="#f5c86a" animDelay="0s"/>
          <TreatBar icon="🍗" name="Chicken Comets" fill={0.8} accent="#f5c86a" animDelay="0s"/>
          <TreatBar icon="🍗" name="Chicken Comets" fill={1} accent="#f5c86a" animDelay="0s"/>
          <div style={{marginTop:4,fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>Joey's pick (bougie only)</div>
          <TreatBar icon="💎" name="Bougie Bites" fill={0.2} accent="#d4a4ff" animDelay=".1s"/>
          <div style={{marginTop:4,padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Character connection</div>
            <div style={{fontSize:9.5,color:C.creamDim,lineHeight:1.6}}>
              Bar accent color matches treat personality —<br/>
              Phoebe: warm yellows &amp; teals (generous)<br/>
              Joey: purple-pink (selective, bougie)
            </div>
          </div>
        </div>

        {/* ── COL 3: FIREFLY CASCADE ── */}
        <div style={{padding:"20px 18px",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
          <SectionHeader title="Firefly Cascade Meter" sub="6 states · glow builds to trigger" accent={C.firefly}/>
          {[1,3,5,6].map(count=>(
            <div key={count} style={{padding:"12px 14px",background:count===6?`rgba(168,255,120,.08)`:C.surface,border:`1px solid ${count===6?"rgba(168,255,120,.45)":C.border}`,borderRadius:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase"}}>{count===6?"TRIGGERED!":"Filling"}</span>
                <span style={{fontSize:11,fontWeight:800,color:C.firefly}}>{count}/6</span>
              </div>
              <div style={{display:"flex",gap:5,justifyContent:"center"}}>
                {Array.from({length:6}).map((_,i)=><FireflyDot key={i} lit={i<count} i={i}/>)}
              </div>
              {count===6&&(
                <div style={{marginTop:8,fontSize:10,fontWeight:700,color:C.firefly,textAlign:"center",animation:"pf-pop .4s ease both"}}>
                  ✦ Firefly Cascade activated · Reel multipliers live
                </div>
              )}
            </div>
          ))}
          <div style={{padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Glow progression</div>
            <div style={{fontSize:9.5,color:C.creamDim,lineHeight:1.6}}>
              Each firefly adds glow intensity.<br/>
              At 4/6: jar border starts pulsing.<br/>
              At 6/6: full bloom + trigger text.<br/>
              No text at 0–3 (keep focus on play).
            </div>
          </div>
        </div>

        {/* ── COL 4: CASCADE & STREAK ── */}
        <div style={{padding:"20px 18px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
          <SectionHeader title="Cascade & Streak" sub="Step tracking · chase streak · level up" accent={C.orange}/>

          <div>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Cascade step indicator</div>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
              <CascadeStep n={1} active={true}/>
              <div style={{flex:1,height:2,background:`linear-gradient(90deg,${C.gold},rgba(242,200,75,.3))`,borderRadius:1}}/>
              <CascadeStep n={2} active={false}/>
              <div style={{flex:1,height:2,background:C.border,borderRadius:1}}/>
              <CascadeStep n={3} active={false}/>
            </div>
            <div style={{fontSize:9.5,color:C.creamDim,marginTop:6,paddingLeft:2}}>Active step glows · completed steps dim · future steps neutral</div>
          </div>

          <div>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Chase streak states</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <StreakBadge count={0} active={false}/>
              <StreakBadge count={3} active={true}/>
              <StreakBadge count={5} active={true}/>
            </div>
          </div>

          <div>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Level up feedback</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <LevelBadge from={3} to={3} active={false}/>
              <LevelBadge from={3} to={4} active={true}/>
            </div>
          </div>

          <div style={{padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,marginTop:2}}>
            <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Hierarchy principles</div>
            {["Wins → center-stage overlays","Collection → persistent sidebar","Cascade → compact top strip","Streak → footer chip","Level → HUD pulse (non-blocking)","Reduced motion: no bounce/spin"].map(p=>(
              <div key={p} style={{fontSize:9.5,color:C.creamDim,display:"flex",alignItems:"flex-start",gap:5,marginBottom:3}}>
                <span style={{color:C.orange,flexShrink:0}}>·</span>{p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
