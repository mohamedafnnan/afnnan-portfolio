/* DAWN v2 — Fireworks burst on mission complete. */
import {
  Points, BufferGeometry, BufferAttribute, PointsMaterial, Color, AdditiveBlending,
} from 'three';

export class Fireworks {
  constructor(scene) {
    this.scene = scene;
    this.bursts = [];
  }

  launch(x, y, z, color = 0xff7a1a) {
    const count = 220;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const c = new Color(color);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 6 + Math.random() * 8;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
      const hueShift = (Math.random() - 0.5) * 0.15;
      const cc = new Color().setHSL((c.getHSL({}).h + hueShift + 1) % 1, 0.9, 0.5 + Math.random() * 0.3);
      colors[i * 3] = cc.r; colors[i * 3 + 1] = cc.g; colors[i * 3 + 2] = cc.b;
    }
    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(positions, 3));
    geom.setAttribute('color', new BufferAttribute(colors, 3));
    const mat = new PointsMaterial({
      size: 0.5, vertexColors: true, transparent: true, opacity: 1,
      blending: AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const points = new Points(geom, mat);
    this.scene.add(points);
    this.bursts.push({ points, velocities, life: 0, maxLife: 2.4 });
  }

  update(dt) {
    for (let k = this.bursts.length - 1; k >= 0; k--) {
      const b = this.bursts[k];
      b.life += dt;
      const pos = b.points.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += b.velocities[i] * dt;
        pos[i + 1] += b.velocities[i + 1] * dt;
        pos[i + 2] += b.velocities[i + 2] * dt;
        b.velocities[i + 1] -= 6 * dt; // gravity
        b.velocities[i] *= 0.98;
        b.velocities[i + 2] *= 0.98;
      }
      b.points.geometry.attributes.position.needsUpdate = true;
      b.points.material.opacity = 1 - b.life / b.maxLife;
      if (b.life >= b.maxLife) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        b.points.material.dispose();
        this.bursts.splice(k, 1);
      }
    }
  }
}
