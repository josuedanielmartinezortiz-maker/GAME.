import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

import {
    iniciarCinematica,
    cinematicaTerminada,
    detenerCinematica
} from "./3D/escenaCinematica.js";


// ============================================================
// CONTENEDOR PRINCIPAL
// ============================================================

const game =
    document.getElementById("game");

if (!game) {
    throw new Error(
        "No se encontró el elemento #game"
    );
}


// ============================================================
// MENÚ PRINCIPAL
// ============================================================

const inicio =
    document.createElement("div");

inicio.id = "inicio";

inicio.style.position = "fixed";
inicio.style.inset = "0";
inicio.style.width = "100vw";
inicio.style.height = "100dvh";

inicio.style.display = "flex";
inicio.style.alignItems = "center";
inicio.style.justifyContent = "center";

inicio.style.zIndex = "99999";

inicio.style.pointerEvents = "none";


// ============================================================
// BOTÓN PLAY
// ============================================================

const playButton =
    document.createElement("button");

playButton.id = "playButton";

playButton.type = "button";

playButton.textContent = "PLAY";

playButton.style.position = "relative";
playButton.style.zIndex = "100000";

playButton.style.pointerEvents = "auto";

playButton.style.width = "220px";
playButton.style.height = "80px";

playButton.style.border =
    "4px solid white";

playButton.style.borderRadius =
    "16px";

playButton.style.background =
    "rgba(0,0,0,0.70)";

playButton.style.color =
    "white";

playButton.style.fontSize =
    "32px";

playButton.style.fontWeight =
    "bold";

playButton.style.cursor =
    "pointer";

playButton.style.boxShadow =
    "0 0 25px rgba(0,0,0,0.6)";


// ============================================================
// AGREGAR MENÚ
// ============================================================

inicio.appendChild(
    playButton
);

game.appendChild(
    inicio
);


// ============================================================
// ESCENA DEL MENÚ
// ============================================================

const menu =
    iniciarEscenaMenu(game);


// ============================================================
// PLAY
// ============================================================

playButton.addEventListener(
    "click",
    async () => {

        console.log(
            "🎮 PLAY PRESIONADO"
        );

        playButton.disabled = true;

        inicio.remove();


        // ====================================================
        // DETENER MENÚ
        // ====================================================

        if (
            menu &&
            menu.renderer &&
            menu.renderer.domElement
        ) {

            menu.renderer.domElement.remove();
        }


        // ====================================================
        // INICIAR CINEMÁTICA
        // ====================================================

        console.log(
            "🎬 INICIANDO CINEMÁTICA"
        );


        try {

            await iniciarCinematica(
                game
            );

            console.log(
                "🎬 CINEMÁTICA INICIALIZADA"
            );

            comprobarCinematica();

        } catch (error) {

            console.error(
                "❌ ERROR AL INICIAR CINEMÁTICA:",
                error
            );

            mostrarErrorCinematica(
                error
            );

        }

    }
);


// ============================================================
// COMPROBAR CINEMÁTICA
// ============================================================

function comprobarCinematica() {

    if (
        cinematicaTerminada()
    ) {

        console.log(
            "🌾 CINEMÁTICA TERMINADA"
        );

        detenerCinematica();

        iniciarGranja();

        return;
    }


    requestAnimationFrame(
        comprobarCinematica
    );
}


// ============================================================
// ERROR DE CINEMÁTICA
// ============================================================

function mostrarErrorCinematica(
    error
) {

    const pantalla =
        document.createElement("div");

    pantalla.style.position =
        "fixed";

    pantalla.style.inset =
        "0";

    pantalla.style.zIndex =
        "999999";

    pantalla.style.background =
        "#111";

    pantalla.style.color =
        "white";

    pantalla.style.display =
        "flex";

    pantalla.style.flexDirection =
        "column";

    pantalla.style.alignItems =
        "center";

    pantalla.style.justifyContent =
        "center";

    pantalla.style.padding =
        "25px";

    pantalla.style.textAlign =
        "center";

    const titulo =
        document.createElement("div");

    titulo.textContent =
        "❌ Error al cargar la cinemática";

    titulo.style.fontSize =
        "26px";

    titulo.style.fontWeight =
        "bold";

    titulo.style.marginBottom =
        "15px";


    const detalle =
        document.createElement("div");

    detalle.textContent =
        error?.message ||
        String(error);

    detalle.style.fontSize =
        "15px";

    detalle.style.maxWidth =
        "700px";

    detalle.style.wordBreak =
        "break-word";


    pantalla.appendChild(
        titulo
    );

    pantalla.appendChild(
        detalle
    );

    game.appendChild(
        pantalla
    );
}


// ============================================================
// INICIAR GRANJA
// ============================================================

function iniciarGranja() {

    console.log(
        "🌾 INICIANDO GRANJA"
    );


    const pantalla =
        document.createElement("div");

    pantalla.id =
        "pantallaGranja";

    pantalla.style.position =
        "fixed";

    pantalla.style.inset =
        "0";

    pantalla.style.width =
        "100vw";

    pantalla.style.height =
        "100dvh";

    pantalla.style.background =
        "linear-gradient(#87ceeb, #7bb35a)";

    pantalla.style.display =
        "flex";

    pantalla.style.alignItems =
        "center";

    pantalla.style.justifyContent =
        "center";

    pantalla.style.zIndex =
        "90000";


    const texto =
        document.createElement("div");

    texto.textContent =
        "🌾 GRANJA";

    texto.style.color =
        "white";

    texto.style.fontSize =
        "48px";

    texto.style.fontWeight =
        "bold";

    texto.style.textShadow =
        "0 4px 10px rgba(0,0,0,0.6)";


    pantalla.appendChild(
        texto
    );

    game.appendChild(
        pantalla
    );


    console.log(
        "🐔 La granja está lista para conectar."
    );
}
// =====================================================
// 🔎 DIAGNÓSTICO DEL GLB DE MIKE
// No modifica el modelo ni sus animaciones.
// =====================================================

async function diagnosticarMikeGLB() {

  // Cambia este nombre SOLO si tu archivo tiene otro nombre.
  const RUTA_MIKE = "./3D/mike.glb";

  const loader = new THREE.GLTFLoader();

  try {

    console.log("====================================");
    console.log("🔎 DIAGNÓSTICO MIKE.GLb");
    console.log("====================================");

    const gltf = await loader.loadAsync(RUTA_MIKE);

    const modelo = gltf.scene;

    console.log("✅ GLB cargado correctamente");
    console.log("📦 Modelo:", modelo);
    console.log("🎞️ Animaciones:", gltf.animations.length);

    // -------------------------------------------------
    // Animaciones existentes
    // -------------------------------------------------

    if (gltf.animations.length === 0) {
      console.log("⚠️ Mike NO tiene animaciones dentro del GLB.");
    } else {
      console.log("🎬 Animaciones encontradas:");

      gltf.animations.forEach((clip, i) => {
        console.log(
          `${i + 1}. ${clip.name} | duración: ${clip.duration.toFixed(2)}s`
        );
      });
    }

    // -------------------------------------------------
    // Buscar SkinnedMesh / Skeleton
    // -------------------------------------------------

    let encontrados = 0;

    modelo.traverse((obj) => {

      if (!obj.isSkinnedMesh) return;

      encontrados++;

      console.log("------------------------------------");
      console.log("🦴 SKINNED MESH ENCONTRADO");
      console.log("Nombre:", obj.name);

      if (!obj.skeleton) {
        console.log("❌ No tiene skeleton.");
        return;
      }

      const huesos = obj.skeleton.bones;

      console.log("🦴 Cantidad de huesos:", huesos.length);

      console.log("📋 Nombres de huesos:");

      huesos.forEach((bone, index) => {
        console.log(`${index}: ${bone.name}`);
      });

    });

    if (encontrados === 0) {
      console.log("❌ NO se encontró ningún SkinnedMesh.");
      console.log("Esto significa que el GLB podría no tener skinning.");
    }

    console.log("====================================");
    console.log("✅ DIAGNÓSTICO TERMINADO");
    console.log("====================================");

  } catch (error) {

    console.error("❌ ERROR CARGANDO MIKE.GLb");
    console.error(error);

  }
}


// Ejecutar diagnóstico
diagnosticarMikeGLB();
