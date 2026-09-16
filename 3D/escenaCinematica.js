// ============================================================
// GAMERPRO GAME
// escenaCinematica.js
// CINEMÁTICA HUEVO NOOB - BOSQUE CERRADO + POLLOS 3D
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
// HUEVO
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
let ultimoCambioRuleta = 0;

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

const textureLoader =
    new THREE.TextureLoader();

// ============================================================
// ARCHIVOS
// ============================================================

const ARCHIVOS = {

    mike:
        "./3D/mike.glb",

    micaela:
        "./3D/micaela.glb",

    huevo:
        "./3D/huevo%20noob.png"

};

// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {

    velocidadMike: 2.1,
    velocidadMicaela: 2.1,

    distanciaFinal: 0.7,

    alturaMike: 0,
    alturaMicaela: 0,

    // CÁMARA NUEVA: MUCHO MÁS CERCANA
    alturaCamara: 2.35,
    distanciaCamara: 5.2,

    velocidadPasos: 7,

    duracionIntro: 2.0,
    duracionHuevo: 3.0,
    duracionApertura: 1.8,
    duracionSeleccion: 5.5,
    duracionResultado: 4.0

};

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
            10,
            30
        );

    // --------------------------------------------------------
    // CÁMARA CERCANA
    // --------------------------------------------------------

    camara =
        new THREE.PerspectiveCamera(
            48,
            window.innerWidth /
            window.innerHeight,
            0.1,
            80
        );

    camara.position.set(
        0,
        2.35,
        5.2
    );

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // LUCES
    // --------------------------------------------------------

    const ambiente =
        new THREE.HemisphereLight(
            0xe5f6d7,
            0x304525,
            2.6
        );

    escena.add(
        ambiente
    );

    const sol =
        new THREE.DirectionalLight(
            0xfff4d6,
            3.2
        );

    sol.position.set(
        -5,
        12,
        6
    );

    sol.castShadow =
        true;

    escena.add(
        sol
    );

    // --------------------------------------------------------
    // SUELO
    // --------------------------------------------------------

    const suelo =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                70,
                70
            ),
            new THREE.MeshStandardMaterial({
                color: 0x527a43,
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

    crearBosqueCerrado();

    window.addEventListener(
        "resize",
        redimensionarCinematica
    );

}

// ============================================================
// TRONCO
// ============================================================

function crearTronco(
    altura = 3
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x55351f,
            roughness: 1
        });

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.16,
                0.27,
                altura,
                7
            ),
            material
        );

    tronco.position.y =
        altura / 2;

    tronco.castShadow =
        true;

    return tronco;

}
// ============================================================
// PINO
// ============================================================

function crearPino(
    escala = 1
) {

    const grupo =
        new THREE.Group();

    const tronco =
        crearTronco(
            2.8
        );

    grupo.add(
        tronco
    );

    const materialPino =
        new THREE.MeshStandardMaterial({
            color: 0x245934,
            roughness: 1
        });

    // Tres niveles para que parezca más a un pino
    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const copa =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    1.25 -
                    i * 0.22,
                    1.9,
                    8
                ),
                materialPino
            );

        copa.position.y =
            2.0 +
            i * 0.72;

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
            color: 0x3e713e,
            roughness: 1
        });

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const bola =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.45 +
                    Math.random() * 0.22,
                    8,
                    6
                ),
                material
            );

        bola.position.set(
            (Math.random() - 0.5) *
            1.0,

            0.35 +
            Math.random() * 0.3,

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

function crearBosqueCerrado() {

    // Árboles de los lados
    for (
        let i = 0;
        i < 28;
        i++
    ) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const arbol =
            crearPino(
                0.9 +
                Math.random() * 0.55
            );

        arbol.position.set(
            lado *
            (
                4.2 +
                Math.random() * 1.8
            ),
            0,
            7 -
            i * 1.05
        );

        escena.add(
            arbol
        );

        // Arbustos debajo
        const arbusto =
            crearArbusto(
                0.8 +
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

    // Pared de árboles del fondo
    for (
        let i = 0;
        i < 16;
        i++
    ) {

        const arbol =
            crearPino(
                1.0 +
                Math.random() * 0.5
            );

        arbol.position.set(
            -7 +
            i * 0.9,
            0,
            -11 +
            Math.random() * 1.5
        );

        escena.add(
            arbol
        );

    }

    // Vegetación adicional para cerrar huecos
    for (
        let i = 0;
        i < 32;
        i++
    ) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const arbusto =
            crearArbusto(
                0.8 +
                Math.random() * 0.8
            );

        arbusto.position.set(
            lado *
            (
                3.8 +
                Math.random() * 3.0
            ),
            0,
            5 -
            i * 0.55
        );

        escena.add(
            arbusto
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

    if (mike) {

        mike.position.set(
            -1.15,
            0,
            5.4
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

    if (micaela) {

        micaela.position.set(
            1.15,
            0,
            5.7
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
// CARGAR GLB
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

        objeto.traverse(
            child => {

                if (
                    child.isMesh
                ) {

                    child.castShadow =
                        true;

                    child.receiveShadow =
                        true;

                }

            }
        );

        objeto.userData.animations =
            gltf.animations || [];

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
// EVITAR QUE MIKE/MICAELA QUEDEN ENTERRADOS
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
        mixer.clipAction(
            clip
        );

    accion.reset();
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
// CAMINATA PROCEDURAL
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

    personaje.position.z -=
        velocidad * delta;

    const tiempo =
        tiempoTotal *
        CONFIG.velocidadPasos;

    if (
        huesos.brazoIzq
    ) {

        huesos.brazoIzq.rotation.x =
            Math.sin(
                tiempo
            ) * 0.45;

    }

    if (
        huesos.brazoDer
    ) {

        huesos.brazoDer.rotation.x =
            Math.sin(
                tiempo +
                Math.PI
            ) * 0.45;

    }

    if (
        huesos.piernaIzq
    ) {

        huesos.piernaIzq.rotation.x =
            Math.sin(
                tiempo +
                Math.PI
            ) * 0.35;

    }

    if (
        huesos.piernaDer
    ) {

        huesos.piernaDer.rotation.x =
            Math.sin(
                tiempo
            ) * 0.35;

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
// HUEVO
// ============================================================

async function crearHuevo() {

    return new Promise(
        resolve => {

            textureLoader.load(

                "./3D/huevo%20noob.png",

                textura => {

                    textura.colorSpace =
                        THREE.SRGBColorSpace;

                    const material =
                        new THREE.MeshBasicMaterial({
                            map: textura,
                            transparent: true,
                            side:
                                THREE.DoubleSide
                        });

                    huevo =
                        new THREE.Mesh(
                            new THREE.PlaneGeometry(
                                1.8,
                                1.8
                            ),
                            material
                        );

                    huevo.position.set(
                        0,
                        0.95,
                        0
                    );

                    huevo.scale.y =
                        1.15;

                    huevo.userData.escalaX =
                        huevo.scale.x;

                    huevo.userData.escalaY =
                        huevo.scale.y;

                    huevo.visible =
                        false;

                    escena.add(
                        huevo
                    );

                    huevoBrillo =
                        new THREE.PointLight(
                            0xffe89a,
                            0,
                            5
                        );

                    huevoBrillo.position.set(
                        0,
                        1.2,
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

function crearHuevoRespaldo() {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xe8c36a
        });

    huevo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.7,
                20,
                16
            ),
            material
        );

    huevo.scale.y =
        1.25;

    huevo.position.y =
        0.8;

    huevo.visible =
        false;

    huevo.userData.escalaX =
        huevo.scale.x;

    huevo.userData.escalaY =
        huevo.scale.y;

    escena.add(
        huevo
    );

                    }
// ============================================================
// CREAR LOS 3 POLLOS
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

    polloNoob.position.set(
        -2.0,
        0,
        -1.0
    );

    polloZombie.position.set(
        0,
        0,
        -1.35
    );

    polloNoobEspecial.position.set(
        2.0,
        0,
        -1.0
    );

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

    const amarillo =
        new THREE.MeshStandardMaterial({
            color: 0xf4c94f,
            roughness: 0.9
        });

    const amarilloClaro =
        new THREE.MeshStandardMaterial({
            color: 0xffdf70,
            roughness: 0.9
        });

    const naranja =
        new THREE.MeshStandardMaterial({
            color: 0xff8b20
        });

    const negro =
        new THREE.MeshStandardMaterial({
            color: 0x202020
        });

    let cuerpoMat =
        amarillo;

    if (
        tipo === "zombie"
    ) {

        cuerpoMat =
            new THREE.MeshStandardMaterial({
                color: 0xc9e69a,
                roughness: 1
            });

    }

    // --------------------------------------------------------
    // CUERPO REDONDO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.72,
                18,
                14
            ),
            cuerpoMat
        );

    cuerpo.scale.set(
        1,
        1.08,
        0.88
    );

    cuerpo.position.y =
        0.82;

    grupo.add(
        cuerpo
    );

    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.57,
                18,
                14
            ),
            cuerpoMat
        );

    cabeza.position.y =
        1.65;

    grupo.add(
        cabeza
    );

    // --------------------------------------------------------
    // MECHÓN
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const mechon =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13,
                    8,
                    6
                ),
                amarilloClaro
            );

        mechon.scale.y =
            1.35;

        mechon.position.set(
            (i - 1) *
            0.13,
            2.08 +
            Math.abs(i - 1) *
            0.03,
            -0.03
        );

        grupo.add(
            mechon
        );

    }

    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    if (
        tipo !== "zombie"
    ) {

        crearOjoGrande(
            grupo,
            -0.22,
            1.68
        );

        crearOjoGrande(
            grupo,
            0.22,
            1.68
        );

    } else {

        crearOjoCerrado(
            grupo,
            -0.21,
            1.69
        );

        crearOjoCerrado(
            grupo,
            0.21,
            1.69
        );

    }

    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.16,
                0.30,
                4
            ),
            naranja
        );

    pico.rotation.x =
        -Math.PI / 2;

    pico.position.set(
        0,
        1.48,
        -0.54
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
            -0.40,
            1.48
        );

        crearMejilla(
            grupo,
            0.40,
            1.48
        );

    }

    crearAlas(
        grupo,
        cuerpoMat
    );

    crearCola(
        grupo,
        cuerpoMat
    );

    crearPatas(
        grupo,
        naranja
    );

    crearGorra(
        grupo,
        tipo
    );

    crearLetraN(
        grupo
    );

    if (
        tipo === "zombie"
    ) {

        crearParchesZombie(
            grupo
        );

    }

    if (
        tipo === "pollito_noob"
    ) {

        crearEstrella(
            grupo
        );

        crearArcoiris(
            grupo
        );

    }

    grupo.scale.setScalar(
        0.82
    );

    return grupo;

        }
// ============================================================
// OJO GRANDE
// ============================================================

function crearOjoGrande(
    grupo,
    x,
    y
) {

    const ojo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.115,
                12,
                10
            ),
            new THREE.MeshStandardMaterial({
                color: 0x19120e
            })
        );

    ojo.position.set(
        x,
        y,
        -0.52
    );

    grupo.add(
        ojo
    );

    const brillo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.035,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

    brillo.position.set(
        x - 0.035,
        y + 0.04,
        -0.625
    );

    grupo.add(
        brillo
    );

}

// ============================================================
// OJO CERRADO ZOMBIE
// ============================================================

function crearOjoCerrado(
    grupo,
    x,
    y
) {

    const ojo =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.10,
                0.018,
                6,
                12,
                Math.PI
            ),
            new THREE.MeshBasicMaterial({
                color: 0x38251f
            })
        );

    ojo.rotation.x =
        Math.PI / 2;

    ojo.position.set(
        x,
        y,
        -0.53
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
    x,
    y
) {

    const mejilla =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.075,
                8,
                6
            ),
            new THREE.MeshBasicMaterial({
                color: 0xf29b91,
                transparent: true,
                opacity: 0.85
            })
        );

    mejilla.scale.x =
        1.4;

    mejilla.position.set(
        x,
        y,
        -0.51
    );

    grupo.add(
        mejilla
    );

}

// ============================================================
// ALAS CON PLUMAS
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
            i < 4;
            i++
        ) {

            const pluma =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.25,
                        10,
                        8
                    ),
                    material
                );

            pluma.scale.set(
                0.75,
                1.35,
                0.45
            );

            pluma.position.set(
                lado *
                (
                    0.67 +
                    i * 0.06
                ),
                0.75 -
                i * 0.13,
                -0.02 -
                i * 0.03
            );

            pluma.rotation.z =
                lado *
                -0.35;

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
        i < 4;
        i++
    ) {

        const pluma =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.25,
                    9,
                    7
                ),
                material
            );

        pluma.scale.set(
            0.65,
            1.35,
            0.45
        );

        pluma.position.set(
            (i - 1.5) *
            0.16,
            0.78 +
            Math.abs(i - 1.5) *
            0.08,
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
            0.18,
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
            0.04,
            -0.08
        );

        grupo.add(
            pie
        );

    }

}
// ============================================================
// GORRA AMARILLA
// ============================================================

function crearGorra(
    grupo,
    tipo
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xe8b52f,
            roughness: 0.8
        });

    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.60,
                16,
                10
            ),
            material
        );

    gorra.scale.set(
        1.05,
        0.42,
        0.95
    );

    gorra.position.y =
        2.05;

    grupo.add(
        gorra
    );

    const visera =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                12,
                8
            ),
            material
        );

    visera.scale.set(
        1.25,
        0.16,
        0.55
    );

    visera.position.set(
        0,
        1.91,
        -0.43
    );

    grupo.add(
        visera
    );

}

// ============================================================
// LETRA N
// ============================================================

function crearLetraN(
    grupo
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x20243b
        });

    const barra1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.075,
                0.30,
                0.035
            ),
            material
        );

    const barra2 =
        barra1.clone();

    const diagonal =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.075,
                0.34,
                0.035
            ),
            material
        );

    barra1.position.set(
        -0.14,
        2.08,
        -0.56
    );

    barra2.position.set(
        0.14,
        2.08,
        -0.56
    );

    diagonal.position.set(
        0,
        2.08,
        -0.565
    );

    diagonal.rotation.z =
        -0.55;

    grupo.add(
        barra1,
        barra2,
        diagonal
    );

}

// ============================================================
// PARCHES ZOMBIE
// ============================================================

function crearParchesZombie(
    grupo
) {

    const rosa =
        new THREE.MeshStandardMaterial({
            color: 0xf08da0
        });

    const parche1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.19,
                10,
                8
            ),
            rosa
        );

    parche1.scale.x =
        1.35;

    parche1.position.set(
        -0.43,
        0.78,
        -0.58
    );

    grupo.add(
        parche1
    );

    const parche2 =
        parche1.clone();

    parche2.scale.set(
        1.2,
        0.8,
        0.5
    );

    parche2.position.set(
        0.30,
        0.53,
        -0.64
    );

    grupo.add(
        parche2
    );

    const parche3 =
        parche1.clone();

    parche3.scale.set(
        0.75,
        1.25,
        0.5
    );

    parche3.position.set(
        0.50,
        1.0,
        -0.48
    );

    grupo.add(
        parche3
    );

    // Costuras
    const costura =
        new THREE.MeshBasicMaterial({
            color: 0x9e4560
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
                    0.16,
                    0.025
                ),
                costura
            );

        puntada.rotation.z =
            0.6;

        puntada.position.set(
            -0.53 +
            i * 0.07,
            0.78 +
            i * 0.015,
            -0.73
        );

        grupo.add(
            puntada
        );

    }

}

// ============================================================
// ESTRELLA DEL POLLITO ESPECIAL
// ============================================================

function crearEstrella(
    grupo
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffd43b
        });

    const estrella =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                0.18,
                5
            ),
            material
        );

    estrella.position.set(
        0,
        0.78,
        -0.76
    );

    grupo.add(
        estrella
    );

}

// ============================================================
// ARCOIRIS DEL POLLITO ESPECIAL
// ============================================================

function crearArcoiris(
    grupo
) {

    const colores = [
        0xff3030,
        0xff941f,
        0xffd52f,
        0x42c95b,
        0x2697e8,
        0x8c55d9
    ];

    for (
        let i = 0;
        i < colores.length;
        i++
    ) {

        const arco =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.55 +
                    i * 0.10,
                    0.025,
                    6,
                    24,
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
            1.15,
            0.50
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

    [0, 0.5,
        "Micaela",
        "Mike... ¿dónde estamos?"
    ],

    [0, 1.7,
        "Mike",
        "No lo sé... pero este lugar está enorme."
    ],

    [1, 0.8,
        "Micaela",
        "Espera... ¿ves eso allá?"
    ],

    [1, 2.0,
        "Mike",
        "Sí... se ve algo entre los árboles."
    ],

    [1, 3.3,
        "Micaela",
        "Pío... pío... ¿qué fue eso?"
    ],

    [1, 4.4,
        "Mike",
        "¿Un pollo?"
    ],

    [1, 5.7,
        "Micaela",
        "Vamos a ver qué es."
    ],

    [1, 7.0,
        "Mike",
        "Mira... hay algo junto a ese huevo."
    ],

    [2, 0.5,
        "Micaela",
        "¿Un huevo? ¿De dónde salió?"
    ],

    [2, 1.7,
        "Mike",
        "No parece un huevo normal... está brillando."
    ],

    [2, 2.6,
        "Micaela",
        "¡Mike, está moviéndose!"
    ],

    [3, 0.5,
        "Mike",
        "¡Se está abriendo!"
    ],

    [3, 1.3,
        "Micaela",
        "¡¿Son pollos?!"
    ],

    [4, 0.6,
        "Mike",
        "¡Hay varios! ¿Cuál va a salir?"
    ],

    [4, 3.2,
        "Micaela",
        "¡Ya se decidió!"
    ],

    [5, 0.5,
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
        padding:16px 20px;
        background:rgba(0,0,0,.78);
        border:2px solid rgba(255,255,255,.3);
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
        margin-bottom:7px;
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
// ACTUALIZAR DIÁLOGO
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
        encontrado !==
        dialogoActual
    ) {

        dialogoActual =
            encontrado;

        if (
            encontrado >= 0
        ) {

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

        } else {

            cajaDialogo.style.display =
                "none";

        }

    }

}

// ============================================================
// RESULTADO REAL
// SOLO SE TIRA UNA VEZ
// ============================================================

function obtenerResultadoReal() {

    if (
        resultadoReal
    ) {
        return resultadoReal;
    }

    resultadoReal =
        abrirHuevo(
            "huevo_noob"
        );

    if (
        resultadoReal !== "noob" &&
        resultadoReal !== "zombie" &&
        resultadoReal !== "pollito_noob"
    ) {

        resultadoReal =
            "noob";

    }

    console.log(
        "[GAMERPRO] Resultado real:",
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
            0.05
        );

        pollo.userData.animTime =
            Math.random() * 3;

    }

    ruletaIndice =
        0;

    ruletaVueltas =
        0;

    ultimoCambioRuleta =
        0;

    resultadoMostrado =
        false;

}

// ============================================================
// RULETA VISUAL
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

        if (
            pollo.scale.x < 1
        ) {

            const escala =
                Math.min(
                    1,
                    pollo.scale.x +
                    delta * 4
                );

            pollo.scale.setScalar(
                escala
            );

        }

        pollo.userData.animTime +=
            delta * 4;

        const t =
            pollo.userData.animTime;

        pollo.position.y =
            Math.abs(
                Math.sin(t)
            ) * 0.10;

    }

    // Cambio de selección
    ultimoCambioRuleta +=
        delta;

    const intervalo =
        Math.min(
            0.55,
            0.12 +
            ruletaVueltas *
            0.025
        );

    if (
        ultimoCambioRuleta >=
        intervalo
    ) {

        ultimoCambioRuleta =
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

        pollo.scale.setScalar(
            i === indice
                ? 1.12
                : 0.82
        );

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

    if (!ganador) {
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

    ganador.visible =
        true;

    ganador.scale.setScalar(
        1.22
    );

    ganador.position.y =
        0.12;

    ganador.userData.ganador =
        true;

    resultadoMostrado =
        true;

}

// ============================================================
// ANIMAR GANADOR
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

    if (!ganador) {
        return;
    }

    ganador.scale.setScalar(
        1.20 +
        Math.sin(
            tiempoTotal * 5
        ) * 0.05
    );

    ganador.position.y =
        0.12 +
        Math.abs(
            Math.sin(
                tiempoTotal * 5
            )
        ) * 0.10;

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

        huevo.visible =
            true;

        const pulso =
            1 +
            Math.sin(
                tiempoFase * 8
            ) * 0.08;

        huevo.scale.x =
            huevo.userData.escalaX *
            pulso;

        huevo.scale.y =
            huevo.userData.escalaY *
            pulso;

        huevo.rotation.z =
            Math.sin(
                tiempoFase * 5
            ) * 0.05;

        if (
            huevoBrillo
        ) {

            huevoBrillo.intensity =
                1.5 +
                Math.sin(
                    tiempoFase * 10
                ) * 0.8;

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
                CONFIG.duracionApertura,
                1
            );

        huevo.scale.y =
            huevo.userData.escalaY *
            Math.max(
                0.05,
                1 -
                progreso * 0.9
            );

        huevo.rotation.z =
            Math.sin(
                tiempoFase * 15
            ) * 0.12;

        if (
            huevoBrillo
        ) {

            huevoBrillo.intensity =
                2 +
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
// CÁMARA CINEMÁTICA
// ============================================================

function actualizarCamara() {

    if (!camara) {
        return;
    }

    let x = 0;
    let y = 1.25;
    let z = 3.0;

    let objetivoX = 0;
    let objetivoY = 1.15;
    let objetivoZ = 1.0;

    if (
        fase === 0 ||
        fase === 1
    ) {

        // CERCA DE MIKE Y MICAELA
        x = 0;
        y = 2.15;
        z = 5.0;

        objetivoZ =
            fase === 1
                ? 2.7
                : 3.7;

    }

    if (
        fase === 2 ||
        fase === 3
    ) {

        // ACERCAMIENTO AL HUEVO
        x = 0;
        y = 1.85;
        z = 3.6;

        objetivoY =
            1.0;

        objetivoZ =
            0;

    }

    if (
        fase === 4 ||
        fase === 5
    ) {

        // POLLOS GRANDES EN PANTALLA
        x = 0;
        y = 1.75;
        z = 4.0;

        objetivoY =
            0.95;

        objetivoZ =
            -1.0;

    }

    camara.position.x +=
        (x - camara.position.x) *
        0.06;

    camara.position.y +=
        (y - camara.position.y) *
        0.06;

    camara.position.z +=
        (z - camara.position.z) *
        0.06;

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

    tiempoFase =
        0;

    dialogoActual =
        -1;

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
// FASES
// ============================================================

function actualizarFases(
    delta
) {

    tiempoFase +=
        delta;

    if (
        fase === 0 &&
        tiempoFase >=
        CONFIG.duracionIntro
    ) {

        cambiarFase(1);

    }

    if (
        fase === 1
    ) {

        if (
            mike &&
            micaela &&
            mike.position.z <=
                CONFIG.distanciaFinal &&
            micaela.position.z <=
                CONFIG.distanciaFinal
        ) {

            detenerPersonaje(
                mike
            );

            detenerPersonaje(
                micaela
            );

            cambiarFase(2);

        }

        // Seguridad por si algún GLB no avanza
        if (
            tiempoFase >= 8.5
        ) {

            detenerPersonaje(
                mike
            );

            detenerPersonaje(
                micaela
            );

            cambiarFase(2);

        }

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
        CONFIG.duracionSeleccion
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

    }

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

    dialogoActual =
        -1;

    resultadoReal =
        null;

    resultadoMostrado =
        false;

    ruletaIndice =
        0;

    ruletaVueltas =
        0;

    crearEscena();

    crearInterfazDialogo();

    // Crear loop primero
    reloj =
        new THREE.Clock();

    animacionID =
        requestAnimationFrame(
            actualizar
        );

    await cargarPersonajes();

    await crearHuevo();

    crearPollos3D();

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

    window.removeEventListener(
        "resize",
        redimensionarCinematica
    );

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

    huevoBrillo =
        null;

    polloNoob =
        null;

    polloZombie =
        null;

    polloNoobEspecial =
        null;

    mikeMixer =
        null;

    micaelaMixer =
        null;

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
// RESULTADO
// ============================================================

export function obtenerResultadoCinematica() {

    return resultadoReal;

}

// ============================================================
// MOSTRAR RESULTADO FINAL
// ============================================================

export function mostrarResultadoFinal() {

    finalizarSeleccion();

            }
