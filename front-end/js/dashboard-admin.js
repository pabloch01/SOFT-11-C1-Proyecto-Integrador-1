// Panel de Administración (RF-006 y RF-007)
// Muestra las métricas de los censos vigentes y permite pausar o reanudar un censo.
// Los datos vienen de datos-ejemplo.js: más adelante se pedirán al servidor con fetch.


// 1. Selección de elementos del DOM
const cuerpoTablaCensos = document.getElementById("cuerpoTablaCensos");
const textoCifraCensosActivos = document.getElementById("cifraCensosActivos");
const textoDetalleCensosActivos = document.getElementById("detalleCensosActivos");
const textoCifraRespuestas = document.getElementById("cifraRespuestas");
const textoDetalleRespuestas = document.getElementById("detalleRespuestas");
const textoAnuncioEstado = document.getElementById("anuncioEstado");
const textoCifraFormularios = document.getElementById("cifraFormularios");
const textoDetalleFormularios = document.getElementById("detalleFormularios");
const textoCifraCentros = document.getElementById("cifraCentros");


// 2. Datos de ejemplo (vienen de datos-ejemplo.js)
// Los censos en borrador todavía no se han enviado, por eso no aparecen en el panel
const censos = censosEjemplo.filter(function (censo) {
    return censo.estado !== "borrador";
});


// 3. Cálculos

// Días que faltan para el cierre (RF-007). Devuelve un número entero.
function calcularDiasRestantes(fechaCierre) {
    const hoy = new Date(obtenerFechaHoy());
    const cierre = new Date(fechaCierre);
    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    return Math.round((cierre - hoy) / milisegundosPorDia);
}

function textoDiasRestantes(censo) {
    if (censo.estado === "cerrado") {
        return "Cerrado";
    }

    const dias = calcularDiasRestantes(censo.cierre);
    if (dias < 0) {
        return "Venció";
    } else if (dias === 0) {
        return "Cierra hoy";
    } else if (dias === 1) {
        return "1 día";
    }
    return dias + " días";
}


// 4. Métricas
function actualizarMetricas() {
    let censosActivos = 0;
    let cierranEstaSemana = 0;
    let totalRespuestas = 0;
    let respuestasEsperadas = 0;
    const centrosConCenso = [];        // id de centros con al menos un censo activo, sin repetir

    for (const censo of censos) {
        if (censo.estado === "abierto" || censo.estado === "pausado") {
            censosActivos++;
            totalRespuestas = totalRespuestas + censo.respuestas;
            respuestasEsperadas = respuestasEsperadas + censo.centros.length;

            for (const idCentro of censo.centros) {
                if (centrosConCenso.includes(idCentro) === false) {
                    centrosConCenso.push(idCentro);
                }
            }

            const dias = calcularDiasRestantes(censo.cierre);
            if (dias >= 0 && dias <= 7) {
                cierranEstaSemana++;
            }
        }
    }

    textoCifraCensosActivos.textContent = censosActivos;
    textoDetalleCensosActivos.textContent = cierranEstaSemana + " por cerrar esta semana";

    const porcentaje = Math.round(totalRespuestas / respuestasEsperadas * 100);
    textoCifraRespuestas.textContent = totalRespuestas;
    textoDetalleRespuestas.textContent = porcentaje + " % de avance en censos activos";

    textoCifraFormularios.textContent = formulariosEjemplo.length;
    textoDetalleFormularios.textContent = CANTIDAD_PLANTILLAS + " plantillas base";
    textoCifraCentros.textContent = centrosConCenso.length;
}


// 5. Tabla de censos (elementos creados con JS)
function crearFilaCenso(censo) {
    const fila = document.createElement("tr");

    // Nombre: es el encabezado de la fila para los lectores de pantalla
    const celdaNombre = document.createElement("th");
    celdaNombre.scope = "row";
    celdaNombre.textContent = censo.nombre;

    const celdaEstado = document.createElement("td");
    celdaEstado.appendChild(crearBadgeEstado(censo.estado));

    const celdaApertura = document.createElement("td");
    celdaApertura.textContent = formatearFecha(censo.apertura);

    const celdaCierre = document.createElement("td");
    celdaCierre.textContent = formatearFecha(censo.cierre);

    const celdaDias = document.createElement("td");
    celdaDias.textContent = textoDiasRestantes(censo);

    const celdaRespuestas = document.createElement("td");
    celdaRespuestas.textContent = censo.respuestas + " / " + censo.centros.length;

    // Acciones: "Ver" lleva a la gestión de censos; "Pausar"/"Reanudar" cambia el estado
    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "text-end text-nowrap";

    const enlaceVer = document.createElement("a");
    // El id del censo viaja en la dirección: censo-listar.html abre directamente su configuración
    enlaceVer.href = "censo-listar.html?censo=" + censo.id;
    enlaceVer.className = "btn-enlace";
    enlaceVer.textContent = "Ver";
    enlaceVer.setAttribute("aria-label", "Ver " + censo.nombre);
    celdaAcciones.appendChild(enlaceVer);

    if (censo.estado !== "cerrado") {
        const btnEstado = document.createElement("button");
        btnEstado.type = "button";
        btnEstado.className = "btn-enlace ms-2";

        if (censo.estado === "abierto") {
            btnEstado.textContent = "Pausar";
            btnEstado.setAttribute("aria-label", "Pausar " + censo.nombre);
        } else {
            btnEstado.textContent = "Reanudar";
            btnEstado.setAttribute("aria-label", "Reanudar " + censo.nombre);
        }

        btnEstado.addEventListener("click", function () {
            cambiarEstadoCenso(censo);
        });
        celdaAcciones.appendChild(btnEstado);
    }

    fila.append(celdaNombre, celdaEstado, celdaApertura, celdaCierre, celdaDias, celdaRespuestas, celdaAcciones);
    return fila;
}

function mostrarCensos() {
    cuerpoTablaCensos.innerHTML = "";        // se borran las filas anteriores

    for (const censo of censos) {
        cuerpoTablaCensos.appendChild(crearFilaCenso(censo));
    }
}


// 6. Control manual del censo (RF-006)
function cambiarEstadoCenso(censo) {
    let estadoNuevo = "pausado";
    let accion = "pausar";

    if (censo.estado === "pausado") {
        estadoNuevo = "abierto";
        accion = "reanudar";
    }

    confirmarAccion(
        "¿Desea " + accion + " este censo?",
        censo.nombre + ". Los centros educativos verán el cambio de inmediato.",
        "Sí, " + accion
    ).then(function (resultado) {
        if (resultado.isConfirmed) {
            censo.estado = estadoNuevo;
            mostrarCensos();
            actualizarMetricas();
            textoAnuncioEstado.textContent = "El censo " + censo.nombre + " ahora está " + nombresEstados[estadoNuevo].toLowerCase() + ".";
        }
    });
}


// 7. Estado inicial
mostrarCensos();
actualizarMetricas();
