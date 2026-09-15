// ============================================================
// EGGARO - CINEMÁTICA DE INTRODUCCIÓN
// ============================================================
// Solo puesta en escena.
// NO contiene:
// - probabilidades
// - sistema de huevos
// - fusiones
// - diseños definitivos de pollos
//
// El resultado se recibe desde un sistema externo mediante:
// iniciarCinematica(game, resultado)
// ============================================================

import * as THREE from "three";
import { GLTFLoader } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

// ============================================================
// ESTADO
// ============================================================

let escena;
let camara;
let renderer;
let reloj;

let cinematicaActiva = false;
let cinematicaFinalizada = false;

let fase = 0;
let tiempoFase = 0;

let mike = null;
let micaela = null;
let pollo = null;
let huevo = null;

let resultado = null;

let objetivoCamara = new THREE.Vector3();
let objetivoLook = new THREE.Vector3();

let velocidadCamara = 2.5;

// ============================================================
// GRUPOS
// ============================================================

let grupoPersonajes;
let grupoBosque;
let grupoHuevo;
let grupoResultado;

// ============================================================
// UI
// ============================================================

let dialogoBox;
let nombreBox;
let textoBox;
let indicadorBox;

// ============================================================
// INICIAR
// ============================================================

export function iniciarCinematica(game, resultadoExterno = null) {

    cinematicaActiva = true;
    cinematicaFinalizada = false;

    fase = 0;
    tiempoFase = 0;

    resultado = resultadoExterno;

    reloj = new THREE.Clock();

    // --------------------------------------------------------
    // ESCENA
    // --------------------------------------------------------

    escena = new THREE.Scene();

    escena.background = new THREE.Color(0x8ca89a);

    escena.fog = new THREE.FogExp2(
        0x8ca89a,
        0.025
    );

    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    camara = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        300
    );

    camara.position.set(
        0,
        4,
        13
    );

    camara.lookAt(
        0,
        2,
        0
    );

    // --------------------------------------------------------
    // RENDERER
    // --------------------------------------------------------

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
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

    document.body.appendChild(
        renderer.domElement
    );

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.width = "100vw";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.zIndex = "9999";

    // --------------------------------------------------------
    // GRUPOS
    // --------------------------------------------------------

    grupoPersonajes = new THREE.Group();
    grupoBosque = new THREE.Group();
    grupoHuevo = new THREE.Group();
    grupoResultado = new THREE.Group();

    escena.add(grupoBosque);
    escena.add(grupoPersonajes);
    escena.add(grupoHuevo);
    escena.add(grupoResultado);

    // --------------------------------------------------------
    // MUNDO
    // --------------------------------------------------------

    crearSuelo();
    crearBosque();
    crearVegetacion();
    crearRocas();

    crearIluminacion();

    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    crearHuevo();

    // --------------------------------------------------------
    // PERSONAJES
    // --------------------------------------------------------

    cargarPersonajes();

    // --------------------------------------------------------
    // POLLO
    // --------------------------------------------------------

    crearPolloTemporal();

    // --------------------------------------------------------
    // UI
    // --------------------------------------------------------

    crearUI();

    window.addEventListener(
        "resize",
        ajustarPantalla
    );

    reloj.start();

    animar();
}

// ============================================================
// SUELO
// ============================================================

function crearSuelo() {

    const geometria =
        new THREE.PlaneGeometry(
            180,
            180,
            30,
            30
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

        const altura =
            Math.sin(x * 0.08) * 0.3 +
            Math.cos(y * 0.06) * 0.25;

        posiciones.setZ(
            i,
            altura
        );
    }

    geometria.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x496348,
            roughness: 1
        });

    const suelo =
        new THREE.Mesh(
            geometria,
            material
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow = true;

    grupoBosque.add(suelo);
}

// ============================================================
// BOSQUE
// ============================================================

function crearBosque() {

    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI *
            2;

        const distancia =
            18 +
            Math.random() * 55;

        const x =
            Math.cos(angulo) *
            distancia;

        const z =
            Math.sin(angulo) *
            distancia;

        crearArbol(
            x,
            0,
            z
        );
    }

    // Árboles laterales más cercanos
    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const lado =
            Math.random() < 0.5
                ? -1
                : 1;

        const x =
            lado *
            (5 + Math.random() * 7);

        const z =
            -5 +
            Math.random() * 20;

        crearArbol(
            x,
            0,
            z,
            true
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
    cercano = false
) {

    const grupo =
        new THREE.Group();

    const altura =
        cercano
            ? 5 + Math.random() * 3
            : 4 + Math.random() * 5;

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.25,
                0.45,
                altura,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4d3525,
                roughness: 1
            })
        );

    tronco.position.y =
        altura / 2;

    tronco.castShadow = true;

    grupo.add(tronco);

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const copa =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.5 +
                    Math.random() * 0.7,
                    8,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        0x34563b,
                    roughness: 1
                })
            );

        copa.position.set(
            (Math.random() - 0.5) * 1.2,
            altura +
                i * 0.7,
            (Math.random() - 0.5) * 1.2
        );

        copa.scale.y = 0.8;

        copa.castShadow = true;

        grupo.add(copa);
    }

    grupo.position.set(
        x,
        y,
        z
    );

    grupo.scale.setScalar(
        cercano
            ? 1
            : 0.8 +
              Math.random() * 0.5
    );

    grupoBosque.add(grupo);
}

// ============================================================
// VEGETACIÓN
// ============================================================

function crearVegetacion() {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x638b54,
            roughness: 1
        });

    for (
        let i = 0;
        i < 180;
        i++
    ) {

        const hierba =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.04,
                    0.3 +
                    Math.random() * 0.35,
                    4
                ),
                material
            );

        hierba.position.set(
            (Math.random() - 0.5) * 70,
            0.15,
            (Math.random() - 0.5) * 70
        );

        hierba.rotation.y =
            Math.random() *
            Math.PI;

        grupoBosque.add(hierba);
    }

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const arbusto =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.45 +
                    Math.random() * 0.4,
                    7,
                    7
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x42633e,
                    roughness: 1
                })
            );

        arbusto.position.set(
            (Math.random() - 0.5) * 45,
            0.45,
            (Math.random() - 0.5) * 45
        );

        arbusto.scale.y = 0.7;

        grupoBosque.add(arbusto);
    }
}

// ============================================================
// ROCAS
// ============================================================

function crearRocas() {

    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const roca =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    0.25 +
                    Math.random() * 0.55,
                    0
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x59605b,
                    roughness: 1
                })
            );

        roca.position.set(
            (Math.random() - 0.5) * 55,
            0.25,
            (Math.random() - 0.5) * 55
        );

        roca.rotation.set(
            Math.random(),
            Math.random(),
            Math.random()
        );

        roca.castShadow = true;

        grupoBosque.add(roca);
    }
}

// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    const ambiente =
        new THREE.HemisphereLight(
            0xb8d8ff,
            0x263c29,
            1.8
        );

    escena.add(ambiente);

    const sol =
        new THREE.DirectionalLight(
            0xffd7a1,
            3
        );

    sol.position.set(
        -15,
        25,
        10
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 2048;
    sol.shadow.mapSize.height = 2048;

    sol.shadow.camera.left = -30;
    sol.shadow.camera.right = 30;
    sol.shadow.camera.top = 30;
    sol.shadow.camera.bottom = -30;

    escena.add(sol);

    const relleno =
        new THREE.DirectionalLight(
            0x89aaff,
            0.6
        );

    relleno.position.set(
        15,
        8,
        -15
    );

    escena.add(relleno);
}

// ============================================================
// CARGAR MIKE Y MICAELA
// ============================================================

function cargarPersonajes() {

    const loader =
        new GLTFLoader();

    loader.load(
        "./3D/mike.glb",

        gltf => {

            mike =
                gltf.scene;

            prepararPersonaje(
                mike
            );

            mike.position.set(
                -1.3,
                0,
                8
            );

            mike.rotation.y =
                Math.PI;

            grupoPersonajes.add(
                mike
            );
        },

        undefined,

        () => {

            mike =
                crearPersonajeFallback(
                    0x8b6b4d
                );

            mike.position.set(
                -1.3,
                0,
                8
            );

            grupoPersonajes.add(
                mike
            );
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

            micaela.position.set(
                1.3,
                0,
                8.7
            );

            micaela.rotation.y =
                Math.PI;

            grupoPersonajes.add(
                micaela
            );
        },

        undefined,

        () => {

            micaela =
                crearPersonajeFallback(
                    0xc58b72
                );

            micaela.position.set(
                1.3,
                0,
                8.7
            );

            grupoPersonajes.add(
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

    personaje.scale.setScalar(
        1
    );
}

// ============================================================
// FALLBACK
// ============================================================

function crearPersonajeFallback(
    color
) {

    const grupo =
        new THREE.Group();

    const cuerpo =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.45,
                1.1,
                6,
                10
            ),
            new THREE.MeshStandardMaterial({
                color
            })
        );

    cuerpo.position.y =
        1.05;

    cuerpo.castShadow = true;

    grupo.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.43,
                16,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf0c6a0
            })
        );

    cabeza.position.y =
        1.95;

    cabeza.castShadow = true;

    grupo.add(cabeza);

    return grupo;
}

// ============================================================
// POLLO TEMPORAL
// ============================================================
// NO es el diseño definitivo.
// Solo sirve para que la escena pueda mostrar
// el encuentro antes de conectar pollos.js.
// ============================================================

function crearPolloTemporal() {

    pollo =
        new THREE.Group();

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                20,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf1c933
            })
        );

    cuerpo.scale.set(
        1,
        0.9,
        1.1
    );

    cuerpo.castShadow = true;

    pollo.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                20,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf5cf38
            })
        );

    cabeza.position.set(
        0,
        0.42,
        0
    );

    cabeza.castShadow = true;

    pollo.add(cabeza);

    const ojoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111111
        });

    for (
        const lado of [-1, 1]
    ) {

        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.06,
                    10,
                    10
                ),
                ojoMaterial
            );

        ojo.position.set(
            lado * 0.13,
            0.48,
            -0.32
        );

        pollo.add(ojo);
    }

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.1,
                0.22,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0xed8a25
            })
        );

    pico.rotation.x =
        -Math.PI / 2;

    pico.position.set(
        0,
        0.38,
        -0.37
    );

    pollo.add(pico);

    pollo.position.set(
        0,
        0.55,
        0
    );

    pollo.visible = false;

    grupoPersonajes.add(
        pollo
    );
}

// ============================================================
// HUEVO
// ============================================================

function crearHuevo() {

    grupoHuevo.visible = false;

    const forma =
        new THREE.SphereGeometry(
            1,
            32,
            24
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xf0df9b,
            roughness: 0.45
        });

    huevo =
        new THREE.Mesh(
            forma,
            material
        );

    huevo.scale.set(
        0.72,
        1,
        0.72
    );

    huevo.castShadow = true;

    grupoHuevo.add(
        huevo
    );

    grupoHuevo.position.set(
        0,
        1.5,
        0
    );
}

// ============================================================
// UI
// ============================================================

function crearUI() {

    dialogoBox = document.createElement("div");

    Object.assign(dialogoBox.style, {
        position: "fixed",
        left: "50%",
        bottom: "5%",
        transform: "translateX(-50%)",
        width: "min(900px, 88vw)",
        padding: "22px 26px",
        background: "rgba(0,0,0,0.72)",
        border: "2px solid rgba(255,255,255,0.25)",
        borderRadius: "18px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        zIndex: "10001",
        display: "none",
        boxSizing: "border-box"
    });

    document.body.appendChild(dialogoBox);

    nombreBox = document.createElement("div");

    Object.assign(nombreBox.style, {
        fontWeight: "bold",
        fontSize: "20px"
    });

    dialogoBox.appendChild(nombreBox);

    textoBox = document.createElement("div");

    Object.assign(textoBox.style, {
        marginTop: "8px",
        fontSize: "18px",
        lineHeight: "1.4"
    });

    dialogoBox.appendChild(textoBox);

    indicadorBox = document.createElement("div");

    Object.assign(indicadorBox.style, {
        marginTop: "10px",
        opacity: "0.6"
    });

    indicadorBox.textContent = "▼";

    dialogoBox.appendChild(indicadorBox);
}


// ============================================================
// MOSTRAR DIÁLOGO
// ============================================================

function mostrarDialogo(nombre, texto) {

    if (!dialogoBox)
        return;

    dialogoBox.style.display = "block";

    nombreBox.textContent = nombre;

    textoBox.textContent = texto;
}


// ============================================================
// OCULTAR DIÁLOGO
// ============================================================

function ocultarDialogo() {

    if (!dialogoBox)
        return;

    dialogoBox.style.display = "none";
}


// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animar() {

    if (!cinematicaActiva)
        return;

    requestAnimationFrame(animar);

    const delta = reloj.getDelta();

    actualizarCinematica(delta);

    actualizarAmbiente(delta);

    renderer.render(
        escena,
        camara
    );
}


// ============================================================
// AMBIENTE
// ============================================================

function actualizarAmbiente(delta) {

    if (
        !camara ||
        fase > 3
    )
        return;

    // Movimiento cinematográfico MUY pequeño.
    // No modifica la posición de Mike ni Micaela.

    camara.position.y =
        4 +
        Math.sin(
            performance.now() * 0.0008
        ) * 0.015;
}


// ============================================================
// CINEMÁTICA
// ============================================================

function actualizarCinematica(delta) {

    switch (fase) {

        // ====================================================
        // 0 - ENTRADA AL BOSQUE
        // ====================================================

        case 0:

            ocultarDialogo();

            camara.position.set(
                0,
                4,
                15
            );

            camara.lookAt(
                0,
                1.5,
                5
            );

            if (
                tiempoFase > 1.5
            ) {

                cambiarFase(1);
            }

            break;


        // ====================================================
        // 1 - MIKE Y MICAELA CAMINAN
        // ====================================================

        case 1:

            caminarPersonajes(delta);

            seguirPersonajes(delta);

            if (
                tiempoFase > 5
            ) {

                detenerPersonajes();

                cambiarFase(2);
            }

            break;


        // ====================================================
        // 2 - MICAELA PREGUNTA
        // ====================================================

        case 2:

            detenerPersonajes();

            mostrarDialogo(
                "Micaela",
                "¿Dónde estamos?"
            );

            if (
                tiempoFase > 2.5
            ) {

                cambiarFase(3);
            }

            break;


        // ====================================================
        // 3 - MIKE RESPONDE
        // ====================================================

        case 3:

            mostrarDialogo(
                "Mike",
                "No sé... pero se ve algo a lo lejos."
            );

            mirarPersonajesHacia(
                new THREE.Vector3(
                    0,
                    1,
                    -1
                )
            );

            if (
                tiempoFase > 3
            ) {

                cambiarFase(4);
            }

            break;


        // ====================================================
        // 4 - APARECE EL POLLO
        // ====================================================

        case 4:

            ocultarDialogo();

            if (pollo) {

                pollo.visible = true;

                pollo.position.y =
                    0.55 +
                    Math.sin(
                        performance.now() * 0.004
                    ) * 0.035;

                pollo.rotation.y +=
                    delta * 0.15;
            }

            enfocarPollo();

            if (
                tiempoFase > 3
            ) {

                cambiarFase(5);
            }

            break;


        // ====================================================
        // 5 - MICAELA ESCUCHA EL SONIDO
        // ====================================================

        case 5:

            mostrarDialogo(
                "Micaela",
                "¿Qué es ese sonido?"
            );

            if (
                tiempoFase > 2.5
            ) {

                cambiarFase(6);
            }

            break;


        // ====================================================
        // 6 - MIKE RECONOCE AL POLLO
        // ====================================================

        case 6:

            mostrarDialogo(
                "Mike",
                "Parece un pollo..."
            );

            if (
                tiempoFase > 2.5
            ) {

                cambiarFase(7);
            }

            break;


        // ====================================================
        // 7 - DESCUBREN EL HUEVO
        // ====================================================

        case 7:

            mostrarDialogo(
                "Mike",
                "¡Mira! ¡Un huevo!"
            );

            if (
                tiempoFase > 2.3
            ) {

                cambiarFase(8);
            }

            break;


        // ====================================================
        // 8 - CAÍDA DEL HUEVO
        // ====================================================

        case 8:

            ocultarDialogo();

            animarCaidaHuevo(delta);

            enfocarHuevo();

            if (
                tiempoFase > 2.5
            ) {

                cambiarFase(9);
            }

            break;


        // ====================================================
        // 9 - GIRO DEL HUEVO
        // ====================================================

        case 9:

            animarGiroHuevo(delta);

            enfocarHuevo();

            if (
                tiempoFase > 3
            ) {

                cambiarFase(10);
            }

            break;


        // ====================================================
        // 10 - POM
        // ====================================================

        case 10:

            abrirHuevo();

            if (
                tiempoFase > 0.8
            ) {

                cambiarFase(11);
            }

            break;


        // ====================================================
        // 11 - POLLO A PANTALLA COMPLETA
        // ====================================================

        case 11:

            mostrarResultado();

            if (
                tiempoFase > 4
            ) {

                cambiarFase(12);
            }

            break;


        // ====================================================
        // 12 - TERMINA
        // ====================================================

        case 12:

            finalizarCinematica();

            break;
    }
}


// ============================================================
// CAMBIAR FASE
// ============================================================

function cambiarFase(nuevaFase) {

    fase = nuevaFase;

    tiempoFase = 0;
}


// ============================================================
// CAMINATA
// ============================================================

function caminarPersonajes(delta) {

    if (!mike || !micaela)
        return;

    const velocidad =
        1.05 * delta;

    mike.position.z -= velocidad;

    micaela.position.z -= velocidad;

    // Pequeño movimiento corporal.
    // NO mueve el modelo verticalmente.

    const paso =
        Math.sin(
            performance.now() * 0.012
        );

    mike.rotation.x =
        paso * 0.015;

    micaela.rotation.x =
        paso * 0.015;
}


// ============================================================
// DETENER PERSONAJES
// ============================================================

function detenerPersonajes() {

    if (mike) {

        mike.rotation.x = 0;
    }

    if (micaela) {

        micaela.rotation.x = 0;
    }
}


// ============================================================
// CÁMARA SIGUE A LOS PERSONAJES
// ============================================================

function seguirPersonajes(delta) {

    if (!mike || !micaela)
        return;

    const centro =
        new THREE.Vector3()
            .addVectors(
                mike.position,
                micaela.position
            )
            .multiplyScalar(0.5);

    objetivoCamara.set(
        centro.x,
        centro.y + 3.2,
        centro.z + 9
    );

    camara.position.lerp(
        objetivoCamara,
        Math.min(
            delta * 2.5,
            1
        )
    );

    objetivoLook.set(
        centro.x,
        centro.y + 1.2,
        centro.z - 1
    );

    camara.lookAt(
        objetivoLook
    );
}


// ============================================================
// PERSONAJES MIRAN AL OBJETIVO
// ============================================================

function mirarPersonajesHacia(objetivo) {

    if (mike)
        mirarObjeto(mike, objetivo);

    if (micaela)
        mirarObjeto(micaela, objetivo);
}


function mirarObjeto(objeto, objetivo) {

    const dx =
        objetivo.x -
        objeto.position.x;

    const dz =
        objetivo.z -
        objeto.position.z;

    objeto.rotation.y =
        Math.atan2(
            dx,
            dz
        );
}


// ============================================================
// ENFOCAR POLLO
// ============================================================

function enfocarPollo() {

    if (!pollo)
        return;

    objetivoCamara.set(
        pollo.position.x,
        2.4,
        pollo.position.z + 5
    );

    camara.position.lerp(
        objetivoCamara,
        0.035
    );

    camara.lookAt(
        pollo.position.x,
        1,
        pollo.position.z
    );
}


// ============================================================
// CAÍDA DEL HUEVO
// ============================================================

function animarCaidaHuevo(delta) {

    if (!grupoHuevo)
        return;

    grupoHuevo.visible = true;

    const t =
        Math.min(
            tiempoFase / 2.5,
            1
        );

    // Caída con aceleración.

    const suavizado =
        t * t;

    grupoHuevo.position.y =
        THREE.MathUtils.lerp(
            8,
            1.35,
            suavizado
        );

    grupoHuevo.position.x = 0;

    grupoHuevo.position.z = -1;

    grupoHuevo.rotation.z =
        t *
        Math.PI *
        0.12;
}


// ============================================================
// GIRO DEL HUEVO
// ============================================================

function animarGiroHuevo(delta) {

    if (!grupoHuevo)
        return;

    grupoHuevo.visible = true;

    grupoHuevo.position.set(
        0,
        1.35,
        -1
    );

    grupoHuevo.rotation.y +=
        delta * 5;

    grupoHuevo.rotation.z =
        Math.sin(
            tiempoFase * 4
        ) * 0.06;
}


// ============================================================
// CÁMARA DEL HUEVO
// ============================================================

function enfocarHuevo() {

    if (!huevo)
        return;

    const progreso =
        Math.min(
            tiempoFase / 3,
            1
        );

    const distancia =
        THREE.MathUtils.lerp(
            5.5,
            3.4,
            progreso
        );

    camara.position.set(
        0,
        1.8,
        distancia
    );

    camara.lookAt(
        0,
        1.35,
        -1
    );

    grupoHuevo.scale.setScalar(
        1
    );
}


// ============================================================
// POM
// ============================================================

function abrirHuevo() {

    if (grupoHuevo)
        grupoHuevo.visible = false;

    if (pollo)
        pollo.visible = false;

    // Flash muy corto.

    if (
        tiempoFase < 0.12
    ) {

        const flash =
            document.createElement(
                "div"
            );

        Object.assign(
            flash.style,
            {
                position: "fixed",
                inset: "0",
                background: "white",
                opacity: "0.95",
                zIndex: "10000",
                pointerEvents: "none"
            }
        );

        document.body.appendChild(
            flash
        );

        setTimeout(
            () => {

                flash.style.transition =
                    "opacity 0.45s";

                flash.style.opacity =
                    "0";

                setTimeout(
                    () => flash.remove(),
                    450
                );

            },
            40
        );
    }
}


// ============================================================
// RESULTADO
// ============================================================

function mostrarResultado() {

    if (!resultado)
        return;

    grupoResultado.visible = true;

    /*
     * IMPORTANTE:
     *
     * Este archivo NO calcula probabilidades.
     *
     * El sistema externo entrega:
     *
     * "noob"
     * "zombie"
     * "pollitoNoob"
     *
     * Aquí solamente se muestra.
     */

    if (
        !grupoResultado.userData.modelo
    ) {

        const modelo =
            crearResultadoTemporal(
                resultado
            );

        grupoResultado.add(
            modelo
        );

        grupoResultado.userData.modelo =
            modelo;
    }

    const modelo =
        grupoResultado.userData.modelo;

    modelo.visible = true;

    modelo.position.set(
        0,
        0,
        0
    );

    modelo.scale.setScalar(
        2.6
    );

    camara.position.set(
        0,
        1.8,
        6
    );

    camara.lookAt(
        0,
        1.3,
        0
    );
}


// ============================================================
// MODELO TEMPORAL DEL RESULTADO
// ============================================================
// Después será reemplazado por pollos.js.
// ============================================================

function crearResultadoTemporal(tipo) {

    const grupo =
        new THREE.Group();

    let color =
        0xf1c933;

    if (
        tipo === "zombie"
    ) {

        color =
            0x65905b;
    }

    if (
        tipo === "pollitoNoob"
    ) {

        color =
            0xffdc42;

        grupo.scale.setScalar(
            0.65
        );
    }

    const material =
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.65
        });

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.8,
                24,
                20
            ),
            material
        );

    cuerpo.scale.y = 0.9;

    cuerpo.castShadow = true;

    grupo.add(cuerpo);


    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.6,
                24,
                20
            ),
            material
        );

    cabeza.position.y =
        0.72;

    cabeza.castShadow = true;

    grupo.add(cabeza);


    const ojoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111111
        });

    for (
        const lado of [-1, 1]
    ) {

        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.11,
                    12,
                    12
                ),
                ojoMaterial
            );

        ojo.position.set(
            lado * 0.22,
            0.78,
            -0.52
        );

        grupo.add(ojo);
    }


    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.18,
                0.38,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0xef8b22
            })
        );

    pico.rotation.x =
        -Math.PI / 2;

    pico.position.set(
        0,
        0.59,
        -0.68
    );

    grupo.add(pico);


    return grupo;
}


// ============================================================
// FINALIZAR
// ============================================================

function finalizarCinematica() {

    cinematicaActiva = false;

    cinematicaFinalizada = true;

    ocultarDialogo();

    window.removeEventListener(
        "resize",
        ajustarPantalla
    );

    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.remove();
    }

    if (dialogoBox) {

        dialogoBox.remove();

        dialogoBox = null;
    }
}


// ============================================================
// RESIZE
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
// ESTADO DE LA CINEMÁTICA
// ============================================================

export function cinematicaTerminada() {

    return cinematicaFinalizada;
}


// ============================================================
// DETENER CINEMÁTICA
// ============================================================

export function detenerCinematica() {

    cinematicaActiva = false;

    cinematicaFinalizada = true;

    window.removeEventListener(
        "resize",
        ajustarPantalla
    );

    ocultarDialogo();

    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.remove();
    }

    if (dialogoBox) {

        dialogoBox.remove();

        dialogoBox = null;
    }
}


// ============================================================
// EXPORTACIONES
// ============================================================

export {
    escena,
    camara,
    renderer
};
