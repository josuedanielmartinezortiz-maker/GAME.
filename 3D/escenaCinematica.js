// ============================================================
// GAMERPRO GAME
// escenaCinematica.js
// CINEMÁTICA HUEVO NOOB - RECONSTRUIDA
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
        "./3D/huevo%20noob.png",

    pollitoNoob:
        "./3D/pollito%20noob.png",

    zombie:
        "./3D/zombie.png"

};


// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {

    velocidadMike: 2.7,

    velocidadMicaela: 2.7,

    distanciaFinal: 0.45,

    alturaMike: 0,

    alturaMicaela: 0.12,

    alturaCamara: 3.1,

    distanciaCamara: 8,

    duracionIntro: 2.5,

    duracionHuevo: 3,

    duracionApertura: 1.8,

    duracionSeleccion: 4.5,

    duracionResultado: 4

};


// ============================================================
// ROTACIÓN
// ============================================================

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
            0x7fa56a
        );


    // --------------------------------------------------------
    // NIEBLA
    // --------------------------------------------------------

    escena.fog =
        new THREE.Fog(
            0x7fa56a,
            12,
            42
        );


    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    camara =
        new THREE.PerspectiveCamera(
            55,
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
    // LUZ
    // --------------------------------------------------------

    const luzAmbiente =
        new THREE.HemisphereLight(
            0xdff5ff,
            0x405030,
            2.4
        );

    escena.add(
        luzAmbiente
    );


    const luzSol =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    luzSol.position.set(
        5,
        12,
        6
    );

    luzSol.castShadow =
        true;

    escena.add(
        luzSol
    );


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
                color: 0x5f8a4c
            })
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow =
        true;

    escena.add(
        suelo
    );


    // --------------------------------------------------------
    // BOSQUE
    // --------------------------------------------------------

    crearBosque();


    // --------------------------------------------------------
    // RESIZE
    // --------------------------------------------------------

    window.addEventListener(
        "resize",
        redimensionarCinematica
    );
}


// ============================================================
// BOSQUE
// ============================================================

function crearBosque() {

    const materialTronco =
        new THREE.MeshStandardMaterial({
            color: 0x54351f
        });

    const materialPino =
        new THREE.MeshStandardMaterial({
            color: 0x285b36
        });


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const grupo =
            new THREE.Group();


        const tronco =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.10,
                    0.18,
                    2.2,
                    7
                ),
                materialTronco
            );

        tronco.position.y =
            1.1;


        const copa =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.9,
                    2.4,
                    8
                ),
                materialPino
            );

        copa.position.y =
            2.8;


        grupo.add(
            tronco
        );

        grupo.add(
            copa
        );


        const lado =
            i % 2 === 0
                ? -1
                : 1;

        grupo.position.set(
            lado *
            (4 + Math.random() * 10),
            0,
            -i * 1.3 -
            2
        );

        grupo.scale.setScalar(
            0.7 +
            Math.random() * 0.8
        );


        escena.add(
            grupo
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
            -1.2,
            CONFIG.alturaMike,
            5
        );

        mike.rotation.y =
            ROTACION_PERSONAJES;

        mike.scale.setScalar(
            1
        );

        escena.add(
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


    // --------------------------------------------------------
    // MICAELA
    // --------------------------------------------------------

    if (micaela) {

        micaela.position.set(
            1.2,
            CONFIG.alturaMicaela,
            5.4
        );

        micaela.rotation.y =
            ROTACION_PERSONAJES;

        micaela.scale.setScalar(
            1
        );

        escena.add(
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
            (child) => {

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

    } catch (error) {

        console.error(
            "[GAMERPRO] No se pudo cargar:",
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

        console.log(
            "[GAMERPRO] " +
            nombre +
            " no tiene clips."
        );

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
// BUSCAR HUESOS
// ============================================================

function buscarHuesos(
    personaje
) {

    const huesos = {};


    personaje.traverse(
        (obj) => {

            if (
                !obj.isBone
            ) {
                return;
            }


            const nombre =
                obj.name.toLowerCase();


            if (
                /hip|pelvis|cadera/.test(
                    nombre
                )
            ) {
                huesos.cadera =
                    obj;
            }


            if (
                /spine|columna|chest|pecho/.test(
                    nombre
                )
            ) {
                huesos.torso =
                    obj;
            }


            if (
                /head|cabeza/.test(
                    nombre
                )
            ) {
                huesos.cabeza =
                    obj;
            }


            if (
                /left.*upper.*arm|upper.*arm.*left|brazo.*izq/i
                    .test(
                        obj.name
                    )
            ) {
                huesos.brazoIzq =
                    obj;
            }


            if (
                /right.*upper.*arm|upper.*arm.*right|brazo.*der/i
                    .test(
                        obj.name
                    )
            ) {
                huesos.brazoDer =
                    obj;
            }


            if (
                /left.*thigh|thigh.*left|upper.*leg.*left|pierna.*izq/i
                    .test(
                        obj.name
                    )
            ) {
                huesos.piernaIzq =
                    obj;
            }


            if (
                /right.*thigh|thigh.*right|upper.*leg.*right|pierna.*der/i
                    .test(
                        obj.name
                    )
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

    if (!personaje) {
        return;
    }


    // Avanzar hacia el huevo
    personaje.position.z -=
        velocidad * delta;


    const tiempo =
        tiempoTotal *
        CONFIG.velocidadPasos;


    // --------------------------------------------------------
    // Brazos
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Piernas
    // --------------------------------------------------------

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

        accion.paused =
            true;
    }
}


// ============================================================
// MIRAR A CÁMARA
// ============================================================

function mirarCamara(
    objeto
) {

    if (
        !objeto ||
        !camara
    ) {
        return;
    }


    const posicion =
        new THREE.Vector3();


    camara.getWorldPosition(
        posicion
    );


    objeto.lookAt(
        posicion.x,
        objeto.position.y,
        posicion.z
    );
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
                            side:
                                THREE.DoubleSide
                        });


                    huevo =
                        new THREE.Mesh(
                            new THREE.PlaneGeometry(
                                2.0,
                                2.0
                            ),
                            material
                        );


                    huevo.position.set(
                        0,
                        1.05,
                        0
                    );


                    huevo.scale.set(
                        1,
                        1.15,
                        1
                    );


                    huevo.userData.escalaX =
                        huevo.scale.x;

                    huevo.userData.escalaY =
                        huevo.scale.y;


                    huevo.visible =
                        false;


                    escena.add(
                        huevo
                    );


                    // ------------------------------------------------
                    // BRILLO
                    // ------------------------------------------------

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

                (error) => {

                    console.error(
                        "[GAMERPRO] Error huevo:",
                        error
                    );


                    // Crear huevo de respaldo
                    crearHuevoRespaldo();

                    resolve();
                }
            );
        }
    );
}


// ============================================================
// HUEVO DE RESPALDO
// ============================================================

function crearHuevoRespaldo() {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xe8c36a
        });


    huevo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.8,
                20,
                16
            ),
            material
        );


    huevo.scale.y =
        1.25;


    huevo.position.set(
        0,
        1,
        0
    );


    huevo.visible =
        false;


    huevo.userData.escalaX =
        huevo.scale.x;

    huevo.userData.escalaY =
        huevo.scale.y;


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


    polloNoob.position.set(
        -2.2,
        0,
        -1.2
    );


    polloZombie.position.set(
        0,
        0,
        -1.5
    );


    polloNoobEspecial.position.set(
        2.2,
        0,
        -1.2
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
// POLLO 3D
// ============================================================

function crearPollo3D(
    tipo
) {

    const grupo =
        new THREE.Group();


    let colorCuerpo =
        0x8fa68e;


    if (
        tipo === "zombie"
    ) {

        colorCuerpo =
            0x64735f;
    }


    if (
        tipo === "pollito_noob"
    ) {

        colorCuerpo =
            0xf5d5b8;
    }


    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.55,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color:
                    colorCuerpo
            })
        );


    cuerpo.scale.set(
        1,
        1.15,
        0.9
    );


    cuerpo.position.y =
        0.75;


    grupo.add(
        cuerpo
    );


    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.45,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color:
                    colorCuerpo
            })
        );


    cabeza.position.y =
        1.55;


    grupo.add(
        cabeza
    );


    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    const colorOjos =
        tipo === "zombie"
            ? 0xff2020
            : 0x111111;


    const materialOjos =
        new THREE.MeshBasicMaterial({
            color:
                colorOjos
        });


    const ojoIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.075,
                8,
                8
            ),
            materialOjos
        );


    const ojoDer =
        ojoIzq.clone();


    ojoIzq.position.set(
        -0.17,
        1.62,
        -0.40
    );


    ojoDer.position.set(
        0.17,
        1.62,
        -0.40
    );


    grupo.add(
        ojoIzq
    );

    grupo.add(
        ojoDer
    );


    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.12,
                0.28,
                4
            ),
            new THREE.MeshStandardMaterial({
                color:
                    0xffa62b
            })
        );


    pico.rotation.x =
        -Math.PI / 2;


    pico.position.set(
        0,
        1.48,
        -0.48
    );


    grupo.add(
        pico
    );


    // --------------------------------------------------------
    // ALAS
    // --------------------------------------------------------

    const materialAlas =
        new THREE.MeshStandardMaterial({
            color:
                colorCuerpo
        });


    const alaIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.28,
                10,
                8
            ),
            materialAlas
        );


    const alaDer =
        alaIzq.clone();


    alaIzq.scale.set(
        0.5,
        1,
        0.7
    );


    alaDer.scale.copy(
        alaIzq.scale
    );


    alaIzq.position.set(
        -0.55,
        0.8,
        0
    );


    alaDer.position.set(
        0.55,
        0.8,
        0
    );


    grupo.add(
        alaIzq
    );

    grupo.add(
        alaDer
    );


    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    crearPata(
        grupo,
        -0.18
    );

    crearPata(
        grupo,
        0.18
    );


    // --------------------------------------------------------
    // GORRA
    // --------------------------------------------------------

    crearGorra(
        grupo,
        tipo
    );


    // --------------------------------------------------------
    // N
    // --------------------------------------------------------

    crearLetraN(
        grupo
    );


    // --------------------------------------------------------
    // ZOMBIE
    // --------------------------------------------------------

    if (
        tipo === "zombie"
    ) {

        crearOjosZombie(
            grupo
        );
    }


    // --------------------------------------------------------
    // POLLITO ESPECIAL
    // --------------------------------------------------------

    if (
        tipo === "pollito_noob"
    ) {

        crearDecoracionRainbow(
            grupo
        );
    }


    grupo.userData.animTime =
        Math.random() * 5;


    return grupo;
}


// ============================================================
// PATA
// ============================================================

function crearPata(
    grupo,
    x
) {

    const material =
        new THREE.MeshStandardMaterial({
            color:
                0xffa62b
        });


    const pata =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.055,
                0.07,
                0.38,
                8
            ),
            material
        );


    pata.position.set(
        x,
        0.28,
        0
    );


    grupo.add(
        pata
    );


    const pie =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.10,
                8,
                8
            ),
            material
        );


    pie.scale.z =
        1.5;


    pie.position.set(
        x,
        0.08,
        -0.10
    );


    grupo.add(
        pie
    );
}
// ============================================================
// GORRA
// ============================================================

function crearGorra(
    grupo,
    tipo
) {

    let color =
        0xe8c36a;


    if (
        tipo === "zombie"
    ) {

        color =
            0x596b62;
    }


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
        0.32,
        0.90
    );


    gorra.position.y =
        1.95;


    grupo.add(
        gorra
    );


    const visera =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                0.08,
                0.28
            ),
            material
        );


    visera.position.set(
        0,
        1.88,
        -0.32
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
            color:
                0x222222
        });


    const barra1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.07,
                0.28,
                0.03
            ),
            material
        );


    const barra2 =
        barra1.clone();


    const diagonal =
        barra1.clone();


    barra1.position.set(
        -0.11,
        1.89,
        -0.52
    );


    barra2.position.set(
        0.11,
        1.89,
        -0.52
    );


    diagonal.position.set(
        0,
        1.89,
        -0.53
    );


    diagonal.rotation.z =
        -0.6;


    grupo.add(
        barra1
    );

    grupo.add(
        barra2
    );

    grupo.add(
        diagonal
    );
}


// ============================================================
// OJOS ZOMBIE
// ============================================================

function crearOjosZombie(
    grupo
) {

    const material =
        new THREE.MeshBasicMaterial({
            color:
                0xff2020
        });


    const ojo1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.08,
                8,
                8
            ),
            material
        );


    const ojo2 =
        ojo1.clone();


    ojo1.position.set(
        -0.18,
        1.65,
        -0.50
    );


    ojo2.position.set(
        0.18,
        1.65,
        -0.50
    );


    grupo.add(
        ojo1
    );

    grupo.add(
        ojo2
    );
}


// ============================================================
// RAINBOW
// ============================================================

function crearDecoracionRainbow(
    grupo
) {

    const colores = [
        0xff3b30,
        0xff9500,
        0xffcc00,
        0x34c759,
        0x007aff,
        0xaf52de
    ];


    for (
        let i = 0;
        i < colores.length;
        i++
    ) {

        const aro =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.18 +
                    i * 0.035,
                    0.025,
                    6,
                    12,
                    Math.PI
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        colores[i]
                })
            );


        aro.rotation.x =
            Math.PI / 2;


        aro.position.set(
            0,
            2.05,
            -0.05
        );


        grupo.add(
            aro
        );
    }
}
// ============================================================
// DIÁLOGOS
// ============================================================

const DIALOGOS = [

    [0, 0.5, "Micaela",
        "Mike... ¿dónde estamos?"],

    [0, 1.7, "Mike",
        "No lo sé... pero este lugar está enorme."],

    [1, 0.8, "Micaela",
        "Espera... ¿ves eso allá?"],

    [1, 2.0, "Mike",
        "Sí... se ve algo entre los árboles."],

    [1, 3.3, "Micaela",
        "Pío... pío... ¿qué fue eso?"],

    [1, 4.4, "Mike",
        "¿Un pollo?"],

    [1, 5.7, "Micaela",
        "Vamos a ver qué es."],

    [1, 7.0, "Mike",
        "Mira... hay algo junto a ese huevo."],

    [2, 0.5, "Micaela",
        "¿Un huevo? ¿De dónde salió?"],

    [2, 1.7, "Mike",
        "No parece un huevo normal... está brillando."],

    [2, 2.6, "Micaela",
        "¡Mike, está moviéndose!"],

    [3, 0.5, "Mike",
        "¡Se está abriendo!"],

    [3, 1.3, "Micaela",
        "¡¿Son pollos?!"],

    [4, 0.6, "Mike",
        "¡Hay varios! ¿Cuál va a salir?"],

    [4, 3.2, "Micaela",
        "¡Ya se decidió!"],

    [5, 0.5, "Mike",
        "¡Ese fue el que salió!"]
];


// ============================================================
// CREAR DIÁLOGO
// ============================================================

function crearInterfazDialogo() {

    cajaDialogo =
        document.createElement(
            "div"
        );


    cajaDialogo.style.cssText =
        `
        position:fixed;
        left:50%;
        bottom:5%;
        transform:translateX(-50%);
        width:min(90%,720px);
        padding:18px 22px;
        background:rgba(0,0,0,.78);
        border:2px solid rgba(255,255,255,.25);
        border-radius:18px;
        color:white;
        font-family:Arial,sans-serif;
        z-index:9999;
        box-sizing:border-box;
        display:none;
        `;


    nombreDialogo =
        document.createElement(
            "div"
        );


    nombreDialogo.style.cssText =
        `
        font-weight:bold;
        font-size:18px;
        margin-bottom:7px;
        `;


    textoDialogo =
        document.createElement(
            "div"
        );


    textoDialogo.style.cssText =
        `
        font-size:17px;
        line-height:1.4;
        `;


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

    if (
        !cajaDialogo
    ) {
        return;
    }


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
        encontrado !== -1 &&
        encontrado !== dialogoActual
    ) {

        dialogoActual =
            encontrado;


        const d =
            DIALOGOS[
                encontrado
            ];


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

    if (
        resultadoReal
    ) {

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


        pollo.visible =
            true;


        pollo.scale.setScalar(
            0.05
        );


        pollo.userData.animTime =
            Math.random() * 5;
    }


    resultadoMostrado =
        false;
}


// ============================================================
// ANIMAR POLLOS
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
            delta * 5;


        const t =
            pollo.userData.animTime;


        pollo.position.y =
            Math.abs(
                Math.sin(t)
            ) * 0.15;


        pollo.rotation.y =
            Math.sin(
                t * 0.8
            ) * 0.15;
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

        console.warn(
            "[GAMERPRO] Resultado inválido:",
            resultadoReal
        );


        // Seguridad
        resultadoReal =
            "noob";


        finalizarSeleccion();

        return;
    }


    // SOLO EL GANADOR QUEDA VISIBLE
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
        1.25
    );


    ganador.position.y =
        0.18;


    ganador.userData.ganador =
        true;


    resultadoMostrado =
        true;


    console.log(
        "[GAMERPRO] Ganador final:",
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


    ganador.visible =
        true;


    ganador.scale.setScalar(
        1.22 +
        Math.sin(
            tiempoTotal * 5
        ) * 0.06
    );


    ganador.position.y =
        0.18 +
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


    mirarCamara(
        huevo
    );


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
            ) * 0.04;


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
        fase === 2 &&
        huevo
    ) {

        huevo.visible =
            true;
    }


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

    } else {

        detenerPersonaje(
            mike
        );

        detenerPersonaje(
            micaela
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
// CÁMARA
// ============================================================

function actualizarCamara() {

    if (!camara) {
        return;
    }


    const objetivoZ =
        fase >= 2
            ? -1
            : 3;


    camara.position.x +=
        (
            0 -
            camara.position.x
        ) * 0.025;


    camara.position.y +=
        (
            CONFIG.alturaCamara -
            camara.position.y
        ) * 0.025;


    camara.position.z +=
        (
            CONFIG.distanciaCamara -
            camara.position.z
        ) * 0.025;


    camara.lookAt(
        0,
        1.3,
        objetivoZ
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


    // IMPORTANTE:
    // La escena se crea ANTES de cargar modelos.

    crearEscena();


    crearInterfazDialogo();


    // Si un modelo falla, cargarPersonajes()
    // devuelve null y la escena continúa.

    await cargarPersonajes();


    if (mike) {

        mike.rotation.y =
            ROTACION_PERSONAJES;
    }


    if (micaela) {

        micaela.rotation.y =
            ROTACION_PERSONAJES;
    }


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


    resultadoReal =
        null;

    resultadoMostrado =
        false;
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
// FORZAR GANADOR
// ============================================================

export function mostrarResultadoFinal() {

    finalizarSeleccion();
    }
