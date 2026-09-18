import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { abrirHuevo } from "../probabilidades.js";

let scene, camera, renderer, clock;
let mike, micaela, egg, roulette, resultCard, hud;
let mikeBones = {}, micaelaBones = {};
let running = false, finished = false;
let phase = "WALK", phaseTime = 0, elapsed = 0;
let result = "noob";
let ready = false;
let containerRef = null;

const loader = new GLTFLoader();

const FILES = {
  mike: "./3D/personajes/mike/mike.glb",
  micaela: "./3D/personajes/mikaela/micaela.glb",
  egg: "./3D/animales/huevo%20noob.png",
  noob: "./3D/animales/noob.png",
  chick: "./3D/animales/pollito%20noob.png",
  zombie: "./3D/animales/zombie.png",
  mikeImage: "./3D/personajes/mike/mike.png",
  micaelaImage: "./3D/personajes/mikaela/micaela.png"
};

const WALK_TIME = 60;

export function cinematicaTerminada() {
  return finished;
}

export function iniciarCinematica(container) {
  detener();
  containerRef = container;
  finished = false;
  running = true;
  ready = false;
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

  loadCharacters();
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaed5df);
  scene.fog = new THREE.Fog(0xd9d8b8, 28, 105);

  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 220);
  camera.position.set(0, 6.5, 18);
  camera.lookAt(2, 3.2, -10);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));

  Object.assign(renderer.domElement.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    zIndex: "50000",
    background: "#000"
  });

  containerRef.appendChild(renderer.domElement);
  resize();
}

function buildWorld() {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(180, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xaed5df, side: THREE.BackSide })
  );
  scene.add(sky);

  const sunrise = new THREE.Mesh(
    new THREE.SphereGeometry(90, 24, 12),
    new THREE.MeshBasicMaterial({
      color: 0xf4d99a,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    })
  );
  sunrise.position.set(-25, 12, -60);
  scene.add(sunrise);

  scene.add(new THREE.HemisphereLight(0xc6e5ee, 0x40522f, 1.8));
  const sun = new THREE.DirectionalLight(0xffd18a, 4.2);
  sun.position.set(-25, 25, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.far = 100;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150, 40, 40),
    new THREE.MeshStandardMaterial({ color: 0x4f8a3c, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 125),
    new THREE.MeshStandardMaterial({ color: 0x735b43, roughness: 1 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, -22);
  scene.add(path);

  buildCabin();
  buildHorizon();
  buildVegetation();
  buildRocks();

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff1b0 })
  );
  sunDisc.position.set(-19, 12.5, -48);
  scene.add(sunDisc);
}

function buildCabin() {
  const g = new THREE.Group();
  g.position.set(7, 0, -9);
  g.rotation.y = -0.12;

  const wood = new THREE.MeshStandardMaterial({ color: 0x765537, roughness: 1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(11, 5.5, 7), wood);
  body.position.y = 2.75;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  for (let i = 0; i < 13; i++) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 5.2, 7.15),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x62452f : 0x775436,
        roughness: 1
      })
    );
    board.position.set(-5 + i * 0.82, 2.75, 0);
    g.add(board);
  }

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x49382d, roughness: 1 });
  for (const side of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.35, 12), roofMat);
    roof.position.set(side * 3, 7.3, 0);
    roof.rotation.z = side < 0 ? 0.52 : -0.52;
    roof.castShadow = true;
    g.add(roof);
  }

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 3.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x3d2b20 })
  );
  door.position.set(0, 1.75, 3.62);
  g.add(door);

  for (const x of [-3.2, 3.2]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.7, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x334747, roughness: 0.5 })
    );
    win.position.set(x, 3.2, 3.62);
    g.add(win);
  }

  scene.add(g);
}

function buildHorizon() {
  for (let i = 0; i < 12; i++) {
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x74866b, roughness: 1 })
    );
    const h = 3 + Math.random() * 5;
    hill.scale.set(14 + Math.random() * 10, h, 5);
    hill.position.set(-55 + i * 10 + Math.random() * 5, h * 0.45, -45 - Math.random() * 8);
    scene.add(hill);
  }

  for (let i = 0; i < 35; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x514535 })
    );
    trunk.position.y = 1.1;
    tree.add(trunk);
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x4e6d48 })
    );
    crown.position.y = 2.5;
    tree.add(crown);
    tree.position.set(-45 + Math.random() * 90, 0, -38 - Math.random() * 12);
    tree.scale.setScalar(0.6 + Math.random() * 0.7);
    scene.add(tree);
  }
}

function buildVegetation() {
  const grassGeo = new THREE.ConeGeometry(0.055, 0.55, 3);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3f7f32, roughness: 1 });
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, 2200);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < 2200; i++) {
    let x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 75;
    if (Math.abs(x) < 2.5) x += x < 0 ? -2.5 : 2.5;
    const s = 0.5 + Math.random() * 1.8;
    dummy.position.set(x, s * 0.27, z);
    dummy.scale.setScalar(s);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  }
  grass.instanceMatrix.needsUpdate = true;
  scene.add(grass);

  for (let i = 0; i < 50; i++) {
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.8 + Math.random() * 0.7, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x416d35, roughness: 1 })
    );
    bush.scale.y = 0.65;
    bush.position.set(-30 + Math.random() * 60, 0.65, -30 + Math.random() * 45);
    scene.add(bush);
  }
}

function buildRocks() {
  const data = [
    [-7, 0.7, 8, 2.7, 1.1, 2.2],
    [8, 0.65, 7, 3.2, 1.2, 2.4],
    [-1, 0.35, 5, 1.4, 0.6, 1.2]
  ];

  for (const [x, y, z, sx, sy, sz] of data) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color: 0x77756b, roughness: 1 })
    );
    rock.position.set(x, y, z);
    rock.scale.set(sx, sy, sz);
    rock.castShadow = true;
    scene.add(rock);
  }
}

async function loadCharacters() {
  // La cinemática comienza con los diseños reales del repositorio.
  // Los GLB se intentan cargar en segundo plano y no bloquean la historia.
  mike = makeCharacterFallback(FILES.mikeImage, -1.0, 8);
  micaela = makeCharacterFallback(FILES.micaelaImage, 1.0, 9);
  scene.add(mike, micaela);
  ready = true;
  setHud("EGGARO", "Mike y Micaela entran en la granja...");

  try {
    const [a, b] = await Promise.all([
      loader.loadAsync(FILES.mike),
      loader.loadAsync(FILES.micaela)
    ]);

    const nextMike = prepare(a.scene, -1.0, 8);
    const nextMicaela = prepare(b.scene, 1.0, 9);

    if (mike?.parent) scene.remove(mike);
    if (micaela?.parent) scene.remove(micaela);

    mike = nextMike;
    micaela = nextMicaela;
    scene.add(mike, micaela);

    mikeBones = findBones(mike);
    micaelaBones = findBones(micaela);
    setHud("EGGARO", "Mike y Micaela entran en la granja...");
  } catch (error) {
    console.warn("[EGGARO] Se mantienen los diseños PNG del repositorio:", error);
  }
}

function makeCharacterFallback(file, x, z) {
  const tex = new THREE.TextureLoader().load(file);
  tex.colorSpace = THREE.SRGBColorSpace;
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 3.6),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
  );
  group.add(mesh);
  group.position.set(x, 1.8, z);
  group.userData.fallback = true;
  return group;
}

function prepare(obj, x, z) {
  obj.rotation.y = Math.PI;

  obj.traverse(n => {
    if (!n.isMesh) return;
    n.castShadow = true;
    n.receiveShadow = true;
    if (n.material) n.material.needsUpdate = true;
  });

  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (size.y > 0.001) obj.scale.multiplyScalar(2.6 / size.y);

  const fitted = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  fitted.getCenter(center);

  obj.position.set(x - center.x, -fitted.min.y, z - center.z);
  return obj;
}

function findBones(obj) {
  const b = {};
  if (!obj) return b;

  obj.traverse(n => {
    if (!n.isBone) return;
    const s = n.name.toLowerCase();

    if (!b.spine && /spine|chest|torso|pelvis/.test(s)) b.spine = n;
    if (!b.head && /head|neck|cabeza|cuello/.test(s)) b.head = n;
    if (!b.armL && /(left|l).*arm|arm.*left|brazo.*izq/.test(s)) b.armL = n;
    if (!b.armR && /(right|r).*arm|arm.*right|brazo.*der/.test(s)) b.armR = n;
    if (!b.legL && /(left|l).*leg|leg.*left|pierna.*izq/.test(s)) b.legL = n;
    if (!b.legR && /(right|r).*leg|leg.*right|pierna.*der/.test(s)) b.legR = n;
  });

  return b;
}

function walk(obj, bones, t, phase = 0) {
  if (!obj) return;
  const w = Math.sin(t * 7 + phase);

  if (bones.armL) bones.armL.rotation.x = w * 0.42;
  if (bones.armR) bones.armR.rotation.x = -w * 0.42;
  if (bones.legL) bones.legL.rotation.x = -w * 0.58;
  if (bones.legR) bones.legR.rotation.x = w * 0.58;
  if (bones.spine) bones.spine.rotation.z = Math.sin(t * 3.5) * 0.04;
  if (bones.head) bones.head.rotation.z = Math.sin(t * 2.0) * 0.025;

  obj.position.y = Math.abs(Math.sin(t * 7 + phase)) * 0.025;
}

function idle(obj, bones, t) {
  if (!obj) return;
  if (bones.spine) bones.spine.rotation.z = Math.sin(t * 1.7) * 0.025;
  if (bones.head) bones.head.rotation.y = Math.sin(t * 1.4) * 0.045;
}

function buildEgg() {
  const group = new THREE.Group();
  const texture = new THREE.TextureLoader().load(FILES.egg);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.55),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
  );
  group.add(mesh);

  const glow = new THREE.PointLight(0xffcf69, 0, 12);
  glow.position.set(0, 0.3, 0.6);
  group.add(glow);

  group.position.set(0, 1.25, -3.4);
  group.visible = false;
  group.userData.glow = glow;
  scene.add(group);
  egg = group;
}

function makeImageCard(file, label) {
  const group = new THREE.Group();
  const tex = new THREE.TextureLoader().load(file);
  tex.colorSpace = THREE.SRGBColorSpace;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 2.15),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  );
  group.add(panel);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.92, 1.0, 48),
    new THREE.MeshBasicMaterial({ color: 0xe8c36a, transparent: true, opacity: 0.9 })
  );
  ring.scale.set(0.95, 1.15, 1);
  group.add(ring);

  group.userData.label = label;
  return group;
}

function buildRoulette() {
  roulette = new THREE.Group();
  roulette.visible = false;
  roulette.position.set(0, 1.65, -3.3);

  const data = [
    [FILES.noob, "NOOB"],
    [FILES.chick, "POLLITO NOOB"],
    [FILES.zombie, "ZOMBIE"]
  ];

  for (let i = 0; i < 3; i++) {
    const card = makeImageCard(data[i][0], data[i][1]);
    roulette.add(card);
  }

  scene.add(roulette);
}

function buildResultCard() {
  const file =
    result === "pollito_noob" ? FILES.chick :
    result === "zombie" ? FILES.zombie :
    FILES.noob;

  resultCard = makeImageCard(file, result.toUpperCase());
  resultCard.position.set(0, 1.55, -3.0);
  resultCard.scale.setScalar(0.2);
  scene.add(resultCard);
}

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
      height: "6%",
      background: "rgba(0,0,0,.78)"
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
    bottom: "15%",
    color: "#fff",
    fontSize: "clamp(24px,6vw,58px)",
    fontWeight: "900",
    letterSpacing: ".08em",
    textShadow: "0 5px 25px #000"
  });

  Object.assign(sub.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "8%",
    color: "#dce9e0",
    fontSize: "clamp(13px,2.7vw,22px)",
    textShadow: "0 3px 14px #000"
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
    background: "rgba(0,0,0,.5)",
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
}

function setHud(title, sub) {
  if (!hud) return;
  hud.title.textContent = title;
  hud.sub.textContent = sub;
  hud.vertical.style.opacity = innerHeight > innerWidth && innerWidth < 900 ? "1" : "0";
}

function cameraTo(x, y, z, tx, ty, tz, speed = 0.06) {
  camera.position.lerp(new THREE.Vector3(x, y, z), speed);
  camera.lookAt(tx, ty, tz);
}

function updateWalk() {
  if (!ready) return;

  const p = THREE.MathUtils.clamp(phaseTime / WALK_TIME, 0, 1);

  mike.position.x = THREE.MathUtils.lerp(-1.0, -0.7, p);
  mike.position.z = THREE.MathUtils.lerp(8, -1.0, p);
  micaela.position.x = THREE.MathUtils.lerp(1.0, 0.7, p);
  micaela.position.z = THREE.MathUtils.lerp(9, -0.2, p);

  walk(mike, mikeBones, elapsed, 0);
  walk(micaela, micaelaBones, elapsed, 0.8);

  const distance = 16 - p * 11;
  const side = Math.sin(elapsed * 0.22) * 2.0;
  cameraTo(side, 4.1 + Math.sin(elapsed * 0.4) * 0.15, distance, 0, 1.8, -1, 0.045);

  setHud("EGGARO", "Mike y Micaela atraviesan la granja abandonada...");

  if (p >= 1) changePhase("ARRIVE");
}

function updateArrive() {
  idle(mike, mikeBones, elapsed);
  idle(micaela, micaelaBones, elapsed + 0.4);

  cameraTo(3.2, 2.4, 4.5, 0, 1.25, -3.4, 0.07);

  egg.visible = true;
  egg.position.y = 1.25 + Math.sin(elapsed * 1.8) * 0.04;
  egg.rotation.y = Math.sin(elapsed * 1.5) * 0.12;
  egg.userData.glow.intensity = 2.5 + Math.sin(elapsed * 3) * 0.5;

  setHud("EL HUEVO", "Algo extraño espera en medio del camino.");
  if (phaseTime > 5) changePhase("EGG");
}

function updateEgg(delta) {
  idle(mike, mikeBones, elapsed);
  idle(micaela, micaelaBones, elapsed + 0.4);

  cameraTo(0, 1.55, 0.6, 0, 1.25, -3.4, 0.08);

  egg.visible = true;
  egg.scale.setScalar(1.1 + Math.sin(phaseTime * 12) * 0.05);
  egg.rotation.y += delta * 0.8;
  egg.userData.glow.intensity = 4 + phaseTime * 2;

  setHud("SE ABRE...", "La energía del huevo aumenta.");

  if (phaseTime > 5.5) {
    result = abrirHuevo("huevo_noob") || "noob";
    roulette.visible = true;
    changePhase("SELECT");
  }
}

function updateSelect(delta) {
  egg.visible = false;
  roulette.visible = true;

  cameraTo(0, 2.3, 5.2, 0, 1.7, -3.3, 0.08);

  const speed = phaseTime < 4 ? 7.5 - phaseTime : Math.max(0.6, 3.8 - (phaseTime - 4) * 2.8);
  roulette.rotation.y += delta * speed;

  const cards = roulette.children;
  for (let i = 0; i < cards.length; i++) {
    const a = i * Math.PI * 2 / 3;
    cards[i].position.set(Math.sin(a) * 2.15, Math.cos(a) * 0.25, Math.cos(a) * 0.5);
    cards[i].rotation.y = -roulette.rotation.y - a;
  }

  setHud("¿CUÁL SERÁ?", "¡PUM!  ¡PUM!  ¡PUM!");
  if (phaseTime > 6.5) {
    roulette.visible = false;
    buildResultCard();
    changePhase("RESULT");
  }
}

function updateResult(delta) {
  if (!resultCard) return;

  const s = Math.min(1.15, 0.2 + phaseTime * 1.8);
  resultCard.scale.setScalar(s);
  resultCard.rotation.y += delta * 0.35;
  cameraTo(0, 1.75, 4.0, 0, 1.5, -3.0, 0.08);

  const label =
    result === "pollito_noob" ? "¡POLLITO NOOB!" :
    result === "zombie" ? "¡ZOMBIE!" :
    "¡NOOB!";

  setHud(label, "Este es el resultado de tu primer huevo.");
  if (phaseTime > 4.2) changePhase("BLACK");
}

function updateBlack() {
  renderer.setClearColor(0x000000, 1);
  renderer.clear(true, true, true);
  if (hud) hud.style.opacity = "0";
  if (phaseTime > 1.5) finish();
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

  if (phase === "WALK") updateWalk();
  else if (phase === "ARRIVE") updateArrive();
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
  if (renderer?.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  renderer?.dispose();

  scene = null;
  camera = null;
  renderer = null;
  mike = null;
  micaela = null;
  egg = null;
  roulette = null;
  resultCard = null;
  hud = null;
  mikeBones = {};
  micaelaBones = {};
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
window.addEventListener("orientationchange", () => setTimeout(resize, 80), { passive: true });
window.visualViewport?.addEventListener("resize", resize, { passive: true });
