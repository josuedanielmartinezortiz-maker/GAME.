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

let mikeHuesos = {};
let micaelaHuesos = {};


// ============================================================
// POLLOS
// ============================================================

let polloNoob = null;
let polloZombie = null;
let polloNoobEspecial = null;

let resultadoReal = null;


// ============================================================
// HUEVO
// ============================================================

let huevo = null;
let huevoBrillo = null;


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

    velocidadMike: 2.8,

    velocidadMicaela: 2.8,

    velocidadPasos: 12,

    distanciaFinal: 0.35,

    alturaCamara: 3.1,

    distanciaCamara: 8,

    duracionIntro: 2.5,

    duracionSeleccion: 4.5,

    duracionResultado: 4

};


// ============================================================
// RESULTADO
// ============================================================

export function establecerResultadoCinematica(resultado) {

    resultadoReal = resultado;

}


export function cinematicaTerminada() {

    return cinematicaFinalizada;

}
// ============================================================
// ESCENA
// ============================================================

function crearEscena() {

    escena = new THREE.Scene();

    escena.background = new THREE.Color(0x07140b);

    escena.fog = new THREE.FogExp2(
        0x07140b,
        0.025
    );


    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    camara = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camara.position.set(
        0,
        CONFIG.alturaCamara,
        CONFIG.distanciaCamara
    );

    camara.lookAt(
        0,
        1.2,
        0
    );


    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    contenedorJuego =
        contenedorJuego || document.body;

    contenedorJuego.appendChild(
        renderer.domElement
    );


    // --------------------------------------------------------
    // LUCES
    // --------------------------------------------------------

    const luzAmbiente =
        new THREE.HemisphereLight(
            0xb9d8ff,
            0x19351c,
            2.2
        );

    escena.add(luzAmbiente);


    const luzSol =
        new THREE.DirectionalLight(
            0xffffff,
            2.4
        );

    luzSol.position.set(
        -5,
        12,
        7
    );

    escena.add(luzSol);


    const luzBosque =
        new THREE.PointLight(
            0x6fbf72,
            2,
            25
        );

    luzBosque.position.set(
        0,
        3,
        0
    );

    escena.add(luzBosque);


    // --------------------------------------------------------
    // SUELO
    // --------------------------------------------------------

    crearBosque();


    // --------------------------------------------------------
    // EVENTO REDIMENSIONAR
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

    const sueloGeo =
        new THREE.CircleGeometry(
            35,
            64
        );

    const sueloMat =
        new THREE.MeshStandardMaterial({
            color: 0x183b20,
            roughness: 1
        });

    const suelo =
        new THREE.Mesh(
            sueloGeo,
            sueloMat
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.position.y = -0.03;

    escena.add(suelo);


    // --------------------------------------------------------
    // PINOS
    // --------------------------------------------------------

    for (let i = 0; i < 85; i++) {

        const angulo =
            Math.random() * Math.PI * 2;

        const distancia =
            7 + Math.random() * 22;

        const x =
            Math.cos(angulo) * distancia;

        const z =
            Math.sin(angulo) * distancia;


        // dejamos libre el camino
        if (
            Math.abs(x) < 5 &&
            z > -3 &&
            z < 14
        ) {
            continue;
        }


        crearPino(
            x,
            z,
            0.7 + Math.random() * 0.9
        );
    }


    // --------------------------------------------------------
    // HIERBA
    // --------------------------------------------------------

    for (let i = 0; i < 140; i++) {

        const x =
            (Math.random() - 0.5) * 55;

        const z =
            (Math.random() - 0.5) * 50;

        crearHierba(x, z);
    }


    // --------------------------------------------------------
    // ROCAS
    // --------------------------------------------------------

    for (let i = 0; i < 35; i++) {

        const x =
            (Math.random() - 0.5) * 45;

        const z =
            (Math.random() - 0.5) * 40;

        crearRoca(x, z);
    }
}


// ============================================================
// PINO
// ============================================================

function crearPino(x, z, escala) {

    const grupo =
        new THREE.Group();


    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.18,
                0.28,
                2.2,
                7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x54351f
            })
        );

    tronco.position.y = 1.1;

    grupo.add(tronco);


    const materialHojas =
        new THREE.MeshStandardMaterial({
            color: 0x174c2a
        });


    for (let i = 0; i < 3; i++) {

        const hojas =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    1.25 - i * 0.15,
                    2.2,
                    8
                ),
                materialHojas
            );

        hojas.position.y =
            2.1 + i * 0.9;

        grupo.add(hojas);
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
// HIERBA
// ============================================================

function crearHierba(x, z) {

    const geo =
        new THREE.ConeGeometry(
            0.035,
            0.45 + Math.random() * 0.35,
            4
        );

    const mat =
        new THREE.MeshStandardMaterial({
            color: 0x397343
        });

    const hierba =
        new THREE.Mesh(
            geo,
            mat
        );

    hierba.position.set(
        x,
        0.2,
        z
    );

    escena.add(hierba);
}


// ============================================================
// ROCA
// ============================================================

function crearRoca(x, z) {

    const roca =
        new THREE.Mesh(
            new THREE.DodecahedronGeometry(
                0.25 + Math.random() * 0.35
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4d594f
            })
        );

    roca.position.set(
        x,
        0.25,
        z
    );

    roca.scale.y =
        0.5 + Math.random() * 0.4;

    escena.add(roca);
}
// ============================================================
// CARGAR PERSONAJES
// ============================================================

async function cargarPersonajes() {

    try {

        const [mikeGLTF, micaelaGLTF] =
            await Promise.all([

                cargarGLB(
                    ARCHIVOS.mike
                ),

                cargarGLB(
                    ARCHIVOS.micaela
                )

            ]);


        mike =
            mikeGLTF.scene;

        micaela =
            micaelaGLTF.scene;


        prepararPersonaje(
            mike,
            0x88aa88
        );

        prepararPersonaje(
            micaela,
            0x88aa88
        );


        mike.position.set(
            -0.9,
            0,
            8
        );

        micaela.position.set(
            0.9,
            0,
            8.35
        );


        // ----------------------------------------------------
        // AJUSTE AUTOMÁTICO DE PIES
        // ----------------------------------------------------

        colocarPiesEnSuelo(
            mike
        );

        colocarPiesEnSuelo(
            micaela
        );


        // pequeño ajuste independiente
        micaela.position.y -= 0.03;


        escena.add(mike);
        escena.add(micaela);


        mikeHuesos =
            encontrarHuesos(mike);

        micaelaHuesos =
            encontrarHuesos(micaela);


    } catch (error) {

        console.error(
            "[GAMERPRO] Error cargando personajes:",
            error
        );

    }
}


// ============================================================
// GLB
// ============================================================

function cargarGLB(ruta) {

    return new Promise(
        (resolve, reject) => {

            gltfLoader.load(
                ruta,
                resolve,
                undefined,
                reject
            );

        }
    );
}


// ============================================================
// PREPARAR PERSONAJE
// ============================================================

function prepararPersonaje(
    personaje,
    color
) {

    personaje.traverse(
        objeto => {

            if (objeto.isMesh) {

                objeto.castShadow = true;
                objeto.receiveShadow = true;

            }

        }
    );


    personaje.userData.walkTime =
        0;

    personaje.userData.baseY =
        personaje.position.y;

}


// ============================================================
// PIES AL SUELO
// ============================================================

function colocarPiesEnSuelo(
    personaje
) {

    personaje.updateMatrixWorld(
        true
    );

    const caja =
        new THREE.Box3()
            .setFromObject(
                personaje
            );

    personaje.position.y +=
        -caja.min.y + 0.03;

    personaje.userData.baseY =
        personaje.position.y;
}


// ============================================================
// BUSCAR HUESOS
// ============================================================

function encontrarHuesos(
    personaje
) {

    const huesos = {};

    if (!personaje) {
        return huesos;
    }


    personaje.traverse(
        objeto => {

            if (!objeto.isBone) {
                return;
            }

            const nombre =
                objeto.name.toLowerCase();


            if (
                nombre.includes("left") &&
                nombre.includes("leg")
            ) {
                huesos.piernaIzq =
                    objeto;
            }

            if (
                nombre.includes("right") &&
                nombre.includes("leg")
            ) {
                huesos.piernaDer =
                    objeto;
            }

            if (
                nombre.includes("left") &&
                nombre.includes("arm")
            ) {
                huesos.brazoIzq =
                    objeto;
            }

            if (
                nombre.includes("right") &&
                nombre.includes("arm")
            ) {
                huesos.brazoDer =
                    objeto;
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


    const distancia =
        personaje.position.z -
        CONFIG.distanciaFinal;


    if (distancia <= 0) {

        personaje.position.z =
            CONFIG.distanciaFinal;

        return;
    }


    personaje.position.z -=
        velocidad * delta;


    personaje.userData.walkTime +=
        delta * CONFIG.velocidadPasos;


    const t =
        personaje.userData.walkTime;


    const paso =
        Math.sin(t);


    const paso2 =
        Math.sin(t + Math.PI);


    // --------------------------------------------------------
    // BALANCEO DEL CUERPO
    // --------------------------------------------------------

    personaje.position.y =
        personaje.userData.baseY +
        Math.abs(
            Math.sin(t)
        ) * 0.035;


    personaje.rotation.z =
        Math.sin(t * 0.5) * 0.025;


    // --------------------------------------------------------
    // PIERNAS
    // --------------------------------------------------------

    if (huesos.piernaIzq) {

        huesos.piernaIzq.rotation.x =
            paso * 0.45;
    }

    if (huesos.piernaDer) {

        huesos.piernaDer.rotation.x =
            paso2 * 0.45;
    }


    // --------------------------------------------------------
    // BRAZOS
    // --------------------------------------------------------

    if (huesos.brazoIzq) {

        huesos.brazoIzq.rotation.x =
            paso2 * 0.28;
    }

    if (huesos.brazoDer) {

        huesos.brazoDer.rotation.x =
            paso * 0.28;
    }
}


// ============================================================
// DETENER CAMINATA
// ============================================================

function detenerPersonaje(
    personaje
) {

    if (!personaje) {
        return;
    }

    personaje.position.y =
        personaje.userData.baseY;

    personaje.rotation.z = 0;
        }
// ============================================================
// CREAR HUEVO ORIGINAL
// ============================================================

async function crearHuevo() {

    try {

        const textura =
            await cargarTextura(
                ARCHIVOS.huevo
            );


        const material =
            new THREE.MeshBasicMaterial({

                map: textura,

                transparent: true,

                alphaTest: 0.03,

                side: THREE.DoubleSide

            });


        const geometria =
            new THREE.PlaneGeometry(
                1,
                1
            );


        huevo =
            new THREE.Mesh(
                geometria,
                material
            );


        const ancho =
            textura.image.width;

        const alto =
            textura.image.height;


        const proporcion =
            ancho / alto;


        huevo.scale.set(
            2.0 * proporcion,
            2.0,
            1
        );


        huevo.position.set(
            0,
            1.15,
            0
        );


        huevo.visible = false;


        escena.add(huevo);


        // ----------------------------------------------------
        // BRILLO
        // ----------------------------------------------------

        const luz =
            new THREE.PointLight(
                0xffee88,
                0,
                5
            );

        luz.position.set(
            0,
            1.1,
            0
        );

        huevoBrillo =
            luz;

        escena.add(luz);


    } catch (error) {

        console.error(
            "[GAMERPRO] No se pudo cargar el huevo:",
            error
        );

    }
}


// ============================================================
// TEXTURA
// ============================================================

function cargarTextura(ruta) {

    return new Promise(
        (resolve, reject) => {

            textureLoader.load(
                ruta,
                textura => {

                    textura.colorSpace =
                        THREE.SRGBColorSpace;

                    resolve(textura);

                },
                undefined,
                reject
            );

        }
    );
}


// ============================================================
// BILLBOARD
// ============================================================

function mirarCamara(objeto) {

    if (!objeto || !camara) {
        return;
    }

    objeto.lookAt(
        camara.position
    );
                }
// ============================================================
// CREAR POLLOS
// ============================================================

function crearPollos3D() {

    polloNoob =
        crearPollo3D(
            "noob",
            0x8fa68e
        );


    polloZombie =
        crearPollo3D(
            "zombie",
            0x64735f
        );


    polloNoobEspecial =
        crearPollo3D(
            "pollito_noob",
            0xf5d5b8
        );


    // --------------------------------------------------------
    // POSICIONES
    // --------------------------------------------------------

    polloNoob.position.set(
        -2.4,
        0,
        -0.3
    );


    polloZombie.position.set(
        0,
        0,
        -0.3
    );


    polloNoobEspecial.position.set(
        2.4,
        0,
        -0.3
    );


    // --------------------------------------------------------
    // OCULTOS AL PRINCIPIO
    // --------------------------------------------------------

    polloNoob.visible = false;
    polloZombie.visible = false;
    polloNoobEspecial.visible = false;


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
// POLLO 3D PROCEDURAL
// ============================================================

function crearPollo3D(
    tipo,
    color
) {

    const grupo =
        new THREE.Group();


    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.65,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8
            })
        );

    cuerpo.scale.set(
        1,
        1.1,
        0.9
    );

    cuerpo.position.y =
        0.72;

    grupo.add(cuerpo);


    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8
            })
        );

    cabeza.position.y =
        1.55;

    grupo.add(cabeza);


    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    crearOjo(
        grupo,
        -0.18,
        1.65,
        0.40
    );

    crearOjo(
        grupo,
        0.18,
        1.65,
        0.40
    );


    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.16,
                0.38,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffa62b
            })
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        1.48,
        -0.48
    );

    grupo.add(pico);


    // --------------------------------------------------------
    // ALAS
    // --------------------------------------------------------

    crearAla(
        grupo,
        -0.62
    );

    crearAla(
        grupo,
        0.62
    );


    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    crearPata(
        grupo,
        -0.22
    );

    crearPata(
        grupo,
        0.22
    );


    // --------------------------------------------------------
    // CARACTERÍSTICAS
    // --------------------------------------------------------

    if (
        tipo === "noob" ||
        tipo === "zombie" ||
        tipo === "pollito_noob"
    ) {

        crearGorra(
            grupo,
            tipo
        );

        crearLetraN(
            grupo
        );
    }


    if (tipo === "zombie") {

        crearOjosZombie(
            grupo
        );
    }


    if (
        tipo === "pollito_noob"
    ) {

        crearDecoracionRainbow(
            grupo
        );
    }


    grupo.userData.tipo =
        tipo;

    grupo.userData.animTime =
        Math.random() * 10;


    return grupo;
}


// ============================================================
// OJO
// ============================================================

function crearOjo(
    grupo,
    x,
    y,
    z
) {

    const ojo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.075,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0x111111
            })
        );

    ojo.position.set(
        x,
        y,
        z
    );

    grupo.add(ojo);
}


// ============================================================
// ALA
// ============================================================

function crearAla(
    grupo,
    x
) {

    const ala =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.34,
                12,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x738b72
            })
        );

    ala.scale.set(
        0.55,
        1,
        0.35
    );

    ala.position.set(
        x,
        0.8,
        0
    );

    grupo.add(ala);
}


// ============================================================
// PATA
// ============================================================

function crearPata(
    grupo,
    x
) {

    const pata =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.045,
                0.065,
                0.35,
                6
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe9a62c
            })
        );

    pata.position.set(
        x,
        0.15,
        0
    );

    grupo.add(pata);
}
// ============================================================
// GORRA
// ============================================================

function crearGorra(
    grupo,
    tipo
) {

    const color =
        tipo === "zombie"
            ? 0x394a3d
            : 0xe8c36a;


    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.5,
                16,
                8,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            ),
            new THREE.MeshStandardMaterial({
                color: color
            })
        );


    gorra.scale.set(
        1.05,
        0.45,
        1.05
    );


    gorra.position.y =
        1.88;


    grupo.add(gorra);


    const visera =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7,
                0.08,
                0.35
            ),
            new THREE.MeshStandardMaterial({
                color: color
            })
        );


    visera.position.set(
        0,
        1.78,
        -0.4
    );


    grupo.add(visera);
}


// ============================================================
// LETRA N
// ============================================================

function crearLetraN(
    grupo
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x222222
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
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.07,
                0.28,
                0.03
            ),
            material
        );


    const diagonal =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.07,
                0.31,
                0.03
            ),
            material
        );


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


    grupo.add(barra1);
    grupo.add(barra2);
    grupo.add(diagonal);
}


// ============================================================
// ZOMBIE
// ============================================================

function crearOjosZombie(
    grupo
) {

    const rojo =
        new THREE.MeshBasicMaterial({
            color: 0xff2020
        });


    const ojo1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.08,
                8,
                8
            ),
            rojo
        );


    const ojo2 =
        ojo1.clone();


    ojo1.position.set(
        -0.18,
        1.65,
        0.42
    );


    ojo2.position.set(
        0.18,
        1.65,
        0.42
    );


    grupo.add(ojo1);
    grupo.add(ojo2);
}


// ============================================================
// DECORACIÓN RAINBOW
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
                    0.18 + i * 0.035,
                    0.025,
                    6,
                    12,
                    Math.PI
                ),
                new THREE.MeshBasicMaterial({
                    color: colores[i]
                })
            );


        aro.rotation.x =
            Math.PI / 2;


        aro.position.set(
            0,
            2.05,
            -0.05
        );


        grupo.add(aro);
    }
}
// ============================================================
// DIÁLOGOS
// ============================================================

const DIALOGOS = [

    {
        tiempo: 0.8,
        nombre: "Micaela",
        texto: "Mike... ¿dónde estamos?"
    },

    {
        tiempo: 2.2,
        nombre: "Mike",
        texto: "No lo sé... pero este lugar está enorme."
    },

    {
        tiempo: 3.8,
        nombre: "Micaela",
        texto: "Espera... ¿ves eso allá?"
    },

    {
        tiempo: 5.0,
        nombre: "Mike",
        texto: "Sí... se ve algo entre los árboles."
    },

    {
        tiempo: 6.3,
        nombre: "Micaela",
        texto: "Pío... pío... ¿qué fue eso?"
    },

    {
        tiempo: 7.4,
        nombre: "Mike",
        texto: "¿Un pollo?"
    },

    {
        tiempo: 8.7,
        nombre: "Micaela",
        texto: "Vamos a ver qué es."
    },

    {
        tiempo: 10.0,
        nombre: "Mike",
        texto: "Mira... hay algo junto a ese huevo."
    },

    {
        tiempo: 11.3,
        nombre: "Micaela",
        texto: "¿Un huevo? ¿De dónde salió?"
    },

    {
        tiempo: 12.7,
        nombre: "Mike",
        texto: "No parece un huevo normal... está brillando."
    },

    {
        tiempo: 14.3,
        nombre: "Micaela",
        texto: "¡Mike, está moviéndose!"
    },

    {
        tiempo: 15.4,
        nombre: "Mike",
        texto: "¡Se está abriendo!"
    },

    {
        tiempo: 17.5,
        nombre: "Micaela",
        texto: "¡¿Son pollos?!"
    },

    {
        tiempo: 18.7,
        nombre: "Mike",
        texto: "¡Hay varios! ¿Cuál va a salir?"
    },

    {
        tiempo: 22.0,
        nombre: "Micaela",
        texto: "¡Ya se decidió!"
    },

    {
        tiempo: 23.2,
        nombre: "Mike",
        texto: "¡Ese fue el que salió!"
    }

];


// ============================================================
// CREAR CAJA
// ============================================================

function crearDialogo() {

    cajaDialogo =
        document.createElement("div");


    cajaDialogo.style.position =
        "fixed";

    cajaDialogo.style.left =
        "50%";

    cajaDialogo.style.bottom =
        "7%";

    cajaDialogo.style.transform =
        "translateX(-50%)";

    cajaDialogo.style.width =
        "min(90%, 700px)";

    cajaDialogo.style.padding =
        "14px 18px";

    cajaDialogo.style.borderRadius =
        "18px";

    cajaDialogo.style.background =
        "rgba(0,0,0,0.78)";

    cajaDialogo.style.color =
        "white";

    cajaDialogo.style.fontFamily =
        "Arial, sans-serif";

    cajaDialogo.style.zIndex =
        "9999";

    cajaDialogo.style.textAlign =
        "center";


    nombreDialogo =
        document.createElement("div");

    nombreDialogo.style.fontWeight =
        "bold";

    nombreDialogo.style.fontSize =
        "18px";


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


    document.body.appendChild(
        cajaDialogo
    );
}


// ============================================================
// ACTUALIZAR DIÁLOGO
// ============================================================

function actualizarDialogo() {

    let indice = -1;


    for (
        let i = 0;
        i < DIALOGOS.length;
        i++
    ) {

        if (
            tiempoTotal >=
            DIALOGOS[i].tiempo
        ) {

            indice = i;

        }

    }


    if (
        indice === dialogoActual
    ) {
        return;
    }


    dialogoActual =
        indice;


    if (indice < 0) {
        return;
    }


    const dialogo =
        DIALOGOS[indice];


    nombreDialogo.textContent =
        dialogo.nombre;

    textoDialogo.textContent =
        dialogo.texto;
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
        "[GAMERPRO] Resultado huevo:",
        resultadoReal
    );


    return resultadoReal;
        }
// ============================================================
// MOSTRAR POLLOS
// ============================================================

function mostrarPollos() {

    polloNoob.visible =
        true;

    polloZombie.visible =
        true;

    polloNoobEspecial.visible =
        true;


    polloNoob.scale.setScalar(
        0.01
    );

    polloZombie.scale.setScalar(
        0.01
    );

    polloNoobEspecial.scale.setScalar(
        0.01
    );
}


// ============================================================
// ANIMAR POLLOS
// ============================================================

function animarPollos(delta) {

    const pollos = [

        polloNoob,

        polloZombie,

        polloNoobEspecial

    ];


    for (const pollo of pollos) {

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


        const salto =
            Math.abs(
                Math.sin(t)
            ) * 0.15;


        pollo.position.y =
            salto;


        pollo.rotation.y +=
            delta * 0.7;


        const escala =
            Math.min(
                1,
                pollo.scale.x +
                delta * 3
            );


        pollo.scale.setScalar(
            escala
        );
    }
}


// ============================================================
// SELECCIÓN
// ============================================================

function actualizarSeleccion() {

    if (
        !polloNoob ||
        !polloZombie ||
        !polloNoobEspecial
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


    const todos = Object.values(
        pollos
    );


    for (const pollo of todos) {

        pollo.scale.multiplyScalar(
            0.96
        );
    }


    ganador.scale.setScalar(
        1.25
    );


    ganador.rotation.y =
        Math.sin(
            tiempoTotal * 8
        ) * 0.25;


    ganador.position.y =
        0.18 +
        Math.abs(
            Math.sin(
                tiempoTotal * 8
            )
        ) * 0.15;
}


// ============================================================
// ANIMAR HUEVO
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


        if (huevoBrillo) {

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

        const progreso =
            Math.min(
                tiempoFase / 1.8,
                1
            );


        huevo.scale.y =
            huevo.userData.escalaY *
            (1 - progreso * 0.65);


        huevo.scale.x =
            huevo.userData.escalaX *
            (1 + progreso * 0.12);


        huevo.rotation.z =
            progreso * 0.18;


        huevo.material.opacity =
            1 - progreso;


        if (
            progreso >= 1
        ) {

            huevo.visible =
                false;

            huevo.material.opacity =
                1;

            if (huevoBrillo) {
                huevoBrillo.intensity = 0;
            }
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


    if (
        fase === 2 &&
        huevo
    ) {

        huevo.visible =
            true;
    }


    if (
        fase === 4
    ) {

        mostrarPollos();
    }
}


// ============================================================
// ACTUALIZAR FASES
// ============================================================

function actualizarFases(delta) {

    tiempoFase +=
        delta;


    // --------------------------------------------------------
    // 0 = INTRO
    // --------------------------------------------------------

    if (
        fase === 0 &&
        tiempoFase >=
        CONFIG.duracionIntro
    ) {

        cambiarFase(1);
    }


    // --------------------------------------------------------
    // 1 = CAMINAR
    // --------------------------------------------------------

    if (
        fase === 1
    ) {

        const mikeLlegó =
            !mike ||
            mike.position.z <=
            CONFIG.distanciaFinal;

        const micaelaLlegó =
            !micaela ||
            micaela.position.z <=
            CONFIG.distanciaFinal;


        if (
            mikeLlegó &&
            micaelaLlegó
        ) {

            cambiarFase(2);
        }
    }


    // --------------------------------------------------------
    // 2 = HUEVO BRILLANDO
    // --------------------------------------------------------

    if (
        fase === 2 &&
        tiempoFase >= 3
    ) {

        cambiarFase(3);
    }


    // --------------------------------------------------------
    // 3 = HUEVO ABRIÉNDOSE
    // --------------------------------------------------------

    if (
        fase === 3 &&
        tiempoFase >= 1.8
    ) {

        obtenerResultadoReal();

        cambiarFase(4);
    }


    // --------------------------------------------------------
    // 4 = MOSTRAR LOS TRES
    // --------------------------------------------------------

    if (
        fase === 4 &&
        tiempoFase >=
        CONFIG.duracionSeleccion
    ) {

        cambiarFase(5);
    }


    // --------------------------------------------------------
    // 5 = RESULTADO
    // --------------------------------------------------------

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


    tiempoTotal +=
        delta;


    actualizarFases(
        delta
    );

    actualizarDialogo();


    // --------------------------------------------------------
    // CAMINAR
    // --------------------------------------------------------

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

    } else {

        detenerPersonaje(
            mike
        );

        detenerPersonaje(
            micaela
        );
    }


    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    actualizarHuevo();


    // --------------------------------------------------------
    // POLLOS
    // --------------------------------------------------------

    if (
        fase >= 4
    ) {

        animarPollos(
            delta
        );
    }


    if (
        fase === 5
    ) {

        actualizarSeleccion();
    }


    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

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


    let objetivoZ = 0;


    if (
        fase === 0 ||
        fase === 1
    ) {

        objetivoZ =
            4.5;

    } else {

        objetivoZ =
            -1.5;
    }


    const objetivo =
        new THREE.Vector3(
            0,
            1.4,
            objetivoZ
        );


    camara.position.x +=
        (0 - camara.position.x)
        * 0.025;


    camara.position.y +=
        (3.1 - camara.position.y)
        * 0.025;


    camara.position.z +=
        (8 - camara.position.z)
        * 0.025;


    camara.lookAt(
        objetivo
    );
}


// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

export async function iniciarCinematica(
    contenedor
) {

    if (cinematicaActiva) {
        return;
    }


    contenedorJuego =
        contenedor || document.body;


    cinematicaActiva =
        true;

    cinematicaFinalizada =
        false;

    fase = 0;

    tiempoFase = 0;

    tiempoTotal = 0;

    dialogoActual = -1;

    resultadoReal = null;


    crearEscena();


    crearDialogo();


    await cargarPersonajes();


    await crearHuevo();


    crearPollos3D();


    if (huevo) {

        huevo.userData.escalaX =
            huevo.scale.x;

        huevo.userData.escalaY =
            huevo.scale.y;
    }


    reloj =
        new THREE.Clock();


    actualizar();
}


// ============================================================
// TERMINAR
// ============================================================

function terminarCinematica() {

    cinematicaActiva =
        false;

    cinematicaFinalizada =
        true;


    if (animacionID) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID =
            null;
    }


    console.log(
        "[GAMERPRO] Cinemática terminada. Resultado:",
        resultadoReal
    );
}


// ============================================================
// DETENER
// ============================================================

export function detenerCinematica() {

    cinematicaActiva =
        false;


    if (animacionID) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID =
            null;
    }


    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.remove();
    }


    if (cajaDialogo) {

        cajaDialogo.remove();

        cajaDialogo =
            null;
    }


    window.removeEventListener(
        "resize",
        redimensionarCinematica
    );
}


// ============================================================
// REDIMENSIONAR
// ============================================================

function redimensionarCinematica() {

    if (
        !renderer ||
        !camara
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
