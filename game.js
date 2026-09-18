import {
  iniciarCinematica,
  cinematicaTerminada
} from "./3D/escenaCinematica.js?v=20260918";

const game = document.getElementById("game");
if (!game) throw new Error("No se encontró #game");

game.innerHTML = "";

const cover = document.createElement("div");
cover.id = "eggaroCover";
Object.assign(cover.style, {
  position: "fixed",
  inset: "0",
  zIndex: "99999",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 50% 40%, rgba(126,164,111,.28), transparent 34%), linear-gradient(145deg,#183326,#0b1913 52%,#020504)",
  color: "#fff"
});

const glow = document.createElement("div");
Object.assign(glow.style, {
  position: "absolute",
  width: "85vw",
  height: "85vw",
  maxWidth: "780px",
  maxHeight: "780px",
  borderRadius: "50%",
  background: "radial-gradient(circle,rgba(232,195,106,.20),transparent 68%)",
  filter: "blur(12px)",
  pointerEvents: "none"
});

const title = document.createElement("div");
title.textContent = "EGGARO";
Object.assign(title.style, {
  position: "relative",
  zIndex: "2",
  color: "#f4e7bf",
  fontFamily: "Arial Black,Arial,sans-serif",
  fontSize: "clamp(72px,20vw,210px)",
  fontWeight: "1000",
  lineHeight: ".82",
  letterSpacing: ".10em",
  paddingLeft: ".10em",
  textAlign: "center",
  textShadow: "0 0 42px rgba(232,195,106,.35),0 16px 45px rgba(0,0,0,.95)"
});

const line = document.createElement("div");
Object.assign(line.style, {
  position: "relative",
  zIndex: "2",
  width: "min(360px,65vw)",
  height: "2px",
  margin: "24px 0 14px",
  background: "linear-gradient(90deg,transparent,#e8c36a,transparent)"
});

const subtitle = document.createElement("div");
subtitle.textContent = "LA GRANJA DESPERTÓ";
Object.assign(subtitle.style, {
  position: "relative",
  zIndex: "2",
  fontFamily: "Arial,sans-serif",
  fontSize: "clamp(12px,3vw,20px)",
  fontWeight: "700",
  letterSpacing: ".34em",
  color: "#e2ebe5",
  textAlign: "center"
});

const play = document.createElement("button");
play.type = "button";
play.textContent = "JUGAR";
Object.assign(play.style, {
  position: "relative",
  zIndex: "3",
  marginTop: "clamp(40px,8vh,72px)",
  width: "min(330px,78vw)",
  height: "72px",
  border: "2px solid #e8c36a",
  borderRadius: "20px",
  background: "linear-gradient(180deg,#456f55,#1c3327)",
  color: "#fff4d6",
  fontFamily: "Arial Black,Arial,sans-serif",
  fontSize: "clamp(22px,5vw,31px)",
  fontWeight: "900",
  letterSpacing: ".22em",
  boxShadow: "0 18px 55px rgba(0,0,0,.6)",
  cursor: "pointer"
});

const footer = document.createElement("div");
footer.textContent = "UNA HISTORIA DE EGGARO";
Object.assign(footer.style, {
  position: "absolute",
  bottom: "5%",
  color: "rgba(224,235,229,.55)",
  fontFamily: "Arial,sans-serif",
  fontSize: "10px",
  letterSpacing: ".28em"
});

cover.append(glow, title, line, subtitle, play, footer);
game.appendChild(cover);

let started = false;

play.addEventListener("click", () => {
  if (started) return;
  started = true;
  play.disabled = true;
  cover.style.transition = "opacity .65s ease,transform .65s ease";
  cover.style.opacity = "0";
  cover.style.transform = "scale(1.035)";

  setTimeout(() => {
    cover.remove();
    try {
      iniciarCinematica(game);
      waitForEnd();
    } catch (error) {
      console.error("[EGGARO] Error al cargar la cinemática:", error);
      showError(error);
    }
  }, 660);
});

function waitForEnd() {
  if (cinematicaTerminada()) {
    const screen = document.createElement("div");
    Object.assign(screen.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      background: "#000"
    });
    game.appendChild(screen);
    return;
  }
  requestAnimationFrame(waitForEnd);
}

function showError(error) {
  const panel = document.createElement("div");
  Object.assign(panel.style, {
    position: "fixed",
    inset: "0",
    zIndex: "100001",
    background: "#080909",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
    fontFamily: "Arial,sans-serif"
  });

  const title = document.createElement("h2");
  title.textContent = "EGGARO";
  const message = document.createElement("p");
  message.textContent = "No se pudo iniciar la cinemática.";
  const detail = document.createElement("p");
  detail.textContent = String(error);
  detail.style.cssText = "opacity:.65;font-size:12px;max-width:90%;word-break:break-word";
  const retry = document.createElement("button");
  retry.textContent = "RECARGAR";
  retry.style.cssText = "margin-top:20px;padding:14px 26px;border-radius:12px;border:0;font-size:17px";
  retry.addEventListener("click", () => location.reload());

  panel.append(title, message, detail, retry);
  game.appendChild(panel);
}