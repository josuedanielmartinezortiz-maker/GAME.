// ============================================================
// EGGARO / GAMERPRO
// escenaCinematica.js
// CINEMÁTICA 3D CORREGIDA
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";


// ============================================================
// ESTADO PRINCIPAL
// ============================================================

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

let tiempo = 0;
let fase = 0;

let resultadoCinematica = "noob";

let anchoAnterior = 0;
let altoAnterior = 0;


// ============================================================
// HUEVO
// ============================================================

let huevo = null;
let huevoSuperior = null;
let huevoInferior = null;
let energiaHuevo = null;
let particulasHuevo = null;
let flashHuevo = null;

let huevoAbierto = false;
let tiempoHuevo = 0;


// ============================================================
// POLLITO
// ============================================================

let pollito = null;
let pollitoCuerpo = null;
let pollitoCabeza = null;
let pollitoAlaIzq = null;
let pollitoAlaDer = null;


// ============================================================
// DIÁLOGO
// ============================================================

let dialogo = null;
let dialogoTexto = null;


// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {

    colorCielo: 0x9fc5d8,

    colorSuelo: 0x526b45,

    velocidadPersonajes: 1.35,

    alturaPersonajes: 1.15,

    sombras: true,

    pixelRatio:
        Math.min(
            window.devicePixelRatio || 1,
            1.5
        )

};


// ============================================================
// LOADER
// ============================================================

const loader =
    new GLTFLoader();


// ============================================================
// EJES PARA ANIMACIÓN
// ============================================================

const EJE_X =
    new THREE.Vector3(1, 0, 0);

const EJE_Y =
    new THREE.Vector3(0, 1, 0);

const EJE_Z =
    new THREE.Vector3(0, 0, 1);
// ============================================================
// ESCENA
// ============================================================

function crearEscena() {

    escena =
        new THREE.Scene();

    escena.background =
        new THREE.Color(
            CONFIG.colorCielo
        );

    escena.fog =
        new THREE.FogExp2(
            CONFIG.colorCielo,
            0.014
        );


    grupoCinematica =
        new THREE.Group();

    grupoBosque =
        new THREE.Group();

    grupoPersonajes =
        new THREE.Group();

    grupoHuevo =
        new THREE.Group();

    grupoResultado =
        new THREE.Group();


    grupoCinematica.add(
        grupoBosque
    );

    grupoCinematica.add(
        grupoPersonajes
    );

    grupoCinematica.add(
        grupoHuevo
    );

    grupoCinematica.add(
        grupoResultado
    );


    escena.add(
        grupoCinematica
    );
}


// ============================================================
// CÁMARA
// ============================================================

function crearCamara() {

    camara =
        new THREE.PerspectiveCamera(
            48,
            window.innerWidth /
                window.innerHeight,
            0.1,
            300
        );

    camara.position.set(
        0,
        4.8,
        15
    );

    camara.lookAt(
        0,
        1.8,
        4
    );
}


// ============================================================
// RENDERER
// ============================================================

function crearRenderer() {

    renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: false,

            powerPreference:
                "high-performance"

        });


    renderer.setPixelRatio(
        CONFIG.pixelRatio
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.shadowMap.enabled =
        CONFIG.sombras;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.05;


    const canvas =
        renderer.domElement;


    canvas.style.position =
        "fixed";

    canvas.style.left =
        "0";

    canvas.style.top =
        "0";

    canvas.style.width =
        "100%";

    canvas.style.height =
        "100%";

    canvas.style.zIndex =
        "20";


    document.body.appendChild(
        canvas
    );
}


// ============================================================
// RESIZE
// ============================================================

function actualizarTamaño() {

    if (
        !renderer ||
        !camara
    ) {
        return;
    }


    const ancho =
        window.innerWidth;

    const alto =
        window.innerHeight;


    if (
        ancho === anchoAnterior &&
        alto === altoAnterior
    ) {
        return;
    }


    anchoAnterior =
        ancho;

    altoAnterior =
        alto;


    camara.aspect =
        ancho / alto;

    camara.updateProjectionMatrix();


    renderer.setSize(
        ancho,
        alto,
        false
    );
}


// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    const ambiente =
        new THREE.HemisphereLight(
            0xd9ecff,
            0x30452b,
            2.4
        );

    escena.add(
        ambiente
    );


    const sol =
        new THREE.DirectionalLight(
            0xffe5b8,
            3.2
        );

    sol.position.set(
        -20,
        35,
        15
    );


    sol.castShadow =
        CONFIG.sombras;


    sol.shadow.mapSize.width =
        1536;

    sol.shadow.mapSize.height =
        1536;


    sol.shadow.camera.near =
        1;

    sol.shadow.camera.far =
        100;


    sol.shadow.camera.left =
        -40;

    sol.shadow.camera.right =
        40;

    sol.shadow.camera.top =
        40;

    sol.shadow.camera.bottom =
        -40;


    escena.add(
        sol
    );
}


// ============================================================
// LOOP
// ============================================================

function renderizar() {

    if (
        !activa ||
        !renderer ||
        !escena ||
        !camara
    ) {
        return;
    }


    requestAnimationFrame(
        renderizar
    );


    const delta =
        reloj
            ? Math.min(
                reloj.getDelta(),
                0.033
            )
            : 0.016;


    actualizarCinematica(
        delta
    );


    actualizarTamaño();


    renderer.render(
        escena,
        camara
    );
    }
// ============================================================
// SUELO
// ============================================================

function crearSuelo() {

    const geometria =
        new THREE.PlaneGeometry(
            100,
            100,
            32,
            32
        );


    geometria.rotateX(
        -Math.PI / 2
    );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                CONFIG.colorSuelo,

            roughness: 1,

            metalness: 0

        });


    const suelo =
        new THREE.Mesh(
            geometria,
            material
        );


    suelo.receiveShadow =
        true;


    suelo.position.y =
        -0.04;


    grupoBosque.add(
        suelo
    );
}


// ============================================================
// PINO
// ============================================================

function crearPino(
    escala = 1
) {

    const grupo =
        new THREE.Group();


    const tronco =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.20 * escala,
                0.34 * escala,
                4.2 * escala,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: 0x62432d,
                roughness: 1
            })

        );


    tronco.position.y =
        2.1 * escala;

    tronco.castShadow =
        true;

    tronco.receiveShadow =
        true;


    grupo.add(
        tronco
    );


    const copas = [
        [2.7, 3.3, 0x2d5a35],
        [2.2, 4.8, 0x376d40],
        [1.7, 6.1, 0x47804b]
    ];


    for (
        const datos of copas
    ) {

        const copa =
            new THREE.Mesh(

                new THREE.ConeGeometry(
                    datos[0] * escala,
                    3.1 * escala,
                    9
                ),

                new THREE.MeshStandardMaterial({
                    color: datos[2],
                    roughness: 0.95
                })

            );


        copa.position.y =
            datos[1] * escala;


        copa.castShadow =
            true;

        copa.receiveShadow =
            true;


        grupo.add(
            copa
        );
    }


    grupo.rotation.y =
        Math.random() *
        Math.PI *
        2;


    return grupo;
}


// ============================================================
// HIERBA
// ============================================================

function crearHierba() {

    const grupo =
        new THREE.Group();


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const hierba =
            new THREE.Mesh(

                new THREE.ConeGeometry(
                    0.035,
                    0.25 +
                    Math.random() * 0.18,
                    4
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x668d4c,
                    roughness: 1
                })

            );


        hierba.position.set(

            (Math.random() - 0.5)
                * 0.45,

            0.13,

            (Math.random() - 0.5)
                * 0.45

        );


        hierba.rotation.z =
            (Math.random() - 0.5)
            * 0.6;


        grupo.add(
            hierba
        );
    }


    return grupo;
}


// ============================================================
// PIEDRA
// ============================================================

function crearPiedra() {

    const piedra =
        new THREE.Mesh(

            new THREE.DodecahedronGeometry(
                0.25 +
                Math.random() * 0.30,
                0
            ),

            new THREE.MeshStandardMaterial({
                color: 0x77756d,
                roughness: 1
            })

        );


    piedra.scale.y =
        0.55;


    piedra.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );


    piedra.castShadow =
        true;

    piedra.receiveShadow =
        true;


    return piedra;
}


// ============================================================
// BOSQUE FRONDOSO
// ============================================================

function crearBosque() {

    crearSuelo();


    // Bosque lejano
    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const pino =
            crearPino(
                0.65 +
                Math.random() * 0.75
            );


        let x =
            (Math.random() - 0.5)
            * 90;

        let z =
            (Math.random() - 0.5)
            * 90;


        // Mantener libre el camino
        while (
            Math.abs(x) < 8 &&
            z > -4 &&
            z < 15
        ) {

            x =
                (Math.random() - 0.5)
                * 90;

            z =
                (Math.random() - 0.5)
                * 90;
        }


        pino.position.set(
            x,
            0,
            z
        );


        grupoBosque.add(
            pino
        );
    }


    // Vegetación cercana
    for (
        let i = 0;
        i < 180;
        i++
    ) {

        const hierba =
            crearHierba();


        hierba.position.set(

            (Math.random() - 0.5)
                * 75,

            0,

            (Math.random() - 0.5)
                * 75

        );


        grupoBosque.add(
            hierba
        );
    }


    // Piedras
    for (
        let i = 0;
        i < 45;
        i++
    ) {

        const piedra =
            crearPiedra();


        piedra.position.set(

            (Math.random() - 0.5)
                * 75,

            0.15,

            (Math.random() - 0.5)
                * 75

        );


        grupoBosque.add(
            piedra
        );
    }
        }
// ============================================================
// NORMALIZAR NOMBRE
// ============================================================

function limpiarNombreHueso(
    nombre
) {

    return String(nombre)
        .toLowerCase()
        .replace(
            /[\s_\-\.]/g,
            ""
        );
}


// ============================================================
// GUARDAR POSE DE DESCANSO
// ============================================================

function prepararHuesos(
    personaje
) {

    personaje.traverse(
        objeto => {

            if (!objeto.isBone) {
                return;
            }


            objeto.userData
                .restQuaternion =
                objeto.quaternion.clone();


            objeto.userData
                .restPosition =
                objeto.position.clone();


            objeto.userData
                .nombreNormalizado =
                limpiarNombreHueso(
                    objeto.name
                );
        }
    );
}


// ============================================================
// BUSCAR HUESO
// ============================================================

function buscarHueso(
    personaje,
    nombres
) {

    const buscados =
        nombres.map(
            limpiarNombreHueso
        );


    let encontrado = null;


    personaje.traverse(
        objeto => {

            if (
                encontrado ||
                !objeto.isBone
            ) {
                return;
            }


            const nombre =
                limpiarNombreHueso(
                    objeto.name
                );


            if (
                buscados.includes(
                    nombre
                )
            ) {

                encontrado =
                    objeto;
            }
        }
    );


    return encontrado;
}


// ============================================================
// RIG
// ============================================================

function obtenerRig(
    personaje
) {

    return {

        pelvis:
            buscarHueso(
                personaje,
                [
                    "pelvis",
                    "hips",
                    "hip",
                    "root"
                ]
            ),

        spine:
            buscarHueso(
                personaje,
                [
                    "spine",
                    "spine1",
                    "spine2",
                    "torso"
                ]
            ),

        cuello:
            buscarHueso(
                personaje,
                [
                    "neck",
                    "cuello"
                ]
            ),

        cabeza:
            buscarHueso(
                personaje,
                [
                    "head",
                    "cabeza"
                ]
            ),

        piernaIzq:
            buscarHueso(
                personaje,
                [
                    "thighl",
                    "leftthigh",
                    "leftupleg",
                    "uplegl",
                    "legl",
                    "legleft"
                ]
            ),

        piernaDer:
            buscarHueso(
                personaje,
                [
                    "thighr",
                    "rightthigh",
                    "rightupleg",
                    "uplegr",
                    "legr",
                    "legright"
                ]
            ),

        pantorrillaIzq:
            buscarHueso(
                personaje,
                [
                    "calfl",
                    "leftcalf",
                    "leftlowerleg",
                    "lowerlegl",
                    "shinl"
                ]
            ),

        pantorrillaDer:
            buscarHueso(
                personaje,
                [
                    "calfr",
                    "rightcalf",
                    "rightlowerleg",
                    "lowerlegr",
                    "shinr"
                ]
            ),

        pieIzq:
            buscarHueso(
                personaje,
                [
                    "footl",
                    "leftfoot",
                    "leftankle"
                ]
            ),

        pieDer:
            buscarHueso(
                personaje,
                [
                    "footr",
                    "rightfoot",
                    "rightankle"
                ]
            ),

        brazoIzq:
            buscarHueso(
                personaje,
                [
                    "arml",
                    "leftarm",
                    "leftupperarm"
                ]
            ),

        brazoDer:
            buscarHueso(
                personaje,
                [
                    "armr",
                    "rightarm",
                    "rightupperarm"
                ]
            ),

        antebrazoIzq:
            buscarHueso(
                personaje,
                [
                    "forearml",
                    "leftforearm",
                    "leftlowerarm"
                ]
            ),

        antebrazoDer:
            buscarHueso(
                personaje,
                [
                    "forearmr",
                    "rightforearm",
                    "rightlowerarm"
                ]
            )
    };
}


// ============================================================
// PREPARAR PERSONAJE
// ============================================================

function prepararPersonaje(
    objeto,
    nombre
) {

    prepararHuesos(
        objeto
    );


    objeto.userData.nombre =
        nombre;


    objeto.userData.rig =
        obtenerRig(
            objeto
        );


    objeto.userData.caminando =
        false;


    objeto.userData.destinoZ =
        objeto.position.z;


    objeto.userData.baseY =
        CONFIG.alturaPersonajes;


    objeto.position.y =
        CONFIG.alturaPersonajes;


    objeto.traverse(
        parte => {

            if (parte.isMesh) {

                parte.castShadow =
                    true;

                parte.receiveShadow =
                    true;
            }
        }
    );


    return objeto;
                    }
// ============================================================
// CARGAR PERSONAJE
// ============================================================

function cargarPersonaje(
    ruta,
    nombre
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            loader.load(

                ruta,

                gltf => {

                    const objeto =
                        gltf.scene;


                    prepararPersonaje(
                        objeto,
                        nombre
                    );


                    resolve(
                        objeto
                    );
                },

                undefined,

                error => {

                    reject(
                        error
                    );
                }
            );
        }
    );
}


// ============================================================
// CARGAR MIKE Y MICAELA
// ============================================================

async function cargarPersonajes() {

    mike =
        await cargarPersonaje(
            "./3D/mike.glb",
            "Mike"
        );


    micaela =
        await cargarPersonaje(
            "./3D/micaela.glb",
            "Micaela"
        );


    // IMPORTANTE:
    // Los subimos para evitar que
    // queden enterrados.

    mike.position.set(
        -1.1,
        CONFIG.alturaPersonajes,
        8
    );


    micaela.position.set(
        1.1,
        CONFIG.alturaPersonajes,
        8.8
    );


    mike.userData.baseY =
        CONFIG.alturaPersonajes;

    micaela.userData.baseY =
        CONFIG.alturaPersonajes;


    mike.rotation.y =
        Math.PI;

    micaela.rotation.y =
        Math.PI;


    grupoPersonajes.add(
        mike
    );

    grupoPersonajes.add(
        micaela
    );
}


// ============================================================
// ROTACIÓN RELATIVA
// ============================================================

function rotacionRelativa(
    hueso,
    eje,
    angulo
) {

    if (!hueso) {
        return;
    }


    const rest =
        hueso.userData
            .restQuaternion;


    if (!rest) {
        return;
    }


    hueso.quaternion.copy(
        rest
    );


    const rotacion =
        new THREE.Quaternion()
            .setFromAxisAngle(
                eje,
                angulo
            );


    hueso.quaternion.multiply(
        rotacion
    );
}


// ============================================================
// POSE DE REPOSO
// ============================================================

function aplicarPoseReposo(
    personaje
) {

    if (!personaje) {
        return;
    }


    personaje.traverse(
        objeto => {

            if (!objeto.isBone) {
                return;
            }


            const rest =
                objeto.userData
                    .restQuaternion;


            if (rest) {

                objeto.quaternion.copy(
                    rest
                );
            }
        }
    );


    personaje.position.y =
        personaje.userData.baseY;
}


// ============================================================
// INICIAR CAMINATA
// ============================================================

function iniciarCaminata(
    personaje,
    destino
) {

    if (!personaje) {
        return;
    }


    personaje.userData.caminando =
        true;


    personaje.userData.destinoZ =
        destino;
}


// ============================================================
// DETENER CAMINATA
// ============================================================

function detenerCaminata(
    personaje
) {

    if (!personaje) {
        return;
    }


    personaje.userData.caminando =
        false;


    aplicarPoseReposo(
        personaje
    );
}
// ============================================================
// ANIMACIÓN DE CAMINATA
// ============================================================

function actualizarCaminata(
    personaje,
    delta,
    tiempoAnim
) {

    if (!personaje) {
        return;
    }


    const rig =
        personaje.userData.rig;


    if (!rig) {
        return;
    }


    if (
        !personaje.userData.caminando
    ) {

        aplicarPoseReposo(
            personaje
        );

        return;
    }


    const destino =
        personaje.userData.destinoZ;


    const diferencia =
        destino -
        personaje.position.z;


    const direccion =
        Math.sign(
            diferencia
        );


    const paso =
        CONFIG.velocidadPersonajes *
        delta;


    if (
        Math.abs(diferencia) <=
        paso
    ) {

        personaje.position.z =
            destino;


        personaje.userData.caminando =
            false;

    } else {

        personaje.position.z +=
            direccion * paso;
    }


    // Ciclo de caminar
    const ciclo =
        Math.sin(
            tiempoAnim * 8
        );


    const cicloOpuesto =
        Math.sin(
            tiempoAnim * 8 +
            Math.PI
        );


    // Piernas
    rotacionRelativa(
        rig.piernaIzq,
        EJE_X,
        ciclo * 0.42
    );


    rotacionRelativa(
        rig.piernaDer,
        EJE_X,
        cicloOpuesto * 0.42
    );


    // Pantorrillas
    rotacionRelativa(
        rig.pantorrillaIzq,
        EJE_X,
        Math.max(
            0,
            -ciclo
        ) * 0.28
    );


    rotacionRelativa(
        rig.pantorrillaDer,
        EJE_X,
        Math.max(
            0,
            -cicloOpuesto
        ) * 0.28
    );


    // Brazos contrarios a las piernas
    rotacionRelativa(
        rig.brazoIzq,
        EJE_X,
        cicloOpuesto * 0.30
    );


    rotacionRelativa(
        rig.brazoDer,
        EJE_X,
        ciclo * 0.30
    );


    // Antebrazos
    rotacionRelativa(
        rig.antebrazoIzq,
        EJE_X,
        0.10
    );


    rotacionRelativa(
        rig.antebrazoDer,
        EJE_X,
        0.10
    );


    // Pequeño movimiento corporal
    personaje.position.y =
        personaje.userData.baseY +
        Math.abs(
            Math.sin(
                tiempoAnim * 8
            )
        ) * 0.025;
}


// ============================================================
// ACTUALIZAR PERSONAJES
// ============================================================

function actualizarPersonajes(
    delta
) {

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
// MATERIAL HUEVO
// ============================================================

function crearMaterialHuevo(
    color
) {

    return new THREE.MeshStandardMaterial({

        color,

        roughness: 0.48,

        metalness: 0.02

    });
}


// ============================================================
// CREAR HUEVO
// ============================================================

function crearHuevo() {

    huevo =
        new THREE.Group();


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


    huevo.add(
        huevoSuperior
    );

    huevo.add(
        huevoInferior
    );


    huevo.position.set(
        0,
        1.15,
        -0.4
    );


    huevo.scale.setScalar(
        0.85
    );


    grupoHuevo.add(
        huevo
    );
}


// ============================================================
// PARTICULAS
// ============================================================

function crearParticulasHuevo() {

    const posiciones = [];

    const cantidad = 110;


    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        posiciones.push(

            (Math.random() - 0.5)
                * 3,

            Math.random() * 3,

            (Math.random() - 0.5)
                * 3
        );
    }


    const geometria =
        new THREE.BufferGeometry();


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

            size: 0.06,

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


// ============================================================
// ENERGÍA
// ============================================================

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


    energiaHuevo.scale.setScalar(
        0.2
    );


    grupoHuevo.add(
        energiaHuevo
    );
}


// ============================================================
// POLLITO
// ============================================================

function crearPollito() {

    const grupo =
        new THREE.Group();


    pollitoCuerpo =
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


    pollitoCuerpo.scale.set(
        1,
        0.85,
        1.05
    );


    grupo.add(
        pollitoCuerpo
    );


    pollitoCabeza =
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


    pollitoCabeza.position.y =
        0.55;


    grupo.add(
        pollitoCabeza
    );


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


    grupo.add(
        pico
    );


    const ojoMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x111111
        });


    for (
        const x of [
            -0.13,
            0.13
        ]
    ) {

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


        grupo.add(
            ojo
        );
    }


    pollitoAlaIzq =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.18,
                12,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: 0xe4bd45
            })
        );


    pollitoAlaDer =
        pollitoAlaIzq.clone();


    pollitoAlaIzq.position.set(
        -0.43,
        0.10,
        0
    );


    pollitoAlaDer.position.set(
        0.43,
        0.10,
        0
    );


    grupo.add(
        pollitoAlaIzq
    );

    grupo.add(
        pollitoAlaDer
    );


    grupo.position.set(
        0,
        0.45,
        -0.4
    );


    grupo.scale.setScalar(
        0.01
    );


    grupo.visible =
        false;


    return grupo;
}


// ============================================================
// PREPARAR RESULTADO
// ============================================================

function prepararResultado() {

    pollito =
        crearPollito();


    grupoResultado.add(
        pollito
    );
}
// ============================================================
// PREPARAR HUEVO
// ============================================================

function prepararHuevo() {

    crearHuevo();

    crearParticulasHuevo();

    crearEnergiaHuevo();
}


// ============================================================
// ACTIVAR HUEVO
// ============================================================

function activarHuevo() {

    tiempoHuevo = 0;

    huevoAbierto =
        false;


    if (huevo) {

        huevo.visible =
            true;

        huevo.scale.setScalar(
            0.85
        );
    }


    if (particulasHuevo) {

        particulasHuevo
            .material
            .opacity = 0;
    }


    if (energiaHuevo) {

        energiaHuevo
            .material
            .opacity = 0;

        energiaHuevo
            .scale
            .setScalar(
                0.2
            );
    }
}


// ============================================================
// ABRIR HUEVO
// ============================================================

function abrirHuevo() {

    if (huevoAbierto) {
        return;
    }


    huevoAbierto =
        true;


    tiempoHuevo = 0;
}


// ============================================================
// ACTUALIZAR HUEVO
// ============================================================

function actualizarHuevo(
    delta
) {

    if (!huevo) {
        return;
    }


    tiempoHuevo +=
        delta;


    if (!huevoAbierto) {

        huevo.rotation.y +=
            delta * 0.35;


        const pulso =
            0.85 +
            Math.sin(
                tiempoHuevo * 5
            ) * 0.025;


        huevo.scale.setScalar(
            pulso
        );


        return;
    }


    const t =
        Math.min(
            tiempoHuevo / 1.6,
            1
        );


    huevoSuperior.position.y =
        0.42 +
        t * 1.35;


    huevoSuperior.rotation.z =
        t * 0.20;


    huevoInferior.position.y =
        -0.28 -
        t * 0.15;


    if (energiaHuevo) {

        energiaHuevo
            .material
            .opacity =
            Math.max(
                0,
                0.65 -
                t * 0.65
            );


        energiaHuevo
            .scale
            .setScalar(
                0.2 +
                t * 1.8
            );
    }


    if (particulasHuevo) {

        particulasHuevo
            .material
            .opacity =
            Math.min(
                t * 1.5,
                1
            );
    }
}


// ============================================================
// ANIMAR POLLITO
// ============================================================

function actualizarPollito(
    delta
) {

    if (
        !pollito ||
        !pollito.visible
    ) {
        return;
    }


    const aparicion =
        Math.min(
            tiempoHuevo / 1.5,
            1
        );


    const escala =
        THREE.MathUtils.lerp(
            0.01,
            1,
            aparicion
        );


    pollito.scale.setScalar(
        escala
    );


    pollito.position.y =
        0.45 +
        Math.abs(
            Math.sin(
                tiempo * 5
            )
        ) * 0.045;


    pollito.rotation.y +=
        delta * 0.35;


    const aleteo =
        Math.sin(
            tiempo * 10
        ) * 0.18;


    if (pollitoAlaIzq) {

        pollitoAlaIzq
            .rotation.z =
            -0.15 +
            aleteo;
    }


    if (pollitoAlaDer) {

        pollitoAlaDer
            .rotation.z =
            0.15 -
            aleteo;
    }
}


// ============================================================
// MOSTRAR POLLITO
// ============================================================

function mostrarResultadoCinematica() {

    if (!pollito) {
        return;
    }


    pollito.visible =
        true;


    pollito.scale.setScalar(
        0.01
    );


    pollito.position.set(
        0,
        0.45,
        -0.4
    );
        }
// ============================================================
// SUAVIZADO
// ============================================================

function suavizar(
    actual,
    objetivo,
    velocidad
) {

    return THREE.MathUtils.lerp(

        actual,

        objetivo,

        1 -
        Math.exp(
            -velocidad *
            0.016
        )
    );
}


// ============================================================
// CÁMARA CINEMÁTICA
// ============================================================

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


    camara.lookAt(
        objetivo.x,
        objetivo.y,
        objetivo.z
    );
}


// ============================================================
// ACTUALIZAR CÁMARA
// ============================================================

function actualizarCamaraCine() {

    if (!camara) {
        return;
    }


    if (fase === 0) {

        camaraCine(

            new THREE.Vector3(
                0,
                4.8,
                15
            ),

            new THREE.Vector3(
                0,
                2,
                5
            )

        );

        return;
    }


    if (fase === 1) {

        const centro =
            new THREE.Vector3(
                0,
                1.8,
                4
            );


        if (
            mike &&
            micaela
        ) {

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
                5.5,
                3.5,
                8.5
            ),

            centro

        );

        return;
    }


    if (fase === 2) {

        camaraCine(

            new THREE.Vector3(
                4.3,
                3.0,
                5.0
            ),

            new THREE.Vector3(
                0,
                1.25,
                -0.4
            )

        );

        return;
    }


    if (fase === 3) {

        camaraCine(

            new THREE.Vector3(
                3.2,
                2.5,
                3.8
            ),

            new THREE.Vector3(
                0,
                1.15,
                -0.4
            )

        );

        return;
    }


    camaraCine(

        new THREE.Vector3(
            2.7,
            2.2,
            3.5
        ),

        new THREE.Vector3(
            0,
            1.0,
            -0.4
        )

    );
}


// ============================================================
// INTERFAZ DE DIÁLOGO
// ============================================================

function crearInterfazDialogo() {

    if (dialogo) {

        dialogo.remove();

        dialogo = null;
    }


    dialogo =
        document.createElement(
            "div"
        );


    dialogo.style.position =
        "fixed";

    dialogo.style.left =
        "5%";

    dialogo.style.right =
        "5%";

    dialogo.style.bottom =
        "6%";

    dialogo.style.padding =
        "18px 22px";

    dialogo.style.borderRadius =
        "18px";

    dialogo.style.background =
        "rgba(0,0,0,0.74)";

    dialogo.style.border =
        "2px solid rgba(255,255,255,0.85)";

    dialogo.style.color =
        "white";

    dialogo.style.fontFamily =
        "Arial,sans-serif";

    dialogo.style.zIndex =
        "1000";

    dialogo.style.display =
        "none";

    dialogo.style.pointerEvents =
        "none";


    const nombre =
        document.createElement(
            "div"
        );


    nombre.id =
        "eggaroNombreDialogo";


    nombre.style.fontWeight =
        "bold";

    nombre.style.fontSize =
        "20px";

    nombre.style.marginBottom =
        "7px";


    dialogoTexto =
        document.createElement(
            "div"
        );


    dialogoTexto.style.fontSize =
        "18px";

    dialogoTexto.style.lineHeight =
        "1.35";


    dialogo.appendChild(
        nombre
    );

    dialogo.appendChild(
        dialogoTexto
    );


    document.body.appendChild(
        dialogo
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
        !dialogo ||
        !dialogoTexto
    ) {
        return;
    }


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


// ============================================================
// OCULTAR DIÁLOGO
// ============================================================

function ocultarDialogo() {

    if (!dialogo) {
        return;
    }


    dialogo.style.display =
        "none";
}


// ============================================================
// DIÁLOGOS CORREGIDOS
// ============================================================

const dialogosCinematica = [

    {
        tiempo: 0,
        nombre: "Narrador",
        texto:
            "En lo profundo del bosque, algo misterioso los esperaba..."
    },

    {
        tiempo: 2.8,
        nombre: "Mike",
        texto:
            "Micaela, mira... ¿viste eso?"
    },

    {
        tiempo: 5.2,
        nombre: "Micaela",
        texto:
            "Sí... parece que hay algo más adelante."
    },

    {
        tiempo: 8.0,
        nombre: "Mike",
        texto:
            "Vamos a acercarnos."
    },

    {
        tiempo: 11.0,
        nombre: "Micaela",
        texto:
            "¡Es un huevo!"
    },

    {
        tiempo: 14.0,
        nombre: "Mike",
        texto:
            "¡Está brillando!"
    },

    {
        tiempo: 17.0,
        nombre: "Micaela",
        texto:
            "¡Mira! ¡Se está abriendo!"
    },

    {
        tiempo: 20.0,
        nombre: "Mike",
        texto:
            "¡Nació un pollito!"
    }
];


// ============================================================
// ACTUALIZAR DIÁLOGOS
// ============================================================

function actualizarDialogos() {

    let actual = null;


    for (
        const item
        of dialogosCinematica
    ) {

        if (
            tiempo >=
            item.tiempo
        ) {

            actual =
                item;
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
// CAMBIAR FASE
// ============================================================

function cambiarFase(
    nuevaFase
) {

    fase =
        nuevaFase;


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

        detenerCaminata(
            mike
        );

        detenerCaminata(
            micaela
        );


        activarHuevo();
    }


    if (fase === 3) {

        abrirHuevo();
    }


    if (fase === 4) {

        mostrarResultadoCinematica();
    }
}


// ============================================================
// SECUENCIA
// ============================================================

function actualizarSecuencia() {

    if (fase === 0) {

        if (
            tiempo >= 2.5
        ) {

            cambiarFase(1);
        }


        return;
    }


    if (fase === 1) {

        const mikeListo =
            !mike ||
            !mike.userData.caminando;


        const micaelaLista =
            !micaela ||
            !micaela.userData.caminando;


        if (
            mikeListo &&
            micaelaLista &&
            tiempo >= 5
        ) {

            cambiarFase(2);
        }


        return;
    }


    if (fase === 2) {

        if (
            tiempo >= 3.0
        ) {

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

        if (
            tiempoHuevo >= 5.5
        ) {

            finalizada =
                true;
        }
    }
}


// ============================================================
// ACTUALIZAR CINEMÁTICA
// ============================================================

function actualizarCinematica(
    delta
) {

    if (!activa) {
        return;
    }


    tiempo +=
        delta;


    actualizarSecuencia();

    actualizarPersonajes(
        delta
    );

    actualizarHuevo(
        delta
    );

    actualizarPollito(
        delta
    );

    actualizarDialogos();

    actualizarCamaraCine();
}


// ============================================================
// CINEMÁTICA TERMINADA
// ============================================================

export function cinematicaTerminada() {

    return finalizada;
}


// ============================================================
// DETENER CINEMÁTICA
// ============================================================

export function detenerCinematica() {

    activa =
        false;


    ocultarDialogo();


    if (renderer) {

        renderer.setAnimationLoop(
            null
        );


        if (
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement
                .parentNode
                .removeChild(
                    renderer.domElement
                );
        }
    }


    if (dialogo) {

        dialogo.remove();

        dialogo = null;
    }


    renderer =
        null;

    reloj =
        null;
}


// ============================================================
// RESULTADO
// ============================================================

export function establecerResultadoCinematica(
    resultado
) {

    const valor =
        String(
            resultado ||
            "noob"
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
// INICIAR CINEMÁTICA
// ============================================================

export async function iniciarCinematica(
    contenedor
) {

    if (activa) {
        return;
    }


    finalizada =
        false;

    activa =
        true;


    tiempo =
        0;

    fase =
        0;

    tiempoHuevo =
        0;

    huevoAbierto =
        false;


    // Crear todo
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


        activa =
            false;


        if (
            renderer &&
            renderer.domElement &&
            renderer.domElement.parentNode
        ) {

            renderer.domElement
                .parentNode
                .removeChild(
                    renderer.domElement
                );
        }


        if (dialogo) {

            dialogo.remove();

            dialogo =
                null;
        }


        renderer =
            null;


        throw error;
    }


    // Pose inicial
    aplicarPoseReposo(
        mike
    );

    aplicarPoseReposo(
        micaela
    );


    // Cámara inicial
    cambiarFase(
        0
    );


    reloj =
        new THREE.Clock();


    actualizarTamaño();


    renderizar();
}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    actualizarTamaño
);
