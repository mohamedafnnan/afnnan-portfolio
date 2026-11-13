/* DAWN — central config. All magic numbers live here. */

export const WORLD = {
  radius: 150,            // compact playable radius for practical rover exploration
  terrainSize: 360,       // compact mesh with enough horizon around the playable area
  terrainSegments: 180,   // resolution
  coordinateScale: 0.62,  // keeps terrain features and POIs in the same compact world
  gravity: -9.81 * 1.4,
  fogNear: 105,
  fogFar: 340,
  skyTop: 0x2a1408,
  skyBottom: 0x8a3410,
  sunColor: 0xffdcb2,
  ambientColor: 0x664428,
};

export const ROVER = {
  wheelRadius: 0.42,
  wheelWidth: 0.28,
  chassisSize: [2.6, 0.55, 1.6],
  chassisMass: 220,
  wheelMass: 12,
  wheelSpacingX: 1.15,
  wheelSpacingZ: 0.9,
  wheelRestLength: 0.15,
  wheelSuspensionRest: 0.44,
  wheelSuspensionStiffness: 52,
  wheelSuspensionDamping: 5.2,
  wheelSuspensionCompression: 4.8,
  wheelFriction: 10.5,
  maxSteer: 0.55,
  steerSpeed: 3.2,
  maxDriveForce: 1850,
  maxBrakeForce: 240,
  maxHandbrakeForce: 900,
  centerOfMassOffset: [0, -0.24, 0],
  spawn: [-3, -3],
};

export const CAMERA = {
  fovBase: 58,
  fovBoost: 10,
  near: 0.1,
  far: 1000,
  followDistance: 9,
  followHeight: 4.2,
  followLag: 4.6,
  lookLag: 6.5,
  wideDistance: 24,
  wideHeight: 13,
  shakeDecay: 3.5,
};

export const AUDIO = {
  engineMinRate: 0.55,
  engineMaxRate: 1.7,
  masterVolume: 0.55,
};

export const CONTROLS_HINT = [
  ['W A S D', 'Drive'],
  ['Space', 'Handbrake'],
  ['E', 'Interact / Log'],
  ['M', 'Toggle map'],
  ['C', 'Cycle camera'],
  ['P', 'Photo mode'],
  ['R', 'Reset rover'],
  ['H', 'Honk'],
  ['J', 'Arm deploy'],
  ['K', 'Arm grab'],
  ['L', 'Arm release'],
  ['X', 'Arm stow'],
  ['0', 'Arm auto'],
  ['?', 'Field guide'],
  ['Esc', 'Close panel'],
];
