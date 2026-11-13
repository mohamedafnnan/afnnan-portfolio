/* DAWN - Rover loader. Authentic CAD-derived model (from the supplied STEP
   assemblies). All scale is BAKED INTO GEOMETRY so every position below is in
   plain meters - no parent-scale math (that was the source of the offsets).
   Wheels: re-centered on their true hubs, wrapped in steer/spin groups, axle
   normalized to Z. Arm + solar + headlights placed from the measured chassis. */
import {
  Group, Mesh, Box3, Vector3, SpotLight, MeshStandardMaterial,
  BoxGeometry, CylinderGeometry, PlaneGeometry, MeshBasicMaterial, CanvasTexture,
} from 'three';
import { ROVER } from '../config.js';

async function loadGLTF(gltfLoader, url) {
  return new Promise((res, rej) => gltfLoader.load(url, res, undefined, rej));
}

function tuneMaterials(root) {
  root.traverse(o => {
    if (o.isMesh) {
      o.castShadow = o.receiveShadow = true;
      if (o.material) {
        o.material.metalness = Math.min(0.75, o.material.metalness ?? 0.45);
        o.material.roughness = Math.max(0.35, o.material.roughness ?? 0.55);
      }
    }
  });
}

async function buildAuthenticRover(gltfLoader) {
  const [roverGltf, armGltf] = await Promise.all([
    loadGLTF(gltfLoader, '/dawn/assets/rover/dawn-chassis-opt.glb'),
    loadGLTF(gltfLoader, '/dawn/assets/rover/dawn-arm-opt.glb').catch(() => null),
  ]);

  const group = new Group();
  const body = roverGltf.scene;

  // ---- 1) bake scale into geometry (everything below in meters) ----
  const preBox = new Box3().setFromObject(body);
  const preSize = preBox.getSize(new Vector3());
  const s = ROVER.chassisSize[0] / Math.max(preSize.x, 0.0001);
  const meshes = [];
  body.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const m of meshes) {
    m.geometry = m.geometry.clone();
    m.geometry.scale(s, s, s);
  }
  tuneMaterials(body);

  // ---- 2) wheels: re-center on true hub, normalize the actual axle to Z, wrap ----
  const wheelMeshes = meshes.filter(m => m.name && m.name.startsWith('wheel_'));
  const wheels = [];
  for (const w of wheelMeshes) {
    const g = w.geometry;
    g.computeBoundingBox();
    const c = g.boundingBox.getCenter(new Vector3());
    g.translate(-c.x, -c.y, -c.z);

    // The rover runtime spins every tire around local Z. Detect the axle from
    // the tire's thinnest dimension instead of guessing from its longest face.
    // This matters for mirrored CAD tires whose X/Y extents differ by a few
    // millimetres: rotating those faces made one front wheel look misaligned.
    g.computeBoundingBox();
    const sz = g.boundingBox.getSize(new Vector3());
    const dims = [sz.x, sz.y, sz.z];
    const axleAxis = dims.indexOf(Math.min(...dims));
    if (axleAxis === 0) g.rotateY(Math.PI / 2);       // X axle -> Z
    else if (axleAxis === 1) g.rotateX(-Math.PI / 2); // Y axle -> Z
    // axleAxis === 2: the supplied CAD tire is already correctly aligned.
    g.computeBoundingBox();
    w.removeFromParent();
    w.position.set(0, 0, 0);
    const spin = new Group(); spin.add(w);
    const steer = new Group(); steer.position.copy(c); steer.add(spin);
    group.add(steer);
    wheels.push({ steer, spin, center: c.clone() });
  }
  // order wheels to match physics indices [FR,FL,MR,ML,RR,RL]:
  // sort by x into front/mid/rear pairs (forward is +X), each pair right(+z) then left(-z)
  wheels.sort((a, b) => b.center.x - a.center.x);
  const pairs = [wheels.slice(0, 2), wheels.slice(2, 4), wheels.slice(4, 6)];
  for (const p of pairs) p.sort((a, b) => b.center.z - a.center.z);
  const ordered = pairs.flat();
  wheels.length = 0; wheels.push(...ordered);
  wheels.forEach((wi, i) => { wi.isFront = i < 2; wi.idx = i; wi.anchor = wi.center.clone(); wi.travel = 0; });

  // ---- 3) add chassis body ----
  group.add(body);

  // ---- 4) ground the model: preserve tire positions, lower chassis slightly ----
  group.updateMatrixWorld(true);
  let gb = new Box3().setFromObject(group);
  const lift = -gb.min.y;
  const chassisDrop = 0.28;
  // Keep all wheel pivots, centers, and home positions exactly where they are.
  // Only the imported chassis drops, so the tire sidewalls sit into the body.
  body.position.y += lift - chassisDrop;
  for (const wi of wheels) wi.steer.position.y += lift;
  for (const wi of wheels) { wi.home = wi.steer.position.clone(); wi.anchor = wi.home.clone(); }
  group.updateMatrixWorld(true);
  gb = new Box3().setFromObject(group);
  const chassisBox = new Box3().setFromObject(body);
  const chassisSize = chassisBox.getSize(new Vector3());
  const deckTop = chassisBox.max.y;          // exact imported chassis top
  const frontX = chassisBox.max.x;

  const linkages = [];   // real suspension comes from the CAD parts; no fake bars


  // ---- 5) structural arm enclosure: fitted from the actual chassis footprint ----
  const chassisLen = chassisSize.x;
  const chassisWid = chassisSize.z;
  const chassisCenterX = (chassisBox.min.x + chassisBox.max.x) / 2;
  const chassisCenterZ = (chassisBox.min.z + chassisBox.max.z) / 2;

  // The wheel extraction above intentionally leaves each tire as the only
  // mesh below its steer/spin groups. Do not parent any chassis CAD mesh to a
  // tire: the chassis must remain in `body`, while only the front-left tire
  // follows its own steering, spin, and travel updates like the right side.
  wheels[1].steer.name = 'wheel_left_front';
  wheels[1].spin.name = 'tire_left_front';

  // Compact open mounting cradle: it occupies only the arm base area and leaves
  // the chassis deck, wheels, and working reach unobstructed.
  const enclosureLen = Math.min(chassisLen * 0.30, 0.78);
  const enclosureWid = Math.min(chassisWid * 0.40, 0.62);
  const enclosureHeight = 0.10;
  const enclosureWall = Math.min(0.045, enclosureWid * 0.065);
  const enclosureX = chassisCenterX;
  const enclosureZ = chassisCenterZ;
  const enclosureBaseY = deckTop + 0.018;
  const armMountY = enclosureBaseY + 0.06 + enclosureHeight + 0.02;
  const enclosure = new Group();
  enclosure.name = 'arm_grab_enclosure';
  enclosure.position.set(enclosureX, enclosureBaseY, enclosureZ);
  const enclosureMat = new MeshStandardMaterial({ color: 0x9b8c79, metalness: 0.56, roughness: 0.52 });
  const enclosureEdgeMat = new MeshStandardMaterial({ color: 0xd3b07c, metalness: 0.48, roughness: 0.46 });
  const addEnclosurePart = (mesh, x, y, z, material = enclosureMat) => {
    mesh.material = material;
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    enclosure.add(mesh);
  };
  addEnclosurePart(new Mesh(new BoxGeometry(enclosureLen, 0.06, enclosureWid), enclosureMat), 0, 0.03, 0);
  const wallY = 0.06 + enclosureHeight / 2;
  // Low perimeter rails provide a physical-looking enclosure without becoming a box.
  addEnclosurePart(new Mesh(new BoxGeometry(enclosureLen, enclosureHeight, enclosureWall), enclosureMat), 0, wallY, -enclosureWid / 2 + enclosureWall / 2);
  addEnclosurePart(new Mesh(new BoxGeometry(enclosureLen, enclosureHeight, enclosureWall), enclosureMat), 0, wallY, enclosureWid / 2 - enclosureWall / 2);
  addEnclosurePart(new Mesh(new BoxGeometry(enclosureWall, enclosureHeight, enclosureWid - enclosureWall * 2), enclosureMat), -enclosureLen / 2 + enclosureWall / 2, wallY, 0);
  addEnclosurePart(new Mesh(new BoxGeometry(enclosureWall, enclosureHeight, enclosureWid - enclosureWall * 2), enclosureMat), enclosureLen / 2 - enclosureWall / 2, wallY, 0);
  // A small mounting pad marks the arm base without hiding the CAD assembly.
  addEnclosurePart(new Mesh(new BoxGeometry(enclosureLen * 0.36, 0.025, enclosureWid * 0.36), enclosureEdgeMat), 0, 0.073, 0);
  group.add(enclosure);

  // ---- 6) arm: use the supplied CAD, but split its disconnected meshes over real nested pivots ----
  let arm = null;
  if (armGltf) {
    const armScene = armGltf.scene;
    const armMeshes = [];
    armScene.traverse(o => { if (o.isMesh) armMeshes.push(o); });
    const aBox = new Box3().setFromObject(armScene);
    const aSize = aBox.getSize(new Vector3());
    const armScaleMultiplier = 1.5;
    const aScale = (0.72 / Math.max(aSize.y, 0.0001)) * armScaleMultiplier; // 1.5× previous runtime arm size
    for (const m of armMeshes) {
      m.geometry = m.geometry.clone();
      m.geometry.scale(aScale, aScale, aScale);
      m.geometry.computeBoundingBox();
    }
    tuneMaterials(armScene);

    // The source is a set of CAD meshes rather than a skinned animation. Keep its
    // measured source pose, then parent each physical section to a pivot group.
    const sourceBox = new Box3().setFromObject(armScene);
    const sourceOffset = new Vector3(
      -(sourceBox.min.x + sourceBox.max.x) / 2,
      -sourceBox.min.y,
      -(sourceBox.min.z + sourceBox.max.z) / 2,
    );
    const baseMesh = armMeshes.find(m => m.name === 'arm_solid_005') || armMeshes[0];
    const baseBox = baseMesh && baseMesh.geometry.boundingBox ? baseMesh.geometry.boundingBox : sourceBox;
    const baseCenter = baseBox.getCenter(new Vector3());
    const armDepth = sourceBox.max.z - sourceBox.min.z;
    // STEP coordinates are long along Z; these landmarks follow the actual
    // base-to-tip layout after the model is normalized and rotated to -Z reach.
    const shoulderPoint = new Vector3(baseCenter.x, baseBox.max.y + 0.012, baseCenter.z - armDepth * 0.02);
    const elbowPoint = new Vector3(baseCenter.x, sourceBox.min.y + (sourceBox.max.y - sourceBox.min.y) * 0.62, sourceBox.min.z + armDepth * 0.42);
    const wristPoint = new Vector3(baseCenter.x, sourceBox.min.y + (sourceBox.max.y - sourceBox.min.y) * 0.48, sourceBox.min.z + armDepth * 0.18);
    const gripperPoint = new Vector3(baseCenter.x, sourceBox.min.y + (sourceBox.max.y - sourceBox.min.y) * 0.45, sourceBox.min.z + armDepth * 0.04);

    // Explicit mount transform: mirror the CAD arm across its local width,
    // rotate its reach onto the rover's forward +X axis, then translate the
    // base onto the enclosure. Keeping these operations on one arm root avoids
    // scattering individual CAD meshes or moving any chassis geometry.
    const armFlip = Math.PI;
    const armYaw = Math.PI / 2;
    const armMountOffset = new Vector3(0.22, 0.5, 1.32);
    const chassisMount = new Group();
    chassisMount.name = 'arm_chassis_mount';
    chassisMount.position.set(
      armMountOffset.x,
      armMountY - enclosureBaseY + armMountOffset.y,
      armMountOffset.z,
    );
    enclosure.add(chassisMount);

    const pivot = new Group();
    pivot.name = 'arm_command_pivot';
    pivot.position.set(0, 0, 0);
    pivot.rotation.set(0, 0, 0.65);
    const motionRoot = new Group();
    motionRoot.name = 'arm_cad_root';
    motionRoot.position.copy(sourceOffset);
    // Keep the CAD assembly intact, then apply the explicit mirror + forward-yaw transforms.
    // The source translation centers measured CAD bounds on the chassis mount.
    motionRoot.scale.set(-1, 1, 1);
    motionRoot.rotation.set(0, armYaw, 0);
    pivot.add(motionRoot);
    motionRoot.add(armScene);
    armScene.position.set(0, 0, 0);
    armScene.rotation.set(2.2, Math.PI, 0);  // rotate 180° so claw tip faces rover front (+X)

    const shoulder = new Group();
    shoulder.name = 'arm_shoulder_joint';
    shoulder.position.copy(shoulderPoint);
    motionRoot.add(shoulder);
    const elbow = new Group();
    elbow.name = 'arm_elbow_joint';
    elbow.position.copy(elbowPoint).sub(shoulderPoint);
    shoulder.add(elbow);
    const wrist = new Group();
    wrist.name = 'arm_wrist_joint';
    wrist.position.copy(wristPoint).sub(elbowPoint);
    elbow.add(wrist);
    const gripper = new Group();
    gripper.name = 'arm_gripper_joint';
    gripper.position.copy(gripperPoint).sub(wristPoint);
    wrist.add(gripper);

    // Keep every authored arm mesh under one intact CAD assembly. Reparenting
    // individual disconnected pieces to guessed joints was what scattered the
    // arm; the shoulder root still provides a stable articulated command point.
    motionRoot.remove(armScene);
    shoulder.position.set(0, 0, 0);
    shoulder.add(armScene);
    pivot.add(motionRoot);
    chassisMount.add(pivot);
    arm = pivot;
    arm.userData.mount = chassisMount;
    arm.userData.joints = [shoulder, elbow, wrist, gripper];
    arm.userData.grabTarget = new Vector3(enclosureX, armMountY, enclosureZ).add(armMountOffset);
    arm.userData.transforms = {
      flip: armFlip,
      flipAxis: 'local-x-mirror',
      yaw: armYaw,
      mountOffset: armMountOffset.clone(),
      sourceTranslation: sourceOffset.clone(),
    };
  }

  // ---- 6b) masts to match the real DAWN (about1.jpeg) ----
  const mastMat = new MeshStandardMaterial({ color: 0xd8d4cc, metalness: 0.5, roughness: 0.5 });
  const chassisW = (gb.max.z - gb.min.z);
  // camera/sensor mast: front-right, short (~0.45 m), orange-capped
  const camMast = new Group();
  camMast.name = 'camera_sensor_mast';
  const cm = new Mesh(new CylinderGeometry(0.02, 0.025, 0.45, 8), mastMat);
  cm.position.y = 0.225; cm.castShadow = true; camMast.add(cm);
  const camHead = new Mesh(new BoxGeometry(0.07, 0.07, 0.09),
    new MeshStandardMaterial({ color: 0xd06018, metalness: 0.4, roughness: 0.5 }));
  camHead.position.y = 0.47; camHead.castShadow = true; camMast.add(camHead);
  // The camera mast is the rod-and-cube assembly. Parent it directly to the
  // tray and place its foot on the tray top, keeping it inside the tray bounds
  // instead of leaving it at an outboard chassis coordinate.
  camMast.position.set(enclosureLen * 0.34, enclosureHeight + 0.008, -enclosureWid * 0.28); // forward-right tray corner
  enclosure.add(camMast);
  // comms mast: rear-centerline, tall (~1.2 m) with transceiver panel
  const commsMast = new Group();
  commsMast.name = 'comms_mast';
  const tm = new Mesh(new CylinderGeometry(0.018, 0.024, 1.2, 8), mastMat);
  tm.position.y = 0.6; tm.castShadow = true; commsMast.add(tm);
  const panelM = new Mesh(new BoxGeometry(0.16, 0.22, 0.03),
    new MeshStandardMaterial({ color: 0xcfd4da, metalness: 0.6, roughness: 0.4 }));
  panelM.position.y = 1.05; panelM.castShadow = true; commsMast.add(panelM);
  commsMast.position.set(-enclosureLen * 1.21, enclosureHeight + -0.15, 0); // rear tray edge
  enclosure.add(commsMast);

  // ---- 7) headlights at the front for the day-night cycle ----
  const headlights = [];
  for (const side of [1, -1]) {
    const sp = new SpotLight(0xfff2d0, 0, 40, 0.55, 0.5, 1.4);
    sp.position.set(frontX * 0.9, deckTop * 0.75, side * 0.32);
    sp.target.position.set(frontX * 3, deckTop * 0.3, side * 0.32);
    group.add(sp); group.add(sp.target);
    headlights.push(sp);
  }

  // ---- 8) soft blob shadow ----
  const c2 = document.createElement('canvas'); c2.width = c2.height = 128;
  const ctx = c2.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.7)'); grad.addColorStop(0.6, 'rgba(0,0,0,0.32)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
  const shadowPlane = new Mesh(new PlaneGeometry(4.4, 3.0),
    new MeshBasicMaterial({ map: new CanvasTexture(c2), transparent: true, opacity: 0.7, depthWrite: false }));
  shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = 0.02; shadowPlane.renderOrder = 1;
  group.add(shadowPlane);

  return { group, wheels, suspension: [], arm, enclosure, solar: null, headlights, shadowPlane, linkages, authentic: true };
}

function buildProceduralRover() {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(...ROVER.chassisSize),
    new MeshStandardMaterial({ color: 0xd8a56b, metalness: 0.3, roughness: 0.65 }));
  body.position.y = 0.5; body.castShadow = body.receiveShadow = true; g.add(body);
  const wheelGeom = new CylinderGeometry(ROVER.wheelRadius, ROVER.wheelRadius, ROVER.wheelWidth, 16);
  wheelGeom.rotateX(Math.PI / 2);
  const wheelMat = new MeshStandardMaterial({ color: 0x1a1210, roughness: 0.9, metalness: 0.15 });
  const wheels = [];
  const pos = [
    [+ROVER.wheelSpacingX, +ROVER.wheelSpacingZ, true], [+ROVER.wheelSpacingX, -ROVER.wheelSpacingZ, true],
    [0, +ROVER.wheelSpacingZ, false], [0, -ROVER.wheelSpacingZ, false],
    [-ROVER.wheelSpacingX, +ROVER.wheelSpacingZ, false], [-ROVER.wheelSpacingX, -ROVER.wheelSpacingZ, false],
  ];
  for (let i = 0; i < 6; i++) {
    const steer = new Group(), spin = new Group();
    const w = new Mesh(wheelGeom, wheelMat); w.castShadow = true;
    spin.add(w); steer.add(spin); steer.position.set(pos[i][0], ROVER.wheelRadius, pos[i][1]); g.add(steer);
    const wv = { steer, spin, isFront: pos[i][2], idx: i, anchor: new Vector3(pos[i][0], 0.5, pos[i][1]) };
    wv.home = steer.position.clone(); wv.travel = 0; wheels.push(wv);
  }
  return { group: g, wheels, suspension: [], arm: null, solar: null, headlights: [], linkages: [], authentic: false };
}

export async function loadRover(gltfLoader, mode = 'detailed') {
  if (mode === 'procedural' || new URLSearchParams(location.search).has('force-recovery')) return buildProceduralRover();
  try {
    // Do not strand low-end devices on the landing screen while a large CAD
    // decode is still pending. The fallback preserves all driving mechanics.
    return await Promise.race([
      buildAuthenticRover(gltfLoader),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Detailed model timed out; using lightweight vehicle')), 6000)),
    ]);
  }
  catch (err) { console.warn('DAWN: CAD rover failed, using procedural fallback.', err); return buildProceduralRover(); }
}
