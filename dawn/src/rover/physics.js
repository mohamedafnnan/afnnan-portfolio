/* DAWN v2 — Rapier physics world: heightfield terrain, rover vehicle, static rocks. */
import RAPIER from 'rapier';
import { Vector3, Quaternion } from 'three';
import { WORLD, ROVER } from '../config.js';
import { heightAt } from '../scene/terrain.js';

export class PhysicsWorld {
  constructor() {
    this.world = null;
    this.rover = null;
    this.wheels = [];   // { anchor, dir, axle, restLength, radius, isFront, isPowered }
    this.pins = [];
    this.ready = false;
    this.recovery = { active: false, elapsed: 0, reason: '', triggerCount: 0 };
    this._worldUp = new Vector3(0, 1, 0);
    this._recoveryUp = new Vector3();
    this._recoveryTarget = new Quaternion();
  }

  async init() {
    await RAPIER.init();
    const gravity = { x: 0.0, y: WORLD.gravity, z: 0.0 };
    this.world = new RAPIER.World(gravity);
    this._buildHeightfield();
    this.ready = true;
  }

  _buildHeightfield() {
    // Rapier's heightfield: rows x cols, sampled on unit grid.
    const nrows = 160;
    const ncols = 160;
    const size = WORLD.terrainSize;
    const scale = { x: size, y: 1, z: size };
    const heights = new Float32Array(nrows * ncols);
    // Rapier expects: heights[i * ncols + j], mapped to
    //   x = (i / (nrows-1) - 0.5) * scale.x
    //   z = (j / (ncols-1) - 0.5) * scale.z
    for (let i = 0; i < nrows; i++) {
      for (let j = 0; j < ncols; j++) {
        const x = (i / (nrows - 1) - 0.5) * size;
        const z = (j / (ncols - 1) - 0.5) * size;
        heights[i * ncols + j] = heightAt(x, z);
      }
    }
    const bodyDesc = RAPIER.RigidBodyDesc.fixed();
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.heightfield(nrows - 1, ncols - 1, heights, scale)
      .setFriction(1.4)
      .setRestitution(0);
    this.world.createCollider(colDesc, body);
    this.terrainBody = body;
  }

  createRover(startX, startZ) {
    const y = heightAt(startX, startZ) + 1.4;
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(startX, y, startZ)
      .setLinearDamping(0.12)
      .setAngularDamping(0.6)
      .setCcdEnabled(true);
    const body = this.world.createRigidBody(bodyDesc);
    // Chassis collider — small box, heavy
    const size = ROVER.chassisSize;
    const colDesc = RAPIER.ColliderDesc.cuboid(size[0] / 2, size[1] / 2, size[2] / 2)
      .setDensity(ROVER.chassisMass / (size[0] * size[1] * size[2]))
      .setFriction(0.9)
      .setRestitution(0.05);
    this.world.createCollider(colDesc, body);

    // Set up the "vehicle" via a raycast wheel controller (manual approach because
    // DynamicRayCastVehicleController isn't available in the compat build we ship).
    const wheels = [];
    const offsets = [
      [+ROVER.wheelSpacingX, -ROVER.chassisSize[1] / 2, +ROVER.wheelSpacingZ, true, false, 0],
      [+ROVER.wheelSpacingX, -ROVER.chassisSize[1] / 2, -ROVER.wheelSpacingZ, true, false, 1],
      [0,                     -ROVER.chassisSize[1] / 2, +ROVER.wheelSpacingZ, false, false, 2],
      [0,                     -ROVER.chassisSize[1] / 2, -ROVER.wheelSpacingZ, false, false, 3],
      [-ROVER.wheelSpacingX, -ROVER.chassisSize[1] / 2, +ROVER.wheelSpacingZ, false, true, 4],
      [-ROVER.wheelSpacingX, -ROVER.chassisSize[1] / 2, -ROVER.wheelSpacingZ, false, true, 5],
    ];
    for (const [x, y, z, isFront, isRear, idx] of offsets) {
      wheels.push({
        anchor: new Vector3(x, y, z),
        radius: ROVER.wheelRadius,
        restLength: ROVER.wheelSuspensionRest,
        isFront,
        isRear,
        idx,
        isPowered: true,          // all 6 driven
        isSteered: isFront,       // only fronts steer
        // per-wheel dynamic state
        spinAngle: 0,
        contactY: 0,
        grounded: false,
      });
    }

    this.rover = body;
    this.wheels = wheels;
    return { body, wheels };
  }

  _beginRecovery(reason) {
    if (!this.rover || this.recovery.active) return;
    this.recovery.active = true;
    this.recovery.elapsed = 0;
    this.recovery.reason = reason;
    this.recovery.triggerCount += 1;
    const velocity = this.rover.linvel();
    this.rover.setLinvel({ x: velocity.x * 0.1, y: 0, z: velocity.z * 0.1 }, true);
    this.rover.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }

  /* Detect a rollover/impact and blend the chassis back to its yaw-only pose.
     The correction is deliberately damped and owns only the recovery window;
     ordinary wheel forces and Rapier dynamics resume as soon as the chassis is
     settled on its wheels. */
  _updateRecovery(dt) {
    const body = this.rover;
    const q = body.rotation();
    const current = new Quaternion(q.x, q.y, q.z, q.w);
    const up = this._recoveryUp.set(0, 1, 0).applyQuaternion(current);
    const pos = body.translation();
    const groundY = heightAt(pos.x, pos.z);
    const tipped = up.y < 0.72;   // trigger recovery earlier — any lean > ~44°
    const sunk = pos.y < groundY + 0.55;

    if (!this.recovery.active) {
      if (!tipped && !sunk) return false;
      this._beginRecovery(tipped ? 'rollover' : 'impact');
    }

    this.recovery.elapsed += dt;
    const yaw = Math.atan2(
      2 * (current.w * current.y + current.x * current.z),
      1 - 2 * (current.y * current.y + current.x * current.x),
    );
    this._recoveryTarget.setFromAxisAngle(this._worldUp, yaw);
    // Faster slerp so the rover visibly rights itself within ~0.5 s
    current.slerp(this._recoveryTarget, 1 - Math.exp(-10 * dt));
    body.setRotation({ x: current.x, y: current.y, z: current.z, w: current.w }, true);

    // Lift the chassis back above ground as it rotates upright
    const targetY = groundY + 1.45;
    const nextY = pos.y + (targetY - pos.y) * (1 - Math.exp(-8 * dt));
    body.setTranslation({ x: pos.x, y: nextY, z: pos.z }, true);
    const velocity = body.linvel();
    body.setLinvel({ x: velocity.x * 0.1, y: 0, z: velocity.z * 0.1 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);

    const settledUp = this._recoveryUp.set(0, 1, 0).applyQuaternion(current).y > 0.98;
    if (this.recovery.elapsed > 0.5 && settledUp) {
      this.recovery.active = false;
      this.recovery.elapsed = 0;
      this.recovery.reason = '';
    }
    return true;
  }

  /* Manual raycast-wheel integrator.
     Each frame: raycast down from each wheel's world position, apply a spring
     force along that ray, plus a friction impulse in the chassis's lateral axis,
     plus drive/brake force along the forward axis. */
  step(dt, input) {
    if (!this.rover) return;
    const body = this.rover;
    const world = this.world;

    if (this._updateRecovery(dt)) {
      this.steerAngleCurrent = this.steerAngle || 0;
      this.speed = 0;
      this.anyGrounded = 0;
      for (const w of this.wheels) {
        w.grounded = false;
        w.contactY = body.translation().y - w.restLength - w.radius;
      }
      world.step();
      return;
    }

    // Chassis basis
    const q = body.rotation();
    const worldQ = new Quaternion(q.x, q.y, q.z, q.w);
    const forward = new Vector3(1, 0, 0).applyQuaternion(worldQ);
    const right = new Vector3(0, 0, 1).applyQuaternion(worldQ);
    const up = new Vector3(0, 1, 0).applyQuaternion(worldQ);
    const pos = body.translation();
    const posV = new Vector3(pos.x, pos.y, pos.z);

    // Steering
    const targetSteer = input.steer * ROVER.maxSteer;
    if (this.steerAngle === undefined) this.steerAngle = 0;
    const steerDelta = targetSteer - this.steerAngle;
    this.steerAngle += Math.max(-ROVER.steerSpeed * dt, Math.min(ROVER.steerSpeed * dt, steerDelta));

    // Forward velocity in chassis frame
    const linvel = body.linvel();
    const velV = new Vector3(linvel.x, linvel.y, linvel.z);
    const speedFwd = velV.dot(forward);

    let anyGrounded = 0;

    // Raycast every wheel
    for (const w of this.wheels) {
      const worldAnchor = w.anchor.clone().applyQuaternion(worldQ).add(posV);
      const rayDir = up.clone().multiplyScalar(-1);
      const rayLen = w.restLength + w.radius + 0.35;
      const ray = new RAPIER.Ray(
        { x: worldAnchor.x, y: worldAnchor.y, z: worldAnchor.z },
        { x: rayDir.x, y: rayDir.y, z: rayDir.z },
      );
      const hit = world.castRay(ray, rayLen, true, undefined, undefined, undefined, body);
      if (hit) {
        const hitDist = hit.timeOfImpact;
        const restLen = w.restLength + w.radius;
        const compress = Math.max(0, restLen - hitDist);
        w.grounded = true;
        w.contactY = worldAnchor.y - hitDist;
        anyGrounded++;

        // Use the sampled terrain normal for both suspension and traction. This keeps
        // contact planted on a grade instead of pushing mostly into the downhill side.
        const sample = 1.15;
        const gradeX = (heightAt(worldAnchor.x + sample, worldAnchor.z) - heightAt(worldAnchor.x - sample, worldAnchor.z)) / (2 * sample);
        const gradeZ = (heightAt(worldAnchor.x, worldAnchor.z + sample) - heightAt(worldAnchor.x, worldAnchor.z - sample)) / (2 * sample);
        const surfaceNormal = new Vector3(-gradeX, 1, -gradeZ).normalize();

        // Spring force
        const springForce = compress * ROVER.wheelSuspensionStiffness * ROVER.chassisMass;
        // Damping force (relative velocity along the actual ground normal)
        const wheelWorldVel = velV.clone().add(
          new Vector3(0, 0, 0).crossVectors(new Vector3(body.angvel().x, body.angvel().y, body.angvel().z),
            worldAnchor.clone().sub(posV))
        );
        const relVelNormal = wheelWorldVel.dot(surfaceNormal);
        const dampForce = -relVelNormal * ROVER.wheelSuspensionDamping * ROVER.chassisMass * 0.3;
        const totalNormal = springForce + dampForce;
        if (totalNormal > 0) {
          const f = surfaceNormal.clone().multiplyScalar(totalNormal);
          body.applyImpulseAtPoint({ x: f.x * dt, y: f.y * dt, z: f.z * dt },
            { x: worldAnchor.x, y: worldAnchor.y, z: worldAnchor.z }, true);
        }

        // Wheel's forward axis (rotated by steer if steered), projected onto the slope.
        let wForward = forward.clone();
        let wRight = right.clone();
        if (w.isSteered) {
          const sc = Math.cos(this.steerAngle), ss = Math.sin(this.steerAngle);
          wForward = forward.clone().multiplyScalar(sc).add(right.clone().multiplyScalar(ss));
          wRight = right.clone().multiplyScalar(sc).sub(forward.clone().multiplyScalar(ss));
        }
        const headingAgainstSlope = wForward.dot(surfaceNormal);
        wForward.addScaledVector(surfaceNormal, -headingAgainstSlope).normalize();
        wRight.addScaledVector(surfaceNormal, -wRight.dot(surfaceNormal)).normalize();

        // Lateral friction impulse (kill sideways velocity)
        const lateral = wheelWorldVel.dot(wRight);
        const lateralImp = wRight.clone().multiplyScalar(-lateral * ROVER.wheelFriction * ROVER.chassisMass / 6 * dt);
        body.applyImpulseAtPoint({ x: lateralImp.x, y: lateralImp.y, z: lateralImp.z },
          { x: worldAnchor.x, y: worldAnchor.y, z: worldAnchor.z }, true);

        // Drive/brake
        if (w.isPowered) {
          let driveForce = 0;
          if (input.throttle !== 0) {
            // Apply torque along the terrain tangent. The bounded grade gain gives
            // the rover enough reserve for the steepest ridge without making flat
            // ground launch violently or letting downhill speed run away.
            const uphillGrade = Math.max(0, -headingAgainstSlope);
            const climbGain = 1 + Math.min(2.6, uphillGrade * 5.2);
            // A small launch assist prevents the six-wheel rig from stalling when
            // the chassis is nearly stopped on a steep grade.
            const lowSpeed = Math.max(0, 1 - Math.abs(speedFwd) / 2.2);
            const antiStallGain = Math.min(0.55, uphillGrade * 1.9) * lowSpeed;
            driveForce = input.throttle * ROVER.maxDriveForce * (climbGain + antiStallGain) / 6;
          }
          if (input.brake) {
            const brakeCounter = -Math.sign(wheelWorldVel.dot(wForward)) * ROVER.maxBrakeForce / 6;
            driveForce += brakeCounter;
          }
          if (input.handbrake && w.isRear) {
            const brakeCounter = -Math.sign(wheelWorldVel.dot(wForward)) * ROVER.maxHandbrakeForce / 6;
            driveForce += brakeCounter;
          }
          if (driveForce !== 0) {
            const f = wForward.clone().multiplyScalar(driveForce);
            body.applyImpulseAtPoint({ x: f.x * dt, y: f.y * dt, z: f.z * dt },
              { x: worldAnchor.x, y: worldAnchor.y, z: worldAnchor.z }, true);
          }
        }

        // Update wheel spin
        w.spinAngle += (wheelWorldVel.dot(wForward) / w.radius) * dt;
      } else {
        w.grounded = false;
        w.contactY = worldAnchor.y - rayLen;
      }
    }

    // Rolling drag on chassis. Keep it modest so uphill torque is not cancelled
    // at low speed, while still damping runaway downhill motion.
    const drag = velV.clone().multiplyScalar(-0.24);
    body.applyImpulse({ x: drag.x * dt, y: 0, z: drag.z * dt }, true);

    // Extra downforce to keep all six tires planted, especially over the crest.
    if (anyGrounded > 0) {
      body.applyImpulse({ x: 0, y: -46 * dt * ROVER.chassisMass / 220, z: 0 }, true);
    }

    world.step();
    this.speed = speedFwd;
    this.steerAngleCurrent = this.steerAngle;
    this.anyGrounded = anyGrounded;
  }

  /* Add a static collider around a rock — approximate as a sphere. */
  addRockCollider(x, y, z, radius) {
    const bd = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    const body = this.world.createRigidBody(bd);
    const cd = RAPIER.ColliderDesc.ball(radius).setFriction(0.9).setRestitution(0.05);
    this.world.createCollider(cd, body);
    return body;
  }

  /* A dynamic pin — light and easy to knock over. */
  addPin(x, y, z) {
    const bd = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y + 0.65, z)
      .setLinearDamping(0.5)
      .setAngularDamping(0.5);
    const body = this.world.createRigidBody(bd);
    const cd = RAPIER.ColliderDesc.capsule(0.55, 0.32)
      .setDensity(0.8)
      .setFriction(0.6);
    this.world.createCollider(cd, body);
    this.pins.push(body);
    return body;
  }

  reset(x, z) {
    if (!this.rover) return;
    const y = heightAt(x, z) + 2.2;
    this.rover.setTranslation({ x, y, z }, true);
    this.rover.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.rover.setAngvel({ x: 0, y: 0, z: 0 }, true);
    const q = new Quaternion();
    this.rover.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);
    this.steerAngle = 0;
    this.recovery.active = false;
    this.recovery.elapsed = 0;
    this.recovery.reason = '';
  }
}
