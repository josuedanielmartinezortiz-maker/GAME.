// ============================================================
// GAMERPRO GAME
// escenaCinematica.js
// CINEMÁTICA LIMPIA
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
// DIÁLOGOS
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
    velocidadMike: 2.1,
    velocidadMicaela: 2.1,

    distanciaFinal: 0.7,

    alturaCamara: 2.35,
    distanciaCamara: 5.2,

    velocidadPasos: 7,

    duracionIntro: 2,
    duracionHuevo: 3,
    duracionApertura: 1.8,
    duracionSeleccion: 5.5,
    duracionResultado: 4
};

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

// ============================================================
// CREAR ESCENA
// ============================================================

function crearEscena() {
    escena = new THREE.Scene();

    escena.background =
        new THREE.Color(0x789765);

    escena.fog =
        new THREE.Fog(
            0x789765,
            10,
            30
        );

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
        CONFIG.alturaCamara,
        CONFIG.distanciaCamara
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

    const ambiente =
        new THREE.HemisphereLight(
            0xe5f6d7,
            0x304525,
            2.6
        );

    escena.add(ambiente);

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

    sol.castShadow = true;

    escena.add(sol);

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

    suelo.receiveShadow = true;

    escena.add(suelo);

    crearBosqueCerrado();

    window.addEventListener(
        "resize",
        redimensionarCinematica
    );
}
// ============================================================
// TRONCO
// ============================================================

function crearTronco(altura = 3) {
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

    tronco.castShadow = true;

    return tronco;
}

// ============================================================
// PINO
// ============================================================

function crearPino(escala = 1) {
    const grupo = new THREE.Group();

    grupo.add(
        crearTronco(2.8)
    );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x245934,
            roughness: 1
        });

    for (let i = 0; i < 3; i++) {
        const copa =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    1.25 - i * 0.22,
                    1.9,
                    8
                ),
                material
            );

        copa.position.y =
            2 + i * 0.72;

        copa.castShadow = true;

        grupo.add(copa);
    }

    grupo.scale.setScalar(escala);

    return grupo;
}

// ============================================================
// ARBUSTO
// ============================================================

function crearArbusto(escala = 1) {
    const grupo = new THREE.Group();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x3e713e,
            roughness: 1
        });

    for (let i = 0; i < 5; i++) {
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
            (Math.random() - 0.5) * 1,
            0.35 +
            Math.random() * 0.3,
            (Math.random() - 0.5) * 0.8
        );

        bola.castShadow = true;

        grupo.add(bola);
    }

    grupo.scale.setScalar(escala);

    return grupo;
}

// ============================================================
// BOSQUE CERRADO
// ============================================================

function crearBosqueCerrado() {
    for (let i = 0; i < 32; i++) {
        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const distancia =
            2.7 +
            Math.random() * 1.5;

        const arbol =
            crearPino(
                0.9 +
                Math.random() * 0.55
            );

        arbol.position.set(
            lado * distancia,
            0,
            7 - i * 0.8
        );

        escena.add(arbol);

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
            0.4
        );

        escena.add(arbusto);
    }

    for (let i = 0; i < 20; i++) {
        const arbol =
            crearPino(
                1 +
                Math.random() * 0.5
            );

        arbol.position.set(
            -8 + i * 0.85,
            0,
            -11 +
            Math.random() * 1.5
        );

        escena.add(arbol);
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

        escena.add(mike);

        ajustarAlSuelo(mike);

        mikeHuesos =
            buscarHuesos(mike);
    }

    if (micaela) {
        micaela.position.set(
            1.15,
            0,
            5.7
        );

        micaela.rotation.y =
            ROTACION_PERSONAJES;

        escena.add(micaela);

        ajustarAlSuelo(micaela);

        micaelaHuesos =
            buscarHuesos(micaela);
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

        const objeto = gltf.scene;

        objeto.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        objeto.userData.animations =
            gltf.animations || [];

        console.log(
            "[GAMERPRO] GLB:",
            ruta,
            "animaciones:",
            objeto.userData.animations.length
        );

        return objeto;

    } catch (error) {
        console.error(
            "[GAMERPRO] Error cargando:",
            ruta,
            error
        );

        return null;
    }
}

// ============================================================
// PONER EN EL SUELO
// ============================================================

function ajustarAlSuelo(objeto) {
    const caja =
        new THREE.Box3()
            .setFromObject(objeto);

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
// BUSCAR HUESOS
// ============================================================

function buscarHuesos(personaje) {
    const huesos = {};

    personaje.traverse(obj => {
        if (!obj.isBone) {
            return;
        }

        const nombre =
            obj.name.toLowerCase();

        if (
            /hip|pelvis|cadera|root/i
                .test(nombre)
        ) {
            huesos.cadera = obj;
        }

        if (
            /spine|chest|torso|columna|pecho/i
                .test(nombre)
        ) {
            huesos.torso = obj;
        }

        if (
            /head|cabeza/i
                .test(nombre)
        ) {
            huesos.cabeza = obj;
        }

        if (
            /left.*upper.*arm|upper.*arm.*left|left.*arm|brazo.*izq/i
                .test(nombre)
        ) {
            huesos.brazoIzq = obj;
        }

        if (
            /right.*upper.*arm|upper.*arm.*right|right.*arm|brazo.*der/i
                .test(nombre)
        ) {
            huesos.brazoDer = obj;
        }

        if (
            /left.*thigh|thigh.*left|left.*leg|left.*calf|pierna.*izq/i
                .test(nombre)
        ) {
            huesos.piernaIzq = obj;
        }

        if (
            /right.*thigh|thigh.*right|right.*leg|right.*calf|pierna.*der/i
                .test(nombre)
        ) {
            huesos.piernaDer = obj;
        }
    });

    console.log(
        "[GAMERPRO] Huesos encontrados:",
        Object.keys(huesos)
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

    const t =
        tiempoTotal *
        CONFIG.velocidadPasos;

    // Brazos
    if (huesos.brazoIzq) {
        huesos.brazoIzq.rotation.x =
            Math.sin(t) * 0.42;
    }

    if (huesos.brazoDer) {
        huesos.brazoDer.rotation.x =
            Math.sin(
                t + Math.PI
            ) * 0.42;
    }

    // Piernas
    if (huesos.piernaIzq) {
        huesos.piernaIzq.rotation.x =
            Math.sin(
                t + Math.PI
            ) * 0.48;
    }

    if (huesos.piernaDer) {
        huesos.piernaDer.rotation.x =
            Math.sin(t) * 0.48;
    }

    // Pequeño movimiento corporal
    if (huesos.cadera) {
        huesos.cadera.rotation.z =
            Math.sin(t) * 0.025;
    }

    if (huesos.torso) {
        huesos.torso.rotation.z =
            Math.sin(
                t + Math.PI
            ) * 0.018;
    }
}

// ============================================================
// DETENER
// ============================================================

function detenerPersonaje(personaje) {
    if (!personaje) {
        return;
    }

    personaje.userData.caminando =
        false;
}

// ============================================================
// DIAGNÓSTICO AUTOMÁTICO
// ============================================================

function diagnosticarRig(personaje, nombre) {
    if (!personaje) {
        console.warn(
            "[GAMERPRO]",
            nombre,
            "no fue cargado."
        );
        return;
    }

    let huesos = 0;
    let skinned = 0;

    personaje.traverse(obj => {
        if (obj.isBone) {
            huesos++;
        }

        if (obj.isSkinnedMesh) {
            skinned++;
        }
    });

    console.log(
        `[GAMERPRO] ${nombre}:`,
        {
            huesos,
            skinnedMeshes: skinned,
            animaciones:
                personaje.userData.animations?.length || 0
        }
    );
    }
// ============================================================
// CREAR HUEVO
// ============================================================

async function crearHuevo() {
    return new Promise(resolve => {

        textureLoader.load(
            ARCHIVOS.huevo,

            textura => {
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

                huevo.scale.y = 1.15;

                huevo.userData.escalaX =
                    huevo.scale.x;

                huevo.userData.escalaY =
                    huevo.scale.y;

                huevo.visible = false;

                escena.add(huevo);

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
    });
}

// ============================================================
// HUEVO DE RESPALDO
// ============================================================

function crearHuevoRespaldo() {
    const material =
        new THREE.MeshStandardMaterial({
            color: 0xe8c36a,
            roughness: 0.8
        });

    huevo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.7,
                24,
                18
            ),
            material
        );

    huevo.scale.y = 1.25;

    huevo.position.y = 0.8;

    huevo.visible = false;

    huevo.userData.escalaX =
        huevo.scale.x;

    huevo.userData.escalaY =
        huevo.scale.y;

    escena.add(huevo);
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
        -2,
        0,
        -1
    );

    polloZombie.position.set(
        0,
        0,
        -1.35
    );

    polloNoobEspecial.position.set(
        2,
        0,
        -1
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

// ============================================================
// POLLO BASE
// ============================================================

function crearPollo3D(tipo) {
    const grupo =
        new THREE.Group();

    const cuerpoMaterial =
        tipo === "zombie"
            ? new THREE.MeshStandardMaterial({
                color: 0xc9e69a,
                roughness: 1
            })
            : new THREE.MeshStandardMaterial({
                color: 0xf4c94f,
                roughness: 0.9
            });

    const amarilloClaro =
        new THREE.MeshStandardMaterial({
            color: 0xffdf70
        });

    const naranja =
        new THREE.MeshStandardMaterial({
            color: 0xff8b20
        });

    const negro =
        new THREE.MeshStandardMaterial({
            color: 0x202020
        });

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.72,
                18,
                14
            ),
            cuerpoMaterial
        );

    cuerpo.scale.set(
        1,
        1.08,
        0.88
    );

    cuerpo.position.y = 0.82;

    grupo.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.57,
                18,
                14
            ),
            cuerpoMaterial
        );

    cabeza.position.y = 1.65;

    grupo.add(cabeza);

    for (let i = 0; i < 3; i++) {
        const mechon =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13,
                    8,
                    6
                ),
                amarilloClaro
            );

        mechon.scale.y = 1.35;

        mechon.position.set(
            (i - 1) * 0.13,
            2.08 +
            Math.abs(i - 1) * 0.03,
            -0.03
        );

        grupo.add(mechon);
    }

    crearOjos(
        grupo,
        tipo
    );

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
        1.62,
        -0.55
    );

    grupo.add(pico);

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

    if (tipo === "noob") {
        crearGorra(grupo);
        crearLetraN(grupo);
    }

    if (tipo === "zombie") {
        crearParchesZombie(grupo);
    }

    if (
        tipo ===
        "pollito_noob"
    ) {
        crearEstrella(grupo);
        crearArcoiris(grupo);
    }

    grupo.userData.animTime = 0;

    return grupo;
                  }
// ============================================================
// OJOS
// ============================================================

function crearOjos(
    grupo,
    tipo
) {
    const material =
        new THREE.MeshBasicMaterial({
            color: 0x202020
        });

    for (
        const x of [-0.22, 0.22]
    ) {
        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.09,
                    10,
                    8
                ),
                material
            );

        ojo.position.set(
            x,
            1.68,
            -0.52
        );

        grupo.add(ojo);
    }

    if (tipo === "zombie") {
        const rojo =
            new THREE.MeshBasicMaterial({
                color: 0xff3333
            });

        for (
            const x of [-0.22, 0.22]
        ) {
            const ojo =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.06,
                        8,
                        6
                    ),
                    rojo
                );

            ojo.position.set(
                x,
                1.68,
                -0.59
            );

            grupo.add(ojo);
        }
    }
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
                (0.67 +
                i * 0.06),
                0.75 -
                i * 0.13,
                -0.02 -
                i * 0.03
            );

            pluma.rotation.z =
                lado * -0.35;

            ala.add(pluma);
        }

        grupo.add(ala);
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
            (i - 1.5) * 0.16,
            0.78 +
            Math.abs(i - 1.5) *
            0.08,
            0.70
        );

        pluma.rotation.x = 0.45;

        grupo.add(pluma);
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

        grupo.add(pata);

        const pie =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13,
                    8,
                    6
                ),
                material
            );

        pie.scale.z = 1.8;

        pie.position.set(
            x,
            0.04,
            -0.08
        );

        grupo.add(pie);
    }
}

// ============================================================
// GORRA
// ============================================================

function crearGorra(grupo) {
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

    gorra.position.y = 2.05;

    grupo.add(gorra);

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

    grupo.add(visera);
}

// ============================================================
// LETRA N
// ============================================================

function crearLetraN(grupo) {
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

    diagonal.rotation.z = -0.55;

    grupo.add(
        barra1,
        barra2,
        diagonal
    );
      }
// ============================================================
// PARCHES ZOMBIE
// ============================================================

function crearParchesZombie(grupo) {
    const material =
        new THREE.MeshStandardMaterial({
            color: 0x8fa68e
        });

    for (
        let i = 0;
        i < 4;
        i++
    ) {
        const parche =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13,
                    8,
                    6
                ),
                material
            );

        parche.scale.set(
            1.4,
            0.8,
            0.25
        );

        parche.position.set(
            (Math.random() - 0.5) *
            0.8,
            0.65 +
            Math.random() *
            0.5,
            -0.67
        );

        grupo.add(parche);
    }
}

// ============================================================
// ESTRELLA
// ============================================================

function crearEstrella(grupo) {
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

    grupo.add(estrella);
}

// ============================================================
// ARCOIRIS
// ============================================================

function crearArcoiris(grupo) {
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

        grupo.add(arco);
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
// INTERFAZ
// ============================================================

function crearInterfazDialogo() {
    cajaDialogo =
        document.createElement("div");

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
        document.createElement("div");

    nombreDialogo.style.cssText = `
        font-weight:bold;
        font-size:18px;
        margin-bottom:7px;
    `;

    textoDialogo =
        document.createElement("div");

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

function actualizarDialogo() {
    let encontrado = -1;

    for (
        let i = 0;
        i < DIALOGOS.length;
        i++
    ) {
        const d = DIALOGOS[i];

        if (
            d[0] === fase &&
            tiempoFase >= d[1]
        ) {
            encontrado = i;
        }
    }

    if (
        encontrado ===
        dialogoActual
    ) {
        return;
    }

    dialogoActual = encontrado;

    if (encontrado < 0) {
        cajaDialogo.style.display =
            "none";
        return;
    }

    const d =
        DIALOGOS[encontrado];

    cajaDialogo.style.display =
        "block";

    nombreDialogo.textContent =
        d[2];

    textoDialogo.textContent =
        d[3];
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

    for (const pollo of pollos) {
        if (!pollo) continue;

        pollo.visible = true;
        pollo.scale.setScalar(0.82);
    }

    resaltarPollo(0);
}

// ============================================================
// RESULTADO
// ============================================================

function obtenerResultadoReal() {
    if (resultadoReal) {
        return resultadoReal;
    }

    try {
        const resultado =
            abrirHuevo(
                "huevo_noob"
            );

        if (
            resultado === "noob" ||
            resultado === "zombie" ||
            resultado === "pollito_noob"
        ) {
            resultadoReal =
                resultado;
        }

    } catch (error) {
        console.error(
            "[GAMERPRO] Error en abrirHuevo:",
            error
        );
    }

    if (!resultadoReal) {
        resultadoReal = "noob";
    }

    return resultadoReal;
}

// ============================================================
// RESALTAR
// ============================================================

function resaltarPollo(indice) {
    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    pollos.forEach(
        (pollo, i) => {
            if (!pollo) return;

            pollo.scale.setScalar(
                i === indice
                    ? 1.12
                    : 0.82
            );
        }
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
        ultimoCambioRuleta = 0;

        ruletaIndice =
            (
                ruletaIndice + 1
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
// FINALIZAR SELECCIÓN
// ============================================================

function finalizarSeleccion() {
    if (resultadoMostrado) {
        return;
    }

    obtenerResultadoReal();

    const pollos = {
        noob: polloNoob,
        zombie: polloZombie,
        pollito_noob:
            polloNoobEspecial
    };

    const ganador =
        pollos[resultadoReal];

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
        if (!pollo) continue;

        pollo.visible =
            nombre ===
            resultadoReal;
    }

    ganador.visible = true;

    ganador.scale.setScalar(
        1.22
    );

    ganador.position.y =
        0.12;

    ganador.userData.ganador =
        true;

    resultadoMostrado = true;
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
        noob: polloNoob,
        zombie: polloZombie,
        pollito_noob:
            polloNoobEspecial
    };

    const ganador =
        pollos[resultadoReal];

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

    if (fase === 2) {
        huevo.visible = true;

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

        if (huevoBrillo) {
            huevoBrillo.intensity =
                1.5 +
                Math.sin(
                    tiempoFase * 10
                ) * 0.8;
        }
    }

    if (fase === 3) {
        huevo.visible = true;

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

        if (huevoBrillo) {
            huevoBrillo.intensity =
                2 +
                progreso * 4;
        }
    }

    if (
        fase !== 2 &&
        fase !== 3
    ) {
        huevo.visible = false;

        if (huevoBrillo) {
            huevoBrillo.intensity = 0;
        }
    }
}

// ============================================================
// CÁMARA
// ============================================================

function actualizarCamara() {
    if (!camara) {
        return;
    }

    let x = 0;
    let y = 2.35;
    let z = 5.2;

    let objetivoX = 0;
    let objetivoY = 1;
    let objetivoZ = 0;

    if (fase === 0) {
        x = 0;
        y = 2.5;
        z = 6.2;

        objetivoZ = 1;
    }

    if (fase === 1) {
        x = 0;
        y = 2.4;
        z = 5.5;

        objetivoZ = 1;
    }

    if (fase === 2) {
        x = 0;
        y = 1.85;
        z = 3.6;

        objetivoY = 1;
        objetivoZ = 0;
    }

    if (
        fase === 3 ||
        fase === 4 ||
        fase === 5
    ) {
        x = 0;
        y = 1.75;
        z = 4;

        objetivoY = 0.95;
        objetivoZ = -1;
    }

    camara.position.x +=
        (x -
        camara.position.x) *
        0.06;

    camara.position.y +=
        (y -
        camara.position.y) *
        0.06;

    camara.position.z +=
        (z -
        camara.position.z) *
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

function cambiarFase(nuevaFase) {
    fase = nuevaFase;
    tiempoFase = 0;
    dialogoActual = -1;

    if (fase === 3) {
        obtenerResultadoReal();
    }

    if (fase === 4) {
        mostrarPollos();
    }

    if (fase === 5) {
        finalizarSeleccion();
    }
}

// ============================================================
// FASES
// ============================================================

function actualizarFases(delta) {
    tiempoFase += delta;

    if (
        fase === 0 &&
        tiempoFase >=
        CONFIG.duracionIntro
    ) {
        cambiarFase(1);
    }

    if (fase === 1) {
        if (
            mike &&
            micaela &&
            mike.position.z <=
                CONFIG.distanciaFinal &&
            micaela.position.z <=
                CONFIG.distanciaFinal
        ) {
            detenerPersonaje(mike);
            detenerPersonaje(micaela);

            cambiarFase(2);
        }

        if (
            tiempoFase >= 8.5
        ) {
            detenerPersonaje(mike);
            detenerPersonaje(micaela);

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
// TERMINAR
// ============================================================

function terminarCinematica() {
    cinematicaActiva = false;
    cinematicaFinalizada = true;

    if (animacionID) {
        cancelAnimationFrame(
            animacionID
        );

        animacionID = null;
    }

    if (cajaDialogo) {
        cajaDialogo.style.display =
            "none";
    }

    console.log(
        "[GAMERPRO] Cinemática terminada."
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

    ruletaIndice = 0;
    ruletaVueltas = 0;
    ultimoCambioRuleta = 0;

    crearEscena();

    crearInterfazDialogo();

    reloj = new THREE.Clock();

    await cargarPersonajes();

    diagnosticarRig(
        mike,
        "Mike"
    );

    diagnosticarRig(
        micaela,
        "Micaela"
    );

    await crearHuevo();

    crearPollos3D();

    if (mike) {
        mike.userData.caminando =
            true;
    }

    if (micaela) {
        micaela.userData.caminando =
            true;
    }

    actualizar();
}

// ============================================================
// FIN
// ============================================================
