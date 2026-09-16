// ============================================================
// GAMERPRO GAME
// fusiones.js
// SOLO SISTEMA DE FUSIONES
// ============================================================

import {
  HUEVOS
} from "./probabilidades.js";


// ============================================================
// 16 POLLOS PRINCIPALES
// ============================================================

export const POLLOS = [

  "noob",
  "zombie",
  "zombie_mutado",
  "momia",
  "faraon",
  "potenciado",
  "coliseo",
  "deszombificado",
  "tendero",
  "lechero",
  "stocks",
  "antiguo",
  "vaca",
  "mantequilla",
  "lacteo",
  "frito"

];


// ============================================================
// 4 FUSIONES ESPECIALES
// ============================================================

export const FUSIONES_ESPECIALES = {

  "pollito_noob+pollito_noob": {
    resultado: "gen_pollito_noob"
  },

  "pollito_noob+mini_faraon": {
    resultado: "gen_pollito_faraonico"
  },

  "mini_faraon+pollito_noob": {
    resultado: "gen_pollito_faraonico"
  },

  "mini_faraon+mini_faraon": {
    resultado: "gen_mini_faraon"
  }

};


// ============================================================
// CREAR CLAVE
// ============================================================

function clave(a, b) {
  return `${a}+${b}`;
}


// ============================================================
// COMPROBAR FUSIÓN ESPECIAL
// ============================================================

export function obtenerFusionEspecial(a, b) {

  return (
    FUSIONES_ESPECIALES[clave(a, b)] ||
    FUSIONES_ESPECIALES[clave(b, a)] ||
    null
  );

}


// ============================================================
// REGLAS DE FUSIONES
// ============================================================

export const REGLAS_FUSION = {

  // ----------------------------------------------------------
  // NOOB + NOOB
  // ----------------------------------------------------------

  "noob+noob": {
    huevos: ["huevo_noob"],
    conserva: true
  },


  // ----------------------------------------------------------
  // NOOB + ZOMBIE
  // ----------------------------------------------------------

  "noob+zombie": {
    huevos: ["huevo_noob_zombificado"],
    conserva: true
  },


  // ----------------------------------------------------------
  // ZOMBIE + NOOB
  // ----------------------------------------------------------

  "zombie+noob": {
    huevos: ["huevo_noob_zombificado"],
    conserva: true
  },


  // ----------------------------------------------------------
  // ZOMBIE + DESZOMBIFICADO
  // ----------------------------------------------------------

  "zombie+deszombificado": {
    huevos: ["huevo_hibrido"],
    conserva: true
  },


  "deszombificado+zombie": {
    huevos: ["huevo_hibrido"],
    conserva: true
  },


  // ----------------------------------------------------------
  // DESZOMBIFICADO
  // ----------------------------------------------------------

  "deszombificado+noob": {
    huevos: [
      "huevo_noob",
      "huevo_zombie"
    ],
    conserva: true
  },

  "noob+deszombificado": {
    huevos: [
      "huevo_noob",
      "huevo_zombie"
    ],
    conserva: true
  },


  // ----------------------------------------------------------
  // FARAÓN
  // ----------------------------------------------------------

  "faraon+noob": {
    huevos: ["huevo_infectado"],
    conserva: true
  },

  "noob+faraon": {
    huevos: ["huevo_infectado"],
    conserva: true
  },


  // ----------------------------------------------------------
  // DESZOMBIFICADO + FARAÓN
  // ----------------------------------------------------------

  "deszombificado+faraon": {
    huevos: [
      "huevo_noob",
      "huevo_zombie",
      "huevo_infectado"
    ],
    conserva: true
  },

  "faraon+deszombificado": {
    huevos: [
      "huevo_noob",
      "huevo_zombie",
      "huevo_infectado"
    ],
    conserva: true
  },


  // ----------------------------------------------------------
  // VACA
  // ----------------------------------------------------------

  "vaca+noob": {
    huevos: ["huevo_lacteo"],
    conserva: true
  },

  "noob+vaca": {
    huevos: ["huevo_lacteo"],
    conserva: true
  },


  // ----------------------------------------------------------
  // LÁCTEO
  // ----------------------------------------------------------

  "lacteo+noob": {
    huevos: ["huevo_lacteo"],
    conserva: true
  },

  "noob+lacteo": {
    huevos: ["huevo_lacteo"],
    conserva: true
  }

};


// ============================================================
// OBTENER REGLA
// ============================================================

export function obtenerReglaFusion(a, b) {

  return (
    REGLAS_FUSION[clave(a, b)] ||
    REGLAS_FUSION[clave(b, a)] ||
    null
  );

}


// ============================================================
// REALIZAR FUSIÓN
// ============================================================

export function realizarFusion(a, b) {

  if (!a || !b) {
    return {
      correcta: false,
      error: "Faltan los dos pollos."
    };
  }


  // ----------------------------------------------------------
  // FUSIÓN ESPECIAL
  // ----------------------------------------------------------

  const especial =
    obtenerFusionEspecial(a, b);

  if (especial) {

    return {
      correcta: true,
      tipo: "especial",
      padres: [a, b],
      resultado: especial.resultado
    };

  }


  // ----------------------------------------------------------
  // FUSIÓN PRINCIPAL
  // ----------------------------------------------------------

  const regla =
    obtenerReglaFusion(a, b);

  return {

    correcta: true,

    tipo: "principal",

    padres: [a, b],

    resultado: null,

    huevos:
      regla?.huevos || [],

    conservaPadres:
      regla?.conserva ?? true

  };

}


// ============================================================
// GENERAR LAS 256 FUSIONES PRINCIPALES
// ============================================================

export function generar256Fusiones() {

  const fusiones = [];

  for (const a of POLLOS) {

    for (const b of POLLOS) {

      fusiones.push({

        id: fusiones.length + 1,

        padreA: a,

        padreB: b,

        clave: clave(a, b),

        regla:
          obtenerReglaFusion(a, b)

      });

    }

  }

  return fusiones;

}


// ============================================================
// TOTAL
// ============================================================

export const TOTAL_FUSIONES_PRINCIPALES = 256;

export const TOTAL_FUSIONES_ESPECIALES = 4;

export const TOTAL_FUSIONES = 260;


// ============================================================
// FIN
// ============================================================
