/* STYLE REMINDER: preserve the supplied DAWN mission-control identity and gameplay; this file only adds touch-device performance safeguards to the existing Three.js runtime.
   DAWN — main entry. Authentic rover + expanded outpost + missions + 21 logs. */
import {
  Scene, WebGLRenderer, Vector3, Quaternion, Euler, PCFSoftShadowMap, Color, Box3,
} from 'three';

import { WORLD, ROVER, CONTROLS_HINT } from './config.js';
import { getState, setState } from './util/store.js';
import { createLoader } from './util/loader.js';
import { clamp } from './util/math.js';

import { buildTerrain, heightAt, slopeAt } from './scene/terrain.js';
import { buildLighting } from './scene/lighting.js';
import { buildRocks, buildSurfaceFragments, buildGeology, buildCraterDetails, buildBowlingPins, buildFlag } from './scene/environment.js';
import { buildAllPois, POIS, POI_RADIUS } from './scene/pois3d.js';
import { registerFacilityAnimations, updateFacilityAnimations } from './scene/animated.js';
import { Tour } from './tour/tour.js';

import { PhysicsWorld } from './rover/physics.js';
import { loadRover } from './rover/loader.js';
import { initMap, setMapOpen, isMapOpen, setMapRover, drawMap } from './hud/map.js';
import { DustSystem, TrackSystem } from './rover/effects.js';
import { ArmController } from './rover/arm.js';

import { initKeyboard, readInput, onKey } from './input/keyboard.js';
import { initTouch, readTouchInput, hasTouchInput, onTouchAction } from './input/touch.js';

import { CameraRig } from './camera/rig.js';
import { AudioSystem } from './audio/audio.js';
import { Fireworks } from './fireworks.js';
import { stopLoadingAtmosphere, startLoadingAudio } from './loading.js';

import {
  mountHud, setCameraButton, setGuideOpen, showPoiPrompt, hidePoiPrompt,
  showToast, openPoiPanel, closePoiPanel, openMissionSummary,
  updateTelemetry, drawMinimap, setPhotoMode, setObjective,
} from './hud/hud.js';
import { POI_LOG_BODY } from './missions/pois.js';
import { MISSIONS, FIELD_LOGS, COMPONENTS } from './data.js';

/* ============ diagnostic banner ============ */
function showFatal(err) {
  console.error('[DAWN FATAL]', err);
  let b = document.getElementById('dawn-fatal');
  if (!b) {
    b = document.createElement('div');
    b.id = 'dawn-fatal';
    b.style.cssText = 'position:fixed;inset:0;z-index:9999;padding:24px;background:rgba(20,5,5,0.96);color:#fff2df;font:14px/1.5 monospace;overflow:auto;white-space:pre-wrap;';
    document.body.appendChild(b);
  }
  b.textContent = `DAWN failed to boot.\n\n${err && err.stack ? err.stack : (err && err.message) || String(err)}\n\nOpen the browser console for details, then reload.`;
}
window.addEventListener('error', (e) => showFatal(e.error || e.message));
window.addEventListener('unhandledrejection', (e) => showFatal(e.reason));

const log = (...a) => console.log('[DAWN]', ...a);

/* ---- on-screen debug report ---- */
const __dbg = [];
function dbgLog(kind, msg) {
  __dbg.push(`[${new Date().toISOString().slice(11,19)}] ${kind}: ${String(msg).slice(0,300)}`);
  if (__dbg.length > 40) __dbg.shift();
  const pre = document.getElementById('dawn-debug-pre');
  if (pre) pre.textContent = __dbg.join('\n');
}
const __cerr = console.error.bind(console);
console.error = (...a) => { dbgLog('error', a.map(x => (x && x.message) || x).join(' ')); __cerr(...a); };
window.addEventListener('error', (e) => dbgLog('window.onerror', e.message));
window.addEventListener('unhandledrejection', (e) => dbgLog('unhandledrejection', (e.reason && e.reason.message) || e.reason));
function mountDebugReport() {
  if (document.getElementById('dawn-debug-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'dawn-debug-btn';
  btn.textContent = 'REPORT';
  btn.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:10000;background:rgba(20,9,5,.8);color:#ffb066;border:1px solid rgba(255,150,80,.5);border-radius:8px;padding:6px 10px;font:11px monospace;cursor:pointer;';
  btn.onclick = () => {
    let panel = document.getElementById('dawn-debug');
    if (panel) { panel.remove(); return; }
    panel = document.createElement('div');
    panel.id = 'dawn-debug';
    panel.style.cssText = 'position:fixed;left:10px;bottom:44px;z-index:10000;width:min(560px,92vw);max-height:60vh;overflow:auto;background:rgba(10,5,3,.95);color:#ffe9d2;border:1px solid rgba(255,150,80,.5);border-radius:10px;padding:12px;font:11px/1.5 monospace;white-space:pre-wrap;';
    panel.innerHTML = `<b style="color:#ffb066">DAWN debug report</b> (copy &amp; send)<br>ua: ${navigator.userAgent}<br>url: ${location.href}<br>webgl: ${!!window.WebGLRenderingContext}<br>started: ${getState().started} loaded: ${getState().loaded}<hr><pre id="dawn-debug-pre" style="white-space:pre-wrap;margin:6px 0 0">${__dbg.join('\n') || '(no errors captured)'}</pre>`;
    document.body.appendChild(panel);
  };
  document.body.appendChild(btn);
  dbgLog('boot', 'debug report ready');
}

const meter = document.getElementById('landing-meter');
const progressLabel = document.getElementById('landing-progress-label');
function bootProgress(pct, label) {
  if (meter) meter.style.width = `${Math.round(pct * 100)}%`;
  if (progressLabel && label) progressLabel.textContent = label;
}

/* ============ a11y ============ */
const params = new URLSearchParams(location.search);
const forceA11y = params.has('a11y');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setState({ reducedMotion });

if (forceA11y) {
  renderA11yFallback();
  throw new Error('a11y-only mode');
}
function renderA11yFallback() {
  document.body.classList.add('is-a11y');
  const el = document.getElementById('a11y-fallback');
  el.hidden = false;
  el.innerHTML = `
    <h1 style="font-size:1.8rem;">DAWN · Afnnan Portfolio Field</h1>
    <p>DAWN is Mohamed Afnnan’s interactive portfolio field. Accessibility mode has been enabled.</p>
    <h2>Field Logs</h2>
    <ol>${FIELD_LOGS.map(l => `<li><strong>${l.title}</strong> — ${l.body.replace(/<[^>]+>/g, '')}</li>`).join('')}</ol>
    <h2>Rover Systems (guided tour narration)</h2>
    <ol>${COMPONENTS.map(c => `<li><strong>${c.name}</strong> — ${c.desc}</li>`).join('')}</ol>
    <h2>Controls (when interactive)</h2>
    <ul>${CONTROLS_HINT.map(([k, v]) => `<li><strong>${k}</strong> — ${v}</li>`).join('')}</ul>`;
}

/* ============ core refs ============ */
let renderer, scene, cameraRig, physics, roverGroup, wheels, arm, armCtl;
let dust, tracks, fireworks, audio;
let poiObjects = [];
let suspension = [];
let linkages = [];
let suspParts = [];
let battery = 100;
const _hub = new Vector3();
const _rock = { x: 0, z: 0 };
const _eulerRock = new Euler();
const _qRock = new Quaternion();
let tour = null;
let lighting = null;
let roverSolar = null, roverHeadlights = [];
let saveKey = 'dawn-v3-progress';
let honkCooldown = 0;
let missionSummaryShown = false;
let loopStarted = false;
let missionIdx = 0;
const touchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const compactViewport = window.matchMedia('(max-width: 720px)').matches;
const lowPowerDevice = touchDevice || compactViewport;
// Start light everywhere; the detailed model remains an explicit opt-in.
const ROVER_MODE_KEY = 'dawn-rover-mode-v2';
let selectedRoverMode = 'procedural';
try { selectedRoverMode = localStorage.getItem(ROVER_MODE_KEY) || selectedRoverMode; } catch {}
const roverModeToggle = document.getElementById('rover-mode-toggle');
const roverModeLabel = document.getElementById('rover-mode-label');
function renderRoverMode() {
  if (!roverModeToggle || !roverModeLabel) return;
  const detailed = selectedRoverMode === 'detailed';
  roverModeToggle.setAttribute('aria-pressed', String(detailed));
  roverModeLabel.textContent = detailed ? 'Detailed rover' : 'Procedural rover';
  roverModeToggle.classList.toggle('is-detailed', detailed);
}
roverModeToggle?.addEventListener('click', () => {
  selectedRoverMode = selectedRoverMode === 'detailed' ? 'procedural' : 'detailed';
  try { localStorage.setItem(ROVER_MODE_KEY, selectedRoverMode); } catch {}
  renderRoverMode();
});
renderRoverMode();

/* ============ init ============ */
async function init() {
  bootProgress(0.02, 'Warming up renderer');
  const canvas = document.getElementById('stage');
  if (!canvas) throw new Error('#stage canvas missing');
  renderer = new WebGLRenderer({ canvas, antialias: !lowPowerDevice, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.25 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = !reducedMotion && !lowPowerDevice;
  renderer.shadowMap.type = PCFSoftShadowMap;
  window.addEventListener('resize', () => renderer.setSize(window.innerWidth, window.innerHeight, false));

  scene = new Scene();
  const { gltf } = createLoader((pct, label) => bootProgress(0.15 + pct * 0.4, label));

  bootProgress(0.06, 'Building surface');
  lighting = buildLighting(scene);
  buildTerrain(scene);

  bootProgress(0.10, 'Forming the geological field');
  const rockField = buildRocks(scene);
  buildSurfaceFragments(scene);
  buildGeology(scene);
  buildCraterDetails(scene);
  buildFlag(scene, 150 * WORLD.coordinateScale, 130 * WORLD.coordinateScale);
  const pins = buildBowlingPins(scene);

  bootProgress(0.16, 'Building facilities');
  poiObjects = buildAllPois(scene);
  for (const p of poiObjects) registerFacilityAnimations(p, p.group);

  bootProgress(0.20, 'Starting physics engine');
  physics = new PhysicsWorld();
  await physics.init();
  for (const r of rockField.placements) {
    if (r.r > 0.6) physics.addRockCollider(r.x, r.y, r.z, r.r * 0.9);
  }
  for (const p of pins) {
    physics.addPin(p.position.x, heightAt(p.position.x, p.position.z), p.position.z);
  }

  bootProgress(0.55, 'Loading authentic DAWN');
  const roverRig = await loadRover(gltf, selectedRoverMode);
  roverGroup = roverRig.group;
  wheels = roverRig.wheels;
  arm = roverRig.arm;
  suspension = roverRig.suspension || [];
  roverSolar = roverRig.solar || null;
  roverHeadlights = roverRig.headlights || [];
  linkages = roverRig.linkages || [];
  // The front-left CAD suspension is mounted by the loader to its steering group.
  // Do not apply the former arbitrary mesh-local rotation pass; it made a
  // correctly placed link appear to float away from the wheel.
  armCtl = new ArmController(arm);
  scene.add(roverGroup);
  log('rover authentic:', !!roverRig.authentic, 'arm:', !!arm);

  bootProgress(0.78, 'Spawning rover');
  physics.createRover(ROVER.spawn[0], ROVER.spawn[1]);

  bootProgress(0.86, 'Igniting effects');
  dust = new DustSystem(scene);
  tracks = new TrackSystem(scene);
  fireworks = new Fireworks(scene);

  bootProgress(0.92, 'Calibrating audio');
  audio = new AudioSystem();

  bootProgress(0.96, 'Mounting HUD');
  cameraRig = new CameraRig(renderer);
  tour = new Tour(cameraRig, roverGroup, armCtl);
  cameraRig.orbit.target.set(0, 0, 0);
  mountHudAndInput();
  mountDebugReport();
  initMap(document.getElementById('ui-root'));
  try {
    const saved = JSON.parse(localStorage.getItem(saveKey) || '{}');
    if (saved.completed) setState({ completed: new Set(saved.completed) });
    if (typeof saved.missionIdx === 'number') missionIdx = saved.missionIdx;
  } catch {}

  advanceMissionObjective();
  bootProgress(1, 'Field online — press ROLL OUT');
  setState({ loaded: true });

  renderer.render(scene, cameraRig.camera);

  const landing = document.getElementById('landing');
  const startBtn = document.getElementById('landing-start');
  startBtn.disabled = false;

  const startExperience = async () => {
    log('start clicked');
    startLoadingAudio();
    stopLoadingAtmosphere();
    landing.classList.add('is-hidden');
    landing.style.pointerEvents = 'none';
    setTimeout(() => { landing.style.display = 'none'; }, 600);
    setState({ started: true });
    try { canvas.focus(); } catch {}
    try {
      await Promise.race([audio.resume(), new Promise((_, rej) => setTimeout(() => rej(new Error('audio resume timeout')), 1500))]);
    } catch (err) { console.warn('[DAWN] audio unavailable:', err); }
    if (!loopStarted) { loopStarted = true; startLoop(); }
    try { showToast('MISSION BRIEF', 'SOL 001 · Roll out', MISSIONS[missionIdx]?.brief || 'Explore the outpost.'); } catch {}
  };
  startBtn.addEventListener('click', startExperience);
  window.addEventListener('keydown', (e) => { if (!getState().started && !e.repeat) startExperience(); });
}

/* ============ missions ============ */
function advanceMissionObjective() {
  const m = MISSIONS[Math.min(missionIdx, MISSIONS.length - 1)];
  setObjective(`${m.title} — ${m.brief}`);
}
function checkMissionProgress() {
  const m = MISSIONS[missionIdx];
  if (!m || !m.poi) return;
  if (getState().completed.has(m.poi)) {
    missionIdx = Math.min(missionIdx + 1, MISSIONS.length - 1);
    advanceMissionObjective();
    const nm = MISSIONS[missionIdx];
    showToast('OBJECTIVE COMPLETE', m.title, nm.id === 'free' ? 'Free exploration unlocked.' : `Next: ${nm.title}`);
    audio && audio.chime();
    saveProgress();
  }
}

/* ============ HUD + input ============ */
function mountHudAndInput() {
  const uiRoot = document.getElementById('ui-root');
  mountHud(uiRoot, {
    onCameraMode: (mode) => { if (mode === 'cycle') cycleCamera(); else setCameraMode(mode); },
    onToggleGuide: (force) => { const next = typeof force === 'boolean' ? force : !getState().guideOpen; setState({ guideOpen: next }); setGuideOpen(next); },
    onToggleMute: (muted) => audio.setMuted(muted),
    onTogglePhoto: () => { const next = !getState().photoMode; setState({ photoMode: next }); setPhotoMode(next); },
    onToggleTour: () => { tour.active ? tour.stop() : tour.start(); },
    onReset: () => {
      localStorage.removeItem(saveKey);
      setState({ completed: new Set() });
      missionIdx = 0; missionSummaryShown = false;
      advanceMissionObjective();
      showToast('MISSION', 'Progress reset', 'All field logs locked again.');
    },
    onClosePanel: () => { setState({ openPoi: null }); closePoiPanel(); },
  });

  initKeyboard();
  initTouch(uiRoot);

  onKey((k) => {
    const st = getState();
    if (tour && tour.active) { if (k === 'escape') tour.stop(); return; }
    if (isMapOpen()) { if (k === 'escape' || k === 'm') setMapOpen(false); return; }
    if (st.openPoi) { if (k === 'escape') { setState({ openPoi: null }); closePoiPanel(); } return; }
    if (k === 'j') armCtl && armCtl.command('deploy');
    else if (k === 'k') armCtl && armCtl.command('grab');
    else if (k === 'l') armCtl && armCtl.command('release');
    else if (k === 'x') armCtl && armCtl.command('stow');
    else if (k === '0') armCtl && armCtl.command('auto');
    else if (k === 'e') tryLogNearestPoi();
    else if (k === 'h') tryHonk();
    else if (k === 't') { tour.active ? tour.stop() : tour.start(); }
    else if (k === 'c') cycleCamera();
    else if (k === 'm') { setMapOpen(!isMapOpen()); }
    else if (k === 'p') { const next = !st.photoMode; setState({ photoMode: next }); setPhotoMode(next); }
    else if (k === 'r') physics.reset(ROVER.spawn[0], ROVER.spawn[1]);
    else if (k === '?' || k === '/') { const next = !st.guideOpen; setState({ guideOpen: next }); setGuideOpen(next); }
    else if (k === 'escape') {
      if (st.guideOpen) { setState({ guideOpen: false }); setGuideOpen(false); }
      if (st.photoMode) { setState({ photoMode: false }); setPhotoMode(false); }
    }
  });

  onTouchAction((a) => {
    if (a === 'e') tryLogNearestPoi();
    else if (a === 'h') tryHonk();
    else if (a === 'c') cycleCamera();
    else if (a === '?') { const next = !getState().guideOpen; setState({ guideOpen: next }); setGuideOpen(next); }
  });
}

function cycleCamera() {
  const modes = ['follow', 'wide', 'orbit', 'fpv'];
  const idx = modes.indexOf(getState().cameraMode);
  setCameraMode(modes[(idx + 1) % modes.length]);
}
function setCameraMode(mode) {
  setState({ cameraMode: mode });
  cameraRig.setMode(mode, roverGroup);
  setCameraButton(mode);
}
function tryHonk() {
  if (honkCooldown > 0) return;
  honkCooldown = 0.4;
  audio.honk();
  cameraRig.addShake(0.15);
}

function tryLogNearestPoi() {
  const rover = getState().rover;
  let closest = null, closestDist = Infinity;
  for (const p of poiObjects) {
    const d = Math.hypot(p.pos[0] - rover.x, p.pos[1] - rover.z);
    if (d < POI_RADIUS && d < closestDist) { closest = p; closestDist = d; }
  }
  if (!closest) return;
  const wasCompleted = getState().completed.has(closest.id);
  const completed = new Set(getState().completed);
  completed.add(closest.id);
  setState({ completed, openPoi: closest.id });
  saveProgress();
  openPoiPanel(closest, POI_LOG_BODY[closest.id] || `<p>Field record logged for ${closest.name}.</p>`);
  if (!wasCompleted) {
    showToast('FIELD LOG UNLOCKED', closest.name, `${completed.size} / 21 recovered.`);
    audio.chime();
    fireworks.launch(closest.pos[0], heightAt(closest.pos[0], closest.pos[1]) + 6, closest.pos[1], closest.color);
    checkMissionProgress();
    if (completed.size === POIS.length && !missionSummaryShown) {
      missionSummaryShown = true;
      setTimeout(() => {
        openMissionSummary(); audio.fireworks();
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 20;
            const x = Math.cos(a) * r, z = Math.sin(a) * r;
            fireworks.launch(x, heightAt(x, z) + 12, z, 0xff7a1a);
          }, i * 320);
        }
      }, 800);
    }
  } else {
    showToast('FIELD LOG', closest.name, 'Record re-opened.');
  }
}

function saveProgress() {
  try { localStorage.setItem(saveKey, JSON.stringify({ completed: [...getState().completed], missionIdx })); } catch {}
}

function syncRoverVisuals(nowMs) {
  const body = physics.rover;
  if (!body) return;
  const t = body.translation();
  const q = body.rotation();
  roverGroup.position.set(t.x, t.y, t.z);
  roverGroup.quaternion.set(q.x, q.y, q.z, q.w);

  const steer = physics.steerAngleCurrent || 0;
  const n = Math.min(wheels?.length || 0, physics.wheels?.length || 0);
  for (let i = 0; i < n; i++) {
    const wv = wheels[i], pw = physics.wheels[i];
    // The CAD wheel groups use the opposite yaw handedness from the physics frame.
    // Keep physics unchanged and invert only the visual steering direction.
    if (wv && wv.steer && wv.isFront) wv.steer.rotation.y = -steer;
    if (wv && wv.spin) {
      wv.spin.rotation.z = pw.spinAngle;
      if (wv.home) {
        // real suspension travel: this wheel follows the terrain height under its own hub
        _hub.copy(wv.anchor).applyQuaternion(roverGroup.quaternion).add(roverGroup.position);
        const groundY = heightAt(_hub.x, _hub.z);
        const targetY = clamp(groundY + ROVER.wheelRadius - t.y, wv.home.y - 0.30, wv.home.y + 0.55);
        wv.steer.position.y += (targetY - wv.steer.position.y) * 0.5;
        wv.travel = wv.steer.position.y - wv.home.y;
      }
    }
  }

  const yawFromQ = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x));
  const rv = { x: t.x, y: t.y, z: t.z, heading: yawFromQ, speed: physics.speed || 0, slope: slopeAt(t.x, t.z), roll: 0, pitch: 0 };
  setState({ rover: rv });
  setMapRover(rv);

  // rocker-bogie: chassis visually rolls/pitches from differential wheel travel
  if (wheels && wheels.length >= 6 && wheels[0].travel !== undefined) {
    const tr = wheels.map(w => w.travel || 0);
    const front = (tr[0] + tr[1]) / 2, rear = (tr[4] + tr[5]) / 2;
    const right = (tr[0] + tr[2] + tr[4]) / 3, left = (tr[1] + tr[3] + tr[5]) / 3;
    _rock.x += ((right - left) * 1.4 - _rock.x) * 0.22;
    _rock.z += ((rear - front) * 1.0 - _rock.z) * 0.22;
    const idleCreak = Math.abs(physics.speed || 0) < 0.2 ? Math.sin(nowMs * 0.0009) * 0.008 : 0;
    _eulerRock.set(_rock.x, 0, _rock.z + idleCreak);
    _qRock.setFromEuler(_eulerRock);
    roverGroup.quaternion.multiply(_qRock);
  }
  // Authored suspension links stay parented to their wheel mounts; no
  // mesh-local rotation is applied here because it would undo that alignment.
  // animate rocker-bogie suspension from each wheel's travel
  if (suspension && suspension.length && physics.wheels) {
    const avg = (i0, i1) => ((physics.wheels[i0] && physics.wheels[i0].contactY !== undefined ? physics.wheels[i0].anchor.y - physics.wheels[i0].contactY : 0) +
                             (physics.wheels[i1] && physics.wheels[i1].contactY !== undefined ? physics.wheels[i1].anchor.y - physics.wheels[i1].contactY : 0)) / 2;
    for (const s of suspension) {
      const front = s.side === 1 ? 0 : 1;      // right/left front wheel index
      const mid = s.side === 1 ? 2 : 3;
      const rear = s.side === 1 ? 4 : 5;
      const fT = physics.wheels[front] ? clamp(physics.wheels[front].anchor.y - physics.wheels[front].contactY - ROVER.wheelRadius, -0.3, 0.3) : 0;
      const rT = physics.wheels[rear] ? clamp(physics.wheels[rear].anchor.y - physics.wheels[rear].contactY - ROVER.wheelRadius, -0.3, 0.3) : 0;
      s.rocker.rotation.z = (fT - rT) * 0.9;
      s.bogie.rotation.z = (rT - fT) * 0.6;
    }
  }
}

let last = 0, frameErrors = 0;
function startLoop() { last = performance.now(); requestAnimationFrame(frame); }

function frame(now) {
  try {
    const dt = Math.min(0.05, (now - last) / 1000);
    frame._count = (frame._count || 0) + 1;
    const cadence = lowPowerDevice ? frame._count % 2 : 0;
    const slowCadence = lowPowerDevice ? frame._count % 6 : 0;
    last = now;
    const st = getState();

    const kb = readInput();
    const tc = readTouchInput();
    const input = hasTouchInput() ? tc : kb;

    physics.step(dt, st.openPoi ? { throttle: 0, steer: 0, brake: false, handbrake: false } : input);
    syncRoverVisuals(now);

    const rover = getState().rover;
    const speedAbs = Math.abs(rover.speed);
    if (speedAbs > 0.4 && dust && cadence === 0) {
      for (const pw of physics.wheels) {
        if (pw.grounded && Math.random() < clamp(speedAbs / 12, 0.1, 0.7)) {
          const wa = pw.anchor.clone().applyQuaternion(roverGroup.quaternion).add(roverGroup.position);
          dust.emit(wa.x, pw.contactY, wa.z, rover.speed * Math.cos(rover.heading), rover.speed * Math.sin(rover.heading), clamp(speedAbs / 10, 0.2, 1));
        }
      }
    }
    if (dust && cadence === 0) dust.update(lowPowerDevice ? dt * 2 : dt);
    if (speedAbs > 0.3 && tracks) {
      if (!frame._lastStamp) frame._lastStamp = { x: rover.x, z: rover.z };
      const dx = rover.x - frame._lastStamp.x, dz = rover.z - frame._lastStamp.z;
      if (Math.hypot(dx, dz) > 0.6) { tracks.stamp(rover.x, rover.z, rover.heading); frame._lastStamp = { x: rover.x, z: rover.z }; }
    }
    if (tracks && cadence === 0) tracks.update(lowPowerDevice ? dt * 2 : dt);
    if (fireworks && cadence === 0) fireworks.update(lowPowerDevice ? dt * 2 : dt);

    const nearestActive = poiObjects.find(p => st.activePoi === p.id) || null;
    if (armCtl && cadence === 0) armCtl.update(lowPowerDevice ? dt * 2 : dt, rover, nearestActive, now * 0.001);
    if (!lowPowerDevice || cadence === 0) updateFacilityAnimations(lowPowerDevice ? dt * 2 : dt, now * 0.001, st.activePoi);

    let activePoi = null, minD = Infinity;
    for (const p of poiObjects) {
      const d = Math.hypot(p.pos[0] - rover.x, p.pos[1] - rover.z);
      if (d < POI_RADIUS && d < minD) { activePoi = p; minD = d; }
      if (p.ring && cadence === 0) p.ring.material.opacity = 0.24 + Math.sin(now * 0.004 + p.pos[0]) * 0.1;
    }
    const prevActive = st.activePoi;
    if (activePoi && prevActive !== activePoi.id) { setState({ activePoi: activePoi.id }); showPoiPrompt(activePoi.name); }
    else if (!activePoi && prevActive) { setState({ activePoi: null }); hidePoiPrompt(); }

    // day-night cycle + responses
    if (lighting) {
      lighting.update(dt, roverGroup.position);
      const df = lighting.dayFactor;
      const night = 1 - df;
      for (const h of roverHeadlights) h.intensity = night > 0.35 ? night * 3.2 : 0;
      if (roverSolar) {
        // sun-tracking: tilt panel toward sun elevation; dim output glow at night
        const sunEl = Math.max(0, Math.sin(lighting.t * Math.PI * 2));
        roverSolar.rotation.z = 0.15 + (1 - sunEl) * 0.5;
        roverSolar.children[0].material.emissive && roverSolar.children[0].material.emissive.setScalar(0);
      }
      // facility lights respond: boost point lights at night; traverse less often on phones.
      if (slowCadence === 0) for (const p of poiObjects) {
        p.group.traverse(o => { if (o.isPointLight) { if (o.userData.base === undefined) o.userData.base = o.intensity; o.intensity = o.userData.base * (0.5 + night * 1.6); } });
      }
    }
    if (tour && tour.active) { tour.update(dt, now * 0.001); } else { cameraRig.update(dt, roverGroup, rover.speed, rover.slope); }
    // battery: solar charges with daylight, driving + headlights drain
    {
      const df = lighting ? lighting.dayFactor : 1;
      const charge = df * 2.2;                                   // solar input
      const drain = Math.abs(input.throttle) * 1.1 + (1 - df) * 0.35;  // motors + night systems
      battery = Math.max(0, Math.min(100, battery + (charge - drain) * dt * 0.9));
      updateTelemetry({ speed: rover.speed, heading: rover.heading, logs: getState().completed.size, battery, charging: charge > drain });
    }
    drawMinimap(rover, getState().completed);
    if (audio) audio.updateEngine(rover.speed, input.throttle, dt);
    if (honkCooldown > 0) honkCooldown = Math.max(0, honkCooldown - dt);

    renderer.render(scene, cameraRig.camera);
  } catch (err) {
    frameErrors++;
    if (frameErrors < 5) console.error('[DAWN frame error]', err);
  }
  requestAnimationFrame(frame);
}

init().catch(err => {
  console.error('DAWN boot failure:', err);
  showFatal(err);
  bootProgress(1, 'Failed to initialize — refresh to retry');
  const btn = document.getElementById('landing-start');
  if (btn) { btn.disabled = false; btn.innerHTML = '<span>Retry</span>'; btn.addEventListener('click', () => location.reload()); }
});
