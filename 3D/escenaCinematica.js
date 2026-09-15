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
// RESULTADOS 3D + HUEVO 3D + ANIMACIÓN FINAL
// ============================================================

let resultadoFinal = null;
let polloResultado = null;
let resultadoMostrado = false;
let tiempoResultado = 0;


// ============================================================
// SORTEO
// ============================================================

function obtenerResultado() {

    const numero = Math.random() * 100;

    if (numero < 98) {
        return "noob";
    }

    if (numero < 99) {
        return "zombie";
    }

    return "pollito";
}


// ============================================================
// HUEVO 3D
// DISEÑO: AMARILLO / AZUL / VERDE
// ============================================================

function crearHuevoResultadoFiel() {

    const grupo = new THREE.Group();

    const materialAmarillo = new THREE.MeshStandardMaterial({
        color: 0xFFD21F,
        roughness: 0.28,
        metalness: 0.05
    });

    const materialAzul = new THREE.MeshStandardMaterial({
        color: 0x168CF0,
        roughness: 0.25,
        metalness: 0.08
    });

    const materialVerde = new THREE.MeshStandardMaterial({
        color: 0x17B83A,
        roughness: 0.30,
        metalness: 0.05
    });

    const materialBorde = new THREE.MeshStandardMaterial({
        color: 0x18202A,
        roughness: 0.3,
        metalness: 0.2
    });


    // --------------------------------------------------------
    // GENERADOR DE SECCIÓN DE HUEVO
    // --------------------------------------------------------

    function crearSeccion(yMin, yMax, material) {

        const vertices = [];
        const indices = [];

        const segmentos = 64;
        const anillos = 18;

        for (let j = 0; j <= anillos; j++) {

            const t = j / anillos;

            const y = yMin + (yMax - yMin) * t;

            // Forma de huevo:
            // más ancho en el centro,
            // más estrecho en los extremos.

            const normalizado = y / 1.65;

            let radio =
                Math.sqrt(
                    Math.max(
                        0.08,
                        1 - normalizado * normalizado
                    )
                );

            radio *= 0.88;

            for (let i = 0; i <= segmentos; i++) {

                const a =
                    (i / segmentos) *
                    Math.PI *
                    2;

                const x =
                    Math.cos(a) * radio;

                const z =
                    Math.sin(a) * radio;

                vertices.push(
                    x,
                    y,
                    z
                );
            }
        }


        for (let j = 0; j < anillos; j++) {

            for (let i = 0; i < segmentos; i++) {

                const a =
                    j * (segmentos + 1) + i;

                const b = a + 1;

                const c =
                    a + (segmentos + 1);

                const d = c + 1;

                indices.push(
                    a, c, b,
                    b, c, d
                );
            }
        }


        const geometria =
            new THREE.BufferGeometry();

        geometria.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                vertices,
                3
            )
        );

        geometria.setIndex(indices);

        geometria.computeVertexNormals();


        const mesh =
            new THREE.Mesh(
                geometria,
                material
            );

        grupo.add(mesh);

        return mesh;
    }


    // --------------------------------------------------------
    // LAS 3 BANDAS
    // --------------------------------------------------------

    crearSeccion(
        0.48,
        1.65,
        materialAmarillo
    );

    crearSeccion(
        -0.48,
        0.48,
        materialAzul
    );

    crearSeccion(
        -1.65,
        -0.48,
        materialVerde
    );


    // --------------------------------------------------------
    // AROS OSCUROS
    // --------------------------------------------------------

    function crearAro(y) {

        const radio = 0.80;

        const geometria =
            new THREE.TorusGeometry(
                radio,
                0.045,
                12,
                64
            );

        const aro =
            new THREE.Mesh(
                geometria,
                materialBorde
            );

        aro.rotation.x =
            Math.PI / 2;

        aro.position.y = y;

        grupo.add(aro);
    }

    crearAro(0.48);
    crearAro(-0.48);


    // --------------------------------------------------------
    // BRILLO
    // --------------------------------------------------------

    const brillo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.94,
                32,
                24
            ),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.075
            })
        );

    brillo.scale.set(
        0.92,
        1.68,
        0.92
    );

    brillo.position.x = -0.08;
    brillo.position.z = 0.04;

    grupo.add(brillo);


    // --------------------------------------------------------
    // ESCALA
    // --------------------------------------------------------

    grupo.scale.set(
        1.0,
        1.08,
        1.0
    );


    return grupo;
}


// ============================================================
// POLLO / POLLITO RESULTADO
// ============================================================

function crearPolloResultado(tipo) {

    const grupo = new THREE.Group();


    // ========================================================
    // POLLITO NOOB
    // ========================================================

    if (
        tipo === "pollito" ||
        tipo === "pollitoNoob" ||
        tipo === "pollito_noob"
    ) {

        const amarillo =
            new THREE.MeshStandardMaterial({
                color: 0xFFD83D,
                roughness: 0.68
            });

        const amarilloClaro =
            new THREE.MeshStandardMaterial({
                color: 0xFFE86A,
                roughness: 0.65
            });

        const naranja =
            new THREE.MeshStandardMaterial({
                color: 0xFF981F,
                roughness: 0.55
            });


        // ----------------------------------------------------
        // CUERPO
        // ----------------------------------------------------

        const cuerpo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.78,
                    32,
                    24
                ),
                amarillo
            );

        cuerpo.scale.set(
            1.0,
            0.95,
            0.82
        );

        cuerpo.position.y = 1.02;

        grupo.add(cuerpo);


        // ----------------------------------------------------
        // PECHO
        // ----------------------------------------------------

        const pecho =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.62,
                    28,
                    20
                ),
                amarilloClaro
            );

        pecho.scale.set(
            1.0,
            0.95,
            0.52
        );

        pecho.position.set(
            0,
            1.0,
            0.55
        );

        grupo.add(pecho);


        // ----------------------------------------------------
        // CABEZA
        // ----------------------------------------------------

        const cabeza =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.87,
                    32,
                    24
                ),
                amarilloClaro
            );

        cabeza.scale.set(
            1.06,
            0.98,
            0.88
        );

        cabeza.position.y = 1.95;

        grupo.add(cabeza);


        // ----------------------------------------------------
        // MECHONES
        // ----------------------------------------------------

        function crearMechon(
            x,
            y,
            z,
            escala,
            rotacion
        ) {

            const mechon =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.25,
                        18,
                        12
                    ),
                    amarilloClaro
                );

            mechon.scale.set(
                escala,
                escala * 1.35,
                escala * 0.65
            );

            mechon.position.set(
                x,
                y,
                z
            );

            mechon.rotation.z =
                rotacion;

            grupo.add(mechon);
        }

        crearMechon(
            -0.76,
            1.88,
            0.05,
            0.75,
            -0.45
        );

        crearMechon(
            0.76,
            1.88,
            0.05,
            0.75,
            0.45
        );


        crearMechon(
            -0.60,
            1.55,
            0.30,
            0.45,
            -0.25
        );

        crearMechon(
            0.60,
            1.55,
            0.30,
            0.45,
            0.25
        );


        // ----------------------------------------------------
        // OJOS
        // ----------------------------------------------------

        function crearOjo(x) {

            const ojo =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.235,
                        24,
                        20
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x080808,
                        roughness: 0.2
                    })
                );

            ojo.scale.set(
                1,
                1.18,
                0.55
            );

            ojo.position.set(
                x,
                2.04,
                0.78
            );

            grupo.add(ojo);


            const brilloGrande =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.075,
                        16,
                        10
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF
                    })
                );

            brilloGrande.position.set(
                x - 0.075,
                2.13,
                0.92
            );

            grupo.add(brilloGrande);


            const brilloPequeno =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.035,
                        12,
                        8
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF
                    })
                );

            brilloPequeno.position.set(
                x + 0.075,
                1.97,
                0.92
            );

            grupo.add(brilloPequeno);
        }

        crearOjo(-0.33);
        crearOjo(0.33);


        // ----------------------------------------------------
        // MEJILLAS
        // ----------------------------------------------------

        function crearMejilla(x) {

            const mejilla =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.13,
                        16,
                        12
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xFF9C9C,
                        transparent: true,
                        opacity: 0.72
                    })
                );

            mejilla.scale.set(
                1.5,
                0.75,
                0.35
            );

            mejilla.position.set(
                x,
                1.74,
                0.79
            );

            grupo.add(mejilla);
        }

        crearMejilla(-0.55);
        crearMejilla(0.55);


        // ----------------------------------------------------
        // PICO
        // ----------------------------------------------------

        const pico =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.18,
                    0.30,
                    4
                ),
                naranja
            );

        pico.rotation.x =
            Math.PI / 2;

        pico.position.set(
            0,
            1.80,
            0.94
        );

        grupo.add(pico);


        // ----------------------------------------------------
        // GORRA
        // ----------------------------------------------------

        const gorra =
            new THREE.Group();


        const copa =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.62,
                    32,
                    22
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xFFD21F,
                    roughness: 0.45
                })
            );

        copa.scale.set(
            1.12,
            0.75,
            0.95
        );

        copa.position.y = 2.61;

        gorra.add(copa);


        // VISERA

        const visera =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.56,
                    32,
                    16
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xFFC21A,
                    roughness: 0.42
                })
            );

        visera.scale.set(
            1.45,
            0.22,
            0.75
        );

        visera.position.set(
            0,
            2.42,
            0.55
        );

        gorra.add(visera);


        // ----------------------------------------------------
        // N DE LA GORRA
        // ----------------------------------------------------

        const nMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x25345E,
                roughness: 0.32,
                metalness: 0.08
            });


        const nGroup =
            new THREE.Group();


        const nIzquierda =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.105,
                    0.34,
                    0.055
                ),
                nMaterial
            );

        nIzquierda.position.x =
            -0.105;

        nGroup.add(nIzquierda);


        const nDerecha =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.105,
                    0.34,
                    0.055
                ),
                nMaterial
            );

        nDerecha.position.x =
            0.105;

        nGroup.add(nDerecha);


        const nDiagonal =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.105,
                    0.36,
                    0.055
                ),
                nMaterial
            );

        nDiagonal.rotation.z =
            -0.58;

        nGroup.add(nDiagonal);


        nGroup.position.set(
            0,
            2.66,
            0.62
        );

        gorra.add(nGroup);


        grupo.add(gorra);


        // ----------------------------------------------------
        // ALAS
        // ----------------------------------------------------

        function crearAla(
            x,
            lado
        ) {

            const ala =
                new THREE.Group();


            const base =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.43,
                        24,
                        16
                    ),
                    amarillo
                );

            base.scale.set(
                1.35,
                0.52,
                0.42
            );

            ala.add(base);


            for (let i = 0; i < 3; i++) {

                const pluma =
                    new THREE.Mesh(
                        new THREE.SphereGeometry(
                            0.20,
                            16,
                            10
                        ),
                        amarilloClaro
                    );

                pluma.scale.set(
                    1.35,
                    0.45,
                    0.35
                );

                pluma.position.set(
                    lado *
                    (0.18 + i * 0.17),

                    -0.04 -
                    i * 0.11,

                    0.06
                );

                pluma.rotation.z =
                    lado * -0.30;

                ala.add(pluma);
            }


            ala.position.set(
                x,
                1.12,
                0.15
            );

            ala.rotation.z =
                lado * 0.15;

            grupo.add(ala);
        }

        crearAla(-0.82, -1);
        crearAla(0.82, 1);


        // ----------------------------------------------------
        // ESTRELLA
        // ----------------------------------------------------

        const estrella =
            new THREE.Group();

        const estrellaMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xFFF04A,
                roughness: 0.35
            });


        const centroEstrella =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.18,
                    16,
                    12
                ),
                estrellaMaterial
            );

        estrella.add(
            centroEstrella
        );


        for (let i = 0; i < 5; i++) {

            const angulo =
                i *
                Math.PI *
                2 /
                5;

            const punta =
                new THREE.Mesh(
                    new THREE.ConeGeometry(
                        0.10,
                        0.30,
                        5
                    ),
                    estrellaMaterial
                );

            punta.position.set(
                Math.sin(angulo) * 0.18,
                Math.cos(angulo) * 0.18,
                0
            );

            punta.rotation.z =
                angulo;

            estrella.add(punta);
        }


        estrella.scale.set(
            0.85,
            0.85,
            0.35
        );

        estrella.position.set(
            0,
            1.05,
            0.76
        );

        grupo.add(estrella);
// ----------------------------------------------------
// PATAS
// ----------------------------------------------------

function crearPata(x) {

    const pierna =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.06,
                0.075,
                0.40,
                12
            ),
            naranja
        );

    pierna.position.set(
        x,
        0.34,
        0.20
    );

    grupo.add(pierna);


    const pie =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.15,
                16,
                10
            ),
            naranja
        );

    pie.scale.set(
        1.45,
        0.35,
        1.15
    );

    pie.position.set(
        x,
        0.10,
        0.26
    );

    grupo.add(pie);
}

crearPata(-0.25);
crearPata(0.25);


grupo.scale.setScalar(1.12);

return grupo;
}


// ============================================================
// POLLO NOOB
// ============================================================

if (
    tipo === "noob" ||
    tipo === "pollo" ||
    tipo === "polloNoob"
) {

    const amarillo =
        new THREE.MeshStandardMaterial({
            color: 0xFFD52A,
            roughness: 0.65
        });

    const amarilloClaro =
        new THREE.MeshStandardMaterial({
            color: 0xFFE45A,
            roughness: 0.62
        });

    const naranja =
        new THREE.MeshStandardMaterial({
            color: 0xFF941E,
            roughness: 0.55
        });


    // CUERPO

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.95,
                32,
                24
            ),
            amarillo
        );

    cuerpo.scale.set(
        1.05,
        1.12,
        0.90
    );

    cuerpo.position.y = 1.15;

    grupo.add(cuerpo);


    // CABEZA

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.90,
                32,
                24
            ),
            amarilloClaro
        );

    cabeza.scale.set(
        1.05,
        0.95,
        0.90
    );

    cabeza.position.y = 2.16;

    grupo.add(cabeza);


    // OJOS

    for (const x of [-0.34, 0.34]) {

        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.22,
                    24,
                    18
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x080808,
                    roughness: 0.2
                })
            );

        ojo.scale.set(
            1,
            1.18,
            0.55
        );

        ojo.position.set(
            x,
            2.23,
            0.82
        );

        grupo.add(ojo);


        const brillo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.06,
                    12,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF
                })
            );

        brillo.position.set(
            x - 0.07,
            2.31,
            0.94
        );

        grupo.add(brillo);
    }


    // PICO

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.19,
                0.30,
                4
            ),
            naranja
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        1.98,
        0.93
    );

    grupo.add(pico);


    // GORRA

    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.68,
                32,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xFFD21F,
                roughness: 0.45
            })
        );

    gorra.scale.set(
        1.15,
        0.72,
        0.98
    );

    gorra.position.y = 2.76;

    grupo.add(gorra);


    // VISERA

    const visera =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.55,
                28,
                14
            ),
            new THREE.MeshStandardMaterial({
                color: 0xFFC21A
            })
        );

    visera.scale.set(
        1.5,
        0.20,
        0.75
    );

    visera.position.set(
        0,
        2.56,
        0.55
    );

    grupo.add(visera);


    // N

    const nMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x25345E
        });

    const n =
        new THREE.Group();


    const n1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.11,
                0.38,
                0.05
            ),
            nMaterial
        );

    n1.position.x =
        -0.12;

    n.add(n1);


    const n2 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.11,
                0.38,
                0.05
            ),
            nMaterial
        );

    n2.position.x =
        0.12;

    n.add(n2);


    const n3 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.11,
                0.38,
                0.05
            ),
            nMaterial
        );

    n3.rotation.z =
        -0.58;

    n.add(n3);


    n.position.set(
        0,
        2.79,
        0.68
    );

    grupo.add(n);


    // ALAS

    for (const lado of [-1, 1]) {

        const ala =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.50,
                    24,
                    16
                ),
                amarillo
            );

        ala.scale.set(
            1.4,
            0.6,
            0.42
        );

        ala.position.set(
            lado * 0.92,
            1.20,
            0.18
        );

        ala.rotation.z =
            lado * -0.25;

        grupo.add(ala);
    }


    // PATAS

    for (const x of [-0.28, 0.28]) {

        const pata =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.07,
                    0.09,
                    0.48,
                    12
                ),
                naranja
            );

        pata.position.set(
            x,
            0.38,
            0.18
        );

        grupo.add(pata);


        const pie =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.18,
                    16,
                    10
                ),
                naranja
            );

        pie.scale.set(
            1.5,
            0.35,
            1
        );

        pie.position.set(
            x,
            0.12,
            0.25
        );

        grupo.add(pie);
    }


    grupo.scale.setScalar(1.05);

    return grupo;
}


// ============================================================
// POLLO ZOMBIE
// ============================================================

if (
    tipo === "zombie" ||
    tipo === "polloZombie"
) {

    const verde =
        new THREE.MeshStandardMaterial({
            color: 0x69A83F,
            roughness: 0.78
        });

    const verdeClaro =
        new THREE.MeshStandardMaterial({
            color: 0x7DBA4B,
            roughness: 0.75
        });

    const oscuro =
        new THREE.MeshStandardMaterial({
            color: 0x365B2D,
            roughness: 0.85
        });

    const naranja =
        new THREE.MeshStandardMaterial({
            color: 0xE58B22
        });


    // CUERPO

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.95,
                32,
                22
            ),
            verde
        );

    cuerpo.scale.set(
        1.05,
        1.15,
        0.90
    );

    cuerpo.position.y = 1.15;

    grupo.add(cuerpo);


    // CABEZA

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.88,
                28,
                20
            ),
            verdeClaro
        );

    cabeza.position.y = 2.15;

    grupo.add(cabeza);


    // OJOS

    for (const x of [-0.32, 0.32]) {

        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.19,
                    20,
                    14
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x111111
                })
            );

        ojo.position.set(
            x,
            2.20,
            0.78
        );

        grupo.add(ojo);
    }


    // PICO

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.18,
                0.30,
                4
            ),
            naranja
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        1.98,
        0.90
    );

    grupo.add(pico);


    // GORRA

    const gorra =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.65,
                28,
                18
            ),
            new THREE.MeshStandardMaterial({
                color: 0xD4A91C
            })
        );

    gorra.scale.set(
        1.15,
        0.70,
        0.95
    );

    gorra.position.y = 2.70;

    grupo.add(gorra);


    // MANCHAS

    const manchas = [
        [-0.48, 1.45, 0.72],
        [0.45, 1.05, 0.74],
        [-0.35, 2.25, 0.70],
        [0.30, 1.75, 0.72]
    ];


    for (const posicion of manchas) {

        const mancha =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.17,
                    14,
                    10
                ),
                oscuro
            );

        mancha.scale.set(
            1.4,
            0.8,
            0.3
        );

        mancha.position.set(
            posicion[0],
            posicion[1],
            posicion[2]
        );

        grupo.add(mancha);
    }


    // ALAS

    for (const lado of [-1, 1]) {

        const ala =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.48,
                    22,
                    14
                ),
                verde
            );

        ala.scale.set(
            1.4,
            0.55,
            0.4
        );

        ala.position.set(
            lado * 0.85,
            1.15,
            0.15
        );

        grupo.add(ala);
    }


    grupo.scale.setScalar(1.08);

    return grupo;
}


return grupo;
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    if (resultadoMostrado) {
        return;
    }

    resultadoMostrado = true;

    resultadoFinal =
        obtenerResultado();


    if (polloResultado) {

        if (escena) {
            escena.remove(
                polloResultado
            );
        }

        polloResultado = null;
    }


    polloResultado =
        crearPolloResultado(
            resultadoFinal
        );


    polloResultado.position.set(
        0,
        -1.8,
        -1.2
    );


    polloResultado.scale.multiplyScalar(
        0.01
    );


    escena.add(
        polloResultado
    );


    tiempoResultado = 0;
}


// ============================================================
// ANIMAR RESULTADO
// ============================================================

function animarResultado(delta) {

    if (!polloResultado) {
        return;
    }

    tiempoResultado += delta;


    if (tiempoResultado < 0.75) {

        const t =
            Math.min(
                tiempoResultado / 0.75,
                1
            );

        const suavizado =
            1 -
            Math.pow(
                1 - t,
                3
            );


        polloResultado.position.y =
            -1.8 +
            suavizado * 1.8;


        polloResultado.scale.setScalar(
            0.01 +
            suavizado * 1.10
        );
    }

    else {

        const t =
            tiempoResultado - 0.75;


        const salto =
            Math.abs(
                Math.sin(
                    t * 3.5
                )
            ) * 0.10;


        polloResultado.position.y =
            salto;


        polloResultado.rotation.y +=
            delta * 0.45;
    }
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


    const objetivo =
        new THREE.Vector3(
            0,
            1.2,
            0
        );


    mike.lookAt(
        objetivo
    );

    micaela.lookAt(
        objetivo
    );
}


// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animar() {

    if (!cinematicaActiva) {
        return;
    }


    requestAnimationFrame(
        animar
    );


    const ahora =
        performance.now();


    const delta =
        Math.min(
            (ahora -
                tiempoAnterior) /
                1000,
            0.05
        );


    tiempoAnterior =
        ahora;


    tiempoCinematica +=
        delta;


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
// ACTUALIZAR CINEMÁTICA
// ============================================================

function actualizarCinematica(delta) {

    if (!cinematicaActiva) {
        return;
    }


    if (faseCinematica === 0) {

        if (camara) {

            camara.position.x =
                Math.sin(
                    tiempoCinematica *
                    0.18
                ) * 0.7;

            camara.position.z =
                8 -
                tiempoCinematica *
                0.15;
        }


        if (
            tiempoCinematica > 3
        ) {

            faseCinematica = 1;
            tiempoCinematica = 0;

            mostrarDialogo(
                "¿Dónde estamos?"
            );
        }
    }


    else if (
        faseCinematica === 1
    ) {

        if (
            tiempoCinematica > 3
        ) {

            faseCinematica = 2;
            tiempoCinematica = 0;

            mostrarDialogo(
                "No sé... pero se ve algo a lo lejos."
            );
        }
    }


    else if (
        faseCinematica === 2
    ) {

        if (
            tiempoCinematica > 2.5
        ) {

            faseCinematica = 3;
            tiempoCinematica = 0;

            mostrarDialogo(
                "Pío... pío..."
            );
        }
    }


    else if (
        faseCinematica === 3
    ) {

        if (
            tiempoCinematica > 2
        ) {

            faseCinematica = 4;
            tiempoCinematica = 0;

            mostrarDialogo(
                "¿Qué es ese sonido?"
            );
        }
    }


    else if (
        faseCinematica === 4
    ) {

        if (
            tiempoCinematica > 2.5
        ) {

            faseCinematica = 5;
            tiempoCinematica = 0;

            mostrarDialogo(
                "Parece un pollo..."
            );
        }
    }


    else if (
        faseCinematica === 5
    ) {

        if (
            tiempoCinematica > 2.5
        ) {

            faseCinematica = 6;
            tiempoCinematica = 0;

            mostrarDialogo(
                "¡Mira! ¡Un huevo!"
            );
        }
    }


    else if (
        faseCinematica === 6
    ) {

        if (egg) {

            egg.visible = true;

            egg.position.y =
                2.5 -
                tiempoCinematica *
                1.4;

            egg.rotation.y +=
                delta * 2.4;

            egg.rotation.z +=
                delta * 0.7;
        }


        if (
            tiempoCinematica > 2
        ) {

            faseCinematica = 7;
            tiempoCinematica = 0;
        }
    }


    else if (
        faseCinematica === 7
    ) {

        if (egg) {

            egg.rotation.y +=
                delta * 5;

            egg.rotation.x =
                Math.sin(
                    tiempoCinematica * 5
                ) * 0.18;
        }


        if (
            tiempoCinematica > 2.5
        ) {

            faseCinematica = 8;
            tiempoCinematica = 0;

            if (egg) {
                egg.visible = false;
            }

            mostrarResultado();
        }
    }


    else if (
        faseCinematica === 8
    ) {

        animarResultado(
            delta
        );


        if (
            tiempoCinematica > 5
        ) {

            faseCinematica = 9;
            tiempoCinematica = 0;
        }
    }


    else if (
        faseCinematica === 9
    ) {

        if (polloResultado) {

            polloResultado.rotation.y +=
                delta * 0.5;
        }


        if (
            tiempoCinematica > 2
        ) {

            faseCinematica = 10;
            tiempoCinematica = 0;
        }
    }


    else if (
        faseCinematica === 10
    ) {

        if (
            tiempoCinematica > 1
        ) {

            cinematicaActiva = false;
            cinematicaFinalizada = true;

            ocultarDialogo();
        }
    }
}


// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

function iniciarCinematica(game) {

    cinematicaActiva = true;
    cinematicaFinalizada = false;

    resultadoFinal = null;
    resultadoMostrado = false;
    tiempoResultado = 0;

    faseCinematica = 0;
    tiempoCinematica = 0;
    tiempoAnterior =
        performance.now();


    escena =
        new THREE.Scene();

    escena.background =
        new THREE.Color(
            0x17251A
        );


    camara =
        new THREE.PerspectiveCamera(
            55,
            window.innerWidth /
            window.innerHeight,
            0.1,
            200
        );


    camara.position.set(
        0,
        3,
        8
    );


    camara.lookAt(
        0,
        1.4,
        0
    );


    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            1.5
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


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.15;


    document.body.appendChild(
        renderer.domElement
    );


    // ========================================================
    // LUCES
    // ========================================================

    const luzAmbiente =
        new THREE.HemisphereLight(
            0x9BC8FF,
            0x24331C,
            2.2
        );

    escena.add(
        luzAmbiente
    );


    const luzPrincipal =
        new THREE.DirectionalLight(
            0xFFE4A3,
            3.2
        );

    luzPrincipal.position.set(
        -6,
        10,
        6
    );

    luzPrincipal.castShadow =
        true;

    escena.add(
        luzPrincipal
    );

// ============================================================
// SUELO
// ============================================================

const suelo =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            80,
            80
        ),
        new THREE.MeshStandardMaterial({
            color: 0x345C32,
            roughness: 1
        })
    );

suelo.rotation.x =
    -Math.PI / 2;

suelo.position.y =
    -0.08;

suelo.receiveShadow =
    true;

escena.add(
    suelo
);


// ============================================================
// BOSQUE
// ============================================================

for (
    let i = 0;
    i < 45;
    i++
) {

    const angulo =
        Math.random() *
        Math.PI *
        2;

    const distancia =
        7 +
        Math.random() *
        18;

    const x =
        Math.cos(angulo) *
        distancia;

    const z =
        Math.sin(angulo) *
        distancia;


    // TRONCO

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.18,
                0.30,
                3.2,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x573A25,
                roughness: 0.9
            })
        );

    tronco.position.set(
        x,
        1.6,
        z
    );

    tronco.castShadow =
        true;

    escena.add(
        tronco
    );


    // COPA

    const copa =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.35,
                10,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x214D29,
                roughness: 1
            })
        );

    copa.position.set(
        x,
        3.5,
        z
    );

    copa.scale.y =
        1.15;

    copa.castShadow =
        true;

    escena.add(
        copa
    );
}


// ============================================================
// VEGETACIÓN CERCANA
// ============================================================

for (
    let i = 0;
    i < 35;
    i++
) {

    const x =
        (Math.random() - 0.5) *
        16;

    const z =
        (Math.random() - 0.5) *
        16;


    const pasto =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.08,
                0.35 +
                Math.random() * 0.3,
                5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4E8139,
                roughness: 1
            })
        );

    pasto.position.set(
        x,
        0.15,
        z
    );

    pasto.rotation.y =
        Math.random() *
        Math.PI;

    escena.add(
        pasto
    );
}


// ============================================================
// PIEDRAS
// ============================================================

for (
    let i = 0;
    i < 18;
    i++
) {

    const piedra =
        new THREE.Mesh(
            new THREE.DodecahedronGeometry(
                0.18 +
                Math.random() * 0.22,
                0
            ),
            new THREE.MeshStandardMaterial({
                color: 0x596052,
                roughness: 1
            })
        );

    piedra.position.set(
        (Math.random() - 0.5) * 18,
        0.15,
        (Math.random() - 0.5) * 18
    );

    piedra.scale.y =
        0.55;

    piedra.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );

    escena.add(
        piedra
    );
}


// ============================================================
// LUCES
// ============================================================

const luzAmbiente =
    new THREE.HemisphereLight(
        0x9BC8FF,
        0x24331C,
        2.2
    );

escena.add(
    luzAmbiente
);


const luzPrincipal =
    new THREE.DirectionalLight(
        0xFFE4A3,
        3.2
    );

luzPrincipal.position.set(
    -6,
    10,
    6
);

luzPrincipal.castShadow =
    true;

luzPrincipal.shadow.mapSize.width =
    1024;

luzPrincipal.shadow.mapSize.height =
    1024;

escena.add(
    luzPrincipal
);


// ============================================================
// HUEVO
// ============================================================

egg =
    crearHuevoResultadoFiel();

egg.position.set(
    0,
    2.5,
    0
);

egg.visible =
    false;

escena.add(
    egg
);


// ============================================================
// UI
// ============================================================

crearDialogo();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    redimensionarCinematica
);


// ============================================================
// INICIAR ANIMACIÓN
// ============================================================

animar();


// ============================================================
// REDIMENSIONAR CINEMÁTICA
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


// ============================================================
// ESTADO DE CINEMÁTICA
// ============================================================

function cinematicaTerminada() {

    return cinematicaFinalizada;
}


// ============================================================
// DETENER CINEMÁTICA
// ============================================================

function detenerCinematica() {

    cinematicaActiva =
        false;

    cinematicaFinalizada =
        true;

    ocultarDialogo();


    if (renderer) {

        if (
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement.parentNode.removeChild(
                renderer.domElement
            );
        }

        renderer.dispose();

        renderer =
            null;
    }


    if (polloResultado) {

        if (escena) {

            escena.remove(
                polloResultado
            );
        }

        polloResultado =
            null;
    }


    if (egg) {

        if (escena) {

            escena.remove(
                egg
            );
        }

        egg =
            null;
    }


    window.removeEventListener(
        "resize",
        redimensionarCinematica
    );
}


// ============================================================
// EXPORTS
// ============================================================

export {
    iniciarCinematica,
    cinematicaTerminada,
    detenerCinematica
};
                
