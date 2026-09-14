// ============================================================
// EGGARO
// escenaCinematica.js
//
// CINEMÁTICA INICIAL
//
// BOSQUE
//   ↓
// MIKE + MICAELA
//   ↓
// DIÁLOGO
//   ↓
// PÍO PÍO
//   ↓
// HUEVO
//   ↓
// CAÍDA + GIRO
//   ↓
// SORTEO
//   98% NOOB
//   1% ZOMBIE
//   1% POLLITO NOOB
// ============================================================

import * as THREE from "three";
import { GLTFLoader } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

// ============================================================
// VARIABLES
// ============================================================

let escena;
let camara;
let renderer;
let reloj;

let mike = null;
let micaela = null;

let huevo = null;
let polloResultado = null;

let fase = 0;
let tiempoFase = 0;

let dialogoElemento = null;
let nombreElemento = null;

let terminada = false;

const loader =
    new GLTFLoader();

// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

export function iniciarCinematica(contenedor) {

    // --------------------------------------------------------
    // ESCENA
    // --------------------------------------------------------

    escena =
        new THREE.Scene();

    escena.background =
        new THREE.Color(0x8aa89a);

    escena.fog =
        new THREE.Fog(
            0x8aa89a,
            18,
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
        16
    );

    camara.lookAt(
        0,
        2.5,
        -8
    );

    // --------------------------------------------------------
    // RENDERER
    // --------------------------------------------------------

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference:
                "high-performance"
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

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.1;

    contenedor.appendChild(
        renderer.domElement
    );

    // --------------------------------------------------------
    // RELOJ
    // --------------------------------------------------------

    reloj =
        new THREE.Clock();

    // --------------------------------------------------------
    // BOSQUE
    // --------------------------------------------------------

    crearBosque();

    // --------------------------------------------------------
    // ILUMINACIÓN
    // --------------------------------------------------------

    crearIluminacion();

    // --------------------------------------------------------
    // PERSONAJES
    // --------------------------------------------------------

    cargarPersonajes();

    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    crearHuevo();

    // --------------------------------------------------------
    // DIÁLOGO
    // --------------------------------------------------------

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
                color: 0x315c35,
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

    for (let i = 0; i < 900; i++) {

        const pasto =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.045,
                    0.35,
                    3
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x477a3d,
                    roughness: 1
                })
            );

        const x =
            (Math.random() - 0.5) * 75;

        const z =
            (Math.random() - 0.5) * 70;

        pasto.position.set(
            x,
            0.17,
            z
        );

        const escala =
            0.5 +
            Math.random() * 1.7;

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

    for (let i = 0; i < 55; i++) {

        crearArbol(
            -35 +
            Math.random() * 70,

            0,

            -10 -
            Math.random() * 50,

            0.8 +
            Math.random() * 1.5
        );
    }

    // --------------------------------------------------------
    // ARBUSTOS
    // --------------------------------------------------------

    for (let i = 0; i < 35; i++) {

        const arbusto =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.8 +
                    Math.random() * 0.8,
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

            0.6,

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
                0.3,
                0.5,
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

    for (let i = 0; i < 4; i++) {

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
            4.5 +
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
        2048;

    luz.shadow.mapSize.height =
        2048;

    escena.add(
        luz
    );
}

// ============================================================
// CARGAR MIKE Y MICAELA
// ============================================================

function cargarPersonajes() {

    loader.load(
        "./3D/mike.glb",

        (gltf) => {

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

        (error) => {

            console.warn(
                "No se pudo cargar mike.glb",
                error
            );

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

    loader.load(
        "./3D/micaela.glb",

        (gltf) => {

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

        (error) => {

            console.warn(
                "No se pudo cargar micaela.glb",
                error
            );

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
    // CUERPO DEL HUEVO
    // --------------------------------------------------------

    const geometria =
        new THREE.SphereGeometry(
            0.85,
            32,
            24
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xf4e6c5,
            roughness: 0.8
        });

    const huevoBase =
        new THREE.Mesh(
            geometria,
            material
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

    const franjaAzul =
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

    franjaAzul.rotation.x =
        Math.PI / 2;

    franjaAzul.position.y =
        0.05;

    grupo.add(
        franjaAzul
    );

    // --------------------------------------------------------
    // FRANJA VERDE
    // --------------------------------------------------------

    const franjaVerde =
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

    franjaVerde.rotation.x =
        Math.PI / 2;

    franjaVerde.position.y =
        -0.32;

    grupo.add(
        franjaVerde
    );

    // --------------------------------------------------------
    // PARTE SUPERIOR AMARILLA
    // --------------------------------------------------------

    const parteAmarilla =
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

    parteAmarilla.scale.set(
        0.95,
        1.1,
        0.95
    );

    parteAmarilla.position.y =
        0.45;

    grupo.add(
        parteAmarilla
    );

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
// INTERFAZ DE DIÁLOGO
// ============================================================

function crearInterfazDialogo() {

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
// DIÁLOGO
// ============================================================

function mostrarDialogo(
    nombre,
    texto
) {

    if (!dialogoElemento) {
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

    if (!dialogoElemento) {
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
// CREAR POLLO
// ============================================================

function crearPollo(
    tipo
) {

    const grupo =
        new THREE.Group();

    let colorCuerpo =
        0xf2c84b;

    let colorPico =
        0xf08b32;

    let colorPata =
        0xd88732;

    let escala =
        1;

    // --------------------------------------------------------
    // ZOMBIE
    // --------------------------------------------------------

    if (tipo === "zombie") {

        colorCuerpo =
            0x6e9b58;

    }

    // --------------------------------------------------------
    // POLLITO
    // --------------------------------------------------------

    if (tipo === "pollito") {

        escala =
            0.62;

    }

    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo = new THREE.Group();

    // Cuerpo principal
    const geometriaCuerpo = new THREE.SphereGeometry(
        0.48,
        24,
        18
    );

    const materialCuerpo = new THREE.MeshStandardMaterial({
        color:
            tipo === "zombie"
                ? 0x6fa85c
                : 0xf4c928,
        roughness: 0.9
    });

    const cuerpoMesh = new THREE.Mesh(
        geometriaCuerpo,
        materialCuerpo
    );

    cuerpoMesh.scale.set(
        1.0,
        1.15,
        0.95
    );

    cuerpo.add(cuerpoMesh);

    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.38,
            24,
            18
        ),
        materialCuerpo
    );

    cabeza.position.y = 0.52;
    cabeza.scale.set(
        0.95,
        1.0,
        0.95
    );

    cuerpo.add(cabeza);

    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    const materialOjo = new THREE.MeshStandardMaterial({
        color: 0x111111
    });

    const ojoIzq = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.055,
            12,
            12
        ),
        materialOjo
    );

    ojoIzq.position.set(
        -0.13,
        0.59,
        0.34
    );

    cuerpo.add(ojoIzq);

    const ojoDer = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.055,
            12,
            12
        ),
        materialOjo
    );

    ojoDer.position.set(
        0.13,
        0.59,
        0.34
    );

    cuerpo.add(ojoDer);

    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico = new THREE.Mesh(
        new THREE.ConeGeometry(
            0.11,
            0.25,
            12
        ),
        new THREE.MeshStandardMaterial({
            color: 0xff9d24
        })
    );

    pico.rotation.x = Math.PI / 2;
    pico.position.set(
        0,
        0.48,
        0.43
    );

    cuerpo.add(pico);

    // --------------------------------------------------------
    // CRESTA
    // --------------------------------------------------------

    const materialCresta =
        new THREE.MeshStandardMaterial({
            color: 0xd93636
        });

    for (let i = 0; i < 3; i++) {

        const cresta = new THREE.Mesh(
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
            0.86,
            0
        );

        cuerpo.add(cresta);
    }

    // --------------------------------------------------------
    // ALAS
    // --------------------------------------------------------

    const materialAla =
        new THREE.MeshStandardMaterial({
            color:
                tipo === "zombie"
                    ? 0x578746
                    : 0xe5b923,
            roughness: 1
        });

    const alaIzq = new THREE.Mesh(
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
        0.05,
        0
    );

    alaIzq.rotation.z = -0.35;

    cuerpo.add(alaIzq);

    const alaDer = new THREE.Mesh(
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
        0.05,
        0
    );

    alaDer.rotation.z = 0.35;

    cuerpo.add(alaDer);

    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    const materialPata =
        new THREE.MeshStandardMaterial({
            color: 0xffa326
        });

    for (const x of [-0.16, 0.16]) {

        const pata = new THREE.Mesh(
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
            -0.55,
            0
        );

        cuerpo.add(pata);

        // Pie
        const pie = new THREE.Mesh(
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
            -0.70,
            0.06
        );

        cuerpo.add(pie);
    }

    // --------------------------------------------------------
    // GORRA NOOB
    // --------------------------------------------------------

    const gorra = new THREE.Mesh(
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

    gorra.position.y = 0.78;
    gorra.scale.set(
        1.05,
        0.55,
        1.0
    );

    cuerpo.add(gorra);

    // Visera
    const visera = new THREE.Mesh(
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
        0.70,
        0.34
    );

    visera.rotation.x = -0.12;

    cuerpo.add(visera);

    // --------------------------------------------------------
    // LETRA N DE LA GORRA
    // --------------------------------------------------------

    const canvasN = document.createElement("canvas");

    canvasN.width = 128;
    canvasN.height = 128;

    const ctxN = canvasN.getContext("2d");

    ctxN.clearRect(
        0,
        0,
        128,
        128
    );

    ctxN.fillStyle = "#5C3A21";
    ctxN.font = "bold 92px Arial";
    ctxN.textAlign = "center";
    ctxN.textBaseline = "middle";

    ctxN.fillText(
        "N",
        64,
        67
    );

    const texturaN =
        new THREE.CanvasTexture(canvasN);

    const materialN =
        new THREE.MeshBasicMaterial({
            map: texturaN,
            transparent: true
        });

    const letraN = new THREE.Mesh(
        new THREE.PlaneGeometry(
            0.22,
            0.22
        ),
        materialN
    );

    letraN.position.set(
        0,
        0.80,
        0.365
    );

    cuerpo.add(letraN);

    // --------------------------------------------------------
    // DETALLES DEL ZOMBIE
    // --------------------------------------------------------

    if (tipo === "zombie") {

        const materialParche =
            new THREE.MeshStandardMaterial({
                color: 0x8fa68e
            });

        const parche1 = new THREE.Mesh(
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
            0.08,
            0.42
        );

        cuerpo.add(parche1);

        const parche2 = new THREE.Mesh(
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
            -0.10,
            0.40
        );

        cuerpo.add(parche2);
    }

    // --------------------------------------------------------
    // POLLITO NOOB
    // --------------------------------------------------------

    if (tipo === "pollito") {

        cuerpo.scale.set(
            0.62,
            0.62,
            0.62
        );

        // Detalle de color en el pecho
        const detallePollito =
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

        detallePollito.rotation.x =
            Math.PI / 2;

        detallePollito.position.set(
            0,
            0.05,
            0.43
        );

        cuerpo.add(
            detallePollito
        );
    }

    // --------------------------------------------------------
    // ESCALA Y POSICIÓN FINAL
    // --------------------------------------------------------

    cuerpo.position.set(
        0,
        0.75,
        -0.5
    );

    cuerpo.rotation.y =
        Math.PI;

    grupo.add(cuerpo);

    return grupo;
}
    // --------------------------------------------------------
    // AGREGAR POLLO A LA ESCENA
    // --------------------------------------------------------

    polloResultado = crearPolloResultado(resultado);

    polloResultado.position.set(
        0,
        0,
        -2
    );

    polloResultado.scale.set(
        1,
        1,
        1
    );

    escena.add(polloResultado);

    // --------------------------------------------------------
    // MOSTRAR NOMBRE DEL RESULTADO
    // --------------------------------------------------------

    if (resultado === "noob") {

        mostrarDialogo(
            "POLLO NOOB",
            "¡Nos tocó un Pollo Noob! 🐔"
        );

    } else if (resultado === "zombie") {

        mostrarDialogo(
            "POLLO ZOMBIE",
            "¡Increíble! ¡Salió un Pollo Zombie! 🧟"
        );

    } else {

        mostrarDialogo(
            "POLLITO NOOB",
            "¡Es un Pollito Noob! 🐣"
        );
    }

    // --------------------------------------------------------
    // ANIMACIÓN DEL RESULTADO
    // --------------------------------------------------------

    let tiempoResultado = 0;

    function animarResultado(delta) {

        if (!polloResultado) {
            return;
        }

        tiempoResultado += delta;

        // Movimiento suave
        polloResultado.position.y =
            Math.sin(tiempoResultado * 3) * 0.08;

        // Giro
        polloResultado.rotation.y +=
            delta * 0.8;

    }

    // --------------------------------------------------------
    // TRANSICIÓN FINAL
    // --------------------------------------------------------

    setTimeout(() => {

        if (polloResultado) {

            mostrarDialogo(
                "MIKE",
                "Creo que deberíamos llevarlo con nosotros."
            );
        }

    }, 3000);

    setTimeout(() => {

        terminada = true;

        mostrarDialogo(
            "",
            "✨ Preparando la granja..."
        );

    }, 5000);
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
}


// ============================================================
// AJUSTAR PANTALLA
// ============================================================

function ajustarPantalla() {

    if (!camara || !renderer) {
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

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );
}
