/**
 * Chai Chasers — Retro-Bright Midnight PNW Design System
 * Compact visual spec: color tokens, typography, components, character guide.
 * Canvas design artifact — do not apply to any codebase.
 */
import { useEffect } from "react";

const KF = `
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Baloo+2:wght@500&display=swap');
@keyframes ds-pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes ds-rise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
`;

const TOKENS = {
  colors:[
    {name:"Midnight Navy",  hex:"#070d20",role:"Primary background",         text:"#fff8ee",border:"#1a2a5e"},
    {name:"Midnight 2",     hex:"#0f1535",role:"Elevated surface",            text:"#fff8ee",border:"#1e2d70"},
    {name:"Warm Cream",     hex:"#fff8ee",role:"Primary text on dark",        text:"#070d20",border:"#e8d8c0"},
    {name:"Burnt Orange",   hex:"#f47b3f",role:"Primary CTA · adventure",     text:"#fff8ee",border:"#c05a25"},
    {name:"Teal",           hex:"#41b8b7",role:"Secondary · collectibles",    text:"#070d20",border:"#2a8f8e"},
    {name:"Butter Yellow",  hex:"#f2c84b",role:"Win · celebration · gold",    text:"#070d20",border:"#c89e2a"},
    {name:"Dusty Pink",     hex:"#e8a0b4",role:"Soft accent · Joey's spirit", text:"#070d20",border:"#c07090"},
    {name:"Mint",           hex:"#5ed4c4",role:"Fresh · PNW forest · stars",  text:"#070d20",border:"#30a898"},
    {name:"Aurora Purple",  hex:"#7c3aed",role:"Cosmic · UniGlee · bonus",    text:"#fff8ee",border:"#5b1fc7"},
    {name:"Muted Slate",    hex:"#8b89b6",role:"Secondary labels · dim text", text:"#070d20",border:"#6a688a"},
    {name:"Firefly Green",  hex:"#a8ff78",role:"Firefly Cascade · energy",    text:"#070d20",border:"#60d030"},
  ],
  typescale:[
    {name:"Display",  family:"'Baloo 2', system-ui",weight:800,size:48,use:"Game title, hero moments"},
    {name:"Heading 1",family:"'Baloo 2', system-ui",weight:800,size:36,use:"Section titles, win overlays"},
    {name:"Heading 2",family:"'Baloo 2', system-ui",weight:700,size:24,use:"Panel headers, character names"},
    {name:"Body L",   family:"system-ui, sans-serif",weight:500,size:16,use:"Hook copy, description"},
    {name:"Body S",   family:"system-ui, sans-serif",weight:500,size:13,use:"Secondary copy"},
    {name:"Label",    family:"system-ui, sans-serif",weight:700,size:10,use:"UPPERCASE tracking labels"},
    {name:"Micro",    family:"system-ui, sans-serif",weight:700,size:8.5,use:"HUD chips, badges"},
  ],
};

const C = {
  void:"#06081a",night:"#070d20",surface:"#12173f",panel:"#181e50",
  border:"#252d72",gold:"#f2c84b",mint:"#5ed4c4",orange:"#f47b3f",
  cream:"#fff8ee",creamDim:"rgba(255,248,238,.72)",muted:"#8b89b6",
  dustyPink:"#e8a0b4",auroraPurple:"#7c3aed",firefly:"#a8ff78",teal:"#41b8b7",
};

function ColSwatch({name,hex,role,text,border}:{name:string;hex:string;role:string;text:string;border:string}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:10,overflow:"hidden",border:`1px solid ${border}22`}}>
      <div style={{height:52,background:hex,display:"flex",alignItems:"flex-end",padding:"6px 8px"}}>
        <span style={{fontSize:9,fontWeight:700,color:text,opacity:.85,letterSpacing:"0.05em"}}>{hex.toUpperCase()}</span>
      </div>
      <div style={{padding:"7px 8px",background:"rgba(255,255,255,.03)"}}>
        <div style={{fontSize:10,fontWeight:700,color:C.cream,marginBottom:1}}>{name}</div>
        <div style={{fontSize:8.5,color:C.muted,lineHeight:1.4}}>{role}</div>
      </div>
    </div>
  );
}

function TypeRow({name,family,weight,size,use}:{name:string;family:string;weight:number;size:number;use:string}){
  return(
    <div style={{display:"flex",alignItems:"baseline",gap:0,padding:"10px 0",borderBottom:`1px solid rgba(255,255,255,.05)`}}>
      <div style={{flex:"0 0 120px"}}>
        <div style={{fontSize:9.5,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{name}</div>
        <div style={{fontSize:8,color:C.muted,marginTop:2}}>{weight}w · {size}px</div>
      </div>
      <div style={{flex:1,fontFamily:family,fontSize:Math.min(size,28),fontWeight:weight,color:C.cream,lineHeight:1.2}}>
        Cozy cosmic chai chasers
      </div>
      <div style={{flex:"0 0 180px",fontSize:9,color:C.muted,textAlign:"right"}}>{use}</div>
    </div>
  );
}

export function SystemShowcase(){
  useEffect(()=>{document.body.style.cssText="margin:0;padding:0;overflow:hidden;background:#06081a";},[]);

  return(
    <div style={{width:1440,height:900,overflow:"hidden",fontFamily:"system-ui,sans-serif",background:C.void,color:C.cream,display:"flex",flexDirection:"column"}}>
      <style>{KF}</style>

      {/* ── BRAND HEADER ── */}
      <header style={{height:64,display:"flex",alignItems:"center",padding:"0 32px",background:`linear-gradient(180deg,${C.night} 0%,rgba(7,13,32,.92) 100%)`,borderBottom:`1px solid ${C.border}`,gap:16,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${C.mint},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>☕</div>
          <div>
            <div style={{fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:16,fontWeight:800,color:C.cream,lineHeight:1}}>Chai Chasers</div>
            <div style={{fontSize:10,fontWeight:700,color:C.gold,letterSpacing:"0.05em"}}>Retro-Bright Midnight PNW</div>
          </div>
        </div>
        <div style={{width:1,height:28,background:C.border}}/>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>
          Mobile-first · Midnight navy base · Warm cream text · Rounded outlined illustration · Accessible contrast
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {[C.orange,C.gold,C.mint,C.teal,C.dustyPink,C.auroraPurple,C.firefly].map((c,i)=>(
            <div key={i} style={{width:12,height:12,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}55`}}/>
          ))}
        </div>
      </header>

      {/* ── MAIN BODY: 3 columns ── */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 340px 280px",overflow:"hidden"}}>

        {/* ── LEFT: COLORS + TYPOGRAPHY ── */}
        <div style={{padding:"20px 24px",borderRight:`1px solid ${C.border}`,overflowY:"auto",display:"flex",flexDirection:"column",gap:20}}>

          {/* Color palette */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:3,height:14,background:C.gold,borderRadius:2}}/> Color Tokens
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {TOKENS.colors.map(c=><ColSwatch key={c.hex} {...c}/>)}
            </div>
          </div>

          {/* Typography */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:3,height:14,background:C.mint,borderRadius:2}}/> Typography Scale
            </div>
            <div style={{padding:"0 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
              {TOKENS.typescale.map(t=><TypeRow key={t.name} {...t}/>)}
            </div>
          </div>
        </div>

        {/* ── CENTER: COMPONENTS ── */}
        <div style={{padding:"20px 20px",borderRight:`1px solid ${C.border}`,overflowY:"auto",display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:3,height:14,background:C.orange,borderRadius:2}}/> Core Components
          </div>

          {/* Buttons */}
          <div style={{padding:"14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Buttons</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button style={{padding:"0 20px",height:52,borderRadius:14,background:`linear-gradient(160deg,${C.gold},#e5a800 60%,#c8860a)`,boxShadow:`0 5px 0 #8a5a00,0 8px 20px rgba(242,200,75,.32)`,border:"none",color:C.night,fontFamily:"'Baloo 2',system-ui,sans-serif",fontSize:17,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span>✦</span> SPARKLE! <span style={{fontSize:9,fontWeight:600,opacity:.7}}>Primary</span>
              </button>
              <button style={{padding:"0 20px",height:44,borderRadius:12,background:`linear-gradient(160deg,${C.orange},#c05a25)`,boxShadow:`0 4px 0 #8a3a10,0 6px 16px rgba(244,123,63,.28)`,border:"none",color:C.cream,fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Start the Chase <span style={{fontSize:9,fontWeight:600,opacity:.7}}>  Secondary CTA</span>
              </button>
              <button style={{padding:"0 20px",height:40,borderRadius:10,background:"transparent",border:`1.5px solid rgba(255,248,238,.3)`,color:C.creamDim,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                How it works ↓ <span style={{fontSize:9,opacity:.5}}>  Ghost</span>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div style={{padding:"14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Badges &amp; Chips</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {[
                {label:"BIG WIN",bg:"rgba(242,200,75,.2)",border:"rgba(242,200,75,.55)",color:C.gold},
                {label:"WILD CHAI",bg:"rgba(244,123,63,.18)",border:"rgba(244,123,63,.5)",color:C.orange},
                {label:"×3 MULT",bg:"rgba(242,200,75,.25)",border:C.gold,color:C.night},
                {label:"LEVEL 3",bg:"rgba(155,135,245,.18)",border:"rgba(155,135,245,.5)",color:"#b8a8ff"},
                {label:"CASCADE",bg:"rgba(94,212,196,.12)",border:"rgba(94,212,196,.4)",color:C.mint},
                {label:"FREE SPINS",bg:"rgba(168,255,120,.12)",border:"rgba(168,255,120,.4)",color:C.firefly},
              ].map(b=>(
                <div key={b.label} style={{padding:"4px 10px",borderRadius:8,background:b.bg,border:`1px solid ${b.border}`,color:b.color,fontSize:9,fontWeight:800,letterSpacing:"0.1em"}}>{b.label}</div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{padding:"14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Progress Bars</div>
            {[{l:"🍗 Chicken Comets",f:.4,a:"#f5c86a"},{l:"🐟 Salmon Stars",f:.8,a:"#82d8ff"},{l:"💎 Bougie Bites",f:.2,a:"#d4a4ff"}].map(b=>(
              <div key={b.l} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10.5,color:C.cream}}>{b.l}</span>
                  <span style={{fontSize:10.5,fontWeight:700,color:b.a}}>{Math.round(b.f*5)}/5</span>
                </div>
                <div style={{height:7,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                  <div style={{width:`${b.f*100}%`,height:"100%",background:`linear-gradient(90deg,${b.a}88,${b.a})`,borderRadius:4}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Reel cell */}
          <div style={{padding:"14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Reel Cells</div>
            <div style={{display:"flex",gap:6}}>
              {[{s:"☕",l:"CUP",win:true},{s:"🍃",l:"LEAF",win:false},{s:"🐱",l:"WILD",wild:true,win:false}].map((c,i)=>(
                <div key={i} style={{width:70,height:82,background:c.win?"rgba(242,200,75,.1)":C.panel,border:`1.5px solid ${c.win?"rgba(242,200,75,.55)":C.border}`,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,position:"relative"}}>
                  <span style={{fontSize:26}}>{c.s}</span>
                  <span style={{fontSize:8,fontWeight:700,color:c.win?C.gold:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{c.l}</span>
                  {c.wild&&<div style={{position:"absolute",top:4,left:4,padding:"1px 5px",borderRadius:5,background:C.orange,color:C.cream,fontSize:7,fontWeight:800}}>WILD</div>}
                  {c.win&&<div style={{position:"absolute",bottom:3,width:5,height:5,borderRadius:"50%",background:C.gold,animation:"ds-pulse 1.2s infinite"}}/>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: CHARACTER & ILLUSTRATION GUIDE ── */}
        <div style={{padding:"20px 18px",overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:3,height:14,background:C.dustyPink,borderRadius:2}}/> Illustration Guide
          </div>

          {/* Character art reference */}
          <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,position:"relative",height:180}}>
            <img src="/__mockup/images/chai-chase-splash.png" alt="Joey and Phoebe — Chai Chase splash art" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(6,8,26,.85) 0%,rgba(6,8,26,.3) 50%,transparent 80%)"}}/>
            <div style={{position:"absolute",bottom:10,left:12,right:12,display:"flex",gap:8}}>
              <div style={{padding:"3px 8px",borderRadius:20,background:"rgba(12,15,46,.85)",border:`1px solid ${C.border}`,fontSize:9,color:C.creamDim,backdropFilter:"blur(8px)"}}>Joey 😼 slender gray</div>
              <div style={{padding:"3px 8px",borderRadius:20,background:"rgba(12,15,46,.85)",border:`1px solid ${C.border}`,fontSize:9,color:C.creamDim,backdropFilter:"blur(8px)"}}>Phoebe 😸 tuxedo</div>
            </div>
          </div>

          {/* Characters */}
          {[
            {name:"Joey",emoji:"😼",desc:"Slender gray · yellow eyes · aloof, bougie personality · holds out for Bougie Bites only"},
            {name:"Phoebe",emoji:"😸",desc:"Black-and-white tuxedo · full-figured · friendly · accepts any treat (quantity-first)"},
            {name:"UniGlee",emoji:"🦋",desc:"Rainbow butterfly · namesake bonus character · Spin Marathon trigger · rare cosmic visitor"},
          ].map(c=>(
            <div key={c.name} style={{padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:24,flexShrink:0}}>{c.emoji}</span>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.cream,marginBottom:2}}>{c.name}</div>
                <div style={{fontSize:9,color:C.creamDim,lineHeight:1.5}}>{c.desc}</div>
              </div>
            </div>
          ))}

          {/* Style rules */}
          <div style={{padding:"12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>Style Rules</div>
            {[
              "Rounded, outlined illustration · no photo-realism",
              "Pacific Northwest: aurora, midnight sky, mountain silhouettes",
              "Jewel-toned iced chai with straws (emerald, sapphire, ruby)",
              "Cosmic elements: fireflies, stars, sparkle trails",
              "No hot chai · no farm/cow imagery · no gambling language",
              "No real people, logos, brands, or copied trade dress",
            ].map(r=>(
              <div key={r} style={{fontSize:9,color:C.creamDim,display:"flex",gap:5,marginBottom:4,lineHeight:1.4}}>
                <span style={{color:C.mint,flexShrink:0}}>·</span>{r}
              </div>
            ))}
          </div>

          {/* Spacing & radius tokens */}
          <div style={{padding:"12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>Spacing &amp; Radius</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[{l:"Button radius",v:"14px"},{l:"Card radius",v:"12px"},{l:"Badge radius",v:"8px"},{l:"Progress h",v:"7–8px"},{l:"Border",v:"1–1.5px"},{l:"Touch target",v:"≥44px"}].map(t=>(
                <div key={t.l} style={{padding:"5px 8px",background:"rgba(255,255,255,.04)",borderRadius:6}}>
                  <div style={{fontSize:8.5,color:C.muted}}>{t.l}</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.cream}}>{t.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
