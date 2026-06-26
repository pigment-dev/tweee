
(function(){
  "use strict";
  const $=s=>document.querySelector(s);
  const APP="PigmentDev Tweee", VERSION="2.4.0", BUILD="2026-06-26";
  const FONTS="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&family=Noto+Naskh+Arabic&family=Source+Serif+4&family=Lora&family=Merriweather&family=Playfair+Display&family=PT+Serif&family=EB+Garamond&family=Noto+Serif&family=Open+Sans&family=Roboto&family=Work+Sans&family=JetBrains+Mono&family=Inter&display=swap";

  // ── Host-owner defaults ──────────────────────────────────────────────
  // Deploying to GitHub Pages / Netlify / your server? Preload proxies &
  // preferences for every visitor by editing this block before deploying
  // (or, more easily, drop a config.json next to this file — see README).
  const TWEEE_DEFAULTS = {
    // proxies: ["https://your-name.workers.dev/"],
    // proxyMode: "failover",        // "failover" | "roundrobin" | "random"
    // tgProxy: "https://your-tg.workers.dev/"
  };

  const state={proxies:[],proxyMode:"failover",tgProxy:"",code:true};
  let lastRoots=null, rrIndex=0;
  $("#verLine").textContent=APP+" · v"+VERSION+" · build "+BUILD;

  // ── Settings ──
  const LS="tweee:settings";
  const DEF={proxies:[],proxyMode:"failover",tgProxy:"",themeMode:"auto",theme:0,fa:'"Yekan Bakh","Vazirmatn",sans-serif',en:'"Open Sans",sans-serif',fsize:18,lh:12,code:true,note:true,date:true,viewx:true,inlineImg:true,inlineVid:false,incognito:false,tgToken:"",tgChat:""};
  // Migrate any legacy single-proxy ("proxy":"…") value into the proxies[] array.
  function migrate(o){ o=o||{}; if(typeof o.proxy==="string" && o.proxy.trim() && !(Array.isArray(o.proxies)&&o.proxies.length)){ o.proxies=[o.proxy.trim()]; } delete o.proxy; if(typeof o.proxies==="string") o.proxies=splitProxies(o.proxies); if(o.fa==='"Yekan Bakh",sans-serif') o.fa='"Yekan Bakh","Vazirmatn",sans-serif'; return o; }
  function splitProxies(s){ return String(s||"").split(/[\n,]+/).map(x=>x.trim()).filter(Boolean); }
  let S=Object.assign({},DEF,migrate(Object.assign({},TWEEE_DEFAULTS)));
  try{ const raw=localStorage.getItem(LS); if(raw) S=Object.assign({},S,migrate(JSON.parse(raw))); }catch(_){}
  function save(){ try{ localStorage.setItem(LS,JSON.stringify(S)); }catch(_){} }

  // ── History ──
  const HK="tweee:history"; let HIST=[];
  try{ HIST=JSON.parse(localStorage.getItem(HK)||"[]")||[]; }catch(_){ HIST=[]; }
  function saveHist(){ try{ localStorage.setItem(HK,JSON.stringify(HIST)); }catch(_){ while(HIST.length>1){ HIST.pop(); try{ localStorage.setItem(HK,JSON.stringify(HIST)); break; }catch(__){} } } }
  function addHist(roots,ids){
    if(S.incognito) return;
    const f=roots[0]||{};
    HIST.unshift({ts:Date.now(),ids:ids||[],label:(f.name||f.handle||"Tweet"),snippet:(f.text||"").replace(/\s+/g," ").slice(0,90),roots:roots});
    saveHist(); renderHist();
  }
  function renderHist(){
    $("#histCount").textContent=HIST.length;
    const q=($("#histSearch").value||"").toLowerCase();
    const list=$("#histList");
    if(!HIST.length){ list.innerHTML='<div class="hist-empty">No history yet.</div>'; return; }
    const rows=HIST.map((e,i)=>({e,i})).filter(o=> !q || (o.e.label+" "+o.e.snippet+" "+(o.e.ids||[]).join(" ")).toLowerCase().includes(q));
    if(!rows.length){ list.innerHTML='<div class="hist-empty">No matches.</div>'; return; }
    list.innerHTML=rows.map(o=>'<div class="hist-item" data-i="'+o.i+'"><div class="hist-main"><div class="hist-label">'+esc(o.e.label)+'</div><div class="hist-snip">'+esc(o.e.snippet||"")+'</div></div><button class="hist-del" data-i="'+o.i+'" title="Remove">✕</button></div>').join("");
    list.querySelectorAll(".hist-item").forEach(el=>el.onclick=ev=>{ if(ev.target.closest(".hist-del")) return; const e=HIST[+el.dataset.i]; if(e){ renderDeck(e.roots,true); setStatus("Loaded from history","ok"); const hp=$("#histPop"); if(hp) hp.hidden=true; } });
    list.querySelectorAll(".hist-del").forEach(b=>b.onclick=ev=>{ ev.stopPropagation(); HIST.splice(+b.dataset.i,1); saveHist(); renderHist(); });
  }
  $("#histSearch").oninput=renderHist;
  $("#histClear").onclick=()=>{ HIST=[]; saveHist(); renderHist(); toast("History cleared","ok"); };

  // ── Toast ──
  let toastT;
  function toast(msg,type){ const el=$("#toast"); el.textContent=msg; el.className="toast show"+(type?" "+type:""); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"),2200); }

  // ── Themes ──
  const THEMES=[
    {bg:"#ffffff",fg:"#15202b",bd:"#e7ecf0"},
    {bg:"#f6efe0",fg:"#4a3f30",bd:"#e6dcc6"},
    {bg:"#eef1f4",fg:"#1c1f24",bd:"#dde2e8"},
    {bg:"#0f1620",fg:"#e7e9ea",bd:"#27313d"},
    {bg:"#000000",fg:"#e7e9ea",bd:"#222222"},
  ];
  const swWrap=$("#bgSwatches");
  THEMES.forEach((t,i)=>{const s=document.createElement("div");s.className="sw";s.style.background=t.bg;
    s.onclick=()=>{S.theme=i;document.querySelectorAll(".sw").forEach(e=>e.classList.remove("active"));s.classList.add("active");applyTheme(t);save();};
    swWrap.appendChild(s);});
  function applyTheme(t){const r=document.documentElement.style;r.setProperty("--bg",t.bg);r.setProperty("--fg",t.fg);r.setProperty("--bd",t.bd);}
  const mq=matchMedia("(prefers-color-scheme: dark)");
  function resolveTheme(){ return S.themeMode==="auto"?(mq.matches?"dark":"light"):S.themeMode; }
  function applyThemeMode(){ document.documentElement.setAttribute("data-theme",resolveTheme());
    document.querySelectorAll("#themeSeg button").forEach(b=>b.classList.toggle("on",b.dataset.mode===S.themeMode)); }
  mq.addEventListener("change",()=>{ if(S.themeMode==="auto") applyThemeMode(); });
  document.querySelectorAll("#themeSeg button").forEach(b=>b.onclick=()=>{ S.themeMode=b.dataset.mode; applyThemeMode(); save(); });

  const root=document.documentElement.style;
  function applySettings(){
    root.setProperty("--fa-font",S.fa); root.setProperty("--en-font",S.en);
    root.setProperty("--fsize",S.fsize+"px"); root.setProperty("--lh",(S.lh/10).toFixed(1));
    applyTheme(THEMES[S.theme]||THEMES[0]); applyThemeMode();
    $("#proxy").value=(S.proxies||[]).join("\n"); state.proxies=S.proxies||[];
    $("#proxyMode").value=S.proxyMode||"failover"; state.proxyMode=S.proxyMode||"failover";
    $("#tgToken").value=S.tgToken; $("#tgChat").value=S.tgChat;
    $("#tgProxy").value=S.tgProxy||""; state.tgProxy=S.tgProxy||"";
    $("#faFont").value=S.fa; $("#enFont").value=S.en;
    $("#fsize").value=S.fsize; $("#fsizeOut").textContent=S.fsize+"px";
    $("#lh").value=S.lh; $("#lhOut").textContent=(S.lh/10).toFixed(1);
    state.code=S.code;
    $("#codeToggle").checked=S.code; $("#dateToggle").checked=S.date; $("#viewxToggle").checked=S.viewx;
    $("#noteToggle").checked=S.note; $("#imgToggle").checked=S.inlineImg; $("#vidToggle").checked=S.inlineVid;
    $("#incToggle").checked=S.incognito; reflectIncog();
    document.body.classList.toggle("no-note",!S.note);
    document.body.classList.toggle("no-date",!S.date);
    document.body.classList.toggle("no-viewx",!S.viewx);
    document.querySelectorAll(".sw").forEach((e,i)=>e.classList.toggle("active",i===S.theme));
  }
  $("#faFont").onchange=e=>{S.fa=e.target.value;root.setProperty("--fa-font",S.fa);save();};
  $("#enFont").onchange=e=>{S.en=e.target.value;root.setProperty("--en-font",S.en);save();};
  $("#fsize").oninput=e=>{S.fsize=+e.target.value;root.setProperty("--fsize",S.fsize+"px");$("#fsizeOut").textContent=S.fsize+"px";save();};
  $("#lh").oninput=e=>{S.lh=+e.target.value;root.setProperty("--lh",(S.lh/10).toFixed(1));$("#lhOut").textContent=(S.lh/10).toFixed(1);save();};
  $("#proxy").oninput=e=>{S.proxies=splitProxies(e.target.value);state.proxies=S.proxies;save();};
  $("#proxyMode").onchange=e=>{S.proxyMode=e.target.value;state.proxyMode=S.proxyMode;save();};
  $("#tgToken").oninput=e=>{S.tgToken=e.target.value.trim();save();};
  $("#tgChat").oninput=e=>{S.tgChat=e.target.value.trim();save();};
  $("#tgProxy").oninput=e=>{S.tgProxy=e.target.value.trim();state.tgProxy=S.tgProxy;save();};
  $("#codeToggle").onchange=e=>{S.code=e.target.checked;state.code=S.code;save();if(lastRoots)renderDeck(lastRoots,true);};
  $("#dateToggle").onchange=e=>{S.date=e.target.checked;document.body.classList.toggle("no-date",!S.date);save();};
  $("#viewxToggle").onchange=e=>{S.viewx=e.target.checked;document.body.classList.toggle("no-viewx",!S.viewx);save();};
  $("#noteToggle").onchange=e=>{S.note=e.target.checked;document.body.classList.toggle("no-note",!S.note);save();};
  $("#imgToggle").onchange=e=>{S.inlineImg=e.target.checked;save();};
  $("#vidToggle").onchange=e=>{S.inlineVid=e.target.checked;save();};
  // The Tweee bird, recolored purple when incognito — used for the toolbar mark and the favicon.
  function birdSVG(incog){
    const g1=incog?"#9b8dff":"#ff5d50", g2=incog?"#6a52e5":"#d62f23", wing=incog?"#4a3fb0":"#bf2a1f", ear=incog?"#5b4fd6":"#c52f24";
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'+
      '<defs><linearGradient id="tw-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+g1+'"/><stop offset="1" stop-color="'+g2+'"/></linearGradient></defs>'+
      '<path d="M11 28c-3-1-6 0-8 2 2 1 4 3 4 6 3-1 5-4 4-8z" fill="'+wing+'"/>'+
      '<path d="M24 13c-1-5 0-9 2-12 1 3 2 5 4 7z" fill="'+ear+'"/>'+
      '<path d="M40 13c1-5 0-9-2-12-1 3-2 5-4 7z" fill="'+ear+'"/>'+
      '<circle cx="32" cy="33" r="22" fill="url(#tw-b)"/>'+
      '<path d="M22 41a10 9 0 0 0 20 0z" fill="#ffd8a8"/>'+
      '<circle cx="26.5" cy="30" r="8" fill="#fff"/><circle cx="37.5" cy="30" r="8" fill="#fff"/>'+
      '<circle cx="29" cy="31" r="3.1" fill="#15202b"/><circle cx="35" cy="31" r="3.1" fill="#15202b"/>'+
      '<path d="M16 20l15 6-2 5-14-7z" fill="#1d2530"/><path d="M48 20l-15 6 2 5 14-7z" fill="#1d2530"/>'+
      '<path d="M27 35h10l-2 5h-6z" fill="#ffb02e"/><path d="M29 40h6l-3 3.5z" fill="#ef8c1c"/></svg>';
  }
  function reflectIncog(){
    const on=S.incognito;
    const b=$("#incBtn"); if(b){ b.classList.toggle("incog-on",on); b.setAttribute("aria-pressed",on?"true":"false"); b.title=on?"Incognito on — history paused. Click to resume.":"Incognito — don’t save to history"; }
    if($("#incToggle")) $("#incToggle").checked=on;
    const bi=$("#brandIcon"); if(bi) bi.innerHTML=birdSVG(on);
    const fav=$("#favicon"); if(fav) fav.href="data:image/svg+xml;utf8,"+encodeURIComponent(birdSVG(on));
    const app=document.querySelector(".app"); if(app) app.classList.toggle("incog",on);
    document.title=on?"Tweee · Incognito":APP;
  }
  function setIncog(v){ S.incognito=v; reflectIncog(); save(); toast(S.incognito?"Incognito on — history paused":"Incognito off","busy"); }
  $("#incToggle").onchange=e=>setIncog(e.target.checked);
  $("#incBtn").onclick=()=>setIncog(!S.incognito);

  // ── HTML entity decode ──
  const _ta=document.createElement("textarea");
  function dec(s){ if(!s) return s; _ta.innerHTML=s; return _ta.value; }

  // ── Bidi ──
  const RTL=/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFF]/;
  function lineClass(line){ for(const ch of line){ if(/[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/.test(ch)) return "en"; if(RTL.test(ch)) return "fa"; } return "fa"; }
  function dominant(text){ let fa=0,en=0; for(const ch of text||""){ if(/[A-Za-z]/.test(ch))en++; else if(RTL.test(ch))fa++; } return fa>en?"rtl":"ltr"; }
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
  function linkify(s){
    return esc(s)
      .replace(/`([^`]+)`/g,'<code class="inl">$1</code>')
      .replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|\s)@([A-Za-z0-9_]{1,15})/g,'$1<span class="men">@$2</span>')
      .replace(/(^|\s)(#[\p{L}0-9_]+)/gu,'$1<span class="tag">$2</span>');
  }
  function looksCode(line){ if(RTL.test(line)||line.trim()==="") return false; return /[{}]|=>|;\s*$|^\s{2,}\S|^\s*[#$>]\s|\b(function|const|let|var|def|class|import|export|return|public|private|void|SELECT|FROM|WHERE|echo|print)\b/.test(line); }
  function segment(text){
    const lines=text.split("\n"); const segs=[]; let i=0;
    while(i<lines.length){
      if(lines[i].startsWith(IMG_MARK)){ segs.push({type:"img",url:lines[i].slice(IMG_MARK.length)}); i++; continue; }
      const open=lines[i].trim().match(/^```+([\w-]+)?$/);
      if(state.code && open){ const lang=open[1]||""; const buf=[]; i++; while(i<lines.length && !/^```+\s*$/.test(lines[i].trim())){buf.push(lines[i]);i++;} i++; segs.push({type:"code",lang,text:buf.join("\n")}); continue; }
      if(state.code && looksCode(lines[i])){ const buf=[lines[i]]; let j=i+1; while(j<lines.length && looksCode(lines[j])){buf.push(lines[j]);j++;} if(buf.length>=2){ segs.push({type:"code",lang:"",text:buf.join("\n")}); i=j; continue; } }
      const last=segs[segs.length-1]; if(last&&last.type==="prose") last.lines.push(lines[i]); else segs.push({type:"prose",lines:[lines[i]]}); i++;
    }
    return segs;
  }
  function buildBody(text,base){
    let im=0;
    return segment(text).map(seg=>{
      if(seg.type==="code") return '<div class="cblock"><div class="cbar"><span>'+(seg.lang||"code")+'</span><button class="copy">Copy</button></div><pre><code>'+esc(seg.text)+'</code></pre></div>';
      if(seg.type==="img"){ im++; return mediaHtml([{type:"photo",url:seg.url}],(base||"tweee")+"_img"+im); }
      return seg.lines.map(l=> l.trim()===""? '<p class="blank"></p>' : '<p class="'+lineClass(l)+'">'+linkify(l)+'</p>').join("");
    }).join("");
  }

  const VERIFIED='<svg viewBox="0 0 256 256" fill="currentColor"><path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>';
  const IC_DL='<svg viewBox="0 0 256 256" fill="currentColor"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/></svg>';
  const IC_LINK='<svg viewBox="0 0 256 256" fill="currentColor"><path d="M165.66,90.34a8,8,0,0,1,0,11.32l-64,64a8,8,0,0,1-11.32-11.32l64-64A8,8,0,0,1,165.66,90.34ZM215.6,40.4a56,56,0,0,0-79.2,0L106.34,70.45a8,8,0,0,0,11.32,11.32l30.06-30a40,40,0,0,1,56.57,56.56l-30.07,30.06a8,8,0,0,0,11.31,11.32L215.6,119.6a56,56,0,0,0,0-79.2ZM138.34,174.22l-30.06,30.06a40,40,0,1,1-56.56-56.57l30.05-30.05a8,8,0,0,0-11.32-11.32L40.4,136.4a56,56,0,0,0,79.2,79.2l30.06-30.07a8,8,0,0,0-11.32-11.31Z"/></svg>';
  const IC_IMG='<svg viewBox="0 0 256 256" fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208v77.38l-24.69-24.7a16,16,0,0,0-22.62,0L53.37,208H48ZM208,208H76l96-96,36,36v60ZM96,120A24,24,0,1,0,72,96,24,24,0,0,0,96,120Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,96,88Z"/></svg>';
  const IC_RETRY='<svg viewBox="0 0 256 256" fill="currentColor"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"/></svg>';
  function shortHost(u){ try{ return new URL(u).hostname.replace(/^www\./,""); }catch(_){ return "link"; } }

  function extOf(url,fb){ const b=String(url).split("?")[0]; const m=b.match(/\.(\w{3,4})$/); if(m) return m[1].toLowerCase(); const f=String(url).match(/[?&]format=(\w+)/); if(f) return f[1].toLowerCase(); return fb; }
  function dlUrl(m){ let u=m.url; if(m.type==="photo" && /pbs\.twimg\.com/.test(u)){ u=/[?&]name=/.test(u)?u.replace(/([?&]name=)\w+/,"$1orig"):u+(u.includes("?")?"&":"?")+"name=orig"; } return u; }
  function mediaHtml(media,base){
    if(!media||!media.length) return "";
    const cls=media.length>=2?"n2":"";
    const items=media.slice(0,4).map((m,i)=>{
      const ext=extOf(m.url,m.type==="photo"?"jpg":"mp4"), name=base+"_"+(i+1)+"."+ext, url=dlUrl(m);
      const isVid=(m.type==="video"||m.type==="gif");
      const inner=isVid
        ? '<video src="'+m.url+'" '+(m.poster?'poster="'+m.poster+'" ':'')+'controls playsinline '+(m.type==="gif"?'autoplay loop muted ':'')+'></video>'
        : '<img src="'+m.url+'" alt="" loading="lazy" referrerpolicy="no-referrer">';
      const dlBtn='<button class="mbtn dl" data-url="'+url+'" data-name="'+name+'" title="Download">'+IC_DL+'<span>Download</span></button>';
      const cpBtn='<button class="mbtn copyurl" data-url="'+url+'" title="Copy media URL">'+IC_LINK+'<span>Copy link</span></button>';
      const openBtn='<a class="mbtn open" href="'+url+'" target="_blank" rel="noopener" title="Open original">'+IC_LINK+'<span>Open original</span></a>';
      const tools='<div class="mtools">'+dlBtn+cpBtn+'</div>';                       // hover overlay (desktop)
      const bar='<div class="mbar">'+dlBtn+cpBtn+'</div>';                            // below media (touch)
      const retryBtn='<button class="mbtn retry" title="Try loading again">'+IC_RETRY+'<span>Retry</span></button>';
      const fail='<div class="mfail">'+IC_IMG+'<span class="mfmsg">Couldn’t load '+(isVid?"video":"image")+'</span><div class="mfacts">'+retryBtn+dlBtn+cpBtn+openBtn+'</div></div>';
      const link='<a class="mlink" href="'+url+'" target="_blank" rel="noopener">'+IC_LINK+'<span>'+esc(shortHost(url))+'</span></a>';
      return '<div class="mwrap'+(isVid?" vid":"")+'">'+inner+tools+fail+link+bar+'</div>';
    }).join("");
    return '<div class="media '+cls+'">'+items+'</div>';
  }
  function fmtDate(ms){ if(!ms) return ""; const d=new Date(ms); return isNaN(d)?"":d.toLocaleString("en-US",{dateStyle:"long",timeStyle:"short"}); }
  function tweetId(t){ return (String(t.url||"").match(/status\/(\d+)/)||[])[1]||""; }
  function baseName(t){ const h=(t.handle||"tweee").replace(/[^A-Za-z0-9_]/g,""); const id=tweetId(t); return "tweee_"+h+(id?"_"+id:""); }

  function cardHtml(t,opts){
    opts=opts||{};
    const eyebrow = opts.isQuote ? '<div class="eyebrow">↳ Quoted tweet</div>'
      : (t.isArticle ? '<div class="eyebrow">📄 Article</div>'
      : (opts.total>1 ? '<div class="eyebrow">Tweet '+opts.index+' / '+opts.total+'</div>' : ''));
    const head=(t.name||t.handle)?
      '<div class="head">'+(t.avatar?'<img class="avatar" src="'+t.avatar+'" alt="" referrerpolicy="no-referrer">':'<div class="avatar"></div>')+
      '<div class="who"><div class="name">'+esc(t.name||"")+' '+(t.handle?VERIFIED:"")+'</div>'+
      (t.handle?'<div class="handle">@'+esc(t.handle.replace(/^@/,""))+'</div>':"")+'</div></div>':"";
    const foot='<div class="foot"><span class="date">'+esc(fmtDate(t.dateMs))+'</span>'+
      (t.url?'<a class="viewx" href="'+t.url+'" target="_blank" rel="noopener">View on X ↗</a>':'<span class="viewx">𝕏</span>')+'</div>';
    const hasText=t.text&&t.text.trim();
    const body=hasText ? buildBody(t.text,baseName(t)) : (t.media&&t.media.length ? "" : '<p class="muted">— no text in this post —</p>');
    const dir=hasText?dominant(t.text):"ltr";
    const quote=t.quote ? cardHtml(t.quote,{isQuote:true}) : "";
    return '<article class="card'+(opts.isQuote?" q":"")+'" dir="'+dir+'">'+eyebrow+head+'<div class="tweet">'+body+'</div>'+mediaHtml(t.media,baseName(t))+quote+foot+'</article>';
  }

  function wireCard(deck){
    deck.querySelectorAll(".cblock .copy").forEach(btn=>btn.onclick=()=>{ navigator.clipboard.writeText(btn.closest(".cblock").querySelector("code").textContent); btn.textContent="Copied"; toast("Code copied ✓","ok"); setTimeout(()=>btn.textContent="Copy",1200); });
    deck.querySelectorAll(".mbtn.copyurl").forEach(b=>b.onclick=()=>{ navigator.clipboard.writeText(b.dataset.url).then(()=>toast("Media URL copied ✓","ok")).catch(()=>toast("Copy failed","err")); });
    deck.querySelectorAll(".mbtn.dl").forEach(b=>b.onclick=()=>downloadMedia(b));
    // Image loading state: shimmer placeholder → fade in, or a fallback with a link on error.
    // Only mark "failed" on a real error event — lazy-deferred images report complete=true
    // with naturalWidth=0 before they've actually loaded, which must not count as a failure.
    deck.querySelectorAll(".mwrap img").forEach(img=>{
      const w=img.closest(".mwrap");
      const ok=()=>{ w.classList.remove("failed"); w.classList.add("loaded"); };
      const bad=()=>{ w.classList.remove("loaded"); w.classList.add("failed"); };
      if(img.complete && img.naturalWidth>0){ ok(); return; }
      img.addEventListener("load",ok); img.addEventListener("error",bad);
    });
    deck.querySelectorAll(".mwrap.vid video").forEach(v=>{ const w=v.closest(".mwrap"); w.classList.add("loaded"); v.addEventListener("error",()=>w.classList.add("failed")); });
    // Retry a failed image/video — reset its src so the existing load/error handlers run again.
    deck.querySelectorAll(".mbtn.retry").forEach(b=>b.onclick=()=>{
      const w=b.closest(".mwrap"); const el=w&&w.querySelector("img,video"); if(!el) return;
      const src=el.getAttribute("src");
      w.classList.remove("failed","loaded");
      el.removeAttribute("src"); void el.offsetWidth; el.setAttribute("src",src);
      if(el.tagName==="VIDEO"){ try{ el.load(); }catch(_){} w.classList.add("loaded"); }
      toast("Retrying…","busy");
    });
  }
  function emptyHTML(){ return '<div class="empty" id="empty"><div class="elogo">'+birdSVG(false)+'</div><div class="ename">Tweee</div><div class="ever">v'+VERSION+' · build '+BUILD+'</div><div class="ehint">Paste a tweet or article URL above and press <b>Fetch</b>.</div></div>'; }
  function showEmpty(){ $("#deck").innerHTML=emptyHTML(); $("#deckfoot").hidden=true; }
  function showSpinner(){ $("#deck").innerHTML='<div class="spin"><div class="ring" role="status" aria-label="Loading"></div></div>'; $("#deckfoot").hidden=true; }
  function renderDeck(roots,fromHist){
    lastRoots=roots;
    const total=roots.length;
    const html=roots.map((t,i)=>cardHtml(t,{index:i+1,total})).join("");
    const deck=$("#deck"); deck.innerHTML=html; const emp=$("#empty"); if(emp) emp.remove();
    const df=$("#deckfoot");
    df.innerHTML='Generated with <a href="https://pigment.dev/" target="_blank" rel="noopener">PigmentDev Tweee</a> on '+esc(fmtDate(Date.now()))+' · v'+VERSION+' · <a href="https://github.com/pigment-dev/tweee" target="_blank" rel="noopener">github.com/pigment-dev/tweee</a>';
    df.hidden=false;
    wireCard(deck);
  }

  // ── Media download with progress + cancel ──
  async function streamTo(url,signal,fill,pct){
    const res=await fetch(url,{mode:"cors",signal});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const total=+(res.headers.get("content-length")||0);
    if(!total){ fill.classList.add("indet"); pct.textContent="…"; }
    if(res.body && res.body.getReader){
      const reader=res.body.getReader(); const chunks=[]; let got=0;
      for(;;){ const r=await reader.read(); if(r.done) break; chunks.push(r.value); got+=r.value.length;
        if(total){ const p=Math.round(got/total*100); fill.style.width=p+"%"; pct.textContent=p+"%"; } else pct.textContent=(got/1048576).toFixed(1)+"MB"; }
      return new Blob(chunks);
    }
    return await res.blob();
  }
  async function downloadMedia(btn){
    const url=btn.dataset.url, name=btn.dataset.name||"media", wrap=btn.closest(".mwrap");
    if(wrap.querySelector(".dlbar")) return;
    const ctrl=new AbortController();
    const bar=document.createElement("div"); bar.className="dlbar";
    bar.innerHTML='<div class="dlbar-track"><div class="dlbar-fill"></div></div><span class="dlbar-pct">0%</span><button class="dlbar-x" title="Cancel">✕</button>';
    wrap.appendChild(bar);
    const fill=bar.querySelector(".dlbar-fill"), pct=bar.querySelector(".dlbar-pct");
    bar.querySelector(".dlbar-x").onclick=()=>ctrl.abort();
    toast("Download started…","busy");
    // Try direct first, then each configured proxy (media passthrough) when X blocks CORS.
    const candidates=[url].concat(proxyList().map(b=>proxyMediaURL(b,url)));
    let lastErr=null;
    for(let i=0;i<candidates.length;i++){
      try{
        fill.classList.remove("indet"); fill.style.width="0"; pct.textContent="0%";
        const blob=await streamTo(candidates[i],ctrl.signal,fill,pct);
        triggerSave(blob,name); bar.remove(); toast("Download complete ✓","ok"); return;
      }catch(e){
        if(e.name==="AbortError"){ bar.remove(); toast("Download canceled","busy"); return; }
        lastErr=e;
        if(i<candidates.length-1){ pct.textContent="retry…"; toast("Direct blocked — trying proxy…","busy"); }
      }
    }
    bar.remove();
    window.open(url,"_blank","noopener");
    toast("Download failed"+((state.proxies||[]).length?"":" — add a proxy to enable")+" — opened in new tab","err");
  }
  function triggerSave(blob,name){ const o=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=o; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(o); }

  // ── Normalizers ──
  // FxTwitter delivers X Articles as a Draft.js block document (a.content):
  // unstyled paragraphs, headings, lists, blockquotes, plus atomic blocks that
  // reference entityMap entries (MARKDOWN code, DIVIDER rules, MEDIA images).
  // Inline image marker: images render in place within the article body (not dumped at the end).
  const IMG_MARK="IMG";
  function fxArticle(a){
    const out=[];
    const em={}; (a.content&&a.content.entityMap||[]).forEach(e=>{ em[String(e.key)]=e.value; });
    const imgById={}; (a.media_entities||[]).forEach(m=>{ const u=m.media_info&&m.media_info.original_img_url; if(u) imgById[String(m.media_id)]=u; });
    let onum=0;
    ((a.content&&a.content.blocks)||[]).forEach(b=>{
      const type=b.type||"unstyled", txt=dec(b.text||"");
      if(type!=="ordered-list-item") onum=0;
      if(type==="atomic"){
        const ent=(b.entityRanges&&b.entityRanges.length)?em[String(b.entityRanges[0].key)]:null;
        if(ent&&ent.type==="MARKDOWN"&&ent.data&&ent.data.markdown){ out.push(dec(ent.data.markdown)); }
        else if(ent&&ent.type==="DIVIDER"){ out.push("———"); }
        else if(ent&&ent.type==="MEDIA"&&ent.data&&ent.data.mediaItems){ ent.data.mediaItems.forEach(mi=>{ const u=imgById[String(mi.mediaId)]; if(u) out.push(IMG_MARK+u); }); }
        return;
      }
      if(!txt.trim()){ out.push(""); return; }
      const indent="  ".repeat(b.depth||0);
      if(/^header-/.test(type)){ out.push(""); out.push(txt); out.push(""); }
      else if(type==="unordered-list-item"){ out.push(indent+"• "+txt); }
      else if(type==="ordered-list-item"){ out.push(indent+(++onum)+". "+txt); }
      else if(type==="blockquote"){ out.push("❝ "+txt); }
      else out.push(txt);
    });
    let body=out.join("\n").replace(/\n{3,}/g,"\n\n").trim();
    if(!body) body=dec(a.preview_text||a.full_text||a.text||"");
    const title=dec(a.title||"");
    return { text:(title?title+"\n\n":"")+body };
  }
  function nFx(t){
    let text=dec(t.text||"");
    const a=t.article;
    if(a && typeof a==="object"){ const r=fxArticle(a); text=r.text||text; }
    else if(t.is_article && a){ const full=dec(a.full_text||a.text||""); text=(a.title?(dec(a.title)+"\n\n"):"")+(full||text); }
    const all=(t.media&&(t.media.all||[].concat(t.media.photos||[],t.media.videos||[])))||[];
    let media=all.map(m=>({type:m.type==="photo"?"photo":(m.type==="gif"?"gif":"video"),url:m.url,poster:m.thumbnail_url})).filter(m=>m.url);
    return {
      name:dec(t.author&&t.author.name), handle:t.author&&t.author.screen_name, avatar:t.author&&t.author.avatar_url,
      text, isArticle:!!(t.is_article||a),
      media,
      dateMs:t.created_timestamp?t.created_timestamp*1000:Date.parse(t.created_at||""),
      url:t.url, quote:t.quote?nFx(t.quote):null
    };
  }
  function nVx(t){
    const ex=t.media_extended||[];
    return { name:dec(t.user_name), handle:t.user_screen_name, avatar:t.user_profile_image_url, text:dec(t.text||""), isArticle:false,
      media:ex.map(m=>({type:m.type==="image"?"photo":(m.type==="gif"?"gif":"video"),url:m.url,poster:m.thumbnail_url})).filter(m=>m.url),
      dateMs:t.date_epoch?t.date_epoch*1000:Date.parse(t.date||""), url:t.tweetURL, quote:null };
  }
  function nSyn(d){
    const md=d.mediaDetails||[];
    const media=md.map(m=>{ if(m.type==="photo") return {type:"photo",url:m.media_url_https};
      const vs=((m.video_info&&m.video_info.variants)||[]).filter(v=>v.content_type==="video/mp4").sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
      return {type:m.type==="animated_gif"?"gif":"video",url:vs[0]&&vs[0].url,poster:m.media_url_https}; }).filter(m=>m.url);
    const note=d.note_tweet&&d.note_tweet.note_tweet_results&&d.note_tweet.note_tweet_results.result;
    const text=dec((note&&note.text)||d.text||d.full_text||""); const sn=d.user&&d.user.screen_name;
    return { name:dec(d.user&&d.user.name), handle:sn, avatar:d.user&&d.user.profile_image_url_https, text, isArticle:false, media,
      dateMs:Date.parse(d.created_at||""), url:"https://x.com/"+(sn||"i")+"/status/"+(d.id_str||d.id||""), quote:d.quoted_tweet?nSyn(d.quoted_tweet):null };
  }

  function tok(id){ return ((Number(id)/1e15)*Math.PI).toString(36).replace(/(0+|\.)/g,""); }
  // Ordered list of proxy bases for this request, per rotation mode.
  function proxyList(){
    const ps=(state.proxies||[]).map(s=>s.trim()).filter(Boolean);
    if(ps.length<=1) return ps;
    if(state.proxyMode==="random"){ const a=ps.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
    if(state.proxyMode==="roundrobin"){ const off=rrIndex++%ps.length; return ps.slice(off).concat(ps.slice(0,off)); }
    return ps; // failover: as entered
  }
  function withParam(base,key,val){ if(new RegExp("[?&]"+key+"=$").test(base)) return base+encodeURIComponent(val); return base+(base.includes("?")?"&":"?")+key+"="+encodeURIComponent(val); }
  function proxyTweetURL(base,id){ return withParam(base,"id",id); }
  function proxyMediaURL(base,url){ return withParam(base,"url",url); }
  function parseIds(input){
    const out=[],seen=new Set(),re=/(?:status(?:es)?|article)\/(\d+)/g; let m;
    while((m=re.exec(input))){ if(!seen.has(m[1])){seen.add(m[1]);out.push(m[1]);} }
    if(!out.length) input.split(/\s+/).forEach(t=>{ if(/^\d{8,}$/.test(t)&&!seen.has(t)){seen.add(t);out.push(t);} });
    return out;
  }
  function setStatus(msg,type){const el=$("#status");el.className=msg?("status "+(type||"")):"";el.textContent=msg||"";}

  async function fetchOne(id){
    const errs=[]; let fallback=null;
    window.__raw=window.__raw||{};
    const hasContent=n=>n&&((n.text&&n.text.trim())||(n.media&&n.media.length)||n.quote);
    const consider=n=>{ if(hasContent(n)) return n; if(n&&!fallback) fallback=n; return null; };
    try{ const r=await fetch("https://api.fxtwitter.com/status/"+id);
      if(r.ok){ const j=await r.json(); window.__raw["fx:"+id]=j; if(j&&j.tweet){ const n=consider(nFx(j.tweet)); if(n) return n; errs.push("fx empty"); } else errs.push("fx "+((j&&j.message)||"no tweet")); }
      else errs.push("fx "+r.status);
    }catch(e){errs.push("fx "+e.message);}
    for(const base of proxyList()){ try{ const r=await fetch(proxyTweetURL(base,id));
      if(r.ok){ const d=await r.json(); window.__raw["proxy:"+id]=d; const n=consider(nSyn(Object.assign({id_str:id},d))); if(n) return n; errs.push("proxy empty"); } else errs.push("proxy "+r.status);
    }catch(e){errs.push("proxy "+e.message);} }
    try{ const r=await fetch("https://api.vxtwitter.com/x/status/"+id);
      if(r.ok){ const j=await r.json(); window.__raw["vx:"+id]=j; const n=consider(nVx(j)); if(n) return n; errs.push("vx empty"); } else errs.push("vx "+r.status);
    }catch(e){errs.push("vx "+e.message);}
    try{ const r=await fetch("https://cdn.syndication.twimg.com/tweet-result?id="+id+"&token="+tok(id)+"&lang=en");
      if(r.ok){ const d=await r.json(); window.__raw["syn:"+id]=d; const n=consider(nSyn(Object.assign({id_str:id},d))); if(n) return n; errs.push("syn empty"); } else errs.push("syn "+r.status);
    }catch(e){errs.push("syn "+e.message);}
    if(fallback) return fallback;
    throw new Error(errs.join(" · ")||"all sources failed");
  }

  async function run(){
    const ids=parseIds($("#url").value);
    if(!ids.length){ setStatus("No tweet URL or ID found.","err"); return; }
    setStatus("Fetching "+ids.length+" tweet"+(ids.length>1?"s":"")+"…","busy"); $("#fetchBtn").disabled=true;
    showSpinner();
    const roots=[]; let lastErr="";
    for(const id of ids){ try{ roots.push(await fetchOne(id)); }catch(e){ lastErr=e.message; } }
    $("#fetchBtn").disabled=false;
    if(!roots.length){ setStatus("Couldn't load any tweet ("+lastErr+"). Add a proxy in Settings → Proxy, or use the Manual tab.","err"); showEmpty(); return; }
    renderDeck(roots); addHist(roots,ids);
    setStatus("Loaded "+roots.length+"/"+ids.length+" ✓"+(lastErr?(" · some failed: "+lastErr):""), lastErr?"err":"ok");
  }
  $("#fetchBtn").onclick=run;
  $("#renderManual").onclick=()=>{
    const text=$("#mText").value; if(!text.trim()){ setStatus("Paste some text first.","err"); return; }
    const roots=[{name:$("#mName").value.trim(),handle:$("#mHandle").value.trim(),avatar:"",text,media:[],isArticle:false,dateMs:Date.now(),url:($("#url").value.match(/https?:\/\/\S+/)||[""])[0],quote:null}];
    renderDeck(roots); addHist(roots,[]); setStatus("Rendered ✓","ok");
  };

  // ── Worker modal ──
  const HL_KW=/^(const|let|var|function|return|new|await|async|if|else|try|catch|throw|export|default|typeof|void|for|while|of|in)$/;
  function highlight(code){
    const e=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const rules=[[/^\/\/[^\n]*/,"cm"],[/^\/\*[\s\S]*?\*\//,"cm"],[/^`(?:\\.|[^`\\])*`/,"st"],[/^"(?:\\.|[^"\\])*"/,"st"],[/^'(?:\\.|[^'\\])*'/,"st"],[/^\d+(?:\.\d+)?(?:e\d+)?/,"nu"],[/^[A-Za-z_$][\w$]*/,"id"],[/^\s+/,"ws"]];
    let out="",i=0;
    while(i<code.length){ const rest=code.slice(i); let hit=false;
      for(const pair of rules){ const m=rest.match(pair[0]); if(!m) continue; const tk=m[0],cls=pair[1];
        if(cls==="ws") out+=e(tk);
        else if(cls==="id"){ if(HL_KW.test(tk)) out+='<span class="kw">'+e(tk)+'</span>'; else if(/^(true|false|null|undefined)$/.test(tk)) out+='<span class="nu">'+e(tk)+'</span>'; else if(rest.slice(tk.length).trimStart().startsWith("(")) out+='<span class="fn">'+e(tk)+'</span>'; else out+=e(tk); }
        else out+='<span class="'+cls+'">'+e(tk)+'</span>';
        i+=tk.length; hit=true; break; }
      if(!hit){ out+=e(code[i]); i++; } }
    return out;
  }
  const WORKER=($("#workerSrc").textContent||"").replace(/^\n/,"").replace(/\s+$/,"");
  $("#workerHL").innerHTML=highlight(WORKER);
  const modal=$("#guideModal");
  $("#guideBtn").onclick=()=>modal.classList.add("open");
  $("#guideClose").onclick=()=>modal.classList.remove("open");
  modal.addEventListener("click",e=>{ if(e.target===modal) modal.classList.remove("open"); });
  $("#copyWorker").onclick=async()=>{ try{ await navigator.clipboard.writeText(WORKER); toast("Worker code copied ✓","ok"); }catch(_){ toast("Copy failed","err"); } };

  const TGWORKER=($("#tgWorkerSrc").textContent||"").replace(/^\n/,"").replace(/\s+$/,"");
  $("#tgWorkerHL").innerHTML=highlight(TGWORKER);
  const tgModal=$("#tgGuideModal");
  $("#tgGuideBtn").onclick=()=>tgModal.classList.add("open");
  $("#tgGuideClose").onclick=()=>tgModal.classList.remove("open");
  tgModal.addEventListener("click",e=>{ if(e.target===tgModal) tgModal.classList.remove("open"); });
  $("#copyTgWorker").onclick=async()=>{ try{ await navigator.clipboard.writeText(TGWORKER); toast("Worker code copied ✓","ok"); }catch(_){ toast("Copy failed","err"); } };

  const setModal=$("#settingsModal");
  $("#settingsBtn").onclick=()=>setModal.classList.add("open");
  $("#settingsClose").onclick=()=>setModal.classList.remove("open");
  setModal.addEventListener("click",e=>{ if(e.target===setModal) setModal.classList.remove("open"); });

  // Settings tabs
  $("#setTabs").addEventListener("click",e=>{ const b=e.target.closest(".tab"); if(!b) return; const t=b.dataset.tab;
    document.querySelectorAll("#setTabs .tab").forEach(x=>x.classList.toggle("on",x===b));
    document.querySelectorAll(".tabpane").forEach(p=>p.classList.toggle("on",p.dataset.pane===t)); });

  // History popover (anchored to the toolbar input)
  const histPop=$("#histPop");
  function closeHist(){ histPop.hidden=true; }
  $("#histBtn").onclick=e=>{ e.stopPropagation(); histPop.hidden=!histPop.hidden; if(!histPop.hidden){ renderHist(); $("#histSearch").focus(); } };
  document.addEventListener("click",e=>{ if(!histPop.hidden && !histPop.contains(e.target) && !$("#histBtn").contains(e.target)) closeHist(); });

  document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ modal.classList.remove("open"); tgModal.classList.remove("open"); setModal.classList.remove("open"); closeHist(); } });

  // ── Export ──
  $("#printBtn").onclick=()=>window.print();
  async function toDataURL(url){ const res=await fetch(url,{mode:"cors"}); if(!res.ok) throw new Error(res.status); const blob=await res.blob(); return await new Promise((ok,no)=>{ const fr=new FileReader(); fr.onload=()=>ok(fr.result); fr.onerror=no; fr.readAsDataURL(blob); }); }
  async function buildExportHtml(){
    const deck=$("#deck");
    const cs=getComputedStyle(document.documentElement); const v=n=>cs.getPropertyValue(n).trim();
    const baseCSS=document.querySelector("style").textContent;
    const clone=deck.cloneNode(true);
    clone.querySelectorAll(".mtools,.dlbar").forEach(e=>e.remove());
    // No runtime JS in the export, so mark media loaded and keep the small source link visible.
    clone.querySelectorAll(".mwrap").forEach(w=>{ if(!w.classList.contains("failed")) w.classList.add("loaded"); });
    const inl=async(el,attr)=>{ const u=el.getAttribute(attr); if(!u||u.startsWith("data:")) return; try{ el.setAttribute(attr, await toDataURL(u)); }catch(_){} };
    if(S.inlineImg){ for(const img of clone.querySelectorAll("img")) await inl(img,"src"); }
    if(S.inlineVid){ for(const vid of clone.querySelectorAll("video")){ await inl(vid,"src"); if(vid.getAttribute("poster")) await inl(vid,"poster"); } }
    const bodyCls=(!S.date?"no-date ":"")+(!S.viewx?"no-viewx ":"")+(!S.note?"no-note":"");
    const rootVars=":root{--accent:#1d9bf0;--muted:#536471;--shell:"+v('--shell')+";--bg:"+v('--bg')+";--fg:"+v('--fg')+";--bd:"+v('--bd')+";--fa-font:"+v('--fa-font')+";--en-font:"+v('--en-font')+";--fsize:"+v('--fsize')+";--lh:"+v('--lh')+"}";
    const overrides="html,body{margin:0}.app{display:block}.panel,.bar,.modal-bk,.toast{display:none!important}body{background:"+v('--shell')+";padding:40px 16px}.stage{padding:0}.deck{margin:0 auto}.mtools,.dlbar,.mbar{display:none!important}.mwrap::after{display:none}.mwrap .mlink{display:inline-flex}";
    const fid=(deck.innerHTML.match(/status\/(\d+)/)||[])[1];
    const dt=resolveTheme();
    const html='<!doctype html>\n<!-- PigmentDev Tweee — https://pigment.dev · github.com/pigment-dev/tweee -->\n'+
      '<html lang="fa" dir="rtl" data-theme="'+dt+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tweee'+(fid?" · "+fid:"")+'</title>'+
      '<link href="'+FONTS+'" rel="stylesheet"><style>'+baseCSS+'\n'+rootVars+'\n'+overrides+'</style></head>'+
      '<body class="'+bodyCls.trim()+'"><div class="stage"><div class="deck">'+clone.innerHTML+'</div><div class="deckfoot">'+$("#deckfoot").innerHTML+'</div></div></body></html>';
    return {html:html, name:"tweee"+(fid?"-"+fid:"")+".html"};
  }
  $("#dlBtn").onclick=async()=>{
    const deck=$("#deck"); if(deck.querySelector("#empty")||!deck.children.length){ toast("Nothing to export yet","err"); return; }
    toast("Building HTML…","busy");
    const {html,name}=await buildExportHtml();
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([html],{type:"text/html"})); a.download=name; a.click(); URL.revokeObjectURL(a.href);
    toast("Downloaded "+name+" ✓","ok");
  };
  $("#tgBtn").onclick=async()=>{
    const token=(S.tgToken||"").trim(), chat=(S.tgChat||"").trim();
    if(!token||!chat){ toast("Set your Telegram token & chat ID in Settings → Telegram","err"); $("#settingsModal").classList.add("open"); const tb=document.querySelector('#setTabs .tab[data-tab="telegram"]'); if(tb) tb.click(); return; }
    const deck=$("#deck"); if(deck.querySelector("#empty")||!deck.children.length){ toast("Nothing to send","err"); return; }
    toast("Sending to Telegram…","busy");
    try{
      const {html,name}=await buildExportHtml();
      // Caption shows which tweet it is: account name/handle + a short text preview.
      const root=(lastRoots&&lastRoots[0])||{};
      const who=((root.name||"").trim()+(root.handle?" @"+String(root.handle).replace(/^@/,""):"")).trim();
      const snip=String(root.text||"").replace(/\s+/g," ").trim().slice(0,180);
      const caption=([who,snip].filter(Boolean).join("\n")||"Tweee export").slice(0,1000);
      const fd=new FormData(); fd.append("chat_id",chat); fd.append("caption",caption); fd.append("document",new Blob([html],{type:"text/html"}),name);
      const tgBase=(S.tgProxy||"").trim().replace(/\/+$/,"")||"https://api.telegram.org";
      const r=await fetch(tgBase+"/bot"+token+"/sendDocument",{method:"POST",body:fd});
      const j=await r.json().catch(()=>({}));
      if(r.ok&&j.ok) toast("Sent to Telegram ✓","ok"); else toast("Telegram: "+((j&&j.description)||("HTTP "+r.status)),"err");
    }catch(e){ toast("Telegram failed: "+e.message,"err"); }
  };

  // ── Settings sync (export / import / link / config.json) ──
  // Keys safe to move between devices. tgToken/tgChat are exported to file but
  // kept OUT of shareable links so a bot token can't leak via a URL.
  const SYNC_KEYS=["proxies","proxyMode","tgProxy","themeMode","theme","fa","en","fsize","lh","code","note","date","viewx","inlineImg","inlineVid","tgToken","tgChat"];
  const LINK_KEYS=SYNC_KEYS.filter(k=>k!=="tgToken"&&k!=="tgChat");
  function pick(keys){ const o={}; keys.forEach(k=>{ if(S[k]!==undefined) o[k]=S[k]; }); return o; }
  function applyIncoming(obj,override){
    if(!obj||typeof obj!=="object") return false;
    const clean=migrate(Object.assign({},obj));
    // override=true => incoming wins; otherwise incoming fills only unset/empty values.
    SYNC_KEYS.forEach(k=>{ if(clean[k]===undefined) return; const cur=S[k]; const empty=cur===undefined||cur===""||(Array.isArray(cur)&&!cur.length); if(override||empty) S[k]=clean[k]; });
    save(); applySettings(); if(lastRoots) renderDeck(lastRoots,true); renderHist();
    return true;
  }
  const b64u={ enc:s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),
              dec:s=>decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/")))) };
  $("#cfgExport").onclick=()=>{
    const blob=new Blob([JSON.stringify(Object.assign({app:"tweee",v:VERSION},pick(SYNC_KEYS)),null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="tweee-config.json"; a.click(); URL.revokeObjectURL(a.href);
    toast("Settings exported ✓","ok");
  };
  $("#cfgImport").onclick=()=>$("#cfgFile").click();
  $("#cfgFile").onchange=e=>{ const f=e.target.files[0]; if(!f) return; const fr=new FileReader();
    fr.onload=()=>{ try{ applyIncoming(JSON.parse(fr.result),true); toast("Settings imported ✓","ok"); }catch(_){ toast("Invalid settings file","err"); } e.target.value=""; };
    fr.readAsText(f); };
  $("#cfgLink").onclick=async()=>{
    const link=location.origin+location.pathname+"?cfg="+b64u.enc(JSON.stringify(pick(LINK_KEYS)));
    try{ await navigator.clipboard.writeText(link); toast("Settings link copied ✓","ok"); }catch(_){ prompt("Copy this link:",link); }
  };

  // ── Auto-update: poll version.json (written on each deploy) and refresh when it changes ──
  let _build=null;
  async function checkUpdate(){
    try{
      const r=await fetch("version.json?_="+Date.now(),{cache:"no-store"});
      if(!r.ok) return;
      const v=await r.json(); const b=String(v.build||v.version||"");
      if(!b) return;
      if(_build===null){ _build=b; return; }            // baseline on first load
      if(b!==_build){ _build=b;
        if(!lastRoots){ location.reload(); }            // nothing open → refresh silently
        else toast("New version available — refresh to update","busy");
      }
    }catch(_){}
  }

  // ── init ──
  (async function init(){
    // Host-wide config.json (next to this file). { override:true } lets a host
    // owner force settings over a visitor's saved ones; otherwise it only fills gaps.
    try{
      const r=await fetch("config.json",{cache:"no-store"});
      if(r.ok){ const cfg=await r.json(); applyIncoming(cfg, cfg&&cfg.override===true); }
    }catch(_){}
    applySettings(); renderHist(); showEmpty();
    checkUpdate(); window.addEventListener("focus",checkUpdate); setInterval(checkUpdate,300000);
    const params=new URLSearchParams(location.search);
    const cfgParam=params.get("cfg");
    if(cfgParam){ try{ applyIncoming(JSON.parse(b64u.dec(cfgParam)),true); toast("Settings applied from link ✓","ok"); }catch(_){} }
    // Auto-fetch when a URL is handed in via ?url= / ?u= / ?tweet= / ?id= (or in the hash).
    // URLSearchParams already decodes, so don't decode again. Fall back to scanning the raw
    // href for an x.com/twitter link so messy iOS share-sheet URLs still work.
    const dec1=s=>{ try{ return decodeURIComponent(s); }catch(_){ return s; } };
    let incoming=params.get("url")||params.get("u")||params.get("tweet")||params.get("id")||"";
    if(!incoming && location.hash){ const h=location.hash.match(/(?:url|u|tweet|id)=([^&]+)/); if(h) incoming=dec1(h[1]); }
    if(!incoming){ const m=dec1(location.href).match(/https?:\/\/(?:x|twitter|mobile\.twitter)\.com\/\S+/i); if(m) incoming=m[0]; }
    if(incoming){ $("#url").value=incoming; run(); }
  })();
})();
