// ============================================================
// EGGARO
// escenaCinematica.js
// CINEMÁTICA INICIAL
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
let terminada = false;

let dialogoElemento = null;
let nombreElemento = null;

const loader = new GLTFLoader();

const pastos = [];
const hojas = [];
const particulas = [];

// ============================================================
// INICIAR
// ============================================================

export function iniciarCinematica(contenedor) {

    terminada = false;
    fase = 0;
    tiempoFase = 0;

    escena = new THREE.Scene();

    escena.background =
        new THREE.Color(0x8faea0);

    escena.fog =
        new THREE.Fog(
            0x8faea0,
            15,
            65
        );

    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    camara =
        new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            150
        );

    camara.position.set(
        0,
        4.2,
        15
    );

    camara.lookAt(
        0,
        2,
        -8
    );

    // --------------------------------------------------------
    // RENDERER
    // --------------------------------------------------------

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
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

    renderer.toneMappingExposure = 1.15;

    contenedor.appendChild(
        renderer.domElement
    );

    reloj = new THREE.Clock();

    // --------------------------------------------------------
    // MUNDO
    // --------------------------------------------------------

    crearSuelo();
    crearBosque();
    crearVegetacion();
    crearParticulas();
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

    window.addEventListener(
        "resize",
        ajustarPantalla
    );

    animar();

    return {
        escena,
        camara,
        renderer
    };
}

// ============================================================
// SUELO
// ============================================================

function crearSuelo() {

    const suelo =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                100,
                100
            ),
            new THREE.MeshStandardMaterial({
                color: 0x315d36,
                roughness: 1
            })
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow = true;

    escena.add(suelo);
}

// ============================================================
// BOSQUE
// ============================================================

function crearBosque() {

    for (let i = 0; i < 45; i++) {

        const x =
            -30 + Math.random() * 60;

        const z =
            -8 - Math.random() * 52;

        crearArbol(
            x,
            z,
            0.8 + Math.random() * 1.4
        );
    }

    for (let i = 0; i < 28; i++) {

        const arbusto =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.8 + Math.random() * 0.7,
                    8,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        i % 2
                            ? 0x315f35
                            : 0x28522f,
                    roughness: 1
                })
            );

        arbusto.position.set(
            -28 + Math.random() * 56,
            0.6,
            -5 - Math.random() * 48
        );

        arbusto.scale.y = 0.65;

        arbusto.castShadow = true;

        escena.add(arbusto);
    }
}

// ============================================================
// ÁRBOL
// ============================================================

function crearArbol(x, z, escala) {

    const grupo =
        new THREE.Group();

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.28,
                0.48,
                5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x513928,
                roughness: 1
            })
        );

    tronco.position.y = 2.5;
    tronco.castShadow = true;

    grupo.add(tronco);

    for (let i = 0; i < 4; i++) {

        const copa =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.5 + Math.random() * 0.7,
                    8,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        i % 2
                            ? 0x356b3b
                            : 0x285c32,
                    roughness: 1
                })
            );

        copa.position.set(
            (Math.random() - 0.5) * 2,
            4.5 + Math.random() * 1.4,
            (Math.random() - 0.5) * 2
        );

        copa.castShadow = true;

        grupo.add(copa);

        hojas.push({
            objeto: copa,
            fase: Math.random() * Math.PI * 2
        });
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
// VEGETACIÓN CON MOVIMIENTO
// ============================================================

function crearVegetacion() {

    const materialPasto =
        new THREE.MeshStandardMaterial({
            color: 0x477a3d,
            roughness: 1
        });

    for (let i = 0; i < 550; i++) {

        const pasto =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.045,
                    0.3 + Math.random() * 0.25,
                    3
                ),
                materialPasto
            );

        pasto.position.set(
            -35 + Math.random() * 70,
            0.15,
            -2 - Math.random() * 62
        );

        const escala =
            0.5 + Math.random() * 1.5;

        pasto.scale.set(
            escala,
            escala,
            escala
        );

        pasto.rotation.y =
            Math.random() * Math.PI;

        escena.add(pasto);

        pastos.push({
            objeto: pasto,
            fase: Math.random() * Math.PI * 2,
            fuerza: 0.03 + Math.random() * 0.05
        });
    }
}

// ============================================================
// PARTÍCULAS / POLVO / POLEN
// ============================================================

function crearParticulas() {

    const geometria =
        new THREE.SphereGeometry(
            0.025,
            6,
            6
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xfff4c7,
            transparent: true,
            opacity: 0.55
        });

    for (let i = 0; i < 70; i++) {

        const p =
            new THREE.Mesh(
                geometria,
                material
            );

        p.position.set(
            -20 + Math.random() * 40,
            0.5 + Math.random() * 7,
            -5 - Math.random() * 45
        );

        escena.add(p);

        particulas.push({
            objeto: p,
            fase: Math.random() * 10,
            velocidad:
                0.15 + Math.random() * 0.25
        });
    }
}

// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    const ambiente =
        new THREE.HemisphereLight(
            0xb7d9e4,
            0x263d29,
            1.7
        );

    escena.add(ambiente);

    const sol =
        new THREE.DirectionalLight(
            0xffd39a,
            3.2
        );

    sol.position.set(
        -15,
        22,
        10
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 1024;
    sol.shadow.mapSize.height = 1024;

    sol.shadow.camera.near = 1;
    sol.shadow.camera.far = 70;

    escena.add(sol);

    // Luz suave frontal para que los personajes
    // no queden completamente oscuros.

    const frontal =
        new THREE.DirectionalLight(
            0xc7e6ff,
            0.7
        );

    frontal.position.set(
        8,
        7,
        15
    );

    escena.add(frontal);
}

// ============================================================
// PERSONAJES
// ============================================================

function cargarPersonajes() {

    loader.load(
        "./3D/mike.glb",
        gltf => {

            mike = gltf.scene;

            prepararPersonaje(mike);

            mike.scale.setScalar(1.4);

            mike.position.set(
                -1.6,
                0,
                3
            );

            mike.rotation.y = 0.15;

            escena.add(mike);
        },
        undefined,
        error => {

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

            escena.add(mike);
        }
    );

    loader.load(
        "./3D/micaela.glb",
        gltf => {

            micaela =
                gltf.scene;

            prepararPersonaje(
                micaela
            );

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

            escena.add(
                micaela
            );
        },
        undefined,
        error => {

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

function prepararPersonaje(personaje) {

    personaje.traverse(
        objeto => {

            if (objeto.isMesh) {

                objeto.castShadow = true;
                objeto.receiveShadow = true;
            }
        }
    );
}

// ============================================================
// FALLBACK
// ============================================================

function crearPersonajeTemporal(color) {

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

    cuerpo.position.y = 1.15;

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

    cabeza.position.y = 2.1;

    grupo.add(
        cuerpo,
        cabeza
    );

    return grupo;
}

// ============================================================
// HUEVO
// ============================================================

function crearHuevo() {

    huevo =
        crearHuevoResultadoFiel();

    huevo.visible = false;

    huevo.position.set(
        0,
        0.9,
        -1
    );

    escena.add(huevo);
}

// ============================================================
// HUEVO NOOB
// AMARILLO / AZUL / VERDE
// ============================================================

function crearHuevoResultadoFiel() {

    const grupo =
        new THREE.Group();

    const amarillo =
        new THREE.MeshStandardMaterial({
            color: 0xffd21f,
            roughness: 0.35
        });

    const azul =
        new THREE.MeshStandardMaterial({
            color: 0x168cf0,
            roughness: 0.3
        });

    const verde =
        new THREE.MeshStandardMaterial({
            color: 0x17b83a,
            roughness: 0.35
        });

    const borde =
        new THREE.MeshStandardMaterial({
            color: 0x18202a,
            roughness: 0.35
        });

    // Cada sección es una esfera recortada.
    // Juntas forman un único huevo 3D.

    crearSeccion(
        0.48,
        1.65,
        amarillo
    );

    crearSeccion(
        -0.48,
        0.48,
        azul
    );

    crearSeccion(
        -1.65,
        -0.48,
        verde
    );

    function crearSeccion(
        yMin,
        yMax,
        material
    ) {

        const vertices = [];
        const indices = [];

        const segmentos = 40;
        const anillos = 12;

        for (
            let j = 0;
            j <= anillos;
            j++
        ) {

            const t =
                j / anillos;

            const y =
                yMin +
                (yMax - yMin) * t;

            const normal =
                y / 1.65;

            let radio =
                Math.sqrt(
                    Math.max(
                        0.08,
                        1 - normal * normal
                    )
                );

            radio *= 0.88;

            for (
                let i = 0;
                i <= segmentos;
                i++
            ) {

                const a =
                    i /
                    segmentos *
                    Math.PI *
                    2;

                vertices.push(
                    Math.cos(a) * radio,
                    y,
                    Math.sin(a) * radio
                );
            }
        }

        for (
            let j = 0;
            j < anillos;
            j++
        ) {

            for (
                let i = 0;
                i < segmentos;
                i++
            ) {

                const a =
                    j *
                    (segmentos + 1) +
                    i;

                const b = a + 1;
                const c =
                    a +
                    segmentos +
                    1;

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

        mesh.castShadow = true;

        grupo.add(mesh);
    }

    crearAro(0.48);
    crearAro(-0.48);

    function crearAro(y) {

        const aro =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.79,
                    0.04,
                    8,
                    40
                ),
                borde
            );

        aro.rotation.x =
            Math.PI / 2;

        aro.position.y = y;

        grupo.add(aro);
    }

    return grupo;
}

// ============================================================
// INTERFAZ
// ============================================================

function crearInterfazDialogo() {

    const anterior =
        document.getElementById(
            "cinematicaUI"
        );

    if (anterior)
        anterior.remove();

    const capa =
        document.createElement("div");

    capa.id =
        "cinematicaUI";

    capa.style.cssText = `
        position:fixed;
        left:0;
        right:0;
        bottom:0;
        z-index:50000;
        padding:18px;
        box-sizing:border-box;
        pointer-events:none;
        text-align:center;
    `;

    nombreElemento =
        document.createElement("div");

    nombreElemento.style.cssText = `
        color:#ffe36b;
        font-size:20px;
        font-weight:bold;
        margin-bottom:7px;
        text-shadow:0 2px 5px #000;
    `;

    dialogoElemento =
        document.createElement("div");

    dialogoElemento.style.cssText = `
        max-width:680px;
        margin:auto;
        padding:14px 20px;
        border-radius:14px;
        background:rgba(0,0,0,.68);
        color:white;
        font-size:19px;
        font-family:Arial,sans-serif;
        box-sizing:border-box;
        text-shadow:0 1px 3px #000;
    `;

    capa.appendChild(
        nombreElemento
    );

    capa.appendChild(
        dialogoElemento
    );

    document.body.appendChild(capa);
}

// ============================================================
// DIÁLOGO
// ============================================================

function mostrarDialogo(
    nombre,
    texto
) {

    if (!dialogoElemento)
        return;

    nombreElemento.textContent =
        nombre;

    dialogoElemento.textContent =
        texto;
}

function ocultarDialogo() {

    if (!dialogoElemento)
        return;

    nombreElemento.textContent = "";
    dialogoElemento.textContent = "";
}

// ============================================================
// RESULTADO
// ============================================================

function obtenerResultado() {

    const numero =
        Math.random() * 100;

    if (numero < 98)
        return "noob";

    if (numero < 99)
        return "zombie";

    return "pollito";
}

// ============================================================
// POLLO RESULTADO
// ============================================================

function crearPolloResultado(tipo) {

    const grupo =
        new THREE.Group();

    const esZombie =
        tipo === "zombie";

    const cuerpoColor =
        esZombie
            ? 0x70a35c
            : 0xf5ca35;

    const materialCuerpo =
        new THREE.MeshStandardMaterial({
            color: cuerpoColor,
            roughness: 0.7
        });

    const materialNaranja =
        new THREE.MeshStandardMaterial({
            color: 0xff921f
        });

// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animar() {

    requestAnimationFrame(animar);

    const delta = reloj.getDelta();

    actualizarAmbiente(delta);
    actualizarCinematica(delta);

    renderer.render(
        escena,
        camara
    );
}

// ============================================================
// AMBIENTE VIVO
// ============================================================

function actualizarAmbiente(delta) {

    const t =
        performance.now() * 0.001;

    // --------------------------------------------------------
    // HIERBA CON VIENTO
    // --------------------------------------------------------

    for (const p of pastos) {

        p.objeto.rotation.z =
            Math.sin(
                t * 1.3 +
                p.fase
            ) * p.fuerza;
    }

    // --------------------------------------------------------
    // COPAS DE LOS ÁRBOLES
    // --------------------------------------------------------

    for (const h of hojas) {

        h.objeto.rotation.z =
            Math.sin(
                t * 0.45 +
                h.fase
            ) * 0.025;
    }

    // --------------------------------------------------------
    // PARTÍCULAS FLOTANDO
    // --------------------------------------------------------

    for (const p of particulas) {

        p.objeto.position.y +=
            delta * p.velocidad;

        p.objeto.position.x +=
            Math.sin(
                t + p.fase
            ) *
            delta *
            0.12;

        if (
            p.objeto.position.y > 7
        ) {

            p.objeto.position.y =
                0.5;
        }
    }

    // --------------------------------------------------------
    // PEQUEÑA RESPIRACIÓN
    // --------------------------------------------------------

    if (mike) {

        mike.position.y =
            Math.sin(t * 1.5) *
            0.015;
    }

    if (micaela) {

        micaela.position.y =
            Math.sin(t * 1.5 + 1) *
            0.015;
    }
}

// ============================================================
// CINEMÁTICA
// ============================================================

function actualizarCinematica(delta) {

    // --------------------------------------------------------
    // FASE 0 — DESPERTAR
    // --------------------------------------------------------

    if (fase === 0) {

        ocultarDialogo();

        camara.position.x =
            Math.sin(
                tiempoFase * 0.2
            ) * 0.4;

        if (tiempoFase > 1.8) {

            fase = 1;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 1 — ¿DÓNDE ESTAMOS?
    // --------------------------------------------------------

    if (fase === 1) {

        mirarPersonajes();

        mostrarDialogo(
            "Micaela",
            "¿Dónde estamos?"
        );

        if (tiempoFase > 3) {

            fase = 2;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 2 — NO SÉ
    // --------------------------------------------------------

    if (fase === 2) {

        mirarPersonajes();

        mostrarDialogo(
            "Mike",
            "No sé... pero se ve algo a lo lejos."
        );

        if (tiempoFase > 3.5) {

            fase = 3;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 3 — SONIDO
    // --------------------------------------------------------

    if (fase === 3) {

        ocultarDialogo();

        camara.position.z =
            14 -
            tiempoFase * 0.7;

        if (tiempoFase > 2.5) {

            fase = 4;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 4 — ¿QUÉ ES ESE SONIDO?
    // --------------------------------------------------------

    if (fase === 4) {

        mostrarDialogo(
            "Micaela",
            "¿Qué es ese sonido?"
        );

        if (tiempoFase > 3) {

            fase = 5;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 5 — PARECE UN POLLO
    // --------------------------------------------------------

    if (fase === 5) {

        mostrarDialogo(
            "Mike",
            "Parece un pollo..."
        );

        if (tiempoFase > 3) {

            fase = 6;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 6 — EL HUEVO
    // --------------------------------------------------------

    if (fase === 6) {

        mostrarDialogo(
            "Mike",
            "¡Mira! ¡Un huevo!"
        );

        huevo.visible = true;

        huevo.position.y =
            1.1 +
            Math.sin(
                tiempoFase * 2
            ) * 0.05;

        if (tiempoFase > 2.5) {

            fase = 7;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 7 — CAÍDA DEL HUEVO
    // --------------------------------------------------------

    if (fase === 7) {

        ocultarDialogo();

        huevo.visible = true;

        huevo.position.y =
            3 -
            tiempoFase * 1.3;

        huevo.rotation.y +=
            delta * 5;

        if (
            huevo.position.y <= 0.9
        ) {

            huevo.position.y =
                0.9;

            fase = 8;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 8 — GIRO DEL HUEVO
    // --------------------------------------------------------

    if (fase === 8) {

        huevo.rotation.y +=
            delta * 7;

        huevo.rotation.z =
            Math.sin(
                tiempoFase * 8
            ) * 0.12;

        if (tiempoFase > 2.2) {

            mostrarResultado();

            fase = 9;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 9 — APARECE EL POLLO
    // --------------------------------------------------------

    if (fase === 9) {

        if (polloResultado) {

            polloResultado.rotation.y +=
                delta * 0.7;

            polloResultado.position.y =
                0.7 +
                Math.sin(
                    tiempoFase * 3
                ) * 0.08;
        }

        if (tiempoFase > 4) {

            fase = 10;
            tiempoFase = 0;
        }

        return;
    }

    // --------------------------------------------------------
    // FASE 10 — FINAL
    // --------------------------------------------------------

    if (fase === 10) {

        mostrarDialogo(
            "",
            "..."
        );

        if (tiempoFase > 1.5) {

            terminada = true;
        }
    }
}

// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    if (polloResultado) {

        escena.remove(
            polloResultado
        );

        polloResultado = null;
    }

    const resultado =
        obtenerResultado();

    // Ocultar huevo

    if (huevo) {

        huevo.visible = false;
    }

// Crear pollo

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

    mostrarDialogo(
        "",
        "..."
    );
}

// ============================================================
// MIRAR HACIA EL CENTRO
// ============================================================

function mirarPersonajes() {

    if (!mike || !micaela)
        return;

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
// REDIMENSIONAR
// ============================================================

function ajustarPantalla() {

    if (!camara || !renderer)
        return;

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

    terminada = true;

    window.removeEventListener(
        "resize",
        ajustarPantalla
    );

    // --------------------------------------------------------
    // ELIMINAR INTERFAZ
    // --------------------------------------------------------

    const ui =
        document.getElementById(
            "cinematicaUI"
        );

    if (ui) {

        ui.remove();
    }

    // --------------------------------------------------------
    // LIMPIAR RENDERER
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

    renderer = null;
    escena = null;
    camara = null;
}
