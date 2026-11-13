/* DAWN — POIs as real outpost facilities. Each POI builds a distinctive
   structure (see facilities.js) plus an interaction ring + beacon light. */
import { WORLD_POIS } from '../data.js';
import { buildFacility, POI_RING_INNER } from './facilities.js';

export const POIS = WORLD_POIS;
export const POI_RADIUS = POI_RING_INNER + 1;   // interaction radius

export function buildAllPois(scene) {
  const built = [];
  for (const p of POIS) {
    const { group, ring } = buildFacility(p);
    scene.add(group);
    // beacon orb for HUD pulse / discovery feedback
    const orb = ring; // reuse ring for emissive pulse
    built.push({ ...p, group, orb, ring });
  }
  return built;
}
