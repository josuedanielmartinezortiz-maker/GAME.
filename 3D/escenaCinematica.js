// ============================================================
// GAMERPRO GAME
// escenaCinematica.js
// CINEMÁTICA HUEVO NOOB 3D
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import {
    abrirHuevo
} from "../probabilidades.js";

// ============================================================
// ESTADO
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
// HUEVO 3D
// ============================================================

let huevo = null;
let huevoBrillo = null;

// ============================================================
// POLLOS
// ============================================================

let polloNoob = null;
let polloZombie = null;
let polloNoobEspecial = null;

let resultadoReal = null;
let resultadoMostrado = false;

let ruletaIndice = 0;
let ruletaVueltas = 0;
let ruletaTiempo = 0;

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

const gltfLoader =
    new GLTFLoader();

// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {

    // CAMINATA
    velocidadMike: 1.45,
    velocidadMicaela: 1.45,

    // DISTANCIA
    zInicial: 7.5,
    zHuevo: 0,

    // CÁMARA MÁS ALEJADA
    camaraZ: 11.5,
    camaraY: 3.4,

    // FASES
    intro: 2.0,
    caminata: 5.4,
    huevo: 3.2,
    apertura: 2.0,
    ruleta: 5.8,
    resultado: 4.0

};

// ============================================================
// ROTACIÓN
// ============================================================

// Los GLB actuales necesitan esta orientación.
// Si el modelo vuelve a mirar hacia atrás,
// se cambia únicamente esta constante.
const ROTACION_PERSONAJES =
    Math.PI;

// ============================================================
// EXPORTS
// ============================================================

export function cinematicaTerminada() {

    return cinematicaFinalizada;

}

export function establecerResultadoCinematica(
    resultado
) {

    if (
        resultado === "noob" ||
        resultado === "zombie" ||
        resultado === "pollito_noob"
    ) {

        resultadoReal =
            resultado;

    }

}

export function obtenerResultadoCinematica() {

    return resultadoReal;

}
// ============================================================
// CREAR ESCENA
// ============================================================

function crearEscena() {

    escena =
        new THREE.Scene();

    escena.background =
        new THREE.Color(
            0x789765
        );

    escena.fog =
        new THREE.Fog(
            0x789765,
            15,
            34
        );

    // ========================================================
    // CÁMARA
    // ========================================================

    camara =
        new THREE.PerspectiveCamera(
            60,
            window.innerWidth /
            window.innerHeight,
            0.1,
            100
        );

    camara.position.set(
        0,
        CONFIG.camaraY,
        CONFIG.camaraZ
    );

    // ========================================================
    // RENDERER
    // ========================================================

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

    renderer.shadowMap.enabled =
        true;

    contenedorJuego.appendChild(
        renderer.domElement
    );

    // ========================================================
    // LUZ
    // ========================================================

    const luzAmbiente =
        new THREE.HemisphereLight(
            0xe8f5d8,
            0x30472b,
            2.7
        );

    escena.add(
        luzAmbiente
    );

    const sol =
        new THREE.DirectionalLight(
            0xfff2c9,
            3.2
        );

    sol.position.set(
        -6,
        12,
        8
    );

    sol.castShadow =
        true;

    escena.add(
        sol
    );

    // ========================================================
    // SUELO
    // ========================================================

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

    suelo.receiveShadow =
        true;

    escena.add(
        suelo
    );

    // ========================================================
    // CAMINO
    // ========================================================

    crearCamino();

    // ========================================================
    // BOSQUE
    // ========================================================

    crearBosque();

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
                45
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
        0.012,
        -8
    );

    camino.receiveShadow =
        true;

    escena.add(
        camino
    );

    // Piedras del camino
    const piedraMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x75644e,
            roughness: 1
        });

    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const piedra =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.08 +
                    Math.random() * 0.12,
                    7,
                    5
                ),
                piedraMaterial
            );

        piedra.scale.y =
            0.25;

        piedra.position.set(
            (Math.random() - 0.5) *
            3.5,
            0.06,
            11 -
            i * 1.2
        );

        escena.add(
            piedra
        );

    }

        }
// ============================================================
// PINO
// ============================================================

function crearPino(
    escala = 1
) {

    const grupo =
        new THREE.Group();

    const troncoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x563820,
            roughness: 1
        });

    const hojasMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x285b35,
            roughness: 1
        });

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.16,
                0.25,
                3.2,
                7
            ),
            troncoMaterial
        );

    tronco.position.y =
        1.6;

    tronco.castShadow =
        true;

    grupo.add(
        tronco
    );

    // Tres niveles de ramas
    const niveles = [
        [1.35, 2.0],
        [1.05, 2.9],
        [0.72, 3.7]
    ];

    for (
        const [radio, altura]
        of niveles
    ) {

        const copa =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    radio,
                    1.65,
                    8
                ),
                hojasMaterial
            );

        copa.position.y =
            altura;

        copa.castShadow =
            true;

        grupo.add(
            copa
        );

    }

    grupo.scale.setScalar(
        escala
    );

    return grupo;

}

// ============================================================
// ARBUSTO
// ============================================================

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
        i < 6;
        i++
    ) {

        const bola =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.35 +
                    Math.random() * 0.2,
                    8,
                    6
                ),
                material
            );

        bola.position.set(
            (Math.random() - 0.5) *
            1.2,
            0.3 +
            Math.random() * 0.25,
            (Math.random() - 0.5) *
            0.8
        );

        bola.castShadow =
            true;

        grupo.add(
            bola
        );

    }

    grupo.scale.setScalar(
        escala
    );

    return grupo;

}

// ============================================================
// BOSQUE CERRADO
// ============================================================

function crearBosque() {

    // Árboles cercanos
    for (
        let i = 0;
        i < 34;
        i++
    ) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const arbol =
            crearPino(
                0.8 +
                Math.random() * 0.65
            );

        arbol.position.set(
            lado *
            (
                3.5 +
                Math.random() * 2.0
            ),
            0,
            9 -
            i * 1.15
        );

        escena.add(
            arbol
        );

        const arbusto =
            crearArbusto(
                0.9 +
                Math.random() * 0.6
            );

        arbusto.position.set(
            arbol.position.x +
            (Math.random() - 0.5),
            0,
            arbol.position.z +
            0.35
        );

        escena.add(
            arbusto
        );

    }

    // Segunda barrera vegetal
    for (
        let i = 0;
        i < 38;
        i++
    ) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const arbusto =
            crearArbusto(
                1.0 +
                Math.random() * 0.8
            );

        arbusto.position.set(
            lado *
            (
                5.0 +
                Math.random() * 2.5
            ),
            0,
            9 -
            i * 0.9
        );

        escena.add(
            arbusto
        );

    }

    // Pared de árboles del fondo
    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const arbol =
            crearPino(
                1.0 +
                Math.random() * 0.5
            );

        arbol.position.set(
            -9 +
            i * 0.85,
            0,
            -14 +
            Math.random() * 1.5
        );

        escena.add(
            arbol
        );

    }

}
// ============================================================
// CARGAR PERSONAJES
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

    // ========================================================
    // MIKE
    // ========================================================

    if (mike) {

        mike.position.set(
            -1.0,
            0,
            CONFIG.zInicial
        );

        mike.rotation.y =
            ROTACION_PERSONAJES;

        escena.add(
            mike
        );

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

    // ========================================================
    // MICAELA
    // ========================================================

    if (micaela) {

        micaela.position.set(
            1.0,
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

// ============================================================
// GLB
// ============================================================

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
            objetoHijo => {

                if (
                    objetoHijo.isMesh
                ) {

                    objetoHijo.castShadow =
                        true;

                    objetoHijo.receiveShadow =
                        true;

                }

            }
        );

        return objeto;

    } catch (
        error
    ) {

        console.error(
            "[GAMERPRO] Error GLB:",
            ruta,
            error
        );

        return null;

    }

}

// ============================================================
// PIES EN EL SUELO
// ============================================================

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

// ============================================================
// ANIMACIÓN
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
// ============================================================
// HUESOS
// ============================================================

function buscarHuesos(
    personaje
) {

    const huesos = {};

    personaje.traverse(
        obj => {

            if (
                !obj.isBone
            ) {
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
// CAMINAR
// ============================================================

function actualizarCaminata(
    personaje,
    huesos,
    velocidad,
    delta
) {

    if (
        !personaje
    ) {
        return;
    }

    // Movimiento REAL hacia el huevo
    personaje.position.z -=
        velocidad * delta;

    const t =
        tiempoTotal * 7;

    // Si no tiene animación GLB,
    // movemos los huesos manualmente.
    if (
        !personaje.userData.accion
    ) {

        if (
            huesos.brazoIzq
        ) {

            huesos.brazoIzq.rotation.x =
                Math.sin(t) *
                0.45;

        }

        if (
            huesos.brazoDer
        ) {

            huesos.brazoDer.rotation.x =
                Math.sin(
                    t + Math.PI
                ) *
                0.45;

        }

        if (
            huesos.piernaIzq
        ) {

            huesos.piernaIzq.rotation.x =
                Math.sin(
                    t + Math.PI
                ) *
                0.35;

        }

        if (
            huesos.piernaDer
        ) {

            huesos.piernaDer.rotation.x =
                Math.sin(t) *
                0.35;

        }

    }

}

// ============================================================
// DETENER
// ============================================================

function detenerPersonaje(
    personaje
) {

    if (
        !personaje
    ) {
        return;
    }

    const accion =
        personaje.userData.accion;

    if (
        accion
    ) {

        accion.paused =
            true;

    }

}

// ============================================================
// HUEVO 3D
// ============================================================

function crearHuevo3D() {

    const grupo =
        new THREE.Group();

    // --------------------------------------------------------
    // PARTE SUPERIOR AMARILLA
    // --------------------------------------------------------

    const amarillo =
        new THREE.MeshStandardMaterial({
            color: 0xffd72f,
            roughness: 0.35,
            metalness: 0.05,
            emissive: 0x6a4b00,
            emissiveIntensity: 0.12
        });

    const parteSuperior =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.9,
                32,
                20,
                0,
                Math.PI * 2,
                0,
                Math.PI / 3
            ),
            amarillo
        );

    parteSuperior.scale.y =
        1.15;

    parteSuperior.position.y =
        0.55;

    grupo.add(
        parteSuperior
    );

    // --------------------------------------------------------
    // PARTE AZUL CENTRAL
    // --------------------------------------------------------

    const azul =
        new THREE.MeshStandardMaterial({
            color: 0x1689e8,
            roughness: 0.32,
            metalness: 0.08,
            emissive: 0x063d72,
            emissiveIntensity: 0.1
        });

    const centro =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.82,
                0.82,
                0.62,
                32
            ),
            azul
        );

    centro.position.y =
        0;

    grupo.add(
        centro
    );

    // --------------------------------------------------------
    // PARTE VERDE INFERIOR
    // --------------------------------------------------------

    const verde =
        new THREE.MeshStandardMaterial({
            color: 0x29bd36,
            roughness: 0.34,
            metalness: 0.04,
            emissive: 0x064f0d,
            emissiveIntensity: 0.1
        });

    const parteInferior =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.9,
                32,
                20,
                0,
                Math.PI * 2,
                Math.PI * 2 / 3,
                Math.PI / 3
            ),
            verde
        );

    parteInferior.scale.y =
        1.15;

    parteInferior.position.y =
        -0.55;

    grupo.add(
        parteInferior
    );

    // --------------------------------------------------------
    // ANILLOS NEGROS
    // --------------------------------------------------------

    const negro =
        new THREE.MeshStandardMaterial({
            color: 0x151515,
            roughness: 0.5
        });

    for (
        const y of [
            0.36,
            -0.36
        ]
    ) {

        const anillo =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.84,
                    0.055,
                    10,
                    32
                ),
                negro
            );

        anillo.rotation.x =
            Math.PI / 2;

        anillo.position.y =
            y;

        grupo.add(
            anillo
        );

    }

    // --------------------------------------------------------
    // BRILLO
    // --------------------------------------------------------

    const luz =
        new THREE.PointLight(
            0xffe98a,
            2.5,
            5
        );

    luz.position.y =
        0.4;

    grupo.add(
        luz
    );

    grupo.position.set(
        0,
        1.15,
        CONFIG.zHuevo
    );

    grupo.scale.set(
        0.95,
        1.1,
        0.95
    );

    grupo.visible =
        false;

    grupo.userData.luz =
        luz;

    return grupo;

            }
// ============================================================
// CREAR HUEVO
// ============================================================

function crearHuevo() {

    huevo =
        crearHuevo3D();

    escena.add(
        huevo
    );

    huevoBrillo =
        huevo.userData.luz;

}

// ============================================================
// CREAR POLLOS
// ============================================================

function crearPollos3D() {

    polloNoob =
        crearPollo3D(
            "noob"
        );

    polloZombie =
        crearPollo3D(
            "zombie"
        );

    polloNoobEspecial =
        crearPollo3D(
            "pollito_noob"
        );

    // --------------------------------------------------------
    // POSICIONES
    // --------------------------------------------------------

    polloNoob.position.set(
        -2.0,
        0,
        -1.0
    );

    polloZombie.position.set(
        0,
        0,
        -1.25
    );

    polloNoobEspecial.position.set(
        2.0,
        0,
        -1.0
    );

    // --------------------------------------------------------
    // OCULTOS
    // --------------------------------------------------------

    polloNoob.visible =
        false;

    polloZombie.visible =
        false;

    polloNoobEspecial.visible =
        false;

    escena.add(
        polloNoob
    );

    escena.add(
        polloZombie
    );

    escena.add(
        polloNoobEspecial
    );

}

// ============================================================
// POLLO BASE
// ============================================================

function crearPollo3D(
    tipo
) {

    const grupo =
        new THREE.Group();

    // --------------------------------------------------------
    // COLORES
    // --------------------------------------------------------

    let cuerpoColor =
        0xffd84d;

    if (
        tipo === "zombie"
    ) {

        cuerpoColor =
            0xc9e79c;

    }

    const cuerpoMaterial =
        new THREE.MeshStandardMaterial({
            color: cuerpoColor,
            roughness: 0.8
        });

    const naranja =
        new THREE.MeshStandardMaterial({
            color: 0xff8a16,
            roughness: 0.7
        });

    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.78,
                24,
                18
            ),
            cuerpoMaterial
        );

    cuerpo.scale.set(
        1,
        1.12,
        0.92
    );

    cuerpo.position.y =
        0.85;

    cuerpo.castShadow =
        true;

    grupo.add(
        cuerpo
    );

    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.62,
                24,
                18
            ),
            cuerpoMaterial
        );

    cabeza.position.y =
        1.72;

    cabeza.castShadow =
        true;

    grupo.add(
        cabeza
    );

    // --------------------------------------------------------
    // CUELLO DE PLUMAS
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const pluma =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.20,
                    10,
                    7
                ),
                cuerpoMaterial
            );

        const angulo =
            (
                i / 9
            ) *
            Math.PI *
            2;

        pluma.scale.set(
            0.75,
            1.25,
            0.55
        );

        pluma.position.set(
            Math.cos(angulo) *
            0.43,
            1.38,
            Math.sin(angulo) *
            0.43
        );

        grupo.add(
            pluma
        );

    }

    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    if (
        tipo === "zombie"
    ) {

        crearOjoCerrado(
            grupo,
            -0.24
        );

        crearOjoCerrado(
            grupo,
            0.24
        );

    } else {

        crearOjoGrande(
            grupo,
            -0.24
        );

        crearOjoGrande(
            grupo,
            0.24
        );

    }

    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.18,
                0.35,
                4
            ),
            naranja
        );

    pico.rotation.x =
        -Math.PI / 2;

    pico.position.set(
        0,
        1.54,
        -0.60
    );

    grupo.add(
        pico
    );

    // --------------------------------------------------------
    // MEJILLAS
    // --------------------------------------------------------

    if (
        tipo !== "zombie"
    ) {

        crearMejilla(
            grupo,
            -0.43
        );

        crearMejilla(
            grupo,
            0.43
        );

    }

    crearAlas(
        grupo,
        cuerpoMaterial
    );

    crearCola(
        grupo,
        cuerpoMaterial
    );

    crearPatas(
        grupo,
        naranja
    );

    crearGorra(
        grupo
    );

    crearLetraN(
        grupo
    );

    if (
        tipo === "zombie"
    ) {

        crearZombieDetalles(
            grupo
        );

    }

    if (
        tipo === "pollito_noob"
    ) {

        crearPollitoEspecial(
            grupo
        );

    }

    grupo.scale.setScalar(
        0.72
    );

    return grupo;

}
// ============================================================
// OJO GRANDE
// ============================================================

function crearOjoGrande(
    grupo,
    x
) {

    const ojo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.14,
                14,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0x241710
            })
        );

    ojo.position.set(
        x,
        1.74,
        -0.57
    );

    grupo.add(
        ojo
    );

    const brillo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.045,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

    brillo.position.set(
        x - 0.045,
        1.80,
        -0.69
    );

    grupo.add(
        brillo
    );

}

// ============================================================
// OJO CERRADO
// ============================================================

function crearOjoCerrado(
    grupo,
    x
) {

    const ojo =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.105,
                0.022,
                6,
                14,
                Math.PI
            ),
            new THREE.MeshBasicMaterial({
                color: 0x39231d
            })
        );

    ojo.rotation.x =
        Math.PI / 2;

    ojo.position.set(
        x,
        1.74,
        -0.60
    );

    grupo.add(
        ojo
    );

}

// ============================================================
// MEJILLA
// ============================================================

function crearMejilla(
    grupo,
    x
) {

    const mejilla =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.09,
                10,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xf29b9b,
                transparent: true,
                opacity: 0.85
            })
        );

    mejilla.scale.x =
        1.5;

    mejilla.position.set(
        x,
        1.52,
        -0.58
    );

    grupo.add(
        mejilla
    );

}

// ============================================================
// ALAS
// ============================================================

function crearAlas(
    grupo,
    material
) {

    for (
        const lado of [-1, 1]
    ) {

        const ala =
            new THREE.Group();

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const pluma =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.24,
                        10,
                        8
                    ),
                    material
                );

            pluma.scale.set(
                0.75,
                1.4,
                0.5
            );

            pluma.position.set(
                lado *
                (
                    0.67 +
                    i * 0.05
                ),
                0.88 -
                i * 0.13,
                -0.12
            );

            pluma.rotation.z =
                lado *
                -0.4;

            ala.add(
                pluma
            );

        }

        grupo.add(
            ala
        );

    }

}

// ============================================================
// COLA
// ============================================================

function crearCola(
    grupo,
    material
) {

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const pluma =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.24,
                    10,
                    8
                ),
                material
            );

        pluma.scale.set(
            0.65,
            1.35,
            0.5
        );

        pluma.position.set(
            (
                i - 2
            ) * 0.17,
            0.82 +
            Math.abs(
                i - 2
            ) * 0.08,
            0.70
        );

        pluma.rotation.x =
            0.45;

        grupo.add(
            pluma
        );

    }

}

// ============================================================
// PATAS
// ============================================================

function crearPatas(
    grupo,
    material
) {

    for (
        const x of [-0.22, 0.22]
    ) {

        const pata =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.055,
                    0.075,
                    0.42,
                    8
                ),
                material
            );

        pata.position.set(
            x,
            0.17,
            0
        );

        grupo.add(
            pata
        );

        const pie =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13,
                    8,
                    6
                ),
                material
            );

        pie.scale.z =
            1.8;

        pie.position.set(
            x,
            0.035,
            -0.10
        );

        grupo.add(
            pie
        );

    }

        }
// ============================================================
// GORRA
// ============================================================

function crearGorra(
    grupo
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xf0b82e,
            roughness: 0.7
        });

    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.65,
                20,
                12
            ),
            material
        );

    gorra.scale.set(
        1.05,
        0.43,
        0.95
    );

    gorra.position.y =
        2.13;

    grupo.add(
        gorra
    );

    const visera =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.40,
                16,
                8
            ),
            material
        );

    visera.scale.set(
        1.35,
        0.15,
        0.62
    );

    visera.position.set(
        0,
        2.00,
        -0.43
    );

    grupo.add(
        visera
    );

}

// ============================================================
// N EN LA GORRA
// ============================================================

function crearLetraN(
    grupo
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x1d2747
        });

    const izquierda =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.075,
                0.34,
                0.035
            ),
            material
        );

    const derecha =
        izquierda.clone();

    const diagonal =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.075,
                0.39,
                0.035
            ),
            material
        );

    izquierda.position.set(
        -0.15,
        2.22,
        -0.60
    );

    derecha.position.set(
        0.15,
        2.22,
        -0.60
    );

    diagonal.position.set(
        0,
        2.22,
        -0.605
    );

    diagonal.rotation.z =
        -0.55;

    grupo.add(
        izquierda,
        derecha,
        diagonal
    );

}

// ============================================================
// ZOMBIE
// ============================================================

function crearZombieDetalles(
    grupo
) {

    const rosa =
        new THREE.MeshStandardMaterial({
            color: 0xf08fa2,
            roughness: 0.8
        });

    // Corazón/parche
    const parche =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.22,
                12,
                8
            ),
            rosa
        );

    parche.scale.set(
        1.25,
        0.95,
        0.35
    );

    parche.position.set(
        -0.46,
        0.82,
        -0.70
    );

    grupo.add(
        parche
    );

    // Parches pequeños
    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const p =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.14,
                    10,
                    7
                ),
                rosa
            );

        p.scale.z =
            0.35;

        p.position.set(
            0.25 +
            i * 0.16,
            0.65 +
            i * 0.17,
            -0.69
        );

        grupo.add(
            p
        );

    }

    // Costuras
    const hilo =
        new THREE.MeshBasicMaterial({
            color: 0xa53f62
        });

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const puntada =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.025,
                    0.15,
                    0.025
                ),
                hilo
            );

        puntada.rotation.z =
            0.65;

        puntada.position.set(
            -0.55 +
            i * 0.08,
            0.82 +
            i * 0.02,
            -0.83
        );

        grupo.add(
            puntada
        );

    }

}

// ============================================================
// POLLITO NOOB ESPECIAL
// ============================================================

function crearPollitoEspecial(
    grupo
) {

    // Estrella en pecho
    const estrella =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                0.20,
                5
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffd43b
            })
        );

    estrella.position.set(
        0,
        0.90,
        -0.78
    );

    grupo.add(
        estrella
    );

    // Arcoíris detrás
    const colores = [
        0xed2939,
        0xff8c22,
        0xffd633,
        0x36bd61,
        0x2b8fe8,
        0x8b58d5
    ];

    for (
        let i = 0;
        i < colores.length;
        i++
    ) {

        const arco =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.95 +
                    i * 0.07,
                    0.035,
                    6,
                    28,
                    Math.PI
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        colores[i]
                })
            );

        arco.rotation.x =
            Math.PI / 2;

        arco.rotation.z =
            Math.PI;

        arco.position.set(
            0,
            1.10,
            0.55
        );

        grupo.add(
            arco
        );

    }

            }
// ============================================================
// DIÁLOGOS
// ============================================================

const DIALOGOS = [

    [0, 0.3,
        "Micaela",
        "Mike... ¿dónde estamos?"
    ],

    [0, 1.4,
        "Mike",
        "No lo sé... pero este lugar está enorme."
    ],

    [1, 0.5,
        "Micaela",
        "Espera... ¿ves eso allá?"
    ],

    [1, 1.8,
        "Mike",
        "Sí... se ve algo entre los árboles."
    ],

    [1, 3.0,
        "Micaela",
        "Pío... pío... ¿qué fue eso?"
    ],

    [1, 4.0,
        "Mike",
        "¿Un pollo?"
    ],

    [1, 4.8,
        "Micaela",
        "Vamos a ver qué es."
    ],

    [2, 0.4,
        "Mike",
        "Mira... hay algo junto a ese huevo."
    ],

    [2, 1.5,
        "Micaela",
        "¿Un huevo? ¿De dónde salió?"
    ],

    [2, 2.4,
        "Mike",
        "No parece un huevo normal... está brillando."
    ],

    [2, 3.0,
        "Micaela",
        "¡Mike, está moviéndose!"
    ],

    [3, 0.3,
        "Mike",
        "¡Se está abriendo!"
    ],

    [3, 1.0,
        "Micaela",
        "¡¿Son pollos?!"
    ],

    [4, 0.5,
        "Mike",
        "¡Hay varios! ¿Cuál va a salir?"
    ],

    [4, 3.3,
        "Micaela",
        "¡Ya se decidió!"
    ],

    [5, 0.4,
        "Mike",
        "¡Ese fue el que salió!"
    ]

];

// ============================================================
// INTERFAZ
// ============================================================

function crearInterfazDialogo() {

    cajaDialogo =
        document.createElement(
            "div"
        );

    cajaDialogo.style.cssText = `
        position:fixed;
        left:50%;
        bottom:5%;
        transform:translateX(-50%);
        width:min(92%,720px);
        padding:15px 20px;
        background:rgba(0,0,0,.78);
        border:2px solid rgba(255,255,255,.28);
        border-radius:18px;
        color:white;
        font-family:Arial,sans-serif;
        z-index:9999;
        display:none;
        box-sizing:border-box;
    `;

    nombreDialogo =
        document.createElement(
            "div"
        );

    nombreDialogo.style.cssText = `
        font-weight:bold;
        font-size:18px;
        margin-bottom:6px;
    `;

    textoDialogo =
        document.createElement(
            "div"
        );

    textoDialogo.style.cssText = `
        font-size:17px;
        line-height:1.4;
    `;

    cajaDialogo.appendChild(
        nombreDialogo
    );

    cajaDialogo.appendChild(
        textoDialogo
    );

    document.body.appendChild(
        cajaDialogo
    );

}

// ============================================================
// DIÁLOGO
// ============================================================

function actualizarDialogo() {

    let encontrado =
        -1;

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

            encontrado =
                i;

        }

    }

    if (
        encontrado ===
        dialogoActual
    ) {

        return;

    }

    dialogoActual =
        encontrado;

    if (
        encontrado < 0
    ) {

        cajaDialogo.style.display =
            "none";

        return;

    }

    const d =
        DIALOGOS[
            encontrado
        ];

    cajaDialogo.style.display =
        "block";

    nombreDialogo.textContent =
        d[2];

    textoDialogo.textContent =
        d[3];

}

// ============================================================
// RESULTADO REAL
// ============================================================

function obtenerResultadoReal() {

    if (
        resultadoReal
    ) {

        return resultadoReal;

    }

    // ÚNICA TIRADA REAL
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

        pollo.visible =
            true;

        pollo.scale.setScalar(
            0.01
        );

        pollo.userData.anim =
            Math.random() * 5;

    }

    ruletaIndice =
        0;

    ruletaVueltas =
        0;

    ruletaTiempo =
        0;

    resultadoMostrado =
        false;

}

// ============================================================
// RULETA
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

        const escala =
            Math.min(
                0.85,
                pollo.scale.x +
                delta * 2.8
            );

        pollo.scale.setScalar(
            escala
        );

        pollo.userData.anim +=
            delta * 5;

        pollo.position.y =
            Math.abs(
                Math.sin(
                    pollo.userData.anim
                )
            ) * 0.08;

    }

    ruletaTiempo +=
        delta;

    // Se ralentiza gradualmente
    const intervalo =
        Math.min(
            0.58,
            0.10 +
            ruletaVueltas *
            0.035
        );

    if (
        ruletaTiempo >=
        intervalo
    ) {

        ruletaTiempo =
            0;

        ruletaIndice =
            (
                ruletaIndice +
                1
            ) % 3;

        if (
            ruletaIndice === 0
        ) {

            ruletaVueltas++;

        }

        resaltarPollo(
            ruletaIndice
        );

    }

}

// ============================================================
// RESALTAR
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

        if (
            !pollos[i]
        ) {
            continue;
        }

        pollos[i].scale.setScalar(
            i === indice
                ? 1.05
                : 0.75
        );

    }

                }
// ============================================================
// FINALIZAR RULETA
// ============================================================

function finalizarSeleccion() {

    if (
        resultadoMostrado
    ) {

        return;

    }

    obtenerResultadoReal();

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

    if (
        !ganador
    ) {

        return;

    }

    for (
        const pollo
        of Object.values(
            pollos
        )
    ) {

        if (
            pollo
        ) {

            pollo.visible =
                false;

        }

    }

    ganador.visible =
        true;

    ganador.scale.setScalar(
        1.08
    );

    ganador.position.y =
        0.05;

    resultadoMostrado =
        true;

}

// ============================================================
// GANADOR
// ============================================================

function animarGanador() {

    if (
        !resultadoMostrado
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

    if (
        !ganador
    ) {

        return;

    }

    ganador.scale.setScalar(
        1.05 +
        Math.sin(
            tiempoTotal * 5
        ) * 0.05
    );

    ganador.position.y =
        0.05 +
        Math.abs(
            Math.sin(
                tiempoTotal * 5
            )
        ) * 0.10;

}

// ============================================================
// ANIMAR HUEVO
// ============================================================

function actualizarHuevo() {

    if (
        !huevo
    ) {

        return;

    }

    if (
        fase === 2
    ) {

        huevo.visible =
            true;

        const pulso =
            1 +
            Math.sin(
                tiempoFase * 8
            ) * 0.035;

        huevo.scale.set(
            0.95 * pulso,
            1.10 * pulso,
            0.95 * pulso
        );

        huevo.rotation.y =
            Math.sin(
                tiempoFase * 2
            ) * 0.04;

        if (
            huevoBrillo
        ) {

            huevoBrillo.intensity =
                2.2 +
                Math.sin(
                    tiempoFase * 9
                ) *
                0.9;

        }

    }

    if (
        fase === 3
    ) {

        huevo.visible =
            true;

        const progreso =
            Math.min(
                tiempoFase /
                CONFIG.apertura,
                1
            );

        // El huevo se separa verticalmente
        huevo.scale.y =
            1.1 -
            progreso * 0.8;

        huevo.rotation.y +=
            0.025;

        if (
            huevoBrillo
        ) {

            huevoBrillo.intensity =
                3 +
                progreso * 4;

        }

    }

    if (
        fase >= 4
    ) {

        huevo.visible =
            false;

        if (
            huevoBrillo
        ) {

            huevoBrillo.intensity =
                0;

        }

    }

}

// ============================================================
// CÁMARA
// ============================================================

function actualizarCamara() {

    if (
        !camara
    ) {

        return;

    }

    let x = 0;
    let y = 3.4;
    let z = 11.5;

    let objetivoZ =
        2.2;

    if (
        fase === 0
    ) {

        objetivoZ =
            3.5;

    }

    if (
        fase === 1
    ) {

        objetivoZ =
            2.5;

    }

    if (
        fase === 2
    ) {

        // Un poco más cerca del huevo,
        // pero sin hacer zoom.
        x = 0;
        y = 2.8;
        z = 9.5;
        objetivoZ = 0;

    }

    if (
        fase === 3 ||
        fase === 4 ||
        fase === 5
    ) {

        x = 0;
        y = 3.0;
        z = 8.5;
        objetivoZ = -0.5;

    }

    camara.position.x +=
        (
            x -
            camara.position.x
        ) * 0.045;

    camara.position.y +=
        (
            y -
            camara.position.y
        ) * 0.045;

    camara.position.z +=
        (
            z -
            camara.position.z
        ) * 0.045;

    camara.lookAt(
        0,
        1.15,
        objetivoZ
    );

}

// ============================================================
// FASES
// ============================================================

function actualizarFases(
    delta
) {

    tiempoFase +=
        delta;

    // --------------------------------------------------------
    // INTRO
    // --------------------------------------------------------

    if (
        fase === 0 &&
        tiempoFase >=
        CONFIG.intro
    ) {

        fase = 1;
        tiempoFase = 0;

    }

    // --------------------------------------------------------
    // CAMINATA
    // --------------------------------------------------------

    if (
        fase === 1
    ) {

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

        if (
            tiempoFase >=
            CONFIG.caminata
        ) {

            detenerPersonaje(
                mike
            );

            detenerPersonaje(
                micaela
            );

            // Dejarlos exactamente junto al huevo
            if (
                mike
            ) {

                mike.position.z =
                    0.95;

            }

            if (
                micaela
            ) {

                micaela.position.z =
                    1.20;

            }

            fase = 2;
            tiempoFase = 0;

        }

    }

    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    if (
        fase === 2 &&
        tiempoFase >=
        CONFIG.huevo
    ) {

        fase = 3;
        tiempoFase = 0;

        // Resultado se decide ANTES
        // de la ruleta visual.
        obtenerResultadoReal();

    }

    // --------------------------------------------------------
    // APERTURA
    // --------------------------------------------------------

    if (
        fase === 3 &&
        tiempoFase >=
        CONFIG.apertura
    ) {

        mostrarPollos();

        fase = 4;
        tiempoFase = 0;

    }

    // --------------------------------------------------------
    // RULETA
    // --------------------------------------------------------

    if (
        fase === 4 &&
        tiempoFase >=
        CONFIG.ruleta
    ) {

        finalizarSeleccion();

        fase = 5;
        tiempoFase = 0;

    }

    // --------------------------------------------------------
    // RESULTADO
    // --------------------------------------------------------

    if (
        fase === 5 &&
        tiempoFase >=
        CONFIG.resultado
    ) {

        terminarCinematica();

    }

}

// ============================================================
// LOOP
// ============================================================

function actualizar() {

    if (
        !cinematicaActiva
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

    actualizarFases(
        delta
    );

    actualizarDialogo();

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

    actualizarHuevo();

    if (
        fase === 4
    ) {

        animarPollos(
            delta
        );

    }

    if (
        fase === 5
    ) {

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

    if (
        cinematicaActiva
    ) {

        return;

    }

    contenedorJuego =
        contenedor ||
        document.body;

    cinematicaActiva =
        true;

    cinematicaFinalizada =
        false;

    fase = 0;
    tiempoFase = 0;
    tiempoTotal = 0;

    resultadoReal =
        null;

    resultadoMostrado =
        false;

    dialogoActual =
        -1;

    crearEscena();

    crearInterfazDialogo();

    // Huevo 3D
    crearHuevo();

    // Pollos 3D ocultos
    crearPollos3D();

    // Personajes
    await cargarPersonajes();

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

    cinematicaActiva =
        false;

    cinematicaFinalizada =
        true;

    if (
        cajaDialogo
    ) {

        cajaDialogo.style.display =
            "none";

    }

    if (
        animacionID
    ) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID =
            null;

    }

}

// ============================================================
// DETENER
// ============================================================

export function detenerCinematica() {

    cinematicaActiva =
        false;

    if (
        animacionID
    ) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID =
            null;

    }

    if (
        cajaDialogo
    ) {

        cajaDialogo.remove();

        cajaDialogo =
            null;

    }

    if (
        renderer
    ) {

        renderer.dispose();

        if (
            renderer.domElement.parentNode
        ) {

            renderer.domElement
                .parentNode
                .removeChild(
                    renderer.domElement
                );

        }

    }

    window.removeEventListener(
        "resize",
        redimensionarCinematica
    );

    escena =
        null;

    camara =
        null;

    renderer =
        null;

    mike =
        null;

    micaela =
        null;

    huevo =
        null;

    polloNoob =
        null;

    polloZombie =
        null;

    polloNoobEspecial =
        null;

    huevoBrillo =
        null;

    mikeMixer =
        null;

    micaelaMixer =
        null;

}
