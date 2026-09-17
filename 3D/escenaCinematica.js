import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { abrirHuevo } from "../probabilidades.js";

let escena, camara, renderer, reloj, contenedor;
let mike, micaela, huevo, pollo;
let huesosMike = {}, huesosMicaela = {};
let finalizada = false;
let activa = false;
let raf = 0;
let tiempo = 0;
let fase = 0;
let resultado = null;
let texto = null;
let subtitulo = null;
let flash = null;
let particulas = [];
let polvo = [];

const loader = new GLTFLoader();

const ARCHIVOS = {
    mike: "./3D/personajes/mike/mike.glb",
    micaela: "./3D/personajes/mikaela/micaela.glb",
    huevo: "./3D/animales/huevo%20noob.png"
};

const FASES = {
    INTRO: 0,
    ENTRADA: 1,
    ENCUENTRO: 2,
    HUEVO: 3,
    TENSION: 4,
    APERTURA: 5,
    RESULTADO: 6,
    CIERRE: 7
};

const DURACIONES = [2.5, 4.5, 2.4, 2.2, 2.4, 1.2, 4.0, 2.0];

export function cinematicaTerminada() {
    return finalizada;
}

export function establecerResultadoCinematica(valor) {
    if (["noob", "zombie", "pollito_noob"].includes(valor)) resultado = valor;
}

export function iniciarCinematica(root) {
    detener();
    contenedor = root;
    finalizada = false;
    activa = true;
    fase = FASES.INTRO;
    tiempo = 0;

    crearEscena();
    crearHUD();
    cargarPersonajes();
    crearHuevo();
    crearAmbienteFX();

    reloj = new THREE.Clock();
    raf = requestAnimationFrame(loop);
}

function crearEscena() {
    escena = new THREE.Scene();
    escena.background = new THREE.Color(0x101b24);
    escena.fog = new THREE.FogExp2(0x182b2a, 0.026);

    camara = new THREE.PerspectiveCamera(
        48,
        innerWidth / innerHeight,
        0.05,
        140
    );

    camara.position.set(0, 4.6, 14);
    camara.lookAt(0, 2, -5);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    contenedor.appendChild(renderer.domElement);

    const ambiente = new THREE.HemisphereLight(0x9fc9d7, 0x162315, 1.8);
    escena.add(ambiente);

    const luna = new THREE.DirectionalLight(0x8fb9ff, 2.0);
    luna.position.set(-8, 12, 7);
    luna.castShadow = true;
    luna.shadow.mapSize.set(1024, 1024);
    escena.add(luna);

    const contra = new THREE.DirectionalLight(0xffb86b, 1.8);
    contra.position.set(8, 6, -12);
    escena.add(contra);

    crearCielo();
    crearTerreno();
    crearCamino();
    crearBosque();
    crearFogLights();
}

function crearCielo() {
    const cielo = new THREE.Mesh(
        new THREE.SphereGeometry(90, 32, 16),
        new THREE.MeshBasicMaterial({
            color: 0x203b45,
            side: THREE.BackSide
        })
    );
    escena.add(cielo);

    const luna = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0xdce8d4 })
    );
    luna.position.set(-18, 15, -42);
    escena.add(luna);

    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(4.8, 24, 16),
        new THREE.MeshBasicMaterial({
            color: 0xa9c7b4,
            transparent: true,
            opacity: 0.08
        })
    );
    halo.position.copy(luna.position);
    escena.add(halo);
}

function crearTerreno() {
    const geo = new THREE.PlaneGeometry(90, 90, 24, 24);
    const p = geo.attributes.position;

    for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const y = p.getY(i);
        p.setZ(i,
            Math.sin(x * 0.08) * 0.12 +
            Math.cos(y * 0.06) * 0.09
        );
    }

    geo.computeVertexNormals();

    const suelo = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
            color: 0x304f31,
            roughness: 1
        })
    );

    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    escena.add(suelo);
}

function crearCamino() {
    const camino = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 62, 1, 12),
        new THREE.MeshStandardMaterial({
            color: 0x6b573d,
            roughness: 1
        })
    );

    camino.rotation.x = -Math.PI / 2;
    camino.position.set(0, 0.025, -12);
    camino.receiveShadow = true;
    escena.add(camino);

    for (let i = 0; i < 30; i++) {
        const piedra = new THREE.Mesh(
            new THREE.DodecahedronGeometry(
                0.08 + Math.random() * 0.12,
                0
            ),
            new THREE.MeshStandardMaterial({
                color: 0x77705d,
                roughness: 1
            })
        );
        piedra.position.set(
            (Math.random() - 0.5) * 3.0,
            0.08,
            13 - i * 1.8
        );
        escena.add(piedra);
    }
}

function crearArbol() {
    const g = new THREE.Group();

    const tronco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.32, 3.2, 8),
        new THREE.MeshStandardMaterial({
            color: 0x4a3222,
            roughness: 1
        })
    );
    tronco.position.y = 1.6;
    tronco.castShadow = true;
    g.add(tronco);

    const copaMat = new THREE.MeshStandardMaterial({
        color: 0x183e29,
        roughness: 1
    });

    for (let i = 0; i < 3; i++) {
        const copa = new THREE.Mesh(
            new THREE.ConeGeometry(1.45 - i * 0.22, 2.0, 9),
            copaMat
        );
        copa.position.y = 2.6 + i * 0.75;
        copa.castShadow = true;
        g.add(copa);
    }

    return g;
}

function crearBosque() {
    for (let i = 0; i < 42; i++) {
        const side = i % 2 ? 1 : -1;
        const tree = crearArbol();
        tree.scale.setScalar(0.75 + Math.random() * 0.7);
        tree.position.set(
            side * (3.0 + Math.random() * 2.4),
            0,
            13 - i * 1.15
        );
        tree.rotation.y = Math.random() * Math.PI;
        escena.add(tree);
    }
}

function crearFogLights() {
    for (let i = 0; i < 7; i++) {
        const luz = new THREE.PointLight(
            i % 2 ? 0x91d7ff : 0xffc46b,
            1.1,
            8
        );
        luz.position.set(
            (i % 2 ? -1 : 1) * (2 + Math.random() * 2),
            1.0 + Math.random() * 2,
            5 - i * 7
        );
        escena.add(luz);
    }
}

async function cargarPersonajes() {
    try {
        const [a, b] = await Promise.all([
            loader.loadAsync(ARCHIVOS.mike),
            loader.loadAsync(ARCHIVOS.micaela)
        ]);

        mike = prepararPersonaje(a.scene, -1.35, 5.8);
        micaela = prepararPersonaje(b.scene, 1.35, 6.2);

        huesosMike = buscarHuesos(mike);
        huesosMicaela = buscarHuesos(micaela);

        escena.add(mike, micaela);

        agregarSombraPersonaje(mike);
        agregarSombraPersonaje(micaela);
    } catch (e) {
        console.error("[GAMERPRO V1] No se pudieron cargar Mike/Micaela:", e);
    }
}

function prepararPersonaje(obj, x, z) {
    obj.position.set(x, 0, z);
    obj.rotation.y = Math.PI;
    obj.traverse(n => {
        if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
        }
    });
    ajustarAlSuelo(obj);
    return obj;
}

function ajustarAlSuelo(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    if (Number.isFinite(box.min.y)) obj.position.y -= box.min.y;
}

function agregarSombraPersonaje(obj) {
    const sombra = new THREE.Mesh(
        new THREE.CircleGeometry(0.72, 24),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        })
    );
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.012;
    obj.add(sombra);
}

function buscarHuesos(obj) {
    const h = {};
    obj.traverse(n => {
        if (!n.isBone) return;
        const s = n.name.toLowerCase();

        if (!h.root && /root|hips|pelvis|hip|cadera/.test(s)) h.root = n;
        if (!h.spine && /spine|chest|torso|columna|pecho/.test(s)) h.spine = n;
        if (!h.head && /head|cabeza|neck|cuello/.test(s)) h.head = n;
        if (!h.armL && /(left|l).*?(upper)?arm|brazo.*izq/.test(s)) h.armL = n;
        if (!h.armR && /(right|r).*?(upper)?arm|brazo.*der/.test(s)) h.armR = n;
        if (!h.legL && /(left|l).*?(thigh|leg|calf)|pierna.*izq/.test(s)) h.legL = n;
        if (!h.legR && /(right|r).*?(thigh|leg|calf)|pierna.*der/.test(s)) h.legR = n;
    });
    return h;
}

function animarPersonaje(obj, h, t, caminar, nervioso = false) {
    if (!obj) return;

    if (caminar) {
        const paso = Math.sin(t * 8);
        if (h.armL) h.armL.rotation.x = paso * 0.42;
        if (h.armR) h.armR.rotation.x = -paso * 0.42;
        if (h.legL) h.legL.rotation.x = -paso * 0.52;
        if (h.legR) h.legR.rotation.x = paso * 0.52;
        if (h.spine) h.spine.rotation.z = Math.sin(t * 4) * 0.025;
        obj.position.y = Math.abs(Math.sin(t * 8)) * 0.025;
    } else {
        const breathe = Math.sin(t * 2.2) * 0.025;
        if (h.spine) h.spine.rotation.x = breathe;
        if (nervioso && h.head) h.head.rotation.z = Math.sin(t * 7) * 0.035;
        obj.position.y = 0;
    }
}

function crearHuevo() {
    const grupo = new THREE.Group();

    const geo = new THREE.SphereGeometry(1.0, 32, 20);
    geo.scale(0.82, 1.16, 0.82);

    const mat = new THREE.MeshStandardMaterial({
        color: 0xf1e7cc,
        roughness: 0.62
    });

    const cuerpo = new THREE.Mesh(geo, mat);
    cuerpo.castShadow = true;
    grupo.add(cuerpo);

    const brillo = new THREE.PointLight(0xffd978, 0, 7);
    brillo.position.y = 0.5;
    grupo.add(brillo);

    grupo.position.set(0, 1.08, -1.5);
    grupo.scale.setScalar(0.9);
    escena.add(grupo);

    huevo = grupo;
    huevo.userData.luz = brillo;
}

function crearPollo(resultado) {
    if (pollo) escena.remove(pollo);

    const g = new THREE.Group();

    const cuerpoMat = new THREE.MeshStandardMaterial({
        color: resultado === "zombie" ? 0x6e8170 : 0xf2c84b,
        roughness: 0.82
    });

    const picoMat = new THREE.MeshStandardMaterial({
        color: 0xe7a23b,
        roughness: 0.7
    });

    const cuerpo = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 20, 14),
        cuerpoMat
    );
    cuerpo.scale.set(1.0, 0.82, 1.05);
    cuerpo.castShadow = true;
    g.add(cuerpo);

    const cabeza = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, 20, 14),
        cuerpoMat
    );
    cabeza.position.set(0, 0.57, 0.12);
    cabeza.castShadow = true;
    g.add(cabeza);

    const ojoMat = new THREE.MeshStandardMaterial({ color: 0x171717 });
    for (const x of [-0.16, 0.16]) {
        const ojo = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 12, 8),
            ojoMat
        );
        ojo.position.set(x, 0.64, 0.52);
        g.add(ojo);
    }

    const pico = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.34, 6),
        picoMat
    );
    pico.rotation.x = Math.PI / 2;
    pico.position.set(0, 0.53, 0.58);
    g.add(pico);

    for (const x of [-0.13, 0.13]) {
        const cresta = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 8),
            new THREE.MeshStandardMaterial({ color: 0xd94b3e })
        );
        cresta.position.set(x, 0.94, 0.08);
        g.add(cresta);
    }

    for (const x of [-0.52, 0.52]) {
        const ala = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 16, 10),
            cuerpoMat
        );
        ala.scale.set(0.55, 1.0, 0.75);
        ala.position.set(x, 0.02, 0.02);
        ala.rotation.z = x < 0 ? -0.25 : 0.25;
        g.add(ala);
    }

    g.position.set(0, 0.7, -1.5);
    g.scale.setScalar(0.78);
    g.userData.rebote = Math.random() * 4;

    escena.add(g);
    pollo = g;
}

function crearAmbienteFX() {
    const geo = new THREE.SphereGeometry(0.025, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xcbe9d0,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 90; i++) {
        const p = new THREE.Mesh(geo, mat);
        p.position.set(
            (Math.random() - 0.5) * 16,
            Math.random() * 6,
            7 - Math.random() * 40
        );
        p.userData.v = 0.05 + Math.random() * 0.12;
        escena.add(p);
        polvo.push(p);
    }
}

function crearHUD() {
    const capa = document.createElement("div");
    capa.id = "cinematicaHUDV1";
    Object.assign(capa.style, {
        position: "fixed",
        inset: "0",
        zIndex: "50000",
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif"
    });

    texto = document.createElement("div");
    Object.assign(texto.style, {
        position: "absolute",
        left: "7%",
        bottom: "15%",
        color: "#fff",
        fontSize: "clamp(24px, 5vw, 46px)",
        fontWeight: "900",
        textShadow: "0 4px 18px #000",
        opacity: "0",
        transition: "opacity .25s ease"
    });

    subtitulo = document.createElement("div");
    Object.assign(subtitulo.style, {
        position: "absolute",
        left: "7%",
        bottom: "9%",
        color: "#dce8d4",
        fontSize: "clamp(14px, 2.8vw, 24px)",
        textShadow: "0 2px 10px #000",
        opacity: "0",
        maxWidth: "80%"
    });

    flash = document.createElement("div");
    Object.assign(flash.style, {
        position: "absolute",
        inset: "0",
        background: "#fff",
        opacity: "0",
        transition: "opacity .08s linear"
    });

    capa.append(texto, subtitulo, flash);
    contenedor.appendChild(capa);
}

function setDialogo(titulo, sub) {
    if (!texto || !subtitulo) return;
    texto.textContent = titulo;
    subtitulo.textContent = sub;
    texto.style.opacity = "1";
    subtitulo.style.opacity = "1";
}

function ocultarDialogo() {
    if (!texto || !subtitulo) return;
    texto.style.opacity = "0";
    subtitulo.style.opacity = "0";
}

function cameraPath(t) {
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 5.8, 16),
        new THREE.Vector3(-6, 4.4, 9),
        new THREE.Vector3(-3, 3.2, 3),
        new THREE.Vector3(0, 2.6, -0.5),
        new THREE.Vector3(3, 3.1, -3),
        new THREE.Vector3(0, 2.7, -7)
    ]);
    return curve.getPoint(Math.max(0, Math.min(1, t)));
}

function mirarCamara(x, y, z) {
    camara.lookAt(x, y, z);
}

function actualizarFase(delta) {
    tiempo += delta;

    while (tiempo >= DURACIONES[fase]) {
        tiempo -= DURACIONES[fase];
        fase++;

        if (fase >= DURACIONES.length) {
            finalizar();
            return;
        }
    }

    const progreso = Math.max(0, Math.min(1, tiempo / DURACIONES[fase]));
    const suave = progreso * progreso * (3 - 2 * progreso);

    if (fase === FASES.INTRO) {
        const p = cameraPath(suave * 0.42);
        camara.position.copy(p);
        mirarCamara(0, 2.2, -5);
        setDialogo("GAMERPRO", "La aventura comienza...");
    }

    if (fase === FASES.ENTRADA) {
        ocultarDialogo();
        if (mike) {
            mike.position.z = THREE.MathUtils.lerp(5.8, 0.8, suave);
            mike.position.x = THREE.MathUtils.lerp(-1.35, -0.75, suave);
            animarPersonaje(mike, huesosMike, tiempo, true);
        }
        if (micaela) {
            micaela.position.z = THREE.MathUtils.lerp(6.2, 1.5, suave);
            micaela.position.x = THREE.MathUtils.lerp(1.35, 0.75, suave);
            animarPersonaje(micaela, huesosMicaela, tiempo + 0.18, true);
        }
        camara.position.lerpVectors(
            new THREE.Vector3(5.2, 3.0, 9),
            new THREE.Vector3(3.6, 2.6, 3.4),
            suave
        );
        mirarCamara(0, 1.4, 0);
    }

    if (fase === FASES.ENCUENTRO) {
        if (mike) animarPersonaje(mike, huesosMike, tiempo, false, true);
        if (micaela) animarPersonaje(micaela, huesosMicaela, tiempo + 0.2, false, true);
        camara.position.set(
            0,
            2.45 + Math.sin(progreso * Math.PI) * 0.12,
            5.6 - suave * 1.8
        );
        mirarCamara(0, 1.35, 0.3);
        setDialogo("¿Qué es eso?", "Algo brilla entre los árboles.");
    }

    if (fase === FASES.HUEVO) {
        if (mike) animarPersonaje(mike, huesosMike, tiempo, false);
        if (micaela) animarPersonaje(micaela, huesosMicaela, tiempo + 0.2, false);
        camara.position.set(
            0,
            2.15 + suave * 0.25,
            3.9 - suave * 2.2
        );
        mirarCamara(0, 1.0, -1.5);
        if (huevo) {
            huevo.rotation.y = tiempo * 0.65;
            huevo.scale.setScalar(0.9 + Math.sin(tiempo * 4) * 0.025);
            huevo.userData.luz.intensity = 1.5 + Math.sin(tiempo * 5) * 0.7;
        }
        setDialogo("EL HUEVO NOOB", "Algo está a punto de despertar...");
    }

    if (fase === FASES.TENSION) {
        camara.position.set(
            0,
            1.65,
            2.35 - suave * 0.5
        );
        mirarCamara(0, 1.05, -1.5);

        if (huevo) {
            huevo.rotation.y = tiempo * 2.0;
            const pulso = 0.92 + Math.sin(tiempo * 12) * 0.05;
            huevo.scale.setScalar(pulso);
            huevo.userData.luz.intensity = 2.5 + suave * 5;
        }

        setDialogo("⚡", "...");
    }

    if (fase === FASES.APERTURA) {
        camara.position.set(0, 1.55, 2.0);
        mirarCamara(0, 0.9, -1.5);

        if (huevo) {
            huevo.scale.setScalar(Math.max(0.08, 1 - suave * 0.9));
            huevo.rotation.z = suave * 0.2;
            huevo.userData.luz.intensity = 8;
        }

        if (flash) flash.style.opacity = String(Math.max(0, 0.75 - suave));

        if (progreso > 0.28 && !pollo) {
            const r = resultado || abrirHuevo("huevo_noob") || "noob";
            crearPollo(r);
        }

        setDialogo("¡NACE!", "El huevo noob acaba de abrirse.");
    }

    if (fase === FASES.RESULTADO) {
        if (huevo) huevo.visible = false;
        if (pollo) {
            pollo.visible = true;
            pollo.position.y = 0.7 + Math.abs(Math.sin(tiempo * 5)) * 0.12;
            pollo.rotation.y += delta * 1.2;
            const s = 0.78 + suave * 0.25;
            pollo.scale.setScalar(s);
        }

        camara.position.set(
            0,
            1.5,
            2.7 - suave * 0.35
        );
        mirarCamara(0, 0.9, -1.5);
        setDialogo(
            resultado === "zombie" ? "🐔 ZOMBIE" :
            resultado === "pollito_noob" ? "🐣 POLLITO NOOB" :
            "🐔 NOOB",
            "Primer nacimiento de la nueva cinemática 3D."
        );
    }

    if (fase === FASES.CIERRE) {
        ocultarDialogo();
        if (flash) flash.style.opacity = String(suave * 0.95);
        camara.position.set(0, 3.4, 8 - suave * 4);
        mirarCamara(0, 1.1, -1);
    }
}

function loop() {
    if (!activa) return;

    const delta = Math.min(reloj.getDelta(), 0.05);

    actualizarFase(delta);
    actualizarFX(delta);

    renderer.render(escena, camara);
    raf = requestAnimationFrame(loop);
}

function actualizarFX(delta) {
    for (const p of polvo) {
        p.position.y += p.userData.v * delta * 8;
        p.position.x += Math.sin((tiempo + p.position.z) * 0.35) * delta * 0.12;

        if (p.position.y > 6) {
            p.position.y = 0;
        }
    }
}

function finalizar() {
    finalizada = true;
    activa = false;
    if (flash) flash.style.opacity = "0";
    if (texto) texto.style.opacity = "0";
    if (subtitulo) subtitulo.style.opacity = "0";

    setTimeout(() => {
        const hud = document.getElementById("cinematicaHUDV1");
        if (hud) hud.remove();
    }, 350);
}

function detener() {
    activa = false;
    finalizada = false;
    cancelAnimationFrame(raf);

    const hud = document.getElementById("cinematicaHUDV1");
    if (hud) hud.remove();

    if (renderer) {
        renderer.dispose();
        if (renderer.domElement?.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    window.removeEventListener("resize", redimensionar);

    escena = null;
    camara = null;
    renderer = null;
    mike = null;
    micaela = null;
    huevo = null;
    pollo = null;
    polvo = [];
}

function redimensionar() {
    if (!camara || !renderer) return;
    camara.aspect = innerWidth / innerHeight;
    camara.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", redimensionar);
