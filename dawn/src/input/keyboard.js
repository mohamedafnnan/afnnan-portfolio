/* DAWN v2 — Keyboard input. Provides steering/throttle plus one-shot events. */
import { getState } from '../util/store.js';

const keys = new Set();
const onceListeners = new Set();
const oncePressed = new Set();

function isTypingContext() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

export function initKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (isTypingContext()) return;
    if (e.defaultPrevented) return;
    const k = e.key.toLowerCase();
    // Steering/throttle keys — prevent scroll
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) {
      e.preventDefault();
    }
    if (!keys.has(k)) {
      keys.add(k);
      for (const fn of onceListeners) fn(k, e);
    }
  }, false);
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
  }, false);
  window.addEventListener('blur', () => keys.clear());
}

export function readInput() {
  const st = getState();
  const paused = st.paused || st.openPoi || st.guideOpen;
  if (paused) return { throttle: 0, steer: 0, brake: false, handbrake: false };

  let throttle = 0;
  let steer = 0;
  if (keys.has('w') || keys.has('arrowup')) throttle += 1;
  if (keys.has('s') || keys.has('arrowdown')) throttle -= 1;
  if (keys.has('a') || keys.has('arrowleft')) steer -= 1;
  if (keys.has('d') || keys.has('arrowright')) steer += 1;
  const brake = false;
  const handbrake = keys.has(' ');
  return { throttle, steer, brake, handbrake };
}

export function onKey(fn) { onceListeners.add(fn); return () => onceListeners.delete(fn); }
export function isDown(k) { return keys.has(k.toLowerCase()); }
