import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

const game = document.getElementById("game");
const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {

    const inicio =
        document.getElementById("inicio");

    if (inicio) {
        inicio.style.display = "none";
    }

    iniciarEscenaMenu(game);
});
