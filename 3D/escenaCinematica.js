// ============================================================
// EGGARO / GAMERPRO
// escenaCinematica.js
// CINEMATICA 3D - PARTE 1/10
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
let escena = null;
let camara = null;
let renderer = null;
let reloj = null;

let grupoCinematica = null;
let grupoBosque = null;
let grupoPersonajes = null;
let grupoHuevo = null;
let grupoResultado = null;

let mike = null;
let micaela = null;

let activa = false;
let finalizada = false;

let resultadoCinematica = "noob";
let tiempo = 0;
let fase = 0;

let dialogo = null;
let dialogoTexto = null;

const loader = new GLTFLoader();

const CONFIG = {
    velocidad: 1.35,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    cielo: 0x9fc5d8,
    suelo: 0x526b45
};

function crearEscena() {
    escena = new THREE.Scene();

    escena.background =
        new THREE.Color(CONFIG.cielo);

    escena.fog = new THREE.FogExp2(
        CONFIG.cielo,
        0.018
    );

    grupoCinematica = new THREE.Group();
    grupoBosque = new THREE.Group();
    grupoPersonajes = new THREE.Group();
    grupoHuevo = new THREE.Group();
    grupoResultado = new THREE.Group();

    grupoCinematica.add(grupoBosque);
    grupoCinematica.add(grupoPersonajes);
    grupoCinematica.add(grupoHuevo);
    grupoCinematica.add(grupoResultado);

    escena.add(grupoCinematica);
}

function crearCamara() {
    camara = new THREE.PerspectiveCamera(
        48,
        window.innerWidth / window.innerHeight,
        0.1,
        300
    );

    camara.position.set(0, 4.5, 15);

    camara.lookAt(
        0,
        2,
        0
    );
}

function crearRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(CONFIG.pixelRatio);

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

    renderer.toneMappingExposure = 1.05;

    const canvas = renderer.domElement;

    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "20";

    document.body.appendChild(canvas);
}

function actualizarTamaño() {
    if (!renderer || !camara) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    camara.aspect = w / h;
    camara.updateProjectionMatrix();

    renderer.setSize(w, h, false);
}

function crearIluminacion() {
    const ambiente =
        new THREE.HemisphereLight(
            0xbfdcff,
            0x35452c,
            2.2
        );

    escena.add(ambiente);

    const sol =
        new THREE.DirectionalLight(
            0xffe4b5,
            3.0
        );

    sol.position.set(
        -20,
        35,
        15
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 1024;
    sol.shadow.mapSize.height = 1024;

    escena.add(sol);
}

function renderizar() {
    if (
        !activa ||
        !renderer ||
        !escena ||
        !camara
    ) {
        return;
    }

    requestAnimationFrame(renderizar);

    const delta = reloj
        ? Math.min(reloj.getDelta(), 0.033)
        : 0.016;

    actualizarCinematica(delta);
    actualizarTamaño();

    renderer.render(
        escena,
        camara
    );
}
// ============================================================
// PARTE 2/10 - BOSQUE 3D
// ============================================================

function crearSuelo() {
    const geometria =
        new THREE.PlaneGeometry(
            90,
            90,
            24,
            24
        );

    geometria.rotateX(-Math.PI / 2);

    const posiciones =
        geometria.attributes.position;

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {
        const x = posiciones.getX(i);
        const z = posiciones.getZ(i);

        const y =
            Math.sin(x * 0.12) * 0.12 +
            Math.cos(z * 0.15) * 0.10;

        posiciones.setY(i, y);
    }

    posiciones.needsUpdate = true;
    geometria.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: CONFIG.suelo,
            roughness: 1
        });

    const suelo =
        new THREE.Mesh(
            geometria,
            material
        );

    suelo.receiveShadow = true;
    suelo.position.y = -0.04;

    grupoBosque.add(suelo);
}

function crearPino(escala = 1) {
    const pino = new THREE.Group();

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.22 * escala,
                0.38 * escala,
                3.8 * escala,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x62432d,
                roughness: 1
            })
        );

    tronco.position.y =
        1.9 * escala;

    tronco.castShadow = true;

    pino.add(tronco);

    const copas = [
        [2.5, 3.2, 3.4, 0x315d38],
        [2.05, 3.0, 5.0, 0x3d7043],
        [1.55, 2.7, 6.35, 0x4b8050]
    ];

    for (const dato of copas) {
        const copa =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    dato[0] * escala,
                    dato[1] * escala,
                    9
                ),
                new THREE.MeshStandardMaterial({
                    color: dato[3],
                    roughness: 0.95
                })
            );

        copa.position.y =
            dato[2] * escala;

        copa.castShadow = true;
        copa.receiveShadow = true;

        pino.add(copa);
    }

    pino.rotation.y =
        Math.random() * Math.PI * 2;

    return pino;
}

function crearPasto() {
    const grupo = new THREE.Group();

    for (let i = 0; i < 4; i++) {
        const hierba =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.035,
                    0.3 + Math.random() * 0.15,
                    4
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x668d4c,
                    roughness: 1
                })
            );

        hierba.position.set(
            (Math.random() - 0.5) * 0.45,
            0.15,
            (Math.random() - 0.5) * 0.45
        );

        hierba.rotation.z =
            (Math.random() - 0.5) * 0.5;

        grupo.add(hierba);
    }

    return grupo;
}

function crearPiedra() {
    const piedra =
        new THREE.Mesh(
            new THREE.DodecahedronGeometry(
                0.25 + Math.random() * 0.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x77756d,
                roughness: 1
            })
        );

    piedra.scale.y = 0.55;

    piedra.position.y = 0.15;

    piedra.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );

    piedra.castShadow = true;

    return piedra;
}

function crearBosque() {
    crearSuelo();

    for (let i = 0; i < 18; i++) {
        const pino =
            crearPino(
                0.75 + Math.random() * 0.55
            );

        let x;
        let z;

        do {
            x =
                (Math.random() - 0.5) * 70;
            z =
                (Math.random() - 0.5) * 70;
        } while (
            Math.abs(x) < 10 &&
            Math.abs(z) < 15
        );

        pino.position.set(
            x,
            0,
            z
        );

        grupoBosque.add(pino);
    }

    for (let i = 0; i < 70; i++) {
        const pasto = crearPasto();

        pasto.position.set(
            (Math.random() - 0.5) * 65,
            0,
            (Math.random() - 0.5) * 65
        );

        grupoBosque.add(pasto);
    }

    for (let i = 0; i < 22; i++) {
        const piedra = crearPiedra();

        piedra.position.set(
            (Math.random() - 0.5) * 60,
            0,
            (Math.random() - 0.5) * 60
        );

        grupoBosque.add(piedra);
    }
}
// ============================================================
// PARTE 3/10 - CARGA DE MIKE Y MICAELA
// ============================================================

function limpiarNombre(nombre) {
    return String(nombre)
        .toLowerCase()
        .replace(/[\s_\-\.]/g, "");
}

function prepararHuesos(personaje) {
    personaje.traverse(obj => {
        if (!obj.isBone) return;

        obj.userData.eggaroRest =
            obj.quaternion.clone();

        obj.userData.eggaroNombre =
            limpiarNombre(obj.name);
    });
}

function buscarHueso(personaje, nombres) {
    const buscados =
        nombres.map(limpiarNombre);

    let encontrado = null;

    personaje.traverse(obj => {
        if (encontrado || !obj.isBone) {
            return;
        }

        const nombre =
            limpiarNombre(obj.name);

        if (buscados.includes(nombre)) {
            encontrado = obj;
        }
    });

    return encontrado;
}

function obtenerRig(personaje) {
    return {
        pelvis: buscarHueso(personaje, [
            "hips",
            "pelvis",
            "hip",
            "root"
        ]),

        spine: buscarHueso(personaje, [
            "spine",
            "spine1",
            "chest",
            "torso"
        ]),

        cabeza: buscarHueso(personaje, [
            "head",
            "cabeza"
        ]),

        brazoI: buscarHueso(personaje, [
            "leftarm",
            "armleft",
            "upperarml",
            "brazoizquierdo"
        ]),

        brazoD: buscarHueso(personaje, [
            "rightarm",
            "armright",
            "upperarmr",
            "brazoderecho"
        ]),

        antebrazoI: buscarHueso(personaje, [
            "leftforearm",
            "forearml",
            "antebrazoizquierdo"
        ]),

        antebrazoD: buscarHueso(personaje, [
            "rightforearm",
            "forearmr",
            "antebrazoderecho"
        ]),

        piernaI: buscarHueso(personaje, [
            "leftupleg",
            "leftthigh",
            "thighl",
            "legleft",
            "piernaizquierda"
        ]),

        piernaD: buscarHueso(personaje, [
            "rightupleg",
            "rightthigh",
            "thighr",
            "legright",
            "piernaderecha"
        ]),

        pantorrillaI: buscarHueso(personaje, [
            "leftleg",
            "leftcalf",
            "calfl",
            "pantorrillaizquierda"
        ]),

        pantorrillaD: buscarHueso(personaje, [
            "rightleg",
            "rightcalf",
            "calfr",
            "pantorrilladerecha"
        ]),

        pieI: buscarHueso(personaje, [
            "leftfoot",
            "footl",
            "pieizquierdo"
        ]),

        pieD: buscarHueso(personaje, [
            "rightfoot",
            "footr",
            "piederecho"
        ])
    };
}

function prepararPersonaje(objeto) {
    prepararHuesos(objeto);

    objeto.userData.eggaroRig =
        obtenerRig(objeto);

    objeto.userData.baseY =
        objeto.position.y;

    objeto.userData.caminando = false;
    objeto.userData.destinoZ = 0;

    objeto.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
}

function cargarPersonaje(ruta) {
    return new Promise((resolve, reject) => {
        loader.load(
            ruta,
            gltf => {
                const objeto =
                    gltf.scene;

                prepararPersonaje(objeto);

                resolve(objeto);
            },
            undefined,
            reject
        );
    });
}

async function cargarPersonajes() {
    mike =
        await cargarPersonaje(
            "./3D/mike.glb"
        );

    micaela =
        await cargarPersonaje(
            "./3D/micaela.glb"
        );

    mike.position.set(
        -1.1,
        0,
        8
    );

    micaela.position.set(
        1.1,
        0,
        8.8
    );

    mike.rotation.y = Math.PI;
    micaela.rotation.y = Math.PI;

    grupoPersonajes.add(mike);
    grupoPersonajes.add(micaela);
    }
// ============================================================
// PARTE 4/10 - ANIMACION PROCEDURAL DE CAMINATA
// ============================================================

const EJE_X =
    new THREE.Vector3(1, 0, 0);

const EJE_Z =
    new THREE.Vector3(0, 0, 1);

function rotacionRelativa(
    hueso,
    eje,
    angulo
) {
    if (!hueso) return;

    const rest =
        hueso.userData.eggaroRest;

    if (!rest) return;

    hueso.quaternion.copy(rest);

    const q =
        new THREE.Quaternion()
            .setFromAxisAngle(
                eje,
                angulo
            );

    hueso.quaternion.multiply(q);
}

function iniciarCaminata(personaje, destino) {
    if (!personaje) return;

    personaje.userData.caminando = true;
    personaje.userData.destinoZ = destino;
}

function detenerCaminata(personaje) {
    if (!personaje) return;

    personaje.userData.caminando = false;
}

function aplicarPoseReposo(personaje) {
    if (!personaje) return;

    personaje.traverse(obj => {
        if (!obj.isBone) return;

        const rest =
            obj.userData.eggaroRest;

        if (rest) {
            obj.quaternion.copy(rest);
        }
    });
}

function actualizarCaminata(
    personaje,
    delta,
    tiempoAnim
) {
    if (!personaje) return;

    const rig =
        personaje.userData.eggaroRig;

    const caminando =
        personaje.userData.caminando;

    if (!rig) return;

    if (caminando) {
        const destino =
            personaje.userData.destinoZ;

        const z =
            personaje.position.z;

        const direccion =
            Math.sign(destino - z);

        const paso =
            CONFIG.velocidad *
            delta;

        if (
            Math.abs(destino - z) <= paso
        ) {
            personaje.position.z =
                destino;

            detenerCaminata(personaje);
        } else {
            personaje.position.z +=
                direccion * paso;
        }

        const ciclo =
            Math.sin(
                tiempoAnim * 8
            );

        const ciclo2 =
            Math.sin(
                tiempoAnim * 8 +
                Math.PI
            );

        rotacionRelativa(
            rig.piernaI,
            EJE_X,
            ciclo * 0.48
        );

        rotacionRelativa(
            rig.piernaD,
            EJE_X,
            ciclo2 * 0.48
        );

        rotacionRelativa(
            rig.pantorrillaI,
            EJE_X,
            Math.max(0, -ciclo) * 0.3
        );

        rotacionRelativa(
            rig.pantorrillaD,
            EJE_X,
            Math.max(0, -ciclo2) * 0.3
        );

        rotacionRelativa(
            rig.brazoI,
            EJE_X,
            ciclo2 * 0.30
        );

        rotacionRelativa(
            rig.brazoD,
            EJE_X,
            ciclo * 0.30
        );

        rotacionRelativa(
            rig.antebrazoI,
            EJE_X,
            0.12
        );

        rotacionRelativa(
            rig.antebrazoD,
            EJE_X,
            0.12
        );

        if (rig.pelvis) {
            personaje.position.y =
                personaje.userData.baseY +
                Math.abs(
                    Math.sin(
                        tiempoAnim * 8
                    )
                ) * 0.025;
        }
    } else {
        aplicarPoseReposo(personaje);

        personaje.position.y =
            personaje.userData.baseY;
    }
}

function actualizarPersonajes(delta) {
    actualizarCaminata(
        mike,
        delta,
        tiempo
    );

    actualizarCaminata(
        micaela,
        delta,
        tiempo
    );
}
// ============================================================
// PARTE 5/10 - HUEVO
// ============================================================

let huevo = null;
let huevoSuperior = null;
let huevoInferior = null;
let energiaHuevo = null;
let particulasHuevo = null;
let flashHuevo = null;

let huevoAbierto = false;
let tiempoHuevo = 0;

function crearMaterialHuevo(color) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.48,
        metalness: 0.02
    });
}

function crearHuevo() {
    huevo = new THREE.Group();

    huevoSuperior =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.95,
                32,
                24
            ),
            crearMaterialHuevo(
                0xf1e2b6
            )
        );

    huevoInferior =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.95,
                32,
                24
            ),
            crearMaterialHuevo(
                0xf1e2b6
            )
        );

    huevoSuperior.scale.set(
        0.78,
        1.05,
        0.78
    );

    huevoInferior.scale.set(
        0.78,
        0.70,
        0.78
    );

    huevoSuperior.position.y =
        0.42;

    huevoInferior.position.y =
        -0.28;

    huevo.add(huevoSuperior);
    huevo.add(huevoInferior);

    huevo.position.set(
        0,
        1.15,
        -0.4
    );

    huevo.scale.setScalar(0.85);

    grupoHuevo.add(huevo);
}

function crearParticulasHuevo() {
    const geometria =
        new THREE.BufferGeometry();

    const cantidad = 90;
    const posiciones = [];

    for (let i = 0; i < cantidad; i++) {
        posiciones.push(
            (Math.random() - 0.5) * 3,
            Math.random() * 3,
            (Math.random() - 0.5) * 3
        );
    }

    geometria.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            posiciones,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0xfff0a0,
            size: 0.055,
            transparent: true,
            opacity: 0
        });

    particulasHuevo =
        new THREE.Points(
            geometria,
            material
        );

    particulasHuevo.position.set(
        0,
        1.1,
        -0.4
    );

    grupoHuevo.add(
        particulasHuevo
    );
}

function crearEnergiaHuevo() {
    energiaHuevo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.1,
                24,
                16
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffef9a,
                transparent: true,
                opacity: 0
            })
        );

    energiaHuevo.position.set(
        0,
        1.1,
        -0.4
    );

    energiaHuevo.scale.setScalar(0.2);

    grupoHuevo.add(
        energiaHuevo
    );
}

function crearFlashHuevo() {
    flashHuevo =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                30,
                30
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,
                depthWrite: false
            })
        );

    flashHuevo.position.set(
        0,
        4,
        0
    );

    flashHuevo.rotation.x =
        -Math.PI / 2;

    grupoHuevo.add(flashHuevo);
}

function prepararHuevo() {
    crearHuevo();
    crearParticulasHuevo();
    crearEnergiaHuevo();
    crearFlashHuevo();
}

function activarHuevo() {
    tiempoHuevo = 0;

    huevoAbierto = false;

    if (huevo) {
        huevo.visible = true;
        huevo.scale.setScalar(0.85);
    }

    if (energiaHuevo) {
        energiaHuevo.material.opacity = 0;
        energiaHuevo.scale.setScalar(0.2);
    }

    if (particulasHuevo) {
        particulasHuevo.material.opacity = 0;
    }
}

function abrirHuevo() {
    if (huevoAbierto) return;

    huevoAbierto = true;
    tiempoHuevo = 0;
}

function actualizarHuevo(delta) {
    if (!huevo) return;

    tiempoHuevo += delta;

    if (!huevoAbierto) {
        huevo.rotation.y +=
            delta * 0.25;

        const pulso =
            0.85 +
            Math.sin(
                tiempoHuevo * 5
            ) * 0.025;

        huevo.scale.setScalar(pulso);

        return;
    }

    const t =
        Math.min(
            tiempoHuevo / 1.6,
            1
        );

    huevoSuperior.position.y =
        0.42 + t * 1.35;

    huevoSuperior.rotation.z =
        t * 0.18;

    huevoInferior.position.y =
        -0.28 - t * 0.15;

    if (energiaHuevo) {
        energiaHuevo.material.opacity =
            Math.max(
                0,
                0.6 - t * 0.6
            );

        energiaHuevo.scale.setScalar(
            0.2 + t * 1.7
        );
    }

    if (particulasHuevo) {
        particulasHuevo.material.opacity =
            Math.min(t * 1.5, 1);
    }
        }
// ============================================================
// PARTE 6/10 - EFECTOS DEL HUEVO
// ============================================================

function actualizarEfectosHuevo(delta) {
    if (particulasHuevo) {
        particulasHuevo.rotation.y +=
            delta * 0.25;

        if (
            particulasHuevo.material.opacity > 0
        ) {
            const posiciones =
                particulasHuevo.geometry
                    .attributes.position;

            for (
                let i = 0;
                i < posiciones.count;
                i++
            ) {
                let y =
                    posiciones.getY(i);

                y += delta * 0.35;

                if (y > 3) {
                    y = 0;
                }

                posiciones.setY(i, y);
            }

            posiciones.needsUpdate = true;
        }
    }

    if (flashHuevo) {
        if (
            huevoAbierto &&
            tiempoHuevo < 0.45
        ) {
            const intensidad =
                1 -
                tiempoHuevo / 0.45;

            flashHuevo.material.opacity =
                intensidad * 0.85;
        } else {
            flashHuevo.material.opacity =
                0;
        }
    }
}

function actualizarEnergiaHuevo() {
    if (!energiaHuevo) return;

    if (!huevoAbierto) {
        energiaHuevo.material.opacity =
            0.12 +
            Math.sin(
                tiempoHuevo * 6
            ) * 0.08;

        const escala =
            0.2 +
            Math.sin(
                tiempoHuevo * 5
            ) * 0.03;

        energiaHuevo.scale.setScalar(
            escala
        );
    }
}

// ============================================================
// POLLITO
// ============================================================

let pollito = null;

function crearPollitoProcedural() {
    const grupo =
        new THREE.Group();

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                20,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf3cf58,
                roughness: 0.9
            })
        );

    cuerpo.scale.set(
        1,
        0.85,
        1.05
    );

    grupo.add(cuerpo);

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.35,
                20,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf7d96b,
                roughness: 0.9
            })
        );

    cabeza.position.y = 0.55;

    grupo.add(cabeza);

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.12,
                0.28,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe78b32
            })
        );

    pico.rotation.z =
        -Math.PI / 2;

    pico.position.set(
        0,
        0.52,
        0.34
    );

    grupo.add(pico);

    const ojoMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x111111
        });

    for (const x of [-0.13, 0.13]) {
        const ojo =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.045,
                    10,
                    8
                ),
                ojoMaterial
            );

        ojo.position.set(
            x,
            0.66,
            0.27
        );

        grupo.add(ojo);
    }

    grupo.position.set(
        0,
        0.45,
        -0.4
    );

    grupo.scale.setScalar(0.01);

    grupo.visible = false;

    return grupo;
}

function prepararResultado() {
    pollito =
        crearPollitoProcedural();

    grupoResultado.add(
        pollito
    );
}

function mostrarResultadoCinematica() {
    if (!pollito) return;

    pollito.visible = true;
}

function actualizarPollito(delta) {
    if (!pollito || !pollito.visible) {
        return;
    }

    const crecimiento =
        Math.min(
            tiempo - 1.6,
            1
        );

    if (crecimiento >= 0) {
        const escala =
            Math.min(
                0.01 +
                crecimiento * 1.05,
                1
            );

        pollito.scale.setScalar(
            escala
        );
    }

    pollito.rotation.y +=
        delta * 0.35;

    pollito.position.y =
        0.45 +
        Math.sin(
            tiempo * 5
        ) * 0.035;
                }
// ============================================================
// PARTE 7/10 - CAMARA CINEMATICA
// ============================================================

function suavizar(actual, objetivo, velocidad) {
    return THREE.MathUtils.lerp(
        actual,
        objetivo,
        1 -
        Math.exp(
            -velocidad * 0.016
        )
    );
}

function camaraCine(
    posicion,
    objetivo
) {
    camara.position.x =
        suavizar(
            camara.position.x,
            posicion.x,
            5
        );

    camara.position.y =
        suavizar(
            camara.position.y,
            posicion.y,
            5
        );

    camara.position.z =
        suavizar(
            camara.position.z,
            posicion.z,
            5
        );

    const punto =
        new THREE.Vector3(
            objetivo.x,
            objetivo.y,
            objetivo.z
        );

    camara.lookAt(punto);
}

function actualizarCamaraCine() {
    if (!camara) return;

    if (fase === 0) {
        camaraCine(
            new THREE.Vector3(
                0,
                4.5,
                15
            ),
            new THREE.Vector3(
                0,
                2,
                4
            )
        );

        return;
    }

    if (fase === 1) {
        const centro =
            new THREE.Vector3(
                0,
                1.7,
                4
            );

        if (mike && micaela) {
            centro.x =
                (
                    mike.position.x +
                    micaela.position.x
                ) / 2;

            centro.z =
                (
                    mike.position.z +
                    micaela.position.z
                ) / 2;
        }

        camaraCine(
            new THREE.Vector3(
                6,
                3.4,
                8
            ),
            centro
        );

        return;
    }

    if (fase === 2) {
        camaraCine(
            new THREE.Vector3(
                4.5,
                3.2,
                5
            ),
            new THREE.Vector3(
                0,
                1.2,
                -0.4
            )
        );

        return;
    }

    if (fase === 3) {
        camaraCine(
            new THREE.Vector3(
                3.4,
                2.6,
                4
            ),
            new THREE.Vector3(
                0,
                1,
                -0.4
            )
        );

        return;
    }

    camaraCine(
        new THREE.Vector3(
            2.8,
            2.3,
            3.5
        ),
        new THREE.Vector3(
            0,
            1,
            -0.4
        )
    );
}

function cambiarFase(nuevaFase) {
    fase = nuevaFase;

    if (fase === 0) {
        tiempo = 0;
    }

    if (fase === 1) {
        iniciarCaminata(
            mike,
            0.2
        );

        iniciarCaminata(
            micaela,
            0.2
        );
    }

    if (fase === 2) {
        detenerCaminata(mike);
        detenerCaminata(micaela);

        activarHuevo();

        mostrarDialogo(
            "Mike",
            "Mira... ¿qué es eso?"
        );
    }

    if (fase === 3) {
        abrirHuevo();

        mostrarDialogo(
            "Micaela",
            "¡Es un huevo!"
        );
    }

    if (fase === 4) {
        mostrarResultadoCinematica();

        mostrarDialogo(
            "Mike",
            "¡Nació un pollito!"
        );
    }
}
// ============================================================
// PARTE 8/10 - DIALOGOS
// ============================================================

function crearInterfazDialogo() {
    dialogo =
        document.createElement("div");

    dialogo.style.position = "fixed";
    dialogo.style.left = "5%";
    dialogo.style.right = "5%";
    dialogo.style.bottom = "6%";

    dialogo.style.padding =
        "18px 22px";

    dialogo.style.borderRadius =
        "18px";

    dialogo.style.background =
        "rgba(0,0,0,0.72)";

    dialogo.style.border =
        "2px solid rgba(255,255,255,0.8)";

    dialogo.style.color = "white";

    dialogo.style.fontFamily =
        "Arial, sans-serif";

    dialogo.style.zIndex = "1000";

    dialogo.style.display = "none";

    dialogo.style.pointerEvents =
        "none";

    const nombre =
        document.createElement("div");

    nombre.id =
        "eggaroNombreDialogo";

    nombre.style.fontWeight =
        "bold";

    nombre.style.fontSize =
        "20px";

    nombre.style.marginBottom =
        "7px";

    dialogoTexto =
        document.createElement("div");

    dialogoTexto.style.fontSize =
        "18px";

    dialogoTexto.style.lineHeight =
        "1.35";

    dialogo.appendChild(nombre);
    dialogo.appendChild(dialogoTexto);

    document.body.appendChild(
        dialogo
    );
}

function mostrarDialogo(
    nombre,
    texto
) {
    if (!dialogo) return;

    const nombreElemento =
        dialogo.querySelector(
            "#eggaroNombreDialogo"
        );

    if (nombreElemento) {
        nombreElemento.textContent =
            nombre;
    }

    dialogoTexto.textContent =
        texto;

    dialogo.style.display =
        "block";
}

function ocultarDialogo() {
    if (!dialogo) return;

    dialogo.style.display =
        "none";
}

const dialogosCinematica = [
    {
        tiempo: 0,
        nombre: "Narrador",
        texto:
            "En lo profundo del bosque..."
    },
    {
        tiempo: 3,
        nombre: "Mike",
        texto:
            "Micaela, mira ese lugar."
    },
    {
        tiempo: 6,
        nombre: "Micaela",
        texto:
            "Vamos a acercarnos."
    },
    {
        tiempo: 10,
        nombre: "Mike",
        texto:
            "¿Qué será eso?"
    }
];

function actualizarDialogos() {
    let actual = null;

    for (
        const dialogoActual
        of dialogosCinematica
    ) {
        if (
            tiempo >=
            dialogoActual.tiempo
        ) {
            actual = dialogoActual;
        }
    }

    if (!actual) {
        ocultarDialogo();
        return;
    }

    mostrarDialogo(
        actual.nombre,
        actual.texto
    );
            }
// ============================================================
// PARTE 9/10 - SECUENCIA
// ============================================================

function actualizarSecuencia() {
    if (fase === 0) {
        if (tiempo >= 2.5) {
            cambiarFase(1);
        }

        return;
    }

    if (fase === 1) {
        const mikeListo =
            mike &&
            !mike.userData.caminando;

        const micaelaLista =
            micaela &&
            !micaela.userData.caminando;

        if (
            mikeListo &&
            micaelaLista &&
            tiempo >= 4
        ) {
            cambiarFase(2);
        }

        return;
    }

    if (fase === 2) {
        if (tiempo >= 2.8) {
            cambiarFase(3);
        }

        return;
    }

    if (fase === 3) {
        if (
            huevoAbierto &&
            tiempoHuevo >= 1.8
        ) {
            cambiarFase(4);
        }

        return;
    }

    if (fase === 4) {
        if (tiempo >= 7) {
            finalizada = true;
        }
    }
}

function actualizarCinematica(delta) {
    if (!activa) return;

    tiempo += delta;

    actualizarSecuencia();

    actualizarPersonajes(delta);

    actualizarHuevo(delta);

    actualizarEfectosHuevo(delta);

    actualizarEnergiaHuevo();

    actualizarPollito(delta);

    actualizarDialogos();

    actualizarCamaraCine();
}

export function cinematicaTerminada() {
    return finalizada;
}

export function detenerCinematica() {
    activa = false;

    ocultarDialogo();

    if (renderer) {
        renderer.setAnimationLoop(null);

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
    reloj = null;
}

export function establecerResultadoCinematica(
    resultado
) {
    const valor =
        String(
            resultado || "noob"
        ).toLowerCase();

    if (
        valor === "zombie"
    ) {
        resultadoCinematica =
            "zombie";
    } else if (
        valor === "pollitonoob" ||
        valor === "pollito_noob" ||
        valor === "pollito noob"
    ) {
        resultadoCinematica =
            "pollitonoob";
    } else {
        resultadoCinematica =
            "noob";
    }
}
// ============================================================
// PARTE 10/10 - INICIO
// ============================================================

export async function iniciarCinematica(
    contenedor
) {
    if (activa) {
        return;
    }

    finalizada = false;
    activa = true;

    tiempo = 0;
    fase = 0;
    tiempoHuevo = 0;
    huevoAbierto = false;

    crearEscena();
    crearCamara();
    crearRenderer();
    crearIluminacion();

    crearInterfazDialogo();

    crearBosque();

    prepararHuevo();

    prepararResultado();

    try {
        await cargarPersonajes();
    } catch (error) {
        console.error(
            "Error cargando Mike/Micaela:",
            error
        );

        activa = false;

        ocultarDialogo();

        if (
            renderer &&
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {
            renderer.domElement.parentNode
                .removeChild(
                    renderer.domElement
                );
        }

        renderer = null;

        throw error;
    }

    aplicarPoseReposo(mike);
    aplicarPoseReposo(micaela);

    cambiarFase(0);

    reloj =
        new THREE.Clock();

    actualizarTamaño();

    renderizar();
}

window.addEventListener(
    "resize",
    actualizarTamaño
);
    
