// ======================================================
// EGGARO — ESCENA 3D DEL MENÚ PRINCIPAL
// ======================================================

import * as THREE from "three";

let escena = null;
let camara = null;
let renderer = null;
let reloj = null;

export function iniciarEscenaMenu(contenedor) {
    // --------------------------------------------------
    // ESCENA
    // --------------------------------------------------

    escena = new THREE.Scene();

    escena.background = new THREE.Color(0x9ed8f2);

    // --------------------------------------------------
    // CÁMARA
    // --------------------------------------------------

    camara = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camara.position.set(0, 7, 18);

    // --------------------------------------------------
    // RENDERER
    // --------------------------------------------------

    renderer = new THREE.WebGLRenderer({
        antialias: true
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

    contenedor.appendChild(renderer.domElement);

    // --------------------------------------------------
    // RELOJ
    // --------------------------------------------------

    reloj = new THREE.Clock();

    // --------------------------------------------------
    // ILUMINACIÓN
    // --------------------------------------------------

    const luzAmbiente = new THREE.HemisphereLight(
        0xbfe8ff,
        0x4d6b35,
        2
    );

    escena.add(luzAmbiente);

    const sol = new THREE.DirectionalLight(
        0xffdf9a,
        4
    );

    sol.position.set(
        -15,
        25,
        10
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 2048;
    sol.shadow.mapSize.height = 2048;

    sol.shadow.camera.left = -40;
    sol.shadow.camera.right = 40;
    sol.shadow.camera.top = 40;
    sol.shadow.camera.bottom = -40;

    escena.add(sol);

    // --------------------------------------------------
    // SOL VISUAL
    // --------------------------------------------------

    const geometriaSol =
        new THREE.SphereGeometry(
            2.2,
            32,
            32
        );

    const materialSol =
        new THREE.MeshBasicMaterial({
            color: 0xffd76a
        });

    const solVisual =
        new THREE.Mesh(
            geometriaSol,
            materialSol
        );

    solVisual.position.set(
        -18,
        18,
        -35
    );

    escena.add(solVisual);

    // --------------------------------------------------
    // TERRENO
    // --------------------------------------------------

    const terrenoGeometria =
        new THREE.PlaneGeometry(
            120,
            120
        );

    const terrenoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4f8f45,
            roughness: 1
        });

    const terreno =
        new THREE.Mesh(
            terrenoGeometria,
            terrenoMaterial
        );

    terreno.rotation.x =
        -Math.PI / 2;

    terreno.receiveShadow = true;

    escena.add(terreno);

    // --------------------------------------------------
    // CABAÑA
    // --------------------------------------------------

    crearCabana();

    // --------------------------------------------------
    // VEGETACIÓN
    // --------------------------------------------------

    crearVegetacion();

    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------

    window.addEventListener(
        "resize",
        ajustarPantalla
    );

    // --------------------------------------------------
    // BUCLE
    // --------------------------------------------------

    animar();

    return {
        escena,
        camara,
        renderer
    };
}

// ======================================================
// CABAÑA
// ======================================================

function crearCabana() {

    const grupo =
        new THREE.Group();

    // ------------------------------
    // CUERPO
    // ------------------------------

    const cuerpo =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                10,
                5,
                7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x725238,
                roughness: 1
            })
        );

    cuerpo.position.y = 2.5;
    cuerpo.castShadow = true;
    cuerpo.receiveShadow = true;

    grupo.add(cuerpo);

    // ------------------------------
    // TECHO
    // ------------------------------

    const techo =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                6.5,
                3.5,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3f342d,
                roughness: 1
            })
        );

    techo.rotation.y =
        Math.PI / 4;

    techo.position.y = 6.5;

    techo.castShadow = true;

    grupo.add(techo);

    // ------------------------------
    // PUERTA
    // ------------------------------

    const puerta =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.7,
                3.2,
                0.25
            ),
            new THREE.MeshStandardMaterial({
                color: 0x35251d
            })
        );

    puerta.position.set(
        0,
        1.6,
        3.55
    );

    puerta.castShadow = true;

    grupo.add(puerta);

    // ------------------------------
    // VENTANAS
    // ------------------------------

    const materialVentana =
        new THREE.MeshStandardMaterial({
            color: 0x273b3b,
            roughness: 0.5
        });

    const ventanaIzq =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                1.5,
                0.2
            ),
            materialVentana
        );

    ventanaIzq.position.set(
        -3,
        3,
        3.55
    );

    grupo.add(ventanaIzq);

    const ventanaDer =
        ventanaIzq.clone();

    ventanaDer.position.x = 3;

    grupo.add(ventanaDer);

    // ------------------------------
    // TABLAS ROTAS
    // ------------------------------

    for (let i = 0; i < 7; i++) {

        const tabla =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.25,
                    3,
                    0.15
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x4d3627
                })
            );

        tabla.position.set(
            -4.5 + i * 1.3,
            2.3 + Math.sin(i) * 0.3,
            3.7
        );

        tabla.rotation.z =
            (Math.random() - 0.5) * 0.15;

        tabla.castShadow = true;

        grupo.add(tabla);
    }

    // ------------------------------
    // POSICIÓN
    // ------------------------------

    grupo.position.set(
        5,
        0,
        -12
    );

    grupo.rotation.y =
        -0.15;

    escena.add(grupo);
}

// ======================================================
// VEGETACIÓN
// ======================================================

function crearVegetacion() {

    for (let i = 0; i < 100; i++) {

        const altura =
            0.25 +
            Math.random() * 0.6;

        const pasto =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.06,
                    altura,
                    3
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x3f7d35
                })
            );

        const x =
            (Math.random() - 0.5) * 60;

        const z =
            (Math.random() - 0.5) * 60;

        // Evitar llenar la zona inmediata
        // frente a la cámara.

        if (
            Math.abs(x) < 7 &&
            z > 5
        ) {
            i--;
            continue;
        }

        pasto.position.set(
            x,
            altura / 2,
            z
        );

        pasto.rotation.y =
            Math.random() *
            Math.PI;

        pasto.castShadow = true;

        escena.add(pasto);
    }

    // ------------------------------
    // ÁRBOLES
    // ------------------------------

    const posicionesArboles = [
        [-18, -8],
        [-12, -18],
        [16, -15],
        [22, -5],
        [-25, -25]
    ];

    for (
        const [x, z]
        of posicionesArboles
    ) {

        crearArbol(x, z);
    }
}

// ======================================================
// ÁRBOL
// ======================================================

function crearArbol(x, z) {

    const arbol =
        new THREE.Group();

    // Tronco

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.5,
                0.7,
                5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x543823
            })
        );

    tronco.position.y = 2.5;
    tronco.castShadow = true;

    arbol.add(tronco);

    // Copa

    const copa =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                3.2,
                12,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x356b32
            })
        );

    copa.position.y = 6;

    copa.castShadow = true;

    arbol.add(copa);

    arbol.position.set(
        x,
        0,
        z
    );

    escena.add(arbol);
}

// ======================================================
// ANIMACIÓN
// ======================================================

function animar() {

    requestAnimationFrame(animar);

    if (!renderer || !escena || !camara) {
        return;
    }

    const tiempo =
        reloj.getElapsedTime();

    // Pequeño movimiento cinematográfico
    // de cámara.

    camara.position.x =
        Math.sin(tiempo * 0.08) * 0.5;

    camara.position.y =
        7 +
        Math.sin(tiempo * 0.12) * 0.15;

    camara.lookAt(
        0,
        3,
        -8
    );

    renderer.render(
        escena,
        camara
    );
}

// ======================================================
// RESIZE
// ======================================================

function ajustarPantalla() {

    if (!camara || !renderer) {
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
