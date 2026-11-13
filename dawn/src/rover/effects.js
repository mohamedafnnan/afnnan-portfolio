/* DAWN v2 — dust trail (instanced), tire tracks, arm sway. */
import {
  InstancedMesh, Object3D, SphereGeometry, MeshBasicMaterial,
  Color, PlaneGeometry, MeshStandardMaterial,
} from 'three';
import { heightAt } from '../scene/terrain.js';

const dummy = new Object3D();

export class DustSystem {
  constructor(scene, capacity = 240) {
    this.capacity = capacity;
    const geom = new SphereGeometry(0.32, 6, 5);
    const mat = new MeshBasicMaterial({ color: 0xcf8a5a, transparent: true, opacity: 0.6, depthWrite: false });
    this.mesh = new InstancedMesh(geom, mat, capacity);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(35048); // DynamicDrawUsage
    scene.add(this.mesh);
    this.particles = [];
    this.cursor = 0;
    // Init all slots hidden
    for (let i = 0; i < capacity; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0.001);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.particles.push({ x: 0, y: -1000, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, scale: 1 });
    }
  }

  emit(x, y, z, vx, vz, intensity) {
    if (intensity <= 0.01) return;
    const p = this.particles[this.cursor];
    p.x = x + (Math.random() - 0.5) * 0.4;
    p.y = y + 0.1;
    p.z = z + (Math.random() - 0.5) * 0.4;
    p.vx = vx * 0.2 + (Math.random() - 0.5) * 0.6;
    p.vy = 0.6 + Math.random() * 0.8;
    p.vz = vz * 0.2 + (Math.random() - 0.5) * 0.6;
    p.life = 0;
    p.maxLife = 0.7 + Math.random() * 0.6;
    p.scale = 0.6 + intensity * 0.9;
    this.cursor = (this.cursor + 1) % this.capacity;
  }

  update(dt) {
    for (let i = 0; i < this.capacity; i++) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        dummy.position.set(0, -1000, 0);
        dummy.scale.setScalar(0.001);
      } else {
        const t = p.life / p.maxLife;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy -= 1.6 * dt;
        p.vx *= 0.94;
        p.vz *= 0.94;
        dummy.position.set(p.x, p.y, p.z);
        const s = p.scale * (1 + t * 1.6);
        dummy.scale.setScalar(s);
      }
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/* Tire tracks — a fading strip of small dark planes. */
export class TrackSystem {
  constructor(scene, capacity = 200) {
    this.capacity = capacity;
    const geom = new PlaneGeometry(0.6, 0.24);
    geom.rotateX(-Math.PI / 2);
    const mat = new MeshBasicMaterial({ color: 0x2a1408, transparent: true, opacity: 0.5, depthWrite: false });
    this.mesh = new InstancedMesh(geom, mat, capacity);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(35048);
    scene.add(this.mesh);
    this.cursor = 0;
    this.stamps = [];
    for (let i = 0; i < capacity; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0.001);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.stamps.push({ x: 0, z: 0, life: 0, maxLife: 6, heading: 0 });
    }
  }

  stamp(x, z, heading) {
    const s = this.stamps[this.cursor];
    s.x = x; s.z = z; s.heading = heading; s.life = 0; s.maxLife = 8 + Math.random() * 4;
    this.cursor = (this.cursor + 1) % this.capacity;
  }

  update(dt) {
    for (let i = 0; i < this.capacity; i++) {
      const s = this.stamps[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        dummy.position.set(0, -1000, 0);
        dummy.scale.setScalar(0.001);
      } else {
        const y = heightAt(s.x, s.z) + 0.02;
        dummy.position.set(s.x, y, s.z);
        dummy.rotation.set(0, s.heading, 0);
        const t = 1 - s.life / s.maxLife;
        dummy.scale.set(1, 1, t);
      }
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
