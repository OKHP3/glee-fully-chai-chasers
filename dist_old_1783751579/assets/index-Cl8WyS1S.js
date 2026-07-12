(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const s of l.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function o(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(i){if(i.ep)return;i.ep=!0;const l=o(i);fetch(i.href,l)}})();let k=null,Q=!0;function N(e){Q=e}function me(){return k!==null}function ee(){k||(k=new(window.AudioContext||window.webkitAudioContext)),ge()}async function ge(){if(k&&k.state!=="running")try{await k.resume()}catch{}}function M(e,t,o,r,i){if(!k||!Q)return;const l=k.createOscillator(),s=k.createGain();l.type=i,l.frequency.value=e;const a=k.currentTime+t;s.gain.setValueAtTime(0,a),s.gain.linearRampToValueAtTime(r,a+.015),s.gain.exponentialRampToValueAtTime(1e-4,a+o),l.connect(s).connect(k.destination),l.start(a),l.stop(a+o+.05)}function be(){[523.25,659.25,783.99].forEach((e,t)=>M(e,t*.09,.22,.18,"triangle"))}function te(){M(220,0,.08,.12,"sine")}function oe(e){const t=261.63*Math.pow(2,Math.min(e,8)/12);[0,4,7].forEach((o,r)=>{const i=t*Math.pow(2,o/12);M(i,r*.05,.18,.15,"sine")})}function re(){M(880,0,.12,.2,"triangle"),M(1108.73,.05,.15,.15,"triangle")}function A(){[392,523.25,659.25,783.99].forEach((e,t)=>M(e,t*.08,.35,.22,"sawtooth"))}function ke(){for(let e=0;e<14;e++)M(440-e*6,e*.16,.05,.1,"square")}function ve(){[261.63,329.63,392,523.25,659.25,783.99].forEach((t,o)=>M(t,o*.07,.4,.25,"sawtooth"))}const $e=12;function ie(){return{chicken:0,salmon:0,boogie:0}}function Ge(e,t){const o={...e};return o[t]=Math.min($e,o[t]+1),o}const U=1/32;function Se(e,t,o){const r=o>=15?U*2:U;return e()>=r?void 0:e()<.6?t.chicken>0||t.salmon>0||t.boogie>0?{cat:"phoebe",fed:!0,assist:"sparkle_sort",quip:"Freak'n facts on facts — Phoebe approves."}:{cat:"phoebe",fed:!1,assist:"shuffle_consolation",quip:"Phoebe has reviewed your offering. Phoebe is unmoved."}:t.boogie>0?{cat:"joey",fed:!0,assist:"drop_in",quip:"Joey requires Boogie Bites. Joey approves of this jar."}:{cat:"joey",fed:!1,assist:"shuffle_consolation",quip:"Joey requires Boogie Bites. Joey is a professional."}}function Me(e,t){if(!t.fed)return e;const o={...e};return t.cat==="joey"?o.boogie=Math.max(0,o.boogie-1):o.boogie>0?o.boogie-=1:o.salmon>0?o.salmon-=1:o.chicken>0&&(o.chicken-=1),o}const K=[25,50,125,250,625,1250],Le=12,Ae=25,Ee=1e6,_e=5e5;function Ce(e){return e>=Le?[...K]:K.slice(0,5)}function le(e){return e/Ae}function Te(e){return Math.max(1,Math.round(e/25))}function Pe(e){let t=1;for(;e>=q(t+1);)t++;return t}function q(e){return(e-1)*500}function qe(e){const t=Pe(e),o=e-q(t),r=q(t+1)-q(t);return{level:t,into:o,span:r}}function ze(e,t){return e>=t?{balance:e,refilled:!1}:{balance:e+_e,refilled:!0}}const J="ccv1.";function G(e,t){try{const o=localStorage.getItem(J+e);return o===null?t:JSON.parse(o)}catch{return t}}function S(e,t){try{localStorage.setItem(J+e,JSON.stringify(t))}catch{}}function We(){for(const e of Object.keys(localStorage))e.startsWith(J)&&localStorage.removeItem(e)}function se(){return{balance:G("balance",Ee),bet:G("bet",25),xp:G("xp",0),treatJar:G("treatJar",ie()),bestCascade:G("bestCascade",0),spinsSincePopIn:G("spinsSincePopIn",0),soundOn:G("soundOn",!0),reducedMotion:G("reducedMotion",typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)").matches:!1)}}function C(e){S("balance",e.balance),S("bet",e.bet),S("xp",e.xp),S("treatJar",e.treatJar),S("bestCascade",e.bestCascade),S("spinsSincePopIn",e.spinsSincePopIn),S("soundOn",e.soundOn),S("reducedMotion",e.reducedMotion)}const E=5,ne=4;function x(e,t){return new Array(t).fill(e)}function je(e){const t=[],o=Math.max(...e.map(r=>r.length));for(let r=0;r<o;r++)for(const i of e)i[r]&&t.push(i[r]);return t}function Ie(e){const t=e<=1;return[x("tumbler",t?2:3),x("butterfly",t?3:4),x("mixtape",4),x("crystal",5),x("chai",6),x("candle",6),x("cassette",9),x("gnome",9),x("mailbox",16),x("vhs",16),x("teapot",16),x("yarn",16)]}function Be(){return[x("treat_chicken",5),x("treat_salmon",4),x("treat_boogie",2)]}function Re(e){if(e<1)return[];const t={1:[6,6],2:[6,7],3:[6,7],4:[7,7]},[o,r]=t[e]??[6,6];return[x("wild_joey",o),x("wild_phoebe",r)]}function Ne(e){const t=[...Ie(e)];(e===0||e===2||e===4)&&t.push(...Be());const o=je(t),r=Re(e);for(const i of r)o.push(...i);return o}const W=Array.from({length:E},(e,t)=>Ne(t));function Je(e){return W[e]}function ae(e,t){return Math.floor(e()*t)}function He(e,t){const o=W[t];return o[ae(e,o.length)]}function Oe(e,t){const o=W[e],r=o.length,i=[];for(let l=0;l<ne;l++)i.push({symbol:o[(t+l)%r]});return i}function Fe(e){const t=[];for(let o=0;o<E;o++){const r=ae(e,W[o].length);t.push(Oe(o,r))}return t}function ce(e,t,o,r){const i=o.filter((a,f)=>!r.has(f)),l=o.length-i.length,s=[];for(let a=0;a<l;a++)s.push({symbol:He(e,t)});return[...s,...i]}const Ve={4:7,5:10,6:15,7:20,8:50,9:75,10:100,11:200},De=[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[3,3,3,3,3],[0,1,2,1,0],[3,2,1,2,3],[1,0,1,0,1],[2,3,2,3,2],[0,0,1,0,0],[3,3,2,3,3],[1,2,3,2,1],[2,1,0,1,2],[0,1,1,1,0],[3,2,2,2,3],[1,1,0,1,1],[2,2,3,2,2],[0,2,0,2,0],[3,1,3,1,3],[0,1,3,1,0],[3,2,0,2,3],[1,3,1,3,1],[2,0,2,0,2],[0,3,0,3,0],[3,0,3,0,3],[1,2,0,2,1]],Ye={tumbler:{3:56,4:167,5:1112},butterfly:{3:42,4:125,5:694},mixtape:{3:33,4:96,5:417},crystal:{3:27,4:82,5:334},chai:{3:21,4:56,5:222},candle:{3:21,4:56,5:222},cassette:{3:13,4:33,5:139},gnome:{3:13,4:33,5:139},mailbox:{3:8,4:21,5:69},vhs:{3:8,4:21,5:69},teapot:{3:8,4:21,5:69},yarn:{3:8,4:21,5:69}},Ue=["wild_joey","wild_phoebe"],Ke=["treat_chicken","treat_salmon","treat_boogie","uniglee"];function z(e){return Ue.includes(e)}function Ze(e,t){const o=[];return De.forEach((r,i)=>{const l=e[0][r[0]].symbol;if(Ke.includes(l))return;const s=z(l)?"tumbler":l,a=[];let f=0;for(let h=0;h<r.length;h++){const m=r[h],v=e[h][m].symbol;if(!(v===s||z(v)))break;a.push([h,m]),f++}if(f<3)return;const c=Ye[s];if(!c)return;const d=f>=5?5:f,p=c[d]*t;o.push({lineIndex:i,symbol:s,count:f,payout:p,positions:a})}),o}const Xe={treat_chicken:"chicken",treat_salmon:"salmon",treat_boogie:"boogie"},Qe=1/400,et=.05,I=[["sparkle_sort",50],["drop_in",30],["double_sparkle",12],["facts_on_facts",8]];function tt(e){const t=I.reduce((r,[,i])=>r+i,0);let o=e()*t;for(const[r,i]of I){if(o<i)return r;o-=i}return I[0][0]}function ot(e){const t=[];for(const o of e)for(const r of o){const i=Xe[r.symbol];i&&t.push(i)}return t}function rt(e){let t=0;for(const[o,r]of Object.entries(Ve))e>=Number(o)&&(t=Math.max(t,r));return t}const it=["uniglee","wild_joey","wild_phoebe"];function lt(e,t){const o=[];t.forEach((f,c)=>{f.forEach((d,p)=>{it.includes(d.symbol)||o.push([c,p])})});const r=Math.min(o.length,5+Math.floor(e()*7)),i=[],l=[...o];for(let f=0;f<r&&l.length>0;f++){const c=Math.floor(e()*l.length);i.push(l.splice(c,1)[0])}const s=Array.from({length:E},()=>new Set);for(const[f,c]of i)s[f].add(c);return{grid:t.map((f,c)=>ce(e,c,f,s[c])),positions:i}}function Z(e,t){const o=1+Math.floor(e()*(E-1)),r=e()<.5?"wild_joey":"wild_phoebe",i=Je(o),l=t[o].map(s=>({symbol:i.length?r:s.symbol}));return t.map((s,a)=>a===o?l:s)}function H({rng:e,betPerLine:t,treatJar:o,spinsSincePopIn:r}){let i=Fe(e);const l=[],s=ot(i),a=e()<Qe;let f=0,c=0,d=!1;const p=[];for(a&&(p.push("drop_in","facts_on_facts","sparkle_sort","sparkle_sort","sparkle_sort"),d=!0,i=Z(e,i));;){const _=Ze(i,t);if(_.length===0){if(p.length>0){const g=p.shift();if(g==="sparkle_sort"){const{grid:b,positions:$}=lt(e,i);c++,l.push({grid:i,wins:[],meterAfter:c,specialtyAwarded:[g],blastPositions:$}),i=b;continue}if(g==="drop_in"){const b=Z(e,i);l.push({grid:b,wins:[],meterAfter:c,specialtyAwarded:[g]}),i=b;continue}l.push({grid:i,wins:[],meterAfter:c,specialtyAwarded:[g]});continue}l.push({grid:i,wins:[],meterAfter:c,specialtyAwarded:[]});break}c++,f+=_.reduce((g,b)=>g+b.payout,0);const D=[];for(const g of _)if(g.positions.some(([$,xe])=>z(i[$][xe].symbol))&&e()<et){const $=tt(e);p.push($),D.push($)}const Y=Array.from({length:E},()=>new Set);for(const g of _)for(const[b,$]of g.positions)Y[b].add($);const we=i.map((g,b)=>ce(e,b,g,Y[b]));l.push({grid:i,wins:_,meterAfter:c,specialtyAwarded:D}),i=we}const h=Se(e,o,r),m=rt(c),v=d&&m>0,V=v?m*2:m;return{steps:l,totalWin:f,cascades:c,freeSpinsAwarded:V,doubleSparkleApplied:v,catVisit:h,unigleeTriggered:a,treatsCollected:s}}function O(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let o=Math.imul(t^t>>>15,1|t);return o=o+Math.imul(o^o>>>7,61|o)^o,((o^o>>>14)>>>0)/4294967296}}function fe(){const e=new Uint32Array(1);return crypto.getRandomValues(e),e[0]}const B=[["multiplying",40],["giant_gnome",35],["chai_back",25]];function st(e){const t=B.reduce((r,[,i])=>r+i,0);let o=e()*t;for(const[r,i]of B){if(o<i)return r;o-=i}return B[0][0]}function nt(e){const t=e();if(t<.02)return 12;if(t<.14)return 8;const o=[2,3,4,5];return o[Math.floor(e()*o.length)]}function at(e,t,o){const r=H({rng:e,betPerLine:o,treatJar:ie(),spinsSincePopIn:999});if(t==="multiplying"){const l=r.steps[r.steps.length-1].grid,s=[];let a=!1,f=0;if(l.forEach((c,d)=>{c.forEach((p,h)=>{if(z(p.symbol)){const m=nt(e);s.push([d,h,m]),m===12&&(a=!0)}})}),s.length>0){const c=s.reduce((d,[,,p])=>d+p,0)/s.length;f=Math.round(r.totalWin*(c-1))}return{...r,totalWin:r.totalWin+f,wildMultipliers:s,twelvePumps:a,extraWildsAdded:0}}if(t==="chai_back"){const l=1+Math.floor(e()*3),s=Math.round(r.totalWin*(.08*l));return{...r,totalWin:r.totalWin+s,twelvePumps:!1,extraWildsAdded:l}}const i=Math.round(r.totalWin*.15);return{...r,totalWin:r.totalWin+i,twelvePumps:!1,extraWildsAdded:0}}function ct(e,t,o,r){let i=r;const l=[];let s=0,a=0,f=0;for(;i>0;){i--;const c=at(e,t,o);l.push(c),a+=c.totalWin,f=Math.max(f,c.cascades),c.freeSpinsAwarded>0&&(i+=c.freeSpinsAwarded,s++)}return{wedge:t,rounds:l,totalWin:a,bestCascade:f,retriggers:s}}function de(e){switch(e){case"multiplying":return"We're Multiplying";case"giant_gnome":return"Giant Gnome Mode";case"chai_back":return"We Want Our Chai Back"}}const n="#20163a",u=(e,t={})=>{const o=t.vb??48,r=t.glow??"255,244,224";return`<svg viewBox="0 0 ${o} ${o}" class="h-full w-full symbol-art" style="filter:drop-shadow(0 0 3px rgba(${r},0.5)) drop-shadow(0 2px 1.5px rgba(10,6,24,0.45))" aria-hidden="true">${e}</svg>`},y=(e,t,o,r,i)=>`
  <radialGradient id="${e}" cx="35%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
    <stop offset="55%" stop-color="#ffffff" stop-opacity="0.22"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="${t}" cy="${o}" rx="${r}" ry="${i}" fill="url(#${e})"/>
`,w=(e,t,o,r,i)=>`
  <radialGradient id="${e}" cx="60%" cy="60%" r="60%">
    <stop offset="0%" stop-color="#0c0620" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#0c0620" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="${t}" cy="${o}" rx="${r}" ry="${i}" fill="url(#${e})"/>
`,ft={tumbler:u(`
    <defs>
      <linearGradient id="tumblerGrad" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#a7f0dd"/>
        <stop offset="45%" stop-color="#4fa8d8"/>
        <stop offset="100%" stop-color="#8b4fc9"/>
      </linearGradient>
      <clipPath id="tumblerClip"><path d="M14 8h20l-2 32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4L14 8z"/></clipPath>
    </defs>
    ${w("tumblerGr",30,38,14,8)}
    <path d="M14 8h20l-2 32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4L14 8z" fill="url(#tumblerGrad)" stroke="${n}" stroke-width="1.6"/>
    <g clip-path="url(#tumblerClip)">
      <path d="M14 26q5 3 10 0t10 0 10 0v4q-5 3-10 0t-10 0-10 0z" fill="#ffffff" opacity="0.16"/>
      <path d="M13 33q5 3 10 0t10 0 11 0v4q-5 3-10 0t-10 0-11 0z" fill="#2d1f4c" opacity="0.12"/>
      <path d="M17 10l3 34" stroke="#ffffff" stroke-width="4" opacity="0.25" stroke-linecap="round"/>
      <circle cx="19" cy="18" r="1.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="28" cy="24" r="1.1" fill="#ffffff" opacity="0.6"/>
      <circle cx="23" cy="33" r="1.4" fill="#ffffff" opacity="0.55"/>
      <circle cx="30" cy="14" r="1" fill="#ffffff" opacity="0.6"/>
    </g>
    <rect x="16" y="13.5" width="16" height="2.6" fill="#fff4e0" opacity="0.85"/>
    <path d="M24 4v8" stroke="${n}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M22.6 2c0 2-2.2 2-2.2 4.4" stroke="${n}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M22.9 2.4c0 1.7-1.8 1.7-1.8 3.6" stroke="#fff4e0" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${y("tumblerSheen",19,14,8,7)}
  `,{glow:"159,232,197"}),butterfly:u(`
    <defs>
      <linearGradient id="bfPink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffd0e6"/><stop offset="100%" stop-color="#e8618c"/></linearGradient>
      <linearGradient id="bfBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c9ecff"/><stop offset="100%" stop-color="#4fa8d8"/></linearGradient>
      <linearGradient id="bfYellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff0b8"/><stop offset="100%" stop-color="#e8a53a"/></linearGradient>
      <linearGradient id="bfPurple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e6cbff"/><stop offset="100%" stop-color="#8b4fc9"/></linearGradient>
    </defs>
    ${w("bfGr",26,34,14,6)}
    <path d="M24 20c-3-9-14-12-16-4-2 8 8 10 16 6z" fill="url(#bfPink)" stroke="${n}" stroke-width="1.3"/>
    <path d="M24 20c3-9 14-12 16-4 2 8-8 10-16 6z" fill="url(#bfBlue)" stroke="${n}" stroke-width="1.3"/>
    <path d="M24 22c-2 7-10 10-13 5-3-5 4-9 13-5z" fill="url(#bfYellow)" stroke="${n}" stroke-width="1.2"/>
    <path d="M24 22c2 7 10 10 13 5 3-5-4-9-13-5z" fill="url(#bfPurple)" stroke="${n}" stroke-width="1.2"/>
    <circle cx="17" cy="16" r="2.6" fill="#ffffff" opacity="0.35"/>
    <circle cx="31" cy="16" r="2.2" fill="#ffffff" opacity="0.3"/>
    <rect x="23" y="10" width="2" height="26" rx="1" fill="${n}"/>
    <path d="M22 11c-1.5-2-1-4 0.5-4.6M26 11c1.5-2 1-4-0.5-4.6" stroke="${n}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${y("bfSheen",17,15,9,7)}
  `,{glow:"255, 158, 203"}),mixtape:u(`
    <defs>
      <linearGradient id="mixGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff9ecb"/><stop offset="100%" stop-color="#c73e6c"/></linearGradient>
    </defs>
    ${w("mixGr",28,34,16,6)}
    <rect x="6" y="12" width="36" height="24" rx="3" fill="url(#mixGrad)" stroke="${n}" stroke-width="1.5"/>
    <rect x="10" y="16" width="28" height="9" rx="1.5" fill="#fff4e0"/>
    <rect x="10" y="16" width="28" height="4" rx="1.5" fill="#ffffff" opacity="0.55"/>
    <text x="24" y="23" text-anchor="middle" font-size="5" font-family="Verdana, sans-serif" font-weight="700" fill="#c73e6c">GLEE</text>
    <circle cx="17" cy="29" r="5" fill="${n}"/><circle cx="31" cy="29" r="5" fill="${n}"/>
    <circle cx="17" cy="29" r="2" fill="#fff4e0"/><circle cx="31" cy="29" r="2" fill="#fff4e0"/>
    <path d="M20 29h8" stroke="#fff4e0" stroke-width="1" opacity="0.6"/>
    ${y("mixSheen",15,16,10,6)}
  `,{glow:"232, 97, 140"}),crystal:u(`
    <defs>
      <linearGradient id="crysGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0e0ff"/><stop offset="55%" stop-color="#c99bff"/><stop offset="100%" stop-color="#6f3fb0"/></linearGradient>
    </defs>
    ${w("crysGr",24,40,12,5)}
    <polygon points="24,4 34,18 24,44 14,18" fill="url(#crysGrad)" stroke="${n}" stroke-width="1.5"/>
    <polygon points="24,4 34,18 24,22 14,18" fill="#ffffff" opacity="0.4"/>
    <polygon points="14,18 24,22 24,44" fill="#4a2a80" opacity="0.35"/>
    <polygon points="24,4 29,18 24,22 19,18" fill="#ffffff" opacity="0.3"/>
    ${y("crysSheen",20,12,6,8)}
  `,{glow:"201, 155, 255"}),chai:u(`
    <defs>
      <linearGradient id="chaiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0c27e"/><stop offset="100%" stop-color="#b3702a"/></linearGradient>
    </defs>
    ${w("chaiGr",24,40,12,5)}
    <path d="M12 18h24l-2.5 20a4 4 0 0 1-4 3.5h-11a4 4 0 0 1-4-3.5L12 18z" fill="url(#chaiGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M13.5 20h21" stroke="#fff4e0" stroke-width="2"/>
    <path d="M36 20c6 0 6 8 0 9" fill="none" stroke="${n}" stroke-width="2.4"/>
    <path d="M36 21.4c4 0 4 5.2 0 6" fill="none" stroke="#fff4e0" stroke-width="1" opacity="0.6"/>
    <circle cx="24" cy="10" r="2" fill="#fff4e0"/><circle cx="19" cy="8" r="1.6" fill="#fff4e0"/><circle cx="29" cy="8" r="1.6" fill="#fff4e0"/>
    ${y("chaiSheen",18,24,8,9)}
  `,{glow:"245, 213, 118"}),candle:u(`
    <defs>
      <linearGradient id="candleGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd6ee"/><stop offset="100%" stop-color="#d987b8"/></linearGradient>
    </defs>
    ${w("candleGr",24,40,10,4)}
    <rect x="19" y="18" width="10" height="24" rx="2" fill="url(#candleGrad)" stroke="${n}" stroke-width="1.5"/>
    <rect x="19" y="18" width="10" height="4" fill="#fff4e0"/>
    <path d="M21 24h6M21 30h6M21 36h6" stroke="#ffffff" stroke-width="0.8" opacity="0.35"/>
    <path d="M24 15c-3-4 0-7 0-7s3 3 0 7z" fill="#ffd76b" stroke="${n}" stroke-width="1"/>
    <path d="M24 13c-1.4-2-0.2-3.8-0.2-3.8" stroke="#fff4e0" stroke-width="0.8" opacity="0.7"/>
    ${y("candleSheen",21,22,5,8)}
  `,{glow:"255, 214, 238"}),cassette:u(`
    <defs>
      <linearGradient id="cassGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8f0e5"/><stop offset="100%" stop-color="#3ba296"/></linearGradient>
    </defs>
    ${w("cassGr",24,38,15,5)}
    <rect x="7" y="14" width="34" height="20" rx="2.5" fill="url(#cassGrad)" stroke="${n}" stroke-width="1.5"/>
    <rect x="12" y="18" width="24" height="8" rx="1" fill="#fff4e0"/>
    <path d="M14 18h20v3H14z" fill="#ffffff" opacity="0.5"/>
    <circle cx="18" cy="22" r="3.4" fill="${n}"/><circle cx="30" cy="22" r="3.4" fill="${n}"/>
    <circle cx="18" cy="22" r="1.1" fill="#fff4e0"/><circle cx="30" cy="22" r="1.1" fill="#fff4e0"/>
    <path d="M9 30h30" stroke="${n}" stroke-width="1" opacity="0.4"/>
    ${y("cassSheen",15,17,10,5)}
  `,{glow:"107, 214, 201"}),gnome:u(`
    <defs>
      <linearGradient id="gnomeHat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff9ecb"/><stop offset="100%" stop-color="#c73e6c"/></linearGradient>
      <linearGradient id="gnomeCoat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8ec9ff"/><stop offset="100%" stop-color="#3d7cb0"/></linearGradient>
    </defs>
    ${w("gnomeGr",24,42,13,5)}
    <path d="M24 6c8 6 8 16 8 16H16s0-10 8-16z" fill="url(#gnomeHat)" stroke="${n}" stroke-width="1.5"/>
    <circle cx="24" cy="20" r="2" fill="#fff4e0" opacity="0.5"/>
    <circle cx="24" cy="28" r="9" fill="#ffe0c2" stroke="${n}" stroke-width="1.5"/>
    <path d="M15 34c0 6 4 8 9 8s9-2 9-8z" fill="url(#gnomeCoat)" stroke="${n}" stroke-width="1.5"/>
    <circle cx="20" cy="27" r="1.6" fill="${n}"/><circle cx="28" cy="27" r="1.6" fill="${n}"/>
    <path d="M21 32c1.5 1.4 4.5 1.4 6 0" stroke="${n}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="19" cy="30" rx="1.6" ry="1" fill="#ff9ecb" opacity="0.7"/><ellipse cx="29" cy="30" rx="1.6" ry="1" fill="#ff9ecb" opacity="0.7"/>
    ${y("gnomeSheen",19,12,7,6)}
  `,{glow:"232, 97, 140"}),mailbox:u(`
    <defs>
      <linearGradient id="mbGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c9ecff"/><stop offset="100%" stop-color="#4a8fc7"/></linearGradient>
    </defs>
    ${w("mbGr",24,38,15,5)}
    <path d="M8 20a16 12 0 0 1 32 0z" fill="url(#mbGrad)" stroke="${n}" stroke-width="1.5"/>
    <rect x="8" y="20" width="32" height="16" rx="2" fill="url(#mbGrad)" stroke="${n}" stroke-width="1.5"/>
    <rect x="21" y="6" width="6" height="14" fill="#9aa0a6" stroke="${n}" stroke-width="1"/>
    <rect x="12" y="26" width="10" height="6" fill="#fff4e0"/>
    <path d="M10 21a14 10 0 0 1 12-8" stroke="#ffffff" stroke-width="1.4" opacity="0.4" fill="none"/>
    ${y("mbSheen",15,20,9,6)}
  `,{glow:"142, 201, 255"}),vhs:u(`
    <defs>
      <linearGradient id="vhsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#dcc2ff"/><stop offset="100%" stop-color="#7a4fc9"/></linearGradient>
    </defs>
    ${w("vhsGr",24,38,15,5)}
    <rect x="6" y="12" width="36" height="24" rx="2" fill="url(#vhsGrad)" stroke="${n}" stroke-width="1.5"/>
    <rect x="10" y="16" width="28" height="6" fill="#fff4e0"/>
    <rect x="10" y="16" width="28" height="2.4" fill="#ffffff" opacity="0.5"/>
    <rect x="10" y="26" width="12" height="6" rx="1" fill="${n}"/>
    <rect x="26" y="26" width="12" height="6" rx="1" fill="${n}"/>
    <circle cx="16" cy="29" r="1.8" fill="#dcc2ff"/><circle cx="32" cy="29" r="1.8" fill="#dcc2ff"/>
    ${y("vhsSheen",15,16,9,5)}
  `,{glow:"181, 140, 255"}),teapot:u(`
    <defs>
      <linearGradient id="teaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="100%" stop-color="#dba32c"/></linearGradient>
    </defs>
    ${w("teaGr",22,38,14,5)}
    <ellipse cx="22" cy="28" rx="14" ry="10" fill="url(#teaGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M35 22c8-2 10 8 2 9" fill="none" stroke="${n}" stroke-width="2.4"/>
    <path d="M9 26c-5-2-5 4 0 5" fill="none" stroke="${n}" stroke-width="2.4"/>
    <rect x="18" y="16" width="8" height="5" rx="2" fill="url(#teaGrad)" stroke="${n}" stroke-width="1.5"/>
    <ellipse cx="17" cy="22" rx="4" ry="2.4" fill="#ffffff" opacity="0.35"/>
    ${y("teaSheen",16,23,8,6)}
  `,{glow:"255, 214, 108"}),yarn:u(`
    <defs>
      <radialGradient id="yarnGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#ffc2df"/><stop offset="100%" stop-color="#d9497e"/></radialGradient>
    </defs>
    ${w("yarnGr",24,38,14,5)}
    <circle cx="24" cy="24" r="16" fill="url(#yarnGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M10 20c10 4 18 4 28 0M9 27c10 5 20 5 30 0M13 14c8 6 14 6 22 0" fill="none" stroke="#c73e6c" stroke-width="1.4" opacity="0.8"/>
    <path d="M12 18c9 3 16 3 25 0" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.4"/>
    ${y("yarnSheen",17,15,8,7)}
  `,{glow:"255, 158, 203"}),treat_chicken:u(`
    <defs>
      <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="100%" stop-color="#dba32c"/></linearGradient>
    </defs>
    ${w("tcGr",22,34,13,5)}
    <path d="M10 32c0-10 8-18 18-18h4c4 0 6 4 3 7l-3 3c8 1 10 10 3 14-8 5-25-1-25-6z" fill="url(#tcGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M14 18c6-4 12-5 16-3" stroke="#ffffff" stroke-width="1.2" opacity="0.4" fill="none"/>
    <circle cx="16" cy="22" r="2" fill="${n}"/>
    <path d="M20 30c3 3 8 3 11 0" stroke="${n}" stroke-width="1" fill="none" opacity="0.5"/>
    ${y("tcSheen",17,20,8,6)}
  `,{glow:"245, 213, 118"}),treat_salmon:u(`
    <defs>
      <linearGradient id="tsGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c9ecff"/><stop offset="100%" stop-color="#4a8fc7"/></linearGradient>
    </defs>
    ${w("tsGr",22,32,14,5)}
    <path d="M8 24c8-10 26-10 34 0-8 10-26 10-34 0z" fill="url(#tsGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M38 24l6-6v12z" fill="#3d7cb0" stroke="${n}" stroke-width="1.5"/>
    <path d="M12 22c6-5 18-5 24 0" stroke="#ffffff" stroke-width="1" opacity="0.4" fill="none"/>
    <circle cx="16" cy="22" r="1.8" fill="${n}"/>
    ${y("tsSheen",16,19,8,5)}
  `,{glow:"142, 201, 255"}),treat_boogie:u(`
    <defs>
      <radialGradient id="tbGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#e6cbff"/><stop offset="100%" stop-color="#7a4fc9"/></radialGradient>
    </defs>
    ${w("tbGr",24,38,12,4)}
    <path d="M14 8l4 8 8-3-5 7 8 4-9 1 2 9-8-6-8 6 2-9-9-1 8-4-5-7 8 3z" fill="url(#tbGrad)" stroke="${n}" stroke-width="1.2"/>
    <circle cx="36" cy="34" r="4" fill="#ffd76b" stroke="${n}" stroke-width="1"/>
    <circle cx="35" cy="33" r="1.2" fill="#ffffff" opacity="0.7"/>
    ${y("tbSheen",17,16,7,6)}
  `,{glow:"201, 155, 255"}),wild_joey:u(`
    <defs>
      <linearGradient id="joeyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aab2be"/><stop offset="100%" stop-color="#454c58"/></linearGradient>
    </defs>
    ${w("joeyGr",24,40,16,5)}
    <ellipse cx="24" cy="30" rx="15" ry="12" fill="url(#joeyGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M11 22l4-9 6 7z" fill="url(#joeyGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M37 22l-4-9-6 7z" fill="url(#joeyGrad)" stroke="${n}" stroke-width="1.5"/>
    <path d="M14 20l2-5 3 4z" fill="#ffb0cf" opacity="0.7"/><path d="M34 20l-2-5-3 4z" fill="#ffb0cf" opacity="0.7"/>
    <circle cx="18" cy="27" r="2.8" fill="#ffe27a"/><circle cx="30" cy="27" r="2.8" fill="#ffe27a"/>
    <circle cx="18" cy="27.4" r="1.2" fill="${n}"/><circle cx="30" cy="27.4" r="1.2" fill="${n}"/>
    <circle cx="17.3" cy="26.3" r="0.6" fill="#ffffff"/><circle cx="29.3" cy="26.3" r="0.6" fill="#ffffff"/>
    <path d="M22 32c1 1 3 1 4 0" stroke="${n}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M15 30h-3M33 30h3" stroke="${n}" stroke-width="1" opacity="0.6"/>
    ${y("joeySheen",17,22,9,7)}
    <text x="24" y="45" text-anchor="middle" font-size="5" font-weight="700" fill="#ffe27a" font-family="Verdana, sans-serif" opacity="0.9">WILD</text>
  `,{glow:"255, 214, 122"}),wild_phoebe:u(`
    <defs>
      <linearGradient id="phoebeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a3d70"/><stop offset="100%" stop-color="#1a1230"/></linearGradient>
    </defs>
    ${w("phoebeGr",24,40,16,5)}
    <ellipse cx="24" cy="30" rx="15" ry="12" fill="url(#phoebeGrad)" stroke="#120b22" stroke-width="1.5"/>
    <path d="M11 22l4-9 6 7z" fill="url(#phoebeGrad)" stroke="#120b22" stroke-width="1.5"/>
    <path d="M37 22l-4-9-6 7z" fill="url(#phoebeGrad)" stroke="#120b22" stroke-width="1.5"/>
    <path d="M15 32c3 6 15 6 18 0z" fill="#fff4e0"/>
    <path d="M15 32c3 4 15 4 18 0" fill="none" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
    <circle cx="18" cy="27" r="2.8" fill="#8ec9ff"/><circle cx="30" cy="27" r="2.8" fill="#8ec9ff"/>
    <circle cx="18" cy="27.4" r="1.2" fill="#120b22"/><circle cx="30" cy="27.4" r="1.2" fill="#120b22"/>
    <circle cx="17.3" cy="26.3" r="0.6" fill="#ffffff"/><circle cx="29.3" cy="26.3" r="0.6" fill="#ffffff"/>
    ${y("phoebeSheen",17,22,9,7)}
    <text x="24" y="45" text-anchor="middle" font-size="5" font-weight="700" fill="#c9ecff" font-family="Verdana, sans-serif" opacity="0.9">WILD</text>
  `,{glow:"142, 201, 255"}),uniglee:u(`
    <defs>
      <linearGradient id="uniglow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9ecb"/><stop offset="25%" stop-color="#ffd76b"/><stop offset="50%" stop-color="#8ec9ff"/>
        <stop offset="75%" stop-color="#c99bff"/><stop offset="100%" stop-color="#6bd6c9"/>
      </linearGradient>
    </defs>
    ${w("uniGr",24,40,17,5)}
    <ellipse cx="24" cy="30" rx="17" ry="11" fill="url(#uniglow)" stroke="${n}" stroke-width="1.5"/>
    <path d="M24 10l3 8h-6z" fill="#ffe0c2" stroke="${n}" stroke-width="1.2"/>
    <path d="M24 11.5l1.6 5" stroke="#ffffff" stroke-width="0.7" opacity="0.7"/>
    <circle cx="17" cy="28" r="2.6" fill="${n}"/><circle cx="31" cy="28" r="2.6" fill="${n}"/>
    <circle cx="16.3" cy="27.2" r="0.7" fill="#ffffff"/><circle cx="30.3" cy="27.2" r="0.7" fill="#ffffff"/>
    <path d="M10 24c3-2 5-1 5 1M38 24c-3-2-5-1-5 1" stroke="#ffffff" stroke-width="1" opacity="0.6" fill="none"/>
    ${y("uniSheen",18,22,10,7)}
  `,{glow:"255, 158, 203"})};function L(e){return ft[e]}function dt(e,t="strut"){const o=e==="joey",r=o?"catBodyJoey":"catBodyPhoebe",i=o?'<stop offset="0%" stop-color="#aab2be"/><stop offset="100%" stop-color="#454c58"/>':'<stop offset="0%" stop-color="#3d3260"/><stop offset="100%" stop-color="#1a1230"/>',l=o?"#ffe27a":"#8ec9ff",s=o?"":'<path d="M13 30c4 8 18 8 22 0z" fill="#fff4e0"/>',a=o?n:"#120b22",f=t==="assist"&&o?`<path d="M40 30c7-4 10 3 4 7-3 2-6 0-4-3" fill="none" stroke="${r==="catBodyJoey"?"#5c6470":"#2d1f4c"}" stroke-width="3" stroke-linecap="round"/>`:t==="unimpressed"?`<path d="M40 28c8 0 9 8 1 8" fill="none" stroke="${o?"#5c6470":"#2d1f4c"}" stroke-width="3" stroke-linecap="round"/>`:`<path d="M40 30c6-2 8 4 3 6" fill="none" stroke="${o?"#5c6470":"#2d1f4c"}" stroke-width="3" stroke-linecap="round"/>`,c=t==="eat"?`<ellipse cx="24" cy="32" rx="4" ry="2.6" fill="${a}"/><ellipse cx="24" cy="30.5" rx="5" ry="1.4" fill="#ffe0c2" opacity="0.7"/>`:t==="unimpressed"?`<path d="M19 32h-2M31 32h2" stroke="${a}" stroke-width="1.4" stroke-linecap="round"/>`:`<path d="M20 31c1.5 1.5 6.5 1.5 8 0" stroke="${a}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,d=t==="eat"?`<ellipse cx="24" cy="41" rx="9" ry="3" fill="#7a4fc9" stroke="${a}" stroke-width="1.2"/><ellipse cx="24" cy="40" rx="7" ry="1.8" fill="#c9a3ff"/>`:t==="assist"&&o?`<circle cx="34" cy="40" r="3" fill="#20163a" stroke="${a}" stroke-width="1"/><circle cx="33" cy="39" r="0.8" fill="#ffd76b"/>`:"",p=t==="assist"?"rotate(-6 24 30)":t==="unimpressed"?"rotate(4 24 30)":"";return u(`
    <defs>
      <linearGradient id="${r}" x1="0" y1="0" x2="0" y2="1">${i}</linearGradient>
    </defs>
    ${w("catGr",24,42,18,5)}
    <g transform="${p}">
      <path d="M8 34c0-12 6-20 16-20s16 8 16 20c0 4-4 6-16 6S8 38 8 34z" fill="url(#${r})" stroke="${a}" stroke-width="1.5"/>
      <path d="M11 18l4-9 6 8z" fill="url(#${r})" stroke="${a}" stroke-width="1.5"/>
      <path d="M37 18l-4-9-6 8z" fill="url(#${r})" stroke="${a}" stroke-width="1.5"/>
      <path d="M14 16l2-5 3 4z" fill="#ffb0cf" opacity="0.65"/><path d="M34 16l-2-5-3 4z" fill="#ffb0cf" opacity="0.65"/>
      ${s}
      <circle cx="18" cy="26" r="3" fill="${l}"/><circle cx="30" cy="26" r="3" fill="${l}"/>
      <circle cx="18" cy="26.4" r="1.3" fill="#111"/><circle cx="30" cy="26.4" r="1.3" fill="#111"/>
      <circle cx="17.2" cy="25.1" r="0.7" fill="#ffffff"/><circle cx="29.2" cy="25.1" r="0.7" fill="#ffffff"/>
      ${c}
      ${f}
    </g>
    ${d}
    ${y("catSheen",16,18,9,8)}
  `,{vb:48,glow:o?"255, 214, 122":"142, 201, 255"})}function pt(){return`<svg viewBox="0 0 200 200" class="h-full w-full" style="filter:drop-shadow(0 0 14px rgba(107,214,201,0.5)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))">
    <defs>
      <radialGradient id="wheelRim" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#4a3d70"/><stop offset="100%" stop-color="#1a1230"/>
      </radialGradient>
      <linearGradient id="wedgeTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a8f0e5"/><stop offset="100%" stop-color="#3ba296"/></linearGradient>
      <linearGradient id="wedgePink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9ecb"/><stop offset="100%" stop-color="#c73e6c"/></linearGradient>
      <linearGradient id="wedgeGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff0b0"/><stop offset="100%" stop-color="#dba32c"/></linearGradient>
      <radialGradient id="hubGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#fffdf5"/><stop offset="100%" stop-color="#f5d576"/></radialGradient>
    </defs>
    <circle cx="100" cy="100" r="98" fill="url(#wheelRim)"/>
    <circle cx="100" cy="100" r="96" fill="#241a42" stroke="#fff4e0" stroke-width="3"/>
    <g stroke="#1a1230" stroke-width="2">
      <path d="M100 100 L100 4 A96 96 0 0 1 183 148 Z" fill="url(#wedgeTeal)"/>
      <path d="M100 100 L183 148 A96 96 0 0 1 17 148 Z" fill="url(#wedgePink)"/>
      <path d="M100 100 L17 148 A96 96 0 0 1 100 4 Z" fill="url(#wedgeGold)"/>
    </g>
    <circle cx="100" cy="100" r="96" fill="none" stroke="#fff4e0" stroke-width="1" opacity="0.25"/>
    ${Array.from({length:12},(e,t)=>{const o=t/12*Math.PI*2,r=100+Math.cos(o)*90,i=100+Math.sin(o)*90;return`<circle cx="${r.toFixed(1)}" cy="${i.toFixed(1)}" r="2.6" fill="#fff4e0" opacity="0.85"/>`}).join("")}
    <circle cx="100" cy="100" r="24" fill="url(#hubGrad)" stroke="${n}" stroke-width="3"/>
    <circle cx="92" cy="90" r="7" fill="#ffffff" opacity="0.5"/>
    <text x="100" y="106" font-size="13" text-anchor="middle" fill="${n}" font-family="Verdana, sans-serif" font-weight="700">GO</text>
  </svg>`}function ht(e=1){const t={1:["#ffe0c2","#c99bff"],2:["#c9ecff","#4fa8d8"],3:["#ffd0e6","#e8618c"],4:["#d6ffe8","#3ba296"],5:["#fff0b8","#dba32c"]},[o,r]=t[e],i=`saucerDome${e}`,l=`saucerHull${e}`;return`<svg viewBox="0 0 64 40" class="h-full w-full" style="filter:drop-shadow(0 0 6px rgba(201,155,255,0.55)) drop-shadow(0 3px 3px rgba(0,0,0,0.4))" aria-hidden="true">
    <defs>
      <radialGradient id="${i}" cx="35%" cy="25%" r="75%"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="${o}"/><stop offset="100%" stop-color="${r}"/></radialGradient>
      <linearGradient id="${l}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e6def7"/><stop offset="55%" stop-color="#8f86b8"/><stop offset="100%" stop-color="#4a4270"/></linearGradient>
    </defs>
    <ellipse cx="32" cy="27" rx="30" ry="7" fill="url(#${l})" stroke="${n}" stroke-width="1.3"/>
    <ellipse cx="32" cy="24" rx="30" ry="6" fill="#ffffff" opacity="0.18"/>
    <ellipse cx="32" cy="17" rx="15" ry="13" fill="url(#${i})" stroke="${n}" stroke-width="1.3"/>
    <ellipse cx="27" cy="11" rx="5" ry="3.4" fill="#ffffff" opacity="0.55"/>
    <circle cx="10" cy="27" r="1.8" class="saucer-light-a" fill="#ffe27a"/>
    <circle cx="22" cy="29.5" r="1.8" class="saucer-light-b" fill="#ff9ecb"/>
    <circle cx="42" cy="29.5" r="1.8" class="saucer-light-a" fill="#8ec9ff"/>
    <circle cx="54" cy="27" r="1.8" class="saucer-light-b" fill="#ffe27a"/>
  </svg>`}function ut(){return`<svg viewBox="0 0 390 90" preserveAspectRatio="none" class="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="fgFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f0a22" stop-opacity="0"/>
        <stop offset="100%" stop-color="#0f0a22" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="390" height="90" fill="url(#fgFade)"/>
    <rect x="0" y="70" width="390" height="20" fill="#120b28"/>
    <g fill="none" stroke="#1c1440" stroke-width="3">
      ${Array.from({length:14},(e,t)=>`<path d="M${20+t*27} 78v-22"/>`).join("")}
      <path d="M0 66h390" stroke-width="2"/>
    </g>
    <path d="M30 78c-2-14 4-26 12-26s10 10 9 26z" fill="#17103a"/>
    <path d="M46 78c-2-18 5-30 13-30s10 14 8 30z" fill="#1c1440"/>
    <g transform="translate(150 46)">
      <rect x="-3" y="18" width="6" height="14" fill="#1c1440"/>
      <path d="M-16 18a16 12 0 0 1 32 0z" fill="#17103a"/>
      <rect x="-16" y="18" width="32" height="16" rx="2" fill="#17103a"/>
    </g>
    <g transform="translate(230 58)">
      <rect x="-16" y="6" width="32" height="16" rx="2" fill="#1c1440"/>
      <rect x="-18" y="0" width="36" height="8" rx="2" fill="#17103a"/>
      <rect x="-4" y="-4" width="8" height="5" rx="1" fill="#17103a"/>
    </g>
    <path d="M300 78c-2-16 5-28 13-28s11 12 9 28z" fill="#17103a"/>
    <path d="M318 78c-1-10 4-18 9-18s9 8 8 18z" fill="#1c1440"/>
  </svg>`}function pe(e){const t=Math.max(0,Math.min(8,e)),o=t/8,r=Array.from({length:t},(i,l)=>{const s=18+l*13%28,a=34-l*7%20;return`<circle cx="${s}" cy="${a}" r="1.8" fill="#ffe27a" class="jar-firefly" style="animation-delay:${l%5*.3}s"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" begin="${l*.2}s"/></circle>`}).join("");return`<svg viewBox="0 0 64 56" class="h-full w-full" aria-hidden="true" style="filter:drop-shadow(0 0 ${4+o*10}px rgba(255,214,122,${.25+o*.5}))">
    <defs>
      <linearGradient id="jarGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4e0" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#8ec9ff" stop-opacity="0.18"/>
      </linearGradient>
      <radialGradient id="jarGlow" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#ffe27a" stop-opacity="${.15+o*.55}"/>
        <stop offset="100%" stop-color="#ffe27a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="20" y="4" width="24" height="8" rx="3" fill="#8f86b8" stroke="${n}" stroke-width="1.3"/>
    <path d="M14 16a18 4 0 0 1 36 0v26a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z" fill="url(#jarGlass)" stroke="#fff4e0" stroke-width="2" opacity="0.95"/>
    <path d="M14 16a18 4 0 0 1 36 0v26a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z" fill="none" stroke="${n}" stroke-width="1" opacity="0.5"/>
    <ellipse cx="32" cy="16" rx="18" ry="4" fill="#fff4e0" opacity="0.5"/>
    <path d="M20 14a14 3 0 0 1 8-1.6" stroke="#ffffff" stroke-width="1.4" opacity="0.55" fill="none"/>
    <circle cx="32" cy="34" r="20" fill="url(#jarGlow)"/>
    ${r}
    <path d="M18 18v24" stroke="#ffffff" stroke-width="1.5" opacity="0.25"/>
  </svg>`}function yt(){return`<svg viewBox="0 0 96 96" class="h-full w-full" aria-hidden="true" style="filter:drop-shadow(0 0 10px rgba(255,158,203,0.55)) drop-shadow(0 4px 4px rgba(0,0,0,0.4))">
    <defs>
      <linearGradient id="gleeCardigan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8a5b8"/><stop offset="100%" stop-color="#b3597a"/></linearGradient>
      <radialGradient id="gleeSkin" cx="40%" cy="30%" r="70%"><stop offset="0%" stop-color="#ffe0c2"/><stop offset="100%" stop-color="#e8b98c"/></radialGradient>
      <linearGradient id="gleeHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a5230"/><stop offset="100%" stop-color="#4a3018"/></linearGradient>
    </defs>
    <ellipse cx="48" cy="88" rx="28" ry="6" fill="#0c0620" opacity="0.35"/>
    <path d="M20 88c0-22 8-34 28-34s28 12 28 34z" fill="url(#gleeCardigan)" stroke="${n}" stroke-width="1.8"/>
    <path d="M32 60c4 6 28 6 32 0" fill="none" stroke="#fff4e0" stroke-width="1" opacity="0.4"/>
    <circle cx="48" cy="40" r="20" fill="url(#gleeSkin)" stroke="${n}" stroke-width="1.6"/>
    <path d="M28 34c0-14 10-22 20-22s20 8 20 22c-6-6-34-6-40 0z" fill="url(#gleeHair)" stroke="${n}" stroke-width="1.6"/>
    <circle cx="48" cy="16" r="9" fill="url(#gleeHair)" stroke="${n}" stroke-width="1.4"/>
    <circle cx="39" cy="40" r="3" fill="${n}"/><circle cx="57" cy="40" r="3" fill="${n}"/>
    <circle cx="38" cy="38.6" r="1" fill="#fff"/><circle cx="56" cy="38.6" r="1" fill="#fff"/>
    <path d="M40 48c3 3 13 3 16 0" stroke="${n}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M63 26c4-2 8 0 8 4s-5 5-9 2" fill="#ff9ecb" stroke="${n}" stroke-width="1.1"/>
    <path d="M63 26c4-2 8 0 8 4s-5 5-9 2" fill="#8ec9ff" stroke="${n}" stroke-width="1.1" opacity="0.7" transform="rotate(35 67 30)"/>
    <g transform="translate(64 58)">
      <path d="M-6 -4h12l-1 18a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" fill="#4fa8d8" stroke="${n}" stroke-width="1.2"/>
      <rect x="-5" y="-2" width="10" height="1.6" fill="#fff4e0" opacity="0.7"/>
      <path d="M2 -4v-5" stroke="${n}" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  </svg>`}function wt(){return`<svg viewBox="0 0 64 64" class="h-full w-full" aria-hidden="true" style="filter:drop-shadow(0 0 6px rgba(107,214,201,0.5))">
    <defs>
      <radialGradient id="ajBody" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#d6f5ef"/><stop offset="100%" stop-color="#3ba296"/></radialGradient>
    </defs>
    <ellipse cx="32" cy="58" rx="16" ry="4" fill="#0c0620" opacity="0.3"/>
    <rect x="28" y="8" width="8" height="10" rx="2" fill="#8f86b8" stroke="${n}" stroke-width="1.2"/>
    <circle cx="32" cy="6" r="3" fill="#ffe27a"/>
    <rect x="12" y="18" width="40" height="32" rx="14" fill="url(#ajBody)" stroke="${n}" stroke-width="1.6"/>
    <rect x="18" y="26" width="28" height="14" rx="7" fill="#0f2f3a"/>
    <circle cx="26" cy="33" r="3.6" fill="#8ec9ff"/><circle cx="38" cy="33" r="3.6" fill="#8ec9ff"/>
    <circle cx="25" cy="31.6" r="1" fill="#ffffff"/><circle cx="37" cy="31.6" r="1" fill="#ffffff"/>
    <path d="M22 44c4 3 16 3 20 0" stroke="${n}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <rect x="4" y="30" width="8" height="4" rx="2" fill="#8f86b8" stroke="${n}" stroke-width="1"/>
    <rect x="52" y="30" width="8" height="4" rx="2" fill="#8f86b8" stroke="${n}" stroke-width="1"/>
  </svg>`}let X;function j(e,t){const o=qe(t.xp),r=Ce(o.level);e.innerHTML=`
    <div class="relative h-full w-full flex flex-col text-amber-100 overflow-hidden cc-root">
      <div class="night-garden" id="bg-layer">${he()}</div>
      <div class="relative z-10 h-full w-full flex flex-col">
        <header class="marquee">
          <div class="marquee-bulbs" aria-hidden="true">${xt()}</div>
          <div class="marquee-row">
            <span class="level-chip" aria-label="Player level">Lvl ${o.level}<em>${o.into}/${o.span} Sparks</em></span>
            <h1 class="marquee-title">Glee-fully <span>Chai Chasers</span></h1>
            <button id="settings-btn" class="chrome-btn" aria-label="Settings">
              <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="#f5d576" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2"/>
                <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z"/>
              </svg>
            </button>
          </div>
        </header>

        <div class="jar-meter" aria-live="polite">
          <div class="jar-meter-icon" id="jar-icon">${pe(0)}</div>
          <div class="jar-meter-text">Cascade meter <span id="meter-count" class="jar-meter-count">0</span></div>
        </div>

        <main class="cabinet-frame">
          <span class="ornament ornament-tl">${T()}</span>
          <span class="ornament ornament-tr">${T()}</span>
          <span class="ornament ornament-bl">${T()}</span>
          <span class="ornament ornament-br">${T()}</span>
          <div id="reel-grid" class="reel-grid" role="img" aria-label="Reel board">
            ${F(H({rng:O(1),betPerLine:1,treatJar:t.treatJar,spinsSincePopIn:0}).steps[0].grid)}
          </div>
        </main>

        <div class="companion-row">
          <div id="treat-jar" aria-label="Treat Jar" class="treat-jar-housing">
            ${mt(t)}
          </div>
          <div id="askjamie-perch" aria-label="AskJamie" class="askjamie-housing">
            <div class="askjamie-icon">${wt()}</div>
            <span>AskJamie</span>
          </div>
        </div>

        <div id="status-line" class="status-line" aria-live="polite"></div>

        <footer class="bet-console">
          <div class="coin-chip" aria-label="Glee-coin balance">${t.balance.toLocaleString()}<em>coins</em></div>
          <div class="flex-1"></div>
          <button id="bet-down" class="chrome-btn" aria-label="Decrease bet">−</button>
          <span class="bet-display" id="bet-display">${t.bet}</span>
          <button id="bet-up" class="chrome-btn" aria-label="Increase bet">+</button>
          <button id="sparkle-btn" class="sparkle-btn">
            <span>SPARKLE!</span>
          </button>
        </footer>

        <div class="settings-row">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" id="sound-toggle" ${t.soundOn?"checked":""} class="min-w-[24px] min-h-[24px]" />
            Sound
          </label>
          <button id="reset-btn" class="ml-4 underline">Reset progress</button>
        </div>
      </div>
    </div>
  `,bt(e,t,r)}function xt(){return Array.from({length:16},(e,t)=>`<span class="bulb" style="animation-delay:${t%4*.18}s"></span>`).join("")}function T(){return`<svg viewBox="0 0 24 24" class="h-full w-full" aria-hidden="true">
    <path d="M12 1l3 7 7 1-5.2 5 1.5 7.5L12 18l-6.3 3.5L7.2 14 2 9l7-1z" fill="#f5d576" stroke="#2d1f4c" stroke-width="1"/>
  </svg>`}function he(){const e=[{top:"4%",left:"8%",delay:"0s",v:1},{top:"2%",left:"32%",delay:"0.8s",v:2},{top:"5%",left:"50%",delay:"1.6s",v:3},{top:"2%",left:"68%",delay:"2.4s",v:4},{top:"4%",left:"86%",delay:"1.2s",v:5}],t=Array.from({length:26},(s,a)=>({top:`${4+a*17%55}%`,left:`${3+a*41%94}%`,delay:`${a%6*.5}s`,fast:a%3===0})),o=Array.from({length:6},(s,a)=>({top:`${45+a*37%30}%`,left:`${8+a*53%84}%`,delay:`${a%5*.7}s`})),r=e.map((s,a)=>`
      <div class="saucer-unit" data-saucer="${a}" style="top:${s.top};left:${s.left};animation-delay:${s.delay}">
        <div class="saucer-beam"></div>
        <div class="saucer-art">${ht(s.v)}</div>
      </div>`).join(""),i=t.map(s=>`<div class="star ${s.fast?"star-fast":"star-slow"}" style="top:${s.top};left:${s.left};animation-delay:${s.delay}"></div>`).join(""),l=o.map(s=>`<div class="firefly" style="top:${s.top};left:${s.left};animation-delay:${s.delay}"></div>`).join("");return`
    <div class="aurora-ribbons"><span></span><span></span><span></span></div>
    ${i}
    ${r}
    ${l}
    <div class="garden-foreground">${ut()}</div>
  `}function mt(e){const t=e.treatJar;return`
    <span title="Chicken Comets" class="treat-chip"><span class="treat-icon">${L("treat_chicken")}</span>${t.chicken}</span>
    <span title="Salmon Stars" class="treat-chip"><span class="treat-icon">${L("treat_salmon")}</span>${t.salmon}</span>
    <span title="Boogie Bites" class="treat-chip"><span class="treat-icon">${L("treat_boogie")}</span>${t.boogie}</span>
  `}function F(e){let t="";for(let o=0;o<E;o++){t+=`<div class="reel-col" data-reel="${o}">`;for(let r=0;r<ne;r++){const i=e[o][r].symbol;t+=`<div class="cell" data-row="${r}" data-symbol="${i}">${L(i)}</div>`}t+="</div>"}return t}function ue(e,t){const o=e.querySelector("#status-line");o.textContent=t,window.clearTimeout(X),X=window.setTimeout(()=>{o.textContent=""},4e3)}function gt(e,t){const o=e.querySelector("#jar-icon");o&&(o.innerHTML=pe(t));const r=e.querySelector("#meter-count");r&&(r.textContent=String(t))}function bt(e,t,o){const r=e.querySelector("#sparkle-btn"),i=e.querySelector("#bet-display"),l=e.querySelector("#bet-up"),s=e.querySelector("#bet-down"),a=e.querySelector("#sound-toggle"),f=e.querySelector("#reset-btn");l.addEventListener("click",()=>{const c=o.indexOf(t.bet);c<o.length-1&&(t.bet=o[c+1],i.textContent=String(t.bet),C(t))}),s.addEventListener("click",()=>{const c=o.indexOf(t.bet);c>0&&(t.bet=o[c-1],i.textContent=String(t.bet),C(t))}),a.addEventListener("change",()=>{t.soundOn=a.checked,N(t.soundOn),C(t)}),f.addEventListener("click",()=>{confirm("Reset all progress and start fresh?")&&(We(),location.reload())}),r.addEventListener("click",()=>{me()||ee(),!r.disabled&&kt(e,t,r)})}async function kt(e,t,o){const{balance:r,refilled:i}=ze(t.balance,t.bet);t.balance=r,i&&ue(e,"AskJamie found coins under the couch! +500,000 coins"),t.balance-=t.bet,o.disabled=!0,o.classList.add("is-spinning");const l=H({rng:O(fe()),betPerLine:le(t.bet),treatJar:t.treatJar,spinsSincePopIn:t.spinsSincePopIn});await vt(e,l.steps),t.balance+=l.totalWin,t.xp+=Te(t.bet),t.bestCascade=Math.max(t.bestCascade,l.cascades);for(const a of l.treatsCollected)t.treatJar=Ge(t.treatJar,a);if(l.unigleeTriggered?(A(),await At(e)):l.totalWin>0&&await Mt(e,l.totalWin,t.bet),l.catVisit?(t.spinsSincePopIn=0,t.treatJar=Me(t.treatJar,l.catVisit),await Lt(e,l.catVisit.cat,l.catVisit.fed,l.catVisit.quip),l.catVisit.fed&&A()):t.spinsSincePopIn+=1,C(t),e.querySelector("#sparkle-btn")?.classList.remove("is-spinning"),l.freeSpinsAwarded>0){await Et(e,t,l.freeSpinsAwarded);return}j(e,t)}function vt(e,t){return new Promise(o=>{const r=e.querySelector("#reel-grid");let i=0;const l=()=>{if(i>=t.length){o();return}const s=t[i];if(r.innerHTML=F(s.grid),r.querySelectorAll(".cell").forEach(a=>a.classList.add("symbol-pop")),gt(e,s.meterAfter),s.wins.length>0){oe(s.meterAfter),$t(e);for(const a of s.wins)for(const[f,c]of a.positions){const d=r.querySelector(`[data-reel="${f}"] [data-row="${c}"]`);d?.classList.add("win-flash"),d&&Gt(e,d,3)}re()}else te();i++,window.setTimeout(l,480)};l()})}function $t(e){(e.querySelector("#bg-layer, .night-garden")??e).querySelectorAll(".saucer-beam").forEach(r=>{r.classList.add("beaming"),window.setTimeout(()=>r.classList.remove("beaming"),700)})}function Gt(e,t,o){const r=t.getBoundingClientRect(),i=e.getBoundingClientRect(),l=e.querySelector("#particle-layer")??St(e);for(let s=0;s<o;s++){const a=document.createElement("span");a.className="particle";const f=s/o*360+Math.random()*40,c=18+Math.random()*14;a.style.setProperty("--dx",`${Math.cos(f*Math.PI/180)*c}px`),a.style.setProperty("--dy",`${Math.sin(f*Math.PI/180)*c}px`),a.style.left=`${r.left-i.left+r.width/2}px`,a.style.top=`${r.top-i.top+r.height/2}px`,l.appendChild(a),window.setTimeout(()=>a.remove(),650)}}function St(e){const t=document.createElement("div");return t.id="particle-layer",t.className="particle-layer",e.querySelector(".cc-root")?.appendChild(t),t}function Mt(e,t,o){const r=t/Math.max(1,o),i=r>=40?"huge":r>=15?"big":r>=5?"nice":null;if(!i)return ue(e,`+${t.toLocaleString()} coins`),Promise.resolve();const l=i==="huge"?"HUGE WIN!":i==="big"?"BIG WIN!":"NICE WIN!";return new Promise(s=>{const a=document.createElement("div");a.className=`win-tier win-tier-${i}`,a.innerHTML=`
      <div class="win-tier-burst">${ye(i==="huge"?24:i==="big"?16:10)}</div>
      <div class="win-tier-label">${l}</div>
      <div class="win-tier-amount">+${t.toLocaleString()} coins</div>
    `,e.querySelector(".cc-root")?.appendChild(a),A();const f=i==="huge"?2400:i==="big"?1900:1400;window.setTimeout(()=>{a.remove(),s()},f)})}function ye(e){return Array.from({length:Math.min(e,30)},(t,o)=>`<span class="burst-dot" style="--angle:${o/e*360}deg;--delay:${o%6*.03}s"></span>`).join("")}function Lt(e,t,o,r){return new Promise(i=>{const l=document.createElement("div");l.className="cat-popin";const s=document.createElement("div");s.className="cat-sprite";const a=document.createElement("div");a.className="cat-quip",a.textContent=r;const f=document.createElement("div");f.className="cat-popin-inner",f.append(s,a),l.appendChild(f),e.querySelector(".cc-root")?.appendChild(l);const d=o&&t==="joey"?["strut","assist","eat"]:o?["strut","eat"]:["strut","unimpressed"];let p=0;const h=()=>{s.innerHTML=dt(t,d[p])};h();const m=750,v=window.setInterval(()=>{if(p++,p>=d.length){window.clearInterval(v);return}h()},m);window.setTimeout(()=>{window.clearInterval(v),l.remove(),i()},m*d.length+500)})}function At(e){return new Promise(t=>{const o=document.createElement("div");o.className="uniglee-takeover";const r=Array.from({length:14},(i,l)=>{const s=4+l*41%92,a=l%7*.25,f=3.2+l%4*.6;return`<div class="uniglee-butterfly" style="left:${s}%;animation-delay:${a}s;animation-duration:${f}s">${L("butterfly")}</div>`}).join("");o.innerHTML=`
      <div class="uniglee-butterflies">${r}</div>
      <div class="uniglee-content">
        <div class="uniglee-avatar">${yt()}</div>
        <div class="uniglee-title">UNIGLEE!</div>
        <div class="uniglee-sub">Freak'n facts on FACTS.</div>
      </div>
    `,e.querySelector(".cc-root")?.appendChild(o),window.setTimeout(()=>{o.remove(),t()},2600)})}async function Et(e,t,o){const r=O(fe()),i=await _t(e,r),l=ct(r,i,le(t.bet),o);await Ct(e,t,l.wedge,l.rounds),t.balance+=l.totalWin,t.bestCascade=Math.max(t.bestCascade,l.bestCascade),C(t),await Pt(e,l.totalWin,l.retriggers),j(e,t)}function _t(e,t){return new Promise(o=>{const r=st(t),i=1080+{multiplying:30,giant_gnome:150,chai_back:270}[r],l=document.createElement("div");l.className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 wheel-scrim text-amber-100",l.innerHTML=`
      <h2 class="wheel-heading">Free Spins! Spin the AskJamie Wheel</h2>
      <div class="relative w-56 h-56">
        <div class="wheel-glow-ring"></div>
        <div id="wheel-ring" class="wheel-wedge-ring w-full h-full" style="--wheel-final-deg:${i}deg">
          ${pt()}
        </div>
        <div class="wheel-pointer"></div>
      </div>
      <p id="wheel-result" class="min-h-[1.5rem] text-center font-semibold"></p>
    `,e.appendChild(l),ke(),window.setTimeout(()=>{const s=l.querySelector("#wheel-result");s.textContent=de(r)+"!",A(),window.setTimeout(()=>{l.remove(),o(r)},1400)},2450)})}async function Ct(e,t,o,r){const i=e.querySelector("#bg-layer");i?.classList.add("aurora"),document.body.classList.add("aurora-mode");const l=document.createElement("div");l.className="free-spins-overlay text-amber-100",l.innerHTML=`
    <div class="night-garden aurora">${he()}</div>
    <div class="relative z-10 h-full w-full flex flex-col">
      <header class="marquee">
        <div class="marquee-row">
          <span class="level-chip">${de(o)}</span>
          <h1 class="marquee-title">Free Spins</h1>
        </div>
      </header>
      <div class="jar-meter">
        <div class="jar-meter-text">Spin <span id="fs-index">1</span> of <span id="fs-total">${r.length}</span> · Round win: <span id="fs-round-win">0</span></div>
      </div>
      <main class="cabinet-frame">
        <div id="fs-grid" class="reel-grid"></div>
      </main>
      <div id="fs-status" class="status-line"></div>
    </div>
  `,e.appendChild(l);const s=l.querySelector("#fs-grid"),a=l.querySelector("#fs-index"),f=l.querySelector("#fs-total"),c=l.querySelector("#fs-round-win"),d=l.querySelector("#fs-status");for(let p=0;p<r.length;p++){const h=r[p];a.textContent=String(p+1),f.textContent=String(r.length),c.textContent=h.totalWin.toLocaleString();for(const m of h.steps)s.innerHTML=F(m.grid),s.querySelectorAll(".cell").forEach(v=>v.classList.add("beam-drop")),m.wins.length>0?(oe(m.meterAfter),re()):te(),await P(360);h.twelvePumps?(await Tt(l),ve()):h.extraWildsAdded>0?(d.textContent="We Want Our Chai Back — extra wilds landed!",await P(500)):h.totalWin>0?(d.textContent=`+${h.totalWin.toLocaleString()} coins`,await P(400)):d.textContent="",h.freeSpinsAwarded>0&&(d.textContent=`Retrigger! +${h.freeSpinsAwarded} more free spins!`,A(),await P(800))}l.remove(),i?.classList.remove("aurora"),document.body.classList.remove("aurora-mode")}function Tt(e){return new Promise(t=>{const o=document.createElement("div");o.className="twelve-pumps",o.innerHTML=`<div class="twelve-pumps-ring">${ye(20)}</div><div class="twelve-pumps-text">TWELVE PUMPS!<span>12x wild multiplier</span></div>`,e.appendChild(o),window.setTimeout(()=>{o.remove(),t()},1300)})}function Pt(e,t,o){return new Promise(r=>{const i=document.createElement("div");i.className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 wheel-scrim text-amber-100",i.innerHTML=`
      <h2 class="text-2xl font-bold">Free Spins Complete!</h2>
      <p class="text-lg">You won ${t.toLocaleString()} coins${o>0?` (with ${o} retrigger${o>1?"s":""}!)`:""}</p>
      <button id="bonus-continue" class="sparkle-btn mt-4">Continue</button>
    `,e.appendChild(i),A(),i.querySelector("#bonus-continue")?.addEventListener("click",()=>{i.remove(),r()})})}function P(e){return new Promise(t=>window.setTimeout(t,e))}const R=document.querySelector("#app");function qt(){R.innerHTML=`
    <div class="relative h-full w-full flex flex-col items-center justify-center gap-6 night-garden overflow-hidden">
      <div class="flex items-center gap-2 relative z-10">
        <div class="w-16 h-16">${L("crystal")}</div>
        <div class="w-16 h-16">${L("butterfly")}</div>
      </div>
      <h1 class="relative z-10 text-2xl font-bold text-amber-100 text-center px-8">
        Glee-fully Chai Chasers
      </h1>
      <p class="relative z-10 text-amber-200/70 text-center px-10">
        Iced chai, two cats, and twelve kinds of sparkle.
      </p>
      <button id="tap-in"
        class="relative z-10 mt-4 px-8 py-4 rounded-2xl bg-orange-600 text-white text-lg font-semibold active:scale-95 transition-transform min-h-[64px]">
        Tap to open the Toolbox
      </button>
    </div>
  `,document.querySelector("#tap-in")?.addEventListener("click",()=>{const e=se();N(e.soundOn),ee(),be(),j(R,e)})}if(location.hash==="#board"){const e=se();N(e.soundOn),j(R,e)}else qt();
