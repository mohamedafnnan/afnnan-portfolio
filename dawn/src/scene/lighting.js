/* DAWN — day-night cycle. The sun orbits over time; sky, fog, hemisphere and
   ambient all track it. Exposes refs + dayFactor so the rover headlights, solar
   panels, and facility lights respond to the lighting conditions. */
import { DirectionalLight, HemisphereLight, Fog, Color, AmbientLight } from 'three';
import { WORLD } from '../config.js';

const CYCLE = 240;             // seconds per full sol
const daySky = new Color(0x8a3410), nightSky = new Color(0x0a0508);
const dayFog = new Color(0x8a3410), nightFog = new Color(0x120a08);
const daySun = new Color(0xffdcb2), duskSun = new Color(0xff6a1a), nightSun = new Color(0x223);
const _sunDir = new Color();

export function buildLighting(scene) {
  scene.fog = new Fog(0x8a3410, WORLD.fogNear, WORLD.fogFar);
  scene.background = new Color(0x1a0a06);

  const hemi = new HemisphereLight(0xffcc99, 0x552211, 0.6);
  scene.add(hemi);
  const ambient = new AmbientLight(0x442211, 0.15);
  scene.add(ambient);

  const sun = new DirectionalLight(WORLD.sunColor, 2.2);
  sun.position.set(60, 90, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048; sun.shadow.mapSize.height = 2048;
  const s = 60;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
  sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 240;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun); scene.add(sun.target);

  const state = { sun, hemi, ambient, t: 0.3, dayFactor: 1 };   // start mid-morning

  state.update = (dt, roverPos) => {
    state.t = (state.t + dt / CYCLE) % 1;
    const ang = state.t * Math.PI * 2;                 // 0 = sunrise
    const elev = Math.sin(ang);                        // -1..1
    const df = Math.max(0, Math.min(1, (elev + 0.12) / 0.5)); // 0 at night, 1 in day
    state.dayFactor = df;
    // sun position on an arc
    sun.position.set(Math.cos(ang) * 90, Math.max(6, elev * 90), 45);
    if (roverPos) sun.target.position.copy(roverPos);
    // intensity + color
    sun.intensity = 0.15 + df * 2.1;
    _sunDir.copy(nightSun).lerp(duskSun, Math.min(1, df * 2)).lerp(daySun, Math.max(0, df - 0.4) / 0.6);
    sun.color.copy(_sunDir);
    hemi.intensity = 0.18 + df * 0.5;
    ambient.intensity = 0.06 + df * 0.12;
    // sky + fog
    scene.background.copy(nightSky).lerp(daySky, df);
    scene.fog.color.copy(nightFog).lerp(dayFog, df);
  };
  return state;
}
