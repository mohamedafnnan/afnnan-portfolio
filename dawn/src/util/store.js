/* DAWN v2 — tiny reactive store (no dependency). */

const listeners = new Set();

const state = {
  loaded: false,
  started: false,
  paused: false,
  reducedMotion: false,
  quality: 'auto',              // 'performance' | 'quality' | 'auto'
  cameraMode: 'follow',         // 'follow' | 'orbit' | 'wide' | 'fpv'
  photoMode: false,
  mapOpen: false,
  guideOpen: false,
  activePoi: null,              // POI id currently in range
  openPoi: null,                // POI id currently open in panel
  completed: new Set(),         // POI ids the user has logged
  rover: { x: 0, y: 0, z: 0, heading: 0, speed: 0, slope: 0, roll: 0, pitch: 0 },
  fps: 60,
  bootProgress: 0,
  bootStatus: 'Preparing surface uplink…',
};

export function getState() { return state; }

export function setState(patch) {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state, patch);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function announce(text) {
  const el = document.getElementById('announcer');
  if (el) {
    el.textContent = '';
    // force screen readers to re-announce
    requestAnimationFrame(() => { el.textContent = text; });
  }
}
