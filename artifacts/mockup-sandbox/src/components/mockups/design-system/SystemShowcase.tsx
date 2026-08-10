/**
 * Chai Chasers — Retro-Bright Midnight PNW Design System
 * Compact visual spec: color tokens, typography, components, character guide.
 * Canvas design artifact — do not apply to any codebase.
 */
import { useEffect, useState } from "react";
import { modules as discoveredModules } from "../../../.generated/mockup-components";

/**
 * The design-system folder prefix used to filter the auto-generated module map.
 * Any .tsx file placed under components/mockups/design-system/ is automatically
 * included in the mount-time self-check — no manual list maintenance required.
 */
const DS_PATH_PREFIX = "./components/mockups/design-system/";

/**
 * Mirror of the resolver used by PreviewRenderer / _resolveComponent in App.tsx.
 * Returns the resolved component or undefined when none can be found.
 */
function resolveFromMod(
  mod: Record<string, unknown>,
  name: string,
): ((...args: unknown[]) => unknown) | undefined {
  const isFn = (v: unknown): v is (...args: unknown[]) => unknown =>
    typeof v === "function";
  const fns = Object.values(mod).filter(isFn);
  // Check each candidate explicitly for function-ness before accepting it —
  // a truthy default export that is a plain object or string is NOT a component.
  return (
    (isFn(mod.default)   ? mod.default   : undefined) ||
    (isFn(mod.Preview)   ? mod.Preview   : undefined) ||
    (isFn(mod[name])     ? mod[name]     : undefined) ||
    fns[fns.length - 1]
  );
}

const KF = `
/* Fonts are self-hosted via @font-face in src/index.css (public/fonts/) */
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

/** Card header: prominent display name + one-line usage note */
function SectionLabel({name,note,accent=C.muted}:{name:string;note:string;accent?:string}){
  return(
    <div style={{marginBottom:10,paddingBottom:8,borderBottom:`1px solid rgba(255,255,255,.06)`}}>
      <div style={{fontSize:11,fontWeight:700,color:C.cream,letterSpacing:"0.06em",textTransform:"uppercase",lineHeight:1}}>
        {name}
      </div>
      <div style={{fontSize:9,color:accent,marginTop:3,lineHeight:1.5}}>{note}</div>
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

  // ── Self-check: verify all expected design-system paths are discoverable ──
  const [dsWarnings, setDsWarnings] = useState<string[]>([]);

  useEffect(()=>{
    async function checkComponents(){
      const issues: string[] = [];

      // Dynamically collect every design-system path from the generated module map.
      // No manual list — any file added to components/mockups/design-system/ is
      // automatically validated here without requiring a code change in this file.
      const dsPaths = Object.keys(discoveredModules).filter(
        (k) => k.startsWith(DS_PATH_PREFIX),
      );

      for (const path of dsPaths) {
        const loader = discoveredModules[path];
        // Shouldn't happen (we just got the key from the map), but guard anyway.
        if (!loader) {
          const msg = `Missing loader for "${path}" — regenerate mockup-components.ts`;
          console.warn(`[SystemShowcase] ${msg}`);
          issues.push(msg);
          continue;
        }
        try {
          const mod = await loader();
          const name = path.split("/").pop()!.replace(/\.tsx$/, "");
          const resolved = resolveFromMod(mod, name);
          if (!resolved) {
            const msg = `No exported component found in "${path}" — the file must export a named component matching the filename, "default", or "Preview"`;
            console.warn(`[SystemShowcase] ${msg}`);
            issues.push(msg);
          }
        } catch(e) {
          const msg = `Failed to load "${path}": ${e instanceof Error ? e.message : String(e)}`;
          console.warn(`[SystemShowcase] ${msg}`);
          issues.push(msg);
        }
      }

      setDsWarnings(issues);
    }

    void checkComponents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return(
    <div style={{width:1440,height:900,overflow:"hidden",fontFamily:"system-ui,sans-serif",background:C.void,color:C.cream,display:"flex",flexDirection:"column"}}>
      <style>{KF}</style>

      {/* ── DEV-TIME WARNINGS: missing / unresolvable design-system components ── */}
      {dsWarnings.length > 0 && (
        <div role="alert" style={{
          background:"rgba(244,63,94,.15)",
          border:"1px solid rgba(244,63,94,.5)",
          borderRadius:0,
          padding:"8px 20px",
          flexShrink:0,
          display:"flex",
          flexDirection:"column",
          gap:4,
        }}>
          <div style={{fontSize:11,fontWeight:700,color:"#fb7185",letterSpacing:"0.08em",textTransform:"uppercase"}}>
            ⚠ Design-system component check failed ({dsWarnings.length} issue{dsWarnings.length!==1?"s":""})
          </div>
          {dsWarnings.map((w,i)=>(
            <div key={i} style={{fontSize:10,color:"#fda4af",fontFamily:"'Fira Code',monospace,system-ui"}}>{w}</div>
          ))}
        </div>
      )}

      {/* ── BRAND HEADER ── */}
      <header style={{height:64,display:"flex",alignItems:"center",padding:"0 32px",background:`linear-gradient(180deg,${C.night} 0%,rgba(7,13,32,.92) 100%)`,borderBottom:`1px solid ${C.border}`,gap:16,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${C.mint},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg viewBox="0 0 28 36" width={22} height={28} aria-hidden="true">
                {/* Cup body */}
                <path d="M5 8 L7 34 H21 L23 8 Z" fill="#0f1535" stroke="#5ed4c4" strokeWidth="1.4" strokeLinejoin="round"/>
                {/* Iced chai fill — amber-teal gradient */}
                <path d="M6.2 14 L7.4 32 H20.6 L21.8 14 Z" fill="url(#dsIce)"/>
                {/* Ice cubes */}
                <rect x="9" y="18" width="5" height="5" rx="1" fill="rgba(255,255,255,.3)" stroke="rgba(255,255,255,.5)" strokeWidth=".6"/>
                <rect x="14.5" y="20" width="4" height="4" rx="1" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.45)" strokeWidth=".6"/>
                {/* Straw */}
                <rect x="17" y="3" width="2" height="22" rx="1" fill="#f47b3f"/>
                {/* Lid */}
                <rect x="4" y="6" width="20" height="3.5" rx="1.5" fill="#5ed4c4" opacity=".9"/>
                {/* Dome top */}
                <ellipse cx="14" cy="6" rx="10" ry="2" fill="#82e8dc"/>
                <defs>
                  <linearGradient id="dsIce" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f2c84b" stopOpacity=".85"/>
                    <stop offset="55%" stopColor="#c07530" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#6b3a12" stopOpacity=".95"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
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
            <SectionLabel name="Buttons" note="Primary (Sparkle), secondary CTA, ghost · Baloo 2 · min 44 px touch target" accent={C.gold}/>
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
            <SectionLabel name="Badges & Chips" note="Game-state labels · outlined pill · 9 px uppercase · color-coded by context" accent={C.mint}/>
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
            <SectionLabel name="Progress Bars" note="Treat Jar fill per symbol · 7 px track · per-symbol accent color" accent={C.teal}/>
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
            <SectionLabel name="Reel Cells" note="5×4 board tiles · 70×82 px · Butter Yellow win highlight + pulse dot · WILD badge" accent={C.gold}/>
            <div style={{display:"flex",gap:6}}>
              {/* Tumbler (top symbol), Butterfly, Cat Wild */}
              {[
                {win:true, label:"TUMBLER", content:(
                  <svg viewBox="0 0 28 38" width={28} height={34} aria-hidden="true">
                    <defs>
                      <linearGradient id="rcIce" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f2c84b" stopOpacity=".9"/>
                        <stop offset="50%" stopColor="#c07530" stopOpacity=".95"/>
                        <stop offset="100%" stopColor="#6b3a12"/>
                      </linearGradient>
                    </defs>
                    <path d="M4 8 L6.5 36 H21.5 L24 8 Z" fill="#0f1535" stroke="#5ed4c4" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M5.4 15 L7.2 34 H20.8 L22.6 15 Z" fill="url(#rcIce)"/>
                    <rect x="8" y="19" width="5" height="5" rx="1" fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.45)" strokeWidth=".6"/>
                    <rect x="14" y="21" width="4" height="4" rx="1" fill="rgba(255,255,255,.22)" strokeWidth=".6"/>
                    <rect x="18" y="3" width="2" height="22" rx="1" fill="#f47b3f"/>
                    <rect x="3" y="6" width="22" height="3.5" rx="1.5" fill="#5ed4c4" opacity=".9"/>
                    <ellipse cx="14" cy="6" rx="11" ry="2" fill="#82e8dc"/>
                  </svg>
                ), wild:false},
                {win:false, label:"BUTTERFLY", content:(
                  <svg viewBox="0 0 36 32" width={34} height={30} aria-hidden="true">
                    <ellipse cx="10" cy="14" rx="9" ry="6" fill="#a8ff78" opacity=".82" transform="rotate(-20,10,14)"/>
                    <ellipse cx="10" cy="22" rx="6" ry="4" fill="#5ed4c4" opacity=".75" transform="rotate(15,10,22)"/>
                    <ellipse cx="26" cy="14" rx="9" ry="6" fill="#a8ff78" opacity=".82" transform="rotate(20,26,14)"/>
                    <ellipse cx="26" cy="22" rx="6" ry="4" fill="#5ed4c4" opacity=".75" transform="rotate(-15,26,22)"/>
                    <ellipse cx="18" cy="17" rx="2" ry="8" fill="#7c3aed"/>
                    <line x1="18" y1="10" x2="12" y2="4" stroke="#f2c84b" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="18" y1="10" x2="24" y2="4" stroke="#f2c84b" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                ), wild:false},
                {win:false, label:"WILD", content:(
                  <svg viewBox="0 0 36 32" width={34} height={30} aria-hidden="true">
                    <ellipse cx="18" cy="18" rx="13" ry="11" fill="#1a1040" stroke="#e8a0b4" strokeWidth="1.2"/>
                    <ellipse cx="13" cy="15" rx="3.5" ry="4" fill="#f0e8ff" opacity=".9"/>
                    <ellipse cx="23" cy="15" rx="3.5" ry="4" fill="#f0e8ff" opacity=".9"/>
                    <ellipse cx="13" cy="15" rx="1.5" ry="2.5" fill="#7c3aed"/>
                    <ellipse cx="23" cy="15" rx="1.5" ry="2.5" fill="#7c3aed"/>
                    <path d="M14 22 Q18 25 22 22" fill="none" stroke="#e8a0b4" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="6" y1="13" x2="1" y2="11" stroke="#e8a0b4" strokeWidth=".8" strokeLinecap="round"/>
                    <line x1="6" y1="15" x2="1" y2="15" stroke="#e8a0b4" strokeWidth=".8" strokeLinecap="round"/>
                    <line x1="30" y1="13" x2="35" y2="11" stroke="#e8a0b4" strokeWidth=".8" strokeLinecap="round"/>
                    <line x1="30" y1="15" x2="35" y2="15" stroke="#e8a0b4" strokeWidth=".8" strokeLinecap="round"/>
                  </svg>
                ), wild:true},
              ].map((c,i)=>(
                <div key={i} style={{width:70,height:82,background:c.win?"rgba(242,200,75,.1)":C.panel,border:`1.5px solid ${c.win?"rgba(242,200,75,.55)":C.border}`,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,position:"relative"}}>
                  {c.content}
                  <span style={{fontSize:8,fontWeight:700,color:c.win?C.gold:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{c.label}</span>
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
            <SectionLabel name="Style Rules" note="Guardrails for AI-generated & hand-drawn assets in this design system" accent={C.dustyPink}/>
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
            <SectionLabel name="Spacing & Radius" note="Token values for consistent sizing across all components" accent={C.muted}/>
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
