/* DAWN — procedural Mars terrain. Multi-octave heightfield + real vertex colors.
   `heightAt` is the single source of truth used by BOTH the render mesh and the
   Rapier physics heightfield, so the visual and collider always agree. */
import {
  PlaneGeometry, Mesh, MeshStandardMaterial, Color, BufferAttribute,
  RepeatWrapping, CanvasTexture, DoubleSide,
} from 'three';
import { WORLD } from '../config.js';

// Deterministic hashed noise
function hash(x, y) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}
function smoothNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function ridge(dist, radius, amp) {
  if (dist >= radius) return 0;
  const t = 1 - dist / radius;
  return t * t * amp;
}

/* Public heightmap. Bigger world, more varied: base plateau, NE ridge, SW canyon,
   crater field, distant hills. World radius enlarged in config. */
export function heightAt(worldX, worldZ) {
  const terrainScale = WORLD.coordinateScale || 1;
  const x = worldX / terrainScale;
  const z = worldZ / terrainScale;
  const s = 0.009;
  let h = 0;
  h += smoothNoise(x * s, z * s) * 10.0;
  h += smoothNoise(x * s * 2.3, z * s * 2.3) * 4.2;
  h += smoothNoise(x * s * 5.1, z * s * 5.1) * 1.5;
  h += smoothNoise(x * s * 12.7, z * s * 12.7) * 0.5;
  // Long wind-shaped dune bands and broad geological shelves keep the horizon
  // from reading as a flat plane while remaining gentle enough for driving.
  h += Math.sin((x * 0.045) + smoothNoise(x * 0.018, z * 0.018) * 3.2) * 1.15;
  h += Math.sin((z * 0.022) - x * 0.008) * 0.85;
  h += ridge(Math.hypot(x + 78, z - 92), 58, 8.5);
  h += ridge(Math.hypot(x - 118, z + 116), 52, 6.5);
  h -= ridge(Math.hypot(x - 12, z - 128), 48, 4.5);

  // Flatten a working apron around the base / facility cluster so buildings sit well.
  const baseD = Math.hypot(x, z);
  if (baseD < 70) h *= (baseD / 70) * 0.55 + 0.25;

  // Observation ridge in the far north-east — the memorable overlook.
  h += ridge(Math.hypot(x - 150, z - 130), 70, 16);
  // Communications knoll.
  h += ridge(Math.hypot(x - 120, z + 64), 30, 6);
  // Testing-grounds berm ring (rolling bumps).
  h += ridge(Math.hypot(x - 92, z - 46), 40, 3.0);
  // South canyon carve.
  const cx = -120, cz = 170;
  const cdist = Math.abs((x - cx) * 0.6 + (z - cz) * 0.4);
  if (cdist < 14 && Math.hypot(x - cx, z - cz) < 90) h -= (1 - cdist / 14) * 8;
  // East crater field — a cluster of rimmed craters.
  const craters = [ [185,-20,22],[168,-46,14],[205,4,16],[176,8,10] ];
  for (const [ccx, ccz, cr] of craters) {
    const d = Math.hypot(x - ccx, z - ccz);
    if (d < cr) { const t = d / cr; h -= (1 - t * t) * 5; }           // bowl
    else if (d < cr * 1.35) { h += (1 - (d - cr) / (cr * 0.35)) * 2.2; } // rim
  }
  // Rolling distant hills toward the world edge for a horizon line.
  const edge = Math.hypot(x, z);
  if (edge > 170) h += (edge - 170) * 0.12 * (0.6 + smoothNoise(x * 0.02, z * 0.02));
  return h - 4;
}

export function slopeAt(x, z) {
  const dx = (heightAt(x + 1.2, z) - heightAt(x - 1.2, z)) / 2.4;
  const dz = (heightAt(x, z + 1.2) - heightAt(x, z - 1.2)) / 2.4;
  return Math.hypot(dx, dz);
}

function makeSandTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const n = (hash(i % size, Math.floor(i / size)) * 0.4 + hash((i * 3) % size, Math.floor(i / (size * 2))) * 0.6);
    const v = 140 + Math.floor(n * 90);
    const r = v + Math.floor((Math.random() - 0.5) * 12);
    const g = Math.floor(r * 0.66);
    const b = Math.floor(r * 0.42);
    const p = i * 4;
    img.data[p] = r; img.data[p + 1] = g; img.data[p + 2] = b; img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(80, 80);
  return tex;
}

export function buildTerrain(scene) {
  const lowPower = window.matchMedia('(max-width: 720px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const segments = lowPower ? 140 : WORLD.terrainSegments;
  const geom = new PlaneGeometry(WORLD.terrainSize, WORLD.terrainSize, segments, segments);
  geom.rotateX(-Math.PI / 2);
  const pos = geom.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cLow = new Color(0x4a2412);
  const cMid = new Color(0xb05a2a);
  const cHigh = new Color(0xeab678);
  const cDust = new Color(0xdca07a);
  const cRock = new Color(0x7a4023);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = heightAt(x, z);
    pos.setY(i, y);
    const c = new Color();
    if (y > 3) c.lerpColors(cMid, cHigh, Math.min(1, (y - 3) / 12));
    else if (y < -6) c.lerpColors(cLow, cMid, Math.min(1, (y + 10) / 5));
    else c.copy(cMid);
    // slope-driven rocky tint so it's not one flat orange
    const sl = slopeAt(x, z);
    if (sl > 0.45) c.lerp(cRock, Math.min(0.7, (sl - 0.45)));
    c.lerp(cDust, 0.10 + hash(x * 3.1, z * 1.7) * 0.10);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute('color', new BufferAttribute(colors, 3));
  geom.computeVertexNormals();
  const mat = new MeshStandardMaterial({ vertexColors: true, map: makeSandTexture(), roughness: 0.98, metalness: 0.02, side: DoubleSide });
  mat.map.anisotropy = 4;
  const mesh = new Mesh(geom, mat);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  scene.add(mesh);
  return { mesh, geom };
}
