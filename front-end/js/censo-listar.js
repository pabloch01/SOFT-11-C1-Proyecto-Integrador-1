// Gestión de censos (RF-005 y RF-006)
// Lista los censos, permite buscarlos, crear uno nuevo, duplicarlo y configurar sus
// fechas, estado, formularios asociados y centros educativos asignados.


// 1. Selección de elementos del DOM

// Lista de censos
const inputBuscarCenso = document.getElementById("buscarCenso");
const btnNuevoCenso = document.getElementById("btnNuevoCenso");
const cuerpoTablaCensos = document.getElementById("cuerpoTablaCensos");
const textoResumenCensos = document.getElementById("resumenCensos");

// Configuración del censo
const formCenso = document.getElementById("formCenso");
const tituloConfiguracion = document.getElementById("tituloConfiguracion");
const inputNombreCenso = document.getElementById("nombreCenso");
const inputFechaApertura = document.getElementById("fechaApertura");
const inputFechaCierre = document.getElementById("fechaCierre");
const selectEstadoCenso = document.getElementById("estadoCenso");
const contenedorBadges = document.getElementById("contenedorBadges");
const selectFormulario = document.getElementById("selectFormulario");
const btnVincular = document.getElementById("btnVincular");
const grupoCentros = document.getElementById("grupoCentros");
const btnMarcarTodos = document.getElementById("btnMarcarTodos");
const btnCancelar = document.getElementById("btnCancelar");


// 2. Datos de ejemplo (vienen de datos-ejemplo.js; más adelante vendrán del servidor)
const MAXIMO_FORMULARIOS = 14;

const formulariosDisponibles = formulariosEjemplo;
const centrosDisponibles = centrosEjemplo;
let censos = censosEjemplo;

let siguienteId = censos.length + 1;
let idEnEdicion = null;            // censo cargado en el formulario (null = censo nuevo)
let formulariosVinculados = [];    // ids de los formularios del censo que se está configurando


// 3. Tabla de censos (elementos creados con JS)
function crearFilaCenso(censo) {
    const fila = document.createElement("tr");
    if (censo.id === idEnEdicion) {
        fila.classList.add("fila-seleccionada");
    }

    const celdaNombre = document.createElement("th");
    celdaNombre.scope = "row";
    celdaNombre.textContent = censo.nombre;

    const celdaEstado = document.createElement("td");
    celdaEstado.appendChild(crearBadgeEstado(censo.estado));

    const celdaFormularios = document.createElement("td");
    celdaFormularios.textContent = censo.formularios.length + " asociado(s)";

    const celdaApertura = document.createElement("td");
    celdaApertura.textContent = formatearFecha(censo.apertura);

    const celdaCierre = document.createElement("td");
    celdaCierre.textContent = formatearFecha(censo.cierre);

    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "text-end text-nowrap";

    const btnConfigurar = document.createElement("button");
    btnConfigurar.type = "button";
    btnConfigurar.className = "btn-enlace";
    btnConfigurar.textContent = "Configurar";
    btnConfigurar.setAttribute("aria-label", "Configurar " + censo.nombre);
    btnConfigurar.addEventListener("click", function () {
        cargarCenso(censo.id);
    });

    const btnDuplicar = document.createElement("button");
    btnDuplicar.type = "button";
    btnDuplicar.className = "btn-enlace ms-2";
    btnDuplicar.textContent = "Duplicar";
    btnDuplicar.setAttribute("aria-label", "Duplicar " + censo.nombre);
    btnDuplicar.addEventListener("click", function () {
        duplicarCenso(censo.id);
    });

    celdaAcciones.append(btnConfigurar, btnDuplicar);
    fila.append(celdaNombre, celdaEstado, celdaFormularios, celdaApertura, celdaCierre, celdaAcciones);
    return fila;
}

// Muestra los censos cuyo nombre contiene el texto buscado
function mostrarCensos() {
    const textoBuscado = inputBuscarCenso.value.trim().toLowerCase();
    let cantidadMostrada = 0;

    cuerpoTablaCensos.innerHTML = "";

    for (const censo of censos) {
        if (censo.nombre.toLowerCase().includes(textoBuscado)) {
            cuerpoTablaCensos.appendChild(crearFilaCenso(censo));
            cantidadMostrada++;
        }
    }

    if (cantidadMostrada === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 6;
        celda.className = "text-center texto-secundario";
        celda.textContent = "No se encontraron censos con ese nombre.";
        fila.appendChild(celda);
        cuerpoTablaCensos.appendChild(fila);
    }

    textoResumenCensos.textContent = cantidadMostrada + " de " + censos.length + " censos en este listado";
}


// 4. Formularios asociados: insignias creadas con JS
// (buscarPorId viene de datos-ejemplo.js)
function mostrarFormulariosVinculados() {
    contenedorBadges.innerHTML = "";

    if (formulariosVinculados.length === 0) {
        const mensaje = document.createElement("span");
        mensaje.className = "texto-secundario small";
        mensaje.textContent = "Ningún formulario vinculado.";
        contenedorBadges.appendChild(mensaje);
    }

    for (const idFormulario of formulariosVinculados) {
        const formulario = buscarPorId(formulariosDisponibles, idFormulario);

        const badge = document.createElement("span");
        badge.className = "badge-formulario aparecer";
        badge.textContent = formulario.nombre;

        // Botón para desvincular el formulario
        const btnQuitar = document.createElement("button");
        btnQuitar.type = "button";
        btnQuitar.setAttribute("aria-label", "Desvincular " + formulario.nombre);
        btnQuitar.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        btnQuitar.addEventListener("click", function () {
            desvincularFormulario(idFormulario);
        });

        badge.appendChild(btnQuitar);
        contenedorBadges.appendChild(badge);
    }

    actualizarSelectFormularios();
}

// El select solo ofrece los formularios que todavía no están vinculados
function actualizarSelectFormularios() {
    selectFormulario.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccione un formulario para vincular";
    selectFormulario.appendChild(opcionInicial);

    for (const formulario of formulariosDisponibles) {
        if (formulariosVinculados.includes(formulario.id) === false) {
            const opcion = document.createElement("option");
            opcion.value = formulario.id;
            opcion.textContent = formulario.nombre;
            selectFormulario.appendChild(opcion);
        }
    }

    btnVincular.disabled = formulariosVinculados.length >= MAXIMO_FORMULARIOS;
}

function vincularFormulario() {
    if (selectFormulario.value === "") {
        selectFormulario.focus();
        return;
    }

    formulariosVinculados.push(Number(selectFormulario.value));   // el valor del select es texto
    mostrarFormulariosVinculados();
    revalidar();
    selectFormulario.focus();
}

function desvincularFormulario(idFormulario) {
    formulariosVinculados = formulariosVinculados.filter(function (id) {
        return id !== idFormulario;
    });
    mostrarFormulariosVinculados();
    revalidar();
    selectFormulario.focus();
}


// 5. Centros educativos: un checkbox por centro (creados con JS)
function mostrarCentros(centrosMarcados) {
    grupoCentros.innerHTML = "";

    for (const centro of centrosDisponibles) {
        const contenedor = document.createElement("div");
        contenedor.className = "form-check";

        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.className = "form-check-input";
        casilla.id = "centro" + centro.id;
        casilla.name = "centros";
        casilla.value = centro.id;
        casilla.checked = centrosMarcados.includes(centro.id);

        const etiqueta = document.createElement("label");
        etiqueta.className = "form-check-label";
        etiqueta.htmlFor = casilla.id;
        etiqueta.textContent = centro.nombre;

        // La oferta ayuda a elegir los centros que corresponden a los formularios
        const oferta = document.createElement("span");
        oferta.className = "d-block small texto-secundario";
        oferta.textContent = centro.oferta;
        etiqueta.appendChild(oferta);

        contenedor.append(casilla, etiqueta);
        grupoCentros.appendChild(contenedor);
    }
}

function marcarTodosLosCentros() {
    const casillas = grupoCentros.querySelectorAll('input[type="checkbox"]');
    for (const casilla of casillas) {
        casilla.checked = true;
    }
    revalidar();
}

function obtenerCentrosMarcados() {
    const marcados = grupoCentros.querySelectorAll('input[type="checkbox"]:checked');
    const ids = [];
    for (const casilla of marcados) {
        ids.push(Number(casilla.value));
    }
    return ids;
}


// 6. Cargar, crear y duplicar censos
// enfocar = false se usa al abrir la página, para no mover el foco sin que la persona lo pida
function cargarCenso(id, enfocar = true) {
    const censo = buscarPorId(censos, id);

    idEnEdicion = id;
    inputNombreCenso.value = censo.nombre;
    inputFechaApertura.value = censo.apertura;
    inputFechaCierre.value = censo.cierre;
    selectEstadoCenso.value = censo.estado;
    formulariosVinculados = censo.formularios.slice();      // slice() copia el arreglo

    tituloConfiguracion.textContent = "Configuración: " + censo.nombre;
    prepararFormulario(censo.centros, enfocar);
}

function nuevoCenso() {
    idEnEdicion = null;
    formCenso.reset();
    selectEstadoCenso.value = "borrador";
    formulariosVinculados = [];

    tituloConfiguracion.textContent = "Nuevo censo";
    prepararFormulario([], true);
}

function duplicarCenso(id) {
    const original = buscarPorId(censos, id);

    // La copia empieza en borrador y sin fechas, porque corresponde a otro período
    const copia = {
        id: siguienteId,
        nombre: original.nombre + " (copia)",
        estado: "borrador",
        apertura: "",
        cierre: "",
        formularios: original.formularios.slice(),
        centros: original.centros.slice()
    };
    siguienteId++;

    idEnEdicion = null;
    inputNombreCenso.value = copia.nombre;
    inputFechaApertura.value = "";
    inputFechaCierre.value = "";
    selectEstadoCenso.value = "borrador";
    formulariosVinculados = copia.formularios;

    tituloConfiguracion.textContent = "Nuevo censo (duplicado de " + original.nombre + ")";
    prepararFormulario(copia.centros, true);
}

// Pasos comunes después de cargar datos en el formulario
function prepararFormulario(centrosMarcados, enfocar) {
    seIntentoEnviar = false;
    limpiarValidacion(formCenso);
    mostrarCentros(centrosMarcados);
    mostrarFormulariosVinculados();
    actualizarFechaMinima();
    mostrarCensos();

    if (enfocar) {
        inputNombreCenso.focus();
    }
}


// 7. Validación
// Un censo nuevo no puede abrir en una fecha pasada; uno existente conserva su fecha
function validarFechas() {
    const apertura = inputFechaApertura.value;     // formato "AAAA-MM-DD": se compara como texto
    const cierre = inputFechaCierre.value;

    if (apertura === "") {
        marcarError(inputFechaApertura, "Fecha de apertura", "Seleccione la fecha de apertura.");
    } else if (idEnEdicion === null && apertura < obtenerFechaHoy()) {
        marcarError(inputFechaApertura, "Fecha de apertura", "La fecha de apertura de un censo nuevo no puede ser anterior a hoy.");
    } else {
        marcarCorrecto(inputFechaApertura);
    }

    if (cierre === "") {
        marcarError(inputFechaCierre, "Fecha de cierre", "Seleccione la fecha de cierre.");
    } else if (apertura !== "" && cierre <= apertura) {
        marcarError(inputFechaCierre, "Fecha de cierre", "La fecha de cierre debe ser posterior a la de apertura.");
    } else {
        marcarCorrecto(inputFechaCierre);
    }
}

function validarFormulariosVinculados() {
    if (formulariosVinculados.length === 0) {
        marcarError(selectFormulario, "Formularios asociados", "Vincule al menos un formulario al censo.");
    } else if (formulariosVinculados.length > MAXIMO_FORMULARIOS) {
        marcarError(selectFormulario, "Formularios asociados", "Un censo admite como máximo " + MAXIMO_FORMULARIOS + " formularios.");
    } else {
        quitarMarca(selectFormulario);
    }
}

function validarFormulario() {
    listaErrores = [];

    validarLargo(inputNombreCenso, "Nombre del censo", 5, "Escriba el nombre del censo.");
    validarFechas();
    validarSeleccion(selectEstadoCenso, "Estado", "Seleccione el estado del censo.");
    validarFormulariosVinculados();
    validarGrupo(grupoCentros, "Centros educativos", 1, centrosDisponibles.length,
        "Marque al menos un centro educativo para asignarle el censo.", "");

    return listaErrores.length === 0;
}


// 8. Guardar y cancelar
function guardarCenso(evento) {
    evento.preventDefault();
    seIntentoEnviar = true;

    if (validarFormulario() === false) {
        mostrarErrores();
        return;
    }

    const datos = {
        nombre: inputNombreCenso.value.trim(),
        estado: selectEstadoCenso.value,
        apertura: inputFechaApertura.value,
        cierre: inputFechaCierre.value,
        formularios: formulariosVinculados.slice(),
        centros: obtenerCentrosMarcados()
    };

    // Un censo nuevo todavía no tiene respuestas; uno existente conserva las suyas
    datos.respuestas = 0;
    if (idEnEdicion !== null) {
        datos.respuestas = buscarPorId(censos, idEnEdicion).respuestas;
    }

    // Más adelante, aquí se enviarán los datos al servidor con fetch
    if (idEnEdicion === null) {
        datos.id = siguienteId;
        siguienteId++;
        censos.push(datos);
        idEnEdicion = datos.id;
    } else {
        const censo = buscarPorId(censos, idEnEdicion);
        censo.nombre = datos.nombre;
        censo.estado = datos.estado;
        censo.apertura = datos.apertura;
        censo.cierre = datos.cierre;
        censo.formularios = datos.formularios;
        censo.centros = datos.centros;
    }

    mostrarCensos();
    mostrarExito("Censo guardado", "\"" + datos.nombre + "\" quedó en estado " + nombresEstados[datos.estado].toLowerCase() +
        " con " + datos.formularios.length + " formulario(s) y " + datos.centros.length + " centro(s) asignado(s).");
}

function cancelarEdicion() {
    if (idEnEdicion === null) {
        nuevoCenso();
    } else {
        cargarCenso(idEnEdicion);       // vuelve a los datos guardados
    }
}


// 9. Elementos que cambian con JS
// La fecha de cierre no puede ser anterior a la de apertura
function actualizarFechaMinima() {
    inputFechaCierre.min = inputFechaApertura.value;
}

function revalidar() {
    if (seIntentoEnviar === true) {
        validarFormulario();
    }
}


// 10. Eventos
inputBuscarCenso.addEventListener("input", mostrarCensos);
btnNuevoCenso.addEventListener("click", nuevoCenso);
btnVincular.addEventListener("click", vincularFormulario);
btnMarcarTodos.addEventListener("click", marcarTodosLosCentros);
btnCancelar.addEventListener("click", cancelarEdicion);
inputFechaApertura.addEventListener("change", actualizarFechaMinima);

formCenso.addEventListener("submit", guardarCenso);
formCenso.addEventListener("input", revalidar);
formCenso.addEventListener("change", revalidar);


// 11. Estado inicial
// Si se llega desde el panel ("Ver"), la dirección trae el id: censo-listar.html?censo=3
// Number() convierte el texto en número; si no hay parámetro o el id no existe, se usa el primer censo.
const parametros = new URLSearchParams(window.location.search);
const idRecibido = Number(parametros.get("censo"));

if (buscarPorId(censos, idRecibido) !== null) {
    cargarCenso(idRecibido, false);
    // Se lleva el foco al título de la configuración para que la persona vea el censo que eligió
    tituloConfiguracion.focus();
} else {
    cargarCenso(1, false);
}
