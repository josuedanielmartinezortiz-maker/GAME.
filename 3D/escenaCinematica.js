// ============================================================
// EGGARO
// escenaCinematica.js
//
// CINEMÁTICA INICIAL
//
// MENÚ
//   ↓
// BOSQUE
//   ↓
// MIKE + MICAELA
//   ↓
// "¿Dónde estamos?"
//   ↓
// "No sé... pero se ve algo a lo lejos."
//   ↓
// PÍO PÍO
//   ↓
// "¿Qué es ese sonido?"
//   ↓
// "Parece un pollo..."
//   ↓
// HUEVO
//   ↓
// CAÍDA + GIRO
//   ↓
// SORTEO
//   98% POLLO NOOB
//   1% POLLO ZOMBIE
//   1% POLLITO NOOB
//   ↓
// RESULTADO
//   ↓
// GRANJA
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";


// ============================================================
// VARIABLES
// ============================================================

let escena = null;
let camara = null;
let renderer = null;
let reloj = null;

let mike = null;
let micaela = null;

let huevo = null;
let polloResultado = null;

let fase = 0;
let tiempoFase = 0;

let resultado = null;

let dialogoElemento = null;
let nombreElemento = null;

let terminada = false;
let activa = false;

let resultadoMostrado = false;

let contenedorActual = null;

const loader = new GLTFLoader();


// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

export function iniciarCinematica(contenedor) {

    // --------------------------------------------------------
    // LIMPIAR UNA CINEMÁTICA ANTERIOR
    // --------------------------------------------------------

    detenerCinematica();

    contenedorActual = contenedor;

    terminada = false;
    activa = true;

    fase = 0;
    tiempoFase = 0;

    resultado = null;
    resultadoMostrado = false;

    mike = null;
    micaela = null;
    huevo = null;
    polloResultado = null;


    // --------------------------------------------------------
    // ESCENA
    // --------------------------------------------------------

    escena =
        new THREE.Scene();

    escena.background =
        new THREE.Color(0x78988a);

    escena.fog =
        new THREE.Fog(
            0x78988a,
            15,
            75
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
            150
        );

    camara.position.set(
        0,
        4.5,
        15
    );

    camara.lookAt(
        0,
        2.2,
        -7
    );


    // --------------------------------------------------------
    // RENDERER
    // --------------------------------------------------------

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference:
                "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.1;

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    // --------------------------------------------------------
    // INSERTAR CANVAS
    // --------------------------------------------------------

    if (contenedor) {

        contenedor.appendChild(
            renderer.domElement
        );
    }


    // --------------------------------------------------------
    // RELOJ
    // --------------------------------------------------------

    reloj =
        new THREE.Clock();


    // --------------------------------------------------------
    // CREAR MUNDO
    // --------------------------------------------------------

    crearBosque();

    crearIluminacion();

    cargarPersonajes();

    crearHuevo();

    crearInterfazDialogo();


    // --------------------------------------------------------
    // RESIZE
    // --------------------------------------------------------

    window.addEventListener(
        "resize",
        ajustarPantalla
    );


    // --------------------------------------------------------
    // ANIMACIÓN
    // --------------------------------------------------------

    animar();


    return {
        escena,
        camara,
        renderer
    };
}


// ============================================================
// BOSQUE
// ============================================================

function crearBosque() {

    // --------------------------------------------------------
    // SUELO
    // --------------------------------------------------------

    const suelo =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                100,
                100
            ),
            new THREE.MeshStandardMaterial({
                color: 0x315d35,
                roughness: 1
            })
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow = true;

    escena.add(
        suelo
    );


    // --------------------------------------------------------
    // PASTO
    // --------------------------------------------------------

    const materialPasto =
        new THREE.MeshStandardMaterial({
            color: 0x477a3d,
            roughness: 1
        });

    for (
        let i = 0;
        i < 500;
        i++
    ) {

        const pasto =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.045,
                    0.35,
                    3
                ),
                materialPasto
            );

        pasto.position.set(
            (Math.random() - 0.5) * 70,
            0.17,
            -5 -
            Math.random() * 55
        );

        const escala =
            0.5 +
            Math.random() * 1.5;

        pasto.scale.set(
            escala,
            escala,
            escala
        );

        pasto.rotation.y =
            Math.random() *
            Math.PI;

        escena.add(
            pasto
        );
    }


    // --------------------------------------------------------
    // ÁRBOLES
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 45;
        i++
    ) {

        crearArbol(
            -32 +
            Math.random() * 64,

            0,

            -10 -
            Math.random() * 50,

            0.8 +
            Math.random() * 1.4
        );
    }


    // --------------------------------------------------------
    // ARBUSTOS
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        const arbusto =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.7 +
                    Math.random() * 0.7,
                    8,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x28542d,
                    roughness: 1
                })
            );

        arbusto.position.set(
            -30 +
            Math.random() * 60,

            0.55,

            -5 -
            Math.random() * 45
        );

        arbusto.scale.y =
            0.7;

        escena.add(
            arbusto
        );
    }
}


// ============================================================
// ÁRBOL
// ============================================================

function crearArbol(
    x,
    y,
    z,
    escala
) {

    const grupo =
        new THREE.Group();


    // --------------------------------------------------------
    // TRONCO
    // --------------------------------------------------------

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.28,
                0.48,
                5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x513927,
                roughness: 1
            })
        );

    tronco.position.y =
        2.5;

    tronco.castShadow = true;

    grupo.add(
        tronco
    );


    // --------------------------------------------------------
    // COPA
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const copa =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.5 +
                    Math.random() * 0.8,
                    8,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        i % 2 === 0
                            ? 0x285c32
                            : 0x356b3b,
                    roughness: 1
                })
            );

        copa.position.set(
            (Math.random() - 0.5) * 2,
            4.4 +
            Math.random() * 1.5,
            (Math.random() - 0.5) * 2
        );

        copa.castShadow = true;

        grupo.add(
            copa
        );
    }


    grupo.position.set(
        x,
        y,
        z
    );

    grupo.scale.setScalar(
        escala
    );

    escena.add(
        grupo
    );
}


// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    const ambiente =
        new THREE.HemisphereLight(
            0xa9d5df,
            0x29402b,
            2
        );

    escena.add(
        ambiente
    );


    const luz =
        new THREE.DirectionalLight(
            0xffd59b,
            3
        );

    luz.position.set(
        -15,
        20,
        10
    );

    luz.castShadow = true;

    luz.shadow.mapSize.width =
        1024;

    luz.shadow.mapSize.height =
        1024;

    escena.add(
        luz
    );
}


// ============================================================
// CARGAR MIKE Y MICAELA
// ============================================================

function cargarPersonajes() {

    // --------------------------------------------------------
    // MIKE
    // --------------------------------------------------------

    loader.load(
        "./3D/mike.glb",

        (gltf) => {

            if (!activa) {
                return;
            }

            mike =
                gltf.scene;

            mike.scale.setScalar(
                1.4
            );

            mike.position.set(
                -1.6,
                0,
                3
            );

            mike.rotation.y =
                0.15;

            prepararPersonaje(
                mike
            );

            escena.add(
                mike
            );
        },

        undefined,

        () => {

            if (!activa) {
                return;
            }

            mike =
                crearPersonajeTemporal(
                    0x5c8fbd
                );

            mike.position.set(
                -1.6,
                0,
                3
            );

            escena.add(
                mike
            );
        }
    );


    // --------------------------------------------------------
    // MICAELA
    // --------------------------------------------------------

    loader.load(
        "./3D/micaela.glb",

        (gltf) => {

            if (!activa) {
                return;
            }

            micaela =
                gltf.scene;

            micaela.scale.setScalar(
                1.4
            );

            micaela.position.set(
                1.6,
                0,
                3
            );

            micaela.rotation.y =
                -0.15;

            prepararPersonaje(
                micaela
            );

            escena.add(
                micaela
            );
        },

        undefined,

        () => {

            if (!activa) {
                return;
            }

            micaela =
                crearPersonajeTemporal(
                    0xd58a9e
                );

            micaela.position.set(
                1.6,
                0,
                3
            );

            escena.add(
                micaela
            );
        }
    );
}


// ============================================================
// PREPARAR PERSONAJE
// ============================================================

function prepararPersonaje(
    personaje
) {

    personaje.traverse(
        (objeto) => {

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
}


// ============================================================
// PERSONAJE TEMPORAL
// ============================================================

function crearPersonajeTemporal(
    color
) {

    const grupo =
        new THREE.Group();


    const cuerpo =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.55,
                1.1,
                6,
                12
            ),
            new THREE.MeshStandardMaterial({
                color
            })
        );

    cuerpo.position.y =
        1.15;

    cuerpo.castShadow = true;

    grupo.add(
        cuerpo
    );


    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf3d1b5
            })
        );

    cabeza.position.y =
        2.1;

    cabeza.castShadow = true;

    grupo.add(
        cabeza
    );

    return grupo;
}


// ============================================================
// HUEVO
// ============================================================

function crearHuevo() {

    const grupo =
        new THREE.Group();


    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const huevoBase =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.85,
                32,
                24
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf4e6c5,
                roughness: 0.8
            })
        );

    huevoBase.scale.set(
        0.82,
        1.15,
        0.82
    );

    huevoBase.castShadow = true;

    grupo.add(
        huevoBase
    );


    // --------------------------------------------------------
    // FRANJA AZUL
    // --------------------------------------------------------

    const azul =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.69,
                0.09,
                8,
                32
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4b9bd8
            })
        );

    azul.rotation.x =
        Math.PI / 2;

    azul.position.y =
        0.05;

    grupo.add(
        azul
    );


    // --------------------------------------------------------
    // FRANJA VERDE
    // --------------------------------------------------------

    const verde =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.71,
                0.08,
                8,
                32
            ),
            new THREE.MeshStandardMaterial({
                color: 0x72a84a
            })
        );

    verde.rotation.x =
        Math.PI / 2;

    verde.position.y =
        -0.32;

    grupo.add(
        verde
    );


    // --------------------------------------------------------
    // PARTE AMARILLA
    // --------------------------------------------------------

    const amarillo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.55,
                20,
                12,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.45
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf4c84c
            })
        );

    amarillo.scale.set(
        0.95,
        1.1,
        0.95
    );

    amarillo.position.y =
        0.45;

    grupo.add(
        amarillo
    );


    // --------------------------------------------------------
    // ESTADO INICIAL
    // --------------------------------------------------------

    grupo.visible = false;

    grupo.position.set(
        0,
        0.9,
        -1
    );

    huevo =
        grupo;

    escena.add(
        huevo
    );
}


// ============================================================
// INTERFAZ
// ============================================================

function crearInterfazDialogo() {

    const anterior =
        document.getElementById(
            "cinematicaUI"
        );

    if (anterior) {
        anterior.remove();
    }


    const capa =
        document.createElement(
            "div"
        );

    capa.id =
        "cinematicaUI";

    capa.style.position =
        "fixed";

    capa.style.left =
        "0";

    capa.style.right =
        "0";

    capa.style.bottom =
        "0";

    capa.style.padding =
        "20px";

    capa.style.zIndex =
        "50000";

    capa.style.pointerEvents =
        "none";

    capa.style.textAlign =
        "center";

    capa.style.boxSizing =
        "border-box";


    nombreElemento =
        document.createElement(
            "div"
        );

    nombreElemento.style.color =
        "#ffe36b";

    nombreElemento.style.fontSize =
        "22px";

    nombreElemento.style.fontWeight =
        "bold";

    nombreElemento.style.marginBottom =
        "8px";


    dialogoElemento =
        document.createElement(
            "div"
        );

    dialogoElemento.style.maxWidth =
        "700px";

    dialogoElemento.style.margin =
        "auto";

    dialogoElemento.style.padding =
        "16px 22px";

    dialogoElemento.style.borderRadius =
        "14px";

    dialogoElemento.style.background =
        "rgba(0,0,0,0.72)";

    dialogoElemento.style.color =
        "white";

    dialogoElemento.style.fontSize =
        "20px";

    dialogoElemento.style.fontFamily =
        "Arial, sans-serif";

    dialogoElemento.style.boxSizing =
        "border-box";


    capa.appendChild(
        nombreElemento
    );

    capa.appendChild(
        dialogoElemento
    );

    document.body.appendChild(
        capa
    );
}


// ============================================================
// MOSTRAR DIÁLOGO
// ============================================================

function mostrarDialogo(
    nombre,
    texto
) {

    if (
        !dialogoElemento ||
        !nombreElemento
    ) {
        return;
    }

    nombreElemento.textContent =
        nombre;

    dialogoElemento.textContent =
        texto;
}


// ============================================================
// OCULTAR DIÁLOGO
// ============================================================

function ocultarDialogo() {

    if (
        !dialogoElemento ||
        !nombreElemento
    ) {
        return;
    }

    nombreElemento.textContent =
        "";

    dialogoElemento.textContent =
        "";
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
// CREAR POLLO RESULTADO
// ============================================================

function crearPolloResultado(tipo) {

    const grupo =
        new THREE.Group();

    // --------------------------------------------------------
    // COLORES
    // --------------------------------------------------------

    const esZombie =
        tipo === "zombie";

    const esPollito =
        tipo === "pollito";

    const colorCuerpo =
        esZombie
            ? 0x6fa85c
            : 0xf4c928;

    const colorAla =
        esZombie
            ? 0x578746
            : 0xe5b923;


    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                24,
                18
            ),
            new THREE.MeshStandardMaterial({
                color: colorCuerpo,
                roughness: 0.9
            })
        );

    cuerpo.scale.set(
        1,
        1.15,
        0.95
    );

    cuerpo.position.y =
        0.65;

    cuerpo.castShadow = true;

    grupo.add(cuerpo);


    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                24,
                18
            ),
            new THREE.MeshStandardMaterial({
                color: colorCuerpo
            })
        );

    cabeza.position.y =
        1.35;

    cabeza.castShadow = true;

    grupo.add(cabeza);


    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    const materialOjo =
        new THREE.MeshStandardMaterial({
            color: 0x111111
        });

    for (
        const x of [-0.13, 0.13]
    ) {

        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.055,
                    12,
                    12
                ),
                materialOjo
            );

        ojo.position.set(
            x,
            1.40,
            0.34
        );

        grupo.add(ojo);
    }


    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.11,
                0.25,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xff9d24
            })
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        1.28,
        0.43
    );

    grupo.add(pico);


    // --------------------------------------------------------
    // CRESTA
    // --------------------------------------------------------

    const materialCresta =
        new THREE.MeshStandardMaterial({
            color: 0xd93636
        });

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const cresta =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.10,
                    12,
                    10
                ),
                materialCresta
            );

        cresta.scale.set(
            0.8,
            1.15,
            0.7
        );

        cresta.position.set(
            (i - 1) * 0.10,
            1.68,
            0
        );

        grupo.add(cresta);
    }


    // --------------------------------------------------------
    // ALAS
    // --------------------------------------------------------

    const materialAla =
        new THREE.MeshStandardMaterial({
            color: colorAla,
            roughness: 1
        });

    const alaIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.25,
                18,
                14
            ),
            materialAla
        );

    alaIzq.scale.set(
        0.55,
        1.15,
        0.35
    );

    alaIzq.position.set(
        -0.42,
        0.65,
        0
    );

    alaIzq.rotation.z =
        -0.35;

    grupo.add(alaIzq);


    const alaDer =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.25,
                18,
                14
            ),
            materialAla
        );

    alaDer.scale.set(
        0.55,
        1.15,
        0.35
    );

    alaDer.position.set(
        0.42,
        0.65,
        0
    );

    alaDer.rotation.z =
        0.35;

    grupo.add(alaDer);


    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    const materialPata =
        new THREE.MeshStandardMaterial({
            color: 0xffa326
        });

    for (
        const x of [-0.16, 0.16]
    ) {

        const pata =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.045,
                    0.055,
                    0.30,
                    10
                ),
                materialPata
            );

        pata.position.set(
            x,
            0.10,
            0
        );

        grupo.add(pata);


        const pie =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.09,
                    12,
                    8
                ),
                materialPata
            );

        pie.scale.set(
            1.4,
            0.45,
            1.8
        );

        pie.position.set(
            x,
            -0.06,
            0.06
        );

        grupo.add(pie);
    }


    // --------------------------------------------------------
    // GORRA
    // --------------------------------------------------------

    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.39,
                24,
                12,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe8c36a,
                roughness: 0.8
            })
        );

    gorra.position.y =
        1.55;

    gorra.scale.set(
        1.05,
        0.55,
        1
    );

    grupo.add(gorra);


    // --------------------------------------------------------
    // VISERA
    // --------------------------------------------------------

    const visera =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.42,
                0.06,
                0.20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd7ad4f
            })
        );

    visera.position.set(
        0,
        1.47,
        0.34
    );

    visera.rotation.x =
        -0.12;

    grupo.add(visera);


    // --------------------------------------------------------
    // LETRA N
    // --------------------------------------------------------

    const canvasN =
        document.createElement(
            "canvas"
        );

    canvasN.width = 128;
    canvasN.height = 128;

    const ctxN =
        canvasN.getContext("2d");

    ctxN.clearRect(
        0,
        0,
        128,
        128
    );

    ctxN.fillStyle =
        "#5C3A21";

    ctxN.font =
        "bold 92px Arial";

    ctxN.textAlign =
        "center";

    ctxN.textBaseline =
        "middle";

    ctxN.fillText(
        "N",
        64,
        67
    );


    const texturaN =
        new THREE.CanvasTexture(
            canvasN
        );

    const letraN =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                0.22,
                0.22
            ),
            new THREE.MeshBasicMaterial({
                map: texturaN,
                transparent: true
            })
        );

    letraN.position.set(
        0,
        1.57,
        0.365
    );

    grupo.add(letraN);


    // --------------------------------------------------------
    // ZOMBIE
    // --------------------------------------------------------

    if (esZombie) {

        const materialParche =
            new THREE.MeshStandardMaterial({
                color: 0x8fa68e
            });


        const parche1 =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.13,
                    12,
                    8
                ),
                materialParche
            );

        parche1.scale.set(
            1.4,
            0.7,
            0.25
        );

        parche1.position.set(
            -0.28,
            0.68,
            0.42
        );

        grupo.add(parche1);


        const parche2 =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.10,
                    12,
                    8
                ),
                materialParche
            );

        parche2.scale.set(
            1.2,
            0.7,
            0.25
        );

        parche2.position.set(
            0.26,
            0.48,
            0.40
        );

        grupo.add(parche2);
    }


    // --------------------------------------------------------
    // POLLITO NOOB
    // --------------------------------------------------------

    if (esPollito) {

        grupo.scale.setScalar(
            0.62
        );

        const detalle =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.16,
                    0.035,
                    8,
                    20
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x62d6ff
                })
            );

        detalle.rotation.x =
            Math.PI / 2;

        detalle.position.set(
            0,
            0.68,
            0.43
        );

        grupo.add(
            detalle
        );
    }


    // --------------------------------------------------------
    // POSICIÓN FINAL
    // --------------------------------------------------------

    grupo.position.set(
        0,
        0,
        -1.8
    );

    return grupo;
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    if (
        resultadoMostrado
    ) {
        return;
    }

    resultadoMostrado =
        true;

    resultado =
        obtenerResultado();

    polloResultado =
        crearPolloResultado(
            resultado
        );

    escena.add(
        polloResultado
    );


    if (
        resultado === "noob"
    ) {

        mostrarDialogo(
            "MIKE",
            "¡Es un Pollo Noob!"
        );

    } else if (
        resultado === "zombie"
    ) {

        mostrarDialogo(
            "MIKE",
            "¡¿Un Pollo Zombie?!"
        );

    } else {

        mostrarDialogo(
            "MICAELA",
            "¡Es un Pollito Noob!"
        );
    }
}


// ============================================================
// ANIMAR RESULTADO
// ============================================================

function animarResultado(
    delta,
    tiempo
) {

    if (
        !polloResultado
    ) {
        return;
    }

    polloResultado.rotation.y +=
        delta * 0.8;

    polloResultado.position.y =
        Math.sin(
            tiempo * 3
        ) * 0.08;
}


// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animar() {

    if (!activa) {
        return;
    }

    requestAnimationFrame(
        animar
    );

    if (
        !renderer ||
        !escena ||
        !camara
    ) {
        return;
    }

    const delta =
        reloj
            ? reloj.getDelta()
            : 0.016;

    tiempoFase +=
        delta;


    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    camara.position.x =
        Math.sin(
            performance.now() *
            0.00025
        ) * 0.25;

    camara.position.y =
        4.5 +
        Math.sin(
            performance.now() *
            0.0004
        ) * 0.08;

    camara.lookAt(
        0,
        2.2,
        -6
    );


    // --------------------------------------------------------
    // FASE 0
    // --------------------------------------------------------

    if (
        fase === 0
    ) {

        ocultarDialogo();

        if (
            tiempoFase >= 2
        ) {

            fase = 1;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 1
    // --------------------------------------------------------

    else if (
        fase === 1
    ) {

        mostrarDialogo(
            "MICAELA",
            "¿Dónde estamos?"
        );

        mirarPersonajes();

        if (
            tiempoFase >= 3
        ) {

            fase = 2;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 2
    // --------------------------------------------------------

    else if (
        fase === 2
    ) {

        mostrarDialogo(
            "MIKE",
            "No sé... pero se ve algo a lo lejos."
        );

        mirarPersonajes();

        if (
            tiempoFase >= 3.5
        ) {

            fase = 3;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 3
    // --------------------------------------------------------

    else if (
        fase === 3
    ) {

        mostrarDialogo(
            "",
            "🐤 Pío... pío..."
        );

        if (
            tiempoFase >= 2.5
        ) {

            fase = 4;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 4
    // --------------------------------------------------------

    else if (
        fase === 4
    ) {

        mostrarDialogo(
            "MICAELA",
            "¿Qué es ese sonido?"
        );

        if (
            tiempoFase >= 2.5
        ) {

            fase = 5;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 5
    // --------------------------------------------------------

    else if (
        fase === 5
    ) {

        mostrarDialogo(
            "MIKE",
            "Parece un pollo..."
        );

        if (
            tiempoFase >= 2.5
        ) {

            fase = 6;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 6
    // --------------------------------------------------------

    else if (
        fase === 6
    ) {

        mostrarDialogo(
            "MIKE",
            "¡Mira! ¡Un huevo!"
        );

        if (huevo) {

            huevo.visible =
                true;

            huevo.position.y =
                6;
        }

        fase = 7;
        tiempoFase = 0;
    }


    // --------------------------------------------------------
    // FASE 7
    // --------------------------------------------------------

    else if (
        fase === 7
    ) {

        if (huevo) {

            huevo.position.y =
                THREE.MathUtils.lerp(
                    huevo.position.y,
                    0.9,
                    Math.min(
                        delta * 4,
                        1
                    )
                );

            huevo.rotation.y +=
                delta * 4;

            huevo.rotation.z +=
                delta * 2;
        }

        if (
            tiempoFase >= 2.5
        ) {

            fase = 8;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 8
    // --------------------------------------------------------

    else if (
        fase === 8
    ) {

        if (huevo) {

            huevo.rotation.y +=
                delta * 8;

            huevo.rotation.z +=
                delta * 3;
        }

        mostrarDialogo(
            "",
            "✨"
        );

        if (
            tiempoFase >= 3
        ) {

            if (huevo) {
                huevo.visible =
                    false;
            }

            mostrarResultado();

            fase = 9;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 9
    // --------------------------------------------------------

    else if (
        fase === 9
    ) {

        animarResultado(
            delta,
            tiempoFase
        );

        if (
            tiempoFase >= 4
        ) {

            mostrarDialogo(
                "MIKE",
                "Creo que deberíamos llevarlo con nosotros."
            );

            fase = 10;
            tiempoFase = 0;
        }
    }


    // --------------------------------------------------------
    // FASE 10
    // --------------------------------------------------------

    else if (
        fase === 10
    ) {

        animarResultado(
            delta,
            tiempoFase
        );

        if (
            tiempoFase >= 3
        ) {

            mostrarDialogo(
                "",
                "✨ Preparando la granja..."
            );

            terminada =
                true;
        }
    }


    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    renderer.render(
        escena,
        camara
    );
}


// ============================================================
// MIRAR PERSONAJES
// ============================================================

function mirarPersonajes() {

    if (
        !mike ||
        !micaela
    ) {
        return;
    }

    mike.lookAt(
        micaela.position.x,
        mike.position.y,
        micaela.position.z
    );

    micaela.lookAt(
        mike.position.x,
        micaela.position.y,
        mike.position.z
    );
}


// ============================================================
// COMPROBAR CINEMÁTICA
// ============================================================

export function cinematicaTerminada() {

    return terminada;
}


// ============================================================
// DETENER CINEMÁTICA
// ============================================================

export function detenerCinematica() {

    activa = false;

    terminada = true;

    const capa =
        document.getElementById(
            "cinematicaUI"
        );

    if (capa) {
        capa.remove();
    }

    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.remove();
    }

    window.removeEventListener(
        "resize",
        ajustarPantalla
    );

    if (renderer) {
        renderer.dispose();
    }

    renderer = null;
    escena = null;
    camara = null;
    reloj = null;

    mike = null;
    micaela = null;
    huevo = null;
    polloResultado = null;
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

    const ancho =
        Math.max(
            window.innerWidth,
            1
        );

    const alto =
        Math.max(
            window.innerHeight,
            1
        );

    camara.aspect =
        ancho / alto;

    camara.updateProjectionMatrix();

    renderer.setSize(
        ancho,
        alto
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );
            }
