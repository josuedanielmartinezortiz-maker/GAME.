import { iniciarEscenaMenu } from "./3D/escenaMenu.js";

import {
    iniciarCinematica,
    cinematicaTerminada
} from "./3D/escenaCinematica.js";

const game = document.getElementById("game");

if (!game) {
    throw new Error("No se encontró el elemento #game");
}

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
    pointerEvents: "none",
    background: "radial-gradient(circle at 50% 35%, rgba(37,77,70,.18), rgba(2,5,7,.56))"
});

const marca = document.createElement("div");
marca.textContent = "EGARO";
Object.assign(marca.style, {
    position: "absolute",
    top: "15%",
    left: "0",
    width: "100%",
    textAlign: "center",
    color: "#f2e5bd",
    fontSize: "clamp(58px,15vw,150px)",
    fontWeight: "1000",
    letterSpacing: ".22em",
    textShadow: "0 0 28px rgba(232,195,106,.4), 0 8px 30px #000",
    fontFamily: "Arial Black, Arial, sans-serif"
});

const subtitulo = document.createElement("div");
subtitulo.textContent = "UNA NUEVA AVENTURA";
Object.assign(subtitulo.style, {
    position: "absolute",
    top: "31%",
    width: "100%",
    textAlign: "center",
    color: "#c9d9d2",
    fontSize: "clamp(11px,2.4vw,18px)",
    letterSpacing: ".45em",
    textShadow: "0 3px 12px #000"
});

const playButton = document.createElement("button");
playButton.id = "playButton";
playButton.type = "button";
playButton.textContent = "JUGAR";

Object.assign(playButton.style, {
    position: "relative",
    zIndex: "100000",
    pointerEvents: "auto",
    width: "min(280px,72vw)",
    height: "74px",
    border: "2px solid rgba(242,229,189,.85)",
    borderRadius: "999px",
    background: "linear-gradient(180deg, rgba(42,63,55,.94), rgba(10,18,17,.96))",
    color: "#f8edcf",
    fontSize: "clamp(22px,5vw,30px)",
    fontWeight: "900",
    letterSpacing: ".18em",
    cursor: "pointer",
    boxShadow: "0 12px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.15)"
});

inicio.append(marca, subtitulo, playButton);
game.appendChild(inicio);

let menu = null;

try {
    menu = iniciarEscenaMenu(game);
    console.log("EGARO: menú cargado");
} catch (error) {
    console.error("EGARO: error cargando menú:", error);
}

playButton.addEventListener("click", function () {
    playButton.disabled = true;
    inicio.remove();

    if (menu && menu.renderer && menu.renderer.domElement) {
        menu.renderer.domElement.remove();
    }

    try {
        iniciarCinematica(game);
        comprobarCinematica();
    } catch (error) {
        console.error("EGARO: error iniciando cinemática:", error);
        mostrarError(error);
    }
});

function comprobarCinematica() {
    try {
        if (cinematicaTerminada()) {
            iniciarGranja();
            return;
        }
    } catch (error) {
        mostrarError(error);
        return;
    }

    requestAnimationFrame(comprobarCinematica);
}

function iniciarGranja() {
    const anterior = document.getElementById("pantallaGranja");
    if (anterior) anterior.remove();

    const pantalla = document.createElement("div");
    pantalla.id = "pantallaGranja";

    Object.assign(pantalla.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100dvh",
        background: "radial-gradient(circle at 50% 25%, #4d8760, #13271e 72%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "90000",
        fontFamily: "Arial, sans-serif"
    });

    const contenido = document.createElement("div");
    contenido.textContent = "🌾 EGARO";
    Object.assign(contenido.style, {
        color: "#f2e5bd",
        fontSize: "clamp(42px,10vw,76px)",
        fontWeight: "900",
        letterSpacing: ".12em",
        textShadow: "0 6px 22px #000"
    });

    pantalla.appendChild(contenido);
    game.appendChild(pantalla);
}

function mostrarError(error) {
    let panel = document.getElementById("errorGame");

    if (!panel) {
        panel = document.createElement("div");
        panel.id = "errorGame";

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

    panel.innerHTML = "";
    const title = document.createElement("h2");
    title.textContent = "EGARO";
    const msg = document.createElement("p");
    msg.textContent = "Se produjo un error al cargar el juego.";
    const detail = document.createElement("p");
    detail.textContent = String(error);
    detail.style.cssText = "font-size:12px;opacity:.7;max-width:90%;word-break:break-word";
    const button = document.createElement("button");
    button.textContent = "RECARGAR";
    button.style.cssText = "margin-top:20px;padding:14px 25px;font-size:18px;border-radius:10px";
    button.addEventListener("click", function () { location.reload(); });
    panel.append(title, msg, detail, button);
}
