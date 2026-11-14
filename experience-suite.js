(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // SCADA demonstration: all values and commands are local simulation only.
  const room = $('.control-room');
  if (room) {
    const clock = $('#plant-clock');
    const eventList = $('#plant-events');
    const message = $('#plant-message');
    const title = $('#plant-panel-title');
    const state = $('#plant-state');
    const readings = { temp: 28.4, pressure: 2.4, flow: 18.2, level: 72 };
    const units = { temp: ' °C', pressure: ' bar', flow: ' L/min', level: ' %' };
    let pump = true, valve = true, alarm = false;
    const time = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
    const log = (text) => {
      if (!eventList) return;
      const entry = document.createElement('p');
      const stamp = document.createElement('time');
      stamp.textContent = time();
      entry.append(stamp, document.createTextNode(text));
      eventList.prepend(entry);
      while (eventList.children.length > 8) eventList.lastElementChild.remove();
    };
    const update = () => {
      const set = (key, value) => {
        const node = $('#metric-' + key);
        const bar = $('#metric-' + key + '-bar');
        if (node) node.innerHTML = value.toFixed(key === 'level' ? 0 : 1) + '<small>' + units[key] + '</small>';
        if (bar) bar.style.width = Math.max(0, Math.min(100, value / ({ temp: 50, pressure: 5, flow: 30, level: 100 }[key]) * 100)) + '%';
      };
      Object.keys(readings).forEach(key => set(key, readings[key]));
      room.classList.toggle('is-pump-off', !pump);
      room.classList.toggle('is-valve-closed', !valve);
      const pumpButton = $('[data-command="pump"]');
      const valveButton = $('[data-command="valve"]');
      if (pumpButton) { pumpButton.textContent = 'PUMP: ' + (pump ? 'ON' : 'OFF'); pumpButton.setAttribute('aria-pressed', String(pump)); }
      if (valveButton) { valveButton.textContent = 'VALVE: ' + (valve ? 'OPEN' : 'CLOSED'); valveButton.setAttribute('aria-pressed', String(valve)); }
      if (state) state.textContent = alarm ? 'ALARM · DEMO' : pump && valve ? 'RUNNING · SIMULATED' : 'STANDBY · SIMULATED';
    };
    const tabs = {
      overview: ['Process overview', 'A simplified tank, pump, control valve and flow transmitter.'],
      instrumentation: ['Instrument readings', 'TT-101, PT-101, FT-101 and LT-101 are generated in this browser.'],
      utilities: ['Utilities & actuators', 'Toggle the demo pump and valve. No external equipment is connected.'],
      security: ['OT security view', 'A teaching view: separate IT and OT zones, inventory, least privilege and monitored industrial protocols.']
    };
    $$('[data-plant]', room).forEach(button => button.addEventListener('click', () => {
      $$('[data-plant]', room).forEach(tab => { const active = tab === button; tab.classList.toggle('is-active', active); tab.setAttribute('aria-pressed', String(active)); });
      const panel = tabs[button.dataset.plant];
      if (panel) { title.textContent = panel[0]; message.textContent = panel[1]; }
      log('Operator opened ' + button.textContent.trim());
    }));
    $$('[data-command]', room).forEach(button => button.addEventListener('click', () => {
      const command = button.dataset.command;
      if (command === 'pump') { pump = !pump; message.textContent = 'Demo pump switched ' + (pump ? 'ON' : 'OFF') + '.'; log('P-101 command: ' + (pump ? 'START' : 'STOP')); }
      if (command === 'valve') { valve = !valve; message.textContent = 'Demo control valve ' + (valve ? 'OPENED' : 'CLOSED') + '.'; log('CV-101 command: ' + (valve ? 'OPEN' : 'CLOSE')); }
      if (command === 'alarm') { alarm = true; message.textContent = 'Test alarm raised. Acknowledge by opening the Overview tab.'; log('ALARM TEST: high temperature simulated'); }
      update();
    }));
    $$('[data-plant="overview"]', room).forEach(button => button.addEventListener('click', () => { if (alarm) { alarm = false; log('Operator acknowledged demo alarm'); update(); } }));
    $('#clear-events')?.addEventListener('click', () => { eventList.replaceChildren(); log('Event log cleared by operator'); });
    const tick = () => {
      if (clock) clock.textContent = time();
      if (pump && valve && !alarm) {
        readings.temp = Math.max(26, Math.min(34, readings.temp + (Math.random() - .5) * .25));
        readings.pressure = Math.max(1.8, Math.min(3.1, readings.pressure + (Math.random() - .5) * .035));
        readings.flow = Math.max(15, Math.min(22, readings.flow + (Math.random() - .5) * .18));
        readings.level = Math.max(60, Math.min(84, readings.level + (Math.random() - .5) * .12));
      } else { readings.flow = Math.max(0, readings.flow - .2); }
      update();
    };
    update(); tick(); window.setInterval(tick, 1600);
  }

  // Robot workcell: deterministic pick, transfer, release and pointer tracking.
  const arm = $('#portfolio-arm');
  if (arm) {
    const upper = $('#robot-upper'), lower = $('#robot-lower'), grip = $('#robot-gripper');
    const payload = $('#robot-payload'), target = $('#robot-target'), stage = $('.robot-stage');
    const status = $('#arm-status'), run = $('#arm-run'), pause = $('#arm-pause'), track = $('#arm-track');
    const waypoints = [
      { t: 0, shoulder: 0, elbow: 0, grip: false, label: 'HOME · CENTERED' },
      { t: 1.1, shoulder: -78, elbow: 10, grip: false, label: 'REACH · INPUT TRAY' },
      { t: 1.5, shoulder: -78, elbow: 10, grip: true, label: 'GRIP · PAYLOAD SECURED' },
      { t: 3.2, shoulder: 0, elbow: -4, grip: true, label: 'TRANSFER · CENTER LINE' },
      { t: 4.6, shoulder: 78, elbow: 10, grip: true, label: 'ALIGN · OUTPUT TRAY' },
      { t: 5.0, shoulder: 78, elbow: 10, grip: false, label: 'RELEASE · COMPLETE' },
      { t: 6.3, shoulder: 0, elbow: 0, grip: false, label: 'RETURN · CENTERED' },
      { t: 7.0, shoulder: 0, elbow: 0, grip: false, label: 'CYCLE COMPLETE' }
    ];
    let mode = 'auto', paused = false, start = performance.now(), elapsedOffset = 0, pointer = { x: 260, y: 110 };
    const mix = (a,b,t) => a + (b-a)*t;
    const ease = t => t*t*(3-2*t);
    const interpolate = seconds => {
      let i = 0; while (i < waypoints.length-2 && seconds > waypoints[i+1].t) i++;
      const a = waypoints[i], b = waypoints[i+1], u = ease(Math.max(0, Math.min(1,(seconds-a.t)/(b.t-a.t))));
      return { shoulder: mix(a.shoulder,b.shoulder,u), elbow: mix(a.elbow,b.elbow,u), grip: seconds >= 1.5 && seconds < 5.0, delivered: seconds >= 5.0, label: b.label };
    };
    const endpoint = pose => {
      const a = pose.shoulder * Math.PI / 180, b = (pose.shoulder + pose.elbow) * Math.PI / 180;
      const elbowX = 260 + 93 * Math.sin(a), elbowY = 244 - 93 * Math.cos(a);
      return { x: elbowX + 69 * Math.sin(b), y: elbowY - 69 * Math.cos(b) };
    };
    const paint = pose => {
      upper?.setAttribute('transform', 'rotate(' + pose.shoulder + ' 260 244)');
      lower?.setAttribute('transform', 'rotate(' + pose.elbow + ' 260 151)');
      const tip = endpoint(pose);
      if (payload) {
        const atInput = { x: 99, y: 232 }, atOutput = { x: 421, y: 232 };
        const held = pose.grip;
        const position = held ? tip : pose.delivered ? atOutput : atInput;
        payload.setAttribute('cx', position.x);
        payload.setAttribute('cy', position.y + (held ? 12 : 0));
        payload.style.opacity = '1';
      }
      if (target) { target.setAttribute('cx', tip.x); target.setAttribute('cy', tip.y); }
      if (status) status.textContent = mode === 'track' ? 'MANUAL · POINTER TRACKING' : paused ? 'PAUSED · HOLDING POSITION' : pose.label;
    };
    const reset = () => { mode='auto';paused=false;elapsedOffset=0;start=performance.now();track.setAttribute('aria-pressed','false');track.textContent='TRACK POINTER';pause.setAttribute('aria-pressed','false');pause.textContent='PAUSE';stage?.classList.remove('is-tracking'); };
    run?.addEventListener('click', reset);
    pause?.addEventListener('click', () => {
      if (!paused) { elapsedOffset = ((performance.now()-start)/1000 + elapsedOffset) % 7; paused=true; }
      else { start=performance.now(); paused=false; }
      pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'RESUME':'PAUSE';
      if(status)status.textContent=paused?'PAUSED · HOLDING POSITION':'AUTO · RESUMING';
    });
    track?.addEventListener('click', () => { mode=mode==='track'?'auto':'track';track.setAttribute('aria-pressed',String(mode==='track'));track.textContent=mode==='track'?'EXIT TRACK':'TRACK POINTER';stage?.classList.toggle('is-tracking',mode==='track');if(mode==='auto'){start=performance.now();elapsedOffset=0;} });
    stage?.addEventListener('pointermove', event => { if(mode!=='track')return;const rect=arm.getBoundingClientRect();pointer={x:Math.max(70,Math.min(450,(event.clientX-rect.left)/rect.width*520)),y:Math.max(45,Math.min(235,(event.clientY-rect.top)/rect.height*330))}; });
    const loop = now => {
      if (!paused) {
        if (mode === 'auto') {
          const elapsed = ((now - start) / 1000 + elapsedOffset) % 7;
          paint(interpolate(elapsed));
        } else {
          const dx = pointer.x - 260, dy = pointer.y - 244;
          const shoulder = Math.max(-78, Math.min(78, Math.atan2(dx, -dy) * 180 / Math.PI));
          paint({ shoulder, elbow: Math.max(-12, Math.min(18, (Math.hypot(dx,dy)-140)*.12)), grip: false, label: 'MANUAL' });
        }
      }
      requestAnimationFrame(loop);
    };
    const reset = () => { mode='auto';paused=false;elapsedOffset=0;start=performance.now();track.setAttribute('aria-pressed','false');track.textContent='TRACK POINTER';pause.setAttribute('aria-pressed','false');pause.textContent='PAUSE';stage?.classList.remove('is-tracking'); };
    run?.addEventListener('click', reset);
    pause?.addEventListener('click', () => { paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'RESUME':'PAUSE';if(status)status.textContent=paused?'PAUSED · HOLDING POSITION':'AUTO · RESUMING';if(!paused)start=performance.now()-elapsedOffset*1000; });
    track?.addEventListener('click', () => { mode=mode==='track'?'auto':'track';track.setAttribute('aria-pressed',String(mode==='track'));track.textContent=mode==='track'?'EXIT TRACK':'TRACK POINTER';stage?.classList.toggle('is-tracking',mode==='track');if(mode==='auto')start=performance.now(); });
    stage?.addEventListener('pointermove', event => { if(mode!=='track')return;const rect=arm.getBoundingClientRect();pointer={x:Math.max(70,Math.min(450,(event.clientX-rect.left)/rect.width*520)),y:Math.max(45,Math.min(235,(event.clientY-rect.top)/rect.height*330))}; });
    arm.addEventListener('click', () => { if(status)status.textContent='ARM / 02 · MAINTENANCE VIEW'; });
    requestAnimationFrame(loop);
  }

  // Certificate museum filters the supplied files without inventing credentials.
  const museum = $('.credential-shelf');
  if (museum) {
    const list = $('.credential-list', museum);
    if (list) {
      const controls = document.createElement('div'); controls.className='museum-controls';
      const label = document.createElement('label'); label.className='museum-search'; label.textContent='SEARCH THE ARCHIVE';
      const input = document.createElement('input'); input.type='search'; input.placeholder='Search certificates and awards'; input.setAttribute('aria-label','Search certificates and awards'); label.append(input);
      const filters = document.createElement('div'); filters.className='museum-filters'; filters.setAttribute('aria-label','Filter certificates');
      const categories = ['ALL','CERTIFICATES','AWARDS','PROFILE-LISTED'];
      categories.forEach(category => { const button=document.createElement('button');button.type='button';button.textContent=category;button.dataset.filter=category;button.setAttribute('aria-pressed',String(category==='ALL'));filters.append(button); });
      const count=document.createElement('span');count.className='museum-count';count.setAttribute('aria-live','polite');
      controls.append(label,filters,count);list.before(controls);
      const items=$$('a,.credential-list__unlinked',list);
      items.forEach(item => { const text=item.textContent.toLowerCase();item.dataset.category=item.classList.contains('credential-list__unlinked')?'PROFILE-LISTED':/innomark/.test(text)?'AWARDS':'CERTIFICATES'; });
      let filter='ALL';
      const apply=()=>{let visible=0;items.forEach(item=>{const match=(filter==='ALL'||item.dataset.category===filter)&&item.textContent.toLowerCase().includes(input.value.toLowerCase());item.hidden=!match;if(match)visible++;});count.textContent=visible+' / '+items.length+' RECORDS';};
      input.addEventListener('input',apply);
      filters.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]');if(!button)return;filter=button.dataset.filter;$$('button',filters).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));apply();});
      apply();
    }
  }

  // Memory wall uses IndexedDB; files remain local to this visitor's browser.
  const memoryForm = $('#memory-form'), memoryWall = $('#memory-wall'), memoryStatus = $('#memory-status');
  if (memoryForm && memoryWall) {
    const dbName='afnnan-memory-wall-v1', storeName='memories';let db=null, urls=[];
    const openDb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open(dbName,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(storeName))req.result.createObjectStore(storeName,{keyPath:'id'});};req.onsuccess=()=>{db=req.result;resolve(db);};req.onerror=()=>reject(req.error);});
    const transaction=(mode,operation)=>new Promise((resolve,reject)=>{const tx=db.transaction(storeName,mode),store=tx.objectStore(storeName);const req=operation(store);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
    const refresh=async()=>{try{urls.forEach(URL.revokeObjectURL);urls=[];const records=await transaction('readonly',s=>s.getAll());memoryWall.replaceChildren();records.sort((a,b)=>b.created-a.created).forEach(record=>{const card=document.createElement('article');card.className='memory-note';const img=document.createElement('img');const url=URL.createObjectURL(record.image);urls.push(url);img.src=url;img.alt=record.caption;img.loading='lazy';const title=document.createElement('strong');title.textContent=record.caption;const date=document.createElement('small');date.textContent=new Date(record.created).toLocaleDateString();const remove=document.createElement('button');remove.type='button';remove.textContent='REMOVE';remove.addEventListener('click',async()=>{await transaction('readwrite',s=>s.delete(record.id));refresh();});card.append(img,title,date,remove);memoryWall.append(card);});if(!records.length)memoryWall.innerHTML='<p class="memory-empty">Your first memory will appear here.</p>';if(memoryStatus)memoryStatus.textContent=records.length+' memories stored on this device.';}catch(error){if(memoryStatus)memoryStatus.textContent='Local storage unavailable: '+error.message;}};
    openDb().then(refresh).catch(error=>{if(memoryStatus)memoryStatus.textContent='This browser blocked local storage: '+error.message;});
    memoryForm.addEventListener('submit',async event=>{event.preventDefault();const data=new FormData(memoryForm),file=data.get('photo'),caption=String(data.get('caption')||'').trim();if(!(file instanceof File)||!file.type.startsWith('image/')){memoryStatus.textContent='Choose an image first.';return;}if(file.size>1500000){memoryStatus.textContent='Use an image smaller than 1.5 MB.';return;}try{if(!db)await openDb();await transaction('readwrite',s=>s.put({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),caption:caption.slice(0,80),created:Date.now(),image:file}));memoryForm.reset();await refresh();}catch(error){memoryStatus.textContent='Could not save this image: '+error.message;}});
  }

  // Table-tennis rally: touch and mouse both position the player's paddle.
  const canvas=$('#rally-canvas');
  if(canvas){
    const ctx=canvas.getContext('2d'),W=720,H=360;let player=180,cpu=180,ball={x:360,y:180,vx:0,vy:0,r:8},playing=false,playerScore=0,cpuScore=0,rally=0,last=0;
    const playerNode=$('#rally-player-score'),cpuNode=$('#rally-cpu-score'),rallyNode=$('#rally-count'),status=$('#rally-status');
    const updateScore=()=>{playerNode.textContent=playerScore;cpuNode.textContent=cpuScore;rallyNode.textContent=rally;};
    const serve=()=>{ball={x:360,y:180,vx:5*(Math.random()>.5?1:-1),vy:(Math.random()-.5)*4,r:8};playing=true;if(status)status.textContent='Rally in progress.';};
    const reset=()=>{playing=false;playerScore=0;cpuScore=0;rally=0;player=180;cpu=180;ball={x:360,y:180,vx:0,vy:0,r:8};updateScore();if(status)status.textContent='Move the paddle, then serve.';draw(0);};
    const draw=now=>{
      const dt=last?Math.min((now-last)/16.67,2):1;last=now;
      ctx.clearRect(0,0,W,H);ctx.fillStyle='#14251b';ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#66806b';ctx.setLineDash([7,8]);ctx.beginPath();ctx.moveTo(W/2,12);ctx.lineTo(W/2,H-12);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='#b7d6b1';ctx.lineWidth=2;ctx.strokeRect(14,12,W-28,H-24);
      if(playing){
        ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
        if(ball.y<22||ball.y>H-22){ball.vy*=-1;ball.y=Math.max(22,Math.min(H-22,ball.y));}
        cpu+=(ball.y-cpu)*Math.min(.045*dt,.09);
        if(ball.vx<0&&ball.x-8<42&&Math.abs(ball.y-player)<48){ball.vx=Math.abs(ball.vx)*1.035;ball.vy+=(ball.y-player)*.075;rally++;updateScore();}
        if(ball.vx>0&&ball.x+8>678&&Math.abs(ball.y-cpu)<49){ball.vx=-Math.abs(ball.vx)*1.02;ball.vy+=(ball.y-cpu)*.05;rally++;updateScore();}
        if(ball.x<0){cpuScore++;playing=false;if(status)status.textContent='Point to CPU. Serve again.';updateScore();}
        if(ball.x>W){playerScore++;playing=false;if(status)status.textContent='Point to you. Serve again.';updateScore();}
        if(Math.abs(ball.vx)>11)ball.vx=Math.sign(ball.vx)*11;
      }
      ctx.fillStyle='#d8e4d0';ctx.fillRect(27,player-43,10,86);ctx.fillStyle='#c58b5d';ctx.fillRect(683,cpu-43,10,86);
      ctx.fillStyle='#f4f1e8';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#9eb59d';ctx.font='10px monospace';ctx.fillText('AF / RALLY',28,29);ctx.fillText('MOVE TO RETURN',560,29);
      requestAnimationFrame(draw);
    };
    const move=e=>{const r=canvas.getBoundingClientRect();player=Math.max(65,Math.min(H-65,(e.clientY-r.top)/r.height*H));};
    canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerdown',move);
    $('#rally-start')?.addEventListener('click',()=>{if(!playing)serve();});$('#rally-reset')?.addEventListener('click',reset);
    updateScore();requestAnimationFrame(draw);
  }

  // Voice greeting: speech recognition is optional; speech synthesis has a clear fallback.
  const voicePanel=$('.voice-console'),voiceStatus=$('#voice-status');
  const sayGreeting=()=>{if(!('speechSynthesis'in window)){voiceStatus.textContent='Speech playback is unavailable in this browser.';return;}speechSynthesis.cancel();const lines=[['Hello. I am Mohamed Afnnan. Welcome to my portfolio.','en-IN'],['നമസ്കാരം. എന്റെ പോർട്ട്ഫോളിയോയിലേക്ക് സ്വാഗതം.','ml-IN'],['السلام عليكم. أهلاً وسهلاً.','ar-SA']];lines.forEach(([text,lang])=>{const utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang;utterance.rate=.9;speechSynthesis.speak(utterance);});voiceStatus.textContent='Playing the multilingual greeting.';};
  $('#voice-speak')?.addEventListener('click',sayGreeting);
  $('#voice-listen')?.addEventListener('click',()=>{
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Recognition){voiceStatus.textContent='Speech recognition is not supported here. Use Play Greeting instead.';return;}
    const recognition=new Recognition();recognition.lang='en-IN';recognition.interimResults=false;recognition.maxAlternatives=1;
    voicePanel?.classList.add('is-listening');voiceStatus.textContent='Listening. Say “hello” or “Afnnan”.';
    recognition.onresult=event=>{const spoken=event.results[0][0].transcript;voiceStatus.textContent='Heard: “'+spoken+'”. Welcome.';if(/hello|afnnan|welcome/i.test(spoken))sayGreeting();};
    recognition.onerror=()=>{voiceStatus.textContent='Microphone unavailable or permission denied. Play Greeting still works.';};
    recognition.onend=()=>voicePanel?.classList.remove('is-listening');
    try{recognition.start();}catch(error){voiceStatus.textContent='Could not start microphone: '+error.message;voicePanel?.classList.remove('is-listening');}
  });

  // Flip card and create downloadable contact assets.
  const card=$('#af-business-card');
  card?.addEventListener('click',()=>card.setAttribute('aria-pressed',String(card.getAttribute('aria-pressed')!=='true')));
  const download=(content,type,name)=>{const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);};
  $('#download-vcard')?.addEventListener('click',()=>download('BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Mohamed Afnnan Veettilayil\r\nEMAIL:afnnan.dev@gmail.com\r\nURL:https://www.linkedin.com/in/mohamedafnnan/\r\nEND:VCARD\r\n','text/vcard;charset=utf-8','Mohamed-Afnnan.vcf'));
  $('#download-card')?.addEventListener('click',()=>download('<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="600" viewBox="0 0 1050 600"><rect width="1050" height="600" fill="#172820"/><circle cx="850" cy="120" r="280" fill="none" stroke="#b7d6b1" stroke-opacity=".2" stroke-width="2"/><text x="70" y="105" fill="#b7d6b1" font-family="Arial" font-size="28" letter-spacing="8">AF / VEETTILAYIL</text><text x="70" y="290" fill="#f4f1e8" font-family="Arial" font-size="70">Mohamed Afnnan</text><text x="74" y="350" fill="#b7d6b1" font-family="Arial" font-size="28" letter-spacing="5">EIE UNDERGRADUATE · FISAT</text><text x="74" y="475" fill="#f4f1e8" font-family="Arial" font-size="26">afnnan.dev@gmail.com</text><text x="74" y="525" fill="#f4f1e8" font-family="Arial" font-size="22">linkedin.com/in/mohamedafnnan</text></svg>','image/svg+xml','Mohamed-Afnnan-Business-Card.svg'));

  // Shared guestbook reads public comments from a dedicated GitHub issue.
  const guestbook=$('#guestbook-list');
  if(guestbook){
    fetch('https://api.github.com/repos/mohamedafnnan/afnnan-portfolio/issues/3/comments?per_page=30',{headers:{Accept:'application/vnd.github+json'}})
      .then(response=>{if(!response.ok)throw new Error('GitHub returned '+response.status);return response.json();})
      .then(comments=>{guestbook.replaceChildren();const entries=comments.filter(comment=>!comment.user?.type||comment.user.type!=='Bot').slice(-12).reverse();if(!entries.length){const empty=document.createElement('p');empty.className='guestbook-loading';empty.textContent='No notes yet. You can be the first to sign.';guestbook.append(empty);return;}entries.forEach(comment=>{const article=document.createElement('article');article.className='guestbook-entry';const author=document.createElement('strong');author.textContent=comment.user?.login||'Visitor';const date=document.createElement('time');date.dateTime=comment.created_at;date.textContent=new Date(comment.created_at).toLocaleDateString();const body=document.createElement('p');body.textContent=comment.body.slice(0,600);article.append(author,date,body);guestbook.append(article);});})
      .catch(()=>{guestbook.textContent='Guestbook comments could not be loaded. Open the public guestbook issue to read or leave a note.';});
  }

  // Magnetic pointer, disabled on touch and for reduced-motion preferences.
  const cursor=$('.af-magnetic-cursor');
  if(cursor&&!reduced&&window.matchMedia('(pointer:fine)').matches){
    let x=0,y=0,px=0,py=0,raf=0;
    document.addEventListener('pointermove',event=>{x=event.clientX;y=event.clientY;cursor.classList.add('is-visible');if(!raf){raf=1;const frame=()=>{px+=(x-px)*.32;py+=(y-py)*.32;cursor.style.left=px+'px';cursor.style.top=py+'px';if(Math.abs(x-px)+Math.abs(y-py)>.25)requestAnimationFrame(frame);else raf=0;};requestAnimationFrame(frame);}});
    document.addEventListener('pointerover',event=>cursor.classList.toggle('is-active',!!event.target.closest('a,button,summary,.shelf-volume')));
  }

  // Keyboard and tactile Easter eggs.
  const egg=$('#easter-message');let typed='',footerTaps=0,sequenceIndex=0;
  const reveal=text=>{if(!egg)return;egg.textContent=text;egg.classList.add('is-found');};
  const secrets={afnnan:'You found the signature. Welcome to the workshop.',dawn:'DAWN protocol unlocked. Rover systems nominal.',rose:'A rose for the curious. Keep looking.'};
  document.addEventListener('keydown',event=>{
    if(event.key.length===1&&!event.ctrlKey&&!event.metaKey){typed=(typed+event.key.toLowerCase()).slice(-6);Object.entries(secrets).forEach(([key,value])=>{if(typed.endsWith(key))reveal(value);});}
    const code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    sequenceIndex=event.key===code[sequenceIndex]?sequenceIndex+1:event.key===code[0]?1:0;
    if(sequenceIndex===code.length){sequenceIndex=0;reveal('KONAMI sequence accepted. You found the hidden control channel.');}
  });
  $('.footer-mark')?.addEventListener('click',()=>{footerTaps++;if(footerTaps===7){footerTaps=0;reveal('AF—01. Seven clicks, one hidden door.');}});
  $('#robot-base')?.addEventListener('click',()=>reveal('MAINTENANCE HATCH OPEN. The robot is still simulated.'));
})();
