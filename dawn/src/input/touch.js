/* DAWN v2 — Touch drive pad + action buttons. */
import { getState } from '../util/store.js';

let state = { up: false, down: false, left: false, right: false, brake: false };
const listeners = new Set();

function bindHold(el, on, off) {
  const start = (e) => { e.preventDefault(); on(); el.classList.add('is-pressed'); };
  const end = (e) => { off(); el.classList.remove('is-pressed'); };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', end);
}

export function initTouch(container) {
  const pad = document.createElement('div');
  pad.className = 'touch-drive';
  pad.innerHTML = `
    <button class="touch-drive__up" aria-label="Forward" data-t="up">▲</button>
    <button class="touch-drive__left" aria-label="Left" data-t="left">◀</button>
    <button class="touch-drive__brake" aria-label="Brake" data-t="brake">BRAKE</button>
    <button class="touch-drive__right" aria-label="Right" data-t="right">▶</button>
    <button class="touch-drive__down" aria-label="Reverse" data-t="down">▼</button>
  `;
  container.appendChild(pad);

  pad.querySelectorAll('button').forEach(b => {
    const t = b.dataset.t;
    bindHold(b, () => { state[t] = true; }, () => { state[t] = false; });
  });

  const actions = document.createElement('div');
  actions.className = 'touch-actions';
  actions.innerHTML = `
    <button data-a="e" aria-label="Log field marker">LOG</button>
    <button data-a="h" aria-label="Honk">HONK</button>
    <button data-a="c" aria-label="Camera">CAM</button>
    <button data-a="?" aria-label="Field guide">?</button>
  `;
  container.appendChild(actions);

  actions.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      for (const fn of listeners) fn(b.dataset.a);
    });
  });
}

export function onTouchAction(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function readTouchInput() {
  const st = getState();
  const paused = st.paused || st.openPoi || st.guideOpen;
  if (paused) return { throttle: 0, steer: 0, handbrake: false };
  let throttle = 0, steer = 0;
  if (state.up) throttle += 1;
  if (state.down) throttle -= 1;
  if (state.left) steer -= 1;
  if (state.right) steer += 1;
  return { throttle, steer, handbrake: state.brake, brake: false };
}

export function hasTouchInput() {
  return state.up || state.down || state.left || state.right || state.brake;
}
