// ============================================================
// GAMERPRO GAME
// escenaCinematica.js
// CINEMÁTICA HUEVO NOOB
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import {
    abrirHuevo
} from "../probabilidades.js";

// ============================================================
// ESTADO PRINCIPAL
// ============================================================

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

// ============================================================
// PERSONAJES
// ============================================================

let mike = null;
let micaela = null;

let mikeMixer = null;
let micaelaMixer = null;

let mikeHuesos = {};
let micaelaHuesos = {};

// ============================================================
// HUEVO
// ============================================================

let huevo = null;
let huevoBrillo = null;
let sombraHuevo = null;

// ============================================================
// POLLOS
// ============================================================

let polloNoob = null;
let polloZombie = null;
let polloNoobEspecial = null;

let resultadoReal = null;
let resultadoMostrado = false;

// ============================================================
// RULETA
// ============================================================

let ruletaIndice = 0;
let ruletaVueltas = 0;
let ruletaTerminada = false;
let ruletaUltimoCambio = 0;
let ruletaIntervalo = 0.10;

// ============================================================
// DIÁLOGO
// ============================================================

let cajaDialogo = null;
let nombreDialogo = null;
let textoDialogo = null;
let dialogoActual = -1;

// ============================================================
// CARGADORES
// ============================================================

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// ============================================================
// ARCHIVOS
// ============================================================

const ARCHIVOS = {
    mike: "./3D/mike.glb",
    micaela: "./3D/micaela.glb",
    huevo: "./3D/huevo%20noob.png"
};

// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {
    velocidadMike: 1.15,
    velocidadMicaela: 1.15,

    inicioZ: 7.5,
    llegadaZ: 0.8,

    alturaMike: 0,
    alturaMicaela: 0,

    alturaCamara: 1.75,
    distanciaCamara: 5.2,

    duracionIntro: 2.0,
    duracionCaminata: 8.5,
    duracionHuevo: 3.2,
    duracionApertura: 2.0,
    duracionRuleta: 6.5,
    duracionResultado: 4.0
};

// ============================================================
// ORIENTACIÓN DE PERSONAJES
// ============================================================

const ROTACION_PERSONAJES = Math.PI;

// ============================================================
// EXPORTS
// ============================================================

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
// CREAR ESCENA
// ============================================================

function crearEscena() {

    escena = new THREE.Scene();

    escena.background =
        new THREE.Color(0x8eaa78);

    escena.fog =
        new THREE.Fog(
            0x8eaa78,
            14,
            42
        );

    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    camara =
        new THREE.PerspectiveCamera(
            58,
            window.innerWidth /
            window.innerHeight,
            0.1,
            100
        );

    camara.position.set(
        0,
        CONFIG.alturaCamara,
        CONFIG.distanciaCamara
    );

    // --------------------------------------------------------
    // RENDERER
    // --------------------------------------------------------

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            1.35
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

    // --------------------------------------------------------
    // LUZ
    // --------------------------------------------------------

    const luzAmbiente =
        new THREE.HemisphereLight(
            0xdff5ff,
            0x304025,
            2.2
        );

    escena.add(luzAmbiente);

    const luzSol =
        new THREE.DirectionalLight(
            0xffffff,
            2.8
        );

    luzSol.position.set(
        5,
        12,
        5
    );

    luzSol.castShadow = true;

    escena.add(luzSol);

    // --------------------------------------------------------
    // SUELO
    // --------------------------------------------------------

    const suelo =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                80,
                80
            ),
            new THREE.MeshStandardMaterial({
                color: 0x527545,
                roughness: 1
            })
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow = true;

    escena.add(suelo);

    // --------------------------------------------------------
    // CAMINO
    // --------------------------------------------------------

    crearCamino();

    // --------------------------------------------------------
    // PINOS
    // --------------------------------------------------------

    crearBosqueCerrado();

    window.addEventListener(
        "resize",
        redimensionarCinematica
    );
}

// ============================================================
// CAMINO
// ============================================================

function crearCamino() {

    const camino =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                4.2,
                55
            ),
            new THREE.MeshStandardMaterial({
                color: 0x8b704d,
                roughness: 1
            })
        );

    camino.rotation.x =
        -Math.PI / 2;

    camino.position.set(
        0,
        0.012,
        -18
    );

    camino.receiveShadow = true;

    escena.add(camino);
}
// ============================================================
// PINOS
// ============================================================

function crearPino(
    x,
    z,
    escala,
    detallado = true
) {

    const grupo =
        new THREE.Group();

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.18,
                0.28,
                2.4,
                detallado ? 8 : 6
            ),
            new THREE.MeshStandardMaterial({
                color: 0x54351f,
                roughness: 1
            })
        );

    tronco.position.y = 1.2;
    tronco.castShadow = true;

    grupo.add(tronco);

    const materialPino =
        new THREE.MeshStandardMaterial({
            color: 0x24552f,
            roughness: 0.95
        });

    if (detallado) {

        const copa1 =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    1.15,
                    2.4,
                    9
                ),
                materialPino
            );

        copa1.position.y = 2.6;
        copa1.castShadow = true;

        const copa2 =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.92,
                    2.0,
                    9
                ),
                materialPino
            );

        copa2.position.y = 3.7;
        copa2.castShadow = true;

        const copa3 =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.65,
                    1.5,
                    8
                ),
                materialPino
            );

        copa3.position.y = 4.55;
        copa3.castShadow = true;

        grupo.add(copa1);
        grupo.add(copa2);
        grupo.add(copa3);

    } else {

        const copa =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.9,
                    2.8,
                    7
                ),
                materialPino
            );

        copa.position.y = 2.9;
        copa.castShadow = true;

        grupo.add(copa);
    }

    grupo.position.set(
        x,
        0,
        z
    );

    grupo.scale.setScalar(
        escala
    );

    escena.add(grupo);
}

// ============================================================
// BOSQUE CERRADO
// ============================================================

function crearBosqueCerrado() {

    // Pinos grandes junto al camino
    for (
        let z = 4;
        z > -28;
        z -= 2.6
    ) {

        const variacion =
            0.85 +
            Math.random() * 0.35;

        crearPino(
            -3.0 -
            Math.random() * 0.7,
            z,
            variacion,
            true
        );

        crearPino(
            3.0 +
            Math.random() * 0.7,
            z - 0.8,
            variacion,
            true
        );
    }

    // Fondo simplificado
    for (
        let i = 0;
        i < 26;
        i++
    ) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        crearPino(
            lado *
            (5.2 +
            Math.random() * 3),
            -5 -
            Math.random() * 28,
            0.65 +
            Math.random() * 0.45,
            false
        );
    }
}
// ============================================================
// CARGAR PERSONAJES
// ============================================================

async function cargarPersonajes() {

    mike =
        await cargarGLB(
            ARCHIVOS.mike
        );

    micaela =
        await cargarGLB(
            ARCHIVOS.micaela
        );

    // --------------------------------------------------------
    // MIKE
    // --------------------------------------------------------

    if (mike) {

        mike.position.set(
            -0.75,
            CONFIG.alturaMike,
            CONFIG.inicioZ
        );

        mike.rotation.y =
            ROTACION_PERSONAJES;

        mike.scale.setScalar(1);

        escena.add(mike);

        mikeHuesos =
            buscarHuesos(mike);

        iniciarAnimacionGLB(
            mike,
            "mike"
        );
    }

    // --------------------------------------------------------
    // MICAELA
    // --------------------------------------------------------

    if (micaela) {

        micaela.position.set(
            0.75,
            CONFIG.alturaMicaela,
            CONFIG.inicioZ + 0.45
        );

        micaela.rotation.y =
            ROTACION_PERSONAJES;

        micaela.scale.setScalar(1);

        escena.add(micaela);

        micaelaHuesos =
            buscarHuesos(micaela);

        iniciarAnimacionGLB(
            micaela,
            "micaela"
        );
    }
}

// ============================================================
// CARGAR GLB
// ============================================================

async function cargarGLB(ruta) {

    try {

        const gltf =
            await gltfLoader.loadAsync(
                ruta
            );

        const objeto =
            gltf.scene;

        objeto.traverse(
            (child) => {

                if (
                    child.isMesh
                ) {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            }
        );

        objeto.userData.animations =
            gltf.animations || [];

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

// ============================================================
// ANIMACIÓN GLB
// ============================================================

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
                /walk|caminar|run/i
                    .test(c.name)
        ) ||
        clips[0];

    const accion =
        mixer.clipAction(clip);

    accion.reset();
    accion.play();

    personaje.userData.mixer =
        mixer;

    personaje.userData.accion =
        accion;

    if (
        nombre === "mike"
    ) {
        mikeMixer = mixer;
    } else {
        micaelaMixer = mixer;
    }
            }
// ============================================================
// BUSCAR HUESOS
// ============================================================

function buscarHuesos(
    personaje
) {

    const huesos = {};

    personaje.traverse(
        (obj) => {

            if (!obj.isBone) {
                return;
            }

            const n =
                obj.name.toLowerCase();

            if (
                /hip|pelvis|cadera/.test(n)
            ) {
                huesos.cadera = obj;
            }

            if (
                /spine|chest|torso|columna|pecho/.test(n)
            ) {
                huesos.torso = obj;
            }

            if (
                /head|cabeza/.test(n)
            ) {
                huesos.cabeza = obj;
            }

            if (
                /left.*upper.*arm|upper.*arm.*left|brazo.*izq/.test(n)
            ) {
                huesos.brazoIzq = obj;
            }

            if (
                /right.*upper.*arm|upper.*arm.*right|brazo.*der/.test(n)
            ) {
                huesos.brazoDer = obj;
            }

            if (
                /left.*thigh|thigh.*left|upper.*leg.*left|pierna.*izq/.test(n)
            ) {
                huesos.piernaIzq = obj;
            }

            if (
                /right.*thigh|thigh.*right|upper.*leg.*right|pierna.*der/.test(n)
            ) {
                huesos.piernaDer = obj;
            }
        }
    );

    return huesos;
}

// ============================================================
// CAMINATA
// ============================================================

function actualizarCaminata(
    personaje,
    huesos,
    velocidad,
    delta
) {

    if (!personaje) {
        return;
    }

    personaje.position.z -=
        velocidad * delta;

    // Nunca permitir que bajen debajo del suelo
    if (
        personaje.position.y < 0
    ) {
        personaje.position.y = 0;
    }

    const t =
        tiempoTotal * 7;

    // Solo usar movimiento manual
    // cuando el modelo no tenga una animación.
    if (
        !personaje.userData.accion
    ) {

        if (huesos.brazoIzq) {
            huesos.brazoIzq.rotation.x =
                Math.sin(t) * 0.35;
        }

        if (huesos.brazoDer) {
            huesos.brazoDer.rotation.x =
                Math.sin(t + Math.PI) * 0.35;
        }

        if (huesos.piernaIzq) {
            huesos.piernaIzq.rotation.x =
                Math.sin(t + Math.PI) * 0.28;
        }

        if (huesos.piernaDer) {
            huesos.piernaDer.rotation.x =
                Math.sin(t) * 0.28;
        }
    }
}

// ============================================================
// DETENER PERSONAJE
// ============================================================

function detenerPersonaje(
    personaje
) {

    if (!personaje) {
        return;
    }

    const accion =
        personaje.userData.accion;

    if (accion) {
        accion.paused = true;
    }
}

// ============================================================
// CREAR HUEVO
// ============================================================

async function crearHuevo() {

    return new Promise(
        (resolve) => {

            textureLoader.load(
                ARCHIVOS.huevo,

                (textura) => {

                    textura.colorSpace =
                        THREE.SRGBColorSpace;

                    const material =
                        new THREE.MeshBasicMaterial({
                            map: textura,
                            transparent: true,
                            side: THREE.DoubleSide
                        });

                    huevo =
                        new THREE.Mesh(
                            new THREE.PlaneGeometry(
                                1.55,
                                1.75
                            ),
                            material
                        );

                    huevo.position.set(
                        0,
                        0.88,
                        0
                    );

                    huevo.rotation.y =
                        Math.PI;

                    huevo.visible = false;

                    huevo.userData.baseX =
                        huevo.scale.x;

                    huevo.userData.baseY =
                        huevo.scale.y;

                    escena.add(huevo);

                    crearSombraHuevo();

                    huevoBrillo =
                        new THREE.PointLight(
                            0xffe89a,
                            0,
                            4
                        );

                    huevoBrillo.position.set(
                        0,
                        0.9,
                        0
                    );

                    escena.add(
                        huevoBrillo
                    );

                    resolve();

                },

                undefined,

                () => {

                    crearHuevoRespaldo();
                    resolve();
                }
            );
        }
    );
}

// ============================================================
// SOMBRA DEL HUEVO
// ============================================================

function crearSombraHuevo() {

    sombraHuevo =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                0.65,
                32
            ),
            new THREE.MeshBasicMaterial({
                color: 0x222222,
                transparent: true,
                opacity: 0.28
            })
        );

    sombraHuevo.rotation.x =
        -Math.PI / 2;

    sombraHuevo.position.set(
        0,
        0.025,
        0
    );

    escena.add(
        sombraHuevo
    );
            }
// ============================================================
// HUEVO DE RESPALDO
// ============================================================

function crearHuevoRespaldo() {

    huevo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.65,
                20,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe8c36a
            })
        );

    huevo.scale.y = 1.3;

    huevo.position.set(
        0,
        0.72,
        0
    );

    huevo.visible = false;

    huevo.userData.baseX =
        huevo.scale.x;

    huevo.userData.baseY =
        huevo.scale.y;

    escena.add(huevo);

    crearSombraHuevo();

    huevoBrillo =
        new THREE.PointLight(
            0xffe89a,
            0,
            4
        );

    huevoBrillo.position.set(
        0,
        0.9,
        0
    );

    escena.add(
        huevoBrillo
    );
}

// ============================================================
// CREAR POLLOS
// ============================================================

function crearPollos3D() {

    polloNoob =
        crearPollo3D("noob");

    polloZombie =
        crearPollo3D("zombie");

    polloNoobEspecial =
        crearPollo3D(
            "pollito_noob"
        );

    polloNoob.position.set(
        -1.8,
        0,
        -1.0
    );

    polloZombie.position.set(
        0,
        0,
        -1.25
    );

    polloNoobEspecial.position.set(
        1.8,
        0,
        -1.0
    );

    polloNoob.visible = false;
    polloZombie.visible = false;
    polloNoobEspecial.visible = false;

    escena.add(polloNoob);
    escena.add(polloZombie);
    escena.add(polloNoobEspecial);
}

// ============================================================
// POLLO 3D
// ============================================================

function crearPollo3D(tipo) {

    const grupo =
        new THREE.Group();

    let cuerpoColor = 0x8fa68e;
    let gorraColor = 0xe8c36a;

    if (tipo === "zombie") {

        cuerpoColor = 0x64735f;
        gorraColor = 0x596b62;

    }

    if (tipo === "pollito_noob") {

        cuerpoColor = 0xf5d5b8;
        gorraColor = 0xe8c36a;
    }

    const matCuerpo =
        new THREE.MeshStandardMaterial({
            color: cuerpoColor,
            roughness: 0.9
        });

    const matPico =
        new THREE.MeshStandardMaterial({
            color: 0xffa62b
        });

    const matPatas =
        new THREE.MeshStandardMaterial({
            color: 0xd58b28
        });

    // CUERPO
    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.55,
                14,
                10
            ),
            matCuerpo
        );

    cuerpo.scale.set(
        1,
        1.12,
        0.9
    );

    cuerpo.position.y =
        0.72;

    cuerpo.castShadow = true;

    grupo.add(cuerpo);

    // CABEZA
    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.43,
                14,
                10
            ),
            matCuerpo
        );

    cabeza.position.y =
        1.48;

    cabeza.castShadow = true;

    grupo.add(cabeza);

    // OJOS
    const ojoMat =
        new THREE.MeshBasicMaterial({
            color:
                tipo === "zombie"
                    ? 0xff2020
                    : 0x111111
        });

    const ojo1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.075,
                8,
                8
            ),
            ojoMat
        );

    ojo1.position.set(
        -0.16,
        1.55,
        -0.38
    );

    const ojo2 =
        ojo1.clone();

    ojo2.position.x =
        0.16;

    grupo.add(ojo1);
    grupo.add(ojo2);
    // ============================================================
// PARTES DEL POLLO
// ============================================================

    // PICO
    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.12,
                0.28,
                4
            ),
            matPico
        );

    pico.rotation.x =
        -Math.PI / 2;

    pico.position.set(
        0,
        1.43,
        -0.53
    );

    grupo.add(pico);

    // ALA IZQUIERDA
    const ala1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.28,
                10,
                8
            ),
            matCuerpo
        );

    ala1.scale.set(
        0.55,
        1,
        0.25
    );

    ala1.position.set(
        -0.52,
        0.78,
        0
    );

    ala1.rotation.z =
        -0.25;

    grupo.add(ala1);

    // ALA DERECHA
    const ala2 =
        ala1.clone();

    ala2.position.x =
        0.52;

    ala2.rotation.z =
        0.25;

    grupo.add(ala2);

    // COLA
    const cola =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.25,
                0.55,
                7
            ),
            matCuerpo
        );

    cola.rotation.x =
        Math.PI / 2;

    cola.position.set(
        0,
        0.95,
        0.48
    );

    grupo.add(cola);

    // PATAS
    crearPata(
        grupo,
        -0.18,
        matPatas
    );

    crearPata(
        grupo,
        0.18,
        matPatas
    );

    // GORRA
    crearGorraPollo(
        grupo,
        gorraColor
    );

    // N DEL NOOB
    if (
        tipo === "noob" ||
        tipo === "pollito_noob"
    ) {
        crearLetraNPollo(
            grupo
        );
    }

    // DETALLE ZOMBIE
    if (tipo === "zombie") {
        crearDetallesZombie(
            grupo
        );
    }

    grupo.userData.tipo =
        tipo;

    grupo.userData.animTime =
        Math.random() * 10;

    grupo.userData.baseScale =
        1;

    return grupo;
}

// ============================================================
// PATA
// ============================================================

function crearPata(
    grupo,
    x,
    material
) {

    const pierna =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.045,
                0.055,
                0.32,
                7
            ),
            material
        );

    pierna.position.set(
        x,
        0.25,
        0
    );

    grupo.add(pierna);

    const pie =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.10,
                8,
                8
            ),
            material
        );

    pie.scale.z = 1.5;

    pie.position.set(
        x,
        0.08,
        -0.10
    );

    grupo.add(pie);
}

// ============================================================
// GORRA
// ============================================================

function crearGorraPollo(
    grupo,
    color
) {

    const material =
        new THREE.MeshStandardMaterial({
            color
        });

    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.43,
                12,
                8
            ),
            material
        );

    gorra.scale.set(
        1.05,
        0.30,
        0.90
    );

    gorra.position.y =
        1.82;

    grupo.add(gorra);

    const visera =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.62,
                0.08,
                0.28
            ),
            material
        );

    visera.position.set(
        0,
        1.75,
        -0.30
    );

    grupo.add(visera);
        }
// ============================================================
// LETRA N
// ============================================================

function crearLetraNPollo(
    grupo
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x222222
        });

    const barra1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.06,
                0.25,
                0.035
            ),
            material
        );

    const barra2 =
        barra1.clone();

    const diagonal =
        barra1.clone();

    barra1.position.set(
        -0.10,
        1.76,
        -0.47
    );

    barra2.position.set(
        0.10,
        1.76,
        -0.47
    );

    diagonal.position.set(
        0,
        1.76,
        -0.48
    );

    diagonal.rotation.z =
        -0.6;

    grupo.add(barra1);
    grupo.add(barra2);
    grupo.add(diagonal);
}

// ============================================================
// DETALLES ZOMBIE
// ============================================================

function crearDetallesZombie(
    grupo
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x2f432d
        });

    const mancha1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.10,
                7,
                7
            ),
            material
        );

    mancha1.scale.set(
        1.4,
        0.7,
        0.25
    );

    mancha1.position.set(
        -0.25,
        0.85,
        -0.47
    );

    const mancha2 =
        mancha1.clone();

    mancha2.position.set(
        0.25,
        0.62,
        -0.46
    );

    grupo.add(mancha1);
    grupo.add(mancha2);
}

// ============================================================
// INTERFAZ DE DIÁLOGO
// ============================================================

const DIALOGOS = [

    [1, 0.3, "Micaela",
        "Mike... ¿dónde estamos?"],

    [1, 1.5, "Mike",
        "No lo sé... pero este lugar está enorme."],

    [1, 2.8, "Micaela",
        "Espera... ¿ves eso allá?"],

    [1, 4.0, "Mike",
        "Sí... se ve algo entre los árboles."],

    [1, 5.2, "Micaela",
        "Pío... pío... ¿qué fue eso?"],

    [1, 6.0, "Mike",
        "¿Un pollo?"],

    [1, 7.0, "Micaela",
        "Vamos a ver qué es."],

    [2, 0.5, "Mike",
        "Mira... hay algo junto a ese huevo."],

    [2, 1.7, "Micaela",
        "¿Un huevo? ¿De dónde salió?"],

    [2, 2.7, "Mike",
        "No parece un huevo normal... está brillando."],

    [3, 0.2, "Micaela",
        "¡Mike, está moviéndose!"],

    [3, 0.9, "Mike",
        "¡Se está abriendo!"],

    [4, 0.2, "Micaela",
        "¡¿Son pollos?!"],

    [4, 1.2, "Mike",
        "¡Hay varios! ¿Cuál va a salir?"],

    [4, 5.5, "Micaela",
        "¡Ya se decidió!"],

    [5, 0.2, "Mike",
        "¡Ese fue el que salió!"]
];

function crearInterfazDialogo() {

    cajaDialogo =
        document.createElement("div");

    cajaDialogo.style.position =
        "fixed";

    cajaDialogo.style.left =
        "5%";

    cajaDialogo.style.right =
        "5%";

    cajaDialogo.style.bottom =
        "5%";

    cajaDialogo.style.padding =
        "14px 18px";

    cajaDialogo.style.borderRadius =
        "16px";

    cajaDialogo.style.background =
        "rgba(0,0,0,0.78)";

    cajaDialogo.style.color =
        "white";

    cajaDialogo.style.zIndex =
        "100000";

    cajaDialogo.style.fontFamily =
        "sans-serif";

    nombreDialogo =
        document.createElement("div");

    nombreDialogo.style.fontWeight =
        "bold";

    nombreDialogo.style.fontSize =
        "20px";

    textoDialogo =
        document.createElement("div");

    textoDialogo.style.fontSize =
        "17px";

    textoDialogo.style.marginTop =
        "5px";

    cajaDialogo.appendChild(
        nombreDialogo
    );

    cajaDialogo.appendChild(
        textoDialogo
    );

    contenedorJuego.appendChild(
        cajaDialogo
    );
        }
// ============================================================
// ACTUALIZAR DIÁLOGO
// ============================================================

function actualizarDialogo() {

    if (!cajaDialogo) {
        return;
    }

    let encontrado = -1;

    for (
        let i = 0;
        i < DIALOGOS.length;
        i++
    ) {

        const d =
            DIALOGOS[i];

        if (
            d[0] === fase &&
            tiempoFase >= d[1]
        ) {
            encontrado = i;
        }
    }

    if (
        encontrado !== -1 &&
        encontrado !== dialogoActual
    ) {

        dialogoActual =
            encontrado;

        const d =
            DIALOGOS[encontrado];

        nombreDialogo.textContent =
            d[2];

        textoDialogo.textContent =
            d[3];

        cajaDialogo.style.display =
            "block";
    }
}

// ============================================================
// RESULTADO REAL
// ============================================================

function obtenerResultadoReal() {

    if (resultadoReal) {
        return resultadoReal;
    }

    // UNA SOLA TIRADA
    resultadoReal =
        abrirHuevo(
            "huevo_noob"
        );

    console.log(
        "[GAMERPRO] Resultado:",
        resultadoReal
    );

    return resultadoReal;
}

// ============================================================
// MOSTRAR POLLOS
// ============================================================

function mostrarPollos() {

    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    for (
        const pollo of pollos
    ) {

        if (!pollo) {
            continue;
        }

        pollo.visible = true;

        pollo.scale.setScalar(
            1
        );

        pollo.userData.animTime =
            Math.random() * 5;
    }

    ruletaIndice = 0;
    ruletaVueltas = 0;
    ruletaTerminada = false;
    ruletaUltimoCambio = 0;
    ruletaIntervalo = 0.08;

    resultadoMostrado = false;
}

// ============================================================
// ANIMACIÓN DE POLLOS
// ============================================================

function animarPollos(
    delta
) {

    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    for (
        const pollo of pollos
    ) {

        if (
            !pollo ||
            !pollo.visible
        ) {
            continue;
        }

        pollo.userData.animTime +=
            delta * 5;

        const t =
            pollo.userData.animTime;

        pollo.position.y =
            Math.abs(
                Math.sin(t)
            ) * 0.08;

        pollo.rotation.z =
            Math.sin(t * 0.8) *
            0.04;
    }

    actualizarRuleta(delta);
}

// ============================================================
// RULETA
// ============================================================

function actualizarRuleta(
    delta
) {

    if (ruletaTerminada) {
        return;
    }

    ruletaUltimoCambio +=
        delta;

    const progreso =
        Math.min(
            tiempoFase /
            CONFIG.duracionRuleta,
            1
        );

    // Comienza rápida y termina lenta
    ruletaIntervalo =
        0.055 +
        Math.pow(
            progreso,
            2.4
        ) * 0.55;

    if (
        ruletaUltimoCambio <
        ruletaIntervalo
    ) {
        resaltarPollo(
            ruletaIndice
        );
        return;
    }

    ruletaUltimoCambio = 0;

    ruletaIndice =
        (ruletaIndice + 1) % 3;

    if (
        ruletaIndice === 0
    ) {
        ruletaVueltas++;
    }

    resaltarPollo(
        ruletaIndice
    );

    // Después de suficientes vueltas,
    // empieza a detenerse en el resultado real.
    if (
        progreso > 0.72
    ) {

        const ganadorIndice =
            indiceResultado(
                resultadoReal
            );

        if (
            ruletaVueltas >= 7 &&
            ruletaIndice ===
                ganadorIndice &&
            ruletaIntervalo > 0.35
        ) {

            ruletaTerminada =
                true;

            ruletaIndice =
                ganadorIndice;

            resaltarPollo(
                ganadorIndice
            );
        }
    }
}

// ============================================================
// ÍNDICE DEL RESULTADO
// ============================================================

function indiceResultado(
    resultado
) {

    if (
        resultado === "zombie"
    ) {
        return 1;
    }

    if (
        resultado ===
        "pollito_noob"
    ) {
        return 2;
    }

    return 0;
}

// ============================================================
// RESALTAR POLLO
// ============================================================

function resaltarPollo(
    indice
) {

    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    for (
        let i = 0;
        i < pollos.length;
        i++
    ) {

        const pollo =
            pollos[i];

        if (!pollo) {
            continue;
        }

        const activo =
            i === indice;

        const escala =
            activo
                ? 1.18
                : 0.92;

        pollo.scale.setScalar(
            escala
        );

        pollo.userData.ruletaActivo =
            activo;
    }
}

// ============================================================
// FINALIZAR SELECCIÓN
// ============================================================

function finalizarSeleccion() {

    if (
        resultadoMostrado
    ) {
        return;
    }

    const pollos = {

        noob:
            polloNoob,

        zombie:
            polloZombie,

        pollito_noob:
            polloNoobEspecial
    };

    const ganador =
        pollos[
            resultadoReal
        ];

    if (!ganador) {

        resultadoReal =
            "noob";

        finalizarSeleccion();

        return;
    }

    for (
        const [
            nombre,
            pollo
        ]
        of Object.entries(
            pollos
        )
    ) {

        if (!pollo) {
            continue;
        }

        pollo.visible =
            nombre ===
            resultadoReal;
    }

    ganador.visible = true;

    ganador.scale.setScalar(
        1.25
    );

    ganador.position.y =
        0.15;

    ganador.userData.ganador =
        true;

    resultadoMostrado =
        true;

    console.log(
        "[GAMERPRO] Ganador:",
        resultadoReal
    );
            }
// ============================================================
// ANIMAR GANADOR
// ============================================================

function animarGanador() {

    if (
        !resultadoMostrado ||
        !resultadoReal
    ) {
        return;
    }

    const pollos = {

        noob:
            polloNoob,

        zombie:
            polloZombie,

        pollito_noob:
            polloNoobEspecial
    };

    const ganador =
        pollos[
            resultadoReal
        ];

    if (!ganador) {
        return;
    }

    ganador.scale.setScalar(
        1.22 +
        Math.sin(
            tiempoTotal * 5
        ) * 0.05
    );

    ganador.position.y =
        0.15 +
        Math.abs(
            Math.sin(
                tiempoTotal * 5
            )
        ) * 0.08;
}

// ============================================================
// HUEVO
// ============================================================

function actualizarHuevo() {

    if (!huevo) {
        return;
    }

    if (
        fase === 2
    ) {

        huevo.visible = true;

        const pulso =
            1 +
            Math.sin(
                tiempoFase * 8
            ) * 0.06;

        huevo.scale.x =
            huevo.userData.baseX *
            pulso;

        huevo.scale.y =
            huevo.userData.baseY *
            pulso;

        if (huevoBrillo) {

            huevoBrillo.intensity =
                1.4 +
                Math.sin(
                    tiempoFase * 10
                ) * 0.7;
        }
    }

    if (
        fase === 3
    ) {

        huevo.visible = true;

        const progreso =
            Math.min(
                tiempoFase /
                CONFIG.duracionApertura,
                1
            );

        huevo.scale.y =
            huevo.userData.baseY *
            Math.max(
                0.05,
                1 -
                progreso * 0.92
            );

        huevo.rotation.z =
            Math.sin(
                tiempoFase * 18
            ) * 0.10;

        if (huevoBrillo) {

            huevoBrillo.intensity =
                2 +
                progreso * 4;
        }
    }

    if (
        fase >= 4
    ) {

        huevo.visible = false;

        if (huevoBrillo) {
            huevoBrillo.intensity = 0;
        }

        if (sombraHuevo) {
            sombraHuevo.visible = false;
        }

    } else {

        if (sombraHuevo) {
            sombraHuevo.visible =
                fase >= 2;
        }
    }
}

// ============================================================
// CÁMARA CINEMÁTICA
// ============================================================

function actualizarCamara() {

    if (!camara) {
        return;
    }

    let objetivoX = 0;
    let objetivoY = 1.15;
    let objetivoZ = 2;

    if (
        fase === 1
    ) {

        const zMike =
            mike
                ? mike.position.z
                : CONFIG.inicioZ;

        const zMicaela =
            micaela
                ? micaela.position.z
                : CONFIG.inicioZ;

        const centroZ =
            (
                zMike +
                zMicaela
            ) / 2;

        // La cámara acompaña el camino
        camara.position.z =
            centroZ + 4.5;

        camara.position.y =
            1.65;

        objetivoZ =
            centroZ - 1.8;

    } else if (
        fase === 2 ||
        fase === 3
    ) {

        camara.position.z =
            4.0;

        camara.position.y =
            1.45;

        objetivoZ = 0;

    } else if (
        fase >= 4
    ) {

        camara.position.z =
            4.8;

        camara.position.y =
            1.65;

        objetivoZ =
            -1.0;
    }

    camara.position.x +=
        (
            objetivoX -
            camara.position.x
        ) * 0.08;

    camara.position.y +=
        (
            objetivoY -
            camara.position.y
        ) * 0.08;

    camara.lookAt(
        objetivoX,
        objetivoY,
        objetivoZ
    );
}

// ============================================================
// CAMBIO DE FASE
// ============================================================

function cambiarFase(
    nuevaFase
) {

    fase =
        nuevaFase;

    tiempoFase = 0;

    dialogoActual = -1;

    if (
        fase === 3
    ) {
        obtenerResultadoReal();
    }

    if (
        fase === 4
    ) {
        mostrarPollos();
    }

    if (
        fase === 5
    ) {
        finalizarSeleccion();
    }
}

// ============================================================
// ACTUALIZAR FASES
// ============================================================

function actualizarFases(
    delta
) {

    tiempoFase += delta;

    if (
        fase === 0 &&
        tiempoFase >=
        CONFIG.duracionIntro
    ) {
        cambiarFase(1);
    }

    if (
        fase === 1 &&
        tiempoFase >=
        CONFIG.duracionCaminata
    ) {

        if (mike) {
            mike.position.z =
                CONFIG.llegadaZ;
        }

        if (micaela) {
            micaela.position.z =
                CONFIG.llegadaZ;
        }

        detenerPersonaje(mike);
        detenerPersonaje(micaela);

        cambiarFase(2);
    }

    if (
        fase === 2 &&
        tiempoFase >=
        CONFIG.duracionHuevo
    ) {
        cambiarFase(3);
    }

    if (
        fase === 3 &&
        tiempoFase >=
        CONFIG.duracionApertura
    ) {
        cambiarFase(4);
    }

    if (
        fase === 4 &&
        tiempoFase >=
        CONFIG.duracionRuleta
    ) {
        cambiarFase(5);
    }

    if (
        fase === 5 &&
        tiempoFase >=
        CONFIG.duracionResultado
    ) {
        terminarCinematica();
    }
}

// ============================================================
// LOOP
// ============================================================

function actualizar() {

    if (!cinematicaActiva) {
        return;
    }

    const delta =
        Math.min(
            reloj.getDelta(),
            0.05
        );

    tiempoTotal += delta;

    actualizarFases(delta);
    actualizarDialogo();

    if (fase === 1) {

        actualizarCaminata(
            mike,
            mikeHuesos,
            CONFIG.velocidadMike,
            delta
        );

        actualizarCaminata(
            micaela,
            micaelaHuesos,
            CONFIG.velocidadMicaela,
            delta
        );
    }

    if (mikeMixer) {
        mikeMixer.update(delta);
    }

    if (micaelaMixer) {
        micaelaMixer.update(delta);
    }

    actualizarHuevo();

    if (fase === 4) {
        animarPollos(delta);
    }

    if (fase === 5) {
        animarGanador();
    }

    actualizarCamara();

    renderer.render(
        escena,
        camara
    );

    animacionID =
        requestAnimationFrame(
            actualizar
        );
}

// ============================================================
// RESIZE
// ============================================================

function redimensionarCinematica() {

    if (
        !camara ||
        !renderer
    ) {
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
// INICIAR
// ============================================================

export async function iniciarCinematica(
    contenedor
) {

    if (cinematicaActiva) {
        return;
    }

    contenedorJuego =
        contenedor ||
        document.body;

    cinematicaActiva = true;
    cinematicaFinalizada = false;

    fase = 0;
    tiempoFase = 0;
    tiempoTotal = 0;

    resultadoReal = null;
    resultadoMostrado = false;

    ruletaTerminada = false;

    crearEscena();

    crearInterfazDialogo();

    await cargarPersonajes();

    await crearHuevo();

    crearPollos3D();

    reloj =
        new THREE.Clock();

    animacionID =
        requestAnimationFrame(
            actualizar
        );
}

// ============================================================
// TERMINAR
// ============================================================

function terminarCinematica() {

    cinematicaFinalizada = true;

    detenerCinematica();
}

// ============================================================
// DETENER
// ============================================================

export function detenerCinematica() {

    cinematicaActiva = false;

    if (animacionID) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID = null;
    }

    window.removeEventListener(
        "resize",
        redimensionarCinematica
    );

    if (cajaDialogo) {

        cajaDialogo.remove();

        cajaDialogo = null;
    }

    if (renderer) {

        renderer.dispose();

        if (
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement
                .parentNode
                .removeChild(
                    renderer.domElement
                );
        }
    }

    escena = null;
    camara = null;
    renderer = null;

    mike = null;
    micaela = null;

    huevo = null;
    huevoBrillo = null;
    sombraHuevo = null;

    polloNoob = null;
    polloZombie = null;
    polloNoobEspecial = null;

    mikeMixer = null;
    micaelaMixer = null;

    mikeHuesos = {};
    micaelaHuesos = {};
        }
