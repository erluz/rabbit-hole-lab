/* ============ shared site behaviour ============ */

/* ---- starfield ---- */
(function(){
  const c=document.getElementById('sky'); if(!c) return;
  const x=c.getContext('2d'); let w,h,stars;
  function init(){w=c.width=innerWidth;h=c.height=innerHeight;
    stars=Array.from({length:Math.min(320,Math.floor(w*h/6000))},()=>({
      x:Math.random()*w,y:Math.random()*h,z:Math.random()*1.6+.3,
      r:Math.random()*1.3+.2,tw:Math.random()*Math.PI*2}));}
  function draw(t){x.clearRect(0,0,w,h);
    for(const s of stars){const a=.4+.6*Math.abs(Math.sin(s.tw+t/900*s.z));
      x.globalAlpha=a;x.fillStyle=s.z>1.3?'#cfe0ff':(s.z>0.8?'#fff':'#ffe6c9');
      x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill();
      s.y+=s.z*0.04;if(s.y>h){s.y=0;s.x=Math.random()*w;}}
    x.globalAlpha=1;requestAnimationFrame(draw);}
  addEventListener('resize',init);init();requestAnimationFrame(draw);
})();

/* ---- reveal on scroll ---- */
(function(){const els=document.querySelectorAll('.reveal');if(!els.length)return;
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.1});
  els.forEach(el=>obs.observe(el));})();

/* ---- flip cards (event delegation) ---- */
document.addEventListener('click',e=>{
  const f=e.target.closest('.flip'); if(f) f.classList.toggle('on');
});

/* ---- highlight current nav link ---- */
(function(){
  const here=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('nav a.link').forEach(a=>{
    const href=(a.getAttribute('href')||'').toLowerCase();
    if(href===here || (here==='' && href==='index.html')) a.classList.add('active');
  });
})();

/* ============ reusable widgets (init only if elements exist) ============ */

/* ---- composition donut ---- */
function drawDonut(id){
  const g=document.getElementById(id); if(!g) return;
  const data=[{v:68,c:'#8b5cf6'},{v:27,c:'#e0509e'},{v:5,c:'#4fd6ff'}];
  const R=92,cx=110,cy=110,circ=2*Math.PI*R; let off=0;
  data.forEach(d=>{const len=circ*d.v/100;
    const el=document.createElementNS('http://www.w3.org/2000/svg','circle');
    el.setAttribute('cx',cx);el.setAttribute('cy',cy);el.setAttribute('r',R);
    el.setAttribute('fill','none');el.setAttribute('stroke',d.c);el.setAttribute('stroke-width',26);
    el.setAttribute('stroke-dasharray',len+' '+(circ-len));el.setAttribute('stroke-dashoffset',-off);
    g.appendChild(el);off+=len;});
}

/* ---- expanding universe ---- */
function initExpansion(canvasId,sliderId,outId){
  const cv=document.getElementById(canvasId); if(!cv) return;
  const g=cv.getContext('2d');
  const seeds=Array.from({length:34},()=>({x:Math.random()*2-1,y:Math.random()*2-1,r:Math.random()*2+1.4,h:Math.random()*360}));
  const slider=document.getElementById(sliderId),out=document.getElementById(outId);
  function size(){cv.width=cv.clientWidth*devicePixelRatio;cv.height=300*devicePixelRatio;g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
  function draw(){const W=cv.clientWidth,H=300,cx=W/2,cy=H/2,a=slider.value/50;
    g.clearRect(0,0,W,H); if(out)out.textContent=a.toFixed(2);
    const spread=Math.min(W,H)*0.46*a;
    for(const s of seeds){const px=cx+s.x*spread,py=cy+s.y*spread;
      g.beginPath();g.arc(px,py,s.r*(0.7+a*0.5),0,7);
      g.fillStyle='hsla('+s.h+',80%,70%,.9)';g.shadowBlur=8;g.shadowColor='hsla('+s.h+',80%,70%,.7)';g.fill();g.shadowBlur=0;}
    g.beginPath();g.arc(cx,cy,3.4,0,7);g.fillStyle='#fff';g.fill();}
  addEventListener('resize',()=>{size();draw();});
  slider.addEventListener('input',draw);size();draw();
}

/* ---- Hubble's law ---- */
function initHubble(){
  const d=document.getElementById('hubDist'); if(!d) return;
  const h0=document.getElementById('hubH0'),h0l=document.getElementById('h0lbl'),
    v=document.getElementById('hubVel'),cc=document.getElementById('hubC');
  function upd(){const H=parseFloat(h0.value),D=parseFloat(d.value)||0,vel=H*D;
    h0l.textContent=H.toFixed(1);
    v.textContent=vel.toLocaleString(undefined,{maximumFractionDigits:0})+' km/s';
    cc.textContent=(vel/299792.458*100).toFixed(2)+'%';}
  d.addEventListener('input',upd);h0.addEventListener('input',upd);upd();
}

/* ---- redshift / lookback (flat LCDM) ---- */
function initRedshift(){
  const sl=document.getElementById('zSlider'); if(!sl) return;
  const H0=67.4,Om=0.315,OL=0.685,HT=977.8/H0,ageNow=13.80;
  const E=z=>Math.sqrt(Om*Math.pow(1+z,3)+OL);
  function lookback(z){let n=2000,s=0,dz=z/n;for(let i=0;i<n;i++){const zz=(i+.5)*dz;s+=1/((1+zz)*E(zz))*dz;}return HT*s;}
  const zl=document.getElementById('zlbl'),tt=document.getElementById('ztime'),
    ag=document.getElementById('zage'),ex=document.getElementById('zexample');
  const examples=[
    {z:0,t:'Right here, right now.'},
    {z:0.5,t:'≈ light from when Earth’s dinosaurs had long vanished — the Sun already middle-aged.'},
    {z:1,t:'≈ the cosmic peak of star formation — the universe’s baby-boom of new suns.'},
    {z:2,t:'≈ “cosmic noon”: galaxies forming stars furiously.'},
    {z:6,t:'≈ the end of reionization — the fog of the young universe clearing.'},
    {z:10,t:'≈ some of the earliest galaxies JWST can see — cosmic dawn.'}
  ];
  function pick(z){let best=examples[0];for(const e of examples){if(z>=e.z)best=e;}return best.t;}
  function upd(){const z=parseFloat(sl.value);zl.textContent=z.toFixed(1);
    const lb=lookback(z);tt.textContent=lb.toFixed(1)+' Gyr';
    ag.textContent=Math.max(0,ageNow-lb).toFixed(1)+' Gyr';ex.textContent=pick(z);}
  sl.addEventListener('input',upd);upd();
}

/* ---- scale slider ---- */
function initScale(){
  const sl=document.getElementById('scaleSlider'); if(!sl) return;
  const steps=[
    {e:'⚛️',n:'Planck length',s:'1.6 × 10⁻³⁵ m',d:'The smallest meaningful length. Below this, space itself may lose meaning.'},
    {e:'🔵',n:'Proton',s:'~10⁻¹⁵ m',d:'A single proton in an atomic nucleus.'},
    {e:'🧬',n:'DNA helix',s:'~10⁻⁹ m (2 nm)',d:'The molecule that codes for all known life.'},
    {e:'🦠',n:'Bacterium',s:'~10⁻⁶ m',d:'A single-celled organism, about a micron across.'},
    {e:'🐜',n:'Ant',s:'~10⁻³ m',d:'Everyday millimeter scale.'},
    {e:'🧍',n:'Human',s:'~1.7 m',d:'You. The reference point for all of this.'},
    {e:'🏔️',n:'Mount Everest',s:'~10⁴ m',d:'Tallest mountain above sea level.'},
    {e:'🌆',n:'A large city',s:'~10⁵ m',d:'Tens of kilometers across.'},
    {e:'🌍',n:'Earth',s:'~1.3 × 10⁷ m',d:'The pale blue dot. Home to the only known life in the cosmos.'},
    {e:'☀️',n:'The Sun',s:'~1.4 × 10⁹ m',d:'You could line up ~109 Earths across its face.'},
    {e:'🪐',n:'Solar System',s:'~10¹³ m',d:'Out to Neptune; the heliosphere stretches much farther.'},
    {e:'✨',n:'One light-year',s:'~9.5 × 10¹⁵ m',d:'The distance light travels in a year.'},
    {e:'🌟',n:'Nearest star',s:'~4 × 10¹⁶ m',d:'Proxima Centauri, 4.24 light-years away.'},
    {e:'🌌',n:'The Milky Way',s:'~10²¹ m (~100,000 ly)',d:'Our galaxy: a few hundred billion stars.'},
    {e:'🕸️',n:'Local supercluster',s:'~10²⁴ m',d:'Galaxies strung along the cosmic web of filaments.'},
    {e:'♾️',n:'Observable universe',s:'~8.8 × 10²⁶ m (93 Gly)',d:'Everything whose light has had time to reach us.'}
  ];
  const em=document.getElementById('scaleEmoji'),nm=document.getElementById('scaleName'),
    sz=document.getElementById('scaleSize'),ds=document.getElementById('scaleDesc');
  function upd(){const s=steps[sl.value];em.textContent=s.e;nm.textContent=s.n;sz.textContent=s.s;ds.textContent=s.d;}
  sl.addEventListener('input',upd);upd();
}

/* ---- CMB ripple dots ---- */
function initCMB(id){
  const g=document.getElementById(id); if(!g) return;
  for(let i=0;i<520;i++){const cx=Math.random()*260,cy=Math.random()*138,t=Math.random();
    const el=document.createElementNS('http://www.w3.org/2000/svg','circle');
    el.setAttribute('cx',cx);el.setAttribute('cy',cy);el.setAttribute('r',Math.random()*2.4+1.4);
    const col=t<.5?[79,214,255]:[224,80,158];
    el.setAttribute('fill','rgba('+col[0]+','+col[1]+','+col[2]+','+(.25+Math.random()*.5)+')');
    g.appendChild(el);}
}

/* ---- galaxy rotation curve ---- */
function initRotation(){
  const cv=document.getElementById('rotcanvas'); if(!cv) return;
  const g=cv.getContext('2d'),tog=document.getElementById('rotToggle');
  function size(){cv.width=cv.clientWidth*devicePixelRatio;cv.height=300*devicePixelRatio;g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
  function draw(){const W=cv.clientWidth,H=300,pad=42;
    g.clearRect(0,0,W,H);
    // axes
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;
    g.beginPath();g.moveTo(pad,H-pad);g.lineTo(W-14,H-pad);g.moveTo(pad,H-pad);g.lineTo(pad,14);g.stroke();
    g.fillStyle='#9aa3c7';g.font='11px sans-serif';
    g.fillText('orbital speed',8,20);g.fillText('distance from center →',W-160,H-16);
    const x0=pad,x1=W-20,y0=H-pad,ymax=14, base=(y0-ymax);
    function plot(fn,color,dash){g.strokeStyle=color;g.lineWidth=2.4;g.setLineDash(dash||[]);g.beginPath();
      for(let i=0;i<=100;i++){const r=i/100;const v=fn(r);
        const px=x0+(x1-x0)*r, py=y0-base*v;
        i?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();g.setLineDash([]);}
    // Keplerian expected: v ~ 1/sqrt(r) beyond core; rises then falls
    const kep=r=>{const rr=Math.max(r,0.06);return Math.min(1, (r<0.18? r/0.18 : 0.42/Math.sqrt(rr)));};
    // observed flat curve
    const flat=r=>{return r<0.16? r/0.16 : 0.9;};
    plot(kep,'#4fd6ff',[6,5]);
    if(tog.checked) plot(flat,'#e0509e');
    // labels
    g.fillStyle='#4fd6ff';g.fillText('expected from visible matter',W-230,44);
    if(tog.checked){g.fillStyle='#e0509e';g.fillText('actually observed (flat)',W-230,62);}
  }
  addEventListener('resize',()=>{size();draw();});
  tog.addEventListener('change',draw);size();draw();
}

/* ---- dark energy fate slider ---- */
function initFate(){
  const sl=document.getElementById('fateSlider'); if(!sl) return;
  const out=document.getElementById('fateOut'),desc=document.getElementById('fateDesc');
  const modes=[
    {w:'w < -1',n:'Big Rip',d:'If dark energy strengthens over time (phantom energy), expansion tears apart galaxies, then solar systems, then atoms — everything ripped to shreds in a finite time.'},
    {w:'w = -1',n:'Big Freeze / Heat Death',d:'The standard case (a true cosmological constant). Expansion accelerates forever; galaxies wink out beyond the horizon, stars die, and the cosmos fades to a cold, dark, near-empty state.'},
    {w:'-1 < w < -1/3',n:'Slow Freeze',d:'Dark energy weakens but still drives acceleration. A gentler version of heat death — the universe still runs down, just more slowly.'},
    {w:'w > -1/3 (reverses)',n:'Big Crunch',d:'If dark energy eventually turns attractive, expansion halts and reverses. Everything collapses back together — possibly bouncing into a new Big Bang.'}
  ];
  function upd(){const m=modes[sl.value];out.textContent=m.n;desc.innerHTML='<span class="gold">'+m.w+'</span> — '+m.d;}
  sl.addEventListener('input',upd);upd();
}

/* ---- NASA APOD ---- */
function initApod(){
  const box=document.getElementById('apodbox'); if(!box) return;
  const dt=document.getElementById('apodDate'),btn=document.getElementById('apodBtn'),rnd=document.getElementById('apodRand');
  const KEY='DEMO_KEY',today=new Date().toISOString().slice(0,10);
  if(dt){dt.max=today;dt.value=today;}
  function render(a){
    if(a.code||a.error){box.innerHTML='<p style="color:var(--magenta)">Couldn’t reach NASA (rate limit or offline). Try again shortly, or use your own free API key.</p>';return;}
    const media=a.media_type==='image'
      ? '<a href="'+(a.hdurl||a.url)+'" target="_blank" rel="noopener"><img src="'+a.url+'" alt="'+a.title+'" style="width:100%;border-radius:14px;border:1px solid var(--stroke)"></a>'
      : '<div style="position:relative;padding-bottom:56%"><iframe src="'+a.url+'" style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:14px" allowfullscreen></iframe></div>';
    box.innerHTML=media+'<h3 style="margin:14px 0 2px">'+a.title+'</h3>'+
      '<div style="font-size:.8rem;color:var(--muted)">'+a.date+(a.copyright?' · © '+a.copyright.trim():'')+'</div>'+
      '<p style="color:var(--muted);font-size:.94rem;margin-top:10px">'+a.explanation+'</p>';
  }
  function load(date){box.innerHTML='<p style="color:var(--muted)">Contacting NASA…</p>';
    fetch('https://api.nasa.gov/planetary/apod?api_key='+KEY+(date?'&date='+date:''))
      .then(r=>r.json()).then(render)
      .catch(()=>box.innerHTML='<p style="color:var(--magenta)">Network blocked — open this page with an internet connection to see the live image.</p>');}
  if(btn)btn.onclick=()=>load(dt.value);
  if(rnd)rnd.onclick=()=>{const start=new Date(1995,5,16).getTime(),end=Date.now();
    const d=new Date(start+Math.random()*(end-start)).toISOString().slice(0,10);dt.value=d;load(d);};
  load(null);
}

/* ---- auto-init everything present on the page ---- */
document.addEventListener('DOMContentLoaded',()=>{
  drawDonut('donut');
  initExpansion('expcanvas','expTime','scaleOut');
  initHubble(); initRedshift(); initScale(); initCMB('cmbdots');
  initRotation(); initFate(); initApod();
});
