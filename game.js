import {
    iniciarCinematica,
    cinematicaTerminada
} from "./3D/escenaCinematica.js";

const game = document.getElementById("game");

if (!game) {
    throw new Error("No se encontró el elemento #game");
}

game.innerHTML = "";
Object.assign(game.style, {
    position: "relative",
    width: "100%",
    minHeight: "100dvh",
    overflow: "hidden",
    background: "#07110f"
});

// ============================================================
// PORTADA EGARO — una sola capa, sin escena 3D debajo
// ============================================================

const inicio = document.createElement("div");
inicio.id = "inicio";
Object.assign(inicio.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    color: "#fff",
    background:
        "radial-gradient(circle at 50% 38%, rgba(91,151,122,.30) 0%, rgba(22,51,43,.22) 28%, rgba(2,7,8,.82) 78%), linear-gradient(145deg,#102b25 0%,#081513 48%,#020506 100%)",
    fontFamily: "Arial Black, Arial, sans-serif"
});

const aura = document.createElement("div");
Object.assign(aura.style, {
    position: "absolute",
    width: "75vw",
    height: "75vw",
    maxWidth: "720px",
    maxHeight: "720px",
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(232,195,106,.20),rgba(91,151,122,.07) 42%,transparent 70%)",
    filter: "blur(8px)",
    pointerEvents: "none"
});

const eyebrow = document.createElement("div");
eyebrow.textContent = "UNA AVENTURA ORIGINAL";
Object.assign(eyebrow.style, {
    position: "relative",
    zIndex: "2",
    marginBottom: "14px",
    color: "#b9d7c9",
    fontFamily: "Arial, sans-serif",
    fontSize: "clamp(10px,2.4vw,15px)",
    fontWeight: "700",
    letterSpacing: ".38em",
    textAlign: "center"
});

const marca = document.createElement("div");
marca.textContent = "EGARO";
Object.assign(marca.style, {
    position: "relative",
    zIndex: "2",
    color: "#f4e6bd",
    fontSize: "clamp(64px,17vw,156px)",
    lineHeight: ".88",
    fontWeight: "1000",
    letterSpacing: ".16em",
    paddingLeft: ".16em",
    textAlign: "center",
    textShadow: "0 0 34px rgba(232,195,106,.30), 0 12px 34px rgba(0,0,0,.85)"
});

const linea = document.createElement("div");
Object.assign(linea.style, {
    position: "relative",
    zIndex: "2",
    width: "min(260px,55vw)",
    height: "1px",
    margin: "20px 0 12px",
    background: "linear-gradient(90deg,transparent,#e8c36a,transparent)"
});

const subtitulo = document.createElement("div");
subtitulo.textContent = "UNA NUEVA AVENTURA";
Object.assign(subtitulo.style, {
    position: "relative",
    zIndex: "2",
    color: "#e0e9e3",
    fontFamily: "Arial, sans-serif",
    fontSize: "clamp(12px,2.7vw,19px)",
    fontWeight: "700",
    letterSpacing: ".32em",
    textAlign: "center"
});

const playButton = document.createElement("button");
playButton.id = "playButton";
playButton.type = "button";
playButton.textContent = "JUGAR";
Object.assign(playButton.style, {
    position: "relative",
    zIndex: "3",
    marginTop: "clamp(34px,7vh,58px)",
    width: "min(310px,76vw)",
    height: "68px",
    border: "1px solid rgba(242,229,189,.9)",
    borderRadius: "18px",
    background: "linear-gradient(180deg,#3b654f 0%,#1b3329 100%)",
    color: "#fff3d2",
    fontFamily: "Arial Black, Arial, sans-serif",
    fontSize: "clamp(20px,5vw,28px)",
    fontWeight: "900",
    letterSpacing: ".24em",
    cursor: "pointer",
    boxShadow: "0 16px 45px rgba(0,0,0,.52), inset 0 1px 0 rgba(255,255,255,.22)"
});

const version = document.createElement("div");
version.textContent = "EGARO • HISTORIA PRINCIPAL";
Object.assign(version.style, {
    position: "absolute",
    zIndex: "2",
    bottom: "5.5%",
    color: "rgba(220,233,226,.62)",
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: ".24em",
    textAlign: "center"
});

inicio.append(aura, eyebrow, marca, linea, subtitulo, playButton, version);
game.appendChild(inicio);

let launched = false;

playButton.addEventListener("click", function () {
    if (launched) return;
    launched = true;
    playButton.disabled = true;

    inicio.style.transition = "opacity .55s ease, transform .55s ease";
    inicio.style.opacity = "0";
    inicio.style.transform = "scale(1.035)";

    setTimeout(function () {
        inicio.remove();

        try {
            iniciarCinematica(game);
            comprobarCinematica();
        } catch (error) {
            console.error("EGARO: error iniciando cinemática:", error);
            mostrarError(error);
        }
    }, 560);
});

function comprobarCinematica() {
    if (cinematicaTerminada()) {
        iniciarGranja();
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
        zIndex: "90000",
        background: "radial-gradient(circle at 50% 25%,#4d8760,#13271e 72%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial,sans-serif"
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
