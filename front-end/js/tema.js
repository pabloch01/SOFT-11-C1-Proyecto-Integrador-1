// Modo claro / oscuro (RNF-001)
// Este archivo se carga en el <head> de todas las pantallas para aplicar el tema
// ANTES de que se dibuje la página; así no se ve un "parpadeo" de blanco a oscuro.
//
// Bootstrap 5.3 cambia sus colores con el atributo data-bs-theme de <html>:
//   data-bs-theme="light" → modo claro
//   data-bs-theme="dark"  → modo oscuro
// Las variables de css/estilo.css también cambian con ese mismo atributo.


// Constantes
const CLAVE_TEMA = "sicen-tema";                                      // nombre con el que se guarda en el navegador
const consultaModoOscuro = window.matchMedia("(prefers-color-scheme: dark)");


// Lectura y guardado de la preferencia
// localStorage puede fallar (por ejemplo, en ventanas privadas); por eso se usa try...catch
function obtenerTemaGuardado() {
    try {
        return localStorage.getItem(CLAVE_TEMA);      // devuelve null si nunca se guardó
    } catch (error) {
        return null;
    }
}

function guardarTema(tema) {
    try {
        localStorage.setItem(CLAVE_TEMA, tema);
    } catch (error) {
        // Si no se puede guardar, el tema igual se aplica mientras la página esté abierta
    }
}

// Detección automática: si la persona no ha elegido, se usa el tema de su equipo
function obtenerTemaInicial() {
    const temaGuardado = obtenerTemaGuardado();

    if (temaGuardado !== null) {
        return temaGuardado;
    }

    if (consultaModoOscuro.matches) {
        return "dark";
    }
    return "light";
}


// Aplicar el tema
function aplicarTema(tema) {
    document.documentElement.setAttribute("data-bs-theme", tema);
    actualizarBotonesTema(tema);
}

// Cambia el ícono y el estado de todos los botones "Modo oscuro" de la página
function actualizarBotonesTema(tema) {
    const botonesTema = document.querySelectorAll(".btn-tema");

    for (const boton of botonesTema) {
        const icono = boton.querySelector("i");

        // aria-pressed le indica al lector de pantalla si el modo oscuro está activo
        if (tema === "dark") {
            boton.setAttribute("aria-pressed", "true");
            icono.className = "fa-solid fa-sun";
        } else {
            boton.setAttribute("aria-pressed", "false");
            icono.className = "fa-regular fa-moon";
        }
    }
}

function alternarTema() {
    const temaActual = document.documentElement.getAttribute("data-bs-theme");
    let temaNuevo = "dark";

    if (temaActual === "dark") {
        temaNuevo = "light";
    }

    guardarTema(temaNuevo);
    aplicarTema(temaNuevo);
}


// Eventos
// Si el equipo cambia de tema y la persona no ha elegido uno, la página lo sigue
consultaModoOscuro.addEventListener("change", function () {
    if (obtenerTemaGuardado() === null) {
        aplicarTema(obtenerTemaInicial());
    }
});

// Los botones todavía no existen cuando se lee el <head>;
// DOMContentLoaded ocurre cuando todo el HTML ya se cargó
document.addEventListener("DOMContentLoaded", function () {
    const botonesTema = document.querySelectorAll(".btn-tema");

    for (const boton of botonesTema) {
        boton.addEventListener("click", alternarTema);
    }

    actualizarBotonesTema(obtenerTemaInicial());
});


// Estado inicial
document.documentElement.setAttribute("data-bs-theme", obtenerTemaInicial());
