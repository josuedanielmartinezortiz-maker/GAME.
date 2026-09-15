// ============================================================
// ESCENA CINEMÁTICA — EGGARO
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

// ============================================================
// VARIABLES PRINCIPALES
// ============================================================

let escena = null;
let camara = null;
let renderer = null;

let mike = null;
let micaela = null;

let huevo = null;
let polloResultado = null;

let terminada = false;
let cinematicaActiva = false;

let fase = 0;
let tiempoFase = 0;

const reloj =
    new THREE.Clock();

// ============================================================
// ARRAYS DEL AMBIENTE
// ============================================================

const pastos = [];
const hojas = [];
const particulas = [];

// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

export function iniciarCinematica(game) {

    terminada = false;
    cinematicaActiva = true;

    fase = 0;
    tiempoFase = 0;

    reloj.start();

    // --------------------------------------------------------
    // ESCENA
    // --------------------------------------------------------

    escena =
        new THREE.Scene();

    escena.background =
        new THREE.Color(
            0x9eb8a1
        );

    escena.fog =
        new THREE.Fog(
            0x9eb8a1,
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
        3.2,
        13
    );

    camara.lookAt(
        0,
        1.3,
        -2
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
            window.devicePixelRatio,
            2
        )
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled =
        true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    document.body.appendChild(
        renderer.domElement
    );

    renderer.domElement.style.position =
        "fixed";

    renderer.domElement.style.left =
        "0";

    renderer.domElement.style.top =
        "0";

    renderer.domElement.style.width =
        "100vw";

    renderer.domElement.style.height =
        "100vh";

    renderer.domElement.style.zIndex =
        "1000";

    // --------------------------------------------------------
    // AMBIENTE
    // --------------------------------------------------------

    crearIluminacion();
    crearSuelo();
    crearBosque();
    crearVegetacion();
    crearRocas();
    crearParticulas();

    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    huevo =
        crearHuevoResultadoFiel();

    huevo.position.set(
        0,
        1.1,
        -2.2
    );

    huevo.visible = false;

    escena.add(
        huevo
    );

    // --------------------------------------------------------
    // PERSONAJES
    // --------------------------------------------------------

    cargarPersonajes();

    // --------------------------------------------------------
    // INTERFAZ
    // --------------------------------------------------------

    crearDialogo();

    // --------------------------------------------------------
    // RESIZE
    // --------------------------------------------------------

    window.addEventListener(
        "resize",
        ajustarPantalla
    );

    // --------------------------------------------------------
    // COMENZAR
    // --------------------------------------------------------

    animar();
}

// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    const ambiente =
        new THREE.HemisphereLight(
            0xcce4d0,
            0x465340,
            2.1
        );

    escena.add(
        ambiente
    );

    const sol =
        new THREE.DirectionalLight(
            0xffe2a8,
            3.2
        );

    sol.position.set(
        -8,
        14,
        8
    );

    sol.castShadow =
        true;

    sol.shadow.mapSize.width =
        1024;

    sol.shadow.mapSize.height =
        1024;

    sol.shadow.camera.near =
        0.5;

    sol.shadow.camera.far =
        40;

    escena.add(
        sol
    );

    const relleno =
        new THREE.DirectionalLight(
            0x9fc7ff,
            0.65
        );

    relleno.position.set(
        8,
        6,
        -6
    );

    escena.add(
        relleno
    );
}

// ============================================================
// SUELO
// ============================================================

function crearSuelo() {

    const geometria =
        new THREE.PlaneGeometry(
            80,
            80,
            32,
            32
        );

    const posiciones =
        geometria.attributes.position;

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {

        const x =
            posiciones.getX(i);

        const y =
            posiciones.getY(i);

        const z =
            Math.sin(x * 0.18) *
            0.08 +
            Math.cos(y * 0.15) *
            0.06;

        posiciones.setZ(
            i,
            z
        );
    }

    geometria.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x52734f,
            roughness: 1
        });

    const suelo =
        new THREE.Mesh(
            geometria,
            material
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow =
        true;

    escena.add(
        suelo
    );
}

// ============================================================
// BOSQUE
// ============================================================

function crearBosque() {

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const x =
            lado *
            (5 + Math.random() * 11);

        const z =
            -4 -
            Math.random() * 22;

        crearArbol(
            x,
            z,
            0.75 +
            Math.random() * 0.65
        );
    }

    // Árboles del fondo

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        crearArbol(
            -18 +
            Math.random() * 36,
            -18 -
            Math.random() * 12,
            0.9 +
            Math.random() * 0.8
        );
    }
}

// ============================================================
// ÁRBOL
// ============================================================

function crearArbol(
    x,
    z,
    escala = 1
) {

    const grupo =
        new THREE.Group();

    grupo.position.set(
        x,
        0,
        z
    );

    grupo.scale.setScalar(
        escala
    );

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.28,
                0.42,
                3.2,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x5a3c28,
                roughness: 0.9
            })
        );

    tronco.position.y =
        1.6;

    tronco.castShadow =
        true;

    grupo.add(
        tronco
    );

    const copaMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x365b3d,
            roughness: 1
        });

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const copa =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.25,
                    10,
                    8
                ),
                copaMaterial
            );

        copa.position.set(
            (i % 2) *
                1.15 -
                0.55,
            3.2 +
                (i > 1
                    ? 0.65
                    : 0),
            (i % 2 === 0
                ? -0.25
                : 0.3)
        );

        copa.scale.y =
            0.9;

        copa.castShadow =
            true;

        grupo.add(
            copa
        );

        hojas.push({
            objeto: copa,
            fase:
                Math.random() *
                Math.PI * 2
        });
    }

    escena.add(
        grupo
    );
}

// ============================================================
// VEGETACIÓN
// ============================================================

function crearVegetacion() {

    for (
        let i = 0;
        i < 180;
        i++
    ) {

        const grupo =
            new THREE.Group();

        const altura =
            0.12 +
            Math.random() *
            0.24;

        const material =
            new THREE.MeshStandardMaterial({
                color:
                    Math.random() >
                    0.5
                        ? 0x6e9656
                        : 0x4e7b49,
                roughness: 1
            });

        const hoja =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    0.08,
                    altura
                ),
                material
            );

        hoja.position.y =
            altura / 2;

        hoja.rotation.y =
            Math.random() *
            Math.PI;

        grupo.add(
            hoja
        );

        const x =
            (Math.random() - 0.5) *
            30;

        const z =
            -2 -
            Math.random() *
            28;

        grupo.position.set(
            x,
            0,
            z
        );

        escena.add(
            grupo
        );

        pastos.push({
            objeto: hoja,
            fase:
                Math.random() *
                Math.PI * 2,
            fuerza:
                0.04 +
                Math.random() *
                0.07
        });
    }
}

// ============================================================
// ROCAS
// ============================================================

function crearRocas() {

    for (
        let i = 0;
        i < 28;
        i++
    ) {

        const roca =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    0.2 +
                    Math.random() *
                    0.4,
                    0
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        0x66665c,
                    roughness:
                        1
                })
            );

        roca.position.set(
            (Math.random() - 0.5) *
                28,
            0.18,
            -3 -
                Math.random() *
                26
        );

        roca.rotation.set(
            Math.random(),
            Math.random(),
            Math.random()
        );

        roca.scale.y =
            0.5 +
            Math.random() *
            0.5;

        roca.castShadow =
            true;

        roca.receiveShadow =
            true;

        escena.add(
            roca
        );
    }
}

// ============================================================
// PARTÍCULAS
// ============================================================

function crearParticulas() {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xdce8c9,
            transparent: true,
            opacity: 0.55
        });

    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const p =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.025,
                    6,
                    6
                ),
                material
            );

        p.position.set(
            (Math.random() - 0.5) *
                18,
            0.5 +
                Math.random() *
                5,
            -2 -
                Math.random() *
                25
        );

        escena.add(
            p
        );

        particulas.push({
            objeto: p,
            velocidad:
                0.08 +
                Math.random() *
                0.18,
            fase:
                Math.random() *
                Math.PI * 2
        });
    }
}

// ============================================================
// CARGAR PERSONAJES
// ============================================================

function cargarPersonajes() {

    const loader =
        new GLTFLoader();

    loader.load(
        "./3D/mike.glb",

        gltf => {

            mike =
                gltf.scene;

            mike.position.set(
                -1.15,
                0,
                -1.7
            );

            mike.scale.setScalar(
                1
            );

            mike.traverse(
                objeto => {

                    if (
                        objeto.isMesh
                    ) {

                        objeto.castShadow =
                            true;

                        objeto.receiveShadow =
                            true;
                    }
                }
            );

            escena.add(
                mike
            );
        },

        undefined,

        () => {

            mike =
                crearPersonajeTemporal(
                    false
                );

            mike.position.set(
                -1.15,
                0,
                -1.7
            );

            escena.add(
                mike
            );
        }
    );

    loader.load(
        "./3D/micaela.glb",

        gltf => {

            micaela =
                gltf.scene;

            micaela.position.set(
                1.15,
                0,
                -1.7
            );

            micaela.scale.setScalar(
                1
            );

            micaela.traverse(
                objeto => {

                    if (
                        objeto.isMesh
                    ) {

                        objeto.castShadow =
                            true;

                        objeto.receiveShadow =
                            true;
                    }
                }
            );

            escena.add(
                micaela
            );
        },

        undefined,

        () => {

            micaela =
                crearPersonajeTemporal(
                    true
                );

            micaela.position.set(
                1.15,
                0,
                -1.7
            );

            escena.add(
                micaela
            );
        }
    );
}

// ============================================================
// PERSONAJE TEMPORAL
// ============================================================

function crearPersonajeTemporal(
    mujer
) {

    const grupo =
        new THREE.Group();

    const cuerpo =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.38,
                0.85,
                6,
                12
            ),
            new THREE.MeshStandardMaterial({
                color:
                    mujer
                        ? 0xd68a9c
                        : 0x5e86b7
            })
        );

    cuerpo.position.y =
        1;

    cuerpo.castShadow =
        true;

    grupo.add(
        cuerpo
    );

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.4,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf2c6a8
            })
        );

    cabeza.position.y =
        1.95;

    cabeza.castShadow =
        true;

    grupo.add(
        cabeza
    );

    return grupo;
            }
// ============================================================
// HUEVO NOOB — DISEÑO 3D
// ============================================================

function crearHuevoResultadoFiel() {

    const grupo =
        new THREE.Group();

    // --------------------------------------------------------
    // MATERIAL DEL HUEVO
    // --------------------------------------------------------

    const amarillo =
        new THREE.MeshStandardMaterial({
            color: 0xf4d43c,
            roughness: 0.65
        });

    const azul =
        new THREE.MeshStandardMaterial({
            color: 0x2587d8,
            roughness: 0.55
        });

    const verde =
        new THREE.MeshStandardMaterial({
            color: 0x75a85b,
            roughness: 0.7
        });

    const negro =
        new THREE.MeshStandardMaterial({
            color: 0x171717,
            roughness: 0.55
        });

    // --------------------------------------------------------
    // HUEVO BASE
    // --------------------------------------------------------

    const geometria =
        new THREE.SphereGeometry(
            0.65,
            32,
            24
        );

    const huevoBase =
        new THREE.Mesh(
            geometria,
            amarillo
        );

    huevoBase.scale.set(
        0.9,
        1.25,
        0.9
    );

    huevoBase.position.y =
        0.85;

    huevoBase.castShadow =
        true;

    huevoBase.receiveShadow =
        true;

    grupo.add(
        huevoBase
    );

    // --------------------------------------------------------
    // FRANJA AZUL
    // --------------------------------------------------------

    const franjaAzul =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.655,
                32,
                24,
                0,
                Math.PI * 2,
                0.72,
                0.58
            ),
            azul
        );

    franjaAzul.scale.set(
        0.9,
        1.25,
        0.9
    );

    franjaAzul.position.y =
        0.85;

    franjaAzul.castShadow =
        true;

    grupo.add(
        franjaAzul
    );

    // --------------------------------------------------------
    // PARTE VERDE
    // --------------------------------------------------------

    const parteVerde =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.657,
                32,
                24,
                0,
                Math.PI * 2,
                1.30,
                0.55
            ),
            verde
        );

    parteVerde.scale.set(
        0.9,
        1.25,
        0.9
    );

    parteVerde.position.y =
        0.85;

    parteVerde.castShadow =
        true;

    grupo.add(
        parteVerde
    );

    // --------------------------------------------------------
    // LÍNEAS OSCURAS ENTRE COLORES
    // --------------------------------------------------------

    const lineaSuperior =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.585,
                0.025,
                8,
                32
            ),
            negro
        );

    lineaSuperior.rotation.x =
        Math.PI / 2;

    lineaSuperior.position.y =
        1.15;

    lineaSuperior.scale.x =
        0.95;

    grupo.add(
        lineaSuperior
    );

    const lineaInferior =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.54,
                0.025,
                8,
                32
            ),
            negro
        );

    lineaInferior.rotation.x =
        Math.PI / 2;

    lineaInferior.position.y =
        0.55;

    lineaInferior.scale.x =
        0.95;

    grupo.add(
        lineaInferior
    );

    return grupo;
}

// ============================================================
// SORTEO 98 / 1 / 1
// ============================================================

function obtenerResultado() {

    const numero =
        Math.random() * 100;

    if (numero < 98) {

        return "noob";
    }

    if (numero < 99) {

        return "zombie";
    }

    return "pollito";
}

// ============================================================
// DIÁLOGO
// ============================================================

let dialogoUI = null;
let dialogoNombre = null;
let dialogoTexto = null;

function crearDialogo() {

    dialogoUI =
        document.createElement(
            "div"
        );

    dialogoUI.id =
        "cinematicaUI";

    dialogoUI.style.position =
        "fixed";

    dialogoUI.style.left =
        "50%";

    dialogoUI.style.bottom =
        "5%";

    dialogoUI.style.transform =
        "translateX(-50%)";

    dialogoUI.style.width =
        "min(90%, 720px)";

    dialogoUI.style.padding =
        "18px 22px";

    dialogoUI.style.boxSizing =
        "border-box";

    dialogoUI.style.borderRadius =
        "18px";

    dialogoUI.style.background =
        "rgba(0,0,0,0.72)";

    dialogoUI.style.border =
        "2px solid rgba(255,255,255,0.18)";

    dialogoUI.style.color =
        "white";

    dialogoUI.style.fontFamily =
        "Arial, sans-serif";

    dialogoUI.style.zIndex =
        "2000";

    dialogoUI.style.backdropFilter =
        "blur(5px)";

    dialogoNombre =
        document.createElement(
            "div"
        );

    dialogoNombre.style.fontSize =
        "18px";

    dialogoNombre.style.fontWeight =
        "bold";

    dialogoNombre.style.marginBottom =
        "7px";

    dialogoTexto =
        document.createElement(
            "div"
        );

    dialogoTexto.style.fontSize =
        "22px";

    dialogoTexto.style.lineHeight =
        "1.35";

    dialogoUI.appendChild(
        dialogoNombre
    );

    dialogoUI.appendChild(
        dialogoTexto
    );

    document.body.appendChild(
        dialogoUI
    );

    ocultarDialogo();
}

// ============================================================
// MOSTRAR DIÁLOGO
// ============================================================

function mostrarDialogo(
    nombre,
    texto
) {

    if (!dialogoUI)
        return;

    dialogoUI.style.display =
        "block";

    dialogoNombre.textContent =
        nombre || "";

    dialogoTexto.textContent =
        texto || "";
}

// ============================================================
// OCULTAR DIÁLOGO
// ============================================================

function ocultarDialogo() {

    if (!dialogoUI)
        return;

    dialogoUI.style.display =
        "none";
}

// ============================================================
// CREAR POLLO RESULTADO
// ============================================================

function crearPolloResultado(
    tipo
) {

    const grupo =
        new THREE.Group();

    const esZombie =
        tipo === "zombie";

    const esPollito =
        tipo === "pollito";

    const colorCuerpo =
        esZombie
            ? 0x6fa05b
            : 0xf4ca32;

    const cuerpoMaterial =
        new THREE.MeshStandardMaterial({
            color:
                colorCuerpo,
            roughness:
                0.7
        });

    const picoMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0xff8b19,
            roughness:
                0.6
        });

    const patasMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0xe18b20,
            roughness:
                0.65
        });

    const negroMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0x111111
        });

    const blancoMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0xffffff
        });

    const amarilloMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0xffd21f
        });

    const azulMaterial =
        new THREE.MeshStandardMaterial({
            color:
                0x168cf0
        });

    // --------------------------------------------------------
    // ESCALA
    // --------------------------------------------------------

    grupo.scale.setScalar(
        esPollito
            ? 0.72
            : 1
    );

    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                esPollito
                    ? 0.72
                    : 0.9,
                24,
                18
            ),
            cuerpoMaterial
        );

    cuerpo.scale.set(
        1,
        esPollito
            ? 0.9
            : 1.05,
        0.9
    );

    cuerpo.position.y =
        esPollito
            ? 0.95
            : 1.05;

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
                esPollito
                    ? 0.68
                    : 0.78,
                24,
                18
            ),
            cuerpoMaterial
        );

    cabeza.position.set(
        0,
        esPollito
            ? 1.72
            : 1.9,
        0
    );

    cabeza.castShadow =
        true;

    grupo.add(
        cabeza
    );

    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    const tamañoOjo =
        esPollito
            ? 0.18
            : 0.13;

    function crearOjo(
        x
    ) {

        const blanco =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    tamañoOjo * 1.35,
                    16,
                    12
                ),
                blancoMaterial
            );

        blanco.position.set(
            x,
            cabeza.position.y +
                0.08,
            -0.62
        );

        grupo.add(
            blanco
        );

        const pupila =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    tamañoOjo * 0.65,
                    12,
                    10
                ),
                negroMaterial
            );

        pupila.position.set(
            x,
            cabeza.position.y +
                0.08,
            -0.75
        );

        grupo.add(
            pupila
        );
    }

    crearOjo(-0.25);
    crearOjo(0.25);

    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                esPollito
                    ? 0.18
                    : 0.16,
                esPollito
                    ? 0.42
                    : 0.34,
                4
            ),
            picoMaterial
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        cabeza.position.y -
            0.12,
        -0.82
    );

    grupo.add(
        pico
    );

    // --------------------------------------------------------
    // CRESTA
    // --------------------------------------------------------

    const crestaMaterial =
        new THREE.MeshStandardMaterial({
            color:
                esZombie
                    ? 0x913b3b
                    : 0xe53e3e
        });

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const cresta =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.16,
                    12,
                    8
                ),
                crestaMaterial
            );

        cresta.position.set(
            (i - 1) * 0.18,
            cabeza.position.y +
                0.65,
            0
        );

        cresta.scale.y =
            1.35;

        grupo.add(
            cresta
        );
    }

    // --------------------------------------------------------
    // ALAS
    // --------------------------------------------------------

    function crearAla(
        x
    ) {

        const ala =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    esPollito
                        ? 0.3
                        : 0.38,
                    16,
                    12
                ),
                cuerpoMaterial
            );

        ala.scale.set(
            0.55,
            1,
            0.35
        );

        ala.position.set(
            x,
            esPollito
                ? 0.95
                : 1.05,
            -0.02
        );

        ala.rotation.z =
            x < 0
                ? 0.25
                : -0.25;

        ala.castShadow =
            true;

        grupo.add(
            ala
        );
    }

    crearAla(-0.78);
    crearAla(0.78);

    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    function crearPata(
        x
    ) {

        const pata =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.055,
                    0.075,
                    esPollito
                        ? 0.35
                        : 0.48,
                    8
                ),
                patasMaterial
            );

        pata.position.set(
            x,
            esPollito
                ? 0.25
                : 0.35,
            -0.03
        );

        pata.castShadow =
            true;

        grupo.add(
            pata
        );

        const pie =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.11,
                    10,
                    8
                ),
                patasMaterial
            );

        pie.scale.set(
            1.25,
            0.45,
            1.8
        );

        pie.position.set(
            x,
            esPollito
                ? 0.08
                : 0.09,
            -0.16
        );

        grupo.add(
            pie
        );
    }

    crearPata(-0.28);
    crearPata(0.28);

    // --------------------------------------------------------
    // COLA
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const pluma =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.25,
                    12,
                    8
                ),
                cuerpoMaterial
            );

        pluma.scale.set(
            0.65,
            1.25,
            0.55
        );

        pluma.position.set(
            (i - 1) * 0.22,
            esPollito
                ? 1
                : 1.15,
            0.78
        );

        pluma.rotation.x =
            -0.45;

        grupo.add(
            pluma
        );
    }

    // --------------------------------------------------------
    // GORRA
    // --------------------------------------------------------

    const gorra =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                esPollito
                    ? 0.72
                    : 0.8,
                esPollito
                    ? 0.82
                    : 0.9,
                0.28,
                24
            ),
            amarilloMaterial
        );

    gorra.position.set(
        0,
        cabeza.position.y +
            0.65,
        0
    );

    gorra.castShadow =
        true;

    grupo.add(
        gorra
    );

    // --------------------------------------------------------
    // VISERA
    // --------------------------------------------------------

    const visera =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.42,
                16,
                8
            ),
            amarilloMaterial
        );

    visera.scale.set(
        1.35,
        0.3,
        0.7
    );

    visera.position.set(
        0,
        cabeza.position.y +
            0.55,
        -0.48
    );

    grupo.add(
        visera
    );

    // --------------------------------------------------------
    // N AZUL
    // --------------------------------------------------------

    const letraN =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                esPollito
                    ? 0.25
                    : 0.22,
                esPollito
                    ? 0.34
                    : 0.3,
                0.045
            ),
            azulMaterial
        );

    letraN.position.set(
        0,
        cabeza.position.y +
            0.72,
        -0.79
    );

    grupo.add(
        letraN
    );

    // --------------------------------------------------------
    // MANCHAS ZOMBIE
    // --------------------------------------------------------

    if (esZombie) {

        const materialMancha =
            new THREE.MeshStandardMaterial({
                color:
                    0x405a38
            });

        const manchas = [
            [-0.42, 1.35, -0.78, 0.2],
            [0.4, 1.05, -0.77, 0.16],
            [-0.25, 2.1, -0.7, 0.13]
        ];

        for (
            const m of manchas
        ) {

            const mancha =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        m[3],
                        12,
                        8
                    ),
                    materialMancha
                );

            mancha.position.set(
                m[0],
                m[1],
                m[2]
            );

            mancha.scale.z =
                0.25;

            grupo.add(
                mancha
            );
        }
    }

    // --------------------------------------------------------
    // ESTRELLA DEL POLLITO
    // --------------------------------------------------------

    if (esPollito) {

        const estrella =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    0.16,
                    5
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        0xffe45c,
                    side:
                        THREE.DoubleSide
                })
            );

        estrella.position.set(
            0,
            0.98,
            -0.66
        );

        estrella.rotation.x =
            -Math.PI / 2;

        grupo.add(
            estrella
        );
    }

    return grupo;
}
// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animar() {

    requestAnimationFrame(
        animar
    );

    const delta =
        reloj.getDelta();

    tiempoFase += delta;

    actualizarAmbiente(
        delta
    );

    actualizarCinematica(
        delta
    );

    if (
        renderer &&
        escena &&
        camara
    ) {

        renderer.render(
            escena,
            camara
        );
    }
}

// ============================================================
// AMBIENTE VIVO
// ============================================================

function actualizarAmbiente(
    delta
) {

    const t =
        performance.now() *
        0.001;

    // --------------------------------------------------------
    // HIERBA
    // --------------------------------------------------------

    for (
        const p of pastos
    ) {

        p.objeto.rotation.z =
            Math.sin(
                t * 1.3 +
                p.fase
            ) *
            p.fuerza;
    }

    // --------------------------------------------------------
    // COPAS DE ÁRBOLES
    // --------------------------------------------------------

    for (
        const h of hojas
    ) {

        h.objeto.rotation.z =
            Math.sin(
                t * 0.45 +
                h.fase
            ) *
            0.025;
    }

    // --------------------------------------------------------
    // PARTÍCULAS
    // --------------------------------------------------------

    for (
        const p of particulas
    ) {

        p.objeto.position.y +=
            delta *
            p.velocidad;

        p.objeto.position.x +=
            Math.sin(
                t +
                p.fase
            ) *
            delta *
            0.12;

        if (
            p.objeto.position.y >
            7
        ) {

            p.objeto.position.y =
                0.5;
        }
    }

    // --------------------------------------------------------
    // MOVIMIENTO SUTIL DE PERSONAJES
    // --------------------------------------------------------

    if (mike) {

        mike.rotation.y =
            0.15 +
            Math.sin(
                t * 0.7
            ) *
            0.015;
    }

    if (micaela) {

        micaela.rotation.y =
            -0.15 +
            Math.sin(
                t * 0.7 +
                1
            ) *
            0.015;
    }
}

// ============================================================
// ACTUALIZAR CINEMÁTICA
// ============================================================

function actualizarCinematica(
    delta
) {

    // ========================================================
    // FASE 0 — LLEGADA
    // ========================================================

    if (fase === 0) {

        ocultarDialogo();

        camara.position.x =
            Math.sin(
                tiempoFase *
                0.2
            ) *
            0.4;

        if (
            tiempoFase >
            1.8
        ) {

            fase = 1;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 1 — MICAELA
    // ========================================================

    if (fase === 1) {

        mirarPersonajes();

        mostrarDialogo(
            "Micaela",
            "¿Dónde estamos?"
        );

        if (
            tiempoFase >
            3
        ) {

            fase = 2;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 2 — MIKE
    // ========================================================

    if (fase === 2) {

        mirarPersonajes();

        mostrarDialogo(
            "Mike",
            "No sé... pero se ve algo a lo lejos."
        );

        if (
            tiempoFase >
            3.5
        ) {

            fase = 3;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 3 — SE ESCUCHA ALGO
    // ========================================================

    if (fase === 3) {

        ocultarDialogo();

        camara.position.z =
            13 -
            tiempoFase *
            0.7;

        if (
            tiempoFase >
            2.5
        ) {

            fase = 4;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 4 — MICAELA PREGUNTA
    // ========================================================

    if (fase === 4) {

        mostrarDialogo(
            "Micaela",
            "¿Qué es ese sonido?"
        );

        if (
            tiempoFase >
            3
        ) {

            fase = 5;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 5 — MIKE IDENTIFICA EL SONIDO
    // ========================================================

    if (fase === 5) {

        mostrarDialogo(
            "Mike",
            "Parece un pollo..."
        );

        if (
            tiempoFase >
            3
        ) {

            fase = 6;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 6 — ENCUENTRAN EL HUEVO
    // ========================================================

    if (fase === 6) {

        mostrarDialogo(
            "Mike",
            "¡Mira! ¡Un huevo!"
        );

        if (huevo) {

            huevo.visible =
                true;

            huevo.position.y =
                1.1 +
                Math.sin(
                    tiempoFase *
                    2
                ) *
                0.05;
        }

        if (
            tiempoFase >
            2.5
        ) {

            fase = 7;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 7 — CAE EL HUEVO
    // ========================================================

    if (fase === 7) {

        ocultarDialogo();

        if (huevo) {

            huevo.visible =
                true;

            huevo.position.y =
                3 -
                tiempoFase *
                1.3;

            huevo.rotation.y +=
                delta *
                5;

            if (
                huevo.position.y <=
                0.9
            ) {

                huevo.position.y =
                    0.9;

                fase = 8;
                tiempoFase = 0;
            }
        }

        return;
    }

    // ========================================================
    // FASE 8 — HUEVO GIRANDO
    // ========================================================

    if (fase === 8) {

        if (huevo) {

            huevo.rotation.y +=
                delta *
                7;

            huevo.rotation.z =
                Math.sin(
                    tiempoFase *
                    8
                ) *
                0.12;
        }

        if (
            tiempoFase >
            2.2
        ) {

            mostrarResultado();

            fase = 9;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 9 — POLLO RESULTADO
    // ========================================================

    if (fase === 9) {

        if (
            polloResultado
        ) {

            polloResultado.rotation.y +=
                delta *
                0.7;

            polloResultado.position.y =
                0.1 +
                Math.sin(
                    tiempoFase *
                    3
                ) *
                0.08;
        }

        if (
            tiempoFase >
            4
        ) {

            fase = 10;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 10 — FINAL
    // ========================================================

    if (fase === 10) {

        if (
            polloResultado
        ) {

            polloResultado.rotation.y +=
                delta *
                0.3;
        }

        if (
            tiempoFase >
            1.5
        ) {

            terminada =
                true;
        }
    }
}

// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    if (
        polloResultado
    ) {

        escena.remove(
            polloResultado
        );

        polloResultado =
            null;
    }

    // --------------------------------------------------------
    // SORTEO REAL 98 / 1 / 1
    // --------------------------------------------------------

    const resultado =
        obtenerResultado();

    // --------------------------------------------------------
    // OCULTAR HUEVO
    // --------------------------------------------------------

    if (huevo) {

        huevo.visible =
            false;
    }

    // --------------------------------------------------------
    // CREAR POLLO
    // --------------------------------------------------------

    polloResultado =
        crearPolloResultado(
            resultado
        );

    polloResultado.position.set(
        0,
        0.1,
        -1
    );

    escena.add(
        polloResultado
    );
}

// ============================================================
// MIRAR HACIA EL HUEVO
// ============================================================

function mirarPersonajes() {

    if (
        !mike ||
        !micaela
    ) {

        return;
    }

    mike.lookAt(
        0,
        1.3,
        -2
    );

    micaela.lookAt(
        0,
        1.3,
        -2
    );
}

// ============================================================
// AJUSTAR PANTALLA
// ============================================================

function ajustarPantalla() {

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
// CINEMÁTICA TERMINADA
// ============================================================

export function cinematicaTerminada() {

    return terminada;
}

// ============================================================
// DETENER CINEMÁTICA
// ============================================================

export function detenerCinematica() {

    terminada =
        true;

    cinematicaActiva =
        false;

    window.removeEventListener(
        "resize",
        ajustarPantalla
    );

    // --------------------------------------------------------
    // ELIMINAR DIÁLOGO
    // --------------------------------------------------------

    if (dialogoUI) {

        dialogoUI.remove();

        dialogoUI =
            null;

        dialogoNombre =
            null;

        dialogoTexto =
            null;
    }

    // --------------------------------------------------------
    // ELIMINAR RENDERER
    // --------------------------------------------------------

    if (renderer) {

        renderer.dispose();

        if (
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement.parentNode.removeChild(
                renderer.domElement
            );
        }
    }

    // --------------------------------------------------------
    // LIMPIAR REFERENCIAS
    // --------------------------------------------------------

    renderer =
        null;

    escena =
        null;

    camara =
        null;

    mike =
        null;

    micaela =
        null;

    huevo =
        null;

    polloResultado =
        null;
                                               }
