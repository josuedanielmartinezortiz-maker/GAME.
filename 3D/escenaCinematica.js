import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { abrirHuevo, HUEVOS } from "../probabilidades.js";

let scene, camera, renderer, clock;
let mike, micaela, egg, selector;
let mikeBones = {}, micaelaBones = {};
let running = false, finished = false, raf = 0, elapsed = 0;
let phase = 0, phaseTime = 0, result = "noob";
let hud, selectorCards = [];

const loader = new GLTFLoader();

const FILES = {
  mike: "./3D/personajes/mike/mike.glb",
  micaela: "./3D/personajes/mikaela/micaela.glb",
  egg: "./3D/animales/huevo%20noob.png",
  noob: "./3D/animales/noob.png",
  chick: "./3D/animales/pollito%20noob.png",
  zombie: "./3D/animales/zombie.png"
};

// 0 portada, 1 caminata, 2 llegada, 3 huevo, 4 selector,
// 5 resultado, 6 negro/inicio del juego.
const PHASES = {
  WALK: 1,
  ARRIVE: 2,
  EGG: 3,
  SELECT: 4,
  RESULT: 5,
  BLACK: 6
};

const WALK_TIME = 60;

export function cinematicaTerminada() {
  return finished;
}

export function iniciarCinematica(container) {
  detener();
  finished = false;
  running = true;
  elapsed = 0;
  phase = PHASES.WALK;
  phaseTime = 0;
  result = "noob";

  createScene(container);
  createWorld();
  createHud();
  createEgg();
  createSelector();
  loadCharacters();

  clock = new THREE.Clock();
  renderer.render(scene, camera);
  raf = requestAnimationFrame(loop);
}

function createScene(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9bb3a1);
  scene.fog = new THREE.Fog(0x8fa99b, 18, 78);

  camera = new THREE.PerspectiveCamera(
    45,
    innerWidth / innerHeight,
    0.05,
    160
  );

  camera.position.set(0, 3.4, 13);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  Object.assign(renderer.domElement.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    zIndex: "50000",
    opacity: "1"
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);
}

function createWorld() {
  scene.add(new THREE.HemisphereLight(0xdaf0e4, 0x385039, 2.2));
  scene.add(new THREE.AmbientLight(0xb7d2c1, 1.0));

  const sun = new THREE.DirectionalLight(0xffdfaa, 4.2);
  sun.position.set(-18, 22, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x9ec7ff, 1.6);
  fill.position.set(15, 10, -15);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 120, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4e713f,
      roughness: 1
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  createPath();
  createAbandonedFarm();
  createTrees();
  createTallGrass();
  createAtmosphere();
}

function createPath() {
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 110),
    new THREE.MeshStandardMaterial({
      color: 0x6a5842,
      roughness: 1
    })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.025, -25);
  path.receiveShadow = true;
  scene.add(path);
}

function createAbandonedFarm() {
  const farm = new THREE.Group();
  farm.position.set(9, 0, -20);
  farm.rotation.y = -0.12;

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(9, 4.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x5c4938, roughness: 1 })
  );
  wall.position.y = 2.4;
  wall.castShadow = true;
  farm.add(wall);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(6.2, 3.0, 4),
    new THREE.MeshStandardMaterial({ color: 0x3c332b, roughness: 1 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 6.1;
  roof.scale.z = 0.75;
  roof.castShadow = true;
  farm.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 3.1, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x2e241c, roughness: 1 })
  );
  door.position.set(0, 1.55, 3.1);
  farm.add(door);

  for (let i = 0; i < 7; i++) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 4.6, 6.15),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x654d38 : 0x73563d,
        roughness: 1
      })
    );
    board.position.set(-3.6 + i * 1.2, 2.4, 0);
    board.rotation.z = (i % 3 - 1) * 0.012;
    farm.add(board);
  }

  scene.add(farm);
}

function createTree() {
  const g = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.36, 4.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x493326, roughness: 1 })
  );
  trunk.position.y = 2;
  trunk.castShadow = true;
  g.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.65, 1),
    new THREE.MeshStandardMaterial({ color: 0x31563a, roughness: 1 })
  );
  crown.position.y = 4.1;
  crown.scale.set(1.05, 1.4, 0.95);
  crown.castShadow = true;
  g.add(crown);

  return g;
}

function createTrees() {
  for (let i = 0; i < 70; i++) {
    const t = createTree();
    const side = i % 2 ? 1 : -1;
    t.position.set(
      side * (3.1 + Math.random() * 3.8),
      0,
      18 - i * 1.35 + (Math.random() - 0.5) * 2
    );
    const s = 0.65 + Math.random() * 1.15;
    t.scale.setScalar(s);
    t.rotation.y = Math.random() * Math.PI;
    scene.add(t);
  }
}

function createTallGrass() {
  const geo = new THREE.ConeGeometry(0.07, 0.8, 4);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3d6d36,
    roughness: 1
  });

  for (let i = 0; i < 850; i++) {
    const grass = new THREE.Mesh(geo, mat);
    let x = (Math.random() - 0.5) * 26;
    const z = (Math.random() - 0.5) * 82;

    if (Math.abs(x) < 2.1) x = x < 0 ? -2.2 : 2.2;

    grass.position.set(x, 0.4, z);
    grass.scale.setScalar(0.55 + Math.random() * 1.7);
    grass.rotation.y = Math.random() * Math.PI;
    scene.add(grass);
  }
}

function createAtmosphere() {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffe8b4 })
  );
  moon.position.set(-22, 18, -55);
  scene.add(moon);

  for (let i = 0; i < 90; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 5, 4),
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0xd9f0dc : 0xffdf9b,
        transparent: true,
        opacity: 0.45
      })
    );
    p.position.set(
      (Math.random() - 0.5) * 18,
      0.3 + Math.random() * 6,
      12 - Math.random() * 60
    );
    p.userData.seed = Math.random() * 10;
    scene.add(p);
  }
}

async function loadCharacters() {
  try {
    const [a, b] = await Promise.all([
      loader.loadAsync(FILES.mike),
      loader.loadAsync(FILES.micaela)
    ]);

    mike = prepareCharacter(a.scene, -1.0, 8);
    micaela = prepareCharacter(b.scene, 1.0, 9);

    mikeBones = findBones(mike);
    micaelaBones = findBones(micaela);

    scene.add(mike, micaela);
  } catch (error) {
    console.error("[EGGARO] Error cargando personajes:", error);
  }
}

function prepareCharacter(obj, x, z) {
  obj.position.set(x, 0, z);
  obj.rotation.y = Math.PI;

  obj.traverse(n => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(obj);
  if (Number.isFinite(box.min.y)) obj.position.y -= box.min.y;

  return obj;
}

function findBones(obj) {
  const bones = {};

  obj.traverse(n => {
    if (!n.isBone) return;

    const s = n.name.toLowerCase();

    if (!bones.spine && /spine|chest|torso|pelvis/.test(s)) bones.spine = n;
    if (!bones.head && /head|neck|cabeza|cuello/.test(s)) bones.head = n;
    if (!bones.armL && /(left|l).*arm|arm.*left|brazo.*izq/.test(s)) bones.armL = n;
    if (!bones.armR && /(right|r).*arm|arm.*right|brazo.*der/.test(s)) bones.armR = n;
    if (!bones.legL && /(left|l).*leg|leg.*left|pierna.*izq/.test(s)) bones.legL = n;
    if (!bones.legR && /(right|r).*leg|leg.*right|pierna.*der/.test(s)) bones.legR = n;
  });

  return bones;
}

function walkCharacter(obj, bones, t, stride = 1) {
  if (!obj) return;

  const w = Math.sin(t * 7.2) * stride;

  if (bones.armL) bones.armL.rotation.x = w * 0.34;
  if (bones.armR) bones.armR.rotation.x = -w * 0.34;
  if (bones.legL) bones.legL.rotation.x = -w * 0.48;
  if (bones.legR) bones.legR.rotation.x = w * 0.48;
  if (bones.spine) bones.spine.rotation.z = Math.sin(t * 3.6) * 0.035;
  if (bones.head) bones.head.rotation.z = Math.sin(t * 2.0) * 0.025;

  obj.position.y = Math.abs(Math.sin(t * 7.2)) * 0.025;
}

function idleCharacter(obj, bones, t) {
  if (!obj) return;

  if (bones.spine) bones.spine.rotation.z = Math.sin(t * 1.7) * 0.025;
  if (bones.head) bones.head.rotation.y = Math.sin(t * 1.4) * 0.045;
}

function createEgg() {
  const group = new THREE.Group();

  const texture = new THREE.TextureLoader().load(FILES.egg);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 2.2),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    })
  );

  mesh.position.z = 0.25;
  group.add(mesh);

  const light = new THREE.PointLight(0xffcf69, 0, 12);
  light.position.set(0, 0.4, 0.7);
  group.add(light);

  group.position.set(0, 1.15, -3.0);
  group.userData.light = light;
  group.visible = false;

  scene.add(group);
  egg = group;
}

function makeCard(textureFile, label, color) {
  const group = new THREE.Group();

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.65, 2.05),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(textureFile),
      transparent: true,
      side: THREE.DoubleSide
    })
  );

  group.add(panel);

  const border = new THREE.Mesh(
    new THREE.RingGeometry(0.84, 0.9, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    })
  );
  border.scale.set(0.9, 1.12, 1);
  group.add(border);

  const text = document.createElement("div");
  text.textContent = label;
  Object.assign(text.style, {
    position: "absolute",
    color: "#fff",
    fontWeight: "900",
    fontSize: "12px"
  });

  return group;
}

function createSelector() {
  selector = new THREE.Group();
  selector.visible = false;
  selector.position.set(0, 1.7, -3.0);

  const data = [
    [FILES.noob, "NOOB", 0x8fd36e],
    [FILES.chick, "POLLITO NOOB", 0xffd15c],
    [FILES.zombie, "ZOMBIE", 0x91b8a0]
  ];

  selectorCards = data.map((item, i) => {
    const card = makeCard(item[0], item[1], item[2]);
    card.position.x = (i - 1) * 2.0;
    selector.add(card);
    return card;
  });

  const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.5, 4),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  pointer.position.set(0, 1.55, 0.15);
  pointer.rotation.z = Math.PI;
  selector.add(pointer);

  scene.add(selector);
}

function createHud() {
  hud = document.createElement("div");
  Object.assign(hud.style, {
    position: "fixed",
    inset: "0",
    zIndex: "60000",
    pointerEvents: "none",
    fontFamily: "Arial, sans-serif"
  });

  const top = document.createElement("div");
  const bottom = document.createElement("div");

  [top, bottom].forEach(bar => Object.assign(bar.style, {
    position: "absolute",
    left: "0",
    width: "100%",
    height: "7%",
    background: "#030505"
  }));

  top.style.top = "0";
  bottom.style.bottom = "0";

  const title = document.createElement("div");
  const sub = document.createElement("div");

  Object.assign(title.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "16%",
    color: "#fff",
    fontSize: "clamp(24px, 6vw, 58px)",
    fontWeight: "900",
    lineHeight: "1.05",
    letterSpacing: ".08em",
    textShadow: "0 5px 25px #000",
    textAlign: "left"
  });

  Object.assign(sub.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "9%",
    color: "#dce9e0",
    fontSize: "clamp(13px, 2.7vw, 22px)",
    lineHeight: "1.25",
    textShadow: "0 3px 14px #000"
  });

  hud.append(top, bottom, title, sub);
  document.body.appendChild(hud);

  hud.title = title;
  hud.sub = sub;
}

function setHud(title, sub = "") {
  if (!hud) return;
  hud.title.textContent = title;
  hud.sub.textContent = sub;
}

function clearHud() {
  if (!hud) return;
  hud.title.textContent = "";
  hud.sub.textContent = "";
}

function cameraTo(x, y, z, tx, ty, tz, speed = 0.055) {
  camera.position.lerp(new THREE.Vector3(x, y, z), speed);
  camera.lookAt(tx, ty, tz);
}

function updateWalk(delta) {
  const p = Math.min(phaseTime / WALK_TIME, 1);

  if (mike) {
    mike.position.x = THREE.MathUtils.lerp(-1.0, -0.62, p);
    mike.position.z = THREE.MathUtils.lerp(8, -1.0, p);
    walkCharacter(mike, mikeBones, elapsed, 1);
  }

  if (micaela) {
    micaela.position.x = THREE.MathUtils.lerp(1.0, 0.62, p);
    micaela.position.z = THREE.MathUtils.lerp(9, -0.2, p);
    walkCharacter(micaela, micaelaBones, elapsed + 0.3, 0.95);
  }

  const camZ = THREE.MathUtils.lerp(15, 4.8, p);
  const camX = Math.sin(elapsed * 0.35) * 2.0;

  cameraTo(
    camX,
    3.1 + Math.sin(elapsed * 0.5) * 0.08,
    camZ,
    0,
    1.1,
    -1.5,
    0.075
  );

  setHud(
    "EGGARO",
    "Mike y Micaela atraviesan la granja abandonada..."
  );

  if (p >= 1) changePhase(PHASES.ARRIVE);
}

function updateArrive(delta) {
  if (mike) idleCharacter(mike, mikeBones, elapsed);
  if (micaela) idleCharacter(micaela, micaelaBones, elapsed + 0.3);

  cameraTo(3.2, 2.15, 3.0, 0, 1.15, -3, 0.08);

  if (egg) {
    egg.visible = true;
    egg.position.y = 1.15 + Math.sin(elapsed * 1.8) * 0.03;
    egg.rotation.y = Math.sin(elapsed * 1.4) * 0.08;
    egg.userData.light.intensity = 2.2 + Math.sin(elapsed * 3) * 0.5;
  }

  setHud("EL HUEVO", "Algo extraño espera en medio del camino.");

  if (phaseTime > 5.0) changePhase(PHASES.EGG);
}

function updateEgg(delta) {
  if (mike) idleCharacter(mike, mikeBones, elapsed);
  if (micaela) idleCharacter(micaela, micaelaBones, elapsed + 0.3);

  cameraTo(0.0, 1.45, 0.35, 0, 1.15, -3.0, 0.09);

  if (egg) {
    egg.visible = true;
    const pulse = Math.sin(phaseTime * 12) * 0.045;
    egg.scale.setScalar(1.12 + pulse);
    egg.rotation.y += delta * 0.7;
    egg.userData.light.intensity = 4 + phaseTime * 1.7;
  }

  setHud("SE ABRE...", "La energía del huevo aumenta.");

  if (phaseTime > 5.5) {
    result = abrirHuevo("huevo_noob") || chooseResult();
    changePhase(PHASES.SELECT);
  }
}

function chooseResult() {
  const data = HUEVOS.huevo_noob || [];
  const total = data.reduce((a, b) => a + b[1], 0);
  let r = Math.random() * total;

  for (const item of data) {
    r -= item[1];
    if (r <= 0) return item[0];
  }

  return "noob";
}

function updateSelector(delta) {
  if (egg) egg.visible = false;
  selector.visible = true;

  cameraTo(0, 2.2, 5.0, 0, 1.8, -3, 0.08);

  const speed = phaseTime < 3.8
    ? 8.5 - phaseTime
    : Math.max(0.8, 4.8 - (phaseTime - 3.8) * 3.2);

  selector.rotation.y += delta * speed;

  selectorCards.forEach((card, i) => {
    const a = i * (Math.PI * 2 / 3);
    card.position.set(
      Math.sin(a) * 2.05,
      Math.cos(a) * 0.28,
      Math.cos(a) * 0.45
    );
    card.rotation.y = -selector.rotation.y - a;
  });

  setHud(
    "¿CUÁL SERÁ?",
    "Los tres resultados giran... ¡PUM! ¡PUM! ¡PUM!"
  );

  if (phaseTime > 6.2) changePhase(PHASES.RESULT);
}

function updateResult(delta) {
  selector.visible = false;

  const file =
    result === "pollito_noob" ? FILES.chick :
    result === "zombie" ? FILES.zombie :
    FILES.noob;

  if (!window.__gairoResult) {
    const tex = new THREE.TextureLoader().load(file);
    tex.colorSpace = THREE.SRGBColorSpace;

    const g = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide
      })
    );
    g.add(mesh);
    g.position.set(0, 1.55, -2.7);
    g.scale.setScalar(0.3);
    scene.add(g);
    window.__gairoResult = g;
  }

  const g = window.__gairoResult;
  g.scale.setScalar(Math.min(1, 0.3 + phaseTime * 1.7));
  g.rotation.y += delta * 0.45;

  cameraTo(0, 1.7, 3.8, 0, 1.5, -2.7, 0.08);

  const label =
    result === "pollito_noob" ? "POLLITO NOOB" :
    result === "zombie" ? "ZOMBIE" : "NOOB";

  setHud("¡" + label + "!", "Este será el resultado de la aventura.");

  if (phaseTime > 3.8) changePhase(PHASES.BLACK);
}

function updateBlack() {
  renderer.domElement.style.opacity = "1";

  if (hud) {
    hud.style.background = "#000";
    hud.title.textContent = "";
    hud.sub.textContent = "";
  }

  if (phaseTime > 1.5) finish();
}

function changePhase(next) {
  phase = next;
  phaseTime = 0;

  if (next === PHASES.BLACK) {
    renderer.domElement.style.transition = "opacity .8s ease";
  }
}

function loop() {
  if (!running) return;

  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;
  phaseTime += delta;

  if (phase === PHASES.WALK) updateWalk(delta);
  if (phase === PHASES.ARRIVE) updateArrive(delta);
  if (phase === PHASES.EGG) updateEgg(delta);
  if (phase === PHASES.SELECT) updateSelector(delta);
  if (phase === PHASES.RESULT) updateResult(delta);
  if (phase === PHASES.BLACK) updateBlack();

  renderer.render(scene, camera);
  raf = requestAnimationFrame(loop);
}

function finish() {
  running = false;
  finished = true;
  if (hud) hud.remove();
}

function detener() {
  running = false;
  cancelAnimationFrame(raf);

  if (hud) hud.remove();

  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  renderer?.dispose();

  scene = null;
  camera = null;
  renderer = null;
  mike = null;
  micaela = null;
  egg = null;
  selector = null;
  selectorCards = [];
  hud = null;
  window.__gairoResult = null;
}

window.addEventListener("resize", () => {
  if (!camera || !renderer) return;

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
