/* DAWN — HUD: minimal telemetry, current objective, field-log counter,
   progressive map, interaction prompt, evidence panels, toasts.
   Styled by /dawn/dawn.css (existing visual identity preserved). */
import { getState, setState, subscribe } from '../util/store.js';
import { POIS } from '../scene/pois3d.js';
import { MISSIONS, FIELD_LOGS } from '../data.js';
import { heightAt } from '../scene/terrain.js';

let root, els = {};
let cb = {};

export function mountHud(uiRoot, callbacks) {
  cb = callbacks || {};
  root = uiRoot;
  root.innerHTML = `
    <div class="hud hud--tl">
      <div class="hud__brand">DAWN <span>· PORTFOLIO FIELD</span></div>
      <div class="hud__sol">SOL 001</div>
    </div>
    <div class="hud hud--tr">
      <div class="hud__row"><span>SPD</span><b id="hud-speed">0.0</b></div>
      <div class="hud__row"><span>HDG</span><b id="hud-heading">000°</b></div>
      <div class="hud__row"><span>LOGS</span><b id="hud-logs">00 / 21</b></div>
      <div class="hud__row hud__row--bat"><span>BAT</span>
        <b id="hud-battery">100%</b></div>
      <div class="hud__battrack"><div class="hud__batfill" id="hud-batfill"></div></div>
    </div>
    <div class="hud hud--objective" id="hud-objective">
      <div class="hud__obj-label">CURRENT OBJECTIVE</div>
      <div class="hud__obj-text" id="hud-obj-text">Roll out</div>
    </div>
    <div class="hud hud--prompt" id="hud-prompt" hidden>
      <kbd>E</kbd> <span id="hud-prompt-text">Interact</span>
    </div>
    <canvas id="hud-map" class="hud__map" width="180" height="180"></canvas>
    <div class="hud hud--buttons">
      <button data-act="tour" title="Guided tour (T)">TOUR</button>
      <button data-act="map" title="Map (M)">MAP</button>
      <button data-act="camera" title="Camera (C)" id="hud-cam-btn">CAM</button>
      <button data-act="guide" title="Guide (?)">?</button>
      <button data-act="photo" title="Photo (P)">PHOTO</button>
      <button data-act="mute" title="Mute">SND</button>
      <button data-act="reset" title="Reset progress">RST</button>
    </div>
    <div class="hud__toast" id="hud-toast" hidden>
      <div class="hud__toast-tag" id="hud-toast-tag"></div>
      <div class="hud__toast-title" id="hud-toast-title"></div>
      <div class="hud__toast-sub" id="hud-toast-sub"></div>
    </div>
    <div class="hud__panel" id="hud-panel" hidden>
      <button class="hud__panel-close" id="hud-panel-close" aria-label="Close">×</button>
      <div class="hud__panel-tag" id="hud-panel-tag"></div>
      <h2 class="hud__panel-title" id="hud-panel-title"></h2>
      <div class="hud__panel-body" id="hud-panel-body"></div>
    </div>
    <div class="hud__guide" id="hud-guide" hidden>
      <h3>FIELD GUIDE</h3>
      <div id="hud-guide-body"></div>
    </div>
  `;
  els = {
    speed: root.querySelector('#hud-speed'),
    heading: root.querySelector('#hud-heading'),
    logs: root.querySelector('#hud-logs'),
    objText: root.querySelector('#hud-obj-text'),
    prompt: root.querySelector('#hud-prompt'),
    promptText: root.querySelector('#hud-prompt-text'),
    map: root.querySelector('#hud-map'),
    toast: root.querySelector('#hud-toast'),
    toastTag: root.querySelector('#hud-toast-tag'),
    toastTitle: root.querySelector('#hud-toast-title'),
    toastSub: root.querySelector('#hud-toast-sub'),
    panel: root.querySelector('#hud-panel'),
    panelTag: root.querySelector('#hud-panel-tag'),
    panelTitle: root.querySelector('#hud-panel-title'),
    panelBody: root.querySelector('#hud-panel-body'),
    panelClose: root.querySelector('#hud-panel-close'),
    guide: root.querySelector('#hud-guide'),
    guideBody: root.querySelector('#hud-guide-body'),
    camBtn: root.querySelector('#hud-cam-btn'),
    battery: root.querySelector('#hud-battery'),
    batfill: root.querySelector('#hud-batfill'),
  };
  els.panelClose.addEventListener('click', () => cb.onClosePanel && cb.onClosePanel());
  root.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.act;
      if (a === 'map') toggleMap();
      else if (a === 'camera') cb.onCameraMode && cb.onCameraMode('cycle');
      else if (a === 'guide') cb.onToggleGuide && cb.onToggleGuide();
      else if (a === 'photo') cb.onTogglePhoto && cb.onTogglePhoto();
      else if (a === 'mute') { const m = !getState().muted; setState({ muted: m }); cb.onToggleMute && cb.onToggleMute(m); btn.classList.toggle('is-off', m); }
      else if (a === 'reset') cb.onReset && cb.onReset();
    });
  });
  buildGuide();
}

/* ---- telemetry ---- */
export function updateTelemetry({ speed = 0, heading = 0, logs = 0, battery = 100, charging = false }) {
  if (!els.speed) return;
  els.speed.textContent = Math.abs(speed * 3.6).toFixed(1); // km/h-ish
  const deg = ((heading * 180 / Math.PI) % 360 + 360) % 360;
  els.heading.textContent = String(Math.round(deg)).padStart(3, '0') + '°';
  els.logs.textContent = String(logs).padStart(2, '0') + ' / 21';
  if (els.battery) {
    els.battery.textContent = Math.round(battery) + '%' + (charging ? ' ⚡' : '');
    els.batfill.style.width = battery + '%';
    els.batfill.style.background = battery > 40 ? '#7fd07a' : battery > 18 ? '#f5c96b' : '#ff5a4a';
  }
}

/* ---- objective ---- */
export function setObjective(text) {
  if (els.objText) els.objText.textContent = text;
}

/* ---- prompt ---- */
export function showPoiPrompt(name) {
  if (!els.prompt) return;
  els.promptText.textContent = `Log · ${name}`;
  els.prompt.hidden = false;
}
export function hidePoiPrompt() { if (els.prompt) els.prompt.hidden = true; }

/* ---- toast ---- */
let toastTimer = null;
export function showToast(tag, title, sub) {
  if (!els.toast) return;
  els.toastTag.textContent = tag;
  els.toastTitle.textContent = title;
  els.toastSub.textContent = sub || '';
  els.toast.hidden = false;
  els.toast.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { els.toast.classList.remove('is-show'); els.toast.hidden = true; }, 3800);
}

/* ---- POI / archive panels ---- */
export function openPoiPanel(poi, bodyHtml) {
  if (!els.panel) return;
  els.panelTag.textContent = 'FIELD LOG · ' + (poi.name || '').toUpperCase();
  els.panelTitle.textContent = poi.name;
  if (poi.id === 'evidence-archive') {
    els.panelBody.innerHTML = bodyHtml + renderEvidenceArchive();
  } else {
    els.panelBody.innerHTML = bodyHtml;
  }
  els.panel.hidden = false;
}
export function closePoiPanel() { if (els.panel) els.panel.hidden = true; }

function renderEvidenceArchive() {
  return `<div class="team"><div class="team__list"><div class="team__card"><b>METRON Vol. IX</b><span>17-page editorial publication</span></div><div class="team__card"><b>Certificates</b><span>Azure AI, HTML/CSS, Python, marketing, and recognition records</span></div><div class="team__card"><b>Navodhayam</b><span>KEAM helpdesk and community information system</span></div><div class="team__card"><b>Instrumentation101</b><span>Technical writing in progress</span></div></div></div>`;
}

/* ---- mission summary ---- */
export function openMissionSummary() {
  if (!els.panel) return;
  els.panelTag.textContent = 'MISSION COMPLETE';
  els.panelTitle.textContent = 'All 21 Field Logs Recovered';
  els.panelBody.innerHTML = `<p>You explored the full DAWN portfolio field — systems, instrumentation, documentation, publication, evidence, and community work.</p><p>Free exploration is open. The field is yours to read.</p>`;
  els.panel.hidden = false;
}

/* ---- guide ---- */
function buildGuide() {
  if (!els.guideBody) return;
  const hints = [['W A S D','Drive'],['Space','Handbrake'],['E','Interact / Log'],['M','Map'],['C','Camera'],['P','Photo'],['R','Reset rover'],['H','Honk'],['Esc','Close']];
  els.guideBody.innerHTML = '<ul>' + hints.map(([k, v]) => `<li><kbd>${k}</kbd> ${v}</li>`).join('') + '</ul>';
}
export function setGuideOpen(open) { if (els.guide) els.guide.hidden = !open; }

/* ---- camera button label ---- */
export function setCameraButton(mode) { if (els.camBtn) els.camBtn.textContent = (mode || 'follow').toUpperCase().slice(0, 6); }
export function setPhotoMode(on) { document.body.classList.toggle('is-photo', !!on); }

/* ---- map (progressive reveal) ---- */
let mapOpen = true;
function toggleMap() { mapOpen = !mapOpen; if (els.map) els.map.style.display = mapOpen ? 'block' : 'none'; }
export function drawMinimap(rover, completed) {
  if (typeof overlay !== 'undefined') return;
  if (!els.map || !mapOpen) return;
  const ctx = els.map.getContext('2d');
  const W = els.map.width, H = els.map.height;
  const scale = W / (240 * 2.2);
  const cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(20,8,4,0.55)';
  ctx.beginPath(); ctx.arc(cx, cy, W / 2 - 2, 0, Math.PI * 2); ctx.fill();
  const discovered = (id) => completed.has(id);
  for (const p of POIS) {
    const px = cx + p.pos[0] * scale, py = cy + p.pos[1] * scale;
    const seen = discovered(p.id);
    ctx.fillStyle = seen ? '#' + p.color.toString(16).padStart(6, '0') : 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.arc(px, py, seen ? 3.5 : 2.2, 0, Math.PI * 2); ctx.fill();
  }
  // player
  const px = cx + rover.x * scale, py = cy + rover.z * scale;
  ctx.save();
  ctx.translate(px, py); ctx.rotate(rover.heading);
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3.5, 3); ctx.lineTo(-3.5, -3); ctx.closePath(); ctx.fill();
  ctx.restore();
}
