/* DAWN loading atmosphere: tiny canvas particles and a one-shot, gesture-safe tone. */
const canvas = document.getElementById('loading-particles');
const ctx = canvas?.getContext('2d');
const particles = [];
let raf = 0;
let audioPlayed = false;
const lowPower = window.matchMedia('(max-width: 720px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
  canvas.width = Math.floor(innerWidth * dpr); canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function seed() {
  if (!canvas || !ctx) return;
  const count = lowPower ? 28 : 64;
  for (let i = 0; i < count; i++) particles.push({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.8 + .35, speed: Math.random() * .18 + .04,
    drift: (Math.random() - .5) * .14, alpha: Math.random() * .5 + .12,
  });
}
function frame(t) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.y -= p.speed; p.x += p.drift;
    if (p.y < -4) { p.y = innerHeight + 4; p.x = Math.random() * innerWidth; }
    ctx.fillStyle = `rgba(242, 177, 111, ${p.alpha * (.72 + Math.sin(t * .001 + p.x) * .18)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  raf = requestAnimationFrame(frame);
}
export function startLoadingAtmosphere() {
  if (!canvas || !ctx) return;
  resize(); seed(); addEventListener('resize', resize, { passive: true });
  raf = requestAnimationFrame(frame);
}
export function stopLoadingAtmosphere() {
  if (raf) cancelAnimationFrame(raf);
  document.getElementById('loading-particles')?.classList.add('is-done');
}
function playTone(ac) {
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(.028, ac.currentTime + .06);
  master.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + .9);
  master.connect(ac.destination);
  const osc = ac.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(196, ac.currentTime); osc.frequency.exponentialRampToValueAtTime(294, ac.currentTime + .75);
  osc.connect(master); osc.start(); osc.stop(ac.currentTime + .95);
  osc.addEventListener('ended', () => ac.close());
  audioPlayed = true;
}
export function startLoadingAudio() {
  if (audioPlayed) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ac = new AudioCtx();
    const ready = ac.state === 'running' ? Promise.resolve() : ac.resume();
    ready.then(() => { if (!audioPlayed && ac.state === 'running') playTone(ac); else if (!audioPlayed) ac.close(); }).catch(() => ac.close());
  } catch { /* audio is an enhancement, never a boot dependency */ }
}
startLoadingAtmosphere();
// Browsers that permit autoplay will hear the cue immediately; blocked browsers
// get the same cue from the ENTER FIELD gesture in main.js.
startLoadingAudio();
