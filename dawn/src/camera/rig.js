/* DAWN v2 — Camera rig with follow / orbit (OrbitControls) / wide / fpv modes. */
import { PerspectiveCamera, Vector3, Quaternion, MathUtils } from 'three';
import { OrbitControls } from 'three/addons/controls/orbitcontrols.js';
import { CAMERA, ROVER } from '../config.js';
import { damp, clamp } from '../util/math.js';

export class CameraRig {
  constructor(renderer) {
    this.camera = new PerspectiveCamera(CAMERA.fovBase, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far);
    this.camera.position.set(-14, 8, 6);
    this.mode = 'follow';
    this.lookTarget = new Vector3();
    this.desiredPos = new Vector3();
    this.shake = 0;
    this.impulse = 0;
    this.renderer = renderer;
    this.orbit = new OrbitControls(this.camera, renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.1;
    this.orbit.enablePan = false;
    this.orbit.minDistance = 5;
    this.orbit.maxDistance = 60;
    this.orbit.maxPolarAngle = Math.PI * 0.48;
    this.orbit.enabled = false;
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  setMode(mode, roverGroup) {
    if (this.mode === 'fpv' && roverGroup) {
      // Remove camera from rover if we were in fpv
      roverGroup.remove(this.camera);
    }
    this.mode = mode;
    this.orbit.enabled = (mode === 'orbit');
    if (mode === 'fpv' && roverGroup) {
      roverGroup.add(this.camera);
      this.camera.position.set(0.4, 1.6, 0);
    }
  }

  addShake(amount) {
    this.impulse = Math.max(this.impulse, amount);
  }

  update(dt, rover, speed, slope) {
    // FOV punch based on speed
    const speedNorm = clamp(Math.abs(speed) / 14, 0, 1);
    const targetFov = CAMERA.fovBase + speedNorm * CAMERA.fovBoost;
    this.camera.fov = damp(this.camera.fov, targetFov, 3, dt);
    this.camera.updateProjectionMatrix();

    // Shake decay
    this.shake = damp(this.shake, this.impulse, 8, dt);
    this.impulse = Math.max(0, this.impulse - dt * CAMERA.shakeDecay);
    // Slope contributes to shake if driving fast
    if (Math.abs(speed) > 3) this.impulse = Math.max(this.impulse, slope * 0.4);

    const rq = rover.quaternion;
    const forward = new Vector3(1, 0, 0).applyQuaternion(rq);

    if (this.mode === 'follow') {
      const behind = forward.clone().multiplyScalar(-CAMERA.followDistance);
      this.desiredPos.copy(rover.position).add(behind).add(new Vector3(0, CAMERA.followHeight, 0));
      this.camera.position.lerp(this.desiredPos, 1 - Math.exp(-CAMERA.followLag * dt));
      this.lookTarget.lerp(rover.position.clone().add(new Vector3(0, 1, 0)), 1 - Math.exp(-CAMERA.lookLag * dt));
      this.camera.lookAt(this.lookTarget);
    } else if (this.mode === 'wide') {
      const behind = forward.clone().multiplyScalar(-CAMERA.wideDistance);
      this.desiredPos.copy(rover.position).add(behind).add(new Vector3(0, CAMERA.wideHeight, 0));
      this.camera.position.lerp(this.desiredPos, 1 - Math.exp(-3 * dt));
      this.lookTarget.lerp(rover.position, 1 - Math.exp(-4 * dt));
      this.camera.lookAt(this.lookTarget);
    } else if (this.mode === 'orbit') {
      this.orbit.target.copy(rover.position);
      this.orbit.update();
    } else if (this.mode === 'fpv') {
      // Camera is parented to rover; no manual updates needed except an internal lookAt for horizon stability
      // The parent transform gives us pitch/roll naturally.
    }

    // Apply shake (in follow/wide/fpv)
    if (this.mode !== 'orbit' && this.shake > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shake * 0.4;
      this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.3;
      this.camera.position.z += (Math.random() - 0.5) * this.shake * 0.4;
    }
  }
}
