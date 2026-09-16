// ============================================================
// GAMERPRO GAME
// probabilidades.js
// SOLO PROBABILIDADES DE HUEVOS Y OBTENCIONES
// ============================================================

export const HUEVOS = {

  huevo_noob: [
    ["noob", 98],
    ["zombie", 1],
    ["pollito_noob", 1]
  ],

  huevo_zombie: [
    ["zombie", 50],
    ["zombie_mutado", 50]
  ],

  huevo_infectado: [
    ["zombie", 50],
    ["momia", 49.9],
    ["mini_faraon", 0.1]
  ],

  huevo_arena: [
    ["potenciado", 20],
    ["coliseo", 10],
    ["deszombificado", 70]
  ],

  huevo_tienda: [
    ["lechero", 20],
    ["tendero", 50],
    ["stocks", 20],
    ["antiguo", 10]
  ],

  huevo_noob_zombificado: [
    ["noob", 94],
    ["zombie", 5],
    ["pollito_noob", 1]
  ],

  huevo_hibrido: [
    ["frito", 100]
  ],

  huevo_lacteo: [
    ["vaca", 10],
    ["lechero", 50],
    ["mantequilla", 20],
    ["lacteo", 20]
  ]

};


// ============================================================
// OBTENCIONES ESPECIALES
// ============================================================

export const OBTENCIONES = {

  huevo_arena: {
    probabilidadVictoria: 50
  },

  huevo_tienda: {
    probabilidadAparicion: 0.5,
    precio: 100
  }

};


// ============================================================
// HUEVO LÁCTEO EXTRA SEGÚN RAREZA
// ============================================================

export const LACTEO_POR_RAREZA = {

  comun: 10,
  raro: 20,
  epico: 30,
  mitico: 40,
  legendario: 50,
  especial: 60,
  exclusivo: 70

};


// ============================================================
// FUNCIÓN DE PROBABILIDAD
// ============================================================

export function tirarProbabilidad(lista) {

  const numero = Math.random() * 100;
  let acumulado = 0;

  for (const [resultado, porcentaje] of lista) {

    acumulado += porcentaje;

    if (numero < acumulado) {
      return resultado;
    }

  }

  return null;
}


// ============================================================
// ABRIR HUEVO
// ============================================================

export function abrirHuevo(tipo) {

  const posibilidades = HUEVOS[tipo];

  if (!posibilidades) {
    console.warn(
      `[GAMERPRO] Huevo no encontrado: ${tipo}`
    );
    return null;
  }

  return tirarProbabilidad(posibilidades);
}


// ============================================================
// HUEVO LÁCTEO EXTRA
// ============================================================

export function tirarHuevoLacteo(rareza) {

  const porcentaje =
    LACTEO_POR_RAREZA[rareza];

  if (porcentaje === undefined) {
    return false;
  }

  return (
    Math.random() * 100
  ) < porcentaje;

}


// ============================================================
// VALIDAR PROBABILIDADES
// ============================================================

export function validarProbabilidades() {

  for (const [nombre, lista]
    of Object.entries(HUEVOS)) {

    const total =
      lista.reduce(
        (suma, [, porcentaje]) =>
          suma + porcentaje,
        0
      );

    if (Math.abs(total - 100) > 0.001) {

      console.warn(
        `[GAMERPRO] ${nombre}: ${total}%`
      );

    }

  }

     }
