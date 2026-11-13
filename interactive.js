(() => {
 const q=(s,r=document)=>r.querySelector(s);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Voice introduction is opt-in; no microphone permission is requested automatically.
 const intro=q('#voice-intro');
 q('#voice-open')?.addEventListener('click',()=>intro?.classList.add('is-open'));
 q('#voice-close')?.addEventListener('click',()=>intro?.classList.remove('is-open'));
 q('#voice-speak')?.addEventListener('click',()=>{
   if(!('speechSynthesis'in window)){q('#voice-status').textContent='Speech playback is unavailable in this browser.';return;}
   speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("Hello. I'm Mohamed Afnnan. Welcome to my portfolio.");u.rate=.92;u.onend=()=>q('#voice-status').textContent='Introduction complete.';speechSynthesis.speak(u);q('#voice-status').textContent='Playing spoken introduction…';
 });
 // Magnetic attraction only on fine pointers.
 const cursor=q('.magnetic-cursor');
 if(cursor&&!reduced&&matchMedia('(pointer:fine)').matches){
   document.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.classList.add('is-visible');});
   document.addEventListener('pointerover',e=>cursor.classList.toggle('is-active',!!e.target.closest('.magnetic, a, button')));
   document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.08)+'px,'+((e.clientY-r.top-r.height/2)*.08)+'px)';});el.addEventListener('pointerleave',()=>el.style.transform='');});
 }
 // Hidden easter egg: type AFNNAN to reveal a quiet message.
 let typed='';document.addEventListener('keydown',e=>{if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){typed=(typed+e.key.toLowerCase()).slice(-6);if(typed==='afnnan'){const n=q('#easter-egg');if(n){n.hidden=false;n.classList.add('is-visible');}}}});
 // Table-tennis slingshot: drag the paddle backwards and release the ball.
 const canvas=q('#tt-canvas');
 if(canvas){const ctx=canvas.getContext('2d');let w=0,h=250,ball={x:120,y:125,vx:0,vy:0,r:9},drag=null,score=0,active=false,raf=0;
 const resize=()=>{const d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();w=r.width;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);ball.x=Math.min(120,w*.25);ball.y=h/2;};new ResizeObserver(resize).observe(canvas);resize();
 const draw=()=>{ctx.clearRect(0,0,w,h);ctx.strokeStyle='#52685b';ctx.lineWidth=1;ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(w/2,12);ctx.lineTo(w/2,h-12);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#b7d6b1';ctx.font='10px monospace';ctx.fillText('RALLY  '+score,16,22);
 if(active&&!drag){ball.x+=ball.vx;ball.y+=ball.vy;ball.vy+=.12; if(ball.x<ball.r||ball.x>w-ball.r){ball.vx*=-1;ball.x=Math.max(ball.r,Math.min(w-ball.r,ball.x));score++;}if(ball.y<ball.r||ball.y>h-ball.r){ball.vy*=-.92;ball.y=Math.max(ball.r,Math.min(h-ball.r,ball.y));}ball.vx*=.999;if(Math.abs(ball.vx)<.12&&Math.abs(ball.vy)<.12){active=false;}}
 ctx.fillStyle='#e5efe0';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
 const px=drag?drag.x:Math.max(35,Math.min(w-35,ball.x-44)),py=drag?drag.y:ball.y;ctx.save();ctx.translate(px,py);ctx.rotate(-.45);ctx.fillStyle='#d3a47d';ctx.beginPath();ctx.roundRect(-6,-35,12,43,5);ctx.fill();ctx.fillStyle='#b55e45';ctx.beginPath();ctx.arc(0,-42,23,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f2d8bd';ctx.lineWidth=2;ctx.stroke();ctx.restore();
 if(drag){ctx.strokeStyle='#b7d6b1';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(drag.x,drag.y);ctx.lineTo(drag.startX,drag.startY);ctx.stroke();ctx.setLineDash([]);}
 raf=requestAnimationFrame(draw);};draw();
 const pos=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
 canvas.addEventListener('pointerdown',e=>{const p=pos(e);if(Math.hypot(p.x-ball.x,p.y-ball.y)<36||Math.hypot(p.x-(ball.x-44),p.y-ball.y)<55){drag={...p,startX:ball.x,startY:ball.y};canvas.setPointerCapture(e.pointerId);active=false;}});
 canvas.addEventListener('pointermove',e=>{if(drag){const p=pos(e);drag.x=p.x;drag.y=p.y;}});
 canvas.addEventListener('pointerup',()=>{if(!drag)return;const dx=drag.startX-drag.x,dy=drag.startY-drag.y;ball.x=drag.startX;ball.y=drag.startY;ball.vx=Math.max(-18,Math.min(18,dx*.16));ball.vy=Math.max(-18,Math.min(18,dy*.16));active=true;drag=null;});
 q('#tt-reset')?.addEventListener('click',()=>{ball={x:Math.min(120,w*.25),y:h/2,vx:0,vy:0,r:9};score=0;active=false;});
 }
 // Downloadable contact card.
 q('#download-vcard')?.addEventListener('click',()=>{const v='BEGIN:VCARD\nVERSION:3.0\nFN:Mohamed Afnnan Veettilayil\nEMAIL:afnnan.dev@gmail.com\nURL:https://www.linkedin.com/in/mohamedafnnan/\nEND:VCARD';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([v],{type:'text/vcard'}));a.download='Mohamed-Afnnan.vcf';a.click();URL.revokeObjectURL(a.href);});
 // Guestbook uses Netlify Forms (submissions are stored in the Netlify site dashboard).
 q('#guestbook-form')?.addEventListener('submit',e=>{const f=e.currentTarget;if(!f.reportValidity())e.preventDefault();});
 // Make hidden clue discoverable via the small footer signal too.
 q('#easter-egg-trigger')?.addEventListener('click',()=>{const n=q('#easter-egg');if(n)n.hidden=!n.hidden;});
})();