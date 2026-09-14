// ============================================================
// EGGARO
// game.js
// ============================================================

import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

// ============================================================
// CONTENEDOR
// ============================================================

const game = document.getElementById("game");

if (!game) {
    throw new Error("No se encontró #game");
}

// ============================================================
// CREAR CAPA DEL MENÚ
// ============================================================

const inicio = document.createElement("div");

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
// CREAR BOTÓN
// ============================================================

const playButton =
    document.createElement("button");

playButton.id = "playButton";

playButton.textContent = "PLAY";

playButton.type = "button";

playButton.style.position = "relative";
playButton.style.zIndex = "100000";

playButton.style.pointerEvents = "auto";

playButton.style.width = "220px";
playButton.style.height = "80px";

playButton.style.border = "4px solid white";
playButton.style.borderRadius = "16px";

playButton.style.background =
    "rgba(0, 0, 0, 0.70)";

playButton.style.color = "white";

playButton.style.fontSize = "32px";
playButton.style.fontWeight = "bold";

playButton.style.cursor = "pointer";

inicio.appendChild(playButton);

game.appendChild(inicio);

// ============================================================
// INICIAR ESCENA 3D
// ============================================================

iniciarEscenaMenu(game);

// ============================================================
// PLAY
// ============================================================

playButton.addEventListener(
    "click",
    () => {

        console.log("🎮 PLAY");

        inicio.remove();

        // Aquí conectaremos la INTRO.
    }
);
