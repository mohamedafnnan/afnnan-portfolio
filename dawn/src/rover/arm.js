/* DAWN robotic-arm motion: commandable multi-joint pose simulation for the supplied CAD arm. */
import { MathUtils } from 'three';

export class ArmController {
  constructor(arm) {
    this.arm = arm;
    this.joints = (arm && arm.userData && arm.userData.joints) ? arm.userData.joints : [];
    this.t = 0;
    this.deploy = 0;
    this.grip = 0;
    this.commandedMode = null;
  }

  command(mode) {
    const next = String(mode || '').toLowerCase();
    if (!['stow', 'deploy', 'grab', 'release', 'auto'].includes(next)) return;
    this.commandedMode = next === 'auto' ? null : next;
  }

  update(dt, rover, activePoi, time) {
    // Arm fully static — no movement
  }
}
