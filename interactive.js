(() => {
 const q=(s,r=document)=>r.querySelector(s);
 const hero=q('.hero'), signal=q('.signal-strip');
 if(hero&&signal){
  const host=document.createElement('div');
  host.innerHTML=`
   <section class="scada-section" id="control-room"><div class="scada-head"><div><p class="eyebrow">INTERACTIVE SYSTEM / 00</p><h2>AFNNAN CONTROL<br>INTERFACE<span style="color:#a9c59f">.</span></h2></div><p>A control-room inspired index for the classic portfolio. Select a circuit node to jump to a section. The central arm is an animated interface element.</p></div>
   <div class="scada-console"><div class="scada-column">
   <a class="scada-node magnetic" href="#work"><i>01</i><span><strong>PROJECTS</strong><small>Selected work & builds</small></span></a><a class="scada-node magnetic" href="#evidence"><i>02</i><span><strong>ARCHIVE</strong><small>Certificates & evidence</small></span></a><a class="scada-node magnetic" href="#experience"><i>03</i><span><strong>EXPERIENCE</strong><small>Roles & responsibility</small></span></a></div>
   <div class="scada-arm-stage" id="arm-stage">
    <div class="arm-stage-top"><span>6-AXIS / PLANAR DEMO</span><span class="arm-live-dot">LIVE</span></div>
    <svg class="arm-svg" viewBox="0 0 240 230" role="img" aria-label="Interactive articulated robotic arm. It moves between a pickup tray and a delivery point.">
     <defs><linearGradient id="armMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e1eadb"/><stop offset=".5" stop-color="#91a891"/><stop offset="1" stop-color="#526e5d"/></linearGradient><linearGradient id="armPayload" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2c47d"/><stop offset="1" stop-color="#b87a45"/></linearGradient></defs>
     <path class="arm-floor-line" d="M12 215H228"/>
     <path class="arm-tray" d="M151 157h64l-7 18h-50z"/><path class="arm-tray" d="M178 175v5m20-5v5"/>
     <path class="arm-tray arm-tray--drop" d="M183 112h43l-5 14h-33z"/><path class="arm-tray arm-tray--drop" d="M191 126v5m26-5v5"/>
     <text class="arm-svg-label" x="182" y="194">INPUT</text><text class="arm-svg-label" x="185" y="106">OUTPUT</text>
     <circle class="arm-target-ring" cx="185" cy="140" r="12"/>
     <g class="arm-pick-payload" id="arm-pick-payload" transform="translate(185 140)"><path d="M-7 -6l7 -4 7 4v9l-7 4-7 -4z" fill="url(#armPayload)" stroke="#f7d7a0" stroke-width="1.2"/><path d="M0 -10v9m-7 -5l7 5 7 -5" fill="none" stroke="#8b5b34" stroke-width="1"/></g>
     <g class="arm-carry-payload" id="arm-carry-payload" opacity="0"><path d="M-7 -6l7 -4 7 4v9l-7 4-7 -4z" fill="url(#armPayload)" stroke="#f7d7a0" stroke-width="1.2"/><path d="M0 -10v9m-7 -5l7 5 7 -5" fill="none" stroke="#8b5b34" stroke-width="1"/></g>
     <g class="arm-drop-payload" id="arm-drop-payload" transform="translate(205 100)" opacity="0"><path d="M-7 -6l7 -4 7 4v9l-7 4-7 -4z" fill="url(#armPayload)" stroke="#f7d7a0" stroke-width="1.2"/><path d="M0 -10v9m-7 -5l7 5 7 -5" fill="none" stroke="#8b5b34" stroke-width="1"/></g>
     <path class="arm-base-shadow" d="M79 205h82l-8 10H87z"/><path class="arm-base" d="M82 202h76l-9 13H91z"/><path class="arm-base" d="M101 187h38v15h-38z"/>
     <g class="scada-arm" id="arm-base-joint"><path class="arm-segment arm-link-base" d="M120 190L120 148"/><circle class="arm-joint" cx="120" cy="148" r="12"/>
      <g class="arm-upper" id="arm-shoulder"><path class="arm-segment" d="M120 148L177 91"/><path class="arm-link-highlight" d="M126 142L171 97"/><circle class="arm-joint" cx="177" cy="91" r="11"/>
       <g class="arm-grip-group" id="arm-elbow"><path class="arm-segment" d="M177 91L198 70"/><path class="arm-link-highlight" d="M182 86L194 74"/><circle class="arm-wrist" cx="198" cy="70" r="6"/><path class="arm-grip-palm" d="M198 70l3 4"/>
        <g class="arm-jaw arm-jaw-left" id="arm-jaw-left"><path d="M198 70l16 -2"/></g><g class="arm-jaw arm-jaw-right" id="arm-jaw-right"><path d="M198 70l7 15"/></g>
       </g>
      </g>
     </g>
     <circle cx="120" cy="190" r="5" fill="#d1dfcb"/>
    </svg>
    <div class="arm-control-bar"><span id="arm-state" aria-live="polite">AUTO · PICK CYCLE</span><button type="button" id="arm-run-cycle">RUN PICK CYCLE ↻</button><button type="button" id="arm-track-toggle" aria-pressed="false">TRACK POINTER</button><button type="button" id="arm-pause" aria-pressed="false">PAUSE</button></div>
   </div>
   <div class="scada-column"><a class="scada-node magnetic" href="#capabilities"><i>04</i><span><strong>CAPABILITIES</strong><small>Skills & interests</small></span></a><a class="scada-node magnetic" href="#memories"><i>05</i><span><strong>MEMORIES</strong><small>Moments & milestones</small></span></a><a class="scada-node magnetic" href="#contact"><i>06</i><span><strong>CONTACT</strong><small>Open communication</small></span></a></div></div>
   <div class="scada-status"><span>SYSTEM NOMINAL</span><span>ARM / AUTO SWEEP</span><span>CLASSIC PORTFOLIO · 2026</span></div><button id="voice-open" class="card-download magnetic" type="button">ACTIVATE VOICE INTRO ↗</button></section>
   <section class="creative-grid" aria-label="Interactive portfolio experiences">
   <article class="creative-card creative-card--wide"><span class="creative-kicker">INTERACTIVE / 01 — PHYSICS</span><h3>Table tennis launch test</h3><p>Pull the racket backwards and release. The ball follows a simple gravity-and-bounce model across the table.</p><div class="tt-stage"><canvas id="tt-canvas" aria-label="Drag the ball backwards and release"></canvas></div><div class="tt-help"><span>DRAG RACKET BACK · RELEASE TO LAUNCH</span><button id="tt-reset" type="button">RESET RALLY ↻</button><span>TOUCH + MOUSE</span></div></article>
   <article class="creative-card"><span class="creative-kicker">INTERACTIVE / 02 — PROJECTS</span><h3>Take a project apart.</h3><p>Open any project below for its documented inputs, process, outputs and evidence gaps. No undocumented hardware or results are invented.</p><a class="card-download" href="#work">OPEN PROJECT FILES ↗</a></article>
   <article class="creative-card"><span class="creative-kicker">INTERACTIVE / 03 — CONTACT</span><h3>A card worth keeping.</h3><p>Flip the card to see the reverse. Download a contact file or a printable vector business card.</p><div class="business-card-scene" id="business-card" role="button" tabindex="0" aria-label="Flip business card" aria-pressed="false"><div class="business-card-inner"><div class="business-card-face business-card-front"><span class="bc-monogram">AF<span>—</span></span><strong>MOHAMED AFNNAN</strong><small>VEETTILAYIL</small><i>EIE UNDERGRADUATE · FISAT</i><em>KERALA, INDIA</em></div><div class="business-card-face business-card-back"><span>CONTACT / 01</span><strong>Let’s build something useful.</strong><small>afnnan.dev@gmail.com</small><small>linkedin.com/in/mohamedafnnan</small><i>ENGINEERING · SYSTEMS · COMMUNICATION</i></div></div></div><div class="business-card-actions"><button id="business-card-flip" class="card-download" type="button">FLIP CARD ↻</button><button id="download-vcard" class="card-download magnetic" type="button">DOWNLOAD VCARD ↓</button><button id="download-business-card" class="card-download" type="button">DOWNLOAD BUSINESS CARD SVG ↓</button></div></article>
   <article class="creative-card creative-card--wide" id="memories"><span class="creative-kicker">CONTINUOUSLY GROWING / 04 — ARCHIVE</span><h3>Floating memories.</h3><p>Add photographs from workshops, competitions, builds and milestones. Your gallery is saved privately in this browser on this device.</p><form class="memory-add-form" id="memory-add-form"><label>PHOTO<input name="photo" type="file" accept="image/*" required></label><label>CAPTION<input name="caption" maxlength="90" placeholder="What happened?" required></label><label>DATE<input name="date" type="date"></label><label>CATEGORY<select name="category"><option>Engineering</option><option>Competition</option><option>Workshop</option><option>People</option><option>Personal</option></select></label><button type="submit">ADD TO MEMORY WALL +</button><p id="memory-status" class="memory-status" aria-live="polite">Images are stored on this device only; they are not uploaded to a server.</p></form><div class="memory-wall" id="memory-wall"><div class="memory-slot"><span><b>YOUR ARCHIVE</b>Add the first photograph above.</span></div></div></article>
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
     <span class="creative-kicker">INTRODUCTION / 07 — HELLO, WORLD</span><h3 id="hello-title">One greeting. Three languages. One welcome.</h3>
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
 // Staged opening: greeting changes first, then rose, then the name signature.
 const opening=q('.opening-intro');
 if(opening){
  const hello=q('.hello-word',opening);
  const greetings=['HELLO','നമസ്കാരം','السلام عليكم'];
  const swapGreeting=(word)=>{
   if(!hello||opening.classList.contains('opening-exit'))return;
   hello.classList.add('hello-out');
   setTimeout(()=>{if(!opening.classList.contains('opening-exit')){hello.textContent=word;hello.classList.remove('hello-out');}},260);
  };
  setTimeout(()=>swapGreeting(greetings[1]),1150);
  setTimeout(()=>swapGreeting(greetings[2]),2300);
  setTimeout(()=>opening.classList.add('opening-reveal'),3450);
  setTimeout(()=>opening.classList.add('opening-name-reveal'),4650);
  setTimeout(()=>opening.classList.add('opening-surname-reveal'),5100);
  const dismiss=()=>{if(opening.classList.contains('opening-exit'))return;opening.classList.add('opening-exit');setTimeout(()=>opening.remove(),850);};
  const dismissTimer=setTimeout(dismiss,7600);
  q('.opening-skip',opening)?.addEventListener('click',()=>{clearTimeout(dismissTimer);dismiss();});
 }

 // Project disassembly: facts are drawn from the existing project copy; unknowns stay explicit.
 const projectBreakdowns=[
  {match:'DAWN / Rover team',input:'Rover platform, mission context and team control requirements.',process:'Controls-team participation is documented. Personal controller code, algorithms and subsystem ownership are not specified in the supplied portfolio.',output:'A team rover experience. No unverified personal hardware or performance claim is made.'},
  {match:'METRON Vol. IX',input:'Department editorial material, articles and publication requirements.',process:'Designed a reusable A4 print layout from scratch using HTML and CSS, including typography, page furniture and print styling.',output:'A completed 17-page department annual, available as a PDF in the evidence archive.'},
  {match:'Instrumentation101',input:'Instrumentation topics and independent research.',process:'Technical blog writing while developing subject understanding; individual article samples were not supplied.',output:'An ongoing technical-writing project. Public article links are not yet available.'},
  {match:'School EVM project',input:'A school-use electronic voting machine brief.',process:'Team-built project with Atal Tinkering Lab sponsorship. Circuit, firmware and component details were not supplied.',output:'Completed school team project; principal appreciation is listed, but the letter and demo are not available.'},
  {match:'Hairpin Bend Traffic System',input:'A traffic-management problem context. Exact sensors and signals were not documented.',process:'IDEA Lab project-team involvement with an IoT Specialist role listed. Architecture and personal implementation details remain unverified.',output:'A team project entry; prototype status and measured results were not supplied.'},
  {match:'Navodhayam',input:'2025 cutoff-rank information and current-student branch contacts.',process:'A helpdesk organized across engineering branches with 14 student volunteers.',output:'Admission guidance and direct student context for aspirants; the project page links to its public Instagram.'}
 ];
 document.querySelectorAll('.project').forEach(card=>{
  const title=q('h3',card)?.textContent?.trim();
  const data=projectBreakdowns.find(item=>item.match===title);
  if(!data||q('.project-disassembly',card))return;
  const details=document.createElement('details');details.className='project-disassembly';
  const summary=document.createElement('summary');summary.textContent='DISASSEMBLE THIS PROJECT';details.append(summary);
  const grid=document.createElement('div');grid.className='disassembly-grid';
  [['01 / INPUT',data.input],['02 / PROCESS',data.process],['03 / OUTPUT',data.output]].forEach(([heading,body])=>{
   const part=document.createElement('div');part.className='disassembly-part';
   const h=document.createElement('strong');h.textContent=heading;
   const p=document.createElement('p');p.textContent=body;part.append(h,p);grid.append(part);
  });
  details.append(grid);q('.project__body',card)?.append(details);
 });
 // Certificate museum controls: search, filter and live result count.
 const credentialList=q('.credential-list');
 if(credentialList){
  const controls=document.createElement('div');controls.className='credential-controls';
  controls.innerHTML='<label class="credential-search">SEARCH THE COLLECTION<input id="credential-search" type="search" placeholder="Certificate, course or award…"></label><div class="credential-filters" role="group" aria-label="Filter credentials"><button type="button" data-filter="all" aria-pressed="true">ALL</button><button type="button" data-filter="certificate" aria-pressed="false">CERTIFICATES</button><button type="button" data-filter="award" aria-pressed="false">AWARDS</button><button type="button" data-filter="profile" aria-pressed="false">PROFILE-LISTED</button></div><span id="credential-count" aria-live="polite"></span>';
  credentialList.before(controls);
  const entries=[...credentialList.children];
  entries.forEach((entry,index)=>{
   const label=entry.textContent.toLowerCase();
   const category=entry.classList.contains('credential-list__unlinked')?'profile':/prize|award|ideathon/.test(label)?'award':'certificate';
   entry.dataset.category=category;entry.dataset.search=label;entry.dataset.index=String(index+1);
  });
  let activeFilter='all';
  const search=q('#credential-search',controls),count=q('#credential-count',controls);
  const apply=()=>{
   const term=search.value.trim().toLowerCase();let visible=0;
   entries.forEach(entry=>{const show=(activeFilter==='all'||entry.dataset.category===activeFilter)&&entry.dataset.search.includes(term);entry.hidden=!show;if(show)visible++;});
   count.textContent=visible+' / '+entries.length+' records';
  };
  search.addEventListener('input',apply);
  controls.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
   activeFilter=button.dataset.filter;
   controls.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   apply();
  }));
  apply();
 }
 // Articulated arm controller. Explicit SVG transforms avoid CSS SVG-origin inconsistencies.
 const armStage=q('#arm-stage'),armSvg=q('.arm-svg',armStage||document);
 if(armStage&&armSvg){
  const base=q('#arm-base-joint',armSvg),shoulder=q('#arm-shoulder',armSvg),elbow=q('#arm-elbow',armSvg);
  const jawLeft=q('#arm-jaw-left',armSvg),jawRight=q('#arm-jaw-right',armSvg);
  const pick=q('#arm-pick-payload',armSvg),carry=q('#arm-carry-payload',armSvg),drop=q('#arm-drop-payload',armSvg);
  const targetRing=q('.arm-target-ring',armSvg),state=q('#arm-state'),run=q('#arm-run-cycle'),track=q('#arm-track-toggle'),pause=q('#arm-pause');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L1=Math.hypot(57,57),L2=Math.hypot(32,15),upperRest=-Math.PI/4,elbowRest=Math.atan2(15,32)-upperRest;
  const home={x:210,y:76},pickup={x:185,y:140},delivery={x:205,y:100};
  const frames=[{t:0,p:home,grip:1,carry:false,label:'AUTO · READY'},{t:1.75,p:pickup,grip:1,carry:false,label:'APPROACHING INPUT'},{t:2.15,p:pickup,grip:0,carry:true,label:'GRIPPING PAYLOAD'},{t:3.55,p:delivery,grip:0,carry:true,label:'TRANSFER IN PROGRESS'},{t:4,p:delivery,grip:1,carry:false,label:'PAYLOAD RELEASED'},{t:5.35,p:home,grip:1,carry:false,label:'RETURNING TO HOME'},{t:7.4,p:home,grip:1,carry:false,label:'AUTO · READY'}];
  let mode='auto',paused=false,cycleStart=performance.now(),manualTarget={...home},lastFrame=0,displayTarget={...home};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t*t*(3-2*t);
  const mix=(a,b,t)=>a+(b-a)*t;
  const pointForTime=t=>{
   let i=0;while(i<frames.length-2&&t>frames[i+1].t)i++;
   const a=frames[i],b=frames[i+1],u=clamp((t-a.t)/(b.t-a.t),0,1),e=ease(u);
   return {x:mix(a.p.x,b.p.x,e),y:mix(a.p.y,b.p.y,e),grip:t<2.15||t>=4?1:0,carrying:t>=2.15&&t<4,delivered:t>=4&&t<7.4,label:b.label};
  };
  const svgPoint=e=>{
   const p=armSvg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
   const ctm=armSvg.getScreenCTM();if(!ctm)return home;
   const local=p.matrixTransform(ctm.inverse());return{x:clamp(local.x,48,225),y:clamp(local.y,55,175)};
  };
  const solve=point=>{
   const dx=point.x-120,dy=point.y-148,d=clamp(Math.hypot(dx,dy),Math.abs(L1-L2)+1,L1+L2-1);
   const cos=clamp((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1),theta2=Math.acos(cos);
   const theta1=Math.atan2(dy,dx)-Math.atan2(L2*Math.sin(theta2),L1+L2*Math.cos(theta2));
   const shoulderDelta=(theta1-upperRest)*180/Math.PI,elbowDelta=(theta2-elbowRest)*180/Math.PI;
   base?.setAttribute('transform','rotate(0 120 190)');
   shoulder?.setAttribute('transform',`rotate(${shoulderDelta.toFixed(2)} 120 148)`);
   elbow?.setAttribute('transform',`rotate(${elbowDelta.toFixed(2)} 177 91)`);
  };
  const setPayload=(point,gripping,carrying,delivered)=>{
   pick?.setAttribute('opacity',gripping||carrying||delivered?'0':'1');
   carry?.setAttribute('opacity',carrying?'1':'0');
   drop?.setAttribute('opacity',delivered?'1':'0');
   pick?.setAttribute('transform',`translate(${pickup.x} ${pickup.y})`);
   carry?.setAttribute('transform',`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
   drop?.setAttribute('transform',`translate(${delivery.x} ${delivery.y})`);
  };
  const paint=(point,grip,carrying,label,delivered=false)=>{
   displayTarget.x=mix(displayTarget.x,point.x,reduced?0.09:0.18);displayTarget.y=mix(displayTarget.y,point.y,reduced?0.09:0.18);
   solve(displayTarget);
   const open=grip?17:1;
   jawLeft?.setAttribute('transform',`rotate(${open} 198 70)`);
   jawRight?.setAttribute('transform',`rotate(${-open} 198 70)`);
   targetRing?.setAttribute('cx',point.x);targetRing?.setAttribute('cy',point.y);
   setPayload(point,grip===0,carrying,delivered);
   if(state&&label)state.textContent=mode==='track'?'MANUAL · TRACKING TARGET':paused?'PAUSED · HOLDING POSITION':label;
  };
  const loop=now=>{
   if(!paused){
    if(mode==='auto'){
     const elapsed=((now-cycleStart)/1000)%7.5,phase=pointForTime(elapsed);
     if(elapsed<.08){pick?.setAttribute('opacity','1');drop?.setAttribute('opacity','0');}
     paint(phase,phase.grip,phase.carrying,phase.label,phase.delivered);
    }else paint(manualTarget,1,false,'MANUAL · TRACKING TARGET',false);
   }
   lastFrame=now;requestAnimationFrame(loop);
  };
  armStage.addEventListener('pointermove',e=>{if(mode==='track'&&!paused){manualTarget=svgPoint(e);}});
  armStage.addEventListener('pointerdown',e=>{if(mode==='track'){manualTarget=svgPoint(e);}});
  run?.addEventListener('click',()=>{mode='auto';paused=false;cycleStart=performance.now();track?.setAttribute('aria-pressed','false');pause?.setAttribute('aria-pressed','false');pause.textContent='PAUSE';});
  track?.addEventListener('click',()=>{mode=mode==='track'?'auto':'track';if(mode==='auto')cycleStart=performance.now();track.setAttribute('aria-pressed',String(mode==='track'));track.textContent=mode==='track'?'EXIT TRACK':'TRACK POINTER';});
  pause?.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'RESUME':'PAUSE';});
  armStage.addEventListener('dblclick',()=>{mode='auto';paused=false;cycleStart=performance.now();});
  requestAnimationFrame(loop);
 }
 // Local-first memory gallery. IndexedDB stores photos on this browser only.
 const memoryForm=q('#memory-add-form'),memoryWall=q('#memory-wall'),memoryStatus=q('#memory-status');
 if(memoryForm&&memoryWall){
  const DB='afnnan-portfolio-memory',STORE='photos';let memoryDb=null;
  const openDb=()=>new Promise((resolve,reject)=>{
   if(!('indexedDB'in window)){reject(new Error('This browser does not support local photo storage.'));return;}
   const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});};
   req.onsuccess=()=>{memoryDb=req.result;resolve(memoryDb);};req.onerror=()=>reject(req.error);
  });
  const transact=(mode,fn)=>new Promise((resolve,reject)=>{const tx=memoryDb.transaction(STORE,mode),store=tx.objectStore(STORE);fn(store,resolve,reject);tx.onerror=()=>reject(tx.error);});
  const save=record=>transact('readwrite',(store,resolve)=>{store.put(record);resolve();});
  const remove=id=>transact('readwrite',(store,resolve)=>{store.delete(id);resolve();});
  const all=()=>new Promise((resolve,reject)=>{const req=memoryDb.transaction(STORE,'readonly').objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
  const makeCard=record=>{
   const card=document.createElement('article');card.className='memory-card';
   const img=document.createElement('img');img.src=record.data;img.alt=record.caption;img.loading='lazy';
   const body=document.createElement('div');body.className='memory-card__body';
   const meta=document.createElement('span');meta.textContent=(record.category||'MEMORY').toUpperCase()+(record.date?' · '+record.date:'');
   const title=document.createElement('h4');title.textContent=record.caption;
   const del=document.createElement('button');del.type='button';del.textContent='REMOVE';del.setAttribute('aria-label','Remove memory '+record.caption);
   del.addEventListener('click',async()=>{await remove(record.id);card.remove();if(!memoryWall.children.length)memoryWall.innerHTML='<div class="memory-slot"><span><b>YOUR ARCHIVE</b>Add another photograph above.</span></div>';});
   body.append(meta,title,del);card.append(img,body);return card;
  };
  const render=async()=>{try{const records=await all();memoryWall.replaceChildren();records.sort((a,b)=>(b.created||0)-(a.created||0)).forEach(r=>memoryWall.append(makeCard(r)));if(!records.length)memoryWall.innerHTML='<div class="memory-slot"><span><b>YOUR ARCHIVE</b>Add the first photograph above.</span></div>';}catch(e){if(memoryStatus)memoryStatus.textContent=e.message;}};
  openDb().then(render).catch(e=>{if(memoryStatus)memoryStatus.textContent=e.message;});
  memoryForm.addEventListener('submit',async e=>{
   e.preventDefault();const fd=new FormData(memoryForm),file=fd.get('photo');
   if(!(file instanceof File)||!file.type.startsWith('image/')){memoryStatus.textContent='Choose an image file.';return;}
   if(file.size>2*1024*1024){memoryStatus.textContent='Keep each image under 2 MB.';return;}
   memoryStatus.textContent='Saving photo on this device…';
   try{if(!memoryDb)await openDb();const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
    await save({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),caption:String(fd.get('caption')).slice(0,90),date:String(fd.get('date')||''),category:String(fd.get('category')||'Personal'),data,created:Date.now()});
    memoryForm.reset();await render();memoryStatus.textContent='Saved locally. This photograph has not been uploaded.'; 
   }catch(err){memoryStatus.textContent='Could not save this image: '+err.message;}
  });
 }
 // Business card flip and downloadable assets.
 const businessCard=q('#business-card'),flip=q('#business-card-flip');
 const flipCard=()=>{const on=businessCard.classList.toggle('is-flipped');businessCard.setAttribute('aria-pressed',String(on));};
 businessCard?.addEventListener('click',flipCard);businessCard?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flipCard();}});
 flip?.addEventListener('click',()=>flipCard());
 const contactVcard='BEGIN:VCARD\nVERSION:3.0\nFN:Mohamed Afnnan Veettilayil\nEMAIL:afnnan.dev@gmail.com\nURL:https://www.linkedin.com/in/mohamedafnnan/\nEND:VCARD';
 const downloadBlob=(content,type,name)=>{const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 q('#download-vcard')?.addEventListener('click',()=>downloadBlob(contactVcard,'text/vcard;charset=utf-8','Mohamed-Afnnan.vcf'));
 q('#download-business-card')?.addEventListener('click',()=>{const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="600" viewBox="0 0 1050 600"><rect width="1050" height="600" rx="34" fill="#17231f"/><circle cx="830" cy="170" r="260" fill="none" stroke="#a9c59f" stroke-opacity=".22" stroke-width="2"/><circle cx="830" cy="170" r="190" fill="none" stroke="#a9c59f" stroke-opacity=".16" stroke-width="2"/><text x="72" y="100" fill="#b7d6b1" font-family="Arial" font-size="28" letter-spacing="8">AF — VEETTILAYIL</text><text x="72" y="285" fill="#f4f1e8" font-family="Arial" font-size="70" font-weight="600">MOHAMED AFNNAN</text><text x="76" y="345" fill="#b7d6b1" font-family="Arial" font-size="28" letter-spacing="9">EIE UNDERGRADUATE · FISAT</text><text x="76" y="470" fill="#f4f1e8" font-family="Arial" font-size="27">afnnan.dev@gmail.com</text><text x="76" y="520" fill="#f4f1e8" font-family="Arial" font-size="24">linkedin.com/in/mohamedafnnan</text></svg>';downloadBlob(svg,'image/svg+xml','Mohamed-Afnnan-Business-Card.svg');});

 const intro=q('#voice-intro');
 q('#voice-open')?.addEventListener('click',()=>intro?.classList.add('is-open'));
 q('#voice-close')?.addEventListener('click',()=>intro?.classList.remove('is-open'));
 q('#voice-listen')?.addEventListener('click',()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){q('#voice-status').textContent='Voice recognition is not supported here. Use Play Spoken Intro instead.';return;}const rec=new SR();rec.lang='en-IN';rec.interimResults=false;q('#voice-status').textContent='Listening… say hello.';rec.onresult=e=>{q('#voice-status').textContent='Voice detected: '+e.results[0][0].transcript+'. Welcome to the portfolio.';};rec.onerror=()=>q('#voice-status').textContent='Microphone unavailable or permission denied. You can still play the spoken introduction.';rec.start();});
 q('#voice-speak')?.addEventListener('click',()=>{if(!('speechSynthesis'in window)){q('#voice-status').textContent='Speech playback unavailable.';return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("Hello. I'm Mohamed Afnnan. Welcome to my portfolio.");u.rate=.92;u.onend=()=>q('#voice-status').textContent='Introduction complete.';speechSynthesis.speak(u);q('#voice-status').textContent='Playing spoken introduction…';});
 const cursor=q('.magnetic-cursor');
 if(cursor&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let mx=0,my=0,cx=0,cy=0,raf=false;
  document.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;cursor.classList.add('is-visible');if(!raf){raf=true;requestAnimationFrame(function follow(){cx+=(mx-cx)*.24;cy+=(my-cy)*.24;cursor.style.left=cx+'px';cursor.style.top=cy+'px';if(Math.abs(mx-cx)+Math.abs(my-cy)>.2)requestAnimationFrame(follow);else raf=false;});}});
  document.addEventListener('pointerover',e=>cursor.classList.toggle('is-active',!!e.target.closest('.magnetic,a,button,[role="button"]')));
  document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mag-x',((e.clientX-r.left-r.width/2)*.12)+'px');el.style.setProperty('--mag-y',((e.clientY-r.top-r.height/2)*.12)+'px');});el.addEventListener('pointerleave',()=>{el.style.removeProperty('--mag-x');el.style.removeProperty('--mag-y');});});
 }
 let typed='';const secret=q('#easter-egg');const revealSecret=message=>{if(!secret)return;secret.textContent=message;secret.hidden=false;secret.classList.add('is-visible');clearTimeout(revealSecret.timer);revealSecret.timer=setTimeout(()=>secret.classList.remove('is-visible'),5200);};const sequences={afnnan:'SECRET FOUND · You found the signature.',dawn:'DAWN PROTOCOL · Rover systems nominal.',rose:'A ROSE FOR THE CURIOUS · Keep looking.'};document.addEventListener('keydown',e=>{if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){typed=(typed+e.key.toLowerCase()).slice(-6);Object.entries(sequences).forEach(([code,message])=>{if(typed.endsWith(code))revealSecret(message);});}});const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let konamiIndex=0;document.addEventListener('keydown',e=>{konamiIndex=e.key===konami[konamiIndex]?konamiIndex+1:e.key===konami[0]?1:0;if(konamiIndex===konami.length){konamiIndex=0;revealSecret('KONAMI · You found the hidden control channel.');}});let footerTaps=0;q('.footer-mark')?.addEventListener('click',e=>{footerTaps++;if(footerTaps>=7){e.preventDefault();footerTaps=0;revealSecret('AF—01 · The seventh click was the key.');}});
 const canvas=q('#tt-canvas');
 if(canvas){
  const ctx=canvas.getContext('2d');let w=320,h=250,dpr=1,ball={x:92,y:145,vx:0,vy:0,r:8},drag=null,score=0,active=false,tableY=207;
  const resize=()=>{const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=Math.max(260,r.width);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);tableY=h-38;if(!active&&!drag){ball.x=w*.28;ball.y=tableY-48;}};
  new ResizeObserver(resize).observe(canvas);resize();
  const tclamp=(v,a,b)=>Math.max(a,Math.min(b,v));const pos=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  const reset=()=>{ball={x:w*.28,y:tableY-48,vx:0,vy:0,r:8};drag=null;active=false;score=0;};
  const draw=()=>{
   ctx.clearRect(0,0,w,h);
   ctx.fillStyle='#17231f';ctx.fillRect(0,0,w,h);
   ctx.strokeStyle='#52685b';ctx.lineWidth=1;ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(w/2,18);ctx.lineTo(w/2,tableY);ctx.stroke();ctx.setLineDash([]);
   ctx.strokeStyle='#b7d6b1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,tableY);ctx.lineTo(w-12,tableY);ctx.stroke();
   ctx.fillStyle='#b7d6b1';ctx.font='10px monospace';ctx.fillText('RALLY '+score,14,18);ctx.fillText(active?'BALL IN PLAY':'SLINGSHOT READY',w-130,18);
   if(active&&!drag){
    ball.x+=ball.vx;ball.y+=ball.vy;ball.vy+=.19;ball.vx*=.999;
    if(ball.x<ball.r||ball.x>w-ball.r){ball.vx*=-.82;ball.x=tclamp(ball.x,ball.r,w-ball.r);}
    if(ball.y<ball.r){ball.y=ball.r;ball.vy=Math.abs(ball.vy)*.82;}
    if(ball.y+ball.r>=tableY){ball.y=tableY-ball.r;ball.vy=-Math.abs(ball.vy)*.76;score++;if(Math.abs(ball.vy)<1.1&&Math.abs(ball.vx)<1.1)active=false;}
    if(ball.x>w+30||ball.x< -30||ball.y>h+30)active=false;
   }
   // Slingshot racket: drag it backwards, then release to launch the ball.
   const racket=drag?drag.current:{x:ball.x-36,y:ball.y+12};
   ctx.save();ctx.translate(racket.x,racket.y);ctx.rotate(-.45);ctx.fillStyle='#d3a47d';ctx.fillRect(-5,-30,10,38);ctx.fillStyle='#b55e45';ctx.beginPath();ctx.ellipse(0,-39,19,24,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f2d8bd';ctx.lineWidth=2;ctx.stroke();ctx.restore();
   if(drag){ctx.strokeStyle='#b7d6b1';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(drag.origin.x,drag.origin.y);ctx.lineTo(drag.current.x,drag.current.y);ctx.stroke();ctx.setLineDash([]);}
   ctx.fillStyle='#e5efe0';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8ca58f';ctx.stroke();
   if(!active&&!drag){ctx.fillStyle='#aab9ab';ctx.font='10px monospace';ctx.fillText('DRAG THE RACKET BACK',w*.35,h*.46);}
   requestAnimationFrame(draw);
  };draw();
  canvas.addEventListener('pointerdown',e=>{if(active)return;const p=pos(e);if(Math.hypot(p.x-(ball.x-36),p.y-(ball.y-27))<54||Math.hypot(p.x-ball.x,p.y-ball.y)<36){drag={origin:{x:ball.x-36,y:ball.y+12},current:p};canvas.setPointerCapture(e.pointerId);}});
  canvas.addEventListener('pointermove',e=>{if(drag)drag.current=pos(e);});
  canvas.addEventListener('pointerup',()=>{if(!drag)return;ball.vx=tclamp((drag.origin.x-drag.current.x)*.17,-16,16);ball.vy=tclamp((drag.origin.y-drag.current.y)*.17,-18,18);active=true;drag=null;});
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  q('#tt-reset')?.addEventListener('click',reset);
 } q('#rose-trigger')?.addEventListener('click',()=>q('#rose-reveal')?.classList.toggle('is-visible'));
 q('#download-vcard')?.addEventListener('click',()=>{const v='BEGIN:VCARD\nVERSION:3.0\nFN:Mohamed Afnnan Veettilayil\nEMAIL:afnnan.dev@gmail.com\nURL:https://www.linkedin.com/in/mohamedafnnan/\nEND:VCARD';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([v],{type:'text/vcard'}));a.download='Mohamed-Afnnan.vcf';a.click();URL.revokeObjectURL(a.href);});
})();