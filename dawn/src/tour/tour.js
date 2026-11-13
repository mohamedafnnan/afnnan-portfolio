/* DAWN — guided tour. Automatically walks the player through each rover
   component with smooth cinematic camera transitions + on-screen narration.
   Uses portfolio component descriptions. Esc / button exits and
   hands control straight back to driving. */
import { Vector3, MathUtils, Group, Mesh, RingGeometry, MeshBasicMaterial, DoubleSide } from 'three';
import { COMPONENTS } from '../data.js';

/* A tour stop: where the camera goes (offset from rover) and what it looks at. */
function buildStops() {
  return [
    { key: 'intro',  title: 'DAWN — Guided Tour', text: 'Let\u2019s walk around the rover. Six stops, each on a real system. Press \u25b8 to advance or Esc to exit.', cam: [5.5, 3.2, 5.5], look: [0, 0.8, 0], focus: null },
    { key: 'susp',   title: COMPONENTS[0].name,    text: COMPONENTS[0].desc,  cam: [-4.5, 1.6, 4.2], look: [-0.8, 0.5, 0], focus: [-0.9, 0.4, 0.9] },
    { key: 'arm',    title: COMPONENTS[1].name,    text: COMPONENTS[1].desc,  cam: [4.2, 2.4, -3.2], look: [1.0, 1.2, 0], focus: [1.1, 1.2, 0] },
    { key: 'nav',    title: COMPONENTS[2].name,    text: COMPONENTS[2].desc,  cam: [0.2, 3.4, -5.2], look: [0, 1.0, 0], focus: [0, 1.4, 0] },
    { key: 'power',  title: COMPONENTS[3].name,    text: COMPONENTS[3].desc,  cam: [-4.6, 2.2, -3.6], look: [-0.9, 0.8, 0], focus: [-0.9, 0.9, -0.4] },
    { key: 'ctrl',   title: COMPONENTS[4].name,    text: COMPONENTS[4].desc,  cam: [4.6, 1.8, 3.4],  look: [0.6, 0.9, 0], focus: [0.4, 1.0, 0.3] },
    { key: 'struct', title: COMPONENTS[5].name,    text: COMPONENTS[5].desc,  cam: [0, 6.0, 0.5],   look: [0, 0.5, 0], focus: [0, 0.7, 0] },
  ];
}

export class Tour {
  constructor(cameraRig, roverGroup, armCtl) {
    this.rig = cameraRig;
    this.rover = roverGroup;
    this.armCtl = armCtl;
    this.active = false;
    this.idx = 0;
    this.stops = buildStops();
    this.el = null;
    this.highlight = null;
    this._camPos = new Vector3();
    this._look = new Vector3();
    this._t = 0;
    this._stepT = 0;
    this.autoAdvance = true;
  }

  _ui() {
    this.el = document.createElement('div');
    this.el.className = 'dtour';
    this.el.innerHTML = `
      <div class="dtour__bar">
        <div class="dtour__progress" id="dtour-progress"></div>
        <div class="dtour__count" id="dtour-count"></div>
      </div>
      <div class="dtour__card">
        <div class="dtour__tag">GUIDED TOUR</div>
        <h3 class="dtour__title" id="dtour-title"></h3>
        <p class="dtour__text" id="dtour-text"></p>
        <div class="dtour__controls">
          <button class="dtour__btn" data-tour="prev">\u25c2 Prev</button>
          <button class="dtour__btn dtour__btn--next" data-tour="next">Next \u25b8</button>
          <button class="dtour__btn dtour__btn--exit" data-tour="exit">Exit (Esc)</button>
        </div>
      </div>`;
    document.getElementById('ui-root').appendChild(this.el);
    this.el.querySelector('[data-tour="next"]').addEventListener('click', () => this.next());
    this.el.querySelector('[data-tour="prev"]').addEventListener('click', () => this.prev());
    this.el.querySelector('[data-tour="exit"]').addEventListener('click', () => this.stop());
    // narration highlighter ring (follows the rover, points at the part)
    this.highlight = new Mesh(new RingGeometry(0.5, 0.62, 32),
      new MeshBasicMaterial({ color: 0xff7a1a, side: DoubleSide, transparent: true, opacity: 0.85 }));
    this.highlight.rotation.x = -Math.PI / 2;
    this.highlight.visible = false;
    this.rover.add(this.highlight);
  }

  start() {
    if (this.active) return;
    if (!this.el) this._ui();
    this.active = true;
    this.idx = 0;
    this.el.classList.add('is-on');
    this._applyStop(true);
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    if (this.el) { this.el.classList.remove('is-on'); }
    if (this.highlight) this.highlight.visible = false;
    // hand control back to driving camera
    this.rig.setMode('follow', this.rover);
  }

  next() { this.idx = Math.min(this.idx + 1, this.stops.length - 1); this._applyStop(); if (this.idx === this.stops.length - 1) this.autoAdvance = false; }
  prev() { this.idx = Math.max(this.idx - 1, 0); this._applyStop(); }

  _applyStop(snap = false) {
    const s = this.stops[this.idx];
    document.getElementById('dtour-title').textContent = s.title;
    document.getElementById('dtour-text').textContent = s.text;
    document.getElementById('dtour-count').textContent = `${this.idx + 1} / ${this.stops.length}`;
    document.getElementById('dtour-progress').style.width = `${((this.idx + 1) / this.stops.length) * 100}%`;
    this._stepT = 0;
    // move highlight to the part
    if (s.focus) {
      this.highlight.visible = true;
      this.highlight.position.set(s.focus[0], 0.06, s.focus[2]);
    } else {
      this.highlight.visible = false;
    }
    // arm gesture on the arm stop
    if (this.armCtl) this.armCtl.tourFocus = (s.key === 'arm');
    if (snap) {
      this._camPos.set(...s.cam); this._look.set(...s.look);
    }
  }

  /* Called every frame from the main loop while active. */
  update(dt, time) {
    if (!this.active) return;
    const s = this.stops[this.idx];
    this._stepT += dt;
    // cinematic drift: ease toward stop offset with a slow orbit
    const drift = Math.sin(time * 0.4) * 0.4;
    const targetCam = new Vector3(s.cam[0] + drift, s.cam[1], s.cam[2] + drift * 0.6);
    this._camPos.lerp(targetCam, 1 - Math.exp(-1.8 * dt));
    this._look.lerp(new Vector3(...s.look), 1 - Math.exp(-3 * dt));
    // place camera in rover-local space, then to world
    const worldCam = this._camPos.clone().applyQuaternion(this.rover.quaternion).add(this.rover.position);
    const worldLook = this._look.clone().applyQuaternion(this.rover.quaternion).add(this.rover.position);
    this.rig.camera.position.copy(worldCam);
    this.rig.camera.lookAt(worldLook);
    // auto-advance
    if (this.autoAdvance && this._stepT > 5.2) this.next();
    // pulse highlight
    if (this.highlight && this.highlight.visible) {
      const sc = 1 + Math.sin(time * 3) * 0.12;
      this.highlight.scale.set(sc, sc, sc);
    }
  }
}
