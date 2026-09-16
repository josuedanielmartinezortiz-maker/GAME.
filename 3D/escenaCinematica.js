// ============================================================
// EGGARO / GAMERPRO
// escenaCinematica.js
// CINEMÁTICA 3D LIMPIA
// BLOQUE 1/10
// ============================================================

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


// ============================================================
// ESTADO
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
let cinematicaFinalizada = false;

let resultadoCinematica = "noob";

let tiempoCinematica = 0;
let faseCinematica = 0;

let anchoAnterior = 0;
let altoAnterior = 0;


// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {

    colorCielo: 0x9fc5d8,

    colorSuelo: 0x526b45,

    velocidadPersonajes: 1.35,

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
// CREAR ESCENA
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
            0.018
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
        4.5,
        15
    );

    camara.lookAt(
        0,
        2,
        0
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
            0xbfdcff,
            0x35452c,
            2.2
        );


    escena.add(
        ambiente
    );


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


    sol.shadow.mapSize.width =
        2048;

    sol.shadow.mapSize.height =
        2048;


    sol.shadow.camera.near =
        1;

    sol.shadow.camera.far =
        100;


    sol.shadow.camera.left =
        -35;

    sol.shadow.camera.right =
        35;

    sol.shadow.camera.top =
        35;

    sol.shadow.camera.bottom =
        -35;


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
// BLOQUE 2/10
// BOSQUE 3D
// ============================================================

function crearSuelo() {

    const geometria =
        new THREE.PlaneGeometry(
            90,
            90,
            32,
            32
        );

    geometria.rotateX(
        -Math.PI / 2
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

        const z =
            posiciones.getZ(i);


        const desnivel =
            Math.sin(x * 0.12) * 0.12 +
            Math.cos(z * 0.15) * 0.10;


        posiciones.setY(
            i,
            desnivel
        );
    }


    posiciones.needsUpdate = true;

    geometria.computeVertexNormals();


    const material =
        new THREE.MeshStandardMaterial({
            color: CONFIG.colorSuelo,
            roughness: 1,
            metalness: 0
        });


    const suelo =
        new THREE.Mesh(
            geometria,
            material
        );


    suelo.receiveShadow = true;

    suelo.position.y = -0.04;


    grupoBosque.add(
        suelo
    );
}


// ------------------------------------------------------------
// TRONCO
// ------------------------------------------------------------

function crearTroncoPino(
    altura = 4
) {

    const geometria =
        new THREE.CylinderGeometry(
            0.22,
            0.38,
            altura,
            8
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x62432d,
            roughness: 1
        });


    const tronco =
        new THREE.Mesh(
            geometria,
            material
        );


    tronco.castShadow = true;
    tronco.receiveShadow = true;

    tronco.position.y =
        altura / 2;


    return tronco;
}


// ------------------------------------------------------------
// COPA DEL PINO
// ------------------------------------------------------------

function crearCopaPino(
    radio,
    altura,
    y,
    color
) {

    const geometria =
        new THREE.ConeGeometry(
            radio,
            altura,
            9
        );


    const material =
        new THREE.MeshStandardMaterial({
            color,
            roughness: 0.95
        });


    const copa =
        new THREE.Mesh(
            geometria,
            material
        );


    copa.position.y =
        y;


    copa.castShadow = true;
    copa.receiveShadow = true;


    return copa;
}


// ------------------------------------------------------------
// PINO COMPLETO
// ------------------------------------------------------------

function crearPino(
    escala = 1
) {

    const pino =
        new THREE.Group();


    const tronco =
        crearTroncoPino(
            3.8 * escala
        );


    pino.add(
        tronco
    );


    pino.add(
        crearCopaPino(
            2.5 * escala,
            3.2 * escala,
            3.4 * escala,
            0x315d38
        )
    );


    pino.add(
        crearCopaPino(
            2.05 * escala,
            3.0 * escala,
            5.0 * escala,
            0x3d7043
        )
    );


    pino.add(
        crearCopaPino(
            1.55 * escala,
            2.7 * escala,
            6.35 * escala,
            0x4b8050
        )
    );


    pino.rotation.y =
        Math.random() *
        Math.PI *
        2;


    return pino;
}


// ------------------------------------------------------------
// PASTO
// ------------------------------------------------------------

function crearPasto() {

    const grupo =
        new THREE.Group();


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const geometria =
            new THREE.ConeGeometry(
                0.035,
                0.28 +
                Math.random() * 0.15,
                4
            );


        const material =
            new THREE.MeshStandardMaterial({
                color:
                    0x668d4c,
                roughness: 1
            });


        const hierba =
            new THREE.Mesh(
                geometria,
                material
            );


        hierba.position.set(
            (Math.random() - 0.5) * 0.45,
            0.14,
            (Math.random() - 0.5) * 0.45
        );


        hierba.rotation.z =
            (Math.random() - 0.5) * 0.5;


        hierba.castShadow = true;

        grupo.add(
            hierba
        );
    }


    return grupo;
}


// ------------------------------------------------------------
// PIEDRA
// ------------------------------------------------------------

function crearPiedra() {

    const geometria =
        new THREE.DodecahedronGeometry(
            0.25 +
            Math.random() * 0.3,
            0
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x77756d,
            roughness: 1
        });


    const piedra =
        new THREE.Mesh(
            geometria,
            material
        );


    piedra.scale.y =
        0.55;


    piedra.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );


    piedra.castShadow = true;
    piedra.receiveShadow = true;


    return piedra;
}


// ------------------------------------------------------------
// BOSQUE COMPLETO
// ------------------------------------------------------------

function crearBosque() {

    crearSuelo();


    // Pinos
    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const pino =
            crearPino(
                0.75 +
                Math.random() * 0.55
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


        grupoBosque.add(
            pino
        );
    }


    // Pasto
    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const pasto =
            crearPasto();


        pasto.position.set(
            (Math.random() - 0.5) * 70,
            0,
            (Math.random() - 0.5) * 70
        );


        grupoBosque.add(
            pasto
        );
    }


    // Piedras
    for (
        let i = 0;
        i < 25;
        i++
    ) {

        const piedra =
            crearPiedra();


        piedra.position.set(
            (Math.random() - 0.5) * 65,
            0.15,
            (Math.random() - 0.5) * 65
        );


        grupoBosque.add(
            piedra
        );
    }
        }
// ============================================================
// BLOQUE 3/10
// PERSONAJES Y RIG PROCEDURAL
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


// ------------------------------------------------------------
// GUARDAR POSE ORIGINAL
// ------------------------------------------------------------

function prepararHuesos(
    personaje
) {

    personaje.traverse(
        objeto => {

            if (!objeto.isBone) {
                return;
            }


            objeto.userData
                .eggaroRestQuaternion =
                objeto.quaternion.clone();


            objeto.userData
                .eggaroRestPosition =
                objeto.position.clone();


            objeto.userData
                .eggaroNombre =
                limpiarNombreHueso(
                    objeto.name
                );
        }
    );
}


// ------------------------------------------------------------
// BUSCAR HUESO
// ------------------------------------------------------------

function buscarHueso(
    personaje,
    nombres
) {

    const buscados =
        nombres.map(
            limpiarNombreHueso
        );


    let resultado = null;


    personaje.traverse(
        objeto => {

            if (
                resultado ||
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

                resultado = objeto;
            }
        }
    );


    return resultado;
}


// ------------------------------------------------------------
// OBTENER RIG
// ------------------------------------------------------------

function obtenerRig(
    personaje
) {

    return {

        pelvis: buscarHueso(
            personaje,
            [
                "pelvis",
                "hips",
                "hip",
                "root"
            ]
        ),

        spine: buscarHueso(
            personaje,
            [
                "spine",
                "spine1",
                "spine2",
                "torso"
            ]
        ),

        neck: buscarHueso(
            personaje,
            [
                "neck",
                "cuello"
            ]
        ),

        head: buscarHueso(
            personaje,
            [
                "head",
                "cabeza"
            ]
        ),

        piernaIzq: buscarHueso(
            personaje,
            [
                "thighl",
                "leftthigh",
                "leftupleg",
                "uplegl",
                "legl"
            ]
        ),

        piernaDer: buscarHueso(
            personaje,
            [
                "thighr",
                "rightthigh",
                "rightupleg",
                "uplegr",
                "legr"
            ]
        ),

        pieIzq: buscarHueso(
            personaje,
            [
                "footl",
                "leftfoot",
                "leftankle"
            ]
        ),

        pieDer: buscarHueso(
            personaje,
            [
                "footr",
                "rightfoot",
                "rightankle"
            ]
        ),

        brazoIzq: buscarHueso(
            personaje,
            [
                "arml",
                "leftarm",
                "leftupperarm"
            ]
        ),

        brazoDer: buscarHueso(
            personaje,
            [
                "armr",
                "rightarm",
                "rightupperarm"
            ]
        ),

        antebrazoIzq: buscarHueso(
            personaje,
            [
                "forearml",
                "leftforearm",
                "leftlowerarm"
            ]
        ),

        antebrazoDer: buscarHueso(
            personaje,
            [
                "forearmr",
                "rightforearm",
                "rightlowerarm"
            ]
        )
    };
}


// ------------------------------------------------------------
// ROTACIÓN RELATIVA
// ------------------------------------------------------------

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
            .eggaroRestQuaternion;


    if (!rest) {
        return;
    }


    hueso.quaternion.copy(
        rest
    );


    const q =
        new THREE.Quaternion()
            .setFromAxisAngle(
                eje,
                angulo
            );


    hueso.quaternion.multiply(
        q
    );
}


// ------------------------------------------------------------
// PREPARAR PERSONAJE
// ------------------------------------------------------------

function prepararPersonaje(
    objeto,
    nombre
) {

    prepararHuesos(
        objeto
    );


    objeto.userData
        .eggaroNombre =
        nombre;


    objeto.userData
        .eggaroRig =
        obtenerRig(
            objeto
        );


    objeto.userData
        .eggaroCaminando =
        false;


    objeto.userData
        .eggaroTiempo =
        0;


    objeto.userData
        .eggaroDestinoZ =
        objeto.position.z;


    objeto.userData
        .eggaroBaseY =
        objeto.position.y;


    objeto.traverse(
        parte => {

            if (
                parte.isMesh
            ) {

                parte.castShadow =
                    true;

                parte.receiveShadow =
                    true;
            }
        }
    );


    return objeto;
}


// ------------------------------------------------------------
// CARGAR PERSONAJE
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
                        prepararPersonaje(
                            gltf.scene,
                            nombre
                        );


                    resolve(
                        objeto
                    );
                },

                undefined,

                error => {

                    console.error(
                        "EGGARO: error cargando",
                        ruta,
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


    } catch (error) {

        console.error(
            "EGGARО: no se pudieron cargar Mike/Micaela.",
            error
        );

        mike = null;
        micaela = null;
    }
        }
// ============================================================
// BLOQUE 4/10
// ANIMACIÓN PROCEDURAL DE CAMINATA
// ============================================================

function iniciarCaminata(
    personaje,
    destinoZ
) {

    if (!personaje) {
        return;
    }


    personaje.userData
        .eggarCaminando =
        true;


    personaje.userData
        .eggarDestinoZ =
        destinoZ;
}


function detenerCaminata(
    personaje
) {

    if (!personaje) {
        return;
    }


    personaje.userData
        .eggarCaminando =
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

    if (!personaje) {
        return;
    }


    const rig =
        personaje.userData
            .eggarRig;


    if (!rig) {
        return;
    }


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


    Object.values(rig)
        .forEach(hueso => {

            if (hueso) {

                const rest =
                    hueso.userData
                        .eggaroRestQuaternion;

                if (rest) {
                    hueso.quaternion.copy(
                        rest
                    );
                }
            }
        });
}


// ------------------------------------------------------------
// ACTUALIZAR CAMINATA
// ------------------------------------------------------------

function actualizarCaminata(
    personaje,
    delta
) {

    if (!personaje) {
        return;
    }


    const datos =
        personaje.userData;


    const rig =
        datos.eggarRig;


    if (!rig) {
        return;
    }


    if (!datos.eggarCaminando) {

        aplicarPoseReposo(
            personaje
        );

        return;
    }


    const distancia =
        datos.eggarDestinoZ -
        personaje.position.z;


    const direccion =
        Math.sign(
            distancia
        );


    const movimiento =
        CONFIG.velocidadPersonajes *
        delta;


    if (
        Math.abs(distancia) <=
        movimiento
    ) {

        personaje.position.z =
            datos.eggarDestinoZ;


        datos.eggarCaminando =
            false;


        aplicarPoseReposo(
            personaje
        );

        return;
    }


    personaje.position.z +=
        movimiento *
        direccion;


    datos.eggarTiempo +=
        delta;


    const t =
        datos.eggarTiempo *
        7;


    const paso =
        Math.sin(t);


    const pasoOpuesto =
        Math.sin(
            t + Math.PI
        );


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


    // Piernas
    rotacionRelativa(
        rig.piernaIzq,
        ejeX,
        paso * 0.38
    );


    rotacionRelativa(
        rig.piernaDer,
        ejeX,
        pasoOpuesto * 0.38
    );


    // Pies
    rotacionRelativa(
        rig.pieIzq,
        ejeX,
        -paso * 0.16
    );


    rotacionRelativa(
        rig.pieDer,
        ejeX,
        -pasoOpuesto * 0.16
    );


    // Brazos
    rotacionRelativa(
        rig.brazoIzq,
        ejeX,
        pasoOpuesto * 0.25
    );


    rotacionRelativa(
        rig.brazoDer,
        ejeX,
        paso * 0.25
    );


    // Antebrazos
    rotacionRelativa(
        rig.antebrazoIzq,
        ejeX,
        Math.abs(paso) * 0.06
    );


    rotacionRelativa(
        rig.antebrazoDer,
        ejeX,
        Math.abs(pasoOpuesto) * 0.06
    );


    // Pequeño movimiento natural del torso
    rotacionRelativa(
        rig.spine,
        ejeZ,
        Math.sin(t * 0.5) * 0.025
    );


    // Cabeza estable
    rotacionRelativa(
        rig.head,
        ejeZ,
        Math.sin(t * 0.4) * 0.018
    );


    // Balanceo pequeño del personaje completo
    personaje.position.y =
        datos.eggarBaseY +
        Math.abs(
            Math.sin(t)
        ) * 0.025;
}


// ------------------------------------------------------------
// ACTUALIZAR PERSONAJES
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
// BLOQUE 5/10
// HUEVO
// ============================================================

let huevo = null;
let particulasHuevo = null;
let energiaHuevo = null;
let flashHuevo = null;

let huevoActivo = false;
let huevoAbriendo = false;
let huevoAbierto = false;

let tiempoHuevo = 0;
let tiempoApertura = 0;


// ------------------------------------------------------------
// MATERIAL
// ------------------------------------------------------------

function crearMaterialHuevo() {

    return new THREE.MeshStandardMaterial({
        color: 0xf4e5c2,
        roughness: 0.72,
        metalness: 0.02
    });
}


// ------------------------------------------------------------
// CREAR HUEVO
// ------------------------------------------------------------

function crearHuevo() {

    const geometria =
        new THREE.SphereGeometry(
            1,
            32,
            24
        );


    const material =
        crearMaterialHuevo();


    huevo =
        new THREE.Mesh(
            geometria,
            material
        );


    huevo.scale.set(
        0.78,
        1.08,
        0.78
    );


    huevo.position.set(
        0,
        1.15,
        -3
    );


    huevo.castShadow =
        true;

    huevo.receiveShadow =
        true;


    huevo.userData
        .eggaroHuevo =
        true;


    const luz =
        new THREE.PointLight(
            0xffd36b,
            0,
            7
        );


    luz.position.y =
        0.4;


    luz.userData
        .eggaroLuzHuevo =
        true;


    huevo.add(
        luz
    );


    grupoHuevo.add(
        huevo
    );
}


// ------------------------------------------------------------
// PARTÍCULAS
// ------------------------------------------------------------

function crearParticulasHuevo() {

    const posiciones = [];

    for (
        let i = 0;
        i < 36;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI * 2;


        const radio =
            0.7 +
            Math.random() * 0.7;


        posiciones.push(
            Math.cos(angulo) * radio,
            Math.random() * 1.8,
            Math.sin(angulo) * radio
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
            color: 0xffe59a,
            size: 0.09,
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
        0.3,
        -3
    );


    grupoHuevo.add(
        particulasHuevo
    );
}


// ------------------------------------------------------------
// ENERGÍA
// ------------------------------------------------------------

function crearEnergiaHuevo() {

    const posiciones = [];

    for (
        let i = 0;
        i < 48;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI * 2;


        const radio =
            0.2 +
            Math.random() * 1.1;


        posiciones.push(
            Math.cos(angulo) * radio,
            Math.random() * 1.8,
            Math.sin(angulo) * radio
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
            color: 0xffffff,
            size: 0.12,
            transparent: true,
            opacity: 0
        });


    energiaHuevo =
        new THREE.Points(
            geometria,
            material
        );


    energiaHuevo.position.set(
        0,
        0.4,
        -3
    );


    grupoHuevo.add(
        energiaHuevo
    );
}


// ------------------------------------------------------------
// FLASH
// ------------------------------------------------------------

function crearFlashHuevo() {

    if (flashHuevo) {
        return;
    }


    const geometria =
        new THREE.SphereGeometry(
            1,
            16,
            16
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });


    flashHuevo =
        new THREE.Mesh(
            geometria,
            material
        );


    flashHuevo.position.set(
        0,
        1.15,
        -3
    );


    flashHuevo.scale.setScalar(
        0.1
    );


    grupoHuevo.add(
        flashHuevo
    );
}


// ------------------------------------------------------------
// PREPARAR
// ------------------------------------------------------------

function prepararHuevo() {

    crearHuevo();

    crearParticulasHuevo();

    crearEnergiaHuevo();

    crearFlashHuevo();
}


// ------------------------------------------------------------
// ACTIVAR
// ------------------------------------------------------------

function activarHuevo() {

    huevoActivo = true;

    tiempoHuevo = 0;

    if (huevo) {
        huevo.visible = true;
    }
}


// ------------------------------------------------------------
// ABRIR
// ------------------------------------------------------------

function abrirHuevo() {

    if (huevoAbriendo || huevoAbierto) {
        return;
    }


    huevoAbriendo = true;

    tiempoApertura = 0;
}


// ------------------------------------------------------------
// ACTUALIZAR HUEVO
// ------------------------------------------------------------

function actualizarHuevo(
    delta
) {

    if (
        !huevo ||
        !huevoActivo
    ) {
        return;
    }


    tiempoHuevo +=
        delta;


    const escala =
        1 +
        Math.sin(
            tiempoHuevo * 4
        ) * 0.025;


    huevo.scale.set(
        0.78 * escala,
        1.08 * escala,
        0.78 * escala
    );


    huevo.rotation.y +=
        delta * 0.25;


    const luz =
        huevo.children.find(
            obj =>
                obj.userData &&
                obj.userData.eggaroLuzHuevo
        );


    if (luz) {

        luz.intensity =
            0.8 +
            Math.sin(
                tiempoHuevo * 5
            ) * 0.35;
    }


    if (
        particulasHuevo &&
        particulasHuevo.material
    ) {

        particulasHuevo.material.opacity =
            0.15 +
            Math.sin(
                tiempoHuevo * 4
            ) * 0.08;
    }
}
// ============================================================
// BLOQUE 6/10
// APERTURA DEL HUEVO
// ============================================================

function actualizarAperturaHuevo(
    delta
) {

    if (!huevoAbriendo) {
        return;
    }


    tiempoApertura +=
        delta;


    const progreso =
        Math.min(
            tiempoApertura / 0.8,
            1
        );


    // El huevo tiembla antes de abrirse.
    huevo.rotation.z =
        Math.sin(
            tiempoApertura * 30
        ) *
        0.035 *
        (1 - progreso);


    huevo.scale.y =
        1.08 +
        Math.sin(
            tiempoApertura * 20
        ) *
        0.08;


    if (
        particulasHuevo &&
        particulasHuevo.material
    ) {

        particulasHuevo.material.opacity =
            progreso * 0.75;
    }


    if (
        progreso >= 1 &&
        !huevoAbierto
    ) {

        huevoAbierto =
            true;

        huevoAbriendo =
            false;


        if (huevo) {

            huevo.visible =
                false;
        }


        if (
            energiaHuevo &&
            energiaHuevo.material
        ) {

            energiaHuevo.material.opacity =
                1;
        }


        crearFlashHuevo();


        if (flashHuevo) {

            flashHuevo.visible =
                true;

            flashHuevo.scale.setScalar(
                0.2
            );

            flashHuevo.material.opacity =
                1;
        }


        mostrarResultadoCinematica();
    }
}


// ------------------------------------------------------------
// ENERGÍA
// ------------------------------------------------------------

function actualizarEnergiaHuevo(
    delta
) {

    if (
        !energiaHuevo ||
        !energiaHuevo.material
    ) {
        return;
    }


    if (
        !huevoAbierto
    ) {
        return;
    }


    energiaHuevo.rotation.y +=
        delta;


    energiaHuevo.position.y +=
        delta * 0.35;


    energiaHuevo.material.opacity =
        Math.max(
            0,
            energiaHuevo.material.opacity -
            delta * 0.18
        );
}


// ------------------------------------------------------------
// FLASH
// ------------------------------------------------------------

function actualizarFlashHuevo(
    delta
) {

    if (
        !flashHuevo ||
        !flashHuevo.visible
    ) {
        return;
    }


    flashHuevo.scale.multiplyScalar(
        1 + delta * 6
    );


    flashHuevo.material.opacity =
        Math.max(
            0,
            flashHuevo.material.opacity -
            delta * 2.5
        );


    if (
        flashHuevo.material.opacity <= 0
    ) {

        flashHuevo.visible =
            false;
    }
}


// ------------------------------------------------------------
// EFECTOS
// ------------------------------------------------------------

function actualizarEfectosHuevo(
    delta
) {

    actualizarHuevo(
        delta
    );

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
// BLOQUE 7/10
// POLLITO 3D
// ============================================================

function crearPollitoProcedural() {

    const grupo =
        new THREE.Group();


    grupo.name =
        "PollitoCinematico";


    grupo.userData
        .eggaroPollito =
        true;


    grupo.userData
        .activo =
        false;


    grupo.userData
        .tiempo =
        0;


    // --------------------------------------------------------
    // CUERPO
    // --------------------------------------------------------

    const materialCuerpo =
        new THREE.MeshStandardMaterial({
            color: 0xf2c94c,
            roughness: 0.9
        });


    const cuerpo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.62,
                20,
                16
            ),
            materialCuerpo
        );


    cuerpo.scale.set(
        1,
        0.9,
        0.95
    );


    cuerpo.position.y =
        0.65;


    cuerpo.castShadow =
        true;


    grupo.add(
        cuerpo
    );


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
            materialCuerpo
        );


    cabeza.position.set(
        0,
        1.18,
        -0.08
    );


    cabeza.castShadow =
        true;


    grupo.add(
        cabeza
    );


    // --------------------------------------------------------
    // OJOS
    // --------------------------------------------------------

    const materialOjo =
        new THREE.MeshBasicMaterial({
            color: 0x111111
        });


    const ojoIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.055,
                10,
                8
            ),
            materialOjo
        );


    const ojoDer =
        ojoIzq.clone();


    ojoIzq.position.set(
        -0.17,
        1.28,
        -0.43
    );


    ojoDer.position.set(
        0.17,
        1.28,
        -0.43
    );


    grupo.add(
        ojoIzq
    );

    grupo.add(
        ojoDer
    );


    // --------------------------------------------------------
    // PICO
    // --------------------------------------------------------

    const materialPico =
        new THREE.MeshStandardMaterial({
            color: 0xe58b32,
            roughness: 0.8
        });


    const pico =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.13,
                0.28,
                8
            ),
            materialPico
        );


    pico.rotation.x =
        Math.PI / 2;


    pico.position.set(
        0,
        1.13,
        -0.5
    );


    grupo.add(
        pico
    );


    // --------------------------------------------------------
    // ALAS
    // --------------------------------------------------------

    const alaIzq =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.32,
                16,
                12
            ),
            materialCuerpo
        );


    const alaDer =
        alaIzq.clone();


    alaIzq.name =
        "AlaIzquierda";


    alaDer.name =
        "AlaDerecha";


    alaIzq.scale.set(
        0.45,
        0.8,
        0.3
    );


    alaDer.scale.copy(
        alaIzq.scale
    );


    alaIzq.position.set(
        -0.55,
        0.72,
        0
    );


    alaDer.position.set(
        0.55,
        0.72,
        0
    );


    grupo.add(
        alaIzq
    );

    grupo.add(
        alaDer
    );


    // --------------------------------------------------------
    // PATAS
    // --------------------------------------------------------

    const materialPata =
        new THREE.MeshStandardMaterial({
            color: 0xe58b32,
            roughness: 0.9
        });


    const pataIzq =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.035,
                0.045,
                0.35,
                8
            ),
            materialPata
        );


    const pataDer =
        pataIzq.clone();


    pataIzq.position.set(
        -0.18,
        0.13,
        0
    );


    pataDer.position.set(
        0.18,
        0.13,
        0
    );


    grupo.add(
        pataIzq
    );

    grupo.add(
        pataDer
    );


    grupo.position.set(
        0,
        0.15,
        -3
    );


    grupo.visible =
        false;


    grupo.scale.setScalar(
        0.01
    );


    grupoResultado.add(
        grupo
    );


    return grupo;
}


// ------------------------------------------------------------
// PREPARAR RESULTADO
// ------------------------------------------------------------

function prepararResultado() {

    if (!grupoResultado) {
        return;
    }


    crearPollitoProcedural();
}


// ------------------------------------------------------------
// OBTENER POLLITO
// ------------------------------------------------------------

function obtenerPollito() {

    if (!grupoResultado) {
        return null;
    }


    return grupoResultado
        .getObjectByName(
            "PollitoCinematico"
        );
}


// ------------------------------------------------------------
// MOSTRAR RESULTADO
// ------------------------------------------------------------

function mostrarResultadoCinematica() {

    const pollito =
        obtenerPollito();


    if (!pollito) {
        return;
    }


    pollito.visible =
        true;


    pollito.userData.activo =
        true;


    pollito.userData.tiempo =
        0;


    pollito.scale.setScalar(
        0.01
    );


    pollito.position.set(
        0,
        0.15,
        -3
    );
}


// ------------------------------------------------------------
// ANIMACIÓN DEL POLLITO
// ------------------------------------------------------------

function actualizarPollito(
    delta
) {

    const pollito =
        obtenerPollito();


    if (
        !pollito ||
        !pollito.userData.activo
    ) {
        return;
    }


    const datos =
        pollito.userData;


    datos.tiempo +=
        delta;


    const t =
        datos.tiempo;


    const entrada =
        Math.min(
            t / 0.8,
            1
        );


    const suavizado =
        entrada *
        entrada *
        (3 - 2 * entrada);


    pollito.scale.setScalar(
        Math.max(
            0.01,
            suavizado
        )
    );


    pollito.position.y =
        0.15 +
        Math.abs(
            Math.sin(t * 4.5)
        ) *
        0.10;


    pollito.rotation.y =
        Math.sin(t * 1.8) *
        0.12;


    pollito.rotation.z =
        Math.sin(t * 3.5) *
        0.035;


    const alaIzq =
        pollito.getObjectByName(
            "AlaIzquierda"
        );


    const alaDer =
        pollito.getObjectByName(
            "AlaDerecha"
        );


    if (alaIzq) {

        alaIzq.rotation.z =
            0.15 +
            Math.sin(t * 8) *
            0.18;
    }


    if (alaDer) {

        alaDer.rotation.z =
            -0.15 -
            Math.sin(t * 8) *
            0.18;
    }
                }
// ============================================================
// BLOQUE 8/10
// CÁMARA CINEMATOGRÁFICA
// ============================================================

const camaraCine = {

    fase: 0,

    posicionObjetivo:
        new THREE.Vector3(),

    miradaObjetivo:
        new THREE.Vector3(),

    tiempo: 0
};


// ------------------------------------------------------------
// SUAVIZADO
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
// CAMBIAR FASE
// ------------------------------------------------------------

function cambiarFaseCamara(
    fase
) {

    camaraCine.fase =
        fase;

    camaraCine.tiempo =
        0;
}


// ------------------------------------------------------------
// CÁMARA
// ------------------------------------------------------------

function actualizarCamaraCine(
    delta
) {

    if (!camara) {
        return;
    }


    camaraCine.tiempo +=
        delta;


    let x = 0;
    let y = 5;
    let z = 15;

    let mx = 0;
    let my = 2;
    let mz = 0;


    // --------------------------------------------------------
    // BOSQUE
    // --------------------------------------------------------

    if (
        camaraCine.fase === 0
    ) {

        const t =
            camaraCine.tiempo;


        x =
            Math.sin(t * 0.16) *
            8;


        y =
            5.5 +
            Math.sin(t * 0.3) *
            0.2;


        z =
            15 -
            t * 0.35;


        mx = 0;
        my = 2.5;
        mz = 0;
    }


    // --------------------------------------------------------
    // CAMINATA
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 1
    ) {

        const objetivo =
            new THREE.Vector3(
                0,
                1.6,
                3
            );


        if (
            mike &&
            micaela
        ) {

            objetivo.x =
                (
                    mike.position.x +
                    micaela.position.x
                ) / 2;


            objetivo.z =
                (
                    mike.position.z +
                    micaela.position.z
                ) / 2;
        }


        x =
            objetivo.x + 6;


        y =
            3.8;


        z =
            objetivo.z + 8;


        mx =
            objetivo.x;


        my =
            1.4;


        mz =
            objetivo.z;
    }


    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 2
    ) {

        x = 4.2;
        y = 2.8;
        z = 4.5;

        mx = 0;
        my = 1.1;
        mz = -3;
    }


    // --------------------------------------------------------
    // APERTURA
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 3
    ) {

        const acercamiento =
            Math.min(
                camaraCine.tiempo / 1.5,
                1
            );


        x =
            3.5 -
            acercamiento * 1.5;


        y =
            2.5 -
            acercamiento * 0.5;


        z =
            3.8 -
            acercamiento * 1.0;


        mx = 0;
        my = 1;
        mz = -3;
    }


    // --------------------------------------------------------
    // POLLITO
    // --------------------------------------------------------

    else if (
        camaraCine.fase === 4
    ) {

        x = 3.2;
        y = 2.3;
        z = 2.8;

        mx = 0;
        my = 0.9;
        mz = -3;
    }


    // --------------------------------------------------------
    // FINAL
    // --------------------------------------------------------

    else {

        x = 4.5;
        y = 3.2;
        z = 5.5;

        mx = 0;
        my = 1.3;
        mz = -2.5;
    }


    camara.position.x =
        suavizar(
            camara.position.x,
            x,
            2.5,
            delta
        );


    camara.position.y =
        suavizar(
            camara.position.y,
            y,
            2.5,
            delta
        );


    camara.position.z =
        suavizar(
            camara.position.z,
            z,
            2.5,
            delta
        );


    camaraCine.miradaObjetivo.lerp(
        new THREE.Vector3(
            mx,
            my,
            mz
        ),
        1 -
        Math.exp(
            -3 * delta
        )
    );


    camara.lookAt(
        camaraCine.miradaObjetivo
    );
    }
// ============================================================
// BLOQUE 9/10
// DIÁLOGOS Y SECUENCIA
// ============================================================

let dialogoElemento = null;
let dialogoNombre = null;


// ------------------------------------------------------------
// INTERFAZ
// ------------------------------------------------------------

function crearInterfazDialogo() {

    if (
        document.getElementById(
            "eggaro-dialogo"
        )
    ) {
        return;
    }


    const caja =
        document.createElement(
            "div"
        );


    caja.id =
        "eggaro-dialogo";


    caja.style.position =
        "fixed";


    caja.style.left =
        "5%";


    caja.style.right =
        "5%";


    caja.style.bottom =
        "5%";


    caja.style.padding =
        "14px 18px";


    caja.style.background =
        "rgba(0,0,0,0.78)";


    caja.style.border =
        "2px solid rgba(255,255,255,0.75)";


    caja.style.borderRadius =
        "14px";


    caja.style.zIndex =
        "1000";


    caja.style.fontFamily =
        "Arial, sans-serif";


    caja.style.color =
        "white";


    caja.style.pointerEvents =
        "none";


    const nombre =
        document.createElement(
            "div"
        );


    nombre.style.fontWeight =
        "bold";


    nombre.style.fontSize =
        "18px";


    nombre.style.marginBottom =
        "5px";


    const texto =
        document.createElement(
            "div"
        );


    texto.style.fontSize =
        "16px";


    texto.style.lineHeight =
        "1.35";


    caja.appendChild(
        nombre
    );


    caja.appendChild(
        texto
    );


    document.body.appendChild(
        caja
    );


    dialogoElemento =
        texto;


    dialogoNombre =
        nombre;


    caja.style.display =
        "none";
}


// ------------------------------------------------------------
// MOSTRAR DIÁLOGO
// ------------------------------------------------------------

function mostrarDialogo(
    nombre,
    texto
) {

    if (
        !dialogoElemento ||
        !dialogoNombre
    ) {
        crearInterfazDialogo();
    }


    const caja =
        document.getElementById(
            "eggaro-dialogo"
        );


    if (!caja) {
        return;
    }


    dialogoNombre.textContent =
        nombre;


    dialogoElemento.textContent =
        texto;


    caja.style.display =
        "block";
}


// ------------------------------------------------------------
// OCULTAR
// ------------------------------------------------------------

function ocultarDialogo() {

    const caja =
        document.getElementById(
            "eggaro-dialogo"
        );


    if (caja) {

        caja.style.display =
            "none";
    }
}


// ------------------------------------------------------------
// LÍNEAS
// ------------------------------------------------------------

const dialogosCinematica = [

    {
        inicio: 2,
        fin: 5,
        nombre: "Mike",
        texto:
            "Micaela... mira ese bosque."
    },

    {
        inicio: 5,
        fin: 8,
        nombre: "Micaela",
        texto:
            "Espera... ¿viste eso?"
    },

    {
        inicio: 8,
        fin: 11,
        nombre: "Mike",
        texto:
            "Hay algo brillando entre los árboles."
    },

    {
        inicio: 11,
        fin: 14,
        nombre: "Micaela",
        texto:
            "¡Es un huevo!"
    },

    {
        inicio: 14,
        fin: 17,
        nombre: "Mike",
        texto:
            "Acércate. Vamos a descubrir qué hay dentro."
    },

    {
        inicio: 17,
        fin: 20,
        nombre: "Micaela",
        texto:
            "Está empezando a moverse..."
    },

    {
        inicio: 20,
        fin: 23,
        nombre: "Mike",
        texto:
            "¡Mira!"
    },

    {
        inicio: 23,
        fin: 27,
        nombre: "Micaela",
        texto:
            "¡Es un pollito!"
    }
];


// ------------------------------------------------------------
// ACTUALIZAR DIÁLOGOS
// ------------------------------------------------------------

function actualizarDialogos(
    tiempo
) {

    let actual = null;


    for (
        const dialogo
        of dialogosCinematica
    ) {

        if (
            tiempo >= dialogo.inicio &&
            tiempo < dialogo.fin
        ) {

            actual =
                dialogo;

            break;
        }
    }


    if (actual) {

        mostrarDialogo(
            actual.nombre,
            actual.texto
        );

    } else {

        ocultarDialogo();
    }
}


// ------------------------------------------------------------
// SECUENCIA
// ------------------------------------------------------------

function actualizarSecuencia(
    delta
) {

    tiempoCinematica +=
        delta;


    // 0-3 segundos:
    // presentación del bosque

    if (
        faseCinematica === 0 &&
        tiempoCinematica >= 3
    ) {

        faseCinematica = 1;

        if (mike) {

            iniciarCaminata(
                mike,
                0.2
            );
        }


        if (micaela) {

            iniciarCaminata(
                micaela,
                0.2
            );
        }


        cambiarFaseCamara(
            1
        );
    }


    // Mike y Micaela llegan
    if (
        faseCinematica === 1 &&
        mike &&
        micaela
    ) {

        const mikeListo =
            !mike.userData.eggarCaminando;


        const micaelaLista =
            !micaela.userData.eggarCaminando;


        if (
            mikeListo &&
            micaelaLista
        ) {

            faseCinematica = 2;

            activarHuevo();

            cambiarFaseCamara(
                2
            );
        }
    }


    // Observan el huevo
    if (
        faseCinematica === 2 &&
        tiempoCinematica >= 14
    ) {

        faseCinematica = 3;

        abrirHuevo();

        cambiarFaseCamara(
            3
        );
    }


    // Después de abrirse
    if (
        faseCinematica === 3 &&
        huevoAbierto
    ) {

        faseCinematica = 4;

        cambiarFaseCamara(
            4
        );
    }


    // Final
    if (
        faseCinematica === 4 &&
        tiempoCinematica >= 27
    ) {

        faseCinematica = 5;

        cambiarFaseCamara(
            5
        );

        cinematicaFinalizada =
            true;
    }
}
// ============================================================
// BLOQUE 10/10
// ACTUALIZACIÓN + INICIO + EXPORTACIONES
// ============================================================


// ------------------------------------------------------------
// ACTUALIZADOR PRINCIPAL
// ------------------------------------------------------------

function actualizarCinematica(
    delta
) {

    if (!activa) {
        return;
    }


    actualizarPersonajes(
        delta
    );


    actualizarEfectosHuevo(
        delta
    );


    actualizarPollito(
        delta
    );


    actualizarCamaraCine(
        delta
    );


    actualizarDialogos(
        tiempoCinematica
    );


    actualizarSecuencia(
        delta
    );
}


// ------------------------------------------------------------
// INICIAR
// ------------------------------------------------------------

export async function iniciarCinematica(
    resultado = "noob"
) {

    if (activa) {
        return;
    }


    resultadoCinematica =
        String(
            resultado || "noob"
        )
        .toLowerCase()
        .trim();


    activa = true;

    cinematicaFinalizada =
        false;


    tiempoCinematica =
        0;


    faseCinematica =
        0;


    huevoActivo =
        false;


    huevoAbriendo =
        false;


    huevoAbierto =
        false;


    // Escena
    crearEscena();


    crearCamara();


    crearRenderer();


    crearIluminacion();


    crearInterfazDialogo();


    crearBosque();


    prepararHuevo();


    prepararResultado();


    // Personajes
    await cargarPersonajes();


    // Cámara
    cambiarFaseCamara(
        0
    );


    reloj =
        new THREE.Clock();


    actualizarTamaño();


    renderizar();
}


// ------------------------------------------------------------
// DETENER
// ------------------------------------------------------------

export function detenerCinematica() {

    activa = false;


    cinematicaFinalizada =
        false;


    if (renderer) {

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


    const dialogo =
        document.getElementById(
            "eggaro-dialogo"
        );


    if (dialogo) {

        dialogo.remove();
    }


    renderer = null;

    escena = null;

    camara = null;

    reloj = null;

    grupoCinematica = null;

    grupoBosque = null;

    grupoPersonajes = null;

    grupoHuevo = null;

    grupoResultado = null;

    mike = null;

    micaela = null;

    huevo = null;

    particulasHuevo = null;

    energiaHuevo = null;

    flashHuevo = null;
}


// ------------------------------------------------------------
// ESTADO
// ------------------------------------------------------------

export function cinematicaTerminada() {

    return cinematicaFinalizada;
}


// ------------------------------------------------------------
// RESULTADO
// ------------------------------------------------------------

export function establecerResultadoCinematica(
    resultado
) {

    const valor =
        String(
            resultado || "noob"
        )
        .toLowerCase()
        .trim();


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


// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

window.addEventListener(
    "resize",
    () => {

        actualizarTamaño();

    },
    {
        passive: true
    }
);
