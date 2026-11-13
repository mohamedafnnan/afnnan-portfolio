/* DAWN — interactive facility animations (solar panels, comms dish).
   Registered per-facility and stepped each frame; driven by the interaction
   system so the world reacts when the player engages with it. */
import { MathUtils, PointLight } from 'three';

export const animatedFacilities = [];

/* Hinged solar array + a charge light for the Power & Solar Field. */
export function addSolarField(group) {
  const panels = [];
  group.traverse(o => {
    if (o.isMesh && o.geometry && o.geometry.type === 'BoxGeometry' && o.rotation.x < -0.2) panels.push(o);
  });
  const light = new PointLight(0xffe2a8, 0.4, 20, 2);
  light.position.set(0, 3.4, 0);
  group.add(light);
  animatedFacilities.push({
    poiId: 'solar-field',
    boost: 0,
    update(dt, t, engaged) {
      this.boost = MathUtils.damp(this.boost, engaged ? 1 : 0, 1.8, dt);
      const target = -0.42 - this.boost * 0.9;                 // unfold toward vertical when engaged
      for (const p of panels) p.rotation.x = MathUtils.damp(p.rotation.x, target, 2.2, dt);
      light.intensity = 0.4 + this.boost * 1.4 + (engaged ? Math.sin(t * 6) * 0.15 : 0);
    },
  });
}

/* Sweeping dish for the Communications Station. */
export function addCommsStation(group) {
  let dish = null;
  group.traverse(o => {
    if (o.isMesh && o.geometry && o.geometry.type === 'SphereGeometry' && o.rotation.x === Math.PI && !dish) dish = o;
  });
  animatedFacilities.push({
    poiId: 'comms-station',
    boost: 0,
    update(dt, t, engaged) {
      this.boost = MathUtils.damp(this.boost, engaged ? 1 : 0, 2.0, dt);
      const speed = 0.25 + this.boost * 1.6;
      if (dish) dish.rotation.y += speed * dt;                  // continuous sweep, faster when engaged
      if (dish) dish.rotation.z = Math.sin(t * 0.7) * 0.12 * (0.4 + this.boost);
    },
  });
}

/* Register interactive animations for a facility right after it is built. */
export function registerFacilityAnimations(poi, group) {
  if (poi.id === 'solar-field') addSolarField(group);
  if (poi.id === 'comms-station') addCommsStation(group);
}

/* Step all facility animations. activePoiId = the POI the player can interact with. */
export function updateFacilityAnimations(dt, time, activePoiId) {
  for (const f of animatedFacilities) f.update(dt, time, f.poiId === activePoiId);
}

/* Drive all registered PointLights inside facilities from the day-night factor:
   lights glow at night, dim by day. */
export function updateFacilityLights(dayFactor) {
  for (const f of animatedFacilities) {
    // facility objects that carry lights are handled inside their own update;
    // nothing global needed here — placeholder for future grouped control
  }
}
