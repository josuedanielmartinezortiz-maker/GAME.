// ============================================================
// GAMERPRO GAME
// game.js
// ============================================================

import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

// ============================================================
// ELEMENTOS
// ============================================================

const game =
    document.getElementById("game");

const playButton =
    document.getElementById("playButton");

// ============================================================
// INICIAR MENÚ 3D
// ============================================================

iniciarEscenaMenu(game);

// ============================================================
// BOTÓN PLAY
// ============================================================

playButton.addEventListener(
    "click",
    () => {

        const inicio =
            document.getElementById("inicio");

        if (inicio) {
            inicio.style.display = "none";
        }

        console.log(
            "🎮 PLAY presionado"
        );

        // Aquí conectaremos después
        // la INTRO del juego.
    }
);
