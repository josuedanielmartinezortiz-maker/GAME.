import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

import {
    iniciarCinematica,
    cinematicaTerminada
} from "./3D/escenaCinematica.js";

// ============================================================
// CONTENEDOR PRINCIPAL
// ============================================================

const game = document.getElementById("game");

if (!game) {
    throw new Error("No se encontró el elemento #game");
}

// ============================================================
// MENÚ PRINCIPAL
// ============================================================

const inicio = document.createElement("div");

inicio.id = "inicio";

Object.assign(inicio.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "99999",
    pointerEvents: "none"
});

// ============================================================
// BOTÓN PLAY
// ============================================================

const playButton = document.createElement("button");

playButton.id = "playButton";
playButton.type = "button";
playButton.textContent = "PLAY";

Object.assign(playButton.style, {
    position: "relative",
    zIndex: "100000",
    pointerEvents: "auto",
    width: "220px",
    height: "80px",
    border: "4px solid white",
    borderRadius: "16px",
    background: "rgba(0,0,0,0.70)",
    color: "white",
    fontSize: "32px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 25px rgba(0,0,0,0.6)"
});

inicio.appendChild(playButton);
game.appendChild(inicio);

// ============================================================
// MENÚ
// ============================================================

let menu = null;

try {
    menu = iniciarEscenaMenu(game);
    console.log("✅ MENÚ CARGADO");
} catch (error) {
    console.error("❌ Error cargando menú:", error);
}

// ============================================================
// PLAY
// ============================================================

playButton.addEventListener("click", () => {

    console.log("🎮 PLAY PRESIONADO");

    playButton.disabled = true;

    inicio.remove();

    // Detener visualmente el menú
    if (
        menu &&
        menu.renderer &&
        menu.renderer.domElement
    ) {
        menu.renderer.domElement.remove();
    }

    console.log("🎬 INICIANDO CINEMÁTICA");

    try {

        iniciarCinematica(game);

        comprobarCinematica();

    } catch (error) {

        console.error(
            "❌ ERROR INICIANDO CINEMÁTICA:",
            error
        );

        mostrarError(error);
    }
});

// ============================================================
// COMPROBAR CINEMÁTICA
// ============================================================

function comprobarCinematica() {

    try {

        if (cinematicaTerminada()) {

            console.log(
                "🌾 CINEMÁTICA TERMINADA"
            );

            iniciarGranja();

            return;
        }

    } catch (error) {

        console.error(
            "❌ ERROR COMPROBANDO CINEMÁTICA:",
            error
        );

        mostrarError(error);

        return;
    }

    requestAnimationFrame(
        comprobarCinematica
    );
}

// ============================================================
// GRANJA TEMPORAL
// ============================================================

function iniciarGranja() {

    console.log(
        "🌾 INICIANDO GRANJA"
    );

    const anterior =
        document.getElementById(
            "pantallaGranja"
        );

    if (anterior) {
        anterior.remove();
    }

    const pantalla =
        document.createElement("div");

    pantalla.id =
        "pantallaGranja";

    Object.assign(pantalla.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100dvh",
        background:
            "linear-gradient(#87ceeb, #7bb35a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "90000"
    });

    const texto =
        document.createElement("div");

    texto.textContent =
        "🌾 GRANJA";

    Object.assign(texto.style, {
        color: "white",
        fontSize: "48px",
        fontWeight: "bold",
        textShadow:
            "0 4px 10px rgba(0,0,0,0.6)"
    });

    pantalla.appendChild(texto);
    game.appendChild(pantalla);

    console.log(
        "🐔 La granja está lista para conectar."
    );
}

// ============================================================
// ERROR VISIBLE
// ============================================================

function mostrarError(error) {

    let panel =
        document.getElementById(
            "errorGame"
        );

    if (!panel) {

        panel =
            document.createElement("div");

        panel.id =
            "errorGame";

        Object.assign(panel.style, {
            position: "fixed",
            inset: "0",
            zIndex: "999999",
            background: "#111",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            textAlign: "center",
            fontFamily: "Arial"
        });

        game.appendChild(panel);
    }

    panel.innerHTML = `
        <h2>⚠️ GAMERPRO GAME</h2>
        <p>Se produjo un error al cargar el juego.</p>
        <p style="font-size:12px;opacity:.7;max-width:90%;">
            ${String(error)}
        </p>
        <button
            onclick="location.reload()"
            style="
                margin-top:20px;
                padding:14px 25px;
                font-size:18px;
                border-radius:10px;
            "
        >
            🔄 RECARGAR
        </button>
    `;
}
