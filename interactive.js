(() => {
 const q=(s,r=document)=>r.querySelector(s);
 const hero=q('.hero'), signal=q('.signal-strip');
 if(hero&&signal){
  const host=document.createElement('div');
  host.innerHTML=`
   <section class="scada-section" id="control-room"><div class="scada-head"><div><p class="eyebrow">INTERACTIVE SYSTEM / 00</p><h2>AFNNAN CONTROL<br>INTERFACE<span style="color:#a9c59f">.</span></h2></div><p>A control-room inspired index for the classic portfolio. Select a circuit node to jump to a section. The central arm is an animated interface element.</p></div>
   <div class="scada-console"><div class="scada-column">
   <a class="scada-node magnetic" href="#work"><i>01</i><span><strong>PROJECTS</strong><small>Selected work & builds</small></span></a><a class="scada-node magnetic" href="#evidence"><i>02</i><span><strong>ARCHIVE</strong><small>Certificates & evidence</small></span></a><a class="scada-node magnetic" href="#experience"><i>03</i><span><strong>EXPERIENCE</strong><small>Roles & responsibility</small></span></a></div>
   <div class="scada-arm-stage"><svg viewBox="0 0 240 230" role="img" aria-label="Animated industrial robotic arm"><path class="arm-base" d="M82 202h76l-9 13H91z"/><path class="arm-base" d="M101 187h38v15h-38z"/><g class="scada-arm"><path class="arm-segment" d="M120 190L120 148"/><circle class="arm-joint" cx="120" cy="148" r="12"/><g class="arm-upper"><path class="arm-segment" d="M120 148L177 91"/><circle class="arm-joint" cx="177" cy="91" r="11"/><g class="arm-grip-group"><path class="arm-segment" d="M177 91L198 70"/><path class="arm-grip" d="M198 70l15 -2m-15 2l4 14m-4 -14l-10 -10"/></g></g></g><circle cx="120" cy="190" r="5" fill="#d1dfcb"/></svg></div>
   <div class="scada-column"><a class="scada-node magnetic" href="#capabilities"><i>04</i><span><strong>CAPABILITIES</strong><small>Skills & interests</small></span></a><a class="scada-node magnetic" href="#memories"><i>05</i><span><strong>MEMORIES</strong><small>Moments & milestones</small></span></a><a class="scada-node magnetic" href="#contact"><i>06</i><span><strong>CONTACT</strong><small>Open communication</small></span></a></div></div>
   <div class="scada-status"><span>SYSTEM NOMINAL</span><span>ARM / AUTO SWEEP</span><span>CLASSIC PORTFOLIO · 2026</span></div><button id="voice-open" class="card-download magnetic" type="button">ACTIVATE VOICE INTRO ↗</button></section>
   <section class="creative-grid" aria-label="Interactive portfolio experiences">
   <article class="creative-card creative-card--wide"><span class="creative-kicker">INTERACTIVE / 01 — PHYSICS</span><h3>Table tennis launch test</h3><p>Drag the ball backwards and release to launch it. It rebounds from the screen edges.</p><div class="tt-stage"><canvas id="tt-canvas" aria-label="Drag the ball backwards and release"></canvas></div><div class="tt-help"><span>DRAG BACK · RELEASE TO HIT</span><button id="tt-reset" type="button">RESET RALLY ↻</button><span>TOUCH + MOUSE</span></div></article>
   <article class="creative-card"><span class="creative-kicker">INTERACTIVE / 02 — PROJECTS</span><h3>Project disassembly</h3><p>Explore each project through its inputs, processing and outputs. Project-specific exploded views can be added as source assets become available.</p><details class="project-explode"><summary>OPEN SYSTEM BREAKDOWN</summary><div class="explode-parts"><div class="explode-part"><strong>01 / INPUT</strong><span>Sensors, signals, requirements and source data.</span></div><div class="explode-part"><strong>02 / PROCESS</strong><span>Control logic, software, design and integration.</span></div><div class="explode-part"><strong>03 / OUTPUT</strong><span>Actuation, interface, documentation and results.</span></div></div></details></article>
   <article class="creative-card"><span class="creative-kicker">INTERACTIVE / 03 — CONTACT</span><h3>Take my details with you.</h3><p>Save a contact card to your address book.</p><button id="download-vcard" class="card-download magnetic" type="button">DOWNLOAD CONTACT CARD (.VCF) ↓</button></article>
   <article class="creative-card creative-card--wide" id="memories"><span class="creative-kicker">CONTINUOUSLY GROWING / 04 — ARCHIVE</span><h3>Floating memories</h3><p>A growing collection of workshops, competitions and milestones. Add real photographs and captions over time.</p><div class="memory-wall"><div class="memory-slot"><span><b>MEMORY 001</b>Photo to be added</span></div><div class="memory-slot"><span><b>MEMORY 002</b>Photo to be added</span></div><div class="memory-slot"><span><b>MEMORY 003</b>Photo to be added</span></div></div></article>
   <article class="creative-card creative-card--wide" id="guestbook"><span class="creative-kicker">COMMUNITY / 05 — GUESTBOOK</span><h3>Leave a note.</h3><p>Messages are collected through Netlify Forms when form detection is enabled.</p><form class="guestbook-form" name="portfolio-guestbook" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/?guestbook=thanks"><input type="hidden" name="form-name" value="portfolio-guestbook"><p hidden><label>Leave empty <input name="bot-field"></label></p><label>YOUR NAME<input name="name" autocomplete="name" maxlength="80" required></label><label>WEBSITE / SOCIAL (OPTIONAL)<input name="website" type="url" placeholder="https://" maxlength="200"></label><label class="guestbook-message">YOUR MESSAGE<textarea name="message" maxlength="800" required></textarea></label><button type="submit">SIGN THE GUESTBOOK ↗</button></form><p class="guestbook-note">Please don't include private information. Messages are stored in the Netlify Forms dashboard; public display requires a separate moderation workflow.</p></article></section>
   <div class="voice-intro" id="voice-intro" role="dialog" aria-modal="true" aria-labelledby="voice-title"><div class="voice-intro__inner"><p class="eyebrow">VOICE CHANNEL / AF—01</p><h2 id="voice-title">Hello. I'm Afnnan.</h2><p>Welcome to my portfolio. Explore the work, the systems behind it, and the things I enjoy building.</p><div class="voice-intro__actions"><button class="primary" id="voice-listen" type="button">SAY HELLO</button><button id="voice-speak" type="button">PLAY SPOKEN INTRO</button><button id="voice-close" type="button">CLOSE</button></div><p id="voice-status" aria-live="polite"></p></div></div><div class="magnetic-cursor" aria-hidden="true"></div><p id="easter-egg" hidden style="position:fixed;right:18px;bottom:18px;z-index:900;background:#17231f;color:#e7eee4;padding:16px;font:11px monospace">SECRET FOUND · Curiosity is a feature, not a bug.</p>`;
  hero.after(host);
  host.insertAdjacentHTML('beforeend', `
   <section class="creative-grid bookshelf-section" aria-labelledby="bookshelf-title">
    <article class="creative-card creative-card--wide">
     <span class="creative-kicker">NAVIGATION / 06 — THE BOOKSHELF</span><h3 id="bookshelf-title">Pick a volume. Find a chapter.</h3>
     <p>Each book opens a different part of this portfolio.</p>
     <div class="book-shelf">
      <a class="shelf-book" href="#work"><span>01</span><b>Projects</b><small>Things I've built</small></a>
      <a class="shelf-book" href="#evidence"><span>02</span><b>Archive</b><small>Certificates & proof</small></a>
      <a class="shelf-book" href="#capabilities"><span>03</span><b>Skills</b><small>Tools & interests</small></a>
      <a class="shelf-book" href="#experience"><span>04</span><b>Experience</b><small>Roles & teams</small></a>
      <a class="shelf-book" href="#memories"><span>05</span><b>Memories</b><small>Moments over time</small></a>
      <a class="shelf-book" href="#contact"><span>06</span><b>Contact</b><small>Get in touch</small></a>
     </div>
    </article>
   </section>
   <section class="creative-grid hello-languages" aria-labelledby="hello-title">
    <article class="creative-card creative-card--wide">
     <span class="creative-kicker">INTRODUCTION / 07 — HELLO, WORLD</span><h3 id="hello-title">A hello, in more than one language.</h3>
     <div class="hello-grid"><div><b>HELLO</b><span>English</span></div><div><b>നമസ്കാരം</b><span>Malayalam</span></div><div><b>السلام عليكم</b><span>Arabic greeting</span></div></div>
     <p class="guestbook-note">Language list is editable in interactive.js; only keep languages you are comfortable speaking.</p>
    </article>
   </section>
   <section class="creative-grid rose-section" aria-label="Name reveal">
    <article class="creative-card creative-card--wide rose-card">
     <span class="creative-kicker">A SMALL SIGNATURE / 08</span>
     <button type="button" class="rose-trigger" id="rose-trigger">REVEAL SIGNATURE ✳</button>
     <div class="rose-reveal" id="rose-reveal" aria-live="polite">
      <svg viewBox="0 0 180 180" role="img" aria-label="A red rose blooming"><g class="rose-bloom"><path d="M90 88 C35 65 48 20 82 49 C82 4 132 15 111 57 C155 28 165 79 118 91 C155 119 112 148 91 111 C72 153 27 117 65 91 C25 73 54 42 90 88Z" fill="#a72e36"/><path d="M90 90 C66 72 82 49 98 62 C119 49 127 76 105 91 C121 106 96 123 84 101Z" fill="#d65b61"/><path d="M91 110 C96 137 79 151 82 169 M87 139 C60 128 56 139 50 147 M88 151 C111 131 123 141 129 151" fill="none" stroke="#456b4b" stroke-width="5" stroke-linecap="round"/></g></svg>
      <h3>Mohamed Afnnan</h3><p>VEETTILAYIL</p>
     </div>
    </article>
   </section>`);
 }
 // Full-screen hello -> rose -> name reveal on every fresh page load.
 const opening=document.createElement('div');
 opening.className='opening-intro';
 opening.setAttribute('role','status');
 opening.setAttribute('aria-label','Welcome');
 opening.innerHTML=`<div class="opening-inner">
  <p class="opening-overline">A PERSONAL PORTFOLIO</p>
  <div class="opening-hello" aria-live="polite"><span class="hello-word">HELLO</span></div>
  <svg class="opening-rose" viewBox="0 0 180 210" aria-hidden="true">
   <path class="opening-stem" d="M91 105 C93 142 84 165 91 194" fill="none" stroke="#6f8b60" stroke-width="4" stroke-linecap="round"/>
   <path class="opening-leaf" d="M89 158 C57 132 43 154 89 169Z" fill="#66875b"/>
   <g class="opening-petals">
    <path d="M90 91 C48 67 56 23 86 48 C85 8 133 18 111 57 C153 34 164 76 119 92 C151 120 112 146 91 111 C66 149 29 116 64 91 C28 71 54 42 90 91Z" fill="#a72e36"/>
    <path d="M90 91 C66 72 82 49 98 62 C119 49 127 76 105 91 C121 106 96 123 84 101Z" fill="#d65b61"/>
   </g>
  </svg>
  <h1 class="opening-name">Mohamed Afnnan</h1>
  <p class="opening-surname">VEETTILAYIL</p>
  <button class="opening-skip" type="button">SKIP INTRO ↗</button>
 </div>`;
 document.body.appendChild(opening);
 const hello=q('.hello-word',opening);
 const greetings=['HELLO','നമസ്കാരം','السلام عليكم'];
 let greetingIndex=0;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 greetings.forEach((word,index)=>{if(index===0)return;setTimeout(()=>{if(hello&&!opening.classList.contains('opening-exit')){hello.classList.add('hello-out');setTimeout(()=>{hello.textContent=word;hello.classList.remove('hello-out');},260);}},index*650);});
 const revealAt=reducedMotion?250:2100;
 const finishAt=reducedMotion?1100:4400;
 setTimeout(()=>opening.classList.add('opening-reveal'),revealAt);
 const dismiss=()=>{if(opening.classList.contains('opening-exit'))return;opening.classList.add('opening-exit');setTimeout(()=>opening.remove(),850);};
 const dismissTimer=setTimeout(dismiss,finishAt);
 q('.opening-skip',opening)?.addEventListener('click',()=>{clearTimeout(dismissTimer);dismiss();});

 const intro=q('#voice-intro');
 q('#voice-open')?.addEventListener('click',()=>intro?.classList.add('is-open'));
 q('#voice-close')?.addEventListener('click',()=>intro?.classList.remove('is-open'));
 q('#voice-listen')?.addEventListener('click',()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){q('#voice-status').textContent='Voice recognition is not supported here. Use Play Spoken Intro instead.';return;}const rec=new SR();rec.lang='en-IN';rec.interimResults=false;q('#voice-status').textContent='Listening… say hello.';rec.onresult=e=>{q('#voice-status').textContent='Voice detected: '+e.results[0][0].transcript+'. Welcome to the portfolio.';};rec.onerror=()=>q('#voice-status').textContent='Microphone unavailable or permission denied. You can still play the spoken introduction.';rec.start();});
 q('#voice-speak')?.addEventListener('click',()=>{if(!('speechSynthesis'in window)){q('#voice-status').textContent='Speech playback unavailable.';return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("Hello. I'm Mohamed Afnnan. Welcome to my portfolio.");u.rate=.92;u.onend=()=>q('#voice-status').textContent='Introduction complete.';speechSynthesis.speak(u);q('#voice-status').textContent='Playing spoken introduction…';});
 const cursor=q('.magnetic-cursor');
 if(cursor&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(pointer:fine)').matches){document.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.classList.add('is-visible');});document.addEventListener('pointerover',e=>cursor.classList.toggle('is-active',!!e.target.closest('.magnetic,a,button')));document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.08)+'px,'+((e.clientY-r.top-r.height/2)*.08)+'px)';});el.addEventListener('pointerleave',()=>el.style.transform='');});}
 let typed='';document.addEventListener('keydown',e=>{if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){typed=(typed+e.key.toLowerCase()).slice(-6);if(typed==='afnnan'){const n=q('#easter-egg');if(n)n.hidden=false;}}});
 const canvas=q('#tt-canvas');
 if(canvas){const ctx=canvas.getContext('2d');let w=300,h=250,ball={x:90,y:125,vx:0,vy:0,r:9},drag=null,score=0,active=false;const resize=()=>{const d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();w=r.width;canvas.width=Math.round(w*d);canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);ball.x=Math.min(90,w*.25);};new ResizeObserver(resize).observe(canvas);resize();
 const draw=()=>{ctx.clearRect(0,0,w,h);ctx.strokeStyle='#52685b';ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(w/2,10);ctx.lineTo(w/2,h-10);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#b7d6b1';ctx.font='10px monospace';ctx.fillText('RALLY '+score,14,20);if(active&&!drag){ball.x+=ball.vx;ball.y+=ball.vy;ball.vy+=.12;if(ball.x<ball.r||ball.x>w-ball.r){ball.vx*=-1;ball.x=Math.max(ball.r,Math.min(w-ball.r,ball.x));score++;}if(ball.y<ball.r||ball.y>h-ball.r){ball.vy*=-.92;ball.y=Math.max(ball.r,Math.min(h-ball.r,ball.y));}ball.vx*=.999;if(Math.abs(ball.vx)<.12&&Math.abs(ball.vy)<.12)active=false;}ctx.fillStyle='#e5efe0';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();const px=drag?drag.x:ball.x-40,py=drag?drag.y:ball.y;ctx.save();ctx.translate(px,py);ctx.rotate(-.45);ctx.fillStyle='#d3a47d';ctx.fillRect(-6,-35,12,43);ctx.fillStyle='#b55e45';ctx.beginPath();ctx.arc(0,-42,23,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f2d8bd';ctx.stroke();ctx.restore();if(drag){ctx.strokeStyle='#b7d6b1';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(drag.x,drag.y);ctx.lineTo(drag.sx,drag.sy);ctx.stroke();ctx.setLineDash([]);}requestAnimationFrame(draw);};draw();const pos=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};canvas.addEventListener('pointerdown',e=>{const p=pos(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<38||Math.hypot(p.x-ball.x+40,p.y-ball.y)<55){drag={...p,sx:ball.x,sy:ball.y};canvas.setPointerCapture(e.pointerId);active=false;}});canvas.addEventListener('pointermove',e=>{if(drag){const p=pos(e);drag.x=p.x;drag.y=p.y;}});canvas.addEventListener('pointerup',()=>{if(!drag)return;ball.x=drag.sx;ball.y=drag.sy;ball.vx=Math.max(-18,Math.min(18,(drag.sx-drag.x)*.16));ball.vy=Math.max(-18,Math.min(18,(drag.sy-drag.y)*.16));active=true;drag=null;});q('#tt-reset')?.addEventListener('click',()=>{ball={x:Math.min(90,w*.25),y:h/2,vx:0,vy:0,r:9};score=0;active=false;});}
 q('#rose-trigger')?.addEventListener('click',()=>q('#rose-reveal')?.classList.toggle('is-visible'));
 q('#download-vcard')?.addEventListener('click',()=>{const v='BEGIN:VCARD\nVERSION:3.0\nFN:Mohamed Afnnan Veettilayil\nEMAIL:afnnan.dev@gmail.com\nURL:https://www.linkedin.com/in/mohamedafnnan/\nEND:VCARD';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([v],{type:'text/vcard'}));a.download='Mohamed-Afnnan.vcf';a.click();URL.revokeObjectURL(a.href);});
})();