// =====================================================
// 🎮 GAMERPRO GAME — GAME.JS
// =====================================================

import {
    iniciarCinematica
} from "./3D/cinematica.js";


// =====================================================
// 🎮 CONTENEDOR PRINCIPAL
// =====================================================

const game =
    document.getElementById("game");


// =====================================================
// ▶️ BOTÓN PLAY
// =====================================================

const playButton =
    document.getElementById("playButton");


playButton.addEventListener(
    "click",
    () => {

        // Ocultar pantalla inicial
        const inicio =
            document.getElementById("inicio");

        if (inicio) {
            inicio.style.display = "none";
        }


        // Iniciar experiencia 3D
        iniciarCinematica(game);

    }
);
