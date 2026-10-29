// Constructor de formularios censales (RF-001, RF-002 y RF-003)
// Permite crear un formulario desde cero o a partir de una plantilla, y agregar,
// editar o eliminar sus preguntas con su tipo de respuesta.


// 1. Selección de elementos del DOM

// Datos generales
const formFormulario = document.getElementById("formFormulario");
const selectPlantilla = document.getElementById("plantilla");
const inputNombreFormulario = document.getElementById("nombreFormulario");
const selectEstadoFormulario = document.getElementById("estadoFormulario");
const inputDescripcionFormulario = document.getElementById("descripcionFormulario");
const grupoOfertas = document.getElementById("grupoOfertas");
const btnCancelar = document.getElementById("btnCancelar");

// Lista de preguntas
const listaPreguntas = document.getElementById("listaPreguntas");
const textoCantidadPreguntas = document.getElementById("cantidadPreguntas");
const textoSinPreguntas = document.getElementById("sinPreguntas");
const divErrorPreguntas = document.getElementById("error-listaPreguntas");
const textoAnuncioPreguntas = document.getElementById("anuncioPreguntas");

// Nueva pregunta
const formPregunta = document.getElementById("formPregunta");
const tituloNuevaPregunta = document.getElementById("tituloNuevaPregunta");
const inputTextoPregunta = document.getElementById("textoPregunta");
const selectTipoRespuesta = document.getElementById("tipoRespuesta");
const contenedorOpciones = document.getElementById("contenedorOpciones");
const inputOpcionesPregunta = document.getElementById("opcionesPregunta");
const switchObligatoria = document.getElementById("preguntaObligatoria");
const btnAgregarPregunta = document.getElementById("btnAgregarPregunta");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");


// 2. Datos y variables generales
const nombresTipos = {
    unica: "Selección única",
    multiple: "Selección múltiple",
    abierta: "Descripción abierta"
};

// Plantillas de ejemplo (más adelante vendrán del servidor)
const plantillas = {
    matricula: {
        nombre: "Censo Matrícula Inicial",
        descripcion: "Instrumento para capturar el estado general de la matrícula al inicio del curso lectivo.",
        preguntas: [
            { texto: "¿Cuántos estudiantes están matriculados en el curso lectivo actual?", tipo: "abierta", opciones: [], obligatoria: true },
            { texto: "¿Cuáles niveles educativos ofrece el centro?", tipo: "multiple", opciones: ["Preescolar", "I y II Ciclo", "III Ciclo"], obligatoria: true },
            { texto: "¿El centro cuenta con acceso a internet?", tipo: "unica", opciones: ["Sí", "No"], obligatoria: true },
            { texto: "Observaciones generales de la matrícula", tipo: "abierta", opciones: [], obligatoria: false }
        ]
    },
    infraestructura: {
        nombre: "Infraestructura Física Escolar",
        descripcion: "Instrumento para conocer el estado de las instalaciones físicas del centro educativo.",
        preguntas: [
            { texto: "¿Cuál es el estado general de las aulas?", tipo: "unica", opciones: ["Bueno", "Regular", "Malo"], obligatoria: true },
            { texto: "¿Con cuáles espacios cuenta el centro?", tipo: "multiple", opciones: ["Comedor", "Biblioteca", "Laboratorio", "Gimnasio"], obligatoria: true },
            { texto: "Describa las condiciones de infraestructura del centro", tipo: "abierta", opciones: [], obligatoria: false }
        ]
    }
};

const MINIMO_OPCIONES = 2;

let preguntas = [];             // preguntas del formulario que se está construyendo
let siguienteId = 1;            // id único para cada pregunta nueva
let idEnEdicion = null;         // id de la pregunta que se está editando (null = ninguna)
let plantillaActual = "";       // opción de "Crear a partir de" aplicada ("" = formulario en blanco)
let nombreAutocompletado = "";  // nombre que puso la plantilla (para saber si el usuario lo cambió)
let descripcionAutocompletada = "";


// 3. Lista de preguntas (elementos creados con JS)

function crearTarjetaPregunta(pregunta, numero) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-pregunta aparecer";
    if (pregunta.id === idEnEdicion) {
        tarjeta.classList.add("en-edicion");
    }

    // Contenido: número, tipo, texto y opciones
    const contenido = document.createElement("div");
    contenido.className = "flex-grow-1";

    const encabezado = document.createElement("div");
    encabezado.className = "d-flex flex-wrap align-items-center gap-1";

    const numeroPregunta = document.createElement("h3");
    numeroPregunta.className = "numero-pregunta mb-0";
    numeroPregunta.textContent = "Pregunta " + numero;

    const badgeTipo = document.createElement("span");
    badgeTipo.className = "badge-estado badge-tipo";
    badgeTipo.textContent = nombresTipos[pregunta.tipo];

    encabezado.append(numeroPregunta, badgeTipo);

    if (pregunta.obligatoria) {
        const badgeObligatoria = document.createElement("span");
        badgeObligatoria.className = "badge-estado badge-rol";
        badgeObligatoria.textContent = "Obligatoria";
        encabezado.appendChild(badgeObligatoria);
    }

    const texto = document.createElement("p");
    texto.className = "texto-pregunta";
    texto.textContent = pregunta.texto;

    contenido.append(encabezado, texto);

    if (pregunta.tipo !== "abierta") {
        const opciones = document.createElement("p");
        opciones.className = "opciones-pregunta";
        opciones.textContent = "Opciones: " + pregunta.opciones.join(", ");
        contenido.appendChild(opciones);
    }

    // Acciones: editar y eliminar
    const acciones = document.createElement("div");
    acciones.className = "d-flex gap-1";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn-icono";
    btnEditar.setAttribute("aria-label", "Editar pregunta " + numero);
    btnEditar.innerHTML = '<i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>';
    btnEditar.addEventListener("click", function () {
        editarPregunta(pregunta.id);
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "btn-icono btn-icono-eliminar";
    btnEliminar.setAttribute("aria-label", "Eliminar pregunta " + numero);
    btnEliminar.innerHTML = '<i class="fa-regular fa-trash-can" aria-hidden="true"></i>';
    btnEliminar.addEventListener("click", function () {
        eliminarPregunta(pregunta.id);
    });

    acciones.append(btnEditar, btnEliminar);
    tarjeta.append(contenido, acciones);
    return tarjeta;
}

function mostrarPreguntas() {
    listaPreguntas.innerHTML = "";

    let numero = 1;
    for (const pregunta of preguntas) {
        listaPreguntas.appendChild(crearTarjetaPregunta(pregunta, numero));
        numero++;
    }

    textoCantidadPreguntas.textContent = preguntas.length;

    // El mensaje "Todavía no hay preguntas" solo se ve si la lista está vacía
    if (preguntas.length === 0) {
        textoSinPreguntas.classList.remove("d-none");
    } else {
        textoSinPreguntas.classList.add("d-none");
    }
}


// 4. Nueva pregunta: elementos que cambian con JS

// Las preguntas abiertas no llevan opciones: el campo se oculta y deja de ser obligatorio
function mostrarCampoOpciones() {
    if (selectTipoRespuesta.value === "abierta") {
        contenedorOpciones.classList.add("d-none");
        inputOpcionesPregunta.required = false;
        inputOpcionesPregunta.value = "";
        quitarMarca(inputOpcionesPregunta);
    } else {
        contenedorOpciones.classList.remove("d-none");
        inputOpcionesPregunta.required = true;
    }
}

// Convierte "Sí, No , ,Tal vez" en ["Sí", "No", "Tal vez"]
function obtenerOpciones() {
    const partes = inputOpcionesPregunta.value.split(",");
    const opciones = [];

    for (const parte of partes) {
        const opcion = parte.trim();
        if (opcion !== "") {
            opciones.push(opcion);
        }
    }
    return opciones;
}

function validarOpciones() {
    if (selectTipoRespuesta.value === "abierta") {
        return;
    }

    const opciones = obtenerOpciones();

    // Set guarda valores sin repetir: si su tamaño es menor, había opciones repetidas
    const opcionesSinRepetir = new Set();
    for (const opcion of opciones) {
        opcionesSinRepetir.add(opcion.toLowerCase());
    }

    if (opciones.length === 0) {
        marcarError(inputOpcionesPregunta, "Opciones de respuesta", "Escriba las opciones separadas por comas. Ej.: Sí, No.");
    } else if (opciones.length < MINIMO_OPCIONES) {
        marcarError(inputOpcionesPregunta, "Opciones de respuesta", "Agregue al menos " + MINIMO_OPCIONES + " opciones separadas por comas.");
    } else if (opcionesSinRepetir.size < opciones.length) {
        marcarError(inputOpcionesPregunta, "Opciones de respuesta", "Hay opciones repetidas. Deje cada opción una sola vez.");
    } else {
        marcarCorrecto(inputOpcionesPregunta);
    }
}

function validarPregunta() {
    listaErrores = [];

    validarLargo(inputTextoPregunta, "Texto de la pregunta", 5, "Escriba el texto de la pregunta.");
    validarSeleccion(selectTipoRespuesta, "Tipo de respuesta", "Seleccione el tipo de respuesta.");
    validarOpciones();

    return listaErrores.length === 0;
}

// Agrega una pregunta nueva o guarda los cambios de la que se está editando
function guardarPregunta(evento) {
    evento.preventDefault();

    if (validarPregunta() === false) {
        listaErrores[0].campo.focus();
        return;
    }

    const datosPregunta = {
        texto: inputTextoPregunta.value.trim(),
        tipo: selectTipoRespuesta.value,
        opciones: obtenerOpciones(),
        obligatoria: switchObligatoria.checked
    };

    if (idEnEdicion === null) {
        datosPregunta.id = siguienteId;
        siguienteId++;
        preguntas.push(datosPregunta);
        textoAnuncioPreguntas.textContent = "Se agregó la pregunta " + preguntas.length + ".";
    } else {
        // Se busca la pregunta editada y se reemplazan sus datos
        for (const pregunta of preguntas) {
            if (pregunta.id === idEnEdicion) {
                pregunta.texto = datosPregunta.texto;
                pregunta.tipo = datosPregunta.tipo;
                pregunta.opciones = datosPregunta.opciones;
                pregunta.obligatoria = datosPregunta.obligatoria;
            }
        }
        textoAnuncioPreguntas.textContent = "Se guardaron los cambios de la pregunta.";
    }

    limpiarFormularioPregunta();
    mostrarPreguntas();
    revalidar();
    inputTextoPregunta.focus();
}

// Carga una pregunta en el formulario para editarla (RF-002)
function editarPregunta(id) {
    let numero = 1;

    for (const pregunta of preguntas) {
        if (pregunta.id === id) {
            inputTextoPregunta.value = pregunta.texto;
            selectTipoRespuesta.value = pregunta.tipo;
            inputOpcionesPregunta.value = pregunta.opciones.join(", ");
            switchObligatoria.checked = pregunta.obligatoria;
            tituloNuevaPregunta.textContent = "Editar pregunta " + numero;
        }
        numero++;
    }

    idEnEdicion = id;
    limpiarValidacion(formPregunta);
    mostrarCampoOpciones();
    btnAgregarPregunta.innerHTML = '<i class="fa-solid fa-floppy-disk me-1" aria-hidden="true"></i> Guardar cambios';
    btnCancelarEdicion.classList.remove("d-none");
    mostrarPreguntas();
    inputTextoPregunta.focus();
}

function eliminarPregunta(id) {
    confirmarAccion("¿Eliminar esta pregunta?", "La pregunta se quitará del formulario.", "Sí, eliminar")
        .then(function (resultado) {
            if (resultado.isConfirmed) {
                // filter() crea una lista nueva sin la pregunta eliminada
                preguntas = preguntas.filter(function (pregunta) {
                    return pregunta.id !== id;
                });

                if (idEnEdicion === id) {
                    limpiarFormularioPregunta();
                }

                mostrarPreguntas();
                revalidar();
                textoAnuncioPreguntas.textContent = "Se eliminó la pregunta. Quedan " + preguntas.length + ".";
                inputTextoPregunta.focus();
            }
        });
}

function limpiarFormularioPregunta() {
    formPregunta.reset();
    limpiarValidacion(formPregunta);
    idEnEdicion = null;
    tituloNuevaPregunta.textContent = "Nueva pregunta";
    btnAgregarPregunta.innerHTML = '<i class="fa-solid fa-plus me-1" aria-hidden="true"></i> Agregar pregunta';
    btnCancelarEdicion.classList.add("d-none");
    mostrarCampoOpciones();
    mostrarPreguntas();
}


// 5. Plantillas (RF-001: crear a partir de un formulario existente)
// clave = "" significa "Formulario en blanco"
function cargarPlantilla() {
    const clave = selectPlantilla.value;

    // Si ya hay preguntas, se pide confirmación antes de reemplazarlas o quitarlas
    if (preguntas.length > 0) {
        let titulo = "¿Reemplazar las preguntas?";
        let mensaje = "Las preguntas actuales se sustituirán por las de la plantilla.";
        let textoBoton = "Sí, reemplazar";

        if (clave === "") {
            titulo = "¿Comenzar un formulario en blanco?";
            mensaje = "Se quitarán las preguntas actuales del formulario.";
            textoBoton = "Sí, comenzar en blanco";
        }

        confirmarAccion(titulo, mensaje, textoBoton)
            .then(function (resultado) {
                if (resultado.isConfirmed) {
                    aplicarPlantilla(clave);
                } else {
                    // Se vuelve a mostrar la opción que sigue aplicada
                    selectPlantilla.value = plantillaActual;
                }
            });
    } else {
        aplicarPlantilla(clave);
    }
}

function aplicarPlantilla(clave) {
    preguntas = [];
    let nuevoNombre = "";
    let nuevaDescripcion = "";

    if (clave !== "") {
        const plantilla = plantillas[clave];

        for (const preguntaPlantilla of plantilla.preguntas) {
            preguntas.push({
                id: siguienteId,
                texto: preguntaPlantilla.texto,
                tipo: preguntaPlantilla.tipo,
                opciones: preguntaPlantilla.opciones.slice(),     // slice() copia el arreglo
                obligatoria: preguntaPlantilla.obligatoria
            });
            siguienteId++;
        }

        nuevoNombre = plantilla.nombre + " (copia)";
        nuevaDescripcion = plantilla.descripcion;
    }

    // El nombre y la descripción solo se cambian si están vacíos o si los puso la plantilla anterior.
    // Si el usuario los escribió o los editó, se respetan.
    const nombreActual = inputNombreFormulario.value.trim();
    if (nombreActual === "" || nombreActual === nombreAutocompletado) {
        inputNombreFormulario.value = nuevoNombre;
        nombreAutocompletado = nuevoNombre;
    }

    const descripcionActual = inputDescripcionFormulario.value.trim();
    if (descripcionActual === "" || descripcionActual === descripcionAutocompletada) {
        inputDescripcionFormulario.value = nuevaDescripcion;
        descripcionAutocompletada = nuevaDescripcion;
    }

    plantillaActual = clave;
    limpiarFormularioPregunta();
    revalidar();

    if (clave === "") {
        textoAnuncioPreguntas.textContent = "Se cambió a un formulario en blanco.";
    } else {
        textoAnuncioPreguntas.textContent = "Se cargaron " + preguntas.length + " preguntas de la plantilla.";
    }
}


// 6. Validación del formulario completo
function validarListaPreguntas() {
    if (preguntas.length === 0) {
        divErrorPreguntas.textContent = "Agregue al menos una pregunta al formulario.";
        divErrorPreguntas.classList.add("d-block");
        listaErrores.push({ campo: inputTextoPregunta, etiqueta: "Preguntas", mensaje: "Agregue al menos una pregunta." });
    } else {
        divErrorPreguntas.textContent = "";
        divErrorPreguntas.classList.remove("d-block");
    }
}

function validarFormulario() {
    listaErrores = [];

    validarLargo(inputNombreFormulario, "Nombre del formulario", 5, "Escriba el nombre del formulario.");
    validarSeleccion(selectEstadoFormulario, "Estado", "Seleccione el estado del formulario.");
    validarLargo(inputDescripcionFormulario, "Descripción", 15, "Escriba una descripción del formulario.");
    validarGrupo(grupoOfertas, "Ofertas educativas", 1, 4,
        "Marque al menos una oferta educativa a la que aplica el formulario.", "");
    validarListaPreguntas();

    return listaErrores.length === 0;
}

function guardarFormulario(evento) {
    evento.preventDefault();
    seIntentoEnviar = true;

    if (validarFormulario() === false) {
        mostrarErrores();
        return;
    }

    // Más adelante, aquí se enviarán los datos al servidor con fetch
    const nombre = inputNombreFormulario.value.trim();
    mostrarExito("Formulario guardado", "\"" + nombre + "\" se guardó con " + preguntas.length + " pregunta(s).")
        .then(function () {
            reiniciarPantalla();
        });
}

function cancelarFormulario() {
    confirmarAccion("¿Descartar el formulario?", "Se perderán los datos y las preguntas que no ha guardado.", "Sí, descartar")
        .then(function (resultado) {
            if (resultado.isConfirmed) {
                reiniciarPantalla();
            }
        });
}

function reiniciarPantalla() {
    formFormulario.reset();
    limpiarValidacion(formFormulario);
    seIntentoEnviar = false;
    preguntas = [];
    plantillaActual = "";
    nombreAutocompletado = "";
    descripcionAutocompletada = "";
    divErrorPreguntas.textContent = "";
    divErrorPreguntas.classList.remove("d-block");
    limpiarFormularioPregunta();
    inputNombreFormulario.focus();
}


// 7. Validación mientras se escribe (solo después del primer intento de guardar)
function revalidar() {
    if (seIntentoEnviar === true) {
        validarFormulario();
    }
}


// 8. Eventos
formFormulario.addEventListener("submit", guardarFormulario);
formFormulario.addEventListener("input", revalidar);
formFormulario.addEventListener("change", revalidar);
selectPlantilla.addEventListener("change", cargarPlantilla);
btnCancelar.addEventListener("click", cancelarFormulario);

formPregunta.addEventListener("submit", guardarPregunta);
selectTipoRespuesta.addEventListener("change", mostrarCampoOpciones);
btnCancelarEdicion.addEventListener("click", limpiarFormularioPregunta);


// 9. Estado inicial
mostrarCampoOpciones();
mostrarPreguntas();
