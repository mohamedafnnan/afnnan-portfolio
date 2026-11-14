/* DAWN — seeded planetary environment. Repeated geology is instanced; only the
   close playable layer contributes physics colliders. */
import {
  InstancedMesh, Object3D, IcosahedronGeometry, DodecahedronGeometry, ConeGeometry,
  MeshStandardMaterial, Mesh, RingGeometry, BoxGeometry, MeshBasicMaterial,
  CylinderGeometry, DoubleSide, Group,
} from 'three';
import { heightAt } from './terrain.js';
import { WORLD } from '../config.js';

const dummy = new Object3D();
const seeded = (seed = 11) => {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; };
};
const randAround = (rng, min, max) => (min + rng() * (max - min));
const validSite = (x, z, min = 22) => Math.hypot(x, z) > min;

export const sharedMaterials = {
  rockDark: new MeshStandardMaterial({ color: 0x4d2a22, roughness: 0.99, metalness: 0.01 }),
  rockLight: new MeshStandardMaterial({ color: 0x98543a, roughness: 0.96, metalness: 0.02 }),
  rockGrey: new MeshStandardMaterial({ color: 0x62514a, roughness: 0.98, metalness: 0.01 }),
  rockOchre: new MeshStandardMaterial({ color: 0xb06b43, roughness: 0.97, metalness: 0.01 }),
  gravel: new MeshStandardMaterial({ color: 0x6f4437, roughness: 1, metalness: 0 }),
  metal: new MeshStandardMaterial({ color: 0xa8a89a, roughness: 0.4, metalness: 0.9 }),
  panel: new MeshStandardMaterial({ color: 0xc9a374, roughness: 0.6, metalness: 0.2 }),
  emissiveAccent: new MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a1a, emissiveIntensity: 1.2, roughness: 0.4 }),
  flag: new MeshStandardMaterial({ color: 0xff9a3c, side: DoubleSide, roughness: 0.7 }),
  dark: new MeshStandardMaterial({ color: 0x1a0a06, roughness: 0.95 }),
};

function placeInstance(mesh, index, x, z, y, scale, rng, tilt = 0.35) {
  dummy.position.set(x, y + scale * 0.24, z);
  dummy.rotation.set((rng() - 0.5) * tilt, rng() * Math.PI * 2, (rng() - 0.5) * tilt);
  dummy.scale.set(scale * randAround(rng, 0.72, 1.34), scale * randAround(rng, 0.62, 1.14), scale * randAround(rng, 0.72, 1.34));
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

/* Foreground/midground: clustered boulders with seeded open corridors. */
export function buildRocks(scene) {
  const rng = seeded(0xAF11A1); // stable layout across reloads
  const lowPower = window.matchMedia('(max-width: 720px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = lowPower ? 420 : 760;
  const a = new IcosahedronGeometry(1, 1); a.scale(1, 0.72, 0.9);
  const b = new DodecahedronGeometry(1, 0); b.scale(1, 0.78, 0.82);
  const c = new IcosahedronGeometry(1, 0); c.scale(1.25, 0.55, 0.72);
  const perMesh = Math.ceil(count / 3);
  const meshes = [
    new InstancedMesh(a, sharedMaterials.rockDark, perMesh),
    new InstancedMesh(b, sharedMaterials.rockLight, perMesh),
    new InstancedMesh(c, sharedMaterials.rockGrey, perMesh),
  ];
  meshes.forEach((m) => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
  // Hide unused slots so rejected overlap candidates never appear at the origin.
  dummy.position.set(0, -1000, 0); dummy.scale.setScalar(0); dummy.updateMatrix();
  meshes.forEach((m) => { for (let i = 0; i < m.count; i++) m.setMatrixAt(i, dummy.matrix); });
  const placements = [];
  const used = [];
  const slots = [0, 0, 0];
  const clusters = Array.from({ length: lowPower ? 11 : 18 }, () => {
    const angle = rng() * Math.PI * 2;
    const radius = randAround(rng, 38, WORLD.radius - 8);
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      spread: randAround(rng, 6, 17),
    };
  });
  for (let i = 0; i < count; i++) {
    const zone = i < count * 0.58 ? 0 : i < count * 0.82 ? 1 : 2;
    let x, z;
    if (zone === 0) {
      const cluster = clusters[Math.floor(rng() * clusters.length)];
      const spread = cluster.spread;
      x = cluster.x + (rng() + rng() - 1) * spread;
      z = cluster.z + (rng() + rng() - 1) * spread;
    } else {
      const radius = zone === 1
        ? randAround(rng, 76, WORLD.radius + 12)
        : randAround(rng, WORLD.radius + 8, WORLD.radius + 46);
      const angle = rng() * Math.PI * 2;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
    }
    if (!validSite(x, z) || used.some((p) => Math.hypot(x - p.x, z - p.z) < 2.8)) continue;
    used.push({ x, z });
    const scale = zone === 0
      ? randAround(rng, 0.45, 3.2)
      : zone === 1 ? randAround(rng, 0.8, 4.6) : randAround(rng, 1.2, 5.2);
    const y = heightAt(x, z);
    const meshIndex = i % 3;
    const slot = slots[meshIndex]++;
    if (slot >= meshes[meshIndex].count) continue;
    placeInstance(meshes[meshIndex], slot, x, z, y, scale, rng);
    placements.push({ x, y: y + scale * 0.24, z, r: scale, meshIndex });
  }
  meshes.forEach((m) => { m.instanceMatrix.needsUpdate = true; });
  return { meshA: meshes[0], meshB: meshes[1], placements };
}

/* Small gravel and broken fragments: lots of visual detail at very low poly cost. */
export function buildSurfaceFragments(scene) {
  const rng = seeded(0x51A7E);
  const count = window.matchMedia('(max-width: 720px)').matches ? 520 : 1400;
  const geom = new IcosahedronGeometry(0.18, 0);
  const mesh = new InstancedMesh(geom, sharedMaterials.gravel, count);
  mesh.castShadow = false; mesh.receiveShadow = true;
  for (let i = 0; i < count; i++) {
    const radius = randAround(rng, 18, WORLD.radius + 26);
    const angle = rng() * Math.PI * 2;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
    const s = randAround(rng, 0.18, 0.7);
    placeInstance(mesh, i, x, z, heightAt(x, z), s, rng, 0.8);
  }
  mesh.instanceMatrix.needsUpdate = true; scene.add(mesh); return mesh;
}

/* Midground geology: layered mesas/outcrops placed beyond the working apron. */
export function buildGeology(scene) {
  const rng = seeded(0xD4A02026);
  const lowPower = window.matchMedia('(max-width: 720px)').matches;
  const group = new Group(); group.name = 'geological-formations';
  const formations = [
    [new ConeGeometry(1, 1, 6), sharedMaterials.rockOchre, lowPower ? 24 : 40],
    [new BoxGeometry(1, 1, 1), sharedMaterials.rockGrey, lowPower ? 20 : 34],
    [new DodecahedronGeometry(1, 0), sharedMaterials.rockDark, lowPower ? 20 : 34],
  ];
  for (const [geometry, material, count] of formations) {
    const mesh = new InstancedMesh(geometry, material, count);
    mesh.castShadow = true; mesh.receiveShadow = true;
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = randAround(rng, WORLD.radius + 25, WORLD.radius + 90);
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
      const scale = randAround(rng, 3, 12);
      dummy.position.set(x, heightAt(x, z) + scale * 0.45, z);
      dummy.rotation.set((rng() - 0.5) * 0.12, rng() * Math.PI, (rng() - 0.5) * 0.12);
      dummy.scale.set(scale * randAround(rng, .65, 1.5), scale * randAround(rng, .8, 2.6), scale * randAround(rng, .7, 1.4));
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true; group.add(mesh);
  }
  scene.add(group); return group;
}

export function buildCraterDetails(scene) {
  const rng = seeded(0xC4A730);
  const count = window.matchMedia('(max-width: 720px)').matches ? 58 : 100;
  const rimGeom = new RingGeometry(0.72, 1.0, 14); rimGeom.rotateX(-Math.PI / 2);
  const rims = new InstancedMesh(rimGeom, sharedMaterials.rockDark, count);
  rims.castShadow = false; rims.receiveShadow = true;
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2, radius = randAround(rng, 24, WORLD.radius + 12);
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius, size = randAround(rng, .7, 3.8);
    dummy.position.set(x, heightAt(x, z) + .025, z); dummy.rotation.set(0, rng() * Math.PI, 0);
    dummy.scale.set(size * randAround(rng, .8, 1.35), 1, size * randAround(rng, .65, 1.25)); dummy.updateMatrix(); rims.setMatrixAt(i, dummy.matrix);
  }
  rims.instanceMatrix.needsUpdate = true; scene.add(rims); return rims;
}

export function buildBowlingPins(scene) {
  const pinGeom = new ConeGeometry(0.35, 1.3, 12); pinGeom.translate(0, 0.65, 0); const pins = [];
  const startX = 18, startZ = -18;
  for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) {
    const x = startX + row * 1.2, z = startZ + (i - row / 2) * 1.1, y = heightAt(x, z);
    const pin = new Mesh(pinGeom, sharedMaterials.flag); pin.position.set(x, y, z); pin.castShadow = pin.receiveShadow = true; pin.userData = { pinIndex: pins.length }; scene.add(pin); pins.push(pin);
  }
  return pins;
}

export function buildLandingRing(scene) {
  const pivot = new Group(); pivot.position.set(0, heightAt(0, 0) + 0.1, 0);
  const ring = new Mesh(new RingGeometry(6, 6.4, 64), new MeshBasicMaterial({ color: 0xff9a3c, side: DoubleSide, transparent: true, opacity: .75 })); ring.rotation.x = -Math.PI / 2; pivot.add(ring);
  const inner = new Mesh(new RingGeometry(3.6, 3.8, 32), new MeshBasicMaterial({ color: 0xff7a1a, side: DoubleSide, transparent: true, opacity: .5 })); inner.rotation.x = -Math.PI / 2; pivot.add(inner); scene.add(pivot); return pivot;
}

export function buildFlag(scene, x, z) {
  const pole = new Mesh(new CylinderGeometry(.05, .05, 3, 8), sharedMaterials.metal);
  const cloth = new Mesh(new BoxGeometry(1.2, .7, .04), sharedMaterials.flag); cloth.position.set(.6, 1.2, 0);
  const g = new Group(); g.add(pole); g.add(cloth); g.position.set(x, heightAt(x, z) + 1.5, z); g.castShadow = true; scene.add(g); return g;
}
