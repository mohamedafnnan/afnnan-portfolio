/* DAWN map metadata — portfolio-only labels and evidence context. */
import { WORLD_POIS, MISSIONS } from '../data.js';
import { getState } from '../util/store.js';

const META = {
  'dawn-base': { icon: '⌂', tag: 'ORIGIN', zone: 'PORTFOLIO', type: 'Personal field interface', preview: 'A navigable portfolio by Mohamed Afnnan Veettilayil, built around engineering, communication, and evidence.' },
  'mission-control': { icon: '◉', tag: 'MISSION', zone: 'PORTFOLIO RECORD', type: 'Route overview', preview: 'A route through selected work, field notes, credentials, and independent learning.' },
  'meet-dawn': { icon: '◇', tag: 'DAWN', zone: 'SYSTEMS THINKING', type: 'Interactive portfolio', preview: 'A 3D interface for exploring engineering interests and the connections between systems, evidence, and practice.' },
  'mechanical-bay': { icon: '✣', tag: 'ENGINEERING', zone: 'APPLIED', type: 'Structure & resilience', preview: 'A portfolio lens on mechanisms, hardware, and the practical discipline of making systems hold together.' },
  'electrical-bay': { icon: '▣', tag: 'INSTRUMENTATION', zone: 'APPLIED', type: 'Signals & measurement', preview: 'A field note about reading signals, measuring what is happening, and making decisions from useful information.' },
  'control-bay': { icon: '⌁', tag: 'CONTROLS', zone: 'APPLIED', type: 'Human-machine interface', preview: 'The point where an intention becomes an action — a useful frame for controls, documentation, and clear interfaces.' },
  'autonomy-bay': { icon: '∿', tag: 'LEARNING', zone: 'CURIOSITY', type: 'Independent exploration', preview: 'A marker for the questions still being explored across automation, OT security, embedded systems, and robotics.' },
  'workshop': { icon: '⚒', tag: 'BUILD', zone: 'PROJECT WORK', type: 'Making & testing', preview: 'The workshop represents the cycle of building, testing, documenting, and improving a project.' },
  'arm-demo': { icon: '⌘', tag: 'DETAIL', zone: 'SYSTEMS THINKING', type: 'Precision & interfaces', preview: 'A reminder that small interfaces and mechanical details shape how a system is understood and used.' },
  'testing-grounds': { icon: '≫', tag: 'FIELD NOTE', zone: 'ENGINEERING', type: 'Interactive test range', preview: 'A playable testing context for thinking about constraints, feedback, and practical iteration.' },
  'comms-station': { icon: '╋', tag: 'DOCUMENTATION', zone: 'COMMUNICATION', type: 'Clear signal', preview: 'A marker for the work of turning technical material into something another person can follow.' },
  'solar-field': { icon: '✦', tag: 'SYSTEMS', zone: 'ENGINEERING', type: 'Resources & efficiency', preview: 'A portfolio prompt about precision, efficiency, and improving systems without wasting resources.' },
  'field-research': { icon: '⌬', tag: 'INVESTIGATION', zone: 'CURIOSITY', type: 'Questions in context', preview: 'A space for independent learning, research questions, and the habit of asking what the system is actually doing.' },
  'evidence-archive': { icon: '◎', tag: 'EVIDENCE', zone: 'PORTFOLIO RECORD', type: 'Certificates & publication', preview: 'Open the supporting files: METRON Vol. IX, certificates, recognition, and project documentation.' },
  'irc-memorial': { icon: '★', tag: 'FIELD NOTE', zone: 'PORTFOLIO RECORD', type: 'Milestone log', preview: 'A milestone marker for the way project records, reflections, and dated notes make work legible.' },
  'sddr-review': { icon: '▤', tag: 'REVIEW', zone: 'DOCUMENTATION', type: 'Evidence review', preview: 'A review point for connecting claims to supporting files, clear roles, and honest project context.' },
  'portfolio-archive': { icon: '▥', tag: 'ARCHIVE', zone: 'PORTFOLIO', type: 'Selected work', preview: 'METRON Vol. IX and Navodhayam extend the portfolio beyond the rover into editorial design and community information systems.' },
  'observation-ridge': { icon: '⌃', tag: 'OVERVIEW', zone: 'PORTFOLIO', type: 'Survey view', preview: 'A high-level view across engineering, writing, design, community, and learning.' },
  'south-canyon': { icon: '∧', tag: 'FIELD NOTE', zone: 'CURIOSITY', type: 'Rough terrain', preview: 'A reminder that progress can be uneven; the useful response is to observe, document, and try again.' },
  'east-craters': { icon: '◌', tag: 'FIELD NOTE', zone: 'ENGINEERING', type: 'Constraint study', preview: 'A rough-terrain marker for thinking through constraints and practical trade-offs.' },
  'far-gate': { icon: '⚑', tag: 'NEXT', zone: 'LEARNING', type: 'Open question', preview: 'The edge of the current record — where the next project, certificate, or field note can begin.' },
};

const ZONE_META = {
  base: { label: 'BASE CAMP', color: '#ffb066' },
  engineering: { label: 'ENGINEERING', color: '#e07a3a' },
  testing: { label: 'TEST RANGE', color: '#7fd0d4' },
  field: { label: 'FIELD SECTOR', color: '#8adb8a' },
  far: { label: 'FRONTIER', color: '#c084ff' },
};

let overlay;
let listEl;
let canvas;
let detailEl;
let objectiveEl;
let roverReadoutEl;
let progressEl;
let tooltipEl;
let closeTimer;
let lastMapDrawAt = 0;
let lastReadoutAt = 0;
const mapLowPower = window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 720px)').matches;
let openState = false;
let roverRef = null;
let selectedId = 'dawn-base';

const html = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const getPoi = (id) => WORLD_POIS.find((poi) => poi.id === id) || WORLD_POIS[0];
const getMeta = (poi) => META[poi.id] || { icon: '·', tag: 'SITE', zone: 'UNSURVEYED', type: 'Site', preview: '' };
const colorHex = (number) => `#${number.toString(16).padStart(6, '0')}`;
const foundCount = () => getState().completed.size;

function formatDistance(poi) {
  if (!roverRef) return '—';
  return `${Math.round(Math.hypot(poi.pos[0] - roverRef.x, poi.pos[1] - roverRef.z))} m from rover`;
}

function formatCoordinates(poi) {
  const [x, z] = poi.pos;
  return `${x >= 0 ? 'E' : 'W'} ${Math.abs(x).toString().padStart(3, '0')} · ${z >= 0 ? 'S' : 'N'} ${Math.abs(z).toString().padStart(3, '0')}`;
}

function activeObjective() {
  const state = getState();
  const active = state.activePoi || selectedId;
  return MISSIONS.find((mission) => mission.poi === active) || MISSIONS[MISSIONS.length - 1];
}

export function initMap(container) {
  overlay = document.createElement('div');
  overlay.className = 'dmap';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'dmap-title');
  overlay.innerHTML = `
    <div class="dmap__head">
      <div class="dmap__head-copy">
        <div class="dmap__eyebrow"><span class="dmap__tag">EXPEDITION MAP</span><span class="dmap__live"><i></i> LIVE SURVEY</span></div>
        <h2 id="dmap-title">DAWN / Official Project Survey</h2>
        <p>Verified project record from FISAT Rover Team · interactive field locations are labeled where the official site does not publish coordinates.</p><a class="dmap__source" href="https://fisatrover.in/" target="_blank" rel="noreferrer">OFFICIAL SOURCE · FISATROVER.IN ↗</a>
      </div>
      <button class="dmap__close" aria-label="Close expedition map" type="button">×</button>
    </div>
    <div class="dmap__body">
      <section class="dmap__map-shell" aria-label="Outpost map">
        <div class="dmap__map-topline"><span>SECTOR GRID · 001</span><span id="dmap-rover-coords">ROVER / ACQUIRING</span></div>
        <div class="dmap__canvas-wrap"><canvas class="dmap__canvas" width="620" height="620" tabindex="0" role="img" aria-label="Interactive DAWN project survey map. Select a marker for verified project or labeled interactive field information."></canvas><div class="dmap__tooltip" role="status" aria-hidden="true"></div></div>
        <div class="dmap__map-hint">SELECT A MARKER TO INSPECT · HOVER FOR DETAILS</div>
        <div class="dmap__legend" aria-label="Map legend">
          <span><i style="--legend:#ffb066"></i> BASE</span>
          <span><i style="--legend:#e07a3a"></i> ENGINEERING</span>
          <span><i style="--legend:#7fd0d4"></i> TESTING</span>
          <span><i style="--legend:#8adb8a"></i> FIELD</span>
          <span><i style="--legend:#c084ff"></i> FRONTIER</span>
          <span><b class="dmap__legend-rover"></b> ROVER</span>
        </div>
      </section>
      <aside class="dmap__side">
        <section class="dmap__card dmap__telemetry-card">
          <div class="dmap__card-head"><span>ROVER TELEMETRY</span><b>DAWN / V2</b></div>
          <div class="dmap__telemetry-grid" id="dmap-rover-readout">
            <div><span>POSITION</span><strong>ACQUIRING</strong></div>
            <div><span>HEADING</span><strong>000°</strong></div>
            <div><span>SPEED</span><strong>0.0 km/h</strong></div>
            <div><span>STATUS</span><strong class="is-green">READY</strong></div>
          </div>
        </section>
        <section class="dmap__card dmap__objective-card">
          <div class="dmap__card-head"><span>NEXT TRANSMISSION</span><b id="dmap-progress">00 / 21 LOGS</b></div>
          <strong class="dmap__objective-title" id="dmap-objective-title">Free Exploration</strong>
          <p id="dmap-objective-text">The outpost is yours. Find every field log.</p>
          <div class="dmap__progress-track"><i id="dmap-progress-bar"></i></div>
        </section>
        <section class="dmap__detail" id="dmap-detail" aria-live="polite"></section>
        <section class="dmap__sites">
          <div class="dmap__sites-head"><div><span class="dmap__tag">SURVEY INDEX</span><h3>Project &amp; field index</h3></div><span id="dmap-sites-count">00 / 21 FOUND</span></div>
          <div class="dmap__list" role="listbox" aria-label="Field locations"></div>
        </section>
      </aside>
    </div>`;

  container.appendChild(overlay);
  canvas = overlay.querySelector('.dmap__canvas');
  tooltipEl = overlay.querySelector('.dmap__tooltip');
  listEl = overlay.querySelector('.dmap__list');
  detailEl = overlay.querySelector('#dmap-detail');
  objectiveEl = overlay.querySelector('.dmap__objective-card');
  roverReadoutEl = overlay.querySelector('#dmap-rover-readout');
  progressEl = overlay.querySelector('#dmap-progress');

  overlay.querySelector('.dmap__close').addEventListener('click', (event) => {
    event.stopPropagation();
    setMapOpen(false);
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) setMapOpen(false);
  });
  overlay.addEventListener('pointerdown', (event) => event.stopPropagation());
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('pointermove', handleCanvasPointerMove);
  canvas.addEventListener('pointerleave', hideTooltip);
  canvas.addEventListener('focus', () => showTooltip(getPoi(selectedId)));
  canvas.addEventListener('blur', hideTooltip);
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMapOpen(false);
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPoi(selectedId);
    }
  });

  selectedId = getState().activePoi || selectedId;
  renderList();
  renderDetails();
  renderObjective();
  updateProgress();
}

export function setMapOpen(open) {
  openState = Boolean(open);
  if (!overlay) return;
  clearTimeout(closeTimer);
  if (openState) {
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('is-closing');
    requestAnimationFrame(() => overlay.classList.add('is-on'));
  } else {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-on');
    overlay.classList.add('is-closing');
    closeTimer = setTimeout(() => overlay.classList.remove('is-closing'), 240);
    hideTooltip();
  }
  if (openState) {
    selectedId = getState().activePoi || selectedId;
    renderList();
    renderDetails();
    renderObjective();
    updateProgress();
    updateRoverReadout();
    drawMap();
    requestAnimationFrame(() => overlay?.querySelector('.dmap__close')?.focus());
  }
}

export function isMapOpen() {
  return openState;
}

export function setMapRover(rover) {
  roverRef = rover;
  if (!openState) return;
  drawMap();
  const now = performance.now();
  const interval = mapLowPower ? 120 : 55;
  if (now - lastReadoutAt > interval) {
    lastReadoutAt = now;
    updateRoverReadout();
    renderDetails();
  }
}

function renderList() {
  if (!listEl) return;
  const completed = getState().completed;
  listEl.innerHTML = WORLD_POIS.map((poi) => {
    const meta = getMeta(poi);
    const seen = completed.has(poi.id);
    const selected = selectedId === poi.id;
    const zone = ZONE_META[poi.zone] || { color: '#ffb066' };
    return `<button class="dmap__item ${seen ? 'is-found' : 'is-hidden'} ${selected ? 'is-selected' : ''}" data-id="${html(poi.id)}" type="button" role="option" aria-selected="${selected}" style="--c:${zone.color}">
      <span class="dmap__icon" aria-hidden="true">${meta.icon}</span>
      <span class="dmap__meta"><span class="dmap__name">${html(poi.name)}</span><span class="dmap__tagrow">${html(meta.tag)} · ${html(meta.zone)}</span><span class="dmap__preview">${seen ? html(meta.preview) : 'Undiscovered — drive here to reveal.'}</span></span>
      <span class="dmap__item-state" aria-hidden="true">${seen ? 'FOUND' : 'LOCKED'}</span>
    </button>`;
  }).join('');
  listEl.querySelectorAll('.dmap__item').forEach((item) => {
    item.addEventListener('click', () => selectPoi(item.dataset.id));
  });
  const sitesCount = overlay?.querySelector('#dmap-sites-count');
  if (sitesCount) sitesCount.textContent = `${foundCount().toString().padStart(2, '0')} / ${WORLD_POIS.length} FOUND`;
}

function selectPoi(id) {
  const poi = getPoi(id);
  selectedId = poi.id;
  renderList();
  renderDetails();
  drawMap();
  const selected = listEl?.querySelector(`[data-id="${CSS.escape(poi.id)}"]`);
  selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function renderDetails() {
  if (!detailEl) return;
  const poi = getPoi(selectedId);
  const meta = getMeta(poi);
  const completed = getState().completed;
  const seen = completed.has(poi.id);
  const objective = MISSIONS.find((mission) => mission.poi === poi.id);
  detailEl.innerHTML = `
    <div class="dmap__detail-head"><div><span class="dmap__tag">${html(meta.tag)}</span><h3>${html(poi.name)}</h3></div><span class="dmap__detail-status ${seen ? 'is-found' : 'is-locked'}">${seen ? 'FIELD LOG FOUND' : 'LOCKED'}</span></div>
    <div class="dmap__detail-meta"><span>${html(meta.zone)}</span><span>${html(meta.type)}</span><span>${html(formatCoordinates(poi))}</span></div>
    <p>${seen ? html(meta.preview) : 'This location is outside the recovered field record. Approach the marker in the rover to unlock its briefing and add it to the mission archive.'}</p>
    <div class="dmap__detail-foot"><span>${html(formatDistance(poi))}</span>${objective ? `<span>MISSION · ${html(objective.title)}</span>` : '<span>FIELD SURVEY</span>'}</div>`;
}

function renderObjective() {
  if (!objectiveEl) return;
  const mission = activeObjective();
  const title = objectiveEl.querySelector('#dmap-objective-title');
  const text = objectiveEl.querySelector('#dmap-objective-text');
  if (title) title.textContent = mission.title;
  if (text) text.textContent = mission.brief;
}

function updateProgress() {
  const count = foundCount();
  if (progressEl) progressEl.textContent = `${count.toString().padStart(2, '0')} / ${WORLD_POIS.length} LOGS`;
  const bar = overlay?.querySelector('#dmap-progress-bar');
  if (bar) bar.style.width = `${(count / WORLD_POIS.length) * 100}%`;
}

function updateRoverReadout() {
  if (!roverReadoutEl || !roverRef) return;
  const heading = ((roverRef.heading * 180 / Math.PI) % 360 + 360) % 360;
  roverReadoutEl.innerHTML = `<div><span>POSITION</span><strong>${roverRef.x >= 0 ? 'E' : 'W'} ${Math.abs(roverRef.x).toFixed(0)} / ${roverRef.z >= 0 ? 'S' : 'N'} ${Math.abs(roverRef.z).toFixed(0)}</strong></div>
    <div><span>HEADING</span><strong>${Math.round(heading).toString().padStart(3, '0')}°</strong></div>
    <div><span>SPEED</span><strong>${Math.abs(roverRef.speed * 3.6).toFixed(1)} km/h</strong></div>
    <div><span>STATUS</span><strong class="${Math.abs(roverRef.speed) > 0.1 ? 'is-orange' : 'is-green'}">${Math.abs(roverRef.speed) > 0.1 ? 'TRAVERSING' : 'STANDBY'}</strong></div>`;
  const coords = overlay?.querySelector('#dmap-rover-coords');
  if (coords) coords.textContent = `ROVER / ${roverRef.x.toFixed(0)}, ${roverRef.z.toFixed(0)}`;
}

const MAP_WORLD_SPAN = 170;
function getScale(width, height) {
  return (Math.min(width, height) / 2 - 24) / MAP_WORLD_SPAN;
}

function worldToCanvas(x, z, width, height) {
  const scale = getScale(width, height);
  return { x: width / 2 + x * scale, y: height / 2 + z * scale, scale };
}

function drawMap() {
  if (!canvas || !openState) return;
  const now = performance.now();
  if (mapLowPower && now - lastMapDrawAt < 42) return;
  lastMapDrawAt = now;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const scale = getScale(W, H);
  const completed = getState().completed;
  const selectedPoi = getPoi(selectedId);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#170b07';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255, 176, 102, 0.09)';
  ctx.lineWidth = 1;
  for (let x = -160; x <= 160; x += 32) {
    const px = cx + x * scale;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
  }
  for (let z = -160; z <= 160; z += 32) {
    const py = cy + z * scale;
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 176, 102, 0.22)';
  ctx.setLineDash([5, 8]);
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.setLineDash([]);
  for (const radius of [45, 90, 135]) {
    ctx.strokeStyle = 'rgba(255, 150, 80, 0.14)';
    ctx.beginPath(); ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2); ctx.stroke();
  }

  const zoneLabels = [
    ['BASE CAMP', 10, -12, '#ffb066'],
    ['ENGINEERING', -51, -45, '#e07a3a'],
    ['TEST RANGE', 67, 45, '#7fd0d4'],
    ['FIELD SECTOR', -46, 78, '#8adb8a'],
    ['FRONTIER', 79, -93, '#c084ff'],
  ];
  ctx.font = '600 10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  for (const [label, x, z, color] of zoneLabels) {
    const point = worldToCanvas(x, z, W, H);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fillText(label, point.x, point.y);
  }
  ctx.globalAlpha = 1;
  drawRoute(ctx, roverRef, selectedPoi, W, H);

  for (const poi of WORLD_POIS) {
    const point = worldToCanvas(poi.pos[0], poi.pos[1], W, H);
    const meta = getMeta(poi);
    const seen = completed.has(poi.id);
    const selected = poi.id === selectedPoi.id;
    const zone = ZONE_META[poi.zone] || { color: '#ffb066' };
    const isActive = poi.id === getState().activePoi;

    if (selected || isActive) {
      ctx.strokeStyle = selected ? zone.color : '#ff7a1a';
      ctx.globalAlpha = selected ? 0.85 : 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(point.x, point.y, selected ? 13 : 10, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = seen ? colorHex(poi.color) : 'rgba(255, 233, 210, 0.25)';
    ctx.beginPath(); ctx.arc(point.x, point.y, selected ? 7 : seen ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
    if (seen || selected || isActive) {
      ctx.font = selected ? '700 11px JetBrains Mono, monospace' : '600 9px JetBrains Mono, monospace';
      ctx.fillStyle = selected ? '#ffe9d2' : 'rgba(255, 233, 210, 0.72)';
      ctx.fillText(poi.name.toUpperCase(), point.x, point.y - (selected ? 15 : 10));
    }
    ctx.font = '11px system-ui';
    ctx.fillStyle = zone.color;
    ctx.fillText(meta.icon, point.x, point.y + 4);
  }

  if (roverRef) {
    const point = worldToCanvas(roverRef.x, roverRef.z, W, H);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(roverRef.heading);
    ctx.fillStyle = '#ff7a1a';
    ctx.shadowColor = 'rgba(255, 122, 26, 0.7)';
    ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-7, 6); ctx.lineTo(-7, -6); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  }
}

function handleCanvasPointerMove(event) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  let nearest = null;
  let nearestDistance = Infinity;
  for (const poi of WORLD_POIS) {
    const point = worldToCanvas(poi.pos[0], poi.pos[1], canvas.width, canvas.height);
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < nearestDistance) { nearest = poi; nearestDistance = distance; }
  }
  if (nearest && nearestDistance < 22) showTooltip(nearest, event.clientX - rect.left, event.clientY - rect.top);
  else hideTooltip();
}

function showTooltip(poi, x = null, y = null) {
  if (!tooltipEl || !poi) return;
  const meta = getMeta(poi);
  const seen = getState().completed.has(poi.id);
  tooltipEl.innerHTML = `<span class="dmap__tooltip-tag">${html(meta.tag)} · ${html(meta.zone)}</span><strong>${html(poi.name)}</strong><span>${seen ? 'FIELD LOG FOUND' : 'UNDISCOVERED'} · ${html(formatDistance(poi))}</span>`;
  tooltipEl.setAttribute('aria-hidden', 'false');
  if (x !== null && y !== null) {
    tooltipEl.style.left = `${Math.min(Math.max(x + 14, 10), canvas.clientWidth - 190)}px`;
    tooltipEl.style.top = `${Math.max(y - 18, 10)}px`;
  }
}

function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.setAttribute('aria-hidden', 'true');
}

function drawRoute(ctx, rover, poi, width, height) {
  if (!rover || !poi) return;
  const start = worldToCanvas(rover.x, rover.z, width, height);
  const end = worldToCanvas(poi.pos[0], poi.pos[1], width, height);
  if (Math.hypot(end.x - start.x, end.y - start.y) < 4) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = 'rgba(255, 122, 26, .26)';
  ctx.shadowColor = 'rgba(255, 122, 26, .42)';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffd09a';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffb066';
  ctx.beginPath(); ctx.arc(end.x, end.y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function handleCanvasClick(event) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  const scale = getScale(canvas.width, canvas.height);
  let nearest = null;
  let nearestDistance = Infinity;
  for (const poi of WORLD_POIS) {
    const point = worldToCanvas(poi.pos[0], poi.pos[1], canvas.width, canvas.height);
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < nearestDistance) { nearest = poi; nearestDistance = distance; }
  }
  if (nearest && nearestDistance < Math.max(18, scale * 13)) selectPoi(nearest.id);
}

export { drawMap };
