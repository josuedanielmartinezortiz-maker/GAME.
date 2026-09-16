// ============================================================
// GAMERPRO GAME
// escenaCinematica.js
// CINEMÁTICA HUEVO NOOB - VERSIÓN CORREGIDA
// ============================================================

import * as THREE from "three";

import {
    GLTFLoader
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import {
    abrirHuevo
} from "../probabilidades.js";

// ============================================================
// ESTADO
// ============================================================

let escena = null;
let camara = null;
let renderer = null;

let contenedorJuego = null;

let reloj = null;
let animacionID = null;

let cinematicaActiva = false;
let cinematicaFinalizada = false;

let fase = 0;
let tiempoFase = 0;
let tiempoTotal = 0;

// ============================================================
// PERSONAJES
// ============================================================

let mike = null;
let micaela = null;

let mikeHuesos = {};
let micaelaHuesos = {};

// ============================================================
// POLLOS
// ============================================================

let polloNoob = null;
let polloZombie = null;
let polloNoobEspecial = null;

let resultadoReal = null;
let resultadoMostrado = false;

// ============================================================
// HUEVO
// ============================================================

let huevo = null;
let huevoBrillo = null;

// ============================================================
// DIÁLOGO
// ============================================================

let cajaDialogo = null;
let nombreDialogo = null;
let textoDialogo = null;

let dialogoActual = -1;

// ============================================================
// CARGADORES
// ============================================================

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// ============================================================
// ARCHIVOS
// ============================================================

const ARCHIVOS = {

    mike:
        "./3D/mike.glb",

    micaela:
        "./3D/micaela.glb",

    huevo:
        "./3D/huevo%20noob.png",

    pollitoNoob:
        "./3D/pollito%20noob.png",

    zombie:
        "./3D/zombie.png"

};

// ============================================================
// CONFIGURACIÓN
// ============================================================

const CONFIG = {

    velocidadMike: 3.8,

    velocidadMicaela: 3.8,

    velocidadPasos: 12,

    distanciaFinal: 0.35,

    alturaCamara: 3.1,

    distanciaCamara: 8,

    duracionIntro: 2.5,

    duracionHuevo: 3,

    duracionApertura: 1.8,

    duracionSeleccion: 4.5,

    duracionResultado: 4

};

// ============================================================
// ROTACIÓN DE PERSONAJES
// ============================================================

// Los personajes avanzan hacia -Z.
// Si el modelo tiene el frente apuntando hacia +Z,
// esta rotación hace que miren correctamente hacia el huevo.

const ROTACION_PERSONAJES =
    Math.PI;

// ============================================================
// RESULTADO
// ============================================================

export function establecerResultadoCinematica(
    resultado
) {

    if (
        resultado === "noob" ||
        resultado === "zombie" ||
        resultado === "pollito_noob"
    ) {

        resultadoReal = resultado;

    }

}

// ============================================================
// ESTADO FINAL
// ============================================================

export function cinematicaTerminada() {

    return cinematicaFinalizada;

}
// ============================================================
// CONTINUACIÓN - DETALLES DE POLLOS
// ============================================================

function crearPata(grupo, x) {

    const pata = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.055,
            0.07,
            0.38,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffa62b
        })
    );

    pata.position.set(
        x,
        0.28,
        0
    );

    grupo.add(pata);

    const pie = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.10,
            8,
            8
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffa62b
        })
    );

    pie.scale.z = 1.5;

    pie.position.set(
        x,
        0.08,
        -0.10
    );

    grupo.add(pie);
}


// ============================================================
// GORRA
// ============================================================

function crearGorra(grupo, tipo) {

    let color = 0xe8c36a;

    if (tipo === "zombie") {
        color = 0x596b62;
    }

    if (tipo === "pollito_noob") {
        color = 0xe8c36a;
    }

    const gorra = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.43,
            12,
            8
        ),
        new THREE.MeshStandardMaterial({
            color
        })
    );

    gorra.scale.set(
        1.05,
        0.32,
        0.90
    );

    gorra.position.set(
        0,
        1.95,
        0
    );

    grupo.add(gorra);


    const visera = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.65,
            0.08,
            0.28
        ),
        new THREE.MeshStandardMaterial({
            color
        })
    );

    visera.position.set(
        0,
        1.88,
        -0.32
    );

    grupo.add(visera);
}


// ============================================================
// LETRA N
// ============================================================

function crearLetraN(grupo) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x222222
        });

    const barra1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.07,
                0.28,
                0.03
            ),
            material
        );

    const barra2 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.07,
                0.28,
                0.03
            ),
            material
        );

    const diagonal =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.07,
                0.31,
                0.03
            ),
            material
        );

    barra1.position.set(
        -0.11,
        1.89,
        -0.52
    );

    barra2.position.set(
        0.11,
        1.89,
        -0.52
    );

    diagonal.position.set(
        0,
        1.89,
        -0.53
    );

    diagonal.rotation.z =
        -0.6;

    grupo.add(barra1);
    grupo.add(barra2);
    grupo.add(diagonal);
}


// ============================================================
// OJOS ZOMBIE
// ============================================================

function crearOjosZombie(grupo) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xff2020
        });

    const ojo1 =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.08,
                8,
                8
            ),
            material
        );

    const ojo2 =
        ojo1.clone();

    ojo1.position.set(
        -0.18,
        1.65,
        -0.50
    );

    ojo2.position.set(
        0.18,
        1.65,
        -0.50
    );

    grupo.add(ojo1);
    grupo.add(ojo2);
}
// ============================================================
// DECORACIÓN POLLITO NOOB
// ============================================================

function crearDecoracionRainbow(grupo) {

    const colores = [
        0xff3b30,
        0xff9500,
        0xffcc00,
        0x34c759,
        0x007aff,
        0xaf52de
    ];

    for (
        let i = 0;
        i < colores.length;
        i++
    ) {

        const aro =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.18 + i * 0.035,
                    0.025,
                    6,
                    12,
                    Math.PI
                ),
                new THREE.MeshBasicMaterial({
                    color: colores[i]
                })
            );

        aro.rotation.x =
            Math.PI / 2;

        aro.position.set(
            0,
            2.05,
            -0.05
        );

        grupo.add(aro);
    }
}


// ============================================================
// DIÁLOGOS SINCRONIZADOS POR FASE
// ============================================================

const DIALOGOS = [

    {
        fase: 0,
        tiempo: 0.5,
        nombre: "Micaela",
        texto: "Mike... ¿dónde estamos?"
    },

    {
        fase: 0,
        tiempo: 1.7,
        nombre: "Mike",
        texto: "No lo sé... pero este lugar está enorme."
    },

    {
        fase: 1,
        tiempo: 0.8,
        nombre: "Micaela",
        texto: "Espera... ¿ves eso allá?"
    },

    {
        fase: 1,
        tiempo: 2.0,
        nombre: "Mike",
        texto: "Sí... se ve algo entre los árboles."
    },

    {
        fase: 1,
        tiempo: 3.3,
        nombre: "Micaela",
        texto: "Pío... pío... ¿qué fue eso?"
    },

    {
        fase: 1,
        tiempo: 4.4,
        nombre: "Mike",
        texto: "¿Un pollo?"
    },

    {
        fase: 1,
        tiempo: 5.7,
        nombre: "Micaela",
        texto: "Vamos a ver qué es."
    },

    {
        fase: 1,
        tiempo: 7.0,
        nombre: "Mike",
        texto: "Mira... hay algo junto a ese huevo."
    },

    {
        fase: 2,
        tiempo: 0.5,
        nombre: "Micaela",
        texto: "¿Un huevo? ¿De dónde salió?"
    },

    {
        fase: 2,
        tiempo: 1.7,
        nombre: "Mike",
        texto: "No parece un huevo normal... está brillando."
    },

    {
        fase: 2,
        tiempo: 2.6,
        nombre: "Micaela",
        texto: "¡Mike, está moviéndose!"
    },

    {
        fase: 3,
        tiempo: 0.5,
        nombre: "Mike",
        texto: "¡Se está abriendo!"
    },

    {
        fase: 3,
        tiempo: 1.3,
        nombre: "Micaela",
        texto: "¡¿Son pollos?!"
    },

    {
        fase: 4,
        tiempo: 0.6,
        nombre: "Mike",
        texto: "¡Hay varios! ¿Cuál va a salir?"
    },

    {
        fase: 4,
        tiempo: 3.2,
        nombre: "Micaela",
        texto: "¡Ya se decidió!"
    },

    {
        fase: 5,
        tiempo: 0.5,
        nombre: "Mike",
        texto: "¡Ese fue el que salió!"
    }

];
// ============================================================
// INTERFAZ DE DIÁLOGO
// ============================================================

function crearInterfazDialogo() {

    cajaDialogo =
        document.createElement("div");

    cajaDialogo.style.position =
        "fixed";

    cajaDialogo.style.left =
        "50%";

    cajaDialogo.style.bottom =
        "5%";

    cajaDialogo.style.transform =
        "translateX(-50%)";

    cajaDialogo.style.width =
        "min(90%, 720px)";

    cajaDialogo.style.padding =
        "18px 22px";

    cajaDialogo.style.background =
        "rgba(0,0,0,0.78)";

    cajaDialogo.style.border =
        "2px solid rgba(255,255,255,0.25)";

    cajaDialogo.style.borderRadius =
        "18px";

    cajaDialogo.style.color =
        "white";

    cajaDialogo.style.fontFamily =
        "Arial, sans-serif";

    cajaDialogo.style.zIndex =
        "9999";

    cajaDialogo.style.boxSizing =
        "border-box";

    cajaDialogo.style.display =
        "none";


    nombreDialogo =
        document.createElement("div");

    nombreDialogo.style.fontWeight =
        "bold";

    nombreDialogo.style.fontSize =
        "18px";

    nombreDialogo.style.marginBottom =
        "7px";


    textoDialogo =
        document.createElement("div");

    textoDialogo.style.fontSize =
        "17px";

    textoDialogo.style.lineHeight =
        "1.4";


    cajaDialogo.appendChild(
        nombreDialogo
    );

    cajaDialogo.appendChild(
        textoDialogo
    );

    document.body.appendChild(
        cajaDialogo
    );
}


// ============================================================
// ACTUALIZAR DIÁLOGO
// ============================================================

function actualizarDialogo() {

    if (!cajaDialogo) {
        return;
    }

    let encontrado = -1;

    for (
        let i = 0;
        i < DIALOGOS.length;
        i++
    ) {

        const dialogo =
            DIALOGOS[i];

        if (
            dialogo.fase === fase &&
            tiempoFase >= dialogo.tiempo
        ) {
            encontrado = i;
        }
    }


    if (
        encontrado !== -1 &&
        encontrado !== dialogoActual
    ) {

        dialogoActual =
            encontrado;

        const dialogo =
            DIALOGOS[encontrado];

        nombreDialogo.textContent =
            dialogo.nombre;

        textoDialogo.textContent =
            dialogo.texto;

        cajaDialogo.style.display =
            "block";
    }


    if (
        encontrado === -1 &&
        fase === 0 &&
        tiempoFase < 0.4
    ) {

        cajaDialogo.style.display =
            "none";
    }
}
// ============================================================
// RESULTADO REAL
// ============================================================

function obtenerResultadoReal() {

    if (resultadoReal) {
        return resultadoReal;
    }

    // IMPORTANTE:
    // ESTA ES LA ÚNICA TIRADA DE LA CINEMÁTICA.

    resultadoReal =
        abrirHuevo(
            "huevo_noob"
        );

    console.log(
        "[GAMERPRO] Resultado huevo:",
        resultadoReal
    );

    return resultadoReal;
}


// ============================================================
// MOSTRAR LOS 3 CANDIDATOS
// ============================================================

function mostrarPollos() {

    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    for (const pollo of pollos) {

        if (!pollo) {
            continue;
        }

        pollo.visible =
            true;

        pollo.scale.setScalar(
            0.05
        );

        pollo.userData.animTime =
            Math.random() * 5;
    }

    resultadoMostrado =
        false;
}


// ============================================================
// ENTRADA DE LOS POLLOS
// ============================================================

function animarEntradaPollos(delta) {

    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    for (const pollo of pollos) {

        if (
            !pollo ||
            !pollo.visible
        ) {
            continue;
        }

        const escala =
            Math.min(
                1,
                pollo.scale.x +
                delta * 4
            );

        pollo.scale.setScalar(
            escala
        );
    }
}


// ============================================================
// ANIMACIÓN DE POLLOS
// ============================================================

function animarPollos(delta) {

    const pollos = [
        polloNoob,
        polloZombie,
        polloNoobEspecial
    ];

    for (const pollo of pollos) {

        if (
            !pollo ||
            !pollo.visible
        ) {
            continue;
        }

        pollo.userData.animTime +=
            delta * 5;

        const t =
            pollo.userData.animTime;

        pollo.position.y =
            Math.abs(
                Math.sin(t)
            ) * 0.15;

        pollo.rotation.y =
            Math.sin(t * 0.8) * 0.15;
    }
}
// ============================================================
// FINALIZAR SELECCIÓN
// ============================================================

function finalizarSeleccion() {

    if (resultadoMostrado) {
        return;
    }

    const pollos = {

        noob:
            polloNoob,

        zombie:
            polloZombie,

        pollito_noob:
            polloNoobEspecial

    };


    const ganador =
        pollos[
            resultadoReal
        ];


    if (!ganador) {

        console.warn(
            "[GAMERPRO] Resultado inválido:",
            resultadoReal
        );

        return;
    }


    // --------------------------------------------------------
    // OCULTAR TODOS LOS PERDEDORES
    // --------------------------------------------------------

    for (
        const [nombre, pollo]
        of Object.entries(pollos)
    ) {

        if (!pollo) {
            continue;
        }

        pollo.visible =
            nombre === resultadoReal;
    }


    // --------------------------------------------------------
    // GANADOR
    // --------------------------------------------------------

    ganador.visible =
        true;

    ganador.scale.setScalar(
        1.25
    );

    ganador.position.y =
        0.18;

    ganador.userData.ganador =
        true;


    resultadoMostrado =
        true;

    console.log(
        "[GAMERPRO] Ganador final:",
        resultadoReal
    );
}


// ============================================================
// ANIMAR GANADOR
// ============================================================

function animarGanador() {

    if (
        !resultadoMostrado ||
        !resultadoReal
    ) {
        return;
    }

    const pollos = {

        noob:
            polloNoob,

        zombie:
            polloZombie,

        pollito_noob:
            polloNoobEspecial

    };

    const ganador =
        pollos[
            resultadoReal
        ];

    if (!ganador) {
        return;
    }

    ganador.visible =
        true;

    ganador.scale.setScalar(
        1.22 +
        Math.sin(
            tiempoTotal * 5
        ) * 0.06
    );

    ganador.position.y =
        0.18 +
        Math.abs(
            Math.sin(
                tiempoTotal * 5
            )
        ) * 0.10;

    ganador.rotation.y =
        Math.sin(
            tiempoTotal * 4
        ) * 0.12;
}


// ============================================================
// HUEVO
// ============================================================

function actualizarHuevo() {

    if (!huevo) {
        return;
    }

    mirarCamara(
        huevo
    );


    if (fase === 2) {

        huevo.visible =
            true;

        const pulso =
            1 +
            Math.sin(
                tiempoFase * 8
            ) * 0.08;

        huevo.scale.x =
            huevo.userData.escalaX *
            pulso;

        huevo.scale.y =
            huevo.userData.escalaY *
            pulso;

        huevo.rotation.z =
            Math.sin(
                tiempoFase * 5
            ) * 0.04;

        if (huevoBrillo) {

            huevoBrillo.intensity =
                1.5 +
                Math.sin(
                    tiempoFase * 10
                ) * 0.8;
        }
}
        // --------------------------------------------------------
    // APERTURA
    // --------------------------------------------------------

    if (fase === 3) {

        huevo.visible =
            true;

        const progreso =
            Math.min(
                tiempoFase /
                CONFIG.duracionApertura,
                1
            );

        const escalaX =
            huevo.userData.escalaX;

        const escalaY =
            huevo.userData.escalaY;

        huevo.scale.x =
            escalaX *
            (1 + progreso * 0.15);

        huevo.scale.y =
            escalaY *
            Math.max(
                0.05,
                1 - progreso * 0.90
            );

        huevo.rotation.z =
            Math.sin(
                tiempoFase * 15
            ) * 0.12;

        if (huevoBrillo) {

            huevoBrillo.intensity =
                2 +
                progreso * 4;
        }
    }


    // --------------------------------------------------------
    // DESAPARECE DESPUÉS DE ABRIR
    // --------------------------------------------------------

    if (fase >= 4) {

        huevo.visible =
            false;

        if (huevoBrillo) {
            huevoBrillo.intensity =
                0;
        }
    }
}


// ============================================================
// CAMBIO DE FASE
// ============================================================

function cambiarFase(
    nuevaFase
) {

    fase =
        nuevaFase;

    tiempoFase =
        0;

    dialogoActual =
        -1;


    // --------------------------------------------------------
    // FASE 2
    // --------------------------------------------------------

    if (fase === 2) {

        if (huevo) {

            huevo.visible =
                true;

            huevo.scale.set(
                huevo.userData.escalaX,
                huevo.userData.escalaY,
                1
            );
        }
    }


    // --------------------------------------------------------
    // FASE 3
    // --------------------------------------------------------

    if (fase === 3) {

        if (huevo) {
            huevo.visible =
                true;
        }

        // Se decide AQUÍ.
        // Nunca se vuelve a tirar.

        obtenerResultadoReal();
    }


    // --------------------------------------------------------
    // FASE 4
    // --------------------------------------------------------

    if (fase === 4) {

        if (huevo) {
            huevo.visible =
                false;
        }

        mostrarPollos();
    }


    // --------------------------------------------------------
    // FASE 5
    // --------------------------------------------------------

    if (fase === 5) {

        finalizarSeleccion();
    }
}


// ============================================================
// ACTUALIZAR FASES
// ============================================================

function actualizarFases(delta) {

    tiempoFase +=
        delta;


    // --------------------------------------------------------
    // 0 = INTRO
    // --------------------------------------------------------

    if (
        fase === 0 &&
        tiempoFase >=
        CONFIG.duracionIntro
    ) {

        cambiarFase(1);
    }


    // --------------------------------------------------------
    // 1 = CAMINATA
    // --------------------------------------------------------

    if (fase === 1) {

        const distanciaMike =
            mike
                ? mike.position.z
                : 999;

        const distanciaMicaela =
            micaela
                ? micaela.position.z
                : 999;

        if (
            distanciaMike <=
                CONFIG.distanciaFinal + 0.05 &&
            distanciaMicaela <=
                CONFIG.distanciaFinal + 0.05
        ) {

            detenerPersonaje(
                mike
            );

            detenerPersonaje(
                micaela
            );

            cambiarFase(2);
        }
    }


    // --------------------------------------------------------
    // 2 = HUEVO
    // --------------------------------------------------------

    if (
        fase === 2 &&
        tiempoFase >=
        CONFIG.duracionHuevo
    ) {

        cambiarFase(3);
    }


    // --------------------------------------------------------
    // 3 = APERTURA
    // --------------------------------------------------------

    if (
        fase === 3 &&
        tiempoFase >=
        CONFIG.duracionApertura
    ) {

        cambiarFase(4);
    }


    // --------------------------------------------------------
    // 4 = SELECCIÓN
    // --------------------------------------------------------

    if (
        fase === 4 &&
        tiempoFase >=
        CONFIG.duracionSeleccion
    ) {

        cambiarFase(5);
    }


    // --------------------------------------------------------
    // 5 = RESULTADO
    // --------------------------------------------------------

    if (
        fase === 5 &&
        tiempoFase >=
        CONFIG.duracionResultado
    ) {

        terminarCinematica();
    }
}
// ============================================================
// LOOP PRINCIPAL
// ============================================================

function actualizar() {

    if (!cinematicaActiva) {
        return;
    }


    const delta =
        Math.min(
            reloj.getDelta(),
            0.05
        );


    tiempoTotal +=
        delta;


    actualizarFases(
        delta
    );

    actualizarDialogo();


    // --------------------------------------------------------
    // CAMINATA
    // --------------------------------------------------------

    if (fase === 1) {

        actualizarCaminata(
            mike,
            mikeHuesos,
            CONFIG.velocidadMike,
            delta
        );

        actualizarCaminata(
            micaela,
            micaelaHuesos,
            CONFIG.velocidadMicaela,
            delta
        );

    } else {

        detenerPersonaje(
            mike
        );

        detenerPersonaje(
            micaela
        );
    }


    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    actualizarHuevo();


    // --------------------------------------------------------
    // POLLOS
    // --------------------------------------------------------

    if (fase === 4) {

        animarEntradaPollos(
            delta
        );

        animarPollos(
            delta
        );
    }


    if (fase === 5) {

        // IMPORTANTE:
        // No volvemos a hacer visibles
        // los perdedores.

        animarGanador();
    }


    // --------------------------------------------------------
    // CÁMARA
    // --------------------------------------------------------

    actualizarCamara();


    renderer.render(
        escena,
        camara
    );


    animacionID =
        requestAnimationFrame(
            actualizar
        );
}


// ============================================================
// CÁMARA
// ============================================================

function actualizarCamara() {

    if (!camara) {
        return;
    }


    let objetivoZ =
        4.5;


    if (
        fase === 2 ||
        fase === 3 ||
        fase === 4 ||
        fase === 5
    ) {

        objetivoZ =
            -1.5;
    }


    const objetivo =
        new THREE.Vector3(
            0,
            1.4,
            objetivoZ
        );


    camara.position.x +=
        (
            0 -
            camara.position.x
        ) * 0.025;


    camara.position.y +=
        (
            CONFIG.alturaCamara -
            camara.position.y
        ) * 0.025;


    camara.position.z +=
        (
            CONFIG.distanciaCamara -
            camara.position.z
        ) * 0.025;


    camara.lookAt(
        objetivo
    );
}


// ============================================================
// REDIMENSIONAR
// ============================================================

function redimensionarCinematica() {

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
        }
// ============================================================
// INICIAR CINEMÁTICA
// ============================================================

export async function iniciarCinematica(
    contenedor
) {

    if (cinematicaActiva) {
        return;
    }


    contenedorJuego =
        contenedor ||
        document.body;


    cinematicaActiva =
        true;

    cinematicaFinalizada =
        false;


    fase = 0;

    tiempoFase =
        0;

    tiempoTotal =
        0;

    dialogoActual =
        -1;

    resultadoReal =
        null;

    resultadoMostrado =
        false;


    // --------------------------------------------------------
    // ESCENA
    // --------------------------------------------------------

    crearEscena();


    // --------------------------------------------------------
    // INTERFAZ
    // --------------------------------------------------------

    crearInterfazDialogo();


    // --------------------------------------------------------
    // PERSONAJES
    // --------------------------------------------------------

    await cargarPersonajes();


    // --------------------------------------------------------
    // ORIENTACIÓN
    // --------------------------------------------------------

    if (mike) {

        mike.rotation.y =
            ROTACION_PERSONAJES;
    }

    if (micaela) {

        micaela.rotation.y =
            ROTACION_PERSONAJES;
    }


    // --------------------------------------------------------
    // HUEVO
    // --------------------------------------------------------

    await crearHuevo();


    // --------------------------------------------------------
    // POLLOS
    // --------------------------------------------------------

    crearPollos3D();


    // --------------------------------------------------------
    // ESCALA DEL HUEVO
    // --------------------------------------------------------

    if (huevo) {

        huevo.userData.escalaX =
            huevo.scale.x;

        huevo.userData.escalaY =
            huevo.scale.y;
    }


    // --------------------------------------------------------
    // RELOJ
    // --------------------------------------------------------

    reloj =
        new THREE.Clock();


    // --------------------------------------------------------
    // EMPEZAR
    // --------------------------------------------------------

    animacionID =
        requestAnimationFrame(
            actualizar
        );
}


// ============================================================
// DETENER CINEMÁTICA
// ============================================================

export function detenerCinematica() {

    cinematicaActiva =
        false;


    if (animacionID) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID =
            null;
    }


    if (reloj) {

        reloj.stop();
    }


    window.removeEventListener(
        "resize",
        redimensionarCinematica
    );


    if (cajaDialogo) {

        cajaDialogo.remove();

        cajaDialogo =
            null;

        nombreDialogo =
            null;

        textoDialogo =
            null;
    }


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


    escena =
        null;

    camara =
        null;

    renderer =
        null;

    mike =
        null;

    micaela =
        null;

    mikeHuesos =
        {};

    micaelaHuesos =
        {};

    huevo =
        null;

    huevoBrillo =
        null;

    polloNoob =
        null;

    polloZombie =
        null;

    polloNoobEspecial =
        null;

    resultadoReal =
        null;

    resultadoMostrado =
        false;

    cinematicaActiva =
        false;
}


// ============================================================
// TERMINAR
// ============================================================

function terminarCinematica() {

    cinematicaActiva =
        false;

    cinematicaFinalizada =
        true;


    // El ganador permanece visible
    // hasta que game.js continúe.

    if (cajaDialogo) {

        cajaDialogo.style.display =
            "none";
    }


    if (animacionID) {

        cancelAnimationFrame(
            animacionID
        );

        animacionID =
            null;
    }
        }
// ============================================================
// SEGURIDAD FINAL DEL RESULTADO
// ============================================================

// Esta función NO tira otra probabilidad.
// Solo devuelve el resultado que ya decidió
// probabilidades.js.

export function obtenerResultadoCinematica() {

    return resultadoReal;
}


// ============================================================
// FORZAR SOLO GANADOR
// ============================================================

export function mostrarResultadoFinal() {

    if (!resultadoReal) {
        return;
    }

    const pollos = {

        noob:
            polloNoob,

        zombie:
            polloZombie,

        pollito_noob:
            polloNoobEspecial

    };


    for (
        const [nombre, pollo]
        of Object.entries(pollos)
    ) {

        if (!pollo) {
            continue;
        }

        pollo.visible =
            nombre === resultadoReal;
    }


    const ganador =
        pollos[
            resultadoReal
        ];


    if (ganador) {

        ganador.visible =
            true;

        ganador.scale.setScalar(
            1.25
        );
    }


    resultadoMostrado =
        true;
}


// ============================================================
// FIN DE escenaCinematica.js
// ============================================================
