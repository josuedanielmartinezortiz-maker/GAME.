import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

const game =
    document.getElementById("game");

const playButton =
    document.getElementById("playButton");

// Primero se crea la escena 3D.
iniciarEscenaMenu(game);

// PLAY
playButton.addEventListener("click", () => {

    const inicio =
        document.getElementById("inicio");

    if (inicio) {
        inicio.style.display = "none";
    }

    console.log("🎮 PLAY presionado");
});
