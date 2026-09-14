// =====================================================
// 🚶 GAMERPRO GAME — MOVIMIENTO 3D
// =====================================================

import * as THREE from "three";

// =====================================================
// 🚶 MOVER UN PERSONAJE
// =====================================================

export function moverPersonaje(
    personaje,
    destino,
    duracion = 10000
) {

    if (!personaje) {
        console.warn("⚠️ Personaje no encontrado.");
        return Promise.resolve();
    }

    const inicio =
        personaje.position.clone();

    const destinoVector =
        destino instanceof THREE.Vector3
            ? destino.clone()
            : new THREE.Vector3(
                destino.x ?? 0,
                destino.y ?? 0,
                destino.z ?? 0
            );

    const tiempoInicio =
        performance.now();

    return new Promise((resolver) => {

        function animar(tiempoActual) {

            let progreso =
                (tiempoActual - tiempoInicio) /
                duracion;

            progreso =
                Math.max(
                    0,
                    Math.min(progreso, 1)
                );

            // Suavizado:
            // empieza lento → acelera → termina lento
            const movimiento =
                progreso *
                progreso *
                (3 - 2 * progreso);

            personaje.position.lerpVectors(
                inicio,
                destinoVector,
                movimiento
            );

            if (progreso < 1) {

                requestAnimationFrame(animar);

            } else {

                personaje.position.copy(
                    destinoVector
                );

                resolver();
            }
        }

        requestAnimationFrame(animar);
    });
}


// =====================================================
// 👥 MOVER VARIOS PERSONAJES
// =====================================================

export async function moverPersonajes(
    personajes,
    destinos,
    duracion = 10000
) {

    if (!Array.isArray(personajes)) {
        console.warn(
            "⚠️ personajes debe ser un array."
        );

        return;
    }

    if (!Array.isArray(destinos)) {
        console.warn(
            "⚠️ destinos debe ser un array."
        );

        return;
    }

    const cantidad =
        Math.min(
            personajes.length,
            destinos.length
        );

    const movimientos = [];

    for (let i = 0; i < cantidad; i++) {

        movimientos.push(
            moverPersonaje(
                personajes[i],
                destinos[i],
                duracion
            )
        );
    }

    await Promise.all(movimientos);
}


// =====================================================
// 🧭 GIRAR HACIA UN PUNTO
// =====================================================

export function mirarHacia(
    personaje,
    objetivo
) {

    if (!personaje) return;

    const punto =
        objetivo instanceof THREE.Vector3
            ? objetivo
            : new THREE.Vector3(
                objetivo.x ?? 0,
                objetivo.y ?? 0,
                objetivo.z ?? 0
            );

    personaje.lookAt(
        punto.x,
        personaje.position.y,
        punto.z
    );
          }
