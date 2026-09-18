import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { abrirHuevo, HUEVOS } from "../probabilidades.js";

let scene, camera, renderer, clock, root;
let mike, micaela, egg, resultObject, roulette;
let mikeBones = {}, micaelaBones = {};
let finished = false, running = false, raf = 0, time = 0, phase = 0, result = null;
let particles = [], fireflies = [], cinematicHUD = null, logo = null;

const loader = new GLTFLoader();

const FILES = {
  mike: "./3D/personajes/mike/mike.glb",
  micaela: "./3D/personajes/mikaela/micaela.glb",
  mikeDesign: "./3D/personajes/mike/mike.png",
  micaelaDesign: "./3D/personajes/mikaela/micaela.png",
  eggDesign: "./3D/animales/huevo%20noob.png",
  noob: "./3D/animales/noob.png",
  chick: "./3D/animales/pollito%20noob.png",
  zombie: "./3D/animales/zombie.png"
};

const PHASE = { TITLE: 0, WALK: 1, DISCOVER: 2, ROULETTE: 3, EGG: 4, BIRTH: 5, RESULT: 6, END: 7 };
const LENGTH = [2.8, 5.0, 3.0, 4.8, 2.8, 2.5, 4.2, 2.0];

export function cinematicaTerminada() { return finished; }

export function establecerResultadoCinematica(value) {
  if (HUEVOS.huevo_noob && HUEVOS.huevo_noob.some(function (x) { return x[0] === value; })) result = value;
}

export function iniciarCinematica(container) {
  detener();
  root = container;
  finished = false;
  running = true;
  phase = PHASE.TITLE;
  time = 0;
  result = null;
  createScene();
  createHUD();
  createTitle();
  createEgg();
  createRoulette();
  createFX();
  loadCharacters();
  clock = new THREE.Clock();
  raf = requestAnimationFrame(loop);
}

function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x12242a);
  scene.fog = new THREE.FogExp2(0x17302d, 0.012);

  camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.05, 180);
  camera.position.set(0, 4.2, 15);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x9fc8c2, 1.25));
  scene.add(new THREE.HemisphereLight(0xbfe8f0, 0x25452e, 1.8));

  const moon = new THREE.DirectionalLight(0x9ec5ff, 3.8);
  moon.position.set(-10, 16, 8);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  scene.add(moon);

  const warm = new THREE.DirectionalLight(0xffc27b, 3.0);
  warm.position.set(8, 6, -12);
  scene.add(warm);

  const magic = new THREE.PointLight(0x73dfff, 3.5, 18);
  magic.position.set(0, 2.5, -3);
  scene.add(magic);

  const fill = new THREE.PointLight(0xffd28a, 2.4, 22);
  fill.position.set(-5, 4.5, 4);
  scene.add(fill);

  const eggLight = new THREE.SpotLight(0xffe3a3, 5.5, 18, Math.PI / 4, 0.55, 1.2);
  eggLight.position.set(0, 5.5, 3.5);
  eggLight.target.position.set(0, 1, -2);
  scene.add(eggLight);
  scene.add(eggLight.target);

  createSky();
  createGround();
  createPath();
  createForest();
}

function createSky() {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(100, 40, 24),
    new THREE.MeshBasicMaterial({ color: 0x112b35, side: THREE.BackSide })
  );
  scene.add(sky);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 32, 20),
    new THREE.MeshBasicMaterial({ color: 0xdcecff })
  );
  moon.position.set(-22, 17, -55);
  scene.add(moon);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 32, 20),
    new THREE.MeshBasicMaterial({ color: 0x8eafff, transparent: true, opacity: 0.08 })
  );
  halo.position.copy(moon.position);
  scene.add(halo);
}

function createGround() {
  const geo = new THREE.PlaneGeometry(100, 100, 32, 32);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, Math.sin(x * 0.075) * 0.13 + Math.cos(y * 0.055) * 0.1);
  }
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x203d2a, roughness: 0.96 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function createPath() {
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 76, 1, 18),
    new THREE.MeshStandardMaterial({ color: 0x4e4235, roughness: 1 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.025, -17);
  path.receiveShadow = true;
  scene.add(path);
}

function createTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.31, 3.5, 9),
    new THREE.MeshStandardMaterial({ color: 0x39271d, roughness: 1 })
  );
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  g.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshStandardMaterial({ color: 0x153d29, roughness: 1 })
  );
  crown.position.y = 3.25;
  crown.scale.set(1, 1.35, 0.9);
  crown.castShadow = true;
  g.add(crown);
  return g;
}

function createForest() {
  for (let i = 0; i < 64; i++) {
    const tree = createTree();
    const side = i % 2 ? 1 : -1;
    tree.scale.setScalar(0.72 + Math.random() * 1.05);
    tree.position.set(side * (2.55 + Math.random() * 2.8), 0, 18 - i * 1.1);
    tree.rotation.y = Math.random() * Math.PI;
    scene.add(tree);
  }
}

function createFX() {
  const particleGeo = new THREE.SphereGeometry(0.024, 6, 4);
  for (let i = 0; i < 120; i++) {
    const p = new THREE.Mesh(
      particleGeo,
      new THREE.MeshBasicMaterial({ color: i % 3 ? 0xb9dfca : 0x9fcfff, transparent: true, opacity: 0.35 + Math.random() * 0.4 })
    );
    p.position.set((Math.random() - 0.5) * 15, Math.random() * 7, 12 - Math.random() * 55);
    p.userData.speed = 0.04 + Math.random() * 0.12;
    scene.add(p);
    particles.push(p);
  }
  for (let i = 0; i < 30; i++) {
    const f = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffc86a, transparent: true, opacity: 0.25 })
    );
    f.position.set((Math.random() - 0.5) * 11, 0.5 + Math.random() * 4, -3 - Math.random() * 25);
    f.userData.phase = Math.random() * Math.PI * 2;
    scene.add(f);
    fireflies.push(f);
  }
}

async function loadCharacters() {
  try {
    const loaded = await Promise.all([loader.loadAsync(FILES.mike), loader.loadAsync(FILES.micaela)]);
    mike = prepareCharacter(loaded[0].scene, -1.35, 5.7);
    micaela = prepareCharacter(loaded[1].scene, 1.35, 6.3);
    mikeBones = findBones(mike);
    micaelaBones = findBones(micaela);
    scene.add(mike, micaela);
    addShadow(mike);
    addShadow(micaela);
  } catch (error) {
    console.error("[EGARO] Characters:", error);
  }
}

function prepareCharacter(obj, x, z) {
  obj.position.set(x, 0, z);
  obj.rotation.y = Math.PI;
  obj.traverse(function (n) {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });
  const box = new THREE.Box3().setFromObject(obj);
  if (Number.isFinite(box.min.y)) obj.position.y -= box.min.y;
  return obj;
}

function addShadow(obj) {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.78, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  obj.add(shadow);
}

function findBones(obj) {
  const h = {};
  obj.traverse(function (n) {
    if (!n.isBone) return;
    const s = n.name.toLowerCase();
    if (!h.spine && /spine|chest|torso|columna|pecho/.test(s)) h.spine = n;
    if (!h.head && /head|cabeza|neck|cuello/.test(s)) h.head = n;
    if (!h.armL && /(left|l).*arm|brazo.*izq/.test(s)) h.armL = n;
    if (!h.armR && /(right|r).*arm|brazo.*der/.test(s)) h.armR = n;
    if (!h.legL && /(left|l).*leg|pierna.*izq/.test(s)) h.legL = n;
    if (!h.legR && /(right|r).*leg|pierna.*der/.test(s)) h.legR = n;
  });
  return h;
}

function animateCharacter(obj, bones, t, walking, power) {
  if (!obj) return;
  const walk = Math.sin(t * 7.5) * power;
  if (walking) {
    if (bones.armL) bones.armL.rotation.x = walk * 0.38;
    if (bones.armR) bones.armR.rotation.x = -walk * 0.38;
    if (bones.legL) bones.legL.rotation.x = -walk * 0.48;
    if (bones.legR) bones.legR.rotation.x = walk * 0.48;
    if (bones.spine) bones.spine.rotation.z = Math.sin(t * 3.8) * 0.035;
    obj.position.y = Math.abs(Math.sin(t * 7.5)) * 0.025;
  } else {
    if (bones.spine) bones.spine.rotation.x = Math.sin(t * 2.1) * 0.025 * power;
    if (bones.head) bones.head.rotation.z = Math.sin(t * 2.8) * 0.018 * power;
    obj.position.y = 0;
  }
}

function createEgg() {
  const g = new THREE.Group();
  const tex = new THREE.TextureLoader().load(FILES.eggDesign);
  tex.colorSpace = THREE.SRGBColorSpace;

  const original = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 1.8),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  );
  original.position.z = 0.48;
  g.add(original);

  const volume = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 32, 20),
    new THREE.MeshStandardMaterial({ color: 0xe8ddc4, roughness: 0.5, transparent: true, opacity: 0.7 })
  );
  volume.scale.set(0.82, 1.18, 0.65);
  g.add(volume);

  const glow = new THREE.PointLight(0xffc85c, 0, 9);
  glow.position.set(0, 0.35, 0.8);
  g.add(glow);

  g.position.set(0, 1.05, -2);
  g.userData.glow = glow;
  scene.add(g);
  egg = g;
}

function makeLabel(text, color, size) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.font = "900 52px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000";
  ctx.strokeText(text, 256, 64);
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.3),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
  );
  mesh.scale.setScalar(size / 0.22);
  return mesh;
}

function createRoulette() {
  const g = new THREE.Group();
  const data = HUEVOS.huevo_noob || [];
  const colors = ["#79a86b", "#758097", "#e7b85d"];

  const disk = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 0.24, 64),
    new THREE.MeshStandardMaterial({ color: 0x171d21, metalness: 0.5, roughness: 0.28 })
  );
  disk.rotation.x = Math.PI / 2;
  g.add(disk);

  let accumulated = 0;
  const total = data.reduce(function (sum, item) { return sum + item[1]; }, 0);

  data.forEach(function (item, i) {
    const name = item[0];
    const percentage = item[1];
    const start = accumulated / total * Math.PI * 2;
    accumulated += percentage;
    const end = accumulated / total * Math.PI * 2;
    const angle = (start + end) / 2;

    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 18),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(colors[i]), side: THREE.DoubleSide })
    );
    dot.position.set(Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0.22);
    g.add(dot);

    const label = makeLabel(name === "pollito_noob" ? "POLLITO" : name.toUpperCase(), colors[i], 0.2);
    label.position.set(Math.cos(angle) * 1.25, Math.sin(angle) * 1.25, 0.24);
    label.rotation.z = angle - Math.PI / 2;
    g.add(label);

    const pct = makeLabel(String(percentage) + "%", "#ffffff", 0.15);
    pct.position.set(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0.25);
    g.add(pct);
  });

  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.36, 32),
    new THREE.MeshStandardMaterial({ color: 0xe8c36a, metalness: 0.6, roughness: 0.22 })
  );
  center.rotation.x = Math.PI / 2;
  center.position.z = 0.28;
  g.add(center);

  const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.6, 4),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.35, roughness: 0.3 })
  );
  pointer.position.set(0, 1.98, 0.3);
  pointer.rotation.z = Math.PI;
  g.add(pointer);

  g.position.set(0, 2.0, -2.1);
  g.rotation.x = -0.12;
  g.visible = false;
  scene.add(g);
  roulette = g;
}

function createResultObject(name) {
  if (resultObject) scene.remove(resultObject);

  const file = name === "zombie" ? FILES.zombie : name === "pollito_noob" ? FILES.chick : FILES.noob;
  const texture = new THREE.TextureLoader().load(file);
  texture.colorSpace = THREE.SRGBColorSpace;

  const group = new THREE.Group();

  const front = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.9, 0.46),
    [
      new THREE.MeshStandardMaterial({ color: 0x303a35, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x303a35, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x303a35, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0x303a35, roughness: 0.9 }),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    ]
  );
  group.add(front);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.97, 0.035, 8, 48),
    new THREE.MeshStandardMaterial({ color: name === "zombie" ? 0x82a28d : 0xe8c36a, emissive: 0x30240a, emissiveIntensity: 0.5 })
  );
  group.add(ring);

  group.position.set(0, 1.25, -2.05);
  group.scale.setScalar(name === "pollito_noob" ? 0.68 : 0.86);
  group.visible = false;
  scene.add(group);
  resultObject = group;
}

function createHUD() {
  cinematicHUD = document.createElement("div");
  cinematicHUD.id = "egaroCinematicHUD";
  Object.assign(cinematicHUD.style, { position: "fixed", inset: "0", zIndex: "50000", pointerEvents: "none", fontFamily: "Arial,sans-serif" });

  const top = document.createElement("div");
  const bottom = document.createElement("div");
  [top, bottom].forEach(function (bar) {
    Object.assign(bar.style, { position: "absolute", left: "0", width: "100%", height: "7%", background: "#020507" });
  });
  top.style.top = "0";
  bottom.style.bottom = "0";

  const title = document.createElement("div");
  title.id = "egaroCineTitle";
  Object.assign(title.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "17%",
    color: "#fff",
    fontSize: "clamp(22px,5vw,52px)",
    lineHeight: "1.05",
    fontWeight: "900",
    letterSpacing: ".07em",
    textShadow: "0 5px 22px #000",
    opacity: "0",
    transition: "opacity .3s"
  });

  const sub = document.createElement("div");
  sub.id = "egaroCineSub";
  Object.assign(sub.style, {
    position: "absolute",
    left: "7%",
    right: "7%",
    bottom: "9%",
    maxWidth: "86%",
    color: "#d9e8df",
    fontSize: "clamp(12px,2.5vw,22px)",
    lineHeight: "1.3",
    textShadow: "0 3px 12px #000",
    opacity: "0",
    transition: "opacity .3s"
  });

  const flash = document.createElement("div");
  flash.id = "egaroFlash";
  Object.assign(flash.style, { position: "absolute", inset: "0", background: "#fff", opacity: "0" });

  cinematicHUD.append(top, bottom, title, sub, flash);
  root.appendChild(cinematicHUD);
}

function setText(title, sub) {
  if (!cinematicHUD) return;
  cinematicHUD.querySelector("#egaroCineTitle").textContent = title;
  cinematicHUD.querySelector("#egaroCineSub").textContent = sub;
  cinematicHUD.querySelector("#egaroCineTitle").style.opacity = "1";
  cinematicHUD.querySelector("#egaroCineSub").style.opacity = "1";
}

function hideText() {
  if (!cinematicHUD) return;
  cinematicHUD.querySelector("#egaroCineTitle").style.opacity = "0";
  cinematicHUD.querySelector("#egaroCineSub").style.opacity = "0";
}

function createTitle() {
  // La portada vive en game.js. La cinemática usa un único HUD para evitar
  // títulos/subtítulos duplicados y elementos encimados.
}

function pointCamera(position, target) {
  camera.position.lerp(position, 0.16);
  camera.lookAt(target);
}

function smooth(t) { return t * t * (3 - 2 * t); }

function updatePhase(delta) {
  time += delta;
  while (time >= LENGTH[phase]) {
    time -= LENGTH[phase];
    phase++;
    if (phase >= LENGTH.length) { finish(); return; }
  }

  const p = Math.max(0, Math.min(1, time / LENGTH[phase]));
  const s = smooth(p);



  if (phase === PHASE.TITLE) {
    pointCamera(new THREE.Vector3(0, 4.8, 15), new THREE.Vector3(0, 2, -5));
    setText("EGARO", "El mundo acaba de despertar.");
  }

  if (phase === PHASE.WALK) {
    hideText();
    if (mike) {
      mike.position.x = THREE.MathUtils.lerp(-1.35, -0.82, s);
      mike.position.z = THREE.MathUtils.lerp(5.7, 0.7, s);
      animateCharacter(mike, mikeBones, time, true, 1);
    }
    if (micaela) {
      micaela.position.x = THREE.MathUtils.lerp(1.35, 0.82, s);
      micaela.position.z = THREE.MathUtils.lerp(6.3, 1.25, s);
      animateCharacter(micaela, micaelaBones, time + 0.25, true, 1);
    }
    pointCamera(new THREE.Vector3(4.6, 3.0, 8.5), new THREE.Vector3(0, 1.3, 0));
  }

  if (phase === PHASE.DISCOVER) {
    if (mike) animateCharacter(mike, mikeBones, time, false, 1.5);
    if (micaela) animateCharacter(micaela, micaelaBones, time + 0.3, false, 1.4);
    pointCamera(new THREE.Vector3(2.8, 1.75, 2.8), new THREE.Vector3(0, 1.0, -2.15));
    if (egg) {
      egg.rotation.y = Math.sin(time * 1.5) * .08;
      egg.userData.glow.intensity = 1.5 + Math.sin(time * 3) * .5;
    }
    setText("ALGO CAMBIÓ...", "Mike y Micaela encuentran un huevo extraño.");
  }

  if (phase === PHASE.ROULETTE) {
    if (egg) egg.visible = false;
    if (roulette) {
      roulette.visible = true;
      roulette.rotation.z += delta * (7 + (1 - s) * 9);
      roulette.position.y = 2 + Math.sin(p * Math.PI) * .16;
    }
    pointCamera(new THREE.Vector3(0, 2.35, 4.0), new THREE.Vector3(0, 2.0, -2.1));
    setText("RULETA DE EGARO", "Probabilidades reales del huevo noob.");

    if (p > .84 && !result) result = abrirHuevo("huevo_noob") || "noob";
  }

  if (phase === PHASE.EGG) {
    if (roulette) roulette.visible = false;
    if (egg) {
      egg.visible = true;
      egg.rotation.y += delta * 2.0;
      egg.scale.setScalar(1.08 + Math.sin(time * 14) * .055);
      egg.userData.glow.intensity = 4 + s * 9;
    }
    pointCamera(new THREE.Vector3(0, 1.55, 0.65), new THREE.Vector3(0, 1.05, -2.05));
    setText("EL HUEVO NOOB", "La energía aumenta...");
  }

  if (phase === PHASE.BIRTH) {
    if (egg) {
      egg.visible = true;
      egg.scale.setScalar(Math.max(.08, 1 - s));
      egg.userData.glow.intensity = 10;
    }
    if (p > .2 && !resultObject) createResultObject(result || "noob");
    if (resultObject) {
      resultObject.visible = true;
      resultObject.scale.setScalar((result === "pollito_noob" ? .68 : .86) * (.35 + s * .65));
      resultObject.position.y = 1.25 + Math.sin(time * 9) * .04;
    }
    const flash = cinematicHUD && cinematicHUD.querySelector("#egaroFlash");
    if (flash) flash.style.opacity = String(Math.max(0, .8 - p * 1.1));
    pointCamera(new THREE.Vector3(0, 1.55, 3.0), new THREE.Vector3(0, 1.2, -2));
    setText("¡NACIÓ!", "El resultado fue determinado por las probabilidades del juego.");
  }

  if (phase === PHASE.RESULT) {
    if (egg) egg.visible = false;
    if (resultObject) {
      resultObject.visible = true;
      resultObject.rotation.y += delta * .65;
      resultObject.position.y = 1.25 + Math.sin(time * 4.5) * .08;
    }
    pointCamera(new THREE.Vector3(0, 1.7, 4.1), new THREE.Vector3(0, 1.25, -2));
    const label = result === "zombie" ? "ZOMBIE" : result === "pollito_noob" ? "POLLITO NOOB" : "NOOB";
    setText(label, "Resultado de la apertura: " + label);
  }

  if (phase === PHASE.END) {
    hideText();
    const flash = cinematicHUD && cinematicHUD.querySelector("#egaroFlash");
    if (flash) flash.style.opacity = String(s * .95);
    pointCamera(new THREE.Vector3(0, 3.8, 9 - s * 4), new THREE.Vector3(0, 1.4, -2));
  }
}

function updateFX(delta) {
  particles.forEach(function (p) {
    p.position.y += p.userData.speed * delta * 8;
    p.position.x += Math.sin((time + p.position.z) * .45) * delta * .15;
    if (p.position.y > 7) p.position.y = 0;
  });
  fireflies.forEach(function (f) {
    f.position.y += Math.sin(time * 1.4 + f.userData.phase) * delta * .08;
    f.position.x += Math.cos(time * .7 + f.userData.phase) * delta * .05;
  });
}

function loop() {
  if (!running) return;
  const delta = Math.min(clock.getDelta(), .05);
  updatePhase(delta);
  updateFX(delta);
  renderer.render(scene, camera);
  raf = requestAnimationFrame(loop);
}

function finish() {
  finished = true;
  running = false;
  if (cinematicHUD) {
    cinematicHUD.querySelector("#egaroFlash").style.opacity = "0";
    cinematicHUD.querySelector("#egaroCineTitle").style.opacity = "0";
    cinematicHUD.querySelector("#egaroCineSub").style.opacity = "0";
  }
}

function detener() {
  running = false;
  finished = false;
  cancelAnimationFrame(raf);
  document.getElementById("egaroCinematicHUD")?.remove();
  document.getElementById("egaroMenuTitle")?.remove();

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  scene = null;
  camera = null;
  renderer = null;
  mike = null;
  micaela = null;
  egg = null;
  resultObject = null;
  roulette = null;
  particles = [];
  fireflies = [];
}

function resize() {
  if (!camera || !renderer) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", resize);
