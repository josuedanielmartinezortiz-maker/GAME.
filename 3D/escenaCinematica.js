// ============================================================
// EGGARO / GAMERPRO
// escenaCinematica.js
// CINEMÁTICA 3D EN TIEMPO REAL
// ============================================================

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ------------------------------------------------------------
// ESTADO
// ------------------------------------------------------------

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
let cinematicaFinalizada = false;

let resultadoCinematica = "noob";

let anchoAnterior = 0;
let altoAnterior = 0;

// ------------------------------------------------------------
// CONFIGURACIÓN
// ------------------------------------------------------------

const CONFIG = {
    anchoBase: 1280,
    altoBase: 720,

    colorCielo: 0x9fc5d8,
    colorSuelo: 0x526b45,

    velocidadCamara: 0.35,
    velocidadPersonajes: 1.35,

    sombras: true,

    calidadPixelRatio: Math.min(
        window.devicePixelRatio || 1,
        1.5
    )
};

// ------------------------------------------------------------
// LOADER
// ------------------------------------------------------------

const loader = new GLTFLoader();

// ------------------------------------------------------------
// CREAR ESCENA
// ------------------------------------------------------------

function crearEscena() {

    escena = new THREE.Scene();

    escena.background = new THREE.Color(
        CONFIG.colorCielo
    );

    escena.fog = new THREE.FogExp2(
        0x9fc5d8,
        0.018
    );

    reloj = new THREE.Clock();

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

// ------------------------------------------------------------
// CÁMARA
// ------------------------------------------------------------

function crearCamara() {

    camara = new THREE.PerspectiveCamera(
        48,
        window.innerWidth / window.innerHeight,
        0.1,
        300
    );

    camara.position.set(
        0,
        4.5,
        15
    );

    camara.lookAt(
        0,
        2,
        0
    );
}

// ------------------------------------------------------------
// RENDERER
// ------------------------------------------------------------

function crearRenderer() {

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        CONFIG.calidadPixelRatio
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

    renderer.toneMappingExposure = 1.05;

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "20";

    document.body.appendChild(
        renderer.domElement
    );
}

// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

function actualizarTamaño() {

    if (!renderer || !camara) return;

    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    if (
        ancho === anchoAnterior &&
        alto === altoAnterior
    ) {
        return;
    }

    anchoAnterior = ancho;
    altoAnterior = alto;

    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();

    renderer.setSize(
        ancho,
        alto,
        false
    );
}

// ------------------------------------------------------------
// LUCES
// ------------------------------------------------------------

function crearIluminacion() {

    const luzAmbiente =
        new THREE.HemisphereLight(
            0xbfdcff,
            0x35452c,
            2.2
        );

    escena.add(luzAmbiente);

    const sol =
        new THREE.DirectionalLight(
            0xffe4b5,
            3.2
        );

    sol.position.set(
        -20,
        35,
        15
    );

    sol.castShadow =
        CONFIG.sombras;

    sol.shadow.mapSize.width = 2048;
    sol.shadow.mapSize.height = 2048;

    sol.shadow.camera.near = 1;
    sol.shadow.camera.far = 100;

    sol.shadow.camera.left = -35;
    sol.shadow.camera.right = 35;
    sol.shadow.camera.top = 35;
    sol.shadow.camera.bottom = -35;

    escena.add(sol);
}

// ------------------------------------------------------------
// LOOP PRINCIPAL
// ------------------------------------------------------------

function renderizar() {

    if (!activa) return;

    requestAnimationFrame(
        renderizar
    );

    const delta =
        Math.min(
            reloj.getDelta(),
            0.033
        );

    actualizarCinematica(delta);

    actualizarTamaño();

    renderer.render(
        escena,
        camara
    );
}
// ============================================================
// BLOQUE 2/12
// BOSQUE 3D — SUELO + PINOS
// ============================================================

// ------------------------------------------------------------
// MATERIAL DE SUELO
// ------------------------------------------------------------

function crearSuelo() {

    const geometria =
        new THREE.PlaneGeometry(
            90,
            90,
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

        const ruido =
            Math.sin(x * 0.16) * 0.18 +
            Math.cos(y * 0.13) * 0.15 +
            Math.sin(
                (x + y) * 0.08
            ) * 0.12;

        posiciones.setZ(
            i,
            ruido
        );
    }

    geometria.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x526b45,
            roughness: 1,
            metalness: 0
        });

    const suelo =
        new THREE.Mesh(
            geometria,
            material
        );

    suelo.rotation.x =
        -Math.PI / 2;

    suelo.position.y = -0.15;

    suelo.receiveShadow = true;

    grupoBosque.add(suelo);
}


// ------------------------------------------------------------
// TRONCO DE PINO
// ------------------------------------------------------------

function crearTroncoPino(
    radio,
    altura
) {

    const geometria =
        new THREE.CylinderGeometry(
            radio * 0.72,
            radio,
            altura,
            8
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x65452f,
            roughness: 0.95
        });

    const tronco =
        new THREE.Mesh(
            geometria,
            material
        );

    tronco.castShadow = true;
    tronco.receiveShadow = true;

    return tronco;
}


// ------------------------------------------------------------
// COPA DE PINO
// ------------------------------------------------------------

function crearCopaPino(
    radio,
    altura,
    color
) {

    const geometria =
        new THREE.ConeGeometry(
            radio,
            altura,
            10,
            4
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.95
        });

    const copa =
        new THREE.Mesh(
            geometria,
            material
        );

    copa.castShadow = true;
    copa.receiveShadow = true;

    return copa;
}


// ------------------------------------------------------------
// PINO 3D COMPLETO
// ------------------------------------------------------------

function crearPino(
    x,
    z,
    escala = 1
) {

    const pino =
        new THREE.Group();

    const alturaTronco =
        4.2 * escala;

    const tronco =
        crearTroncoPino(
            0.32 * escala,
            alturaTronco
        );

    tronco.position.y =
        alturaTronco / 2;

    pino.add(tronco);


    // CAPAS DE RAMAS

    const capas = [
        {
            radio: 2.5,
            alto: 3.4,
            y: 3.0
        },
        {
            radio: 2.15,
            alto: 3.1,
            y: 4.25
        },
        {
            radio: 1.75,
            alto: 2.8,
            y: 5.35
        },
        {
            radio: 1.3,
            alto: 2.5,
            y: 6.35
        },
        {
            radio: 0.85,
            alto: 2.1,
            y: 7.25
        }
    ];

    capas.forEach(
        (capa, indice) => {

            const verde =
                indice % 2 === 0
                    ? 0x315b3a
                    : 0x3d7044;

            const copa =
                crearCopaPino(
                    capa.radio * escala,
                    capa.alto * escala,
                    verde
                );

            copa.position.y =
                capa.y * escala;

            // Pequeña variación para que
            // las capas no parezcan perfectas.

            copa.rotation.y =
                indice * 0.35;

            pino.add(copa);
        }
    );


    pino.position.set(
        x,
        0,
        z
    );

    pino.rotation.y =
        Math.random() *
        Math.PI *
        2;

    grupoBosque.add(pino);

    return pino;
}


// ------------------------------------------------------------
// PASTO PEQUEÑO
// ------------------------------------------------------------

function crearPasto(
    x,
    z,
    escala = 1
) {

    const grupo =
        new THREE.Group();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x557d43,
            roughness: 1
        });

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const hoja =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.035 * escala,
                    0.35 * escala,
                    4
                ),
                material
            );

        hoja.position.set(
            (Math.random() - 0.5) *
                0.35 * escala,

            0.17 * escala,

            (Math.random() - 0.5) *
                0.35 * escala
        );

        hoja.rotation.z =
            (Math.random() - 0.5) *
            0.7;

        grupo.add(hoja);
    }

    grupo.position.set(
        x,
        0,
        z
    );

    grupoBosque.add(grupo);
}


// ------------------------------------------------------------
// PIEDRA
// ------------------------------------------------------------

function crearPiedra(
    x,
    z,
    escala = 1
) {

    const geometria =
        new THREE.IcosahedronGeometry(
            0.45 * escala,
            1
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x66685f,
            roughness: 1
        });

    const piedra =
        new THREE.Mesh(
            geometria,
            material
        );

    piedra.position.set(
        x,
        0.25 * escala,
        z
    );

    piedra.scale.y =
        0.65;

    piedra.rotation.y =
        Math.random() * Math.PI;

    piedra.castShadow = true;
    piedra.receiveShadow = true;

    grupoBosque.add(piedra);
}


// ------------------------------------------------------------
// GENERAR BOSQUE
// ------------------------------------------------------------

function crearBosque() {

    crearSuelo();

    // PINOS DEL FONDO

    const pinos = [
        [-18, -18, 1.45],
        [-11, -21, 1.15],
        [-4, -23, 1.55],
        [5, -22, 1.3],
        [14, -20, 1.5],
        [22, -17, 1.2],

        [-23, -10, 1.25],
        [-18, -7, 1.05],
        [19, -8, 1.25],
        [24, -5, 1.4],

        [-24, 4, 1.4],
        [24, 5, 1.35],

        [-20, 14, 1.3],
        [-10, 18, 1.5],
        [10, 17, 1.35],
        [20, 13, 1.5]
    ];

    pinos.forEach(
        pino => {

            crearPino(
                pino[0],
                pino[1],
                pino[2]
            );
        }
    );


    // VEGETACIÓN DEL SUELO

    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const x =
            (Math.random() - 0.5) *
            65;

        const z =
            (Math.random() - 0.5) *
            55;

        crearPasto(
            x,
            z,
            0.6 +
            Math.random() * 0.8
        );
    }


    // PIEDRAS

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        const x =
            (Math.random() - 0.5) *
            55;

        const z =
            (Math.random() - 0.5) *
            45;

        crearPiedra(
            x,
            z,
            0.5 +
            Math.random() * 0.9
        );
    }
}
// ============================================================
// BLOQUE 3/12
// MIKE + MICAELA + SISTEMA DE HUESOS
// ============================================================

// ------------------------------------------------------------
// LIMPIAR NOMBRE DE HUESO
// ------------------------------------------------------------

function limpiarNombreHueso(nombre) {

    return String(nombre)
        .toLowerCase()
        .replace(/[\s_\-\.]/g, "");
}


// ------------------------------------------------------------
// GUARDAR POSICIÓN DE DESCANSO
// ------------------------------------------------------------

function prepararHuesos(personaje) {

    if (!personaje) return;

    personaje.traverse(objeto => {

        if (!objeto.isBone) return;

        objeto.userData.eggaroRestQuaternion =
            objeto.quaternion.clone();

        objeto.userData.eggaroRestPosition =
            objeto.position.clone();

        objeto.userData.eggaroNombre =
            limpiarNombreHueso(
                objeto.name
            );
    });
}


// ------------------------------------------------------------
// BUSCAR HUESO POR NOMBRES POSIBLES
// ------------------------------------------------------------

function buscarHueso(
    personaje,
    nombres
) {

    if (!personaje) return null;

    const buscados =
        nombres.map(
            limpiarNombreHueso
        );

    let encontrado = null;

    personaje.traverse(objeto => {

        if (
            encontrado ||
            !objeto.isBone
        ) {
            return;
        }

        const nombre =
            objeto.userData.eggaroNombre ||
            limpiarNombreHueso(
                objeto.name
            );

        if (
            buscados.includes(nombre)
        ) {
            encontrado = objeto;
        }
    });

    return encontrado;
}


// ------------------------------------------------------------
// CREAR MAPA DE HUESOS
// ------------------------------------------------------------

function obtenerRig(personaje) {

    if (!personaje) return {};

    return {

        pelvis: buscarHueso(
            personaje,
            [
                "pelvis",
                "hips",
                "hip",
                "root",
                "cadera"
            ]
        ),

        spine: buscarHueso(
            personaje,
            [
                "spine",
                "spine1",
                "spine2",
                "chest",
                "torso"
            ]
        ),

        cuello: buscarHueso(
            personaje,
            [
                "neck",
                "cuello"
            ]
        ),

        cabeza: buscarHueso(
            personaje,
            [
                "head",
                "cabeza"
            ]
        ),

        piernaIzq: buscarHueso(
            personaje,
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

        piernaDer: buscarHueso(
            personaje,
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

        pieIzq: buscarHueso(
            personaje,
            [
                "leftfoot",
                "footleft",
                "footl",
                "leftankle",
                "ankleleft"
            ]
        ),

        pieDer: buscarHueso(
            personaje,
            [
                "rightfoot",
                "footright",
                "footr",
                "rightankle",
                "ankleright"
            ]
        ),

        brazoIzq: buscarHueso(
            personaje,
            [
                "leftarm",
                "armleft",
                "leftupperarm",
                "upperarmleft",
                "upperarml",
                "arml"
            ]
        ),

        brazoDer: buscarHueso(
            personaje,
            [
                "rightarm",
                "armright",
                "rightupperarm",
                "upperarmright",
                "upperarmr",
                "armr"
            ]
        ),

        antebrazoIzq: buscarHueso(
            personaje,
            [
                "leftforearm",
                "forearmleft",
                "lowerarmleft",
                "forearml"
            ]
        ),

        antebrazoDer: buscarHueso(
            personaje,
            [
                "rightforearm",
                "forearmright",
                "lowerarmright",
                "forearmr"
            ]
        )
    };
}


// ------------------------------------------------------------
// ROTACIÓN RELATIVA AL HUESO
// ------------------------------------------------------------

function rotacionRelativa(
    hueso,
    eje,
    angulo
) {

    if (!hueso) return;

    const reposo =
        hueso.userData
            .eggaroRestQuaternion;

    if (!reposo) return;

    hueso.quaternion.copy(
        reposo
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


// ------------------------------------------------------------
// PREPARAR PERSONAJE
// ------------------------------------------------------------

function prepararPersonaje(
    objeto,
    nombre
) {

    if (!objeto) return null;

    prepararHuesos(objeto);

    const rig =
        obtenerRig(objeto);

    objeto.userData.eggaroRig =
        rig;

    objeto.userData.eggaroNombre =
        nombre;

    objeto.userData.eggaroCaminando =
        false;

    objeto.userData.eggaroTiempo =
        Math.random() * 10;

    objeto.userData.eggaroBaseY =
        objeto.position.y;

    objeto.userData.eggaroInicioZ =
        objeto.position.z;

    objeto.userData.eggaroDestinoZ =
        objeto.position.z;

    objeto.traverse(parte => {

        if (!parte.isMesh) return;

        parte.castShadow = true;
        parte.receiveShadow = true;
    });

    return objeto;
}


// ------------------------------------------------------------
// CARGAR GLB
// ------------------------------------------------------------

function cargarPersonaje(
    ruta,
    nombre
) {

    return new Promise(
        (resolve, reject) => {

            loader.load(
                ruta,

                gltf => {

                    const objeto =
                        gltf.scene;

                    prepararPersonaje(
                        objeto,
                        nombre
                    );

                    resolve(objeto);
                },

                undefined,

                error => {

                    console.error(
                        "Error cargando " +
                        nombre +
                        ":",
                        error
                    );

                    reject(error);
                }
            );
        }
    );
}


// ------------------------------------------------------------
// CARGAR MIKE Y MICAELA
// ------------------------------------------------------------

async function cargarPersonajes() {

    try {

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


        // ----------------------------------------------------
        // POSICIONES INICIALES
        // ----------------------------------------------------

        mike.position.set(
            -1.25,
            0,
            8
        );

        micaela.position.set(
            1.25,
            0,
            8.8
        );


        // Los modelos conservan la orientación
        // usada por el juego.

        mike.rotation.y =
            Math.PI;

        micaela.rotation.y =
            Math.PI;


        // Escala conservadora.
        // Si tus GLB ya tienen la escala correcta,
        // estos valores permanecen en 1.

        mike.scale.setScalar(1);
        micaela.scale.setScalar(1);


        grupoPersonajes.add(
            mike
        );

        grupoPersonajes.add(
            micaela
        );


        return true;

    } catch (error) {

        console.error(
            "No se pudieron cargar Mike/Micaela.",
            error
        );

        return false;
    }
            }
// ============================================================
// BLOQUE 4/12
// CAMINAR PROCEDURAL
// ============================================================

// ------------------------------------------------------------
// CONFIGURAR CAMINATA
// ------------------------------------------------------------

function iniciarCaminata(
    personaje,
    destinoZ
) {

    if (!personaje) return;

    personaje.userData.eggaroCaminando =
        true;

    personaje.userData.eggaroDestinoZ =
        destinoZ;
}


// ------------------------------------------------------------
// DETENER CAMINATA
// ------------------------------------------------------------

function detenerCaminata(
    personaje
) {

    if (!personaje) return;

    personaje.userData.eggaroCaminando =
        false;

    aplicarPoseReposo(
        personaje
    );
}


// ------------------------------------------------------------
// POSE DE REPOSO
// ------------------------------------------------------------

function aplicarPoseReposo(
    personaje
) {

    if (!personaje) return;

    const rig =
        personaje.userData.eggaroRig;

    if (!rig) return;

    const ejeX =
        new THREE.Vector3(1, 0, 0);

    const ejeY =
        new THREE.Vector3(0, 1, 0);


    rotacionRelativa(
        rig.piernaIzq,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.piernaDer,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.pieIzq,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.pieDer,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.brazoIzq,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.brazoDer,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.antebrazoIzq,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.antebrazoDer,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.spine,
        ejeX,
        0
    );

    rotacionRelativa(
        rig.cabeza,
        ejeY,
        0
    );
}


// ------------------------------------------------------------
// ANIMAR CAMINATA
// ------------------------------------------------------------

function actualizarCaminata(
    personaje,
    delta
) {

    if (!personaje) return;

    const datos =
        personaje.userData;

    const rig =
        datos.eggaroRig;

    if (!rig) return;

    datos.eggaroTiempo +=
        delta * 6.0;

    const tiempo =
        datos.eggaroTiempo;


    // --------------------------------------------------------
    // MOVIMIENTO DEL PERSONAJE
    // --------------------------------------------------------

    if (datos.eggaroCaminando) {

        const destino =
            datos.eggaroDestinoZ;

        const diferencia =
            destino -
            personaje.position.z;

        const distancia =
            Math.abs(diferencia);

        if (distancia > 0.05) {

            const direccion =
                Math.sign(diferencia);

            personaje.position.z +=
                direccion *
                CONFIG.velocidadPersonajes *
                delta;

        } else {

            personaje.position.z =
                destino;

            detenerCaminata(
                personaje
            );
        }
    }


    // --------------------------------------------------------
    // RITMO DE PASOS
    // --------------------------------------------------------

    const amplitudPierna =
        datos.eggaroCaminando
            ? 0.42
            : 0;

    const paso =
        Math.sin(
            tiempo
        ) *
        amplitudPierna;


    // --------------------------------------------------------
    // PIERNAS
    // --------------------------------------------------------

    const ejeX =
        new THREE.Vector3(
            1,
            0,
            0
        );

    rotacionRelativa(
        rig.piernaIzq,
        ejeX,
        paso
    );

    rotacionRelativa(
        rig.piernaDer,
        ejeX,
        -paso
    );


    // --------------------------------------------------------
    // PIES
    // --------------------------------------------------------

    const movimientoPie =
        Math.sin(
            tiempo
        ) *
        amplitudPierna *
        0.45;

    rotacionRelativa(
        rig.pieIzq,
        ejeX,
        -movimientoPie
    );

    rotacionRelativa(
        rig.pieDer,
        ejeX,
        movimientoPie
    );


    // --------------------------------------------------------
    // BRAZOS
    // --------------------------------------------------------

    const amplitudBrazo =
        datos.eggaroCaminando
            ? 0.28
            : 0;

    const brazo =
        Math.sin(
            tiempo
        ) *
        amplitudBrazo;

    rotacionRelativa(
        rig.brazoIzq,
        ejeX,
        -brazo
    );

    rotacionRelativa(
        rig.brazoDer,
        ejeX,
        brazo
    );


    // --------------------------------------------------------
    // ANTEBRAZOS
    // --------------------------------------------------------

    rotacionRelativa(
        rig.antebrazoIzq,
        ejeX,
        -Math.abs(brazo) *
        0.25
    );

    rotacionRelativa(
        rig.antebrazoDer,
        ejeX,
        -Math.abs(brazo) *
        0.25
    );


    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const balanceo =
        datos.eggaroCaminando
            ? Math.sin(
                tiempo * 2
            ) * 0.025
            : 0;

    rotacionRelativa(
        rig.spine,
        ejeX,
        balanceo
    );


    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const movimientoCabeza =
        datos.eggaroCaminando
            ? Math.sin(
                tiempo * 2
            ) * 0.025
            : 0;

    const ejeY =
        new THREE.Vector3(
            0,
            1,
            0
        );

    rotacionRelativa(
        rig.cabeza,
        ejeY,
        movimientoCabeza
    );


    // --------------------------------------------------------
    // PEQUEÑO BOB DEL CUERPO
    // --------------------------------------------------------

    if (datos.eggaroCaminando) {

        const baseY =
            datos.eggaroBaseY ?? 0;

        personaje.position.y =
            baseY +
            Math.abs(
                Math.sin(
                    tiempo * 2
                )
            ) * 0.035;

    } else {

        personaje.position.y =
            datos.eggaroBaseY ?? 0;
    }
}


// ------------------------------------------------------------
// ACTUALIZAR AMBOS PERSONAJES
// ------------------------------------------------------------

function actualizarPersonajes(
    delta
) {

    actualizarCaminata(
        mike,
        delta
    );

    actualizarCaminata(
        micaela,
        delta
    );
}
// ============================================================
// BLOQUE 5/12
// HUEVO 3D CINEMATOGRÁFICO
// ============================================================

// ------------------------------------------------------------
// CREAR MATERIAL DEL HUEVO
// ------------------------------------------------------------

function crearMaterialHuevo() {

    return new THREE.MeshStandardMaterial({
        color: 0xf2e4c5,
        roughness: 0.45,
        metalness: 0.05
    });
}


// ------------------------------------------------------------
// CREAR HUEVO
// ------------------------------------------------------------

function crearHuevo() {

    grupoHuevo.clear();

    const grupo =
        new THREE.Group();

    grupo.name =
        "HuevoCinematico";

    // --------------------------------------------------------
    // CUERPO PRINCIPAL
    // --------------------------------------------------------

    const geometria =
        new THREE.SphereGeometry(
            1,
            32,
            24
        );

    const huevo =
        new THREE.Mesh(
            geometria,
            crearMaterialHuevo()
        );

    // Forma de huevo
    huevo.scale.set(
        0.78,
        1.08,
        0.78
    );

    huevo.castShadow = true;
    huevo.receiveShadow = true;

    grupo.add(huevo);


    // --------------------------------------------------------
    // PEQUEÑA BASE DE LUZ
    // --------------------------------------------------------

    const luz =
        new THREE.PointLight(
            0xffe9a8,
            0,
            6
        );

    luz.position.y =
        0.3;

    grupo.add(luz);

    grupo.userData.huevo =
        huevo;

    grupo.userData.luz =
        luz;

    grupo.userData.tiempo =
        0;

    grupo.userData.activo =
        false;

    grupo.userData.abriendo =
        false;

    grupo.userData.abierto =
        false;

    grupo.position.set(
        0,
        1.15,
        -3
    );

    grupoHuevo.add(
        grupo
    );

    return grupo;
}


// ------------------------------------------------------------
// CREAR PARTÍCULAS DEL HUEVO
// ------------------------------------------------------------

function crearParticulasHuevo() {

    const cantidad = 32;

    const posiciones =
        new Float32Array(
            cantidad * 3
        );

    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI *
            2;

        const radio =
            0.7 +
            Math.random() * 1.3;

        const altura =
            Math.random() *
            2.0;

        posiciones[i * 3] =
            Math.cos(angulo) *
            radio;

        posiciones[i * 3 + 1] =
            altura;

        posiciones[i * 3 + 2] =
            Math.sin(angulo) *
            radio;
    }

    const geometria =
        new THREE.BufferGeometry();

    geometria.setAttribute(
        "position",
        new THREE.BufferAttribute(
            posiciones,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0xffe8a3,
            size: 0.075,
            transparent: true,
            opacity: 0
        });

    const particulas =
        new THREE.Points(
            geometria,
            material
        );

    particulas.position.copy(
        grupoHuevo
            .children[0]
            ?.position ||
        new THREE.Vector3(
            0,
            1.15,
            -3
        )
    );

    particulas.userData.tiempo =
        Math.random() * 10;

    particulas.userData.material =
        material;

    grupoHuevo.add(
        particulas
    );
}


// ------------------------------------------------------------
// ACTIVAR HUEVO
// ------------------------------------------------------------

function activarHuevo() {

    if (!grupoHuevo) return;

    const huevo =
        grupoHuevo.children.find(
            objeto =>
                objeto.name ===
                "HuevoCinematico"
        );

    if (!huevo) return;

    huevo.userData.activo =
        true;

    huevo.userData.abriendo =
        false;

    huevo.userData.abierto =
        false;

    huevo.userData.tiempo =
        0;

    huevo.scale.setScalar(
        0.01
    );

    huevo.rotation.set(
        0,
        0,
        0
    );

    huevo.visible =
        true;

    const particulas =
        grupoHuevo.children.find(
            objeto =>
                objeto.isPoints
        );

    if (particulas) {

        particulas.material.opacity =
            0;
    }
}


// ------------------------------------------------------------
// ACTUALIZAR HUEVO
// ------------------------------------------------------------

function actualizarHuevo(
    delta
) {

    if (!grupoHuevo) return;

    const huevo =
        grupoHuevo.children.find(
            objeto =>
                objeto.name ===
                "HuevoCinematico"
        );

    if (!huevo) return;

    if (!huevo.userData.activo) {
        return;
    }

    huevo.userData.tiempo +=
        delta;

    const tiempo =
        huevo.userData.tiempo;


    // --------------------------------------------------------
    // APARICIÓN SUAVE
    // --------------------------------------------------------

    if (
        tiempo < 1.2 &&
        !huevo.userData.abriendo
    ) {

        const progreso =
            Math.min(
                tiempo / 1.2,
                1
            );

        const suave =
            progreso *
            progreso *
            (3 - 2 * progreso);

        huevo.scale.setScalar(
            suave
        );

        huevo.rotation.y =
            tiempo * 1.5;

        huevo.rotation.z =
            Math.sin(
                tiempo * 5
            ) *
            0.04;
    }


    // --------------------------------------------------------
    // PULSO
    // --------------------------------------------------------

    if (
        tiempo >= 1.2 &&
        !huevo.userData.abriendo
    ) {

        const pulso =
            Math.sin(
                tiempo * 4
            );

        huevo.rotation.y +=
            delta * 0.35;

        huevo.rotation.z =
            pulso * 0.025;
    }


    // --------------------------------------------------------
    // LUZ
    // --------------------------------------------------------

    const luz =
        huevo.userData.luz;

    if (luz) {

        const intensidad =
            tiempo < 1.2
                ? tiempo * 1.5
                : 0.7 +
                  Math.sin(
                      tiempo * 4
                  ) * 0.25;

        luz.intensity =
            Math.max(
                0,
                intensidad
            );
    }
}


// ------------------------------------------------------------
// INICIAR APERTURA
// ------------------------------------------------------------

function abrirHuevo() {

    const huevo =
        grupoHuevo.children.find(
            objeto =>
                objeto.name ===
                "HuevoCinematico"
        );

    if (!huevo) return;

    huevo.userData.abriendo =
        true;

    huevo.userData.tiempo =
        0;
}


// ------------------------------------------------------------
// CREAR HUEVO AL PREPARAR ESCENA
// ------------------------------------------------------------

function prepararHuevo() {

    crearHuevo();
    crearParticulasHuevo();
        }
// ============================================================
// BLOQUE 6/12
// APERTURA DEL HUEVO + ENERGÍA
// ============================================================

// ------------------------------------------------------------
// CREAR ENERGÍA DEL HUEVO
// ------------------------------------------------------------

function crearEnergiaHuevo() {

    const grupo =
        new THREE.Group();

    grupo.name =
        "EnergiaHuevo";

    const cantidad = 42;

    const posiciones =
        new Float32Array(
            cantidad * 3
        );

    const velocidades =
        [];

    for (
        let i = 0;
        i < cantidad;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI * 2;

        const radio =
            0.45 +
            Math.random() * 0.7;

        posiciones[i * 3] =
            Math.cos(angulo) *
            radio;

        posiciones[i * 3 + 1] =
            Math.random() * 1.8;

        posiciones[i * 3 + 2] =
            Math.sin(angulo) *
            radio;

        velocidades.push({
            x:
                (Math.random() - 0.5) *
                0.25,

            y:
                0.4 +
                Math.random() * 0.8,

            z:
                (Math.random() - 0.5) *
                0.25
        });
    }

    const geometria =
        new THREE.BufferGeometry();

    geometria.setAttribute(
        "position",
        new THREE.BufferAttribute(
            posiciones,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0xffe49a,
            size: 0.11,
            transparent: true,
            opacity: 0,
            depthWrite: false
        });

    const puntos =
        new THREE.Points(
            geometria,
            material
        );

    grupo.add(puntos);

    grupo.userData.velocidades =
        velocidades;

    grupo.userData.tiempo =
        0;

    grupo.userData.activo =
        false;

    grupo.userData.puntos =
        puntos;

    grupoHuevo.add(
        grupo
    );

    return grupo;
}


// ------------------------------------------------------------
// ACTIVAR ENERGÍA
// ------------------------------------------------------------

function activarEnergiaHuevo() {

    const energia =
        grupoHuevo.children.find(
            objeto =>
                objeto.name ===
                "EnergiaHuevo"
        );

    if (!energia) return;

    energia.userData.activo =
        true;

    energia.userData.tiempo =
        0;

    energia.userData.puntos
        .material.opacity = 1;
}


// ------------------------------------------------------------
// ACTUALIZAR ENERGÍA
// ------------------------------------------------------------

function actualizarEnergiaHuevo(
    delta
) {

    const energia =
        grupoHuevo.children.find(
            objeto =>
                objeto.name ===
                "EnergiaHuevo"
        );

    if (
        !energia ||
        !energia.userData.activo
    ) {
        return;
    }

    energia.userData.tiempo +=
        delta;

    const tiempo =
        energia.userData.tiempo;

    const puntos =
        energia.userData.puntos;

    const posiciones =
        puntos.geometry
            .attributes
            .position;

    const velocidades =
        energia.userData.velocidades;

    for (
        let i = 0;
        i < velocidades.length;
        i++
    ) {

        const velocidad =
            velocidades[i];

        let x =
            posiciones.getX(i);

        let y =
            posiciones.getY(i);

        let z =
            posiciones.getZ(i);

        x +=
            velocidad.x *
            delta;

        y +=
            velocidad.y *
            delta;

        z +=
            velocidad.z *
            delta;

        // Cuando una partícula sube demasiado,
        // vuelve cerca del huevo.

        if (y > 2.8) {

            const angulo =
                Math.random() *
                Math.PI * 2;

            const radio =
                0.4 +
                Math.random() * 0.6;

            x =
                Math.cos(angulo) *
                radio;

            y =
                0.2 +
                Math.random() * 0.5;

            z =
                Math.sin(angulo) *
                radio;
        }

        posiciones.setXYZ(
            i,
            x,
            y,
            z
        );
    }

    posiciones.needsUpdate =
        true;


    // --------------------------------------------------------
    // PULSO DE ENERGÍA
    // --------------------------------------------------------

    puntos.material.size =
        0.08 +
        Math.sin(
            tiempo * 8
        ) * 0.025;


    // Después de un tiempo,
    // disminuye la energía.

    if (tiempo > 4.5) {

        const opacidad =
            Math.max(
                0,
                1 -
                (tiempo - 4.5) /
                1.5
            );

        puntos.material.opacity =
            opacidad;
    }

    if (tiempo > 6) {

        energia.userData.activo =
            false;

        puntos.material.opacity =
            0;
    }
}


// ------------------------------------------------------------
// APERTURA VISUAL
// ------------------------------------------------------------

function actualizarAperturaHuevo(
    delta
) {

    const huevo =
        grupoHuevo.children.find(
            objeto =>
                objeto.name ===
                "HuevoCinematico"
        );

    if (!huevo) return;

    if (!huevo.userData.abriendo) {
        return;
    }

    huevo.userData.tiempo +=
        delta;

    const tiempo =
        huevo.userData.tiempo;


    // --------------------------------------------------------
    // PRIMER IMPACTO
    // --------------------------------------------------------

    if (tiempo < 0.7) {

        const golpe =
            Math.sin(
                tiempo * 28
            ) *
            (1 - tiempo / 0.7);

        huevo.rotation.z =
            golpe * 0.08;

        huevo.rotation.x =
            Math.cos(
                tiempo * 24
            ) *
            0.04;

        return;
    }


    // --------------------------------------------------------
    // FLASH
    // --------------------------------------------------------

    if (
        tiempo >= 0.7 &&
        !huevo.userData.abierto
    ) {

        huevo.userData.abierto =
            true;

        activarEnergiaHuevo();

        crearFlashHuevo();

        mostrarResultadoCinematica();
    }
}


// ------------------------------------------------------------
// FLASH DE APERTURA
// ------------------------------------------------------------

function crearFlashHuevo() {

    const geometria =
        new THREE.SphereGeometry(
            0.15,
            16,
            12
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xfff1b0,
            transparent: true,
            opacity: 0,
            depthWrite: false
        });

    const flash =
        new THREE.Mesh(
            geometria,
            material
        );

    flash.position.set(
        0,
        1.35,
        -3
    );

    flash.userData.tiempo =
        0;

    flash.userData.activo =
        true;

    grupoHuevo.add(
        flash
    );
}


// ------------------------------------------------------------
// ACTUALIZAR FLASH
// ------------------------------------------------------------

function actualizarFlashHuevo(
    delta
) {

    const flashes =
        grupoHuevo.children.filter(
            objeto =>
                objeto.userData &&
                objeto.userData.activo &&
                objeto.userData.tiempo !== undefined &&
                objeto.material &&
                objeto.material.transparent
        );

    flashes.forEach(
        flash => {

            flash.userData.tiempo +=
                delta;

            const tiempo =
                flash.userData.tiempo;

            const progreso =
                Math.min(
                    tiempo / 0.8,
                    1
                );

            const escala =
                0.2 +
                progreso * 4;

            flash.scale.setScalar(
                escala
            );

            flash.material.opacity =
                (1 - progreso) * 0.9;

            if (progreso >= 1) {

                flash.userData.activo =
                    false;

                flash.material.opacity =
                    0;
            }
        }
    );
}


// ------------------------------------------------------------
// ACTUALIZAR TODO EL HUEVO
// ------------------------------------------------------------

function actualizarEfectosHuevo(
    delta
) {

    actualizarHuevo(delta);

    actualizarAperturaHuevo(
        delta
    );

    actualizarEnergiaHuevo(
        delta
    );

    actualizarFlashHuevo(
        delta
    );
            }
// ============================================================
// BLOQUE 7/12
// POLLITO 3D + ANIMACIÓN
// ============================================================

// ------------------------------------------------------------
// CREAR MATERIAL
// ------------------------------------------------------------

function materialPollito(
    color
) {

    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0
    });
}


// ------------------------------------------------------------
// CREAR POLLITO PROCEDURAL
// ------------------------------------------------------------

function crearPollitoProcedural() {

    const grupo =
        new THREE.Group();

    grupo.name =
        "PollitoCinematico";

    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.65,
                20,
                16
            ),
            materialPollito(
                0xf4cf55
            )
        );

    cuerpo.scale.set(
        1,
        0.9,
        0.95
    );

    cuerpo.position.y =
        0.62;

    cuerpo.castShadow = true;
    cuerpo.receiveShadow = true;

    grupo.add(cuerpo);


    // --------------------------------------------------------
    // CABEZA
    // --------------------------------------------------------

    const cabeza =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                20,
                16
            ),
            materialPollito(
                0xffdf6b
            )
        );

    cabeza.position.set(
        0,
        1.15,
        0.08
    );

    cabeza.castShadow = true;

    grupo.add(cabeza);


    // --------------------------------------------------------
    // OJO IZQUIERDO
    // --------------------------------------------------------

    const materialOjo =
        new THREE.MeshStandardMaterial({
            color: 0x171717,
            roughness: 0.3
        });

    const ojoIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.055,
                12,
                8
            ),
            materialOjo
        );

    ojoIzq.position.set(
        -0.19,
        1.25,
        0.42
    );

    grupo.add(ojoIzq);


    // --------------------------------------------------------
    // OJO DERECHO
    // --------------------------------------------------------

    const ojoDer =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.055,
                12,
                8
            ),
            materialOjo
        );

    ojoDer.position.set(
        0.19,
        1.25,
        0.42
    );

    grupo.add(ojoDer);


    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.13,
                0.32,
                4
            ),
            materialPollito(
                0xe89532
            )
        );

    pico.rotation.x =
        Math.PI / 2;

    pico.position.set(
        0,
        1.13,
        0.48
    );

    grupo.add(pico);


    // --------------------------------------------------------
    // ALA IZQUIERDA
    // --------------------------------------------------------

    const alaIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.3,
                16,
                12
            ),
            materialPollito(
                0xe8bd45
            )
        );

    alaIzq.scale.set(
        0.45,
        0.8,
        0.28
    );

    alaIzq.position.set(
        -0.58,
        0.75,
        0
    );

    alaIzq.rotation.z =
        -0.25;

    alaIzq.castShadow = true;

    grupo.add(alaIzq);


    // --------------------------------------------------------
    // ALA DERECHA
    // --------------------------------------------------------

    const alaDer =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.3,
                16,
                12
            ),
            materialPollito(
                0xe8bd45
            )
        );

    alaDer.scale.set(
        0.45,
        0.8,
        0.28
    );

    alaDer.position.set(
        0.58,
        0.75,
        0
    );

    alaDer.rotation.z =
        0.25;

    alaDer.castShadow = true;

    grupo.add(alaDer);


    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    const materialPatas =
        materialPollito(
            0xe89532
        );

    const pataIzq =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.035,
                0.045,
                0.3,
                8
            ),
            materialPatas
        );

    pataIzq.position.set(
        -0.2,
        0.18,
        0
    );

    grupo.add(pataIzq);


    const pataDer =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.035,
                0.045,
                0.3,
                8
            ),
            materialPatas
        );

    pataDer.position.set(
        0.2,
        0.18,
        0
    );

    grupo.add(pataDer);


    // --------------------------------------------------------
    // ESTADO
    // --------------------------------------------------------

    grupo.userData.tiempo =
        0;

    grupo.userData.activo =
        false;

    grupo.userData.alaIzq =
        alaIzq;

    grupo.userData.alaDer =
        alaDer;

    grupo.userData.baseY =
        0;

    grupo.visible = false;


    grupo.position.set(
        0,
        0,
        -3
    );

    grupoResultado.add(
        grupo
    );

    return grupo;
}


// ------------------------------------------------------------
// CREAR RESULTADO
// ------------------------------------------------------------

function prepararResultado() {

    const creador =
        window.EGGARO_CREADOR_POLLO;

    if (
        typeof creador ===
        "function"
    ) {

        try {

            const externo =
                creador(
                    resultadoCinematica
                );

            if (externo) {

                grupoResultado.add(
                    externo
                );

                externo.visible =
                    false;

                externo.userData
                    .eggaroExterno = true;

                return externo;
            }

        } catch (error) {

            console.warn(
                "No se pudo usar el creador externo del pollo.",
                error
            );
        }
    }

    return crearPollitoProcedural();
}


// ------------------------------------------------------------
// MOSTRAR RESULTADO
// ------------------------------------------------------------

function mostrarResultadoCinematica() {

    const pollito =
        grupoResultado.children.find(
            objeto =>
                objeto.name ===
                "PollitoCinematico"
        );

    if (!pollito) return;

    pollito.visible =
        true;

    pollito.userData.activo =
        true;

    pollito.userData.tiempo =
        0;

    pollito.scale.setScalar(
        0.05
    );

    pollito.position.set(
        0,
        0.05,
        -3
    );
}


// ------------------------------------------------------------
// ANIMAR POLLITO
// ------------------------------------------------------------

function actualizarPollito(
    delta
) {

    const pollito =
        grupoResultado.children.find(
            objeto =>
                objeto.name ===
                "PollitoCinematico"
        );

    if (
        !pollito ||
        !pollito.userData.activo
    ) {
        return;
    }

    pollito.userData.tiempo +=
        delta;

    const tiempo =
        pollito.userData.tiempo;


    // --------------------------------------------------------
    // APARICIÓN
    // --------------------------------------------------------

    const entrada =
        Math.min(
            tiempo / 0.8,
            1
        );

    const suave =
        entrada *
        entrada *
        (3 - 2 * entrada);

    pollito.scale.setScalar(
        suave
    );


    // --------------------------------------------------------
    // SALTO
    // --------------------------------------------------------

    const salto =
        Math.abs(
            Math.sin(
                tiempo * 4
            )
        ) *
        0.22 *
        Math.min(
            tiempo * 2,
            1
        );

    pollito.position.y =
        0.05 +
        salto;


    // --------------------------------------------------------
    // MOVIMIENTO DE ALAS
    // --------------------------------------------------------

    const ala =
        Math.sin(
            tiempo * 11
        ) * 0.45;

    if (
        pollito.userData.alaIzq
    ) {

        pollito.userData.alaIzq
            .rotation.z =
            -0.25 - ala;
    }

    if (
        pollito.userData.alaDer
    ) {

        pollito.userData.alaDer
            .rotation.z =
            0.25 + ala;
    }


    // --------------------------------------------------------
    // PEQUEÑO GIRO
    // --------------------------------------------------------

    pollito.rotation.y =
        Math.sin(
            tiempo * 1.5
        ) * 0.12;
        }
// ============================================================
// BLOQUE 8/12
// CÁMARA CINEMATOGRÁFICA
// ============================================================

// ------------------------------------------------------------
// ESTADO DE CÁMARA
// ------------------------------------------------------------

const camaraCine = {

    objetivo: new THREE.Vector3(),

    posicionObjetivo:
        new THREE.Vector3(),

    mirarObjetivo:
        new THREE.Vector3(),

    tiempo: 0,

    fase: 0
};


// ------------------------------------------------------------
// SUAVIZAR VALOR
// ------------------------------------------------------------

function suavizar(
    actual,
    objetivo,
    velocidad,
    delta
) {

    return THREE.MathUtils.lerp(
        actual,
        objetivo,
        1 -
        Math.exp(
            -velocidad * delta
        )
    );
}


// ------------------------------------------------------------
// SUAVIZAR VECTOR
// ------------------------------------------------------------

function suavizarVector(
    actual,
    objetivo,
    velocidad,
    delta
) {

    actual.lerp(
        objetivo,
        1 -
        Math.exp(
            -velocidad * delta
        )
    );
}


// ------------------------------------------------------------
// POSICIÓN DE CÁMARA
// ------------------------------------------------------------

function colocarCamaraCine(
    posicion,
    objetivo,
    suavidad = 3
) {

    camaraCine.posicionObjetivo
        .copy(posicion);

    camaraCine.mirarObjetivo
        .copy(objetivo);

    camaraCine.suavidad =
        suavidad;
}


// ------------------------------------------------------------
// ACTUALIZAR CÁMARA
// ------------------------------------------------------------

function actualizarCamaraCine(
    delta
) {

    if (!camara) return;

    camaraCine.tiempo +=
        delta;

    // --------------------------------------------------------
    // FASE 0
    // PRESENTACIÓN DEL BOSQUE
    // --------------------------------------------------------

    if (
        camaraCine.fase === 0
    ) {

        const movimiento =
            Math.sin(
                camaraCine.tiempo *
                0.35
            );

        camaraCine.posicionObjetivo
            .set(
                movimiento * 2.2,
                5.2,
                15
            );

        camaraCine.mirarObjetivo
            .set(
                0,
                2.4,
                1
            );
    }


    // --------------------------------------------------------
    // FASE 1
    // SEGUIMIENTO DE PERSONAJES
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 1
    ) {

        const mx =
            mike
                ? mike.position.x
                : 0;

        const mz =
            mike
                ? mike.position.z
                : 5;

        const cx =
            micaela
                ? micaela.position.x
                : 0;

        const cz =
            micaela
                ? micaela.position.z
                : 5;

        const centroX =
            (mx + cx) * 0.5;

        const centroZ =
            (mz + cz) * 0.5;

        camaraCine.posicionObjetivo
            .set(
                centroX + 5.5,
                3.8,
                centroZ + 8
            );

        camaraCine.mirarObjetivo
            .set(
                centroX,
                1.8,
                centroZ - 1
            );
    }


    // --------------------------------------------------------
    // FASE 2
    // ACERCAMIENTO AL HUEVO
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 2
    ) {

        const movimiento =
            Math.sin(
                camaraCine.tiempo *
                0.8
            );

        camaraCine.posicionObjetivo
            .set(
                4.5 +
                movimiento * 0.35,
                2.7,
                2.2
            );

        camaraCine.mirarObjetivo
            .set(
                0,
                1.25,
                -3
            );
    }


    // --------------------------------------------------------
    // FASE 3
    // HUEVO / APERTURA
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 3
    ) {

        const movimiento =
            Math.sin(
                camaraCine.tiempo *
                1.2
            );

        camaraCine.posicionObjetivo
            .set(
                3.0 +
                movimiento * 0.18,
                2.1,
                0.7
            );

        camaraCine.mirarObjetivo
            .set(
                0,
                1.25,
                -3
            );
    }


    // --------------------------------------------------------
    // FASE 4
    // RESULTADO
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 4
    ) {

        const movimiento =
            Math.sin(
                camaraCine.tiempo *
                0.7
            );

        camaraCine.posicionObjetivo
            .set(
                3.4 +
                movimiento * 0.4,
                2.4,
                1.4
            );

        camaraCine.mirarObjetivo
            .set(
                0,
                1.1,
                -3
            );
    }


    // --------------------------------------------------------
    // FASE FINAL
    // --------------------------------------------------------

    else {

        camaraCine.posicionObjetivo
            .set(
                0,
                4.0,
                11
            );

        camaraCine.mirarObjetivo
            .set(
                0,
                1.7,
                -1
            );
    }


    // --------------------------------------------------------
    // MOVIMIENTO SUAVE
    // --------------------------------------------------------

    suavizarVector(
        camara.position,
        camaraCine.posicionObjetivo,
        3.2,
        delta
    );


    // --------------------------------------------------------
    // MIRADA SUAVE
    // --------------------------------------------------------

    suavizarVector(
        camaraCine.mirarObjetivo,
        camaraCine.mirarObjetivo,
        1,
        delta
    );

    camara.lookAt(
        camaraCine.mirarObjetivo
    );
}


// ------------------------------------------------------------
// CAMBIAR FASE DE CÁMARA
// ------------------------------------------------------------

function cambiarFaseCamara(
    fase
) {

    camaraCine.fase =
        fase;

    camaraCine.tiempo =
        0;
        }
// ============================================================
// BLOQUE 9/12
// DIÁLOGOS + SUBTÍTULOS
// ============================================================

let dialogoActual = null;
let dialogoElemento = null;
let dialogoNombre = null;


// ------------------------------------------------------------
// CREAR INTERFAZ
// ------------------------------------------------------------

function crearInterfazDialogo() {

    if (
        document.getElementById(
            "eggaro-dialogo-cine"
        )
    ) {
        return;
    }

    const contenedor =
        document.createElement("div");

    contenedor.id =
        "eggaro-dialogo-cine";

    contenedor.style.position =
        "fixed";

    contenedor.style.left =
        "50%";

    contenedor.style.bottom =
        "7%";

    contenedor.style.transform =
        "translateX(-50%)";

    contenedor.style.width =
        "min(90%, 760px)";

    contenedor.style.padding =
        "16px 20px";

    contenedor.style.boxSizing =
        "border-box";

    contenedor.style.background =
        "rgba(10,15,12,0.82)";

    contenedor.style.border =
        "2px solid rgba(255,255,255,0.25)";

    contenedor.style.borderRadius =
        "18px";

    contenedor.style.backdropFilter =
        "blur(6px)";

    contenedor.style.color =
        "white";

    contenedor.style.fontFamily =
        "Arial, sans-serif";

    contenedor.style.zIndex =
        "100";

    contenedor.style.opacity =
        "0";

    contenedor.style.transition =
        "opacity 0.25s ease";

    document.body.appendChild(
        contenedor
    );


    const nombre =
        document.createElement("div");

    nombre.id =
        "eggaro-dialogo-nombre";

    nombre.style.fontSize =
        "18px";

    nombre.style.fontWeight =
        "bold";

    nombre.style.marginBottom =
        "6px";

    contenedor.appendChild(
        nombre
    );


    const texto =
        document.createElement("div");

    texto.id =
        "eggaro-dialogo-texto";

    texto.style.fontSize =
        "17px";

    texto.style.lineHeight =
        "1.4";

    contenedor.appendChild(
        texto
    );


    dialogoElemento =
        contenedor;

    dialogoNombre =
        nombre;
}


// ------------------------------------------------------------
// MOSTRAR DIÁLOGO
// ------------------------------------------------------------

function mostrarDialogo(
    personaje,
    texto
) {

    crearInterfazDialogo();

    dialogoActual = {
        personaje,
        texto
    };

    dialogoNombre.textContent =
        personaje;

    document.getElementById(
        "eggaro-dialogo-texto"
    ).textContent =
        texto;

    dialogoElemento.style.opacity =
        "1";
}


// ------------------------------------------------------------
// OCULTAR DIÁLOGO
// ------------------------------------------------------------

function ocultarDialogo() {

    if (!dialogoElemento) {
        return;
    }

    dialogoElemento.style.opacity =
        "0";

    dialogoActual =
        null;
}


// ------------------------------------------------------------
// SECUENCIA DE DIÁLOGOS
// ------------------------------------------------------------

const dialogosCinematica = [

    {
        inicio: 2,
        fin: 5,
        personaje: "Mike",
        texto:
            "Micaela... mira ese bosque."
    },

    {
        inicio: 5,
        fin: 8,
        personaje: "Micaela",
        texto:
            "Espera... ¿viste eso?"
    },

    {
        inicio: 8,
        fin: 11,
        personaje: "Mike",
        texto:
            "Hay algo brillando entre los árboles."
    },

    {
        inicio: 11,
        fin: 14,
        personaje: "Micaela",
        texto:
            "¡Es un huevo!"
    },

    {
        inicio: 14,
        fin: 17,
        personaje: "Mike",
        texto:
            "Acércate. Vamos a descubrir qué hay dentro."
    },

    {
        inicio: 17,
        fin: 20,
        personaje: "Micaela",
        texto:
            "Está empezando a moverse..."
    },

    {
        inicio: 20,
        fin: 23,
        personaje: "Mike",
        texto:
            "¡Mira!"
    }
];


// ------------------------------------------------------------
// ACTUALIZAR DIÁLOGOS
// ------------------------------------------------------------

function actualizarDialogos(
    tiempo
) {

    let encontrado = null;

    for (
        const dialogo of
        dialogosCinematica
    ) {

        if (
            tiempo >= dialogo.inicio &&
            tiempo < dialogo.fin
        ) {

            encontrado =
                dialogo;

            break;
        }
    }


    if (!encontrado) {

        ocultarDialogo();

        return;
    }


    if (
        !dialogoActual ||
        dialogoActual.texto !==
            encontrado.texto
    ) {

        mostrarDialogo(
            encontrado.personaje,
            encontrado.texto
        );
    }
}


// ------------------------------------------------------------
// OCULTAR TODO AL TERMINAR
// ------------------------------------------------------------

function destruirInterfazDialogo() {

    const elemento =
        document.getElementById(
            "eggaro-dialogo-cine"
        );

    if (elemento) {

        elemento.remove();
    }

    dialogoElemento =
        null;

    dialogoNombre =
        null;

    dialogoActual =
        null;
        }
// ============================================================
// BLOQUE 10/12
// SECUENCIA PRINCIPAL DE LA CINEMÁTICA
// ============================================================

let tiempoCinematica = 0;
let faseCinematica = -1;
let secuenciaIniciada = false;

const FASE = {
    BOSQUE: 0,
    CAMINATA: 1,
    HUEVO: 2,
    APERTURA: 3,
    RESULTADO: 4,
    FINAL: 5
};


// ------------------------------------------------------------
// INICIAR SECUENCIA
// ------------------------------------------------------------

function iniciarSecuenciaCinematica() {

    tiempoCinematica = 0;
    faseCinematica = FASE.BOSQUE;
    secuenciaIniciada = true;
    cinematicaFinalizada = false;

    if (mike) {
        detenerCaminata(mike);

        mike.position.set(-1.25, 0, 8);
        mike.rotation.y = Math.PI;
    }

    if (micaela) {
        detenerCaminata(micaela);

        micaela.position.set(1.25, 0, 8.8);
        micaela.rotation.y = Math.PI;
    }

    if (grupoHuevo) {
        grupoHuevo.visible = true;
    }

    if (grupoResultado) {
        grupoResultado.visible = true;
    }

    if (grupoHuevo) {
        grupoHuevo.position.set(0, 0, 0);
    }

    if (grupoResultado) {
        grupoResultado.position.set(0, 0, 0);
    }

    if (typeof aplicarPoseReposo === "function") {
        aplicarPoseReposo(mike);
        aplicarPoseReposo(micaela);
    }

    cambiarFaseCamara(0);
}


// ------------------------------------------------------------
// CAMBIO DE FASE
// ------------------------------------------------------------

function cambiarFaseCinematica(nuevaFase) {

    faseCinematica = nuevaFase;

    switch (nuevaFase) {

        case FASE.BOSQUE:

            if (mike) detenerCaminata(mike);
            if (micaela) detenerCaminata(micaela);

            cambiarFaseCamara(0);

            break;


        case FASE.CAMINATA:

            if (mike) {
                iniciarCaminata(mike, 0.2);
            }

            if (micaela) {
                iniciarCaminata(micaela, 0.2);
            }

            cambiarFaseCamara(1);

            break;


        case FASE.HUEVO:

            if (mike) detenerCaminata(mike);
            if (micaela) detenerCaminata(micaela);

            activarHuevo();

            cambiarFaseCamara(2);

            break;


        case FASE.APERTURA:

            if (mike) detenerCaminata(mike);
            if (micaela) detenerCaminata(micaela);

            abrirHuevo();

            cambiarFaseCamara(3);

            break;


        case FASE.RESULTADO:

            if (mike) detenerCaminata(mike);
            if (micaela) detenerCaminata(micaela);

            mostrarResultadoCinematica();

            cambiarFaseCamara(4);

            break;


        case FASE.FINAL:

            if (mike) detenerCaminata(mike);
            if (micaela) detenerCaminata(micaela);

            ocultarDialogo();

            cambiarFaseCamara(5);

            cinematicaFinalizada = true;

            break;
    }
}


// ------------------------------------------------------------
// ACTUALIZAR SECUENCIA
// ------------------------------------------------------------

function actualizarSecuenciaCinematica(delta) {

    if (!secuenciaIniciada) return;

    tiempoCinematica += delta;


    // --------------------------------------------------------
    // 0 — PRESENTACIÓN DEL BOSQUE
    // --------------------------------------------------------

    if (
        faseCinematica === FASE.BOSQUE &&
        tiempoCinematica >= 3
    ) {

        cambiarFaseCinematica(FASE.CAMINATA);
    }


    // --------------------------------------------------------
    // 1 — MIKE Y MICAELA CAMINAN
    // --------------------------------------------------------

    if (
        faseCinematica === FASE.CAMINATA &&
        mike &&
        micaela
    ) {

        const mikeListo =
            Math.abs(mike.position.z - 0.2) < 0.08;

        const micaelaLista =
            Math.abs(micaela.position.z - 0.2) < 0.08;

        if (mikeListo && micaelaLista) {

            detenerCaminata(mike);
            detenerCaminata(micaela);

            cambiarFaseCinematica(FASE.HUEVO);
        }
    }


    // --------------------------------------------------------
    // 2 — OBSERVAN EL HUEVO
    // --------------------------------------------------------

    if (
        faseCinematica === FASE.HUEVO &&
        tiempoCinematica >= 5
    ) {

        cambiarFaseCinematica(FASE.APERTURA);
    }


    // --------------------------------------------------------
    // 3 — HUEVO SE ABRE
    // --------------------------------------------------------

    if (
        faseCinematica === FASE.APERTURA &&
        grupoResultado
    ) {

        const pollito =
            grupoResultado.getObjectByName("PollitoCinematico");

        if (
            pollito &&
            pollito.userData &&
            pollito.userData.activo
        ) {

            cambiarFaseCinematica(FASE.RESULTADO);
        }
    }


    // --------------------------------------------------------
    // 4 — RESULTADO
    // --------------------------------------------------------

    if (
        faseCinematica === FASE.RESULTADO &&
        tiempoCinematica >= 7
    ) {

        cambiarFaseCinematica(FASE.FINAL);
    }
}


// ------------------------------------------------------------
// ACTUALIZACIÓN GENERAL DE PERSONAJES
// ------------------------------------------------------------

function actualizarTodoCinematica(delta) {

    actualizarPersonajes(delta);

    actualizarEfectosHuevo(delta);

    actualizarPollito(delta);

    actualizarCamaraCine(delta);

    actualizarDialogos(tiempoCinematica);

    actualizarSecuenciaCinematica(delta);
}


// ------------------------------------------------------------
// REEMPLAZAR EL ACTUALIZADOR PRINCIPAL
// ------------------------------------------------------------

function actualizarCinematica(delta) {

    if (!activa) return;

    actualizarTodoCinematica(delta);
}


// ------------------------------------------------------------
// INICIO PÚBLICO
// ------------------------------------------------------------

export async function iniciarCinematica(resultado = "noob") {

    resultadoCinematica =
        String(resultado || "noob").toLowerCase();

    activa = true;
    cinematicaFinalizada = false;
    secuenciaIniciada = false;

    crearEscena();
    crearCamara();
    crearRenderer();
    crearIluminacion();

    crearInterfazDialogo();

    crearBosque();

    prepararHuevo();

    // Importante: crear también la energía desde el inicio.
    crearEnergiaHuevo();

    prepararResultado();

    await cargarPersonajes();

    iniciarSecuenciaCinematica();

    reloj = new THREE.Clock();

    renderizar();
}


// ------------------------------------------------------------
// DETENER CINEMÁTICA
// ------------------------------------------------------------

export function detenerCinematica() {

    activa = false;
    secuenciaIniciada = false;

    ocultarDialogo();

    if (renderer) {
        renderer.setAnimationLoop(null);
    }

    if (renderer && renderer.domElement) {
        renderer.domElement.remove();
    }

    destruirInterfazDialogo();

    if (renderer) {
        renderer.dispose();
    }

    renderer = null;
    escena = null;
    camara = null;
    reloj = null;
}


// ------------------------------------------------------------
// ESTADO DE LA CINEMÁTICA
// ------------------------------------------------------------

export function cinematicaTerminada() {

    return cinematicaFinalizada;
}


// ------------------------------------------------------------
// CAMBIAR RESULTADO DESDE EL JUEGO
// ------------------------------------------------------------

export function establecerResultadoCinematica(resultado) {

    const valor =
        String(resultado || "noob")
        .toLowerCase()
        .trim();

    if (
        valor === "pollito_noob" ||
        valor === "pollito noob" ||
        valor === "pollitonoob"
    ) {

        resultadoCinematica = "pollitonoob";

    } else if (
        valor === "zombie"
    ) {

        resultadoCinematica = "zombie";

    } else {

        resultadoCinematica = "noob";
    }
}
// ============================================================
// BLOQUE 11/12
// RESULTADO DEL HUEVO + POLLITO
// ============================================================


// ------------------------------------------------------------
// BUSCAR CUALQUIER RESULTADO DISPONIBLE
// ------------------------------------------------------------

function obtenerObjetoResultado() {

    if (!grupoResultado) return null;

    let objeto =
        grupoResultado.getObjectByName("PollitoCinematico");

    if (objeto) return objeto;

    let encontrado = null;

    grupoResultado.traverse(obj => {

        if (encontrado) return;

        if (
            obj.userData &&
            obj.userData.eggaroPollito === true
        ) {
            encontrado = obj;
        }
    });

    return encontrado;
}


// ------------------------------------------------------------
// MOSTRAR RESULTADO
// ------------------------------------------------------------

function mostrarResultadoCinematica() {

    if (!grupoResultado) return;

    grupoResultado.visible = true;

    const pollito =
        obtenerObjetoResultado();

    if (!pollito) {

        prepararResultado();

        const nuevoPollito =
            obtenerObjetoResultado();

        if (nuevoPollito) {

            activarObjetoPollito(nuevoPollito);

        }

        return;
    }

    activarObjetoPollito(pollito);
}


// ------------------------------------------------------------
// ACTIVAR POLLITO
// ------------------------------------------------------------

function activarObjetoPollito(objeto) {

    if (!objeto) return;

    objeto.visible = true;

    objeto.userData.activo = true;
    objeto.userData.eggaroPollito = true;

    objeto.position.set(
        0,
        0.15,
        -3
    );

    objeto.scale.set(
        0.01,
        0.01,
        0.01
    );

    objeto.rotation.set(
        0,
        0,
        0
    );

    objeto.userData.tiempo = 0;

    objeto.traverse(parte => {

        if (!parte) return;

        parte.visible = true;

        if (parte.material) {

            if (Array.isArray(parte.material)) {

                parte.material.forEach(material => {

                    if (material) {
                        material.transparent = false;
                        material.opacity = 1;
                    }

                });

            } else {

                parte.material.transparent = false;
                parte.material.opacity = 1;
            }
        }
    });
}


// ------------------------------------------------------------
// RESULTADO EXTERNO
// ------------------------------------------------------------

function activarResultadoExterno(objeto) {

    if (!objeto) return;

    objeto.name =
        objeto.name ||
        "PollitoCinematico";

    objeto.userData.eggaroPollito = true;
    objeto.userData.activo = false;
    objeto.userData.eggaroExterno = true;
    objeto.userData.tiempo = 0;

    objeto.visible = false;

    objeto.position.set(
        0,
        0,
        -3
    );

    grupoResultado.add(objeto);
}


// ------------------------------------------------------------
// PREPARAR RESULTADO — VERSIÓN SEGURA
// ------------------------------------------------------------

function prepararResultado() {

    if (!grupoResultado) return;

    // Limpiar solamente resultados creados por esta cinemática.
    const borrar = [];

    grupoResultado.children.forEach(obj => {

        if (
            obj.userData &&
            (
                obj.userData.eggaroPollito ||
                obj.userData.eggaroExterno
            )
        ) {

            borrar.push(obj);
        }
    });

    borrar.forEach(obj => {

        grupoResultado.remove(obj);
    });


    // --------------------------------------------------------
    // INTENTAR USAR EL CREADOR DEL JUEGO
    // --------------------------------------------------------

    if (
        typeof window !== "undefined" &&
        typeof window.EGGARO_CREADOR_POLLO === "function"
    ) {

        try {

            const externo =
                window.EGGARO_CREADOR_POLLO(
                    resultadoCinematica
                );

            if (externo) {

                activarResultadoExterno(externo);

                return;
            }

        } catch (error) {

            console.warn(
                "EGGARO: no se pudo usar el creador externo del pollito.",
                error
            );
        }
    }


    // --------------------------------------------------------
    // FALLBACK 3D
    // --------------------------------------------------------

    crearPollitoProcedural();
}


// ------------------------------------------------------------
// ANIMACIÓN DEL RESULTADO
// ------------------------------------------------------------

function actualizarPollito(delta) {

    if (!grupoResultado) return;

    grupoResultado.traverse(objeto => {

        if (
            !objeto.userData ||
            !objeto.userData.eggaroPollito ||
            !objeto.userData.activo
        ) {
            return;
        }

        objeto.userData.tiempo =
            (objeto.userData.tiempo || 0) + delta;

        const t =
            objeto.userData.tiempo;


        // ----------------------------------------------------
        // ENTRADA DEL POLLITO
        // ----------------------------------------------------

        const entrada =
            Math.min(t / 0.8, 1);

        const escala =
            entrada * entrada * (3 - 2 * entrada);

        objeto.scale.setScalar(
            Math.max(0.01, escala)
        );


        // ----------------------------------------------------
        // SALTO SUAVE
        // ----------------------------------------------------

        const salto =
            Math.sin(t * 4.5) *
            0.10 *
            Math.exp(-t * 0.10);

        objeto.position.y =
            0.15 + Math.max(0, salto);


        // ----------------------------------------------------
        // MOVIMIENTO DEL CUERPO
        // ----------------------------------------------------

        objeto.rotation.y =
            Math.sin(t * 1.8) * 0.12;


        objeto.rotation.z =
            Math.sin(t * 3.5) * 0.035;


        // ----------------------------------------------------
        // ANIMAR ALAS SI EXISTEN
        // ----------------------------------------------------

        objeto.traverse(parte => {

            if (!parte || !parte.name) return;

            const nombre =
                limpiarNombreHueso(parte.name);


            if (
                nombre.includes("ala") ||
                nombre.includes("wing")
            ) {

                const lado =
                    nombre.includes("left") ||
                    nombre.includes("izq") ||
                    nombre.includes("l");

                const signo =
                    lado ? 1 : -1;

                parte.rotation.z =
                    signo *
                    (
                        0.18 +
                        Math.sin(t * 8) * 0.12
                    );
            }
        });
    });
}


// ------------------------------------------------------------
// MENSAJE FINAL
// ------------------------------------------------------------

function mostrarDialogoFinal() {

    if (resultadoCinematica === "zombie") {

        mostrarDialogo(
            "Mike",
            "¡Oh no! ¿Qué salió de ese huevo?"
        );

    } else {

        mostrarDialogo(
            "Micaela",
            "¡Mira! ¡Es un pollito!"
        );
    }
}
// ============================================================
// BLOQUE 12/12
// ARRANQUE FINAL + RESIZE + LOOP
// ============================================================


// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

function manejarResize() {

    if (!renderer || !camara) return;

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

    anchoAnterior = ancho;
    altoAnterior = alto;

    camara.aspect =
        ancho / alto;

    camara.updateProjectionMatrix();

    renderer.setSize(
        ancho,
        alto,
        false
    );
}


// ------------------------------------------------------------
// LOOP PRINCIPAL
// ------------------------------------------------------------

function iniciarLoopCinematica() {

    if (!renderer) return;

    renderer.setAnimationLoop(() => {

        if (!activa) return;

        if (!reloj) {
            reloj = new THREE.Clock();
        }

        const delta =
            Math.min(
                reloj.getDelta(),
                0.033
            );

        manejarResize();

        actualizarCinematica(delta);

        renderer.render(
            escena,
            camara
        );
    });
}


// ------------------------------------------------------------
// REEMPLAZAR EL RENDERIZADO ANTERIOR
// ------------------------------------------------------------

function renderizar() {

    manejarResize();

    iniciarLoopCinematica();
}


// ------------------------------------------------------------
// ARRANQUE SEGURO
// ------------------------------------------------------------

async function arrancarCinematicaInterna(
    resultado = "noob"
) {

    if (activa) return;

    resultadoCinematica =
        String(resultado || "noob")
        .toLowerCase()
        .trim();

    activa = true;
    cinematicaFinalizada = false;
    tiempoCinematica = 0;
    faseCinematica = -1;

    crearEscena();

    crearCamara();

    crearRenderer();

    crearIluminacion();

    crearInterfazDialogo();

    crearBosque();

    prepararHuevo();

    // Crear partículas de energía antes de abrir el huevo.
    crearEnergiaHuevo();

    prepararResultado();

    await cargarPersonajes();

    iniciarSecuenciaCinematica();

    reloj =
        new THREE.Clock();

    manejarResize();

    renderizar();
}


// ------------------------------------------------------------
// EXPORTACIÓN FINAL
// ------------------------------------------------------------

export {
    iniciarCinematica,
    cinematicaTerminada,
    detenerCinematica,
    establecerResultadoCinematica
};


// ------------------------------------------------------------
// EVITAR DOBLE RESIZE
// ------------------------------------------------------------

window.addEventListener(
    "resize",
    manejarResize,
    { passive: true }
);


// ------------------------------------------------------------
// COMPATIBILIDAD CON EL JUEGO
// ------------------------------------------------------------

if (
    typeof window !== "undefined"
) {

    window.EGGARO_CINEMATICA = {

        iniciar: arrancarCinematicaInterna,

        detener: detenerCinematica,

        terminada: cinematicaTerminada,

        resultado:
            establecerResultadoCinematica
    };
}
