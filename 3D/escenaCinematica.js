// ==============================================
// 3D/escenaCinematica.js
// EGGARO / GAMERPRO GAME
// CINEMÁTICA COMPLETA
// ==============================================

import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { GLTFLoader } from
"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

let escena = null;
let camara = null;
let renderer = null;
let reloj = null;

let actorMike = null;
let actorMicaela = null;
let polloEncuentro = null;
let huevoCinematico = null;
let polloResultado = null;

let faseCinematica = 0;
let tiempoFase = 0;
let resultadoCinematica = "noob";

let animando = false;
let resizeActivo = false;

const POSICION_INICIAL_MIKE = {
    x: -1.35,
    y: 0,
    z: 8
};

const POSICION_INICIAL_MICAELA = {
    x: 1.35,
    y: 0,
    z: 8
};

const POSICION_FINAL_MIKE = {
    x: -1.35,
    y: 0,
    z: 0.8
};

const POSICION_FINAL_MICAELA = {
    x: 1.35,
    y: 0,
    z: 0.8
};

const loader = new GLTFLoader();

function crearEscena() {

    escena = new THREE.Scene();

    escena.background =
        new THREE.Color(0x9bc7e8);

    reloj = new THREE.Clock();

    crearIluminacion();
    crearSuelo();
    crearBosque();

    camara = new THREE.PerspectiveCamera(
        48,
        innerWidth / innerHeight,
        0.1,
        100
    );

    camara.position.set(
        0,
        4.2,
        10
    );

    camara.lookAt(
        0,
        1.5,
        0
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    renderer.setPixelRatio(
        Math.min(devicePixelRatio, 1.5)
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    document.body.appendChild(
        renderer.domElement
    );

    ajustarPantalla();

    resizeActivo = true;

    window.addEventListener(
        "resize",
        ajustarPantalla
    );
}

function crearIluminacion() {

    const hemi =
        new THREE.HemisphereLight(
            0xffffff,
            0x49633e,
            1.8
        );

    escena.add(hemi);

    const sol =
        new THREE.DirectionalLight(
            0xffffff,
            2.2
        );

    sol.position.set(
        8,
        14,
        6
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 1024;
    sol.shadow.mapSize.height = 1024;

    escena.add(sol);
        }
function crearSuelo() {

    const geo =
        new THREE.PlaneGeometry(
            80,
            80
        );

    const mat =
        new THREE.MeshStandardMaterial({
            color: 0x5e8c55,
            roughness: 1
        });

    const suelo =
        new THREE.Mesh(
            geo,
            mat
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.receiveShadow = true;

    escena.add(suelo);
}

function crearBosque() {

    const pasto =
        new THREE.MeshStandardMaterial({
            color: 0x6f9b5f
        });

    for (
        let i = 0;
        i < 250;
        i++
    ) {

        const alto =
            0.08 +
            Math.random() * 0.22;

        const geo =
            new THREE.ConeGeometry(
                0.025,
                alto,
                4
            );

        const mesh =
            new THREE.Mesh(
                geo,
                pasto
            );

        mesh.position.set(
            (Math.random() - 0.5) * 55,
            alto / 2,
            -Math.random() * 25
        );

        escena.add(mesh);
    }

    const tronco =
        new THREE.MeshStandardMaterial({
            color: 0x68452d
        });

    const hojas =
        new THREE.MeshStandardMaterial({
            color: 0x397046
        });

    for (
        let i = 0;
        i < 38;
        i++
    ) {

        const x =
            (Math.random() - 0.5) * 55;

        const z =
            -2 -
            Math.random() * 30;

        const t =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.18,
                    0.25,
                    2.8,
                    7
                ),
                tronco
            );

        t.position.set(
            x,
            1.4,
            z
        );

        escena.add(t);

        const copa =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.15,
                    8,
                    6
                ),
                hojas
            );

        copa.position.set(
            x,
            3.2,
            z
        );

        escena.add(copa);
    }
}

function ajustarPantalla() {

    if (!renderer || !camara)
        return;

    camara.aspect =
        innerWidth / innerHeight;

    camara.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );
            }
function limpiarNombreHueso(nombre) {

    return String(nombre)
        .toLowerCase()
        .replace(/[\s_\-\.]/g, "");
}

function buscarHueso(
    huesos,
    nombres
) {

    for (const hueso of huesos) {

        const nombre =
            limpiarNombreHueso(
                hueso.name
            );

        for (const buscado of nombres) {

            if (
                nombre ===
                limpiarNombreHueso(buscado)
            ) {
                return hueso;
            }
        }
    }

    return null;
}

function guardarPoseInicial(huesos) {

    for (const hueso of huesos) {

        hueso.userData
            .eggaroRestQuaternion =
            hueso.quaternion.clone();
    }
}

function rotacionRelativa(
    hueso,
    eje,
    angulo
) {

    if (!hueso)
        return;

    const rest =
        hueso.userData
            .eggaroRestQuaternion;

    if (!rest)
        return;

    hueso.quaternion.copy(rest);

    const q =
        new THREE.Quaternion()
            .setFromAxisAngle(
                eje,
                angulo
            );

    hueso.quaternion.multiply(q);
}

function restaurarPose(actor) {

    if (!actor?.huesos)
        return;

    for (
        const hueso of actor.huesos
    ) {

        const rest =
            hueso.userData
                .eggaroRestQuaternion;

        if (rest)
            hueso.quaternion.copy(rest);
    }
}

function detectarRig(modelo) {

    const huesos = [];

    modelo.traverse(obj => {

        if (
            obj.isBone
        ) {
            huesos.push(obj);
        }
    });

    guardarPoseInicial(huesos);

    const rig = {

        pelvis: buscarHueso(
            huesos,
            [
                "pelvis",
                "hips",
                "hip",
                "cadera",
                "root"
            ]
        ),

        columna: buscarHueso(
            huesos,
            [
                "spine",
                "spine1",
                "spine01",
                "columna",
                "torso"
            ]
        ),

        cabeza: buscarHueso(
            huesos,
            [
                "head",
                "cabeza"
            ]
        ),

        cuello: buscarHueso(
            huesos,
            [
                "neck",
                "cuello"
            ]
        ),
                piernaIzquierda:
            buscarHueso(
                huesos,
                [
                    "leftleg",
                    "legleft",
                    "leftthigh",
                    "thighleft",
                    "upperlegleft",
                    "upperlegl",
                    "thighl",
                    "legl"
                ]
            ),

        piernaDerecha:
            buscarHueso(
                huesos,
                [
                    "rightleg",
                    "legright",
                    "rightthigh",
                    "thighright",
                    "upperlegright",
                    "upperlegr",
                    "thighr",
                    "legr"
                ]
            ),

        pieIzquierdo:
            buscarHueso(
                huesos,
                [
                    "leftfoot",
                    "footleft",
                    "footl"
                ]
            ),

        pieDerecho:
            buscarHueso(
                huesos,
                [
                    "rightfoot",
                    "footright",
                    "footr"
                ]
            ),

        brazoIzquierdo:
            buscarHueso(
                huesos,
                [
                    "leftarm",
                    "armleft",
                    "upperarmleft",
                    "upperarml",
                    "arml"
                ]
            ),

        brazoDerecho:
            buscarHueso(
                huesos,
                [
                    "rightarm",
                    "armright",
                    "upperarmright",
                    "upperarmr",
                    "armr"
                ]
            ),

        antebrazoIzquierdo:
            buscarHueso(
                huesos,
                [
                    "leftforearm",
                    "forearmleft",
                    "lowerarml"
                ]
            ),

        antebrazoDerecho:
            buscarHueso(
                huesos,
                [
                    "rightforearm",
                    "forearmright",
                    "lowerarmr"
                ]
            )
    };

    return {
        huesos,
        rig
    };
}

function crearActor(
    gltf,
    nombre
) {

    const modelo =
        gltf.scene;

    const datos =
        detectarRig(modelo);

    const root =
        new THREE.Group();

    root.name =
        nombre + "_Root";

    root.add(modelo);

    escena.add(root);

    let caja =
        new THREE.Box3()
            .setFromObject(modelo);

    const baseY =
        -caja.min.y;

    modelo.position.y =
        baseY;

    modelo.traverse(obj => {

        if (obj.isMesh) {

            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    return {

        nombre,
        root,
        modelo,

        huesos: datos.huesos,
        rig: datos.rig,

        baseModelY: baseY,

        tiempo: 0,
        caminando: false
    };
                    }
function cargarPersonajes() {

    return Promise.all([

        new Promise(resolve => {

            loader.load(
                "./3D/mike.glb",

                gltf => {

                    actorMike =
                        crearActor(
                            gltf,
                            "Mike"
                        );

                    actorMike.root
                        .position.set(
                            POSICION_INICIAL_MIKE.x,
                            0,
                            POSICION_INICIAL_MIKE.z
                        );

                    actorMike.root.rotation.y =
                        Math.PI;

                    resolve();
                },

                undefined,

                () => {

                    actorMike =
                        crearActorFallback(
                            "Mike"
                        );

                    actorMike.root
                        .position.set(
                            POSICION_INICIAL_MIKE.x,
                            0,
                            POSICION_INICIAL_MIKE.z
                        );

                    resolve();
                }
            );
        }),

        new Promise(resolve => {

            loader.load(
                "./3D/micaela.glb",

                gltf => {

                    actorMicaela =
                        crearActor(
                            gltf,
                            "Micaela"
                        );

                    actorMicaela.root
                        .position.set(
                            POSICION_INICIAL_MICAELA.x,
                            0,
                            POSICION_INICIAL_MICAELA.z
                        );

                    actorMicaela.root.rotation.y =
                        Math.PI;

                    resolve();
                },

                undefined,

                () => {

                    actorMicaela =
                        crearActorFallback(
                            "Micaela"
                        );

                    actorMicaela.root
                        .position.set(
                            POSICION_INICIAL_MICAELA.x,
                            0,
                            POSICION_INICIAL_MICAELA.z
                        );

                    resolve();
                }
            );
        })

    ]);
}

function crearActorFallback(nombre) {

    const root =
        new THREE.Group();

    const mat =
        new THREE.MeshStandardMaterial({
            color:
                nombre === "Mike"
                    ? 0x5e8c6a
                    : 0xc78da5
        });

    const cuerpo =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.42,
                0.9,
                5,
                8
            ),
            mat
        );

    cuerpo.position.y = 0.85;
    cuerpo.castShadow = true;

    root.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.42,
                12,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf5d5b8
            })
        );

    cabeza.position.y = 1.65;
    cabeza.castShadow = true;

    root.add(cabeza);

    escena.add(root);

    return {

        nombre,
        root,
        modelo: root,

        huesos: [],
        rig: {},

        baseModelY: 0,

        tiempo: 0,
        caminando: false
    };
                            }
function prepararPersonajes() {

    const actores = [
        actorMike,
        actorMicaela
    ];

    for (const actor of actores) {

        if (!actor)
            continue;

        actor.caminando = false;
        actor.tiempo = 0;

        actor.root.position.y = 0;

        actor.modelo.position.y =
            actor.baseModelY;

        actor.root.rotation.y =
            Math.PI;

        restaurarPose(actor);
    }
}

function iniciarCaminata(actor) {

    if (!actor)
        return;

    actor.caminando = true;
    actor.tiempo = 0;
}

function detenerCaminata(actor) {

    if (!actor)
        return;

    actor.caminando = false;

    actor.modelo.position.y =
        actor.baseModelY;

    restaurarPose(actor);
}

function actualizarCaminata(
    actor,
    delta
) {

    if (!actor?.caminando)
        return;

    actor.tiempo += delta;

    const t =
        actor.tiempo * 7;

    const paso =
        Math.sin(t);

    const pasoContrario =
        Math.sin(t + Math.PI);

    const rig =
        actor.rig;

    const ejeX =
        new THREE.Vector3(
            1,
            0,
            0
        );

    const ejeZ =
        new THREE.Vector3(
            0,
            0,
            1
        );

    rotacionRelativa(
        rig.piernaIzquierda,
        ejeX,
        paso * 0.48
    );

    rotacionRelativa(
        rig.piernaDerecha,
        ejeX,
        pasoContrario * 0.48
    );

    rotacionRelativa(
        rig.pieIzquierdo,
        ejeX,
        pasoContrario * 0.15
    );

    rotacionRelativa(
        rig.pieDerecho,
        ejeX,
        paso * 0.15
    );

    rotacionRelativa(
        rig.brazoIzquierdo,
        ejeX,
        pasoContrario * 0.28
    );

    rotacionRelativa(
        rig.brazoDerecho,
        ejeX,
        paso * 0.28
    );

    rotacionRelativa(
        rig.antebrazoIzquierdo,
        ejeX,
        paso * 0.08
    );

    rotacionRelativa(
        rig.antebrazoDerecho,
        ejeX,
        pasoContrario * 0.08
    );

    rotacionRelativa(
        rig.pelvis,
        ejeZ,
        Math.sin(t * 0.5) * 0.025
    );

    rotacionRelativa(
        rig.columna,
        ejeX,
        Math.sin(t * 0.5) * 0.018
    );

    rotacionRelativa(
        rig.cabeza,
        ejeZ,
        Math.sin(t * 0.35) * 0.015
    );

    actor.modelo.position.y =
        actor.baseModelY +
        Math.abs(Math.sin(t)) * 0.015;
}
function crearPolloEncuentro() {

    const grupo =
        new THREE.Group();

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                12,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf1e4c3
            })
        );

    cuerpo.scale.set(
        1.15,
        0.85,
        1
    );

    cuerpo.castShadow = true;

    grupo.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.28,
                10,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf5ead1
            })
        );

    cabeza.position.set(
        0,
        0.42,
        -0.28
    );

    grupo.add(cabeza);

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.08,
                0.2,
                5
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe0a33d
            })
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        0.4,
        -0.56
    );

    grupo.add(pico);

    grupo.position.set(
        0,
        0.5,
        -0.6
    );

    escena.add(grupo);

    return grupo;
}

function crearHuevoCinematico() {

    const grupo =
        new THREE.Group();

    const geometria =
        new THREE.SphereGeometry(
            0.52,
            24,
            16
        );

    const posiciones =
        geometria.attributes.position;

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {

        const y =
            posiciones.getY(i);

        const factor =
            1 +
            y * 0.22;

        posiciones.setX(
            i,
            posiciones.getX(i) * factor
        );

        posiciones.setZ(
            i,
            posiciones.getZ(i) * factor
        );
    }

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xf4e4b2,
            roughness: 0.65
        });

    const huevo =
        new THREE.Mesh(
            geometria,
            material
        );

    huevo.scale.set(
        0.85,
        1.25,
        0.85
    );

    huevo.castShadow = true;

    grupo.add(huevo);

    const aro =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.43,
                0.018,
                6,
                24
            ),
            new THREE.MeshBasicMaterial({
                color: 0xd5a84b
            })
        );

    aro.rotation.x =
        Math.PI / 2;

    aro.position.y =
        -0.05;

    grupo.add(aro);

    grupo.position.set(
        0,
        0.65,
        -1.4
    );

    grupo.visible = false;

    escena.add(grupo);

    return grupo;
}

function mirarActorHacia(
    actor,
    objetivo
) {

    if (!actor)
        return;

    actor.root.lookAt(
        objetivo.x,
        actor.root.position.y,
        objetivo.z
    );
}

function faseDialogo() {

    mostrarDialogo(
        "Mike",
        "¿Viste eso?"
    );

    setTimeout(() => {

        mostrarDialogo(
            "Micaela",
            "¡Sí! ¡Es un huevo!"
        );

    }, 1800);
}

function mostrarDialogo(
    personaje,
    texto
) {

    crearInterfazCompleta();

    const caja =
        document.getElementById(
            "eggaro-dialogo"
        );

    if (!caja)
        return;

    caja.innerHTML =
        `<b>${personaje}</b><br>${texto}`;

    caja.style.display =
        "block";
}
function crearInterfazCompleta() {

    let ui =
        document.getElementById(
            "eggaro-ui"
        );

    if (ui)
        return;

    ui =
        document.createElement("div");

    ui.id =
        "eggaro-ui";

    ui.innerHTML = `
        <div id="eggaro-dialogo"></div>
        <div id="eggaro-subtitulo"></div>
    `;

    Object.assign(
        ui.style,
        {
            position: "fixed",
            inset: "0",
            pointerEvents: "none",
            zIndex: "9999"
        }
    );

    document.body.appendChild(ui);

    const dialogo =
        document.getElementById(
            "eggaro-dialogo"
        );

    Object.assign(
        dialogo.style,
        {
            position: "absolute",
            left: "8%",
            right: "8%",
            bottom: "8%",
            padding: "18px",
            borderRadius: "18px",
            background:
                "rgba(0,0,0,.72)",
            color: "white",
            fontSize: "20px",
            textAlign: "center",
            display: "none"
        }
    );
}

function mostrarSubtitulo(texto) {

    crearInterfazCompleta();

    const el =
        document.getElementById(
            "eggaro-subtitulo"
        );

    if (!el)
        return;

    el.textContent =
        texto;

    Object.assign(
        el.style,
        {
            position: "absolute",
            left: "5%",
            right: "5%",
            bottom: "3%",
            color: "white",
            textAlign: "center",
            fontSize: "18px",
            textShadow:
                "0 2px 5px black"
        }
    );
}

function normalizarResultado(tipo) {

    const t =
        String(tipo || "noob")
            .toLowerCase()
            .trim();

    if (
        t === "pollitonoob" ||
        t === "pollito_noob" ||
        t === "pollito noob"
    ) {
        return "pollitonoob";
    }

    if (
        t === "zombie"
    ) {
        return "zombie";
    }

    return "noob";
}

function ejecutarResultado() {

    if (!huevoCinematico)
        return;

    huevoCinematico.visible =
        false;

    if (
        window.EGGARO_CREADOR_POLLO
    ) {

        try {

            polloResultado =
                window
                    .EGGARO_CREADOR_POLLO(
                        resultadoCinematica
                    );

            if (polloResultado) {

                escena.add(
                    polloResultado
                );

                polloResultado.position.set(
                    0,
                    0.5,
                    -1.4
                );
            }

            return;

        } catch (e) {

            console.warn(
                "Creador externo de pollo falló",
                e
            );
        }
    }

    polloResultado =
        crearPolloEncuentro();

    polloResultado.position.set(
        0,
        0.5,
        -1.4
    );
}

function actualizarCinematica(delta) {

    tiempoFase += delta;

    if (
        actorMike &&
        actorMicaela
    ) {

        actualizarCaminata(
            actorMike,
            delta
        );

        actualizarCaminata(
            actorMicaela,
            delta
        );
    }

    if (faseCinematica === 0) {

        if (
            actorMike &&
            actorMicaela &&
            tiempoFase > 1
        ) {

            iniciarCaminata(
                actorMike
            );

            iniciarCaminata(
                actorMicaela
            );

            faseCinematica = 1;
            tiempoFase = 0;
        }
    }

    else if (
        faseCinematica === 1
    ) {

        if (actorMike?.caminando) {

            actorMike.root.position.z -=
                delta * 1.25;

            if (
                actorMike.root.position.z <=
                POSICION_FINAL_MIKE.z
            ) {

                actorMike.root.position.z =
                    POSICION_FINAL_MIKE.z;

                detenerCaminata(
                    actorMike
                );
            }
        }

        if (actorMicaela?.caminando) {

            actorMicaela.root.position.z -=
                delta * 1.25;

            if (
                actorMicaela.root.position.z <=
                POSICION_FINAL_MICAELA.z
            ) {

                actorMicaela.root.position.z =
                    POSICION_FINAL_MICAELA.z;

                detenerCaminata(
                    actorMicaela
                );
            }
        }

        if (
            !actorMike?.caminando &&
            !actorMicaela?.caminando
        ) {

            faseCinematica = 2;
            tiempoFase = 0;

            faseDialogo();
        }
    }

    else if (
        faseCinematica === 2
    ) {

        if (
            tiempoFase > 3
        ) {

            polloEncuentro =
                crearPolloEncuentro();

            faseCinematica = 3;
            tiempoFase = 0;

            mostrarSubtitulo(
                "Algo aparece entre los árboles..."
            );
        }
    }

    else if (
        faseCinematica === 3
    ) {

        if (
            tiempoFase > 3
        ) {

            if (
                huevoCinematico
            ) {

                huevoCinematico.visible =
                    true;
            }

            faseCinematica = 4;
            tiempoFase = 0;

            mostrarSubtitulo(
                "¡Un huevo misterioso!"
            );
        }
    }

    else if (
        faseCinematica === 4
    ) {

        if (
            tiempoFase > 3
        ) {

            ejecutarResultado();

            faseCinematica = 5;
            tiempoFase = 0;

            mostrarSubtitulo(
                "¡El huevo comenzó a abrirse!"
            );
        }
    }

    actualizarCamara();
}

function actualizarCamara() {

    if (!camara)
        return;

    if (
        faseCinematica <= 1
    ) {

        camara.position.x =
            Math.sin(
                tiempoFase * 0.35
            ) * 0.8;

        camara.position.y =
            3.5;

        camara.position.z =
            9.5;

        camara.lookAt(
            0,
            1.2,
            1
        );
    }

    else {

        camara.position.x =
            Math.sin(
                tiempoFase * 0.4
            ) * 1.2;

        camara.position.y =
            3.2;

        camara.position.z =
            7;

        camara.lookAt(
            0,
            0.9,
            -0.8
        );
    }
}

function animar() {

    if (!animando)
        return;

    requestAnimationFrame(
        animar
    );

    const delta =
        Math.min(
            reloj.getDelta(),
            0.05
        );

    actualizarCinematica(
        delta
    );

    renderer.render(
        escena,
        camara
    );
}

export async function iniciarCinematica() {

    detenerCinematica();

    faseCinematica = 0;
    tiempoFase = 0;
    resultadoCinematica = "noob";

    crearEscena();

    crearInterfazCompleta();

    huevoCinematico =
        crearHuevoCinematico();

    await cargarPersonajes();

    prepararPersonajes();

    if (!polloEncuentro) {
        polloEncuentro = null;
    }

    animando = true;

    reloj.start();

    animar();
}

export function establecerResultadoCinematica(
    tipo
) {

    resultadoCinematica =
        normalizarResultado(
            tipo
        );
}

export function detenerCinematica() {

    animando = false;

    if (
        resizeActivo
    ) {

        window.removeEventListener(
            "resize",
            ajustarPantalla
        );

        resizeActivo = false;
    }

    if (
        renderer
    ) {

        renderer.dispose();

        if (
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement.parentNode
                .removeChild(
                    renderer.domElement
                );
        }
    }

    renderer = null;
    escena = null;
    camara = null;

    actorMike = null;
    actorMicaela = null;
    polloEncuentro = null;
    huevoCinematico = null;
    polloResultado = null;

    const ui =
        document.getElementById(
            "eggaro-ui"
        );

    if (ui)
        ui.remove();
}

export default {
    iniciarCinematica,
    detenerCinematica,
    establecerResultadoCinematica
};
