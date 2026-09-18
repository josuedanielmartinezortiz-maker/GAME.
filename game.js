import {
  iniciarCinematica,
  cinematicaTerminada
} from "./3D/escenaCinematica.js";

const game = document.getElementById("game");

if (!game) throw new Error("No se encontró #game");

game.innerHTML = "";
Object.assign(game.style, {
  position: "relative",
  width: "100%",
  minHeight: "100dvh",
  overflow: "hidden",
  background: "#050807"
});

// ============================================================
// EK GARO — PORTADA NUEVA
// ============================================================

const cover = document.createElement("div");
cover.id = "gairoCover";

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
    "radial-gradient(circle at 50% 42%, rgba(116,161,104,.25), transparent 32%), linear-gradient(145deg,#183326 0%,#0b1913 45%,#020504 100%)",
  color: "#fff"
});

const glow = document.createElement("div");
Object.assign(glow.style, {
  position: "absolute",
  width: "80vw",
  height: "80vw",
  maxWidth: "760px",
  maxHeight: "760px",
  borderRadius: "50%",
  background: "radial-gradient(circle,rgba(232,195,106,.22),transparent 68%)",
  filter: "blur(10px)"
});

const name = document.createElement("div");
name.textContent = "EK GARO";

Object.assign(name.style, {
  position: "relative",
  zIndex: "2",
  color: "#f4e7bf",
  fontFamily: "Arial Black,Arial,sans-serif",
  fontSize: "clamp(88px,22vw,210px)",
  fontWeight: "1000",
  lineHeight: ".8",
  letterSpacing: ".10em",
  paddingLeft: ".10em",
  textAlign: "center",
  textShadow:
    "0 0 42px rgba(232,195,106,.35),0 16px 45px rgba(0,0,0,.95)"
});

const line = document.createElement("div");
Object.assign(line.style, {
  position: "relative",
  zIndex: "2",
  width: "min(360px,65vw)",
  height: "2px",
  margin: "26px 0 15px",
  background: "linear-gradient(90deg,transparent,#e8c36a,transparent)"
});

const subtitle = document.createElement("div");
subtitle.textContent = "LA GRANJA DESPERTÓ";

Object.assign(subtitle.style, {
  position: "relative",
  zIndex: "2",
  fontFamily: "Arial,sans-serif",
  fontSize: "clamp(13px,3vw,21px)",
  fontWeight: "700",
  letterSpacing: ".35em",
  color: "#e2ebe5",
  textAlign: "center"
});

const play = document.createElement("button");
play.type = "button";
play.textContent = "JUGAR";

Object.assign(play.style, {
  position: "relative",
  zIndex: "3",
  marginTop: "clamp(42px,8vh,72px)",
  width: "min(330px,78vw)",
  height: "74px",
  border: "2px solid #e8c36a",
  borderRadius: "20px",
  background: "linear-gradient(180deg,#456f55,#1c3327)",
  color: "#fff4d6",
  fontFamily: "Arial Black,Arial,sans-serif",
  fontSize: "clamp(22px,5vw,31px)",
  fontWeight: "900",
  letterSpacing: ".25em",
  boxShadow: "0 18px 55px rgba(0,0,0,.6)",
  cursor: "pointer"
});

const footer = document.createElement("div");
footer.textContent = "UNA HISTORIA DE EK GARO";

Object.assign(footer.style, {
  position: "absolute",
  bottom: "5%",
  color: "rgba(224,235,229,.55)",
  fontFamily: "Arial,sans-serif",
  fontSize: "10px",
  letterSpacing: ".28em"
});

cover.append(glow, name, line, subtitle, play, footer);
game.appendChild(cover);

let started = false;

play.addEventListener("click", () => {
  if (started) return;
  started = true;
  play.disabled = true;

  cover.style.transition = "opacity .7s ease,transform .7s ease";
  cover.style.opacity = "0";
  cover.style.transform = "scale(1.035)";

  setTimeout(() => {
    cover.remove();

    try {
      iniciarCinematica(game);
      waitForEnd();
    } catch (error) {
      showError(error);
    }
  }, 720);
});

function waitForEnd() {
  if (cinematicaTerminada()) {
    showGameStart();
    return;
  }
  requestAnimationFrame(waitForEnd);
}

// Pantalla negra: punto exacto donde continuará el juego real.
function showGameStart() {
  const screen = document.createElement("div");
  Object.assign(screen.style, {
    position: "fixed",
    inset: "0",
    zIndex: "100000",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial,sans-serif"
  });

  const text = document.createElement("div");
  text.textContent = "";
  screen.appendChild(text);
  game.appendChild(screen);
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
  title.textContent = "EK GARO";

  const message = document.createElement("p");
  message.textContent = "No se pudo iniciar la cinemática.";

  const detail = document.createElement("p");
  detail.textContent = String(error);
  detail.style.opacity = ".65";
  detail.style.fontSize = "12px";
  detail.style.maxWidth = "90%";
  detail.style.wordBreak = "break-word";

  const retry = document.createElement("button");
  retry.textContent = "RECARGAR";
  retry.style.cssText =
    "margin-top:20px;padding:14px 26px;border-radius:12px;border:0;font-size:17px";
  retry.addEventListener("click", () => location.reload());

  panel.append(title, message, detail, retry);
  game.appendChild(panel);
}
