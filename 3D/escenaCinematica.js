// ============================================================
// EGGARO — ESCENA CINEMÁTICA
// PARTE 1/4
// Escena + suelo + bosque + iluminación
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

let reloj = new THREE.Clock();

let cinematicaActiva = false;
let cinematicaFinalizada = false;

let fase = 0;
let tiempoFase = 0;

let mike = null;
let micaela = null;

let actorMike = null;
let actorMicaela = null;

let polloEncuentro = null;
let huevo = null;
let resultadoPollo = null;

let dialogoUI = null;
let subtituloUI = null;
let flashUI = null;

let objetivoCamara = new THREE.Vector3();

let resultadoCinematica = "noob";

let creadorPolloCinematico = null;

let caminataTerminada = false;
let huevoLanzado = false;
let huevoTerminado = false;
let pomRealizado = false;

let resizeActivo = false;

// ============================================================
// CONFIGURACIÓN
// ============================================================

const ALTURA_PERSONAJE = 2.2;

const VELOCIDAD_CAMINATA = 1.65;

const POSICION_FINAL_MIKE = new THREE.Vector3(-0.9, 0, 2.8);
const POSICION_FINAL_MICAELA = new THREE.Vector3(0.9, 0, 2.8);

const POSICION_POLLO = new THREE.Vector3(0, 0, -0.4);
const POSICION_HUEVO = new THREE.Vector3(0, 0, -1.1);

// ============================================================
// LOADER
// ============================================================

const loader = new GLTFLoader();

// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

export function iniciarCinematica(game) {

    // --------------------------------------------------------
    // Limpiar una cinemática anterior
    // --------------------------------------------------------

    if (renderer) {
        try {
            renderer.dispose();
        } catch (e) {}
    }

    escena = new THREE.Scene();

    escena.background = new THREE.Color(0x8fb58b);

    escena.fog = new THREE.Fog(
        0x8fb58b,
        18,
        65
    );

    camara = new THREE.PerspectiveCamera(
        52,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

    camara.position.set(
        0,
        4.2,
        12
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.75)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "9998";

    document.body.appendChild(renderer.domElement);

    // --------------------------------------------------------
    // Reiniciar estado
    // --------------------------------------------------------

    cinematicaActiva = true;
    cinematicaFinalizada = false;

    fase = 0;
    tiempoFase = 0;

    caminataTerminada = false;
    huevoLanzado = false;
    huevoTerminado = false;
    pomRealizado = false;

    mike = null;
    micaela = null;

    actorMike = null;
    actorMicaela = null;

    polloEncuentro = null;
    huevo = null;
    resultadoPollo = null;

    reloj.start();

    // --------------------------------------------------------
    // Crear escenario
    // --------------------------------------------------------

    crearSuelo();
    crearBosque();
    crearVegetacion();
    crearRocas();
    crearIluminacion();

    // --------------------------------------------------------
    // Huevo inicialmente oculto
    // --------------------------------------------------------

    huevo = crearHuevoCinematico();

    huevo.position.copy(POSICION_HUEVO);
    huevo.position.y = -20;
    huevo.visible = false;

    escena.add(huevo);

    // --------------------------------------------------------
    // Pollo de encuentro
    // --------------------------------------------------------

    polloEncuentro = crearPolloEncuentro();

    polloEncuentro.position.copy(POSICION_POLLO);
    polloEncuentro.visible = false;

    escena.add(polloEncuentro);

    // --------------------------------------------------------
    // Interfaz
    // --------------------------------------------------------

    crearInterfazCinematica();

    // --------------------------------------------------------
    // Cargar personajes
    // --------------------------------------------------------

    cargarPersonajes();

    // --------------------------------------------------------
    // Resize
    // --------------------------------------------------------

    if (!resizeActivo) {
        window.addEventListener(
            "resize",
            ajustarPantalla
        );

        resizeActivo = true;
    }

    // --------------------------------------------------------
    // Iniciar render
    // --------------------------------------------------------

    animar();
}

// ============================================================
// SUELO
// ============================================================

function crearSuelo() {

    const geometria = new THREE.PlaneGeometry(
        100,
        100,
        40,
        40
    );

    const posiciones =
        geometria.attributes.position;

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {

        const x = posiciones.getX(i);
        const y = posiciones.getY(i);

        const ondulacion =
            Math.sin(x * 0.16) * 0.12 +
            Math.cos(y * 0.13) * 0.10 +
            Math.sin((x + y) * 0.08) * 0.08;

        posiciones.setZ(
            i,
            ondulacion
        );
    }

    posiciones.needsUpdate = true;

    geometria.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x58794d,
        roughness: 1,
        metalness: 0
    });

    const suelo = new THREE.Mesh(
        geometria,
        material
    );

    suelo.rotation.x = -Math.PI / 2;

    suelo.position.y = 0;

    suelo.receiveShadow = true;

    escena.add(suelo);
}

// ============================================================
// BOSQUE
// ============================================================

function crearBosque() {

    // --------------------------------------------------------
    // Árboles grandes del fondo
    // --------------------------------------------------------

    for (let i = 0; i < 34; i++) {

        const angulo =
            (i / 34) * Math.PI * 2;

        const radio =
            17 + Math.random() * 25;

        const x =
            Math.cos(angulo) * radio;

        const z =
            Math.sin(angulo) * radio;

        crearArbol(
            x,
            z,
            0.8 + Math.random() * 0.8
        );
    }

    // --------------------------------------------------------
    // Árboles laterales
    // --------------------------------------------------------

    for (let i = 0; i < 18; i++) {

        const lado =
            i % 2 === 0
                ? -1
                : 1;

        const x =
            lado * (
                7 +
                Math.random() * 8
            );

        const z =
            3 -
            Math.random() * 22;

        crearArbol(
            x,
            z,
            0.7 + Math.random() * 0.65
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

    const grupo = new THREE.Group();

    grupo.position.set(
        x,
        0,
        z
    );

    grupo.scale.setScalar(
        escala
    );

    // --------------------------------------------------------
    // Tronco
    // --------------------------------------------------------

    const troncoGeometria =
        new THREE.CylinderGeometry(
            0.32,
            0.48,
            4.5,
            8
        );

    const troncoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x503723,
            roughness: 1
        });

    const tronco =
        new THREE.Mesh(
            troncoGeometria,
            troncoMaterial
        );

    tronco.position.y = 2.25;

    tronco.castShadow = true;
    tronco.receiveShadow = true;

    grupo.add(tronco);

    // --------------------------------------------------------
    // Copa inferior
    // --------------------------------------------------------

    const hojasMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x315f3d,
            roughness: 1
        });

    const copa1 =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                2.15,
                3.2,
                8
            ),
            hojasMaterial
        );

    copa1.position.y = 4.3;

    copa1.castShadow = true;

    grupo.add(copa1);

    // --------------------------------------------------------
    // Copa superior
    // --------------------------------------------------------

    const copa2 =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                1.65,
                2.7,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3f7044,
                roughness: 1
            })
        );

    copa2.position.y = 5.7;

    copa2.castShadow = true;

    grupo.add(copa2);

    escena.add(grupo);

    return grupo;
}

// ============================================================
// VEGETACIÓN
// ============================================================

function crearVegetacion() {

    // --------------------------------------------------------
    // Hierba
    // --------------------------------------------------------

    for (let i = 0; i < 420; i++) {

        const x =
            (Math.random() - 0.5) * 55;

        const z =
            (Math.random() - 0.5) * 48;

        // Dejar un espacio para los personajes
        if (
            Math.abs(x) < 3 &&
            z > -3 &&
            z < 7
        ) {
            continue;
        }

        const alto =
            0.15 +
            Math.random() * 0.35;

        const geometria =
            new THREE.ConeGeometry(
                0.025,
                alto,
                4
            );

        const material =
            new THREE.MeshStandardMaterial({
                color:
                    Math.random() > 0.5
                        ? 0x47733c
                        : 0x62894b,
                roughness: 1
            });

        const hierba =
            new THREE.Mesh(
                geometria,
                material
            );

        hierba.position.set(
            x,
            alto / 2,
            z
        );

        hierba.rotation.y =
            Math.random() *
            Math.PI;

        hierba.castShadow = true;

        escena.add(hierba);
    }

    // --------------------------------------------------------
    // Arbustos
    // --------------------------------------------------------

    for (let i = 0; i < 65; i++) {

        const x =
            (Math.random() - 0.5) * 45;

        const z =
            (Math.random() - 0.5) * 40;

        const arbusto =
            new THREE.Group();

        arbusto.position.set(
            x,
            0,
            z
        );

        for (let j = 0; j < 3; j++) {

            const bola =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.35 +
                        Math.random() * 0.3,
                        8,
                        6
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x416b3e,
                        roughness: 1
                    })
                );

            bola.position.set(
                (j - 1) * 0.35,
                0.3 +
                Math.random() * 0.2,
                Math.random() * 0.25
            );

            bola.castShadow = true;

            arbusto.add(bola);
        }

        escena.add(arbusto);
    }
}

// ============================================================
// ROCAS
// ============================================================

function crearRocas() {

    for (let i = 0; i < 42; i++) {

        const x =
            (Math.random() - 0.5) * 45;

        const z =
            (Math.random() - 0.5) * 42;

        const roca =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    0.2 +
                    Math.random() * 0.45,
                    0
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x65675d,
                    roughness: 1
                })
            );

        roca.position.set(
            x,
            0.15,
            z
        );

        roca.rotation.set(
            Math.random(),
            Math.random(),
            Math.random()
        );

        roca.scale.y =
            0.5 +
            Math.random() * 0.5;

        roca.castShadow = true;
        roca.receiveShadow = true;

        escena.add(roca);
    }
}

// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    // --------------------------------------------------------
    // Luz ambiental
    // --------------------------------------------------------

    const ambiente =
        new THREE.HemisphereLight(
            0xd9f0ff,
            0x30452c,
            2.0
        );

    escena.add(ambiente);

    // --------------------------------------------------------
    // Sol
    // --------------------------------------------------------

    const sol =
        new THREE.DirectionalLight(
            0xffe2aa,
            3.2
        );

    sol.position.set(
        -15,
        22,
        12
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 2048;
    sol.shadow.mapSize.height = 2048;

    sol.shadow.camera.near = 0.5;
    sol.shadow.camera.far = 70;

    sol.shadow.camera.left = -25;
    sol.shadow.camera.right = 25;
    sol.shadow.camera.top = 25;
    sol.shadow.camera.bottom = -25;

    escena.add(sol);

    // --------------------------------------------------------
    // Luz suave frontal
    // --------------------------------------------------------

    const frontal =
        new THREE.DirectionalLight(
            0xc9ddff,
            0.8
        );

    frontal.position.set(
        8,
        10,
        15
    );

    escena.add(frontal);
}

// ============================================================
// PREPARAR INTERFAZ — SE COMPLETA EN PARTE 3
// ============================================================

function crearInterfazCinematica() {

    // El DOM completo se crea en la Parte 3.
    // Aquí solamente eliminamos interfaces anteriores.

    const anterior =
        document.getElementById(
            "eggaro-cinematica-ui"
        );

    if (anterior) {
        anterior.remove();
    }
}

// ============================================================
// PREPARACIÓN DE PERSONAJES — PARTE 2
// ============================================================
// ============================================================
// PARTE 2/4
// PERSONAJES + RIG + CAMINATA PROCEDURAL
// ============================================================

// ============================================================
// CARGAR PERSONAJES
// ============================================================

function cargarPersonajes() {

    cargarPersonaje(
        "./3D/mike.glb",
        "mike",
        new THREE.Vector3(-1.15, 0, 8.5),
        (actor) => {

            actor.root.rotation.y = Math.PI;

            mike = actor.root;
            actorMike = actor;

            comprobarPersonajesListos();
        }
    );

    cargarPersonaje(
        "./3D/micaela.glb",
        "micaela",
        new THREE.Vector3(1.15, 0, 9.2),
        (actor) => {

            actor.root.rotation.y = Math.PI;

            micaela = actor.root;
            actorMicaela = actor;

            comprobarPersonajesListos();
        }
    );
}

// ============================================================
// CARGAR UN PERSONAJE
// ============================================================

function cargarPersonaje(
    ruta,
    nombre,
    posicion,
    terminado
) {

    loader.load(
        ruta,

        (gltf) => {

            const modelo =
                gltf.scene;

            const root =
                new THREE.Group();

            root.name =
                nombre + "_ROOT";

            // ------------------------------------------------
            // Meter el modelo dentro del ROOT
            // ------------------------------------------------

            root.add(modelo);

            escena.add(root);

            // ------------------------------------------------
            // Sombras
            // ------------------------------------------------

            modelo.traverse(
                (objeto) => {

                    if (!objeto.isMesh) {
                        return;
                    }

                    objeto.castShadow = true;
                    objeto.receiveShadow = true;

                    if (
                        objeto.material
                    ) {

                        objeto.material
                            .roughness = 0.85;
                    }
                }
            );

            // ------------------------------------------------
            // Encontrar altura real del modelo
            // ------------------------------------------------

            let caja =
                new THREE.Box3()
                    .setFromObject(modelo);

            const tamaño =
                new THREE.Vector3();

            caja.getSize(tamaño);

            const altura =
                tamaño.y || 1;

            // ------------------------------------------------
            // Normalizar altura
            // ------------------------------------------------

            const escala =
                ALTURA_PERSONAJE /
                altura;

            modelo.scale.setScalar(
                escala
            );

            // ------------------------------------------------
            // Volver a calcular bounding box
            // ------------------------------------------------

            caja =
                new THREE.Box3()
                    .setFromObject(modelo);

            // ------------------------------------------------
            // IMPORTANTE:
            // colocar los pies exactamente en Y = 0
            // ------------------------------------------------

            modelo.position.y -=
                caja.min.y;

            // ------------------------------------------------
            // Posición inicial
            // ------------------------------------------------

            root.position.copy(
                posicion
            );

            root.position.y = 0;

            // ------------------------------------------------
            // Buscar esqueleto
            // ------------------------------------------------

            const huesos = [];

            modelo.traverse(
                (objeto) => {

                    if (
                        objeto.isBone
                    ) {
                        huesos.push(
                            objeto
                        );
                    }
                }
            );

            // ------------------------------------------------
            // Crear datos del rig
            // ------------------------------------------------

            const rig =
                crearControlRig(
                    modelo,
                    huesos
                );

            // ------------------------------------------------
            // Animaciones GLB
            // ------------------------------------------------
            // Si algún día el GLB trae clips,
            // los podremos utilizar.
            //
            // PERO la cinemática actual NO DEPENDE
            // de ellos.
            // ------------------------------------------------

            let mixer = null;

            if (
                gltf.animations &&
                gltf.animations.length > 0
            ) {

                mixer =
                    new THREE.AnimationMixer(
                        modelo
                    );
            }

            // ------------------------------------------------
            // Actor
            // ------------------------------------------------

            const actor = {

                nombre,

                root,

                modelo,

                huesos,

                rig,

                mixer,

                clips:
                    gltf.animations || [],

                tiempo: Math.random() * 10,

                caminando: false,

                velocidad: VELOCIDAD_CAMINATA,

                direccion:
                    new THREE.Vector3(
                        0,
                        0,
                        -1
                    ),

                altura:
                    ALTURA_PERSONAJE
            };

            terminado(actor);
        },

        undefined,

        (error) => {

            console.error(
                "No se pudo cargar:",
                ruta,
                error
            );

            // --------------------------------------------
            // Fallback para que la cinemática no muera
            // --------------------------------------------

            const actor =
                crearPersonajeFallback(
                    nombre,
                    posicion
                );

            terminado(actor);
        }
    );
}

// ============================================================
// CREAR CONTROL DEL RIG
// ============================================================

function crearControlRig(
    modelo,
    huesos
) {

    const rig = {

        piernaIzquierda: null,
        piernaDerecha: null,

        pieIzquierdo: null,
        pieDerecho: null,

        brazoIzquierdo: null,
        brazoDerecho: null,

        antebrazoIzquierdo: null,
        antebrazoDerecho: null,

        cadera: null,
        columna: null,
        pecho: null,
        cuello: null,
        cabeza: null
    };

    // --------------------------------------------------------
    // Buscar huesos por nombre
    // --------------------------------------------------------

    for (const hueso of huesos) {

        const n =
            hueso.name
                .toLowerCase()
                .replace(/[\s_-]/g, "");

        // ----------------------------------------------------
        // Pierna izquierda
        // ----------------------------------------------------

        if (
            !rig.piernaIzquierda &&
            (
                n.includes("leftleg") ||
                n.includes("legleft") ||
                n.includes("leftthigh") ||
                n.includes("thigh_l") ||
                n.includes("upperlegl") ||
                n.includes("uplegl")
            )
        ) {

            rig.piernaIzquierda =
                hueso;
        }

        // ----------------------------------------------------
        // Pierna derecha
        // ----------------------------------------------------

        if (
            !rig.piernaDerecha &&
            (
                n.includes("rightleg") ||
                n.includes("legright") ||
                n.includes("rightthigh") ||
                n.includes("thigh_r") ||
                n.includes("upperlegr") ||
                n.includes("uplegr")
            )
        ) {

            rig.piernaDerecha =
                hueso;
        }

        // ----------------------------------------------------
        // Pie izquierdo
        // ----------------------------------------------------

        if (
            !rig.pieIzquierdo &&
            (
                n.includes("leftfoot") ||
                n.includes("footleft") ||
                n.includes("foot_l")
            )
        ) {

            rig.pieIzquierdo =
                hueso;
        }

        // ----------------------------------------------------
        // Pie derecho
        // ----------------------------------------------------

        if (
            !rig.pieDerecho &&
            (
                n.includes("rightfoot") ||
                n.includes("footright") ||
                n.includes("foot_r")
            )
        ) {

            rig.pieDerecho =
                hueso;
        }

        // ----------------------------------------------------
        // Brazo izquierdo
        // ----------------------------------------------------

        if (
            !rig.brazoIzquierdo &&
            (
                n.includes("leftarm") ||
                n.includes("armleft") ||
                n.includes("upperarml") ||
                n.includes("arml")
            )
        ) {

            rig.brazoIzquierdo =
                hueso;
        }

        // ----------------------------------------------------
        // Brazo derecho
        // ----------------------------------------------------

        if (
            !rig.brazoDerecho &&
            (
                n.includes("rightarm") ||
                n.includes("armright") ||
                n.includes("upperarmr") ||
                n.includes("armr")
            )
        ) {

            rig.brazoDerecho =
                hueso;
        }

        // ----------------------------------------------------
        // Antebrazo izquierdo
        // ----------------------------------------------------

        if (
            !rig.antebrazoIzquierdo &&
            (
                n.includes("leftforearm") ||
                n.includes("forearml") ||
                n.includes("lowerarml")
            )
        ) {

            rig.antebrazoIzquierdo =
                hueso;
        }

        // ----------------------------------------------------
        // Antebrazo derecho
        // ----------------------------------------------------

        if (
            !rig.antebrazoDerecho &&
            (
                n.includes("rightforearm") ||
                n.includes("forearmr") ||
                n.includes("lowerarmr")
            )
        ) {

            rig.antebrazoDerecho =
                hueso;
        }

        // ----------------------------------------------------
        // Cadera
        // ----------------------------------------------------

        if (
            !rig.cadera &&
            (
                n === "hips" ||
                n === "pelvis" ||
                n.includes("hip")
            )
        ) {

            rig.cadera =
                hueso;
        }

        // ----------------------------------------------------
        // Columna
        // ----------------------------------------------------

        if (
            !rig.columna &&
            (
                n === "spine" ||
                n.includes("spine1") ||
                n.includes("spine01")
            )
        ) {

            rig.columna =
                hueso;
        }

        // ----------------------------------------------------
        // Pecho
        // ----------------------------------------------------

        if (
            !rig.pecho &&
            (
                n.includes("chest") ||
                n.includes("upperchest")
            )
        ) {

            rig.pecho =
                hueso;
        }

        // ----------------------------------------------------
        // Cuello
        // ----------------------------------------------------

        if (
            !rig.cuello &&
            n.includes("neck")
        ) {

            rig.cuello =
                hueso;
        }

        // ----------------------------------------------------
        // Cabeza
        // ----------------------------------------------------

        if (
            !rig.cabeza &&
            n.includes("head")
        ) {

            rig.cabeza =
                hueso;
        }
    }

    // --------------------------------------------------------
    // Si no encontró nombres exactos,
    // intentar encontrar extremidades por estructura.
    // --------------------------------------------------------

    if (
        !rig.piernaIzquierda ||
        !rig.piernaDerecha
    ) {

        detectarPiernasPorEstructura(
            huesos,
            rig
        );
    }

    if (
        !rig.brazoIzquierdo ||
        !rig.brazoDerecho
    ) {

        detectarBrazosPorEstructura(
            huesos,
            rig
        );
    }

    return rig;
}

// ============================================================
// DETECTAR PIERNAS POR ESTRUCTURA
// ============================================================

function detectarPiernasPorEstructura(
    huesos,
    rig
) {

    const candidatos =
        huesos.filter(
            (hueso) => {

                const y =
                    hueso.position.y;

                return (
                    y < 0.5
                );
            }
        );

    if (
        candidatos.length >= 2
    ) {

        candidatos.sort(
            (a, b) =>
                a.position.x -
                b.position.x
        );

        if (
            !rig.piernaIzquierda
        ) {

            rig.piernaIzquierda =
                candidatos[0];
        }

        if (
            !rig.piernaDerecha
        ) {

            rig.piernaDerecha =
                candidatos[
                    candidatos.length - 1
                ];
        }
    }
}

// ============================================================
// DETECTAR BRAZOS POR ESTRUCTURA
// ============================================================

function detectarBrazosPorEstructura(
    huesos,
    rig
) {

    const candidatos =
        huesos.filter(
            (hueso) => {

                const x =
                    Math.abs(
                        hueso.position.x
                    );

                return (
                    x > 0.15
                );
            }
        );

    if (
        candidatos.length >= 2
    ) {

        candidatos.sort(
            (a, b) =>
                a.position.x -
                b.position.x
        );

        if (
            !rig.brazoIzquierdo
        ) {

            rig.brazoIzquierdo =
                candidatos[0];
        }

        if (
            !rig.brazoDerecho
        ) {

            rig.brazoDerecho =
                candidatos[
                    candidatos.length - 1
                ];
        }
    }
}

// ============================================================
// FALLBACK DE PERSONAJE
// ============================================================

function crearPersonajeFallback(
    nombre,
    posicion
) {

    const root =
        new THREE.Group();

    root.name =
        nombre + "_FALLBACK";

    root.position.copy(
        posicion
    );

    const cuerpo =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.42,
                1.05,
                6,
                12
            ),
            new THREE.MeshStandardMaterial({
                color:
                    nombre === "mike"
                        ? 0x6f8fca
                        : 0xc889aa
            })
        );

    cuerpo.position.y =
        0.95;

    cuerpo.castShadow = true;

    root.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.38,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf0c9a5
            })
        );

    cabeza.position.y =
        1.85;

    cabeza.castShadow = true;

    root.add(cabeza);

    escena.add(root);

    return {

        nombre,

        root,

        modelo: root,

        huesos: [],

        rig: {},

        mixer: null,

        clips: [],

        tiempo: 0,

        caminando: false,

        velocidad:
            VELOCIDAD_CAMINATA,

        direccion:
            new THREE.Vector3(
                0,
                0,
                -1
            ),

        altura:
            ALTURA_PERSONAJE,

        fallback: true
    };
}

// ============================================================
// COMPROBAR PERSONAJES
// ============================================================

function comprobarPersonajesListos() {

    if (
        actorMike &&
        actorMicaela
    ) {

        // Ambos están listos.

        fase = 0;
        tiempoFase = 0;

        prepararPersonajesParaCaminata();
    }
}

// ============================================================
// PREPARAR CAMINATA
// ============================================================

function prepararPersonajesParaCaminata() {

    if (
        !actorMike ||
        !actorMicaela
    ) {
        return;
    }

    actorMike.caminando = true;
    actorMicaela.caminando = true;

    actorMike.tiempo = 0;
    actorMicaela.tiempo = 0;

    // --------------------------------------------------------
    // Asegurar que ambos siguen sobre el suelo
    // --------------------------------------------------------

    actorMike.root.position.y = 0;
    actorMicaela.root.position.y = 0;

    // --------------------------------------------------------
    // Mirando hacia el frente del bosque
    // --------------------------------------------------------

    actorMike.root.rotation.y =
        Math.PI;

    actorMicaela.root.rotation.y =
        Math.PI;
}

// ============================================================
// ACTUALIZAR CAMINATA
// ============================================================

function actualizarCaminata(
    actor,
    delta
) {

    if (
        !actor ||
        !actor.caminando
    ) {
        return;
    }

    actor.tiempo += delta;

    // --------------------------------------------------------
    // Avance real
    // --------------------------------------------------------

    actor.root.position.z -=
        actor.velocidad * delta;

    // --------------------------------------------------------
    // Movimiento procedural del rig
    // --------------------------------------------------------

    const rig =
        actor.rig;

    const paso =
        Math.sin(
            actor.tiempo * 8.0
        );

    const pasoContrario =
        Math.sin(
            actor.tiempo * 8.0 +
            Math.PI
        );

    // --------------------------------------------------------
    // Piernas
    // --------------------------------------------------------

    if (
        rig.piernaIzquierda
    ) {

        rig.piernaIzquierda.rotation.x =
            paso * 0.55;
    }

    if (
        rig.piernaDerecha
    ) {

        rig.piernaDerecha.rotation.x =
            pasoContrario * 0.55;
    }

    // --------------------------------------------------------
    // Brazos
    // --------------------------------------------------------

    if (
        rig.brazoIzquierdo
    ) {

        rig.brazoIzquierdo.rotation.x =
            pasoContrario * 0.32;
    }

    if (
        rig.brazoDerecho
    ) {

        rig.brazoDerecho.rotation.x =
            paso * 0.32;
    }

    // --------------------------------------------------------
    // Antebrazos
    // --------------------------------------------------------

    if (
        rig.antebrazoIzquierdo
    ) {

        rig.antebrazoIzquierdo.rotation.x =
            Math.abs(paso) * 0.08;
    }

    if (
        rig.antebrazoDerecho
    ) {

        rig.antebrazoDerecho.rotation.x =
            Math.abs(pasoContrario) * 0.08;
    }

    // --------------------------------------------------------
    // Cadera
    // --------------------------------------------------------

    if (
        rig.cadera
    ) {

        rig.cadera.rotation.z =
            Math.sin(
                actor.tiempo * 4
            ) * 0.035;
    }

    // --------------------------------------------------------
    // Columna
    // --------------------------------------------------------

    if (
        rig.columna
    ) {

        rig.columna.rotation.x =
            Math.sin(
                actor.tiempo * 4
            ) * 0.025;
    }

    // --------------------------------------------------------
    // Cabeza
    // --------------------------------------------------------

    if (
        rig.cabeza
    ) {

        rig.cabeza.rotation.y =
            Math.sin(
                actor.tiempo * 2
            ) * 0.025;
    }

    // --------------------------------------------------------
    // Pequeño rebote del ROOT
    // --------------------------------------------------------

    const rebote =
        Math.abs(
            Math.sin(
                actor.tiempo * 8
            )
        ) * 0.035;

    actor.root.position.y =
        rebote;

    // --------------------------------------------------------
    // Si el GLB tiene mixer, actualizarlo también.
    // La caminata procedural sigue funcionando aunque
    // no tenga ningún clip.
    // --------------------------------------------------------

    if (
        actor.mixer
    ) {

        actor.mixer.update(
            delta
        );
    }
}

// ============================================================
// DETENER CAMINATA
// ============================================================

function detenerCaminata(
    actor
) {

    if (!actor) {
        return;
    }

    actor.caminando = false;

    actor.root.position.y = 0;

    const rig =
        actor.rig;

    if (
        rig.piernaIzquierda
    ) {

        rig.piernaIzquierda.rotation.x = 0;
    }

    if (
        rig.piernaDerecha
    ) {

        rig.piernaDerecha.rotation.x = 0;
    }

    if (
        rig.brazoIzquierdo
    ) {

        rig.brazoIzquierdo.rotation.x = 0;
    }

    if (
        rig.brazoDerecho
    ) {

        rig.brazoDerecho.rotation.x = 0;
    }
}

// ============================================================
// MIRAR HACIA UN PUNTO
// ============================================================

function mirarActorHacia(
    actor,
    objetivo
) {

    if (!actor) {
        return;
    }

    const punto =
        objetivo.clone();

    punto.y =
        actor.root.position.y;

    actor.root.lookAt(
        punto
    );
}

// ============================================================
// MOVIMIENTO SUAVE DE CÁMARA
// ============================================================

function moverCamara(
    posicion,
    objetivo,
    suavidad = 0.06
) {

    if (!camara) {
        return;
    }

    camara.position.lerp(
        posicion,
        suavidad
    );

    objetivoCamara.lerp(
        objetivo,
        suavidad
    );

    camara.lookAt(
        objetivoCamara
    );
}

// ============================================================
// FIN DE PARTE 2
// ============================================================
// ============================================================
// PARTE 3/4
// POLLO + HUEVO + DIÁLOGOS + CONTROLES DE CINEMÁTICA
// ============================================================

// ============================================================
// POLLO DEL ENCUENTRO
// ============================================================

function crearPolloEncuentro() {

    // --------------------------------------------------------
    // Si después conectamos el sistema real de pollos,
    // esta función podrá ser reemplazada sin tocar la cinemática.
    // --------------------------------------------------------

    const grupo =
        new THREE.Group();

    grupo.name =
        "PolloEncuentro";

    // --------------------------------------------------------
    // Cuerpo
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                20,
                14
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf2c94c,
                roughness: 0.8
            })
        );

    cuerpo.scale.set(
        1,
        0.9,
        1.05
    );

    cuerpo.position.y =
        0.55;

    cuerpo.castShadow = true;

    grupo.add(cuerpo);

    // --------------------------------------------------------
    // Cabeza
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.35,
                18,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf4d35e,
                roughness: 0.8
            })
        );

    cabeza.position.set(
        0,
        0.98,
        0.02
    );

    cabeza.castShadow = true;

    grupo.add(cabeza);

    // --------------------------------------------------------
    // Ojos
    // --------------------------------------------------------

    const ojoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.3
        });

    const ojoIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.055,
                10,
                8
            ),
            ojoMaterial
        );

    ojoIzq.position.set(
        -0.12,
        1.03,
        0.31
    );

    grupo.add(ojoIzq);

    const ojoDer =
        ojoIzq.clone();

    ojoDer.position.x =
        0.12;

    grupo.add(ojoDer);

    // --------------------------------------------------------
    // Pico
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.12,
                0.25,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf08a24,
                roughness: 0.8
            })
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        0.94,
        0.38
    );

    grupo.add(pico);

    // --------------------------------------------------------
    // Cresta
    // --------------------------------------------------------

    const cresta =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.10,
                10,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd94a3d
            })
        );

    cresta.scale.set(
        0.7,
        1.3,
        0.7
    );

    cresta.position.set(
        0,
        1.30,
        0
    );

    grupo.add(cresta);

    // --------------------------------------------------------
    // Alas
    // --------------------------------------------------------

    const alaMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xe8b936,
            roughness: 0.9
        });

    const alaIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.23,
                12,
                8
            ),
            alaMaterial
        );

    alaIzq.scale.set(
        0.55,
        1,
        0.35
    );

    alaIzq.position.set(
        -0.43,
        0.58,
        0
    );

    alaIzq.rotation.z =
        -0.25;

    grupo.add(alaIzq);

    const alaDer =
        alaIzq.clone();

    alaDer.position.x =
        0.43;

    alaDer.rotation.z =
        0.25;

    grupo.add(alaDer);

    // --------------------------------------------------------
    // Patas
    // --------------------------------------------------------

    const pataMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xe58b28
        });

    for (const x of [-0.15, 0.15]) {

        const pata =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.035,
                    0.045,
                    0.28,
                    8
                ),
                pataMaterial
            );

        pata.position.set(
            x,
            0.16,
            0
        );

        grupo.add(pata);

        const pie =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.07,
                    8,
                    6
                ),
                pataMaterial
            );

        pie.scale.z = 1.5;

        pie.position.set(
            x,
            0.035,
            0.07
        );

        grupo.add(pie);
    }

    grupo.userData.animar =
        (tiempo) => {

            grupo.position.y =
                Math.abs(
                    Math.sin(
                        tiempo * 3
                    )
                ) * 0.025;

            grupo.rotation.y =
                Math.sin(
                    tiempo * 1.2
                ) * 0.08;
        };

    return grupo;
}

// ============================================================
// HUEVO CINEMÁTICO
// ============================================================

function crearHuevoCinematico() {

    const grupo =
        new THREE.Group();

    grupo.name =
        "HuevoCinematico";

    // --------------------------------------------------------
    // Geometría principal
    // --------------------------------------------------------

    const geometria =
        new THREE.SphereGeometry(
            1,
            48,
            32
        );

    const posiciones =
        geometria.attributes.position;

    const colores =
        new Float32Array(
            posiciones.count * 3
        );

    const amarillo =
        new THREE.Color(
            0xf1c84b
        );

    const azul =
        new THREE.Color(
            0x4b8fc9
        );

    const verde =
        new THREE.Color(
            0x72a95c
        );

    const negro =
        new THREE.Color(
            0x20251d
        );

    const temp =
        new THREE.Color();

    // --------------------------------------------------------
    // Colorear por altura
    // --------------------------------------------------------

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {

        const y =
            posiciones.getY(i);

        const normalY =
            y / 1;

        if (
            normalY > 0.28
        ) {

            temp.copy(
                amarillo
            );

        } else if (
            normalY > -0.30
        ) {

            temp.copy(
                azul
            );

        } else {

            temp.copy(
                verde
            );
        }

        colores[i * 3] =
            temp.r;

        colores[i * 3 + 1] =
            temp.g;

        colores[i * 3 + 2] =
            temp.b;
    }

    geometria.setAttribute(
        "color",
        new THREE.BufferAttribute(
            colores,
            3
        )
    );

    const material =
        new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.65,
            metalness: 0.02
        });

    const cuerpo =
        new THREE.Mesh(
            geometria,
            material
        );

    cuerpo.scale.set(
        0.78,
        1.05,
        0.78
    );

    cuerpo.castShadow = true;

    grupo.add(cuerpo);

    // --------------------------------------------------------
    // Líneas divisorias
    // --------------------------------------------------------

    const lineaMaterial =
        new THREE.MeshStandardMaterial({
            color: negro,
            roughness: 0.7
        });

    const lineaSuperior =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.615,
                0.025,
                8,
                48
            ),
            lineaMaterial
        );

    lineaSuperior.rotation.x =
        Math.PI / 2;

    lineaSuperior.position.y =
        0.25;

    lineaSuperior.scale.set(
        1,
        1,
        1
    );

    grupo.add(
        lineaSuperior
    );

    const lineaInferior =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.59,
                0.025,
                8,
                48
            ),
            lineaMaterial
        );

    lineaInferior.rotation.x =
        Math.PI / 2;

    lineaInferior.position.y =
        -0.28;

    grupo.add(
        lineaInferior
    );

    // --------------------------------------------------------
    // Sombra inferior
    // --------------------------------------------------------

    const sombra =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                0.75,
                32
            ),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.20
            })
        );

    sombra.rotation.x =
        -Math.PI / 2;

    sombra.position.y =
        -1.03;

    grupo.add(sombra);

    return grupo;
}

// ============================================================
// RESULTADO EXTERNO
// ============================================================

export function establecerResultadoCinematica(
    tipo
) {

    if (
        typeof tipo !== "string"
    ) {
        return;
    }

    const limpio =
        tipo
            .toLowerCase()
            .trim();

    const permitidos = [
        "noob",
        "zombie",
        "pollitoNoob",
        "pollito_noob",
        "pollito noob"
    ];

    if (
        permitidos.includes(
            limpio
        )
    ) {

        resultadoCinematica =
            limpio;
    }
}

// ============================================================
// CONECTAR CREADOR DE POLLOS
// ============================================================

export function conectarCreadorPolloCinematico(
    funcion
) {

    if (
        typeof funcion === "function"
    ) {

        creadorPolloCinematico =
            funcion;
    }
}

// ============================================================
// CREAR POLLO RESULTADO FALLBACK
// ============================================================

function crearPolloResultadoFallback(
    tipo
) {

    const grupo =
        crearPolloEncuentro();

    grupo.name =
        "Resultado_" + tipo;

    if (
        tipo === "zombie"
    ) {

        grupo.traverse(
            (objeto) => {

                if (
                    objeto.isMesh &&
                    objeto.material
                ) {

                    objeto.material =
                        objeto.material.clone();

                    objeto.material.color.set(
                        0x69a85b
                    );
                }
            }
        );
    }

    if (
        tipo === "pollitoNoob" ||
        tipo === "pollito_noob" ||
        tipo === "pollito noob"
    ) {

        grupo.scale.setScalar(
            0.72
        );
    }

    return grupo;
}

// ============================================================
// CREAR RESULTADO
// ============================================================

function crearPolloResultado(
    tipo
) {

    let modelo = null;

    // --------------------------------------------------------
    // Primero intenta usar el sistema externo de pollos.
    // --------------------------------------------------------

    if (
        creadorPolloCinematico
    ) {

        try {

            modelo =
                creadorPolloCinematico(
                    tipo
                );

        } catch (error) {

            console.warn(
                "Error creando pollo externo:",
                error
            );
        }
    }

    // --------------------------------------------------------
    // También permite conectar el sistema mediante window.
    // --------------------------------------------------------

    if (
        !modelo &&
        typeof window !== "undefined" &&
        typeof window.EGGARO_CREADOR_POLLO === "function"
    ) {

        try {

            modelo =
                window.EGGARO_CREADOR_POLLO(
                    tipo
                );

        } catch (error) {

            console.warn(
                "Error en EGGARO_CREADOR_POLLO:",
                error
            );
        }
    }

    // --------------------------------------------------------
    // Fallback temporal
    // --------------------------------------------------------

    if (
        !modelo
    ) {

        modelo =
            crearPolloResultadoFallback(
                tipo
            );
    }

    // --------------------------------------------------------
    // Asegurar Object3D
    // --------------------------------------------------------

    if (
        !modelo ||
        !modelo.isObject3D
    ) {

        modelo =
            crearPolloResultadoFallback(
                tipo
            );
    }

    modelo.position.set(
        0,
        0,
        0
    );

    modelo.rotation.set(
        0,
        Math.PI,
        0
    );

    return modelo;
}

// ============================================================
// CREAR INTERFAZ
// ============================================================

function crearInterfazCompleta() {

    let ui =
        document.getElementById(
            "eggaro-cinematica-ui"
        );

    if (ui) {
        ui.remove();
    }

    ui =
        document.createElement(
            "div"
        );

    ui.id =
        "eggaro-cinematica-ui";

    ui.style.position =
        "fixed";

    ui.style.left = "0";
    ui.style.top = "0";
    ui.style.width = "100%";
    ui.style.height = "100%";

    ui.style.pointerEvents =
        "none";

    ui.style.zIndex =
        "10000";

    document.body.appendChild(
        ui
    );

    // --------------------------------------------------------
    // Diálogo
    // --------------------------------------------------------

    dialogoUI =
        document.createElement(
            "div"
        );

    dialogoUI.style.position =
        "absolute";

    dialogoUI.style.left =
        "50%";

    dialogoUI.style.bottom =
        "7%";

    dialogoUI.style.transform =
        "translateX(-50%)";

    dialogoUI.style.width =
        "min(90%, 700px)";

    dialogoUI.style.padding =
        "18px 22px";

    dialogoUI.style.boxSizing =
        "border-box";

    dialogoUI.style.borderRadius =
        "18px";

    dialogoUI.style.background =
        "rgba(0,0,0,.72)";

    dialogoUI.style.border =
        "2px solid rgba(255,255,255,.25)";

    dialogoUI.style.color =
        "white";

    dialogoUI.style.fontFamily =
        "Arial, sans-serif";

    dialogoUI.style.fontSize =
        "clamp(18px, 3vw, 28px)";

    dialogoUI.style.textAlign =
        "center";

    dialogoUI.style.opacity =
        "0";

    dialogoUI.style.transition =
        "opacity .25s ease";

    ui.appendChild(
        dialogoUI
    );

    // --------------------------------------------------------
    // Subtítulo
    // --------------------------------------------------------

    subtituloUI =
        document.createElement(
            "div"
        );

    subtituloUI.style.position =
        "absolute";

    subtituloUI.style.left =
        "50%";

    subtituloUI.style.top =
        "12%";

    subtituloUI.style.transform =
        "translateX(-50%)";

    subtituloUI.style.color =
        "white";

    subtituloUI.style.fontFamily =
        "Arial, sans-serif";

    subtituloUI.style.fontWeight =
        "bold";

    subtituloUI.style.fontSize =
        "clamp(20px, 4vw, 34px)";

    subtituloUI.style.textShadow =
        "0 3px 8px #000";

    subtituloUI.style.opacity =
        "0";

    subtituloUI.style.transition =
        "opacity .2s ease";

    ui.appendChild(
        subtituloUI
    );

    // --------------------------------------------------------
    // Flash/POM
    // --------------------------------------------------------

    flashUI =
        document.createElement(
            "div"
        );

    flashUI.style.position =
        "absolute";

    flashUI.style.left =
        "0";

    flashUI.style.top =
        "0";

    flashUI.style.width =
        "100%";

    flashUI.style.height =
        "100%";

    flashUI.style.background =
        "white";

    flashUI.style.opacity =
        "0";

    flashUI.style.transition =
        "opacity .15s ease";

    ui.appendChild(
        flashUI
    );
}

// ============================================================
// MOSTRAR DIÁLOGO
// ============================================================

function mostrarDialogo(
    texto
) {

    if (
        !dialogoUI
    ) {

        crearInterfazCompleta();
    }

    dialogoUI.textContent =
        texto;

    dialogoUI.style.opacity =
        "1";
}

// ============================================================
// OCULTAR DIÁLOGO
// ============================================================

function ocultarDialogo() {

    if (
        dialogoUI
    ) {

        dialogoUI.style.opacity =
            "0";
    }
}

// ============================================================
// MOSTRAR SUBTÍTULO
// ============================================================

function mostrarSubtitulo(
    texto
) {

    if (
        !subtituloUI
    ) {

        crearInterfazCompleta();
    }

    subtituloUI.textContent =
        texto;

    subtituloUI.style.opacity =
        "1";
}

// ============================================================
// OCULTAR SUBTÍTULO
// ============================================================

function ocultarSubtitulo() {

    if (
        subtituloUI
    ) {

        subtituloUI.style.opacity =
            "0";
    }
}

// ============================================================
// POM
// ============================================================

function ejecutarPOM() {

    if (
        pomRealizado
    ) {
        return;
    }

    pomRealizado =
        true;

    mostrarSubtitulo(
        "¡POM!"
    );

    if (
        flashUI
    ) {

        flashUI.style.opacity =
            "0.95";

        setTimeout(
            () => {

                if (
                    flashUI
                ) {

                    flashUI.style.opacity =
                        "0";
                }

            },
            120
        );
    }

    // --------------------------------------------------------
    // Pequeña sacudida de cámara
    // --------------------------------------------------------

    if (
        camara
    ) {

        camara.position.x +=
            0.10;

        camara.position.y +=
            0.05;
    }
}

// ============================================================
// FIN DE PARTE 3
// ============================================================
// ============================================================
// PARTE 4/4
// ANIMACIÓN + CÁMARA + DIÁLOGOS + HUEVO + RESULTADO
// ============================================================

// ============================================================
// ANIMACIÓN PRINCIPAL
// ============================================================

function animar() {

    if (!renderer || !escena || !camara) {
        return;
    }

    requestAnimationFrame(animar);

    const delta =
        Math.min(
            reloj.getDelta(),
            0.05
        );

    tiempoFase += delta;

    // --------------------------------------------------------
    // Actualizar personajes
    // --------------------------------------------------------

    actualizarActores(delta);

    // --------------------------------------------------------
    // Actualizar pollo
    // --------------------------------------------------------

    if (
        polloEncuentro &&
        polloEncuentro.visible &&
        polloEncuentro.userData.animar
    ) {

        polloEncuentro.userData.animar(
            reloj.elapsedTime
        );
    }

    // --------------------------------------------------------
    // Actualizar secuencia
    // --------------------------------------------------------

    actualizarCinematica(delta);

    // --------------------------------------------------------
    // Render
    // --------------------------------------------------------

    renderer.render(
        escena,
        camara
    );
}

// ============================================================
// ACTUALIZAR ACTORES
// ============================================================

function actualizarActores(delta) {

    if (actorMike) {

        actualizarCaminata(
            actorMike,
            delta
        );
    }

    if (actorMicaela) {

        actualizarCaminata(
            actorMicaela,
            delta
        );
    }
}

// ============================================================
// SECUENCIA DE LA CINEMÁTICA
// ============================================================

function actualizarCinematica(delta) {

    if (
        !cinematicaActiva
    ) {
        return;
    }

    // ========================================================
    // FASE 0
    // LLEGADA AL BOSQUE
    // ========================================================

    if (fase === 0) {

        ocultarDialogo();
        ocultarSubtitulo();

        const posicion =
            new THREE.Vector3(
                0,
                3.7,
                12
            );

        const objetivo =
            new THREE.Vector3(
                0,
                1.2,
                4
            );

        moverCamara(
            posicion,
            objetivo,
            0.035
        );

        if (
            tiempoFase > 1.8
        ) {

            fase = 1;
            tiempoFase = 0;

            if (
                actorMike
            ) {

                actorMike.caminando =
                    true;
            }

            if (
                actorMicaela
            ) {

                actorMicaela.caminando =
                    true;
            }
        }

        return;
    }

    // ========================================================
    // FASE 1
    // MIKE Y MICAELA CAMINAN
    // ========================================================

    if (fase === 1) {

        if (
            actorMike
        ) {

            actorMike.caminando =
                true;
        }

        if (
            actorMicaela
        ) {

            actorMicaela.caminando =
                true;
        }

        const centro =
            new THREE.Vector3(
                0,
                1.1,
                5
            );

        const posicion =
            new THREE.Vector3(
                0,
                4.0,
                11.5
            );

        moverCamara(
            posicion,
            centro,
            0.045
        );

        // ----------------------------------------------------
        // Cuando llegan aproximadamente al punto
        // ----------------------------------------------------

        if (
            actorMike &&
            actorMicaela &&
            actorMike.root.position.z <=
                POSICION_FINAL_MIKE.z + 0.15
        ) {

            actorMike.root.position.z =
                POSICION_FINAL_MIKE.z;

            actorMicaela.root.position.z =
                POSICION_FINAL_MICAELA.z;

            detenerCaminata(
                actorMike
            );

            detenerCaminata(
                actorMicaela
            );

            fase = 2;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 2
    // "¿DÓNDE ESTAMOS?"
    // ========================================================

    if (fase === 2) {

        mirarActorHacia(
            actorMike,
            new THREE.Vector3(
                0,
                1,
                -2
            )
        );

        mirarActorHacia(
            actorMicaela,
            new THREE.Vector3(
                0,
                1,
                -2
            )
        );

        mostrarDialogo(
            "Micaela: ¿Dónde estamos?"
        );

        const posicion =
            new THREE.Vector3(
                0,
                3.3,
                8.8
            );

        const objetivo =
            new THREE.Vector3(
                0,
                1.25,
                3
            );

        moverCamara(
            posicion,
            objetivo,
            0.05
        );

        if (
            tiempoFase > 2.6
        ) {

            fase = 3;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 3
    // MIKE RESPONDE
    // ========================================================

    if (fase === 3) {

        mostrarDialogo(
            "Mike: No sé... pero se ve algo a lo lejos."
        );

        if (
            tiempoFase > 3.0
        ) {

            fase = 4;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 4
    // SE ESCUCHA EL POLLO
    // ========================================================

    if (fase === 4) {

        ocultarDialogo();

        mostrarSubtitulo(
            "🐥 Pío pío..."
        );

        // ----------------------------------------------------
        // Mostrar pollo
        // ----------------------------------------------------

        if (
            polloEncuentro
        ) {

            polloEncuentro.visible =
                true;
        }

        const posicion =
            new THREE.Vector3(
                0,
                2.5,
                6
            );

        const objetivo =
            new THREE.Vector3(
                0,
                0.8,
                -0.4
            );

        moverCamara(
            posicion,
            objetivo,
            0.045
        );

        if (
            tiempoFase > 2.4
        ) {

            fase = 5;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 5
    // "¿QUÉ ES ESE SONIDO?"
    // ========================================================

    if (fase === 5) {

        mostrarDialogo(
            "Micaela: ¿Qué es ese sonido?"
        );

        ocultarSubtitulo();

        if (
            tiempoFase > 2.5
        ) {

            fase = 6;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 6
    // "PARECE UN POLLO..."
    // ========================================================

    if (fase === 6) {

        mostrarDialogo(
            "Mike: Parece un pollo..."
        );

        const posicion =
            new THREE.Vector3(
                0,
                2.8,
                5.2
            );

        const objetivo =
            new THREE.Vector3(
                0,
                0.8,
                -0.4
            );

        moverCamara(
            posicion,
            objetivo,
            0.05
        );

        if (
            tiempoFase > 2.5
        ) {

            fase = 7;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 7
    // DESCUBREN EL HUEVO
    // ========================================================

    if (fase === 7) {

        mostrarDialogo(
            "Mike: ¡Mira! ¡Un huevo!"
        );

        // ----------------------------------------------------
        // Ocultar pollo
        // ----------------------------------------------------

        if (
            polloEncuentro
        ) {

            polloEncuentro.visible =
                false;
        }

        // ----------------------------------------------------
        // Mostrar huevo arriba
        // ----------------------------------------------------

        if (
            huevo
        ) {

            huevo.visible =
                true;

            huevo.position.copy(
                POSICION_HUEVO
            );

            huevo.position.y =
                7.5;

            huevo.rotation.set(
                0,
                0,
                0
            );

            huevo.scale.setScalar(
                1
            );
        }

        huevoLanzado =
            true;

        const posicion =
            new THREE.Vector3(
                0,
                4.0,
                5.8
            );

        const objetivo =
            new THREE.Vector3(
                0,
                1.4,
                -1.1
            );

        moverCamara(
            posicion,
            objetivo,
            0.065
        );

        if (
            tiempoFase > 2.2
        ) {

            fase = 8;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 8
    // HUEVO CAE
    // ========================================================

    if (fase === 8) {

        ocultarDialogo();

        if (
            huevo
        ) {

            const duracion =
                2.0;

            const progreso =
                Math.min(
                    tiempoFase /
                    duracion,
                    1
                );

            // ------------------------------------------------
            // Caída
            // ------------------------------------------------

            const inicioY =
                7.5;

            const finalY =
                1.15;

            // gravedad visual
            const caida =
                progreso *
                progreso;

            huevo.position.y =
                THREE.MathUtils.lerp(
                    inicioY,
                    finalY,
                    caida
                );

            // ------------------------------------------------
            // Giro durante la caída
            // ------------------------------------------------

            huevo.rotation.y +=
                delta * 4;

            huevo.rotation.z +=
                delta * 1.4;

            // ------------------------------------------------
            // Pequeña inclinación
            // ------------------------------------------------

            huevo.rotation.x =
                Math.sin(
                    progreso * Math.PI
                ) * 0.16;

            const posicion =
                new THREE.Vector3(
                    0,
                    3.0,
                    4.6
                );

            const objetivo =
                new THREE.Vector3(
                    0,
                    1.1,
                    -1.1
                );

            moverCamara(
                posicion,
                objetivo,
                0.06
            );

            if (
                progreso >= 1
            ) {

                fase = 9;
                tiempoFase = 0;
            }
        }

        return;
    }

    // ========================================================
    // FASE 9
    // REBOTE + GIRO DEL HUEVO
    // ========================================================

    if (fase === 9) {

        if (
            huevo
        ) {

            // ------------------------------------------------
            // Rebote
            // ------------------------------------------------

            const rebote =
                Math.sin(
                    Math.min(
                        tiempoFase * 5,
                        Math.PI
                    )
                );

            huevo.position.y =
                1.15 +
                rebote * 0.42;

            // ------------------------------------------------
            // Giro
            // ------------------------------------------------

            huevo.rotation.y +=
                delta * 8;

            huevo.rotation.z +=
                delta * 2.5;

            huevo.rotation.x =
                Math.sin(
                    tiempoFase * 5
                ) * 0.12;

            const posicion =
                new THREE.Vector3(
                    0,
                    2.8,
                    3.7
                );

            const objetivo =
                new THREE.Vector3(
                    0,
                    1.1,
                    -1.1
                );

            moverCamara(
                posicion,
                objetivo,
                0.075
            );

            if (
                tiempoFase > 1.8
            ) {

                fase = 10;
                tiempoFase = 0;
            }
        }

        return;
    }

    // ========================================================
    // FASE 10
    // POM + RESULTADO
    // ========================================================

    if (fase === 10) {

        if (
            !pomRealizado
        ) {

            ejecutarPOM();

            if (
                huevo
            ) {

                huevo.visible =
                    false;
            }

            fase = 11;
            tiempoFase = 0;
        }

        return;
    }

    // ========================================================
    // FASE 11
    // RESULTADO A PANTALLA COMPLETA
    // ========================================================

    if (fase === 11) {

        mostrarResultadoCinematico();

        return;
    }

    // ========================================================
    // FASE 12
    // FINAL
    // ========================================================

    if (fase === 12) {

        finalizarCinematica();

        return;
    }
}

// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultadoCinematico() {

    if (
        !resultadoPollo
    ) {

        resultadoPollo =
            crearPolloResultado(
                resultadoCinematica
            );

        resultadoPollo.position.set(
            0,
            0,
            0
        );

        resultadoPollo.scale.setScalar(
            1.8
        );

        escena.add(
            resultadoPollo
        );

        // ----------------------------------------------------
        // Cámara de resultado
        // ----------------------------------------------------

        camara.position.set(
            0,
            1.8,
            5.2
        );

        objetivoCamara.set(
            0,
            1.1,
            0
        );

        camara.lookAt(
            objetivoCamara
        );

        mostrarSubtitulo(
            obtenerTextoResultado()
        );
    }

    // --------------------------------------------------------
    // Entrada del resultado
    // --------------------------------------------------------

    const entrada =
        Math.min(
            tiempoFase / 0.8,
            1
        );

    resultadoPollo.scale.setScalar(
        THREE.MathUtils.lerp(
            0.2,
            1.8,
            entrada
        )
    );

    resultadoPollo.position.y =
        Math.sin(
            tiempoFase * 4
        ) * 0.05;

    resultadoPollo.rotation.y +=
        0.008;

    // --------------------------------------------------------
    // Cámara ligeramente dinámica
    // --------------------------------------------------------

    const posicion =
        new THREE.Vector3(
            Math.sin(
                tiempoFase * 0.35
            ) * 0.5,
            1.8,
            5.2
        );

    const objetivo =
        new THREE.Vector3(
            0,
            1.0,
            0
        );

    moverCamara(
        posicion,
        objetivo,
        0.035
    );

    if (
        tiempoFase > 4.0
    ) {

        fase = 12;
        tiempoFase = 0;
    }
}

// ============================================================
// TEXTO DEL RESULTADO
// ============================================================

function obtenerTextoResultado() {

    const tipo =
        String(
            resultadoCinematica
        ).toLowerCase();

    if (
        tipo === "zombie"
    ) {

        return "🧟 ¡POLLO ZOMBIE!";
    }

    if (
        tipo === "pollitonoob" ||
        tipo === "pollito_noob" ||
        tipo === "pollito noob"
    ) {

        return "🐤 ¡POLLITO NOOB!";
    }

    return "🐔 ¡POLLO NOOB!";
}

// ============================================================
// FINALIZAR
// ============================================================

function finalizarCinematica() {

    if (
        cinematicaFinalizada
    ) {
        return;
    }

    cinematicaFinalizada =
        true;

    cinematicaActiva =
        false;

    ocultarDialogo();
    ocultarSubtitulo();

    // --------------------------------------------------------
    // Avisar al juego
    // --------------------------------------------------------

    setTimeout(
        () => {

            if (
                typeof window !== "undefined" &&
                typeof window.EGGARO_CINEMATICA_TERMINADA ===
                    "function"
            ) {

                try {

                    window.EGGARO_CINEMATICA_TERMINADA(
                        resultadoCinematica
                    );

                } catch (error) {

                    console.warn(
                        error
                    );
                }
            }

        },
        100
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

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            1.75
        )
    );
}

// ============================================================
// COMPROBAR SI TERMINÓ
// ============================================================

export function cinematicaTerminada() {

    return cinematicaFinalizada;
}

// ============================================================
// DETENER CINEMÁTICA
// ============================================================

export function detenerCinematica() {

    cinematicaActiva =
        false;

    cinematicaFinalizada =
        true;

    // --------------------------------------------------------
    // Eliminar interfaz
    // --------------------------------------------------------

    const ui =
        document.getElementById(
            "eggaro-cinematica-ui"
        );

    if (ui) {
        ui.remove();
    }

    dialogoUI = null;
    subtituloUI = null;
    flashUI = null;

    // --------------------------------------------------------
    // Eliminar canvas
    // --------------------------------------------------------

    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.remove();
    }

    // --------------------------------------------------------
    // Liberar renderer
    // --------------------------------------------------------

    if (renderer) {

        try {

            renderer.dispose();

        } catch (error) {

            console.warn(
                error
            );
        }
    }

    renderer = null;
    escena = null;
    camara = null;

    mike = null;
    micaela = null;

    actorMike = null;
    actorMicaela = null;

    polloEncuentro = null;
    huevo = null;
    resultadoPollo = null;

    huevoLanzado = false;
    huevoTerminado = false;
    pomRealizado = false;
}

// ============================================================
// EXPORTACIONES
// ============================================================

export {
    ajustarPantalla
};

// ============================================================
// FIN DE ESCENA CINEMÁTICA
// ============================================================
