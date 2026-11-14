/* DAWN — purpose-built outpost facilities. A small set of distinctive,
   coherent structures (not dozens of generic boxes). Shared materials keep the
   whole facility visually unified. Everything is fictional outpost design. */
import {
  Group, Mesh, BoxGeometry, CylinderGeometry, SphereGeometry, ConeGeometry,
  TorusGeometry, RingGeometry, PlaneGeometry, MeshStandardMaterial, MeshBasicMaterial,
  PointLight, Color, DoubleSide,
} from 'three';
import { heightAt } from './terrain.js';
import { sharedMaterials } from './environment.js';

const M = sharedMaterials;
function box(w, h, d, mat, x = 0, y = 0, z = 0, shadow = true) {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  if (shadow) { m.castShadow = m.receiveShadow = true; }
  return m;
}
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 10) {
  const m = new Mesh(new CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function glowMat(color, intensity = 1.2) {
  return new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.5 });
}

/* Scattered props use a local seeded sequence so every visit has the same outpost layout. */
function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function scatterProps(g, radius = 8, count = 10) {
  const random = seeded((Math.round(radius * 1009) + count * 917 + g.children.length * 131) >>> 0);
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2, r = 4 + random() * radius;
    const kind = random();
    let p;
    if (kind < 0.35) p = box(0.7, 0.7, 0.7, M.panel, 0, 0.35, 0);          // crate
    else if (kind < 0.6) p = box(0.4, 1.1, 0.4, M.metal, 0, 0.55, 0);      // cabinet
    else if (kind < 0.8) p = cyl(0.28, 0.28, 0.9, M.dark, 0, 0.45, 0, 8);  // canister
    else p = box(1.4, 0.12, 0.5, M.metal, 0, 0.5, 0);                      // workbench
    p.position.x = Math.cos(a) * r;
    p.position.z = Math.sin(a) * r;
    p.rotation.y = random() * Math.PI;
    g.add(p);
  }
}

/* ---- Signature facility builders keyed by POI.kind ---- */
const facilityBuilders = {
  base(color) {
    const g = new Group();
    const pad = cyl(7, 7.4, 0.3, M.panel, 0, 0.15, 0, 24);
    g.add(pad);
    const ring = new Mesh(new RingGeometry(5.4, 5.9, 40), new MeshBasicMaterial({ color, side: DoubleSide, transparent: true, opacity: 0.5 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.32; g.add(ring);
    // The rover pad stays visually open so the rover chassis and arm workcell
    // remain readable from the follow camera; no oversized dark gantry occludes it.
    scatterProps(g, 9, 12);
    return g;
  },
  control(color) {
    const g = new Group();
    // modular mission-control block with observation strip + antenna
    g.add(box(10, 3.4, 6, M.panel, 0, 1.7, 0));
    g.add(box(10.4, 0.5, 6.4, M.dark, 0, 3.6, 0));
    // cool/neutral window strip
    const win = box(9.4, 1.0, 0.15, glowMat(0xbfe6ea, 0.9), 0, 2.1, 3.02, false);
    g.add(win);
    g.add(box(3, 2.2, 4, M.panel, 6.4, 1.1, -1));      // annex
    const mast = cyl(0.12, 0.16, 6, M.metal, -3.5, 6.4, -2); g.add(mast);
    const dish = new Mesh(new SphereGeometry(1.0, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.metal);
    dish.rotation.x = Math.PI; dish.position.set(-3.5, 8.2, -2); g.add(dish);
    const blink = new Mesh(new SphereGeometry(0.16, 8, 8), glowMat(0xff4444, 2)); blink.position.set(-3.5, 9.6, -2); g.add(blink);
    const pl = new PointLight(0xbfe6ea, 0.9, 22, 2); pl.position.set(0, 3.2, 4); g.add(pl);
    scatterProps(g, 8, 8);
    return g;
  },
  garage(color) {
    const g = new Group();
    // warm industrial workshop with a big garage opening
    g.add(box(11, 4.2, 8, M.panel, 0, 2.1, 0));
    g.add(box(11.4, 0.5, 8.4, M.dark, 0, 4.4, 0));
    const door = box(5.5, 3.4, 0.2, M.dark, 0, 1.7, 4.02, false); g.add(door);
    const doorGlow = box(5.0, 0.25, 0.1, glowMat(0xffb36b, 1.4), 0, 3.3, 4.06, false); g.add(doorGlow);
    // rooftop vents + work lights
    g.add(cyl(0.4, 0.5, 1.0, M.metal, -3, 4.9, -2));
    g.add(cyl(0.4, 0.5, 1.0, M.metal, 3, 4.9, -2));
    const pl = new PointLight(0xffb36b, 1.1, 24, 2); pl.position.set(0, 3, 5); g.add(pl);
    // maintenance platform
    g.add(box(6, 0.15, 2.4, M.metal, 0, 0.5, 6.5));
    scatterProps(g, 9, 14);
    return g;
  },
  lab(color) {
    const g = new Group();
    g.add(box(7, 3.0, 5.4, M.panel, 0, 1.5, 0));
    g.add(box(7.3, 0.4, 5.7, M.dark, 0, 3.2, 0));
    const strip = box(6.4, 0.5, 0.12, glowMat(color, 1.0), 0, 2.4, 2.72, false); g.add(strip);
    // technical panels / consoles out front
    for (let i = -1; i <= 1; i++) {
      const cons = box(1.1, 1.1, 0.5, M.dark, i * 1.6, 0.55, 3.4);
      cons.rotation.x = -0.18; g.add(cons);
      const scr = box(0.9, 0.6, 0.05, glowMat(color, 1.1), i * 1.6, 1.0, 3.62, false); g.add(scr);
    }
    const pl = new PointLight(color, 0.7, 16, 2); pl.position.set(0, 2.6, 3.6); g.add(pl);
    scatterProps(g, 7, 7);
    return g;
  },
  arm(color) {
    const g = new Group();
    const pad = cyl(5, 5.3, 0.25, M.panel, 0, 0.12, 0, 20); g.add(pad);
    // inspection platform + marked sample targets
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const t = cyl(0.4, 0.5, 0.5, M.rockLight, Math.cos(a) * 3.4, 0.25, Math.sin(a) * 3.4);
      g.add(t);
      const mk = new Mesh(new SphereGeometry(0.16, 8, 8), glowMat(color, 1.4));
      mk.position.set(Math.cos(a) * 3.4, 0.65, Math.sin(a) * 3.4); g.add(mk);
    }
    g.add(box(2.6, 0.14, 2.6, M.metal, 0, 0.4, 0));
    const pl = new PointLight(color, 0.8, 16, 2); pl.position.set(0, 3, 0); g.add(pl);
    return g;
  },
  range(color) {
    const g = new Group();
    // waypoint gates + ramp + obstacle markers for the driving test
    for (let i = 0; i < 5; i++) {
      const gx = (i - 2) * 5;
      const l = cyl(0.1, 0.1, 2.6, M.metal, gx - 1.2, 1.3, i * 6 - 12);
      const r = cyl(0.1, 0.1, 2.6, M.metal, gx + 1.2, 1.3, i * 6 - 12);
      const bar = box(2.6, 0.12, 0.12, glowMat(color, 1.1), gx, 2.5, i * 6 - 12, false);
      g.add(l, r, bar);
    }
    const ramp = box(4, 0.2, 5, M.metal, 8, 0.9, 0); ramp.rotation.z = 0.28; g.add(ramp);
    scatterProps(g, 12, 8);
    return g;
  },
  tower(color) {
    const g = new Group();
    g.add(cyl(1.6, 2.0, 0.6, M.metal, 0, 0.3, 0, 8));
    const mast = cyl(0.18, 0.26, 12, M.metal, 0, 6.5, 0, 6); g.add(mast);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const d = new Mesh(new SphereGeometry(0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.panel);
      d.rotation.x = Math.PI; d.position.set(Math.cos(a) * 2.4, 4 + i * 2.2, Math.sin(a) * 2.4); g.add(d);
    }
    const beacon = new Mesh(new SphereGeometry(0.2, 8, 8), glowMat(0xff3333, 2)); beacon.position.set(0, 12.6, 0); g.add(beacon);
    g.add(box(1.4, 1.6, 0.8, M.dark, 2.2, 0.8, 1.5));   // tech cabinet
    const pl = new PointLight(0xffe2a8, 0.8, 18, 2); pl.position.set(0, 8, 0); g.add(pl);
    return g;
  },
  solar(color) {
    const g = new Group();
    const panelMat = new MeshStandardMaterial({ color: 0x1a2a5a, metalness: 0.9, roughness: 0.2 });
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) {
      const p = box(2.6, 0.06, 1.7, panelMat, (i - 1.5) * 3.2, 1.3, (r - 1) * 3.0);
      p.rotation.x = -0.42; g.add(p);
      g.add(cyl(0.09, 0.09, 1.3, M.metal, (i - 1.5) * 3.2, 0.65, (r - 1) * 3.0));
    }
    g.add(box(1.4, 1.6, 0.8, M.dark, 7, 0.8, 0));
    const pl = new PointLight(0xffe2a8, 0.5, 16, 2); pl.position.set(0, 3, 0); g.add(pl);
    return g;
  },
  dome(color) {
    const g = new Group();
    const dome = new Mesh(new SphereGeometry(3.4, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new MeshStandardMaterial({ color: 0xc0d4e0, metalness: 0.3, roughness: 0.4, emissive: 0x223344, emissiveIntensity: 0.35 }));
    dome.castShadow = dome.receiveShadow = true; g.add(dome);
    g.add(box(1.0, 1.7, 0.2, M.dark, 0, 0.85, 3.36));
    scatterProps(g, 7, 6);
    return g;
  },
  monument(color) {
    const g = new Group();
    g.add(cyl(2.6, 2.9, 0.6, M.rockDark, 0, 0.3, 0, 8));
    const spike = new Mesh(new ConeGeometry(0.9, 4.6, 6), glowMat(color, 0.5));
    spike.position.y = 2.9; spike.castShadow = true; g.add(spike);
    const pl = new PointLight(color, 0.8, 18, 2); pl.position.set(0, 4, 0); g.add(pl);
    return g;
  },
  ridge(color) {
    const g = new Group();
    const mast = cyl(0.1, 0.14, 4, M.metal, 0, 2, 0); g.add(mast);
    const flag = box(1.3, 0.75, 0.05, M.flag, 0.65, 3.3, 0); g.add(flag);
    const beacon = new Mesh(new SphereGeometry(0.5, 12, 10), glowMat(color, 1.2)); beacon.position.y = 4.4; g.add(beacon);
    const pl = new PointLight(color, 0.8, 20, 2); pl.position.set(0, 4.4, 0); g.add(pl);
    return g;
  },
  gallery(color) {
    const g = new Group();
    const t = new Mesh(new TorusGeometry(3.4, 0.3, 8, 18, Math.PI), M.rockLight);
    t.rotation.x = Math.PI / 2; t.position.y = 3.4; t.castShadow = true; g.add(t);
    for (let i = -2; i <= 2; i++) {
      const p = box(0.85, 1.15, 0.06, new MeshStandardMaterial({ color: new Color().setHSL(0.08 + i * 0.03, 0.5, 0.5), roughness: 0.6 }), i * 1.35, 1.7 + Math.abs(i) * 0.35, 0);
      g.add(p);
    }
    return g;
  },
  hub(color) {
    const g = new Group();
    g.add(box(6, 2.8, 5, M.panel, 0, 1.4, 0));
    g.add(box(6.3, 0.4, 5.3, M.dark, 0, 3.0, 0));
    const strip = box(5.4, 0.4, 0.12, glowMat(color, 1.0), 0, 2.2, 2.52, false); g.add(strip);
    scatterProps(g, 7, 6);
    return g;
  },
  pad(color) {
    const g = new Group();
    g.add(cyl(3.4, 3.7, 0.2, M.panel, 0, 0.1, 0, 20));
    const ring = new Mesh(new RingGeometry(2.4, 2.8, 32), new MeshBasicMaterial({ color, side: DoubleSide, transparent: true, opacity: 0.5 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.22; g.add(ring);
    return g;
  },
};

/* Build a facility structure + a soft proximity ring for a POI. */
export function buildFacility(poi) {
  const build = facilityBuilders[poi.kind] || facilityBuilders.pad;
  const group = build(poi.color);
  const [px, pz] = poi.pos;
  group.position.set(px, heightAt(px, pz), pz);
  // interaction ring
  const ring = new Mesh(new RingGeometry(POI_RING_INNER, POI_RING_INNER + 0.5, 40),
    new MeshBasicMaterial({ color: poi.color, side: DoubleSide, transparent: true, opacity: 0.32 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.12;
  group.add(ring);
  group.traverse(o => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
  return { group, ring };
}
export const POI_RING_INNER = 9;
