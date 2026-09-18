import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { abrirHuevo } from "../probabilidades.js";

/*
  EGGARO — CINEMÁTICA CANÓNICA
  ------------------------------------------------------------
  Esta escena usa exclusivamente los recursos existentes en GAME.:
    3D/personajes/mike/mike.glb
    3D/personajes/mike/mike.png
    3D/personajes/mikaela/micaela.glb
    3D/personajes/mikaela/mikaela.png
    3D/animales/huevo noob.png
    3D/animales/noob.png
    3D/animales/pollito noob.png
    3D/animales/zombie.png

  Las animaciones de personajes se reproducen mediante AnimationMixer.
  Si un GLB ya contiene AnimationClips, se usan primero.
  Si el GLB no contiene clips, se crean AnimationClips con KeyframeTracks
  sobre sus huesos y se reproducen igualmente con AnimationMixer.
  No se usa Math.sin() para fabricar el movimiento de caminar.
*/

let scene;
let camera;
let renderer;
let clock;
let running = false;
let finished = false;

let mike;
let micaela;
let mikeMixer;
let micaelaMixer;
let mikeActions = {};
let micaelaActions = {};
let mikeBones = {};
let micaelaBones = {};

let egg;
let roulette;
let resultCard;
let hud;

let phase = "WALK";
let phaseTime = 0;
let elapsed = 0;
let result = "noob";
let containerRef = null;

const loader = new GLTFLoader();

const FILES = {
  mike: "./3D/personajes/mike/mike.glb",
  micaela: "./3D/personajes/mikaela/micaela.glb",
  mikeReference: "./3D/personajes/mike/mike.png",
  micaelaReference: "./3D/personajes/mikaela/mikaela.png",
  egg: "./3D/animales/huevo%20noob.png",
  noob: "./3D/animales/noob.png",
  chick: "./3D/animales/pollito%20noob.png",
  zombie: "./3D/animales/zombie.png"
};

const WALK_TIME = 58;
const ARRIVE_TIME = 5;
const EGG_TIME = 6;
const SELECT_TIME = 7.5;
const RESULT_TIME = 4.5;

export function cinematicaTerminada() {
  return finished;
}

export function iniciarCinematica(container) {
  detener();

  containerRef = container;
  running = true;
  finished = false;
  phase = "WALK";
  phaseTime = 0;
  elapsed = 0;
  result = "noob";

  buildScene();
  buildWorld();
  buildHud();
  buildEgg();
  buildRoulette();

  clock = new THREE.Clock();
  renderer.setAnimationLoop(frame);

  cargarPersonajes();
}

/* ============================================================
   ESCENA / CÁMARA / RENDER
   ============================================================ */

function buildScene() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x07101a);
  scene.fog = new THREE.FogExp2(0x101b21, 0.014);

  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 220);
  camera.position.set(0, 5.6, 18);
  camera.lookAt(0, 2.1, -12);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  Object.assign(renderer.domElement.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    zIndex: "50000"
  });

  containerRef.appendChild(renderer.domElement);
  resize();
}

/* ============================================================
   MUNDO NOCTURNO
   ============================================================ */

function buildWorld() {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(180, 32, 16),
    new THREE.MeshBasicMaterial({
      color: 0x07101a,
      side: THREE.BackSide
    })
  );
  scene.add(sky);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3.1, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xf3e8bd })
  );
  moon.position.set(-23, 22, -62);
  scene.add(moon);

  const moonGlow = new THREE.PointLight(0xb8d7ff, 2.2, 48);
  moonGlow.position.copy(moon.position);
  scene.add(moonGlow);

  const warm = new THREE.PointLight(0xffbd73, 1.7, 30);
  warm.position.set(8, 5, -11);
  scene.add(warm);

  scene.add(new THREE.HemisphereLight(0x6f89a8, 0x1c241c, 0.72));

  const moonLight = new THREE.DirectionalLight(0x9bbcff, 2.4);
  moonLight.position.set(-24, 30, -18);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.left = -45;
  moonLight.shadow.camera.right = 45;
  moonLight.shadow.camera.top = 45;
  moonLight.shadow.camera.bottom = -45;
  moonLight.shadow.camera.far = 110;
  scene.add(moonLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150, 40, 40),
    new THREE.MeshStandardMaterial({
      color: 0x263a2a,
      roughness: 1
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 125),
    new THREE.MeshStandardMaterial({
      color: 0x463b31,
      roughness: 1
    })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.025, -22);
  scene.add(path);

  buildDistantFarm();
  buildForest();
  buildGrass();
  buildDust();
  buildFireflies();
}

/* ============================================================
   GRANJA LEJANA
   ============================================================ */

function buildDistantFarm() {
  const farm = new THREE.Group();
  farm.position.set(13, 0, -58);
  farm.scale.setScalar(1.2);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(15, 6, 9),
    new THREE.MeshStandardMaterial({ color: 0x2a2927, roughness: 1 })
  );
  body.position.y = 3;
  farm.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(10.5, 5, 4),
    new THREE.MeshStandardMaterial({ color: 0x181719, roughness: 1 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 8;
  farm.add(roof);

  const window = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.4),
    new THREE.MeshBasicMaterial({
      color: 0xe5a75d,
      transparent: true,
      opacity: 0.65
    })
  );
  window.position.set(-3.8, 3.3, 4.55);
  farm.add(window);

  scene.add(farm);
}

/* ============================================================
   ÁRBOLES — SOLO A LOS LADOS DEL CAMINO
   ============================================================ */

function makeTree(scale = 1) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.42, 3.8, 8),
    new THREE.MeshStandardMaterial({
      color: 0x30271f,
      roughness: 1
    })
  );
  trunk.position.y = 1.9;
  trunk.castShadow = true;
  tree.add(trunk);

  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0x263f2b,
    roughness: 1
  });

  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.25, 2),
    crownMaterial
  );
  crown.position.y = 4.3;
  crown.scale.set(1.15, 1.2, 1);
  crown.castShadow = true;
  tree.add(crown);

  tree.scale.setScalar(scale);
  return tree;
}

function buildForest() {
  const nearTrees = [
    [-7.2, 2.0, 7.5],
    [7.0, 2.2, 6.5],
    [-8.4, 1.8, -2],
    [8.5, 1.9, -4],
    [-9.5, 1.5, -13],
    [9.4, 1.6, -15],
    [-11, 1.4, -28],
    [11, 1.5, -30],
    [-13, 1.3, -43],
    [13, 1.4, -46]
  ];

  for (let i = 0; i < nearTrees.length; i++) {
    const [x, y, z] = nearTrees[i];
    const tree = makeTree(0.85 + (i % 3) * 0.16);
    tree.position.set(x, y, z);
    scene.add(tree);
  }

  for (let i = 0; i < 26; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -35 - Math.floor(i / 2) * 4.8;
    const tree = makeTree(0.6 + (i % 4) * 0.12);
    tree.position.set(side * (13 + (i % 3) * 2.5), 0, z);
    scene.add(tree);
  }
}

/* ============================================================
   PASTO
   ============================================================ */

function buildGrass() {
  const geometry = new THREE.ConeGeometry(0.045, 0.42, 3);
  const material = new THREE.MeshStandardMaterial({
    color: 0x355b35,
    roughness: 1
  });

  const grass = new THREE.InstancedMesh(geometry, material, 1500);
  const dummy = new THREE.Object3D();

  let index = 0;

  for (let row = 0; row < 50 && index < 1500; row++) {
    const z = 8 - row * 1.5;

    for (let side = 0; side < 2 && index < 1500; side++) {
      for (let n = 0; n < 15 && index < 1500; n++) {
        const x = side === 0
          ? -2.5 - n * 0.35 - (row % 3) * 0.15
          : 2.5 + n * 0.35 + (row % 3) * 0.15;

        const s = 0.7 + ((row + n) % 4) * 0.16;
        dummy.position.set(x, 0.18 * s, z - (n % 3) * 0.2);
        dummy.scale.setScalar(s);
        dummy.rotation.y = ((row * 13 + n * 17) % 360) * Math.PI / 180;
        dummy.updateMatrix();
        grass.setMatrixAt(index++, dummy.matrix);
      }
    }
  }

  grass.instanceMatrix.needsUpdate = true;
  scene.add(grass);
}

/* ============================================================
   POLVO / PARTÍCULAS
   ============================================================ */

function buildDust() {
  const positions = [];
  for (let i = 0; i < 260; i++) {
    positions.push(
      ((i * 37) % 100 - 50) * 0.35,
      0.8 + ((i * 19) % 90) * 0.06,
      7 - ((i * 29) % 100) * 0.75
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xd7c49b,
    size: 0.045,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });

  scene.add(new THREE.Points(geometry, material));
}

function buildFireflies() {
  const positions = [];
  for (let i = 0; i < 80; i++) {
    positions.push(
      ((i * 47) % 80) - 40,
      1.5 + ((i * 23) % 35) * 0.12,
      -5 - ((i * 31) % 70) * 0.7
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffd98a,
    size: 0.075,
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });

  scene.add(new THREE.Points(geometry, material));
}

/* ============================================================
   PERSONAJES — GLB + REFERENCIAS PNG
   ============================================================ */

async function cargarPersonajes() {
  setHud("EGGARO", "Entrando en la noche...");

  const references = [
    loadReference(FILES.mikeReference),
    loadReference(FILES.micaelaReference)
  ];

  try {
    const [mikeGLB, micaelaGLB] = await Promise.all([
      loader.loadAsync(FILES.mike),
      loader.loadAsync(FILES.mikaela)
    ]);

    mike = prepararPersonaje(mikeGLB.scene, -1.0, 8.0);
    micaela = prepararPersonaje(micaelaGLB.scene, 1.0, 9.0);

    scene.add(mike, micaela);

    mikeBones = findBones(mike);
    micaelaBones = findBones(micaela);

    mikeMixer = new THREE.AnimationMixer(mike);
    micaelaMixer = new THREE.AnimationMixer(micaela);

    mikeActions = createCharacterAnimations(mike, mikeBones, mikeMixer, mikeGLB.animations);
    micaelaActions = createCharacterAnimations(
      micaela,
      micaelaBones,
      micaelaMixer,
      micaelaGLB.animations
    );

    playAction(mikeActions, "walk");
    playAction(micaelaActions, "walk");

    await Promise.allSettled(references);

    setHud("EGGARO", "Mike y Micaela avanzan entre los árboles...");
  } catch (error) {
    console.error("[EGGARO] No se pudieron cargar los GLB:", error);
    setHud(
      "EGGARO",
      "ERROR: no se pudieron cargar los modelos GLB de Mike y Micaela."
    );
    running = false;
    finished = true;
  }
}

function loadReference(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      image.dataset.eggaroReference = "loaded";
      resolve(image);
    };

    image.onerror = () => reject(new Error("No se pudo cargar la referencia: " + file));
    image.src = file;
  });
}

function prepararPersonaje(obj, x, z) {
  obj.traverse(node => {
    if (!node.isMesh) return;

    node.castShadow = true;
    node.receiveShadow = true;

    if (node.material) {
      node.material.needsUpdate = true;
    }
  });

  const before = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  before.getSize(size);

  if (size.y <= 0.001) {
    throw new Error("El GLB no tiene una altura válida.");
  }

  obj.scale.multiplyScalar(2.75 / size.y);

  const after = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  after.getCenter(center);

  obj.position.set(
    x - center.x,
    -after.min.y,
    z - center.z
  );

  return obj;
}

function findBones(root) {
  const bones = {};

  root.traverse(node => {
    if (!node.isBone) return;

    const name = node.name.toLowerCase().replace(/[._-]/g, " ");

    if (!bones.root && /root|hips|pelvis|pelvis/.test(name)) bones.root = node;
    if (!bones.spine && /spine|chest|torso/.test(name)) bones.spine = node;
    if (!bones.head && /head|neck|cabeza|cuello/.test(name)) bones.head = node;

    if (!bones.armL && /(left|l).*arm|arm.*(left|l)|brazo.*izq/.test(name)) {
      bones.armL = node;
    }

    if (!bones.armR && /(right|r).*arm|arm.*(right|r)|brazo.*der/.test(name)) {
      bones.armR = node;
    }

    if (!bones.forearmL && /(left|l).*forearm|forearm.*(left|l)|antebrazo.*izq/.test(name)) {
      bones.forearmL = node;
    }

    if (!bones.forearmR && /(right|r).*forearm|forearm.*(right|r)|antebrazo.*der/.test(name)) {
      bones.forearmR = node;
    }

    if (!bones.legL && /(left|l).*(leg|thigh)|((leg|thigh).*(left|l))|pierna.*izq/.test(name)) {
      bones.legL = node;
    }

    if (!bones.legR && /(right|r).*(leg|thigh)|((leg|thigh).*(right|r))|pierna.*der/.test(name)) {
      bones.legR = node;
    }

    if (!bones.shinL && /(left|l).*(shin|calf)|((shin|calf).*(left|l))|pantorrilla.*izq/.test(name)) {
      bones.shinL = node;
    }

    if (!bones.shinR && /(right|r).*(shin|calf)|((shin|calf).*(right|r))|pantorrilla.*der/.test(name)) {
      bones.shinR = node;
    }
  });

  return bones;
}

/* ============================================================
   ANIMACIÓN REAL CON AnimationMixer + AnimationClip
   ============================================================ */

function createCharacterAnimations(root, bones, mixer, importedClips) {
  const actions = {};

  if (Array.isArray(importedClips) && importedClips.length) {
    for (const clip of importedClips) {
      const action = mixer.clipAction(clip);
      action.enabled = true;
      actions[clip.name.toLowerCase()] = action;
    }

    const findImported = names =>
      Object.entries(actions).find(([key]) =>
        names.some(name => key.includes(name))
      )?.[1];

    actions.walk = findImported(["walk", "walking", "caminar"]) || actions[Object.keys(actions)[0]];
    actions.idle = findImported(["idle", "breath", "respirar"]) || actions.walk;
    actions.react = findImported(["react", "reaction", "look", "turn", "reaccion"]) || actions.idle;

    return actions;
  }

  /*
    Los GLB actuales pueden traer esqueleto sin AnimationClips.
    En ese caso no fingimos una animación con Math.sin().
    Creamos clips de keyframes y los reproducimos con AnimationMixer.
  */
  const walkClip = makeWalkClip(bones);
  const idleClip = makeIdleClip(bones);
  const reactClip = makeReactionClip(bones);

  actions.walk = mixer.clipAction(walkClip);
  actions.idle = mixer.clipAction(idleClip);
  actions.react = mixer.clipAction(reactClip);

  return actions;
}

function trackRotation(bone, times, values, name) {
  if (!bone) return null;

  const q = bone.quaternion;
  const base = [q.x, q.y, q.z, q.w];

  const result = [];

  for (let i = 0; i < times.length; i++) {
    const euler = new THREE.Euler(values[i][0], values[i][1], values[i][2]);
    const quat = new THREE.Quaternion().setFromEuler(euler);

    result.push(
      quat.x,
      quat.y,
      quat.z,
      quat.w
    );
  }

  return new THREE.QuaternionKeyframeTrack(
    bone.name + ".quaternion",
    times,
    result
  );
}

function makeWalkClip(bones) {
  const times = [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1.08, 1.26];

  const tracks = [];

  const legA = trackRotation(
    bones.legL,
    times,
    [[0.25,0,0],[0.08,0,0],[-0.3,0,0],[-0.08,0,0],[0.25,0,0],[0.08,0,0],[-0.3,0,0],[-0.08,0,0]],
    "legL"
  );

  const legB = trackRotation(
    bones.legR,
    times,
    [[-0.3,0,0],[-0.08,0,0],[0.25,0,0],[0.08,0,0],[-0.3,0,0],[-0.08,0,0],[0.25,0,0],[0.08,0,0]],
    "legR"
  );

  const armA = trackRotation(
    bones.armL,
    times,
    [[-0.35,0,0],[-0.1,0,0],[0.35,0,0],[0.1,0,0],[-0.35,0,0],[-0.1,0,0],[0.35,0,0],[0.1,0,0]],
    "armL"
  );

  const armB = trackRotation(
    bones.armR,
    times,
    [[0.35,0,0],[0.1,0,0],[-0.35,0,0],[-0.1,0,0],[0.35,0,0],[0.1,0,0],[-0.35,0,0],[-0.1,0,0]],
    "armR"
  );

  for (const track of [legA, legB, armA, armB]) {
    if (track) tracks.push(track);
  }

  if (bones.spine) {
    const spine = trackRotation(
      bones.spine,
      times,
      [[0,0,-0.02],[0,0,0.02],[0,0,-0.02],[0,0,0.02],[0,0,-0.02],[0,0,0.02],[0,0,-0.02],[0,0,0.02]],
      "spine"
    );
    if (spine) tracks.push(spine);
  }

  return new THREE.AnimationClip("EGGARO_WALK", 1.26, tracks);
}

function makeIdleClip(bones) {
  const times = [0, 0.8, 1.6, 2.4, 3.2];
  const tracks = [];

  if (bones.spine) {
    const spine = trackRotation(
      bones.spine,
      times,
      [[0,0,-0.015],[0,0,0.015],[0,0,-0.015],[0,0,0.015],[0,0,-0.015]],
      "spine"
    );
    if (spine) tracks.push(spine);
  }

  if (bones.head) {
    const head = trackRotation(
      bones.head,
      times,
      [[0,0,0],[0,0.035,0],[0,-0.025,0],[0,0.025,0],[0,0,0]],
      "head"
    );
    if (head) tracks.push(head);
  }

  return new THREE.AnimationClip("EGGARO_IDLE", 3.2, tracks);
}

function makeReactionClip(bones) {
  const times = [0, 0.25, 0.55, 0.9, 1.25];

  const tracks = [];

  if (bones.head) {
    const head = trackRotation(
      bones.head,
      times,
      [[0,0,0],[0,0.16,0],[0,0.28,0],[0,0.18,0],[0,0.08,0]],
      "head"
    );
    if (head) tracks.push(head);
  }

  if (bones.spine) {
    const spine = trackRotation(
      bones.spine,
      times,
      [[0,0,0],[0,0,-0.035],[0,0,-0.055],[0,0,-0.025],[0,0,0]],
      "spine"
    );
    if (spine) tracks.push(spine);
  }

  return new THREE.AnimationClip("EGGARO_REACTION", 1.25, tracks);
}

function playAction(actions, name) {
  const action = actions?.[name];
  if (!action) return;

  action.reset();
  action.enabled = true;
  action.setEffectiveWeight(1);
  action.setEffectiveTimeScale(1);
  action.play();
}

function crossFade(actions, fromName, toName, duration = 0.35) {
  const from = actions?.[fromName];
  const to = actions?.[toName];

  if (!to) return;

  to.reset();
  to.enabled = true;
  to.setEffectiveWeight(1);
  to.play();

  if (from && from !== to) {
    from.crossFadeTo(to, duration, true);
  }
}

/* ============================================================
   HUEVO
   ============================================================ */

function buildEgg() {
  const group = new THREE.Group();

  const texture = new THREE.TextureLoader().load(FILES.egg);
  texture.colorSpace = THREE.SRGBColorSpace;

  const shell = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.95, 1.05, 10, 24),
    new THREE.MeshStandardMaterial({
      color: 0xf1e5c8,
      roughness: 0.8,
      map: texture,
      transparent: true
    })
  );

  shell.scale.set(1, 1.25, 0.78);
  shell.castShadow = true;
  group.add(shell);

  const glow = new THREE.PointLight(0xffc967, 0, 10);
  glow.position.set(0, 0.25, 0.7);
  group.add(glow);

  group.position.set(0, 1.15, -3.6);
  group.visible = false;
  group.userData.glow = glow;

  scene.add(group);
  egg = group;
}

/* ============================================================
   RULETA 3D
   Las imágenes originales son texturas sobre cuerpos con volumen.
   No son planos sueltos: cada opción tiene profundidad y marco 3D.
   ============================================================ */

function makeRouletteCard(file, label) {
  const group = new THREE.Group();

  const texture = new THREE.TextureLoader().load(file);
  texture.colorSpace = THREE.SRGBColorSpace;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 2.15, 0.32),
    new THREE.MeshStandardMaterial({
      color: 0x4b3c2b,
      roughness: 0.62,
      metalness: 0.04
    })
  );
  body.castShadow = true;
  group.add(body);

  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(1.56, 1.86),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    })
  );
  front.position.z = 0.17;
  group.add(front);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.92, 2.27, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xb68a45,
      roughness: 0.5,
      metalness: 0.12
    })
  );
  frame.position.z = -0.22;
  group.add(frame);

  group.userData.label = label;
  return group;
}

function buildRoulette() {
  roulette = new THREE.Group();
  roulette.visible = false;
  roulette.position.set(0, 1.7, -4);

  const data = [
    [FILES.noob, "NOOB"],
    [FILES.zombie, "ZOMBIE"],
    [FILES.chick, "POLLITO NOOB"]
  ];

  for (const [file, label] of data) {
    roulette.add(makeRouletteCard(file, label));
  }

  scene.add(roulette);
}

function buildResultCard() {
  const file =
    result === "pollito_noob" ? FILES.chick :
    result === "zombie" ? FILES.zombie :
    FILES.noob;

  resultCard = makeRouletteCard(file, result.toUpperCase());
  resultCard.position.set(0, 1.65, -3.7);
  resultCard.scale.setScalar(0.2);

  const glow = new THREE.PointLight(0xffd37b, 0, 8);
  glow.position.set(0, 0, 1.4);
  resultCard.add(glow);
  resultCard.userData.glow = glow;

  scene.add(resultCard);
}

/* ============================================================
   HUD / DIÁLOGOS
   ============================================================ */

function buildHud() {
  hud = document.createElement("div");

  Object.assign(hud.style, {
    position: "fixed",
    inset: "0",
    zIndex: "60000",
    pointerEvents: "none",
    fontFamily: "Arial,sans-serif"
  });

  const top = document.createElement("div");
  const bottom = document.createElement("div");

  for (const bar of [top, bottom]) {
    Object.assign(bar.style, {
      position: "absolute",
      left: "0",
      width: "100%",
      height: "7%",
      background: "rgba(0,0,0,.66)"
    });
  }

  top.style.top = "0";
  bottom.style.bottom = "0";

  const title = document.createElement("div");
  const sub = document.createElement("div");

  Object.assign(title.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "14%",
    color: "#fff4dc",
    fontSize: "clamp(22px,5.5vw,54px)",
    fontWeight: "900",
    letterSpacing: ".06em",
    textShadow: "0 5px 25px #000",
    opacity: "0"
  });

  Object.assign(sub.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "7%",
    color: "#e2e7df",
    fontSize: "clamp(13px,2.8vw,22px)",
    lineHeight: "1.35",
    textShadow: "0 3px 14px #000",
    opacity: "0"
  });

  const vertical = document.createElement("div");
  vertical.textContent = "RECOMENDADO: JUGAR EN VERTICAL";

  Object.assign(vertical.style, {
    position: "absolute",
    top: "9%",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(0,0,0,.48)",
    color: "#f4e7bf",
    fontSize: "clamp(9px,1.8vw,14px)",
    fontWeight: "800",
    letterSpacing: ".12em",
    whiteSpace: "nowrap"
  });

  hud.append(top, bottom, title, sub, vertical);
  document.body.appendChild(hud);

  hud.title = title;
  hud.sub = sub;
  hud.vertical = vertical;
  hud.currentTitle = "";
  hud.currentSub = "";
}

function setHud(title, sub, instant = false) {
  if (!hud) return;

  if (hud.currentTitle === title && hud.currentSub === sub) return;

  hud.currentTitle = title;
  hud.currentSub = sub;

  const duration = instant ? 0 : 420;

  hud.title.animate(
    [
      { opacity: 0, transform: "translateY(7px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration, fill: "forwards", easing: "ease-out" }
  );

  hud.sub.animate(
    [
      { opacity: 0, transform: "translateY(7px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration, fill: "forwards", easing: "ease-out", delay: 70 }
  );

  hud.title.textContent = title;
  hud.sub.textContent = sub;

  hud.vertical.style.opacity =
    window.innerHeight > window.innerWidth && window.innerWidth < 900 ? "1" : "0";
}

function clearHud() {
  if (!hud) return;
  hud.style.transition = "opacity .7s ease";
  hud.style.opacity = "0";
}

/* ============================================================
   FASE 1 — CAMINATA
   ============================================================ */

function updateWalk(delta) {
  const p = THREE.MathUtils.clamp(phaseTime / WALK_TIME, 0, 1);

  if (!mike || !micaela) {
    setHud("EGGARO", "Cargando los modelos GLB de Mike y Micaela...");
    return;
  }

  const zMike = THREE.MathUtils.lerp(8, -1.0, p);
  const zMicaela = THREE.MathUtils.lerp(9, -0.2, p);

  mike.position.x = THREE.MathUtils.lerp(-1.05, -0.72, p);
  mike.position.z = zMike;

  micaela.position.x = THREE.MathUtils.lerp(1.05, 0.72, p);
  micaela.position.z = zMicaela;

  mike.rotation.y = Math.PI;
  micaela.rotation.y = Math.PI;

  const cameraZ = THREE.MathUtils.lerp(19, 5.7, p);
  const cameraX = THREE.MathUtils.lerp(0, 2.1, p);

  cameraTo(cameraX, 4.8, cameraZ, 0, 2.0, -4, 0.045);

  if (mikeMixer) mikeMixer.update(delta);
  if (micaelaMixer) micaelaMixer.update(delta);

  setHud(
    "EGGARO",
    "Mike y Micaela avanzan entre los árboles..."
  );

  if (p > 0.88 && phaseTime < WALK_TIME - 0.3) {
    crossFade(mikeActions, "walk", "idle");
    crossFade(micaelaActions, "walk", "idle");
  }

  if (p >= 1) {
    changePhase("ARRIVE");
  }
}

/* ============================================================
   FASE 2 — SE DETIENEN Y ESCUCHAN
   ============================================================ */

function updateArrive(delta) {
  if (mikeMixer) mikeMixer.update(delta);
  if (micaelaMixer) micaelaMixer.update(delta);

  cameraTo(2.8, 3.1, 4.7, 0, 1.9, -3.6, 0.055);

  if (phaseTime < 1.2) {
    setHud("...", "Mike y Micaela se detienen.");
  } else if (phaseTime < 2.5) {
    setHud("SILENCIO", "Algo se escucha entre los árboles...");
  } else {
    if (phaseTime < 3.0) {
      crossFade(mikeActions, "idle", "react", 0.25);
      crossFade(micaelaActions, "idle", "react", 0.25);
    }

    setHud("¿ESCUCHASTE ESO?", "Los dos miran hacia el bosque.");

    if (phaseTime > 4.0) changePhase("EGG");
  }
}

/* ============================================================
   FASE 3 — APARECE EL HUEVO
   ============================================================ */

function updateEgg(delta) {
  if (mikeMixer) mikeMixer.update(delta);
  if (micaelaMixer) micaelaMixer.update(delta);

  cameraTo(0, 2.0, 1.0, 0, 1.15, -3.6, 0.06);

  egg.visible = true;

  const scale = 0.96 + THREE.MathUtils.smoothstep(
    THREE.MathUtils.clamp(phaseTime / 2.2, 0, 1),
    0,
    1
  ) * 0.12;

  egg.scale.setScalar(scale);
  egg.userData.glow.intensity =
    THREE.MathUtils.lerp(0.8, 5.5, THREE.MathUtils.clamp(phaseTime / 5.2, 0, 1));

  if (phaseTime < 1.7) {
    setHud("¿QUÉ ES ESO?", "Una luz nace en medio del camino.");
  } else if (phaseTime < 3.8) {
    setHud("EL HUEVO", "La luz late lentamente...");
  } else {
    setHud("...", "Mike y Micaela no saben qué hacer.");

    if (phaseTime > EGG_TIME) {
      result = abrirHuevo("huevo_noob") || "noob";
      roulette.visible = true;
      changePhase("SELECT");
    }
  }
}

/* ============================================================
   FASE 4 — RULETA
   ============================================================ */

function updateSelect(delta) {
  egg.visible = false;
  roulette.visible = true;

  cameraTo(0, 2.4, 5.8, 0, 1.7, -3.7, 0.07);

  const progress = THREE.MathUtils.clamp(phaseTime / SELECT_TIME, 0, 1);
  const speed = THREE.MathUtils.lerp(8.5, 0.35, THREE.MathUtils.smoothstep(progress, 0.25, 1));

  roulette.rotation.y += delta * speed;

  const cards = roulette.children;

  for (let i = 0; i < cards.length; i++) {
    const angle = i * (Math.PI * 2 / 3);

    cards[i].position.set(
      Math.sin(angle) * 2.15,
      Math.cos(angle) * 0.28,
      Math.cos(angle) * 0.9
    );

    cards[i].rotation.y = -roulette.rotation.y - angle;
  }

  if (phaseTime < 4.0) {
    setHud("¿CUÁL SERÁ?", "PUM...   PUM...   PUM...");
  } else if (phaseTime < 6.2) {
    setHud("CASI...", "La ruleta comienza a detenerse.");
  } else {
    setHud("¡DETENIDO!", "Una opción acaba de ser elegida.");

    if (phaseTime > SELECT_TIME) {
      roulette.visible = false;
      buildResultCard();
      changePhase("RESULT");
    }
  }
}

/* ============================================================
   FASE 5 — GANADOR
   ============================================================ */

function updateResult(delta) {
  if (!resultCard) return;

  const p = THREE.MathUtils.clamp(phaseTime / RESULT_TIME, 0, 1);
  const eased = THREE.MathUtils.smoothstep(p, 0, 1);

  resultCard.scale.setScalar(THREE.MathUtils.lerp(0.25, 1.12, eased));
  resultCard.rotation.y += delta * THREE.MathUtils.lerp(0.45, 0.08, p);

  if (resultCard.userData.glow) {
    resultCard.userData.glow.intensity =
      THREE.MathUtils.lerp(0.5, 6, eased);
  }

  cameraTo(0, 1.85, 4.3, 0, 1.55, -3.7, 0.075);

  const label =
    result === "pollito_noob" ? "¡POLLITO NOOB!" :
    result === "zombie" ? "¡ZOMBIE!" :
    "¡NOOB!";

  setHud(label, "Tu primer huevo ha elegido.");

  if (phaseTime > RESULT_TIME) {
    changePhase("BLACK");
  }
}

/* ============================================================
   FASE 6 — TRANSICIÓN
   ============================================================ */

function updateBlack() {
  clearHud();

  renderer.setClearColor(0x000000, 1);
  renderer.clear(true, true, true);

  if (phaseTime > 1.6) finish();
}

/* ============================================================
   UTILIDADES
   ============================================================ */

function cameraTo(x, y, z, tx, ty, tz, amount = 0.05) {
  camera.position.lerp(new THREE.Vector3(x, y, z), amount);

  const target = new THREE.Vector3(tx, ty, tz);
  camera.lookAt(target);
}

function changePhase(next) {
  phase = next;
  phaseTime = 0;
}

function frame() {
  if (!running) return;

  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;
  phaseTime += delta;

  if (phase === "WALK") updateWalk(delta);
  else if (phase === "ARRIVE") updateArrive(delta);
  else if (phase === "EGG") updateEgg(delta);
  else if (phase === "SELECT") updateSelect(delta);
  else if (phase === "RESULT") updateResult(delta);
  else if (phase === "BLACK") updateBlack();

  renderer.render(scene, camera);
}

function finish() {
  running = false;
  finished = true;

  renderer.setAnimationLoop(null);

  if (hud) hud.remove();
}

function detener() {
  running = false;
  finished = false;

  renderer?.setAnimationLoop(null);

  if (hud) hud.remove();

  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  renderer?.dispose();

  scene = null;
  camera = null;
  renderer = null;
  clock = null;

  mike = null;
  micaela = null;
  mikeMixer = null;
  micaelaMixer = null;
  mikeActions = {};
  micaelaActions = {};
  mikeBones = {};
  micaelaBones = {};

  egg = null;
  roulette = null;
  resultCard = null;
  hud = null;
}

function resize() {
  if (!camera || !renderer) return;

  const w = Math.max(1, window.visualViewport?.width || innerWidth);
  const h = Math.max(1, window.visualViewport?.height || innerHeight);

  camera.aspect = w / h;
  camera.fov = w < h ? 58 : 52;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h, false);
}

window.addEventListener("resize", resize, { passive: true });
window.addEventListener(
  "orientationchange",
  () => setTimeout(resize, 80),
  { passive: true }
);
window.visualViewport?.addEventListener("resize", resize, { passive: true });
