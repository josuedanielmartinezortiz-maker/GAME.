// ============================================================
// PARTE 1 DE 10 — escenaCinematica.js
// ============================================================

import * as THREE from "three";

import {
  GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import {
  abrirHuevo
} from "../probabilidades.js";

let escena = null;
let camara = null;
let renderer = null;
let contenedorJuego = null;
let reloj = null;
let animacionID = null;

let cinematicaActiva = false;
let cinematicaFinalizada = false;

let fase = 0;
let tiempoFase = 0;
let tiempoTotal = 0;

let mike = null;
let micaela = null;

let mikeMixer = null;
let micaelaMixer = null;

let mikeHuesos = {};
let micaelaHuesos = {};

let huevo = null;
let huevoPartes = [];

let polloNoob = null;
let polloZombie = null;
let polloNoobEspecial = null;

let resultadoReal = null;
let resultadoMostrado = false;

let ruletaIndice = 0;
let ruletaTiempo = 0;

let cajaDialogo = null;
let nombreDialogo = null;
let textoDialogo = null;

let dialogoActual = -1;

const gltfLoader = new GLTFLoader();

const CONFIG = {
  velocidadMike: 2.35,
  velocidadMicaela: 2.35,

  zInicial: 8.0,
  zHuevo: 0,

  camaraX: 0,
  camaraY: 3.15,
  camaraZ: 10.8,

  intro: 1.8,
  caminata: 4.6,
  huevo: 2.2,
  apertura: 2.0,
  ruleta: 5.5,
  resultado: 3.5,

  anchoCamino: 2.7
};

const ROTACION_PERSONAJES = Math.PI;

const RESULTADOS_RULETA = [
  "noob",
  "zombie",
  "pollito_noob"
];

export function cinematicaTerminada() {
  return cinematicaFinalizada;
}

export function establecerResultadoCinematica(resultado) {
  if (
    resultado === "noob" ||
    resultado === "zombie" ||
    resultado === "pollito_noob"
  ) {
    resultadoReal = resultado;
  }
}

export function obtenerResultadoCinematica() {
  return resultadoReal;
}
// ============================================================
// PARTE 2 DE 10 — INICIO / ESCENA
// ============================================================

export function iniciarCinematica(game) {

  if (!game) {
    console.error("[GAMERPRO] Falta contenedor del juego.");
    return;
  }

  detenerCinematica();

  contenedorJuego = game;

  cinematicaActiva = true;
  cinematicaFinalizada = false;

  fase = 0;
  tiempoFase = 0;
  tiempoTotal = 0;

  dialogoActual = -1;
  resultadoMostrado = false;

  if (!resultadoReal) {
    resultadoReal = abrirHuevo("huevo_noob") || "noob";
  }

  crearEscena();
  crearDialogos();

  cargarPersonajes()
    .then(() => {

      crearHuevo();
      crearPollos();

      reloj = new THREE.Clock();

      animacionID =
        requestAnimationFrame(actualizarCinematica);

    })
    .catch(error => {

      console.error(
        "[GAMERPRO] Error al cargar la cinemática",
        error
      );

      crearHuevo();
      crearPollos();

      reloj = new THREE.Clock();

      animacionID =
        requestAnimationFrame(actualizarCinematica);
    });
}

export function detenerCinematica() {

  cinematicaActiva = false;

  if (animacionID !== null) {
    cancelAnimationFrame(animacionID);
    animacionID = null;
  }

  if (renderer) {

    if (renderer.domElement &&
        renderer.domElement.parentNode) {

      renderer.domElement.parentNode.removeChild(
        renderer.domElement
      );
    }

    renderer.dispose();
    renderer = null;
  }

  if (cajaDialogo &&
      cajaDialogo.parentNode) {

    cajaDialogo.parentNode.removeChild(
      cajaDialogo
    );
  }

  cajaDialogo = null;
  nombreDialogo = null;
  textoDialogo = null;

  escena = null;
  camara = null;
  reloj = null;

  mike = null;
  micaela = null;

  huevo = null;
  huevoPartes = [];

  polloNoob = null;
  polloZombie = null;
  polloNoobEspecial = null;
}

function crearEscena() {

  escena = new THREE.Scene();

  escena.background =
    new THREE.Color(0x789765);

  escena.fog =
    new THREE.Fog(
      0x789765,
      18,
      40
    );

  camara =
    new THREE.PerspectiveCamera(
      55,
      window.innerWidth /
      window.innerHeight,
      0.1,
      100
    );

  camara.position.set(
    CONFIG.camaraX,
    CONFIG.camaraY,
    CONFIG.camaraZ
  );

  camara.lookAt(
    0,
    1.5,
    0
  );

  renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      1.5
    )
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.shadowMap.enabled = true;

  contenedorJuego.appendChild(
    renderer.domElement
  );

  const luzAmbiente =
    new THREE.HemisphereLight(
      0xe8f5d8,
      0x30472b,
      2.6
    );

  escena.add(luzAmbiente);

  const sol =
    new THREE.DirectionalLight(
      0xfff1c7,
      3.2
    );

  sol.position.set(
    -7,
    12,
    8
  );

  sol.castShadow = true;

  escena.add(sol);

  crearSuelo();
  crearCamino();
  crearBosque();

  window.addEventListener(
    "resize",
    redimensionarCinematica
  );
}

function crearSuelo() {

  const suelo =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        70,
        70
      ),
      new THREE.MeshStandardMaterial({
        color: 0x507941,
        roughness: 1
      })
    );

  suelo.rotation.x =
    -Math.PI / 2;

  suelo.receiveShadow = true;

  escena.add(suelo);
}

function redimensionarCinematica() {

  if (!renderer || !camara) {
    return;
  }

  camara.aspect =
    window.innerWidth /
    window.innerHeight;

  camara.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}
// ============================================================
// PARTE 3 DE 10 — CAMINO Y BOSQUE
// ============================================================

function crearCamino() {

  const camino =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        CONFIG.anchoCamino,
        55
      ),
      new THREE.MeshStandardMaterial({
        color: 0x9a7950,
        roughness: 1
      })
    );

  camino.rotation.x =
    -Math.PI / 2;

  camino.position.set(
    0,
    0.015,
    -8
  );

  camino.receiveShadow = true;

  escena.add(camino);

  const piedraMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x75644e,
      roughness: 1
    });

  for (
    let i = 0;
    i < 55;
    i++
  ) {

    const piedra =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.05 +
          Math.random() * 0.09,
          7,
          5
        ),
        piedraMaterial
      );

    piedra.scale.y = 0.22;

    piedra.position.set(
      (Math.random() - 0.5) *
      2.25,

      0.045,

      12 -
      i * 0.82
    );

    escena.add(piedra);
  }
}

function crearBosque() {

  const posiciones = [];

  for (
    let i = 0;
    i < 50;
    i++
  ) {

    const lado =
      i % 2 === 0
        ? -1
        : 1;

    const z =
      10 -
      Math.floor(i / 2) *
      0.9;

    const distancia =
      2.0 +
      Math.random() *
      0.65;

    posiciones.push({
      x: lado * distancia,
      z,
      escala:
        0.9 +
        Math.random() * 0.5
    });
  }

  for (const datos of posiciones) {

    const arbol =
      crearPino(
        datos.escala
      );

    arbol.position.set(
      datos.x,
      0,
      datos.z
    );

    escena.add(arbol);

    const arbusto =
      crearArbusto(
        0.75 +
        Math.random() * 0.55
      );

    arbusto.position.set(
      datos.x +
      (Math.random() - 0.5) *
      0.7,

      0,

      datos.z +
      0.45
    );

    escena.add(arbusto);
  }

  for (
    let i = 0;
    i < 34;
    i++
  ) {

    const lado =
      i % 2 === 0
        ? -1
        : 1;

    const arbusto =
      crearArbusto(
        0.9 +
        Math.random() * 0.7
      );

    arbusto.position.set(
      lado *
      (
        3.5 +
        Math.random() *
        1.3
      ),

      0,

      9 -
      i * 1.0
    );

    escena.add(arbusto);
  }

  // Fondo vegetal sin cerrar la salida hacia la granja.
  for (
    let i = 0;
    i < 20;
    i++
  ) {

    const arbol =
      crearPino(
        0.8 +
        Math.random() * 0.45
      );

    arbol.position.set(
      -8 +
      i * 0.85,

      0,

      -18 +
      Math.random() *
      1.5
    );

    escena.add(arbol);
  }
}

function crearPino(
  escala = 1
) {

  const grupo =
    new THREE.Group();

  const troncoMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x68472d,
      roughness: 1
    });

  const hojasMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x315f35,
      roughness: 1
    });

  const tronco =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.20,
        0.28,
        2.2,
        8
      ),
      troncoMaterial
    );

  tronco.position.y = 1.1;
  tronco.castShadow = true;

  grupo.add(tronco);

  const niveles = [
    [1.25, 1.8],
    [1.05, 2.7],
    [0.78, 3.55]
  ];

  for (
    const [radio, altura]
    of niveles
  ) {

    const copa =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          radio,
          1.7,
          8
        ),
        hojasMaterial
      );

    copa.position.y = altura;

    copa.castShadow = true;

    grupo.add(copa);
  }

  grupo.scale.setScalar(
    escala
  );

  return grupo;
}

function crearArbusto(
  escala = 1
) {

  const grupo =
    new THREE.Group();

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x396a38,
      roughness: 1
    });

  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const bola =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.35 +
          Math.random() *
          0.22,

          8,
          6
        ),
        material
      );

    bola.position.set(
      (Math.random() - 0.5) *
      1.15,

      0.3 +
      Math.random() *
      0.28,

      (Math.random() - 0.5) *
      0.75
    );

    bola.castShadow = true;

    grupo.add(bola);
  }

  grupo.scale.setScalar(
    escala
  );

  return grupo;
}
// ============================================================
// PARTE 4 DE 10 — HUEVO NOOB 3D
// ============================================================

function crearHuevo() {

  huevo =
    new THREE.Group();

  huevo.position.set(
    0,
    1.0,
    CONFIG.zHuevo
  );

  escena.add(huevo);

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xffd83d,
      roughness: 0.42,
      metalness: 0.02
    });

  const materialBrillo =
    new THREE.MeshStandardMaterial({
      color: 0xffef8a,
      roughness: 0.25,
      emissive: 0x8b6200,
      emissiveIntensity: 0.08
    });

  const cuerpo =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.0,
        24,
        18
      ),
      material
    );

  cuerpo.scale.set(
    0.82,
    1.05,
    0.82
  );

  cuerpo.castShadow = true;

  huevo.add(cuerpo);

  huevoPartes.push(cuerpo);

  const parteSuperior =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.68,
        20,
        14
      ),
      materialBrillo
    );

  parteSuperior.scale.set(
    0.82,
    0.42,
    0.82
  );

  parteSuperior.position.y =
    0.62;

  parteSuperior.castShadow = true;

  huevo.add(
    parteSuperior
  );

  huevoPartes.push(
    parteSuperior
  );

  const aro =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.74,
        0.045,
        8,
        32
      ),
      materialBrillo
    );

  aro.rotation.x =
    Math.PI / 2;

  aro.position.y =
    0.05;

  huevo.add(aro);

  huevoPartes.push(aro);

  const brillo =
    new THREE.PointLight(
      0xffe77a,
      2.0,
      5
    );

  brillo.position.set(
    0,
    0.5,
    0.5
  );

  huevo.add(brillo);

  huevo.userData.baseY = 1.0;
}

function animarHuevo(
  delta,
  activo
) {

  if (!huevo) {
    return;
  }

  if (!activo) {
    return;
  }

  huevo.rotation.y +=
    delta * 0.8;

  huevo.position.y =
    huevo.userData.baseY +
    Math.sin(
      tiempoTotal * 4
    ) *
    0.045;
}

function romperHuevo() {

  if (!huevo) {
    return;
  }

  const centro =
    huevo.position.clone();

  for (
    let i = 0;
    i < 6;
    i++
  ) {

    const pieza =
      new THREE.Mesh(
        new THREE.TetrahedronGeometry(
          0.22,
          0
        ),
        new THREE.MeshStandardMaterial({
          color:
            i % 2 === 0
              ? 0xffd83d
              : 0xffec75,
          roughness: 0.45
        })
      );

    const angulo =
      (Math.PI * 2 / 6) *
      i;

    pieza.position.copy(
      centro
    );

    pieza.position.x +=
      Math.cos(angulo) *
      0.28;

    pieza.position.y +=
      Math.sin(angulo) *
      0.20;

    pieza.position.z +=
      Math.sin(angulo) *
      0.18;

    pieza.userData.velocidad =
      new THREE.Vector3(
        Math.cos(angulo) *
        0.65,

        0.45 +
        Math.random() *
        0.35,

        Math.sin(angulo) *
        0.55
      );

    escena.add(pieza);

    huevoPartes.push(
      pieza
    );
  }

  huevo.visible = false;
      }
// ============================================================
// PARTE 5 DE 10 — POLLOS 3D
// ============================================================

function crearPollos() {

  polloNoob =
    crearPolloNoob();

  polloZombie =
    crearPolloZombie();

  polloNoobEspecial =
    crearPollitoNoob();

  polloNoob.position.set(
    -2.2,
    0,
    -1.5
  );

  polloZombie.position.set(
    0,
    0,
    -1.5
  );

  polloNoobEspecial.position.set(
    2.2,
    0,
    -1.5
  );

  polloNoob.visible = false;
  polloZombie.visible = false;
  polloNoobEspecial.visible = false;

  escena.add(
    polloNoob,
    polloZombie,
    polloNoobEspecial
  );
}

function crearPolloBase(
  color,
  conParches = false,
  escala = 1
) {

  const grupo =
    new THREE.Group();

  const cuerpoMaterial =
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55
    });

  const picoMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xff8b18,
      roughness: 0.45
    });

  const pataMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf28a19,
      roughness: 0.55
    });

  const gorraMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffc928,
      roughness: 0.45
    });

  const letraMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x273b75,
      roughness: 0.4
    });

  const cuerpo =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.72,
        24,
        18
      ),
      cuerpoMaterial
    );

  cuerpo.scale.set(
    1.0,
    1.12,
    0.92
  );

  cuerpo.position.y =
    1.15;

  cuerpo.castShadow = true;

  grupo.add(cuerpo);

  const cabeza =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.63,
        24,
        18
      ),
      cuerpoMaterial
    );

  cabeza.position.set(
    0,
    1.95,
    0.02
  );

  cabeza.scale.set(
    1.0,
    0.95,
    0.92
  );

  cabeza.castShadow = true;

  grupo.add(cabeza);

  crearAlas(
    grupo,
    cuerpoMaterial
  );

  crearCola(
    grupo,
    cuerpoMaterial
  );

  const pico =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        0.16,
        0.36,
        4
      ),
      picoMaterial
    );

  pico.rotation.x =
    Math.PI / 2;

  pico.position.set(
    0,
    1.9,
    0.61
  );

  grupo.add(pico);

  crearOjos(
    grupo,
    color === 0xffdc45
  );

  crearGorra(
    grupo,
    gorraMaterial,
    letraMaterial
  );

  crearPatas(
    grupo,
    pataMaterial
  );

  if (conParches) {
    crearParches(
      grupo
    );
  }

  grupo.scale.setScalar(
    escala
  );

  return grupo;
}

function crearAlas(
  grupo,
  material
) {

  const alaIzq =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.43,
        16,
        12
      ),
      material
    );

  alaIzq.scale.set(
    0.55,
    1.0,
    0.55
  );

  alaIzq.position.set(
    -0.66,
    1.25,
    0.02
  );

  alaIzq.rotation.z =
    0.25;

  grupo.add(alaIzq);

  const alaDer =
    alaIzq.clone();

  alaDer.position.x =
    0.66;

  alaDer.rotation.z =
    -0.25;

  grupo.add(alaDer);
}

function crearCola(
  grupo,
  material
) {

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    const pluma =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.28,
          14,
          10
        ),
        material
      );

    pluma.scale.set(
      0.55,
      1.1,
      0.55
    );

    pluma.position.set(
      (i - 1.5) *
      0.22,

      1.25,

      -0.7
    );

    pluma.rotation.x =
      -0.25;

    grupo.add(pluma);
  }
            }
// ============================================================
// PARTE 6 DE 10 — DETALLES DE POLLOS
// ============================================================

function crearOjos(
  grupo,
  grandes = false
) {

  const ojoMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.3
    });

  const brilloMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

  const tamano =
    grandes
      ? 0.14
      : 0.10;

  for (
    const lado of [-1, 1]
  ) {

    const ojo =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          tamano,
          12,
          10
        ),
        ojoMaterial
      );

    ojo.position.set(
      lado * 0.22,
      2.02,
      0.55
    );

    grupo.add(ojo);

    if (grandes) {

      const brillo =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.045,
            8,
            8
          ),
          brilloMaterial
        );

      brillo.position.set(
        lado * 0.19,
        2.08,
        0.64
      );

      grupo.add(brillo);
    }
  }
}

function crearGorra(
  grupo,
  material,
  letraMaterial
) {

  const gorra =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.67,
        20,
        12
      ),
      material
    );

  gorra.scale.set(
    1.0,
    0.45,
    0.9
  );

  gorra.position.set(
    0,
    2.42,
    0
  );

  grupo.add(gorra);

  const visera =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.55,
        18,
        10
      ),
      material
    );

  visera.scale.set(
    1.25,
    0.16,
    0.75
  );

  visera.position.set(
    0,
    2.28,
    0.43
  );

  grupo.add(visera);

  const letra =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.20,
        0.26,
        0.035
      ),
      letraMaterial
    );

  letra.position.set(
    0,
    2.52,
    0.58
  );

  letra.rotation.z =
    -0.08;

  grupo.add(letra);
}

function crearPatas(
  grupo,
  material
) {

  for (
    const lado of [-1, 1]
  ) {

    const pata =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.065,
          0.08,
          0.45,
          8
        ),
        material
      );

    pata.position.set(
      lado * 0.24,
      0.42,
      0.02
    );

    grupo.add(pata);

    const pie =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.15,
          12,
          8
        ),
        material
      );

    pie.scale.set(
      1.5,
      0.45,
      1.2
    );

    pie.position.set(
      lado * 0.24,
      0.18,
      0.16
    );

    grupo.add(pie);
  }
}

function crearParches(
  grupo
) {

  const parcheMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf2a8b5,
      roughness: 0.65
    });

  const posiciones = [
    [-0.46, 1.35, 0.54, 0.20],
    [0.38, 1.15, 0.55, 0.24],
    [-0.12, 0.85, 0.63, 0.22],
    [0.48, 1.65, 0.42, 0.13]
  ];

  for (
    const [
      x,
      y,
      z,
      escala
    ] of posiciones
  ) {

    const parche =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          escala,
          14,
          10
        ),
        parcheMaterial
      );

    parche.scale.z =
      0.18;

    parche.position.set(
      x,
      y,
      z
    );

    grupo.add(parche);

    crearCosturas(
      grupo,
      x,
      y,
      z + 0.04,
      escala
    );
  }
}

function crearCosturas(
  grupo,
  x,
  y,
  z,
  escala
) {

  const hiloMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xa94f70
    });

  for (
    let i = -2;
    i <= 2;
    i++
  ) {

    const hilo =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.025,
          0.13,
          0.025
        ),
        hiloMaterial
      );

    hilo.position.set(
      x +
      i *
      escala *
      0.35,

      y,

      z
    );

    hilo.rotation.z =
      0.7;

    grupo.add(hilo);
  }
}

function crearPolloNoob() {

  return crearPolloBase(
    0xffdc45,
    false,
    1
  );
}

function crearPolloZombie() {

  return crearPolloBase(
    0xb8d878,
    true,
    1
  );
}

function crearPollitoNoob() {

  const pollo =
    crearPolloBase(
      0xffdc45,
      false,
      0.65
    );

  return pollo;
      }
// ============================================================
// PARTE 7 DE 10 — PERSONAJES
// ============================================================

async function cargarPersonajes() {

  mike =
    await cargarGLB(
      "./3D/mike.glb"
    );

  micaela =
    await cargarGLB(
      "./3D/micaela.glb"
    );

  if (mike) {

    mike.position.set(
      -0.85,
      0,
      CONFIG.zInicial
    );

    mike.rotation.y =
      ROTACION_PERSONAJES;

    escena.add(mike);

    ajustarAlSuelo(
      mike
    );

    mikeHuesos =
      buscarHuesos(
        mike
      );

    iniciarAnimacionGLB(
      mike,
      "mike"
    );
  }

  if (micaela) {

    micaela.position.set(
      0.85,
      0,
      CONFIG.zInicial +
      0.35
    );

    micaela.rotation.y =
      ROTACION_PERSONAJES;

    escena.add(
      micaela
    );

    ajustarAlSuelo(
      micaela
    );

    micaelaHuesos =
      buscarHuesos(
        micaela
      );

    iniciarAnimacionGLB(
      micaela,
      "micaela"
    );
  }
}

async function cargarGLB(
  ruta
) {

  try {

    const gltf =
      await gltfLoader.loadAsync(
        ruta
      );

    const objeto =
      gltf.scene;

    objeto.userData.animations =
      gltf.animations || [];

    objeto.traverse(
      hijo => {

        if (
          hijo.isMesh
        ) {

          hijo.castShadow =
            true;

          hijo.receiveShadow =
            true;
        }
      }
    );

    return objeto;

  } catch (error) {

    console.error(
      "[GAMERPRO] Error GLB:",
      ruta,
      error
    );

    return null;
  }
}

function ajustarAlSuelo(
  objeto
) {

  const caja =
    new THREE.Box3()
      .setFromObject(
        objeto
      );

  if (
    Number.isFinite(
      caja.min.y
    )
  ) {

    objeto.position.y -=
      caja.min.y;
  }
}

function iniciarAnimacionGLB(
  personaje,
  nombre
) {

  const clips =
    personaje.userData.animations;

  if (
    !clips ||
    clips.length === 0
  ) {

    return;
  }

  const mixer =
    new THREE.AnimationMixer(
      personaje
    );

  const clip =
    clips.find(
      c =>
        /walk|caminar/i
          .test(c.name)
    ) ||
    clips[0];

  const accion =
    mixer.clipAction(
      clip
    );

  accion.reset();

  accion.setLoop(
    THREE.LoopRepeat
  );

  accion.timeScale =
    1.35;

  accion.play();

  personaje.userData.mixer =
    mixer;

  personaje.userData.accion =
    accion;

  if (
    nombre === "mike"
  ) {

    mikeMixer =
      mixer;

  } else {

    micaelaMixer =
      mixer;
  }
}

function buscarHuesos(
  personaje
) {

  const huesos = {};

  personaje.traverse(
    obj => {

      if (!obj.isBone) {
        return;
      }

      const n =
        obj.name.toLowerCase();

      if (
        /hip|pelvis|cadera/
          .test(n)
      ) {
        huesos.cadera =
          obj;
      }

      if (
        /spine|chest|torso|columna|pecho/
          .test(n)
      ) {
        huesos.torso =
          obj;
      }

      if (
        /head|cabeza/
          .test(n)
      ) {
        huesos.cabeza =
          obj;
      }

      if (
        /left.*upper.*arm|upper.*arm.*left|brazo.*izq/
          .test(n)
      ) {
        huesos.brazoIzq =
          obj;
      }

      if (
        /right.*upper.*arm|upper.*arm.*right|brazo.*der/
          .test(n)
      ) {
        huesos.brazoDer =
          obj;
      }

      if (
        /left.*thigh|thigh.*left|left.*leg|pierna.*izq/
          .test(n)
      ) {
        huesos.piernaIzq =
          obj;
      }

      if (
        /right.*thigh|thigh.*right|right.*leg|pierna.*der/
          .test(n)
      ) {
        huesos.piernaDer =
          obj;
      }
    }
  );

  return huesos;
        }
// ============================================================
// PARTE 8 DE 10 — DIÁLOGOS
// ============================================================

function crearDialogos() {

  cajaDialogo =
    document.createElement(
      "div"
    );

  cajaDialogo.style.position =
    "fixed";

  cajaDialogo.style.left =
    "5%";

  cajaDialogo.style.right =
    "5%";

  cajaDialogo.style.bottom =
    "5%";

  cajaDialogo.style.padding =
    "18px 22px";

  cajaDialogo.style.background =
    "rgba(0,0,0,0.78)";

  cajaDialogo.style.border =
    "3px solid rgba(255,255,255,0.9)";

  cajaDialogo.style.borderRadius =
    "18px";

  cajaDialogo.style.color =
    "white";

  cajaDialogo.style.zIndex =
    "100000";

  cajaDialogo.style.fontFamily =
    "Arial,sans-serif";

  cajaDialogo.style.boxSizing =
    "border-box";

  cajaDialogo.style.textAlign =
    "left";

  nombreDialogo =
    document.createElement(
      "div"
    );

  nombreDialogo.style.fontSize =
    "21px";

  nombreDialogo.style.fontWeight =
    "bold";

  nombreDialogo.style.marginBottom =
    "7px";

  textoDialogo =
    document.createElement(
      "div"
    );

  textoDialogo.style.fontSize =
    "18px";

  textoDialogo.style.lineHeight =
    "1.35";

  cajaDialogo.appendChild(
    nombreDialogo
  );

  cajaDialogo.appendChild(
    textoDialogo
  );

  contenedorJuego.appendChild(
    cajaDialogo
  );

  mostrarDialogo(
    0
  );
}

function mostrarDialogo(
  indice
) {

  const dialogos = [

    {
      nombre: "Micaela",
      texto:
        "Mike... ¿viste eso?"
    },

    {
      nombre: "Mike",
      texto:
        "¿Qué es eso que está a lo lejos?"
    },

    {
      nombre: "Micaela",
      texto:
        "¡Parece un huevo!"
    },

    {
      nombre: "Mike",
      texto:
        "Vamos a ver qué hay dentro."
    }

  ];

  if (
    indice < 0 ||
    indice >= dialogos.length
  ) {

    cajaDialogo.style.display =
      "none";

    return;
  }

  dialogoActual =
    indice;

  const dialogo =
    dialogos[indice];

  nombreDialogo.textContent =
    dialogo.nombre;

  textoDialogo.textContent =
    dialogo.texto;

  cajaDialogo.style.display =
    "block";
}

function actualizarDialogo(
  tiempo
) {

  if (
    tiempo < 1.8
  ) {

    mostrarDialogo(
      0
    );

  } else if (
    tiempo < 3.0
  ) {

    mostrarDialogo(
      1
    );

  } else if (
    tiempo < 4.3
  ) {

    mostrarDialogo(
      2
    );

  } else if (
    tiempo < 5.5
  ) {

    mostrarDialogo(
      3
    );

  } else {

    cajaDialogo.style.display =
      "none";
  }
      }
// ============================================================
// PARTE 9 DE 10 — RULETA
// ============================================================

function mostrarPollosRuleta(
  indice
) {

  if (!polloNoob ||
      !polloZombie ||
      !polloNoobEspecial) {

    return;
  }

  polloNoob.visible =
    indice === 0;

  polloZombie.visible =
    indice === 1;

  polloNoobEspecial.visible =
    indice === 2;

  const polloActual =
    indice === 0
      ? polloNoob
      : indice === 1
        ? polloZombie
        : polloNoobEspecial;

  if (polloActual) {

    polloActual.scale.setScalar(
      indice === 2
        ? 0.65
        : 1
    );
  }
}

function actualizarRuleta(
  delta
) {

  ruletaTiempo +=
    delta;

  const duracion =
    CONFIG.ruleta;

  const progreso =
    Math.min(
      ruletaTiempo /
      duracion,
      1
    );

  const velocidad =
    THREE.MathUtils.lerp(
      16,
      1.4,
      progreso
    );

  ruletaIndice +=
    delta *
    velocidad;

  const indice =
    Math.floor(
      ruletaIndice
    ) %
    RESULTADOS_RULETA.length;

  mostrarPollosRuleta(
    indice
  );

  if (
    progreso >= 1
  ) {

    const resultadoIndice =
      RESULTADOS_RULETA.indexOf(
        resultadoReal
      );

    ruletaIndice =
      resultadoIndice;

    mostrarPollosRuleta(
      resultadoIndice
    );

    resultadoMostrado =
      true;
  }
}

function mostrarResultadoFinal() {

  if (!resultadoReal) {
    return;
  }

  const indice =
    RESULTADOS_RULETA.indexOf(
      resultadoReal
    );

  mostrarPollosRuleta(
    indice
  );

  const pollo =
    resultadoReal === "noob"
      ? polloNoob
      : resultadoReal === "zombie"
        ? polloZombie
        : polloNoobEspecial;

  if (pollo) {

    pollo.visible = true;

    pollo.position.set(
      0,
      0,
      -1.25
    );

    pollo.scale.setScalar(
      resultadoReal ===
      "pollito_noob"
        ? 0.72
        : 1.0
    );
  }

  if (polloNoob &&
      resultadoReal !== "noob") {

    polloNoob.visible =
      false;
  }

  if (polloZombie &&
      resultadoReal !== "zombie") {

    polloZombie.visible =
      false;
  }

  if (
    polloNoobEspecial &&
    resultadoReal !==
    "pollito_noob"
  ) {

    polloNoobEspecial.visible =
      false;
  }
}

function actualizarPiezasHuevo(
  delta
) {

  for (
    const pieza
    of huevoPartes
  ) {

    if (
      !pieza.userData.velocidad
    ) {
      continue;
    }

    pieza.position.addScaledVector(
      pieza.userData.velocidad,
      delta
    );

    pieza.userData.velocidad.y -=
      1.5 *
      delta;

    pieza.rotation.x +=
      delta * 3;

    pieza.rotation.z +=
      delta * 2;

    if (
      pieza.position.y < 0.15
    ) {

      pieza.position.y =
        0.15;

      pieza.userData.velocidad.y *=
        -0.35;
    }
  }
        }
// ============================================================
// PARTE 10 DE 10 — BUCLE COMPLETO
// ============================================================

function actualizarCaminata(
  personaje,
  velocidad,
  delta
) {

  if (!personaje) {
    return;
  }

  if (
    fase < 1 ||
    fase > 1
  ) {
    return;
  }

  personaje.position.z -=
    velocidad *
    delta;

  const accion =
    personaje.userData.accion;

  if (accion) {

    accion.timeScale =
      1.45;
  }
}

function actualizarCinematica() {

  if (
    !cinematicaActiva ||
    !renderer ||
    !escena ||
    !camara
  ) {
    return;
  }

  const delta =
    Math.min(
      reloj.getDelta(),
      0.05
    );

  tiempoTotal +=
    delta;

  tiempoFase +=
    delta;

  if (
    mikeMixer
  ) {
    mikeMixer.update(
      delta
    );
  }

  if (
    micaelaMixer
  ) {
    micaelaMixer.update(
      delta
    );
  }

  // ----------------------------------------------------------
  // FASE 0 — INTRO
  // ----------------------------------------------------------

  if (
    fase === 0
  ) {

    actualizarDialogo(
      tiempoFase
    );

    if (
      tiempoFase >=
      CONFIG.intro
    ) {

      fase = 1;
      tiempoFase = 0;
    }
  }

  // ----------------------------------------------------------
  // FASE 1 — CAMINATA
  // ----------------------------------------------------------

  else if (
    fase === 1
  ) {

    actualizarDialogo(
      tiempoTotal
    );

    actualizarCaminata(
      mike,
      CONFIG.velocidadMike,
      delta
    );

    actualizarCaminata(
      micaela,
      CONFIG.velocidadMicaela,
      delta
    );

    if (mike) {
      mike.position.x = -0.85;
    }

    if (micaela) {
      micaela.position.x = 0.85;
    }

    if (
      tiempoFase >=
      CONFIG.caminata
    ) {

      fase = 2;
      tiempoFase = 0;
    }
  }

  // ----------------------------------------------------------
  // FASE 2 — HUEVO
  // ----------------------------------------------------------

  else if (
    fase === 2
  ) {

    actualizarDialogo(
      tiempoTotal
    );

    animarHuevo(
      delta,
      true
    );

    if (
      tiempoFase >=
      CONFIG.huevo
    ) {

      fase = 3;
      tiempoFase = 0;

      romperHuevo();
    }
  }

  // ----------------------------------------------------------
  // FASE 3 — APERTURA
  // ----------------------------------------------------------

  else if (
    fase === 3
  ) {

    actualizarPiezasHuevo(
      delta
    );

    if (
      tiempoFase >=
      CONFIG.apertura
    ) {

      fase = 4;
      tiempoFase = 0;

      ruletaTiempo = 0;
      ruletaIndice = 0;

      if (huevo) {
        huevo.visible =
          false;
      }
    }
  }

  // ----------------------------------------------------------
  // FASE 4 — RULETA
  // ----------------------------------------------------------

  else if (
    fase === 4
  ) {

    actualizarRuleta(
      delta
    );

    if (
      tiempoFase >=
      CONFIG.ruleta
    ) {

      fase = 5;
      tiempoFase = 0;

      mostrarResultadoFinal();
    }
  }

  // ----------------------------------------------------------
  // FASE 5 — RESULTADO
  // ----------------------------------------------------------

  else if (
    fase === 5
  ) {

    mostrarResultadoFinal();

    if (
      tiempoFase >=
      CONFIG.resultado
    ) {

      fase = 6;
      tiempoFase = 0;
    }
  }

  // ----------------------------------------------------------
  // CÁMARA
  // ----------------------------------------------------------

  if (camara) {

    const objetivoZ =
      fase <= 1
        ? 1.8
        : -0.1;

    camara.position.x =
      THREE.MathUtils.lerp(
        camara.position.x,
        0,
        0.05
      );

    camara.position.y =
      THREE.MathUtils.lerp(
        camara.position.y,
        3.15,
        0.05
      );

    camara.position.z =
      THREE.MathUtils.lerp(
        camara.position.z,
        10.8,
        0.05
      );

    camara.lookAt(
      0,
      1.35,
      objetivoZ
    );
  }

  renderer.render(
    escena,
    camara
  );

  if (
    fase >= 6
  ) {

    cinematicaFinalizada =
      true;

    cinematicaActiva =
      false;

    animacionID =
      null;

    return;
  }

  animacionID =
    requestAnimationFrame(
      actualizarCinematica
    );
}
```0
