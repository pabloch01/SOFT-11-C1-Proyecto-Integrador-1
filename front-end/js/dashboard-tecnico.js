// Vista del Técnico de la DAE (RF-008, RF-010, RF-011 y RF-013)
// El técnico solo ve los centros de las provincias que le asignaron. Revisa los formularios
// remitidos y los acepta o los devuelve al centro con un motivo de corrección.


// 1. Selección de elementos del DOM

// Filtros y tabla
const selectFiltroEstado = document.getElementById("filtroEstado");
const selectFiltroCentro = document.getElementById("filtroCentro");
const selectFiltroCenso = document.getElementById("filtroCenso");
const inputBuscarCentro = document.getElementById("buscarCentro");
const cuerpoTablaRevision = document.getElementById("cuerpoTablaRevision");
const textoResumenRevision = document.getElementById("resumenRevision");

// Detalle y resolución
const tituloDetalle = document.getElementById("tituloDetalle");
const contenedorBadgeDetalle = document.getElementById("badgeEstadoDetalle");
const listaRespuestas = document.getElementById("listaRespuestas");
const formResolucion = document.getElementById("formResolucion");
const avisoResolucion = document.getElementById("avisoResolucion");
const textoAvisoResolucion = document.getElementById("textoAvisoResolucion");
const inputMotivoDevolucion = document.getElementById("motivoDevolucion");
const btnDevolver = document.getElementById("btnDevolver");
const btnAceptar = document.getElementById("btnAceptar");

// Centros asignados
const textoZonas = document.getElementById("textoZonas");
const listaCentros = document.getElementById("listaCentros");


// 2. Datos de ejemplo (más adelante vendrán del servidor)
const MINIMO_MOTIVO = 20;

// Provincias asignadas a este técnico por la Jefatura (RF-008)
const zonasTecnico = ["Alajuela", "Heredia"];

// Todos los centros del sistema vienen de datos-ejemplo.js; el técnico solo verá los de sus provincias
const todosLosCentros = centrosEjemplo;

const formulariosRemitidos = [
    {
        id: 1, idCentro: 7, idCenso: 1, idFormulario: 1, estado: "en_revision",
        fechaRemision: "2026-10-20", director: "Dir. Juan Carlos Pérez",
        respuestas: [
            ["Cantidad total de estudiantes matriculados al inicio del ciclo lectivo", "480 estudiantes"],
            ["Niveles educativos que se imparten actualmente en el centro", "Preescolar, I y II Ciclo (Primaria)"],
            ["¿El centro educativo cuenta con acceso a internet en funcionamiento?", "Sí, acceso total institucional"],
            ["Observaciones adicionales", "Conexión por fibra óptica del MEP."]
        ]
    },
    {
        id: 2, idCentro: 3, idCenso: 2, idFormulario: 3, estado: "en_subsane",
        fechaRemision: "2026-10-18", director: "Dir. Laura Jiménez",
        respuestas: [
            ["Estado general de las aulas", "Regular"],
            ["Espacios con los que cuenta el centro", "Comedor, Biblioteca"],
            ["Condiciones de infraestructura", "Se requiere reparar el techo del pabellón B."]
        ]
    },
    {
        id: 3, idCentro: 9, idCenso: 1, idFormulario: 7, estado: "aceptado",
        fechaRemision: "2026-10-15", director: "Dir. Ricardo Solís",
        respuestas: [
            ["Cantidad total de estudiantes matriculados al inicio del ciclo lectivo", "212 estudiantes"],
            ["Niveles educativos que se imparten actualmente en el centro", "Educación de adultos"],
            ["¿El centro educativo cuenta con acceso a internet en funcionamiento?", "Sí, acceso parcial"]
        ]
    },
    {
        id: 4, idCentro: 8, idCenso: 3, idFormulario: 4, estado: "en_revision",
        fechaRemision: "2026-10-22", director: "Dir. Andrea Vargas",
        respuestas: [
            ["Cantidad de computadoras en funcionamiento", "64"],
            ["¿Cuenta con laboratorio de cómputo?", "Sí"],
            ["Observaciones adicionales", "Diez equipos requieren mantenimiento."]
        ]
    },
    {
        id: 5, idCentro: 1, idCenso: 1, idFormulario: 2, estado: "en_revision",
        fechaRemision: "2026-10-21", director: "Dir. Pablo Castro",
        respuestas: [["Cantidad total de estudiantes matriculados al inicio del ciclo lectivo", "1250 estudiantes"]]
    }
];

let centrosDelTecnico = [];
let formularioActual = null;


// 3. Datos de cada formulario remitido
// Toma el nombre del censo y del formulario desde datos-ejemplo.js para que coincidan
// con lo que ven el administrador y el director
function completarDatosFormularios() {
    for (const formulario of formulariosRemitidos) {
        formulario.censo = buscarPorId(censosEjemplo, formulario.idCenso).nombre;
        formulario.formulario = buscarPorId(formulariosEjemplo, formulario.idFormulario).nombre;
    }
}


// 3.1 Centros de las zonas asignadas (RF-008)
// filter() devuelve solo los centros cuya provincia está en las zonas del técnico
function obtenerCentrosDelTecnico() {
    return todosLosCentros.filter(function (centro) {
        return zonasTecnico.includes(centro.provincia);
    });
}

function buscarCentro(id) {
    for (const centro of centrosDelTecnico) {
        if (centro.id === id) {
            return centro;
        }
    }
    return null;
}

// Formularios que el técnico puede ver: solo los de sus centros
function obtenerFormulariosVisibles() {
    return formulariosRemitidos.filter(function (formulario) {
        return buscarCentro(formulario.idCentro) !== null;
    });
}

function mostrarCentrosAsignados() {
    textoZonas.textContent = "Provincias asignadas: " + zonasTecnico.join(" y ") +
        ". Solo se muestran los centros educativos de estas provincias.";

    listaCentros.innerHTML = "";
    for (const centro of centrosDelTecnico) {
        const item = document.createElement("li");

        const nombre = document.createElement("span");
        nombre.className = "fw-bold";
        nombre.textContent = centro.nombre;

        const ubicacion = document.createElement("span");
        ubicacion.className = "texto-secundario small";
        ubicacion.textContent = centro.provincia + ", " + centro.canton;

        item.append(nombre, ubicacion);
        listaCentros.appendChild(item);
    }
}


// 4. Filtros (opciones creadas con JS)
function llenarFiltros() {
    for (const centro of centrosDelTecnico) {
        const opcion = document.createElement("option");
        opcion.value = centro.id;
        opcion.textContent = centro.nombre;
        selectFiltroCentro.appendChild(opcion);
    }

    // Censos sin repetir
    const censos = [];
    for (const formulario of obtenerFormulariosVisibles()) {
        if (censos.includes(formulario.censo) === false) {
            censos.push(formulario.censo);
        }
    }
    for (const censo of censos) {
        const opcion = document.createElement("option");
        opcion.value = censo;
        opcion.textContent = censo;
        selectFiltroCenso.appendChild(opcion);
    }
}

function cumpleFiltros(formulario) {
    const centro = buscarCentro(formulario.idCentro);
    const textoBuscado = inputBuscarCentro.value.trim().toLowerCase();

    const cumpleEstado = selectFiltroEstado.value === "" || formulario.estado === selectFiltroEstado.value;
    const cumpleCentro = selectFiltroCentro.value === "" || formulario.idCentro === Number(selectFiltroCentro.value);
    const cumpleCenso = selectFiltroCenso.value === "" || formulario.censo === selectFiltroCenso.value;
    const cumpleTexto = centro.nombre.toLowerCase().includes(textoBuscado);

    return cumpleEstado && cumpleCentro && cumpleCenso && cumpleTexto;
}


// 5. Tabla de formularios (elementos creados con JS)
function crearFilaFormulario(formulario) {
    const centro = buscarCentro(formulario.idCentro);
    const fila = document.createElement("tr");
    if (formularioActual !== null && formulario.id === formularioActual.id) {
        fila.classList.add("fila-seleccionada");
    }

    const celdaCentro = document.createElement("th");
    celdaCentro.scope = "row";
    celdaCentro.textContent = centro.nombre;

    const celdaCenso = document.createElement("td");
    celdaCenso.textContent = formulario.censo;

    const celdaFormulario = document.createElement("td");
    celdaFormulario.textContent = formulario.formulario;

    const celdaEstado = document.createElement("td");
    celdaEstado.appendChild(crearBadgeEstado(formulario.estado));

    const celdaFecha = document.createElement("td");
    celdaFecha.textContent = formatearFecha(formulario.fechaRemision);

    const celdaAccion = document.createElement("td");
    celdaAccion.className = "text-end";
    const btnRevisar = document.createElement("button");
    btnRevisar.type = "button";
    btnRevisar.className = "btn btn-sm btn-outline-primary";
    btnRevisar.textContent = "Revisar";
    btnRevisar.setAttribute("aria-label", "Revisar formulario de " + centro.nombre);
    btnRevisar.addEventListener("click", function () {
        cargarRevision(formulario, true);
    });
    celdaAccion.appendChild(btnRevisar);

    fila.append(celdaCentro, celdaCenso, celdaFormulario, celdaEstado, celdaFecha, celdaAccion);
    return fila;
}

function mostrarFormularios() {
    const visibles = obtenerFormulariosVisibles();
    let cantidadMostrada = 0;

    cuerpoTablaRevision.innerHTML = "";

    for (const formulario of visibles) {
        if (cumpleFiltros(formulario)) {
            cuerpoTablaRevision.appendChild(crearFilaFormulario(formulario));
            cantidadMostrada++;
        }
    }

    if (cantidadMostrada === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 6;
        celda.className = "text-center texto-secundario";
        celda.textContent = "No hay formularios que coincidan con los filtros.";
        fila.appendChild(celda);
        cuerpoTablaRevision.appendChild(fila);
    }

    textoResumenRevision.textContent = cantidadMostrada + " de " + visibles.length + " formularios de sus centros asignados";
}


// 6. Detalle de la revisión
function cargarRevision(formulario, enfocar) {
    const centro = buscarCentro(formulario.idCentro);
    formularioActual = formulario;

    tituloDetalle.textContent = "Revisión: " + formulario.censo + " — " + centro.nombre;
    contenedorBadgeDetalle.innerHTML = "";
    contenedorBadgeDetalle.appendChild(crearBadgeEstado(formulario.estado));

    // Respuestas declaradas
    listaRespuestas.innerHTML = "";
    let numero = 1;
    for (const respuesta of formulario.respuestas) {
        const item = document.createElement("li");

        const pregunta = document.createElement("p");
        pregunta.className = "pregunta-declarada";
        pregunta.textContent = numero + ". " + respuesta[0];

        const valor = document.createElement("p");
        valor.className = "respuesta-declarada";
        valor.textContent = respuesta[1];

        item.append(pregunta, valor);
        listaRespuestas.appendChild(item);
        numero++;
    }

    const declarado = document.createElement("li");
    declarado.className = "small texto-secundario";
    declarado.textContent = "Declarado por " + formulario.director + " el " + formatearFecha(formulario.fechaRemision) + ".";
    listaRespuestas.appendChild(declarado);

    // Solo los formularios "En revisión" se pueden aceptar o devolver
    inputMotivoDevolucion.value = formulario.motivo || "";
    limpiarValidacion(formResolucion);

    const puedeResolver = formulario.estado === "en_revision";
    inputMotivoDevolucion.disabled = puedeResolver === false;
    btnDevolver.disabled = puedeResolver === false;
    btnAceptar.disabled = puedeResolver === false;

    if (formulario.estado === "aceptado") {
        textoAvisoResolucion.textContent = "Este formulario ya fue aceptado. No admite cambios.";
        avisoResolucion.classList.remove("d-none");
    } else if (formulario.estado === "en_subsane") {
        textoAvisoResolucion.textContent = "Se devolvió al centro para corrección. Podrá revisarlo otra vez cuando el director lo vuelva a remitir.";
        avisoResolucion.classList.remove("d-none");
    } else {
        avisoResolucion.classList.add("d-none");
    }

    mostrarFormularios();

    if (enfocar) {
        tituloDetalle.focus();     // el título tiene tabindex="-1" para recibir el foco
    }
}


// 7. Resolución técnica
// El motivo solo es obligatorio al devolver (RF-010)
function validarMotivo() {
    listaErrores = [];
    validarLargo(inputMotivoDevolucion, "Motivo de devolución", MINIMO_MOTIVO,
        "Para devolver el formulario, explique qué debe corregir el centro educativo.");
    return listaErrores.length === 0;
}

function devolverFormulario() {
    seIntentoEnviar = true;

    if (validarMotivo() === false) {
        inputMotivoDevolucion.focus();
        return;
    }

    confirmarAccion("¿Devolver para corrección?", "El centro educativo recibirá el motivo y el formulario pasará a En subsane.", "Sí, devolver")
        .then(function (resultado) {
            if (resultado.isConfirmed) {
                formularioActual.estado = "en_subsane";        // RF-012
                formularioActual.motivo = inputMotivoDevolucion.value.trim();
                seIntentoEnviar = false;
                cargarRevision(formularioActual, false);
                mostrarExito("Formulario devuelto", "El centro educativo verá el motivo de la devolución.");
            }
        });
}

function aceptarFormulario() {
    confirmarAccion("¿Aceptar el formulario?", "Una vez aceptado, el centro educativo ya no podrá modificarlo.", "Sí, aceptar")
        .then(function (resultado) {
            if (resultado.isConfirmed) {
                formularioActual.estado = "aceptado";          // RF-011
                formularioActual.motivo = "";
                seIntentoEnviar = false;
                cargarRevision(formularioActual, false);
                mostrarExito("Formulario aceptado", "Se concluyó la revisión de este formulario.");
            }
        });
}

// Después de intentar devolver, el mensaje se actualiza mientras se escribe
function revalidar() {
    if (seIntentoEnviar === true) {
        validarMotivo();
    }
}


// 8. Eventos
selectFiltroEstado.addEventListener("change", mostrarFormularios);
selectFiltroCentro.addEventListener("change", mostrarFormularios);
selectFiltroCenso.addEventListener("change", mostrarFormularios);
inputBuscarCentro.addEventListener("input", mostrarFormularios);
btnDevolver.addEventListener("click", devolverFormulario);
btnAceptar.addEventListener("click", aceptarFormulario);
inputMotivoDevolucion.addEventListener("input", revalidar);

// Menú lateral: marca la sección elegida y, en celular, cierra el panel deslizable
const enlacesMenu = document.querySelectorAll('.menu-lateral a[href^="#"]');
for (const enlace of enlacesMenu) {
    enlace.addEventListener("click", function () {
        for (const otroEnlace of enlacesMenu) {
            otroEnlace.removeAttribute("aria-current");
        }
        enlace.setAttribute("aria-current", "page");

        const menuLateral = bootstrap.Offcanvas.getInstance(document.getElementById("barraLateral"));
        if (menuLateral !== null) {
            menuLateral.hide();
        }
    });
}


// 9. Estado inicial
completarDatosFormularios();
centrosDelTecnico = obtenerCentrosDelTecnico();
mostrarCentrosAsignados();
llenarFiltros();
cargarRevision(obtenerFormulariosVisibles()[0], false);
