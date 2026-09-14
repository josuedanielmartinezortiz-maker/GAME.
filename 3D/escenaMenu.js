// ============================================================
// EGGARO
// escenaMenu.js
//
// Reconstrucción 3D del menú principal basada en:
// 1789356238111.png
//
// Composición:
// - Sol / amanecer a la izquierda
// - Campo abierto
// - Vegetación y flores
// - Rocas en primer plano
// - Horizonte con colinas
// - Cabaña abandonada a la derecha
// ============================================================

import * as THREE from "three";

// ------------------------------------------------------------
// VARIABLES
// ------------------------------------------------------------

let escena;
let camara;
let renderer;
let reloj;

let pastoInstanciado;
let floresInstanciadas;

const temporizadores = [];

// ------------------------------------------------------------
// INICIAR ESCENA
// ------------------------------------------------------------

export function iniciarEscenaMenu(contenedor) {

    // ========================================================
    // ESCENA
    // ========================================================

    escena = new THREE.Scene();

    // Niebla cálida para conseguir profundidad atmosférica.
    escena.fog = new THREE.Fog(
        0xd9d8b8,
        35,
        100
    );

    // ========================================================
    // CÁMARA
    // ========================================================

    camara = new THREE.PerspectiveCamera(
        52,
        window.innerWidth / window.innerHeight,
        0.1,
        250
    );

    // La imagen tiene una composición muy abierta.
    camara.position.set(
        0,
        6.5,
        18
    );

    camara.lookAt(
        2,
        3.5,
        -10
    );

    // ========================================================
    // RENDERER
    // ========================================================

    renderer = new THREE.WebGLRenderer({
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

    // ========================================================
    // RELOJ
    // ========================================================

    reloj = new THREE.Clock();

    // ========================================================
    // CIELO
    // ========================================================

    crearCielo();

    // ========================================================
    // ILUMINACIÓN DEL AMANECER
    // ========================================================

    crearIluminacion();

    // ========================================================
    // SOL
    // ========================================================

    crearSol();

    // ========================================================
    // TERRENO
    // ========================================================

    crearTerreno();

    // ========================================================
    // HORIZONTE
    // ========================================================

    crearHorizonte();

    // ========================================================
    // CABAÑA
    // ========================================================

    crearCabana();

    // ========================================================
    // VEGETACIÓN
    // ========================================================

    crearPasto();

    crearFlores();

    crearArbustos();

    // ========================================================
    // ROCAS DEL PRIMER PLANO
    // ========================================================

    crearRocas();

    // ========================================================
    // PEQUEÑOS DETALLES
    // ========================================================

    crearTroncos();

    // ========================================================
    // EVENTO RESIZE
    // ========================================================

    window.addEventListener(
        "resize",
        ajustarPantalla
    );

    // ========================================================
    // INICIO
    // ========================================================

    animar();

    return {
        escena,
        camara,
        renderer
    };
}

// ============================================================
// CIELO
// ============================================================

function crearCielo() {

    const geometria =
        new THREE.SphereGeometry(
            180,
            32,
            16
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xaed5df,
            side: THREE.BackSide
        });

    const cielo =
        new THREE.Mesh(
            geometria,
            material
        );

    escena.add(cielo);

    // --------------------------------------------------------
    // BRILLO CÁLIDO DEL AMANECER
    // --------------------------------------------------------

    const brilloGeometria =
        new THREE.SphereGeometry(
            90,
            32,
            16
        );

    const brilloMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xf4d99a,
            transparent: true,
            opacity: 0.18,
            side: THREE.BackSide
        });

    const brillo =
        new THREE.Mesh(
            brilloGeometria,
            brilloMaterial
        );

    brillo.position.set(
        -25,
        12,
        -60
    );

    escena.add(brillo);
}

// ============================================================
// ILUMINACIÓN
// ============================================================

function crearIluminacion() {

    // Luz ambiental del cielo.

    const ambiente =
        new THREE.HemisphereLight(
            0xc6e5ee,
            0x40522f,
            1.8
        );

    escena.add(ambiente);

    // --------------------------------------------------------
    // LUZ DEL SOL
    // --------------------------------------------------------

    const sol =
        new THREE.DirectionalLight(
            0xffd18a,
            4.2
        );

    sol.position.set(
        -25,
        25,
        8
    );

    sol.castShadow = true;

    sol.shadow.mapSize.width = 2048;
    sol.shadow.mapSize.height = 2048;

    sol.shadow.camera.left = -50;
    sol.shadow.camera.right = 50;
    sol.shadow.camera.top = 50;
    sol.shadow.camera.bottom = -50;

    sol.shadow.camera.near = 1;
    sol.shadow.camera.far = 100;

    sol.shadow.bias = -0.0005;

    escena.add(sol);
}

// ============================================================
// SOL VISUAL
// ============================================================

function crearSol() {

    const geometria =
        new THREE.SphereGeometry(
            2.3,
            32,
            32
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xfff1b0
        });

    const sol =
        new THREE.Mesh(
            geometria,
            material
        );

    // Posición inspirada directamente
    // en la imagen de referencia:
    // izquierda + horizonte.

    sol.position.set(
        -19,
        12.5,
        -48
    );

    escena.add(sol);

    // --------------------------------------------------------
    // HALO DEL SOL
    // --------------------------------------------------------

    const haloGeometria =
        new THREE.SphereGeometry(
            4.2,
            24,
            24
        );

    const haloMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffd978,
            transparent: true,
            opacity: 0.12
        });

    const halo =
        new THREE.Mesh(
            haloGeometria,
            haloMaterial
        );

    halo.position.copy(
        sol.position
    );

    escena.add(halo);
}

// ============================================================
// TERRENO
// ============================================================

function crearTerreno() {

    const geometria =
        new THREE.PlaneGeometry(
            150,
            150,
            40,
            40
        );

    const posiciones =
        geometria.attributes.position;

    // Pequeñas irregularidades para
    // que no parezca una pista plana.

    for (
        let i = 0;
        i < posiciones.count;
        i++
    ) {

        const x =
            posiciones.getX(i);

        const y =
            posiciones.getY(i);

        const distancia =
            Math.sqrt(
                x * x +
                y * y
            );

        let altura =
            Math.sin(x * 0.08) * 0.12;

        altura +=
            Math.cos(y * 0.07) * 0.1;

        altura +=
            Math.sin(
                (x + y) * 0.05
            ) * 0.08;

        if (distancia > 40) {
            altura *= 0.5;
        }

        posiciones.setZ(
            i,
            altura
        );
    }

    geometria.computeVertexNormals();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x4f8a3c,
            roughness: 1,
            metalness: 0
        });

    const terreno =
        new THREE.Mesh(
            geometria,
            material
        );

    terreno.rotation.x =
        -Math.PI / 2;

    terreno.receiveShadow = true;

    escena.add(terreno);
}

// ============================================================
// HORIZONTE
// ============================================================

function crearHorizonte() {

    const grupo =
        new THREE.Group();

    // --------------------------------------------------------
    // COLINAS LEJANAS
    // --------------------------------------------------------

    for (let i = 0; i < 12; i++) {

        const ancho =
            14 + Math.random() * 10;

        const alto =
            3 + Math.random() * 5;

        const geometria =
            new THREE.SphereGeometry(
                1,
                16,
                8
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x74866b,
                roughness: 1
            });

        const colina =
            new THREE.Mesh(
                geometria,
                material
            );

        colina.scale.set(
            ancho,
            alto,
            5
        );

        colina.position.set(
            -55 +
            i * 10 +
            Math.random() * 5,

            alto * 0.45,

            -45 -
            Math.random() * 8
        );

        grupo.add(colina);
    }

    escena.add(grupo);

    // --------------------------------------------------------
    // ÁRBOLES LEJANOS
    // --------------------------------------------------------

    for (let i = 0; i < 35; i++) {

        const arbol =
            crearArbolLejano();

        arbol.position.set(
            -45 +
            Math.random() * 90,

            0,

            -38 -
            Math.random() * 12
        );

        const escala =
            0.6 +
            Math.random() * 0.7;

        arbol.scale.setScalar(
            escala
        );

        escena.add(arbol);
    }
}

// ============================================================
// ÁRBOL LEJANO
// ============================================================

function crearArbolLejano() {

    const grupo =
        new THREE.Group();

    const tronco =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.2,
                0.35,
                2.2,
                6
            ),
            new THREE.MeshStandardMaterial({
                color: 0x514535
            })
        );

    tronco.position.y = 1.1;

    grupo.add(tronco);

    const copa =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.5,
                8,
                6
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4e6d48
            })
        );

    copa.position.y = 2.5;

    grupo.add(copa);

    return grupo;
}

// ============================================================
// CABAÑA
// ============================================================

function crearCabana() {

    const cabana =
        new THREE.Group();

    // La cabaña está desplazada a la derecha,
    // igual que en la imagen.

    cabana.position.set(
        7,
        0,
        -9
    );

    cabana.rotation.y =
        -0.12;

    // ========================================================
    // PAREDES
    // ========================================================

    const madera =
        new THREE.MeshStandardMaterial({
            color: 0x765537,
            roughness: 1
        });

    const cuerpo =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                11,
                5.5,
                7
            ),
            madera
        );

    cuerpo.position.y =
        2.75;

    cuerpo.castShadow = true;
    cuerpo.receiveShadow = true;

    cabana.add(cuerpo);

    // ========================================================
    // TABLAS EXTERIORES
    // ========================================================

    for (let i = 0; i < 13; i++) {

        const tabla =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.22,
                    5.1 +
                    Math.random() * 0.35,
                    7.15
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        i % 2 === 0
                            ? 0x775436
                            : 0x62452f,
                    roughness: 1
                })
            );

        tabla.position.set(
            -5.0 +
            i * 0.82,

            2.75,

            0
        );

        tabla.castShadow = true;

        cabana.add(tabla);
    }

    // ========================================================
    // PARTE SUPERIOR TRIANGULAR
    // ========================================================

    const triangulo =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                4.7,
                4.7,
                7,
                3
            ),
            madera
        );

    triangulo.rotation.z =
        Math.PI / 2;

    triangulo.rotation.y =
        Math.PI / 2;

    triangulo.position.set(
        0,
        7.2,
        0
    );

    triangulo.scale.set(
        1,
        0.75,
        1
    );

    triangulo.castShadow = true;

    cabana.add(triangulo);

    // ========================================================
    // TECHO
    // ========================================================

    const techoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x49382d,
            roughness: 1
        });

    const techoIzq =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                7.5,
                0.35,
                12
            ),
            techoMaterial
        );

    techoIzq.position.set(
        -3,
        7.3,
        0
    );

    techoIzq.rotation.z =
        0.52;

    techoIzq.castShadow = true;

    cabana.add(techoIzq);

    const techoDer =
        techoIzq.clone();

    techoDer.position.x = 3;

    techoDer.rotation.z =
        -0.52;

    cabana.add(techoDer);

    // ========================================================
    // TABLAS ROTAS DEL TECHO
    // ========================================================

    for (let i = 0; i < 17; i++) {

        const tabla =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    0.2,
                    4 +
                    Math.random() * 3
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        0x49372a,
                    roughness: 1
                })
            );

        tabla.position.set(
            -5 +
            Math.random() * 10,

            7.5 +
            Math.random() * 1.5,

            -4 +
            Math.random() * 8
        );

        tabla.rotation.z =
            (Math.random() - 0.5) *
            0.6;

        tabla.rotation.y =
            (Math.random() - 0.5) *
            0.25;

        tabla.castShadow = true;

        cabana.add(tabla);
    }

    // ========================================================
    // PUERTA
    // ========================================================

    const puerta =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.65,
                3.5,
                0.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3d2b20,
                roughness: 1
            })
        );

    puerta.position.set(
        0,
        1.75,
        3.62
    );

    puerta.castShadow = true;

    cabana.add(puerta);

    // ========================================================
    // MARCO DE PUERTA
    // ========================================================

    const marcoMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4a3424
        });

    const marcoIzq =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.25,
                3.9,
                0.35
            ),
            marcoMaterial
        );

    marcoIzq.position.set(
        -1,
        1.95,
        3.75
    );

    cabana.add(marcoIzq);

    const marcoDer =
        marcoIzq.clone();

    marcoDer.position.x = 1;

    cabana.add(marcoDer);

    // ========================================================
    // VENTANAS
    // ========================================================

    crearVentana(
        cabana,
        -3.2,
        3.2,
        3.62
    );

    crearVentana(
        cabana,
        3.2,
        3.2,
        3.62
    );

    // ========================================================
    // CAJAS
    // ========================================================

    crearCaja(
        cabana,
        -5.8,
        0.7,
        4
    );

    crearCaja(
        cabana,
        5.7,
        0.7,
        4
    );

    crearCaja(
        cabana,
        6.5,
        0.6,
        3.3
    );

    // ========================================================
    // BARRIL
    // ========================================================

    crearBarril(
        cabana,
        4.8,
        1,
        4.1
    );

    // ========================================================
    // LEÑA
    // ========================================================

    crearPilaLeña(
        cabana,
        7,
        0.45,
        3.8
    );

    escena.add(cabana);
}

// ============================================================
// VENTANA
// ============================================================

function crearVentana(
    grupo,
    x,
    y,
    z
) {

    const marco =
        new THREE.MeshStandardMaterial({
            color: 0x402e21
        });

    const cristal =
        new THREE.MeshStandardMaterial({
            color: 0x334747,
            roughness: 0.5
        });

    const ventana =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                1.7,
                0.2
            ),
            cristal
        );

    ventana.position.set(
        x,
        y,
        z
    );

    grupo.add(ventana);

    const vertical =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                1.9,
                0.3
            ),
            marco
        );

    vertical.position.set(
        x,
        y,
        z + 0.12
    );

    grupo.add(vertical);

    const horizontal =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.9,
                0.15,
                0.3
            ),
            marco
        );

    horizontal.position.set(
        x,
        y,
        z + 0.12
    );

    grupo.add(horizontal);
}

// ============================================================
// CAJA
// ============================================================

function crearCaja(
    grupo,
    x,
    y,
    z
) {

    const caja =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.6,
                1.2,
                1.4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x835d36,
                roughness: 1
            })
        );

    caja.position.set(
        x,
        y,
        z
    );

    caja.castShadow = true;

    grupo.add(caja);
}

// ============================================================
// BARRIL
// ============================================================

function crearBarril(
    grupo,
    x,
    y,
    z
) {

    const barril =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.65,
                0.65,
                1.4,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0x68462d,
                roughness: 1
            })
        );

    barril.position.set(
        x,
        y,
        z
    );

    barril.castShadow = true;

    grupo.add(barril);

    for (let i = -1; i <= 1; i += 2) {

        const aro =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.66,
                    0.07,
                    8,
                    16
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x29241f
                })
            );

        aro.rotation.x =
            Math.PI / 2;

        aro.position.set(
            x,
            y + i * 0.38,
            z
        );

        grupo.add(aro);
    }
}
// ============================================================
// LEÑA
// ============================================================

function crearPilaLeña(
    grupo,
    x,
    y,
    z
) {

    for (let i = 0; i < 8; i++) {

        const leña =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.22,
                    0.22,
                    2.2,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x5a3a25,
                    roughness: 1
                })
            );

        leña.rotation.z =
            Math.PI / 2;

        leña.rotation.y =
            Math.random() * 0.3;

        leña.position.set(
            x +
            (Math.random() - 0.5) * 1.5,

            y +
            0.25 +
            Math.floor(i / 4) * 0.45,

            z +
            (i % 4) * 0.35
        );

        leña.castShadow = true;

        grupo.add(leña);
    }
}

// ============================================================
// PASTO
// ============================================================

function crearPasto() {

    const cantidad = 1800;

    const geometria =
        new THREE.ConeGeometry(
            0.055,
            0.45,
            3
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x3f7f32,
            roughness: 1
        });

    pastoInstanciado =
        new THREE.InstancedMesh(
            geometria,
            material,
            cantidad
        );

    pastoInstanciado.castShadow = false;
    pastoInstanciado.receiveShadow = true;

    const dummy =
        new THREE.Object3D();

    for (let i = 0; i < cantidad; i++) {

        const x =
            (Math.random() - 0.5) * 80;

        const z =
            (Math.random() - 0.5) * 70;

        // Mantener libre la zona inmediata
        // de la cabaña.

        if (
            x > 0 &&
            x < 16 &&
            z < -3 &&
            z > -17
        ) {
            i--;
            continue;
        }

        const escala =
            0.5 +
            Math.random() * 1.8;

        dummy.position.set(
            x,
            escala * 0.22,
            z
        );

        dummy.scale.set(
            escala,
            escala,
            escala
        );

        dummy.rotation.y =
            Math.random() * Math.PI;

        dummy.updateMatrix();

        pastoInstanciado.setMatrixAt(
            i,
            dummy.matrix
        );
    }

    pastoInstanciado.instanceMatrix.needsUpdate =
        true;

    escena.add(
        pastoInstanciado
    );
}

// ============================================================
// FLORES
// ============================================================

function crearFlores() {

    const cantidad = 550;

    const geometria =
        new THREE.SphereGeometry(
            0.07,
            6,
            4
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xffe9a6,
            roughness: 1
        });

    floresInstanciadas =
        new THREE.InstancedMesh(
            geometria,
            material,
            cantidad
        );

    const dummy =
        new THREE.Object3D();

    for (let i = 0; i < cantidad; i++) {

        const x =
            (Math.random() - 0.5) * 75;

        const z =
            (Math.random() - 0.5) * 65;

        const escala =
            0.7 +
            Math.random() * 1.4;

        dummy.position.set(
            x,
            0.15 +
            Math.random() * 0.15,
            z
        );

        dummy.scale.setScalar(
            escala
        );

        dummy.updateMatrix();

        floresInstanciadas.setMatrixAt(
            i,
            dummy.matrix
        );
    }

    floresInstanciadas.instanceMatrix.needsUpdate =
        true;

    escena.add(
        floresInstanciadas
    );
}

// ============================================================
// ARBUSTOS
// ============================================================

function crearArbustos() {

    for (let i = 0; i < 45; i++) {

        const arbusto =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.8 +
                    Math.random() * 0.7,
                    8,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x416d35,
                    roughness: 1
                })
            );

        arbusto.position.set(
            -30 +
            Math.random() * 60,

            0.65,

            -30 +
            Math.random() * 45
        );

        arbusto.scale.y =
            0.65;

        arbusto.castShadow = true;

        escena.add(
            arbusto
        );
    }
}

// ============================================================
// ROCAS DEL PRIMER PLANO
// ============================================================

function crearRocas() {

    crearRoca(
        -7,
        0.7,
        8,
        2.7,
        1.1,
        2.2,
        0.25
    );

    crearRoca(
        8,
        0.65,
        7,
        3.2,
        1.2,
        2.4,
        -0.2
    );

    crearRoca(
        -1,
        0.35,
        5,
        1.4,
        0.6,
        1.2,
        0.1
    );

    crearRoca(
        15,
        0.3,
        1,
        1.2,
        0.5,
        1,
        0.2
    );

    crearRoca(
        -15,
        0.25,
        -1,
        1,
        0.45,
        0.8,
        -0.2
    );
}

// ============================================================
// ROCA INDIVIDUAL
// ============================================================

function crearRoca(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    rotacion
) {

    const geometria =
        new THREE.DodecahedronGeometry(
            1,
            1
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x77756b,
            roughness: 1
        });

    const roca =
        new THREE.Mesh(
            geometria,
            material
        );

    roca.position.set(
        x,
        y,
        z
    );

    roca.scale.set(
        sx,
        sy,
        sz
    );

    roca.rotation.y =
        rotacion;

    roca.rotation.x =
        0.1;

    roca.castShadow = true;
    roca.receiveShadow = true;

    escena.add(
        roca
    );
}

// ============================================================
// TRONCOS / MADERA EN EL CAMPO
// ============================================================

function crearTroncos() {

    for (let i = 0; i < 10; i++) {

        const tronco =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.22,
                    0.27,
                    2.2,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x604129,
                    roughness: 1
                })
            );

        tronco.position.set(
            2 +
            Math.random() * 18,

            0.3,

            -1 -
            Math.random() * 10
        );

        tronco.rotation.z =
            Math.PI / 2;

        tronco.rotation.y =
            Math.random() *
            Math.PI;

        tronco.castShadow = true;

        escena.add(
            tronco
        );
    }
}

// ============================================================
// ANIMACIÓN CINEMÁTICA
// ============================================================

function animar() {

    requestAnimationFrame(
        animar
    );

    if (
        !renderer ||
        !escena ||
        !camara
    ) {
        return;
    }

    const tiempo =
        reloj.getElapsedTime();

    const movimientoX =
        Math.sin(
            tiempo * 0.08
        ) * 0.18;

    const movimientoY =
        Math.sin(
            tiempo * 0.12
        ) * 0.06;

    camara.position.x =
        movimientoX;

    camara.position.y =
        6.5 +
        movimientoY;

    camara.lookAt(
        2,
        3.3,
        -10
    );

    renderer.render(
        escena,
        camara
    );
}

// ============================================================
// RESIZE
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
        }
    
