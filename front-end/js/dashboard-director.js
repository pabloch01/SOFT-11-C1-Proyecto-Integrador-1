// Vista del Director del centro educativo (RF-009, RF-012, RF-013, RF-014 y RF-015)
// El director elige uno de sus centros, ve los censos que le corresponden según su oferta
// educativa, completa el formulario con los datos precargados del centro y lo remite al técnico.


// 1. Selección de elementos del DOM

// Encabezado y selección de centro
const textoCentroUsuario = document.getElementById("centroUsuario");
const selectCentro = document.getElementById("selectCentro");
const textoCantidadCentros = document.getElementById("textoCantidadCentros");
const contenedorTarjetas = document.getElementById("contenedorTarjetas");
const contenedorCentros = document.getElementById("contenedorCentros");

// Formulario censal
const tituloFormularioCensal = document.getElementById("tituloFormularioCensal");
const contenedorBadgeEstado = document.getElementById("badgeEstadoFormulario");
const contenedorProgreso = document.getElementById("barraProgreso");
const barraProgreso = document.querySelector("#barraProgreso .progress-bar");
const textoPorcentaje = document.getElementById("porcentajeProgreso");
const avisoSubsane = document.getElementById("avisoSubsane");
const textoMotivoSubsane = document.getElementById("textoMotivoSubsane");
const avisoSoloLectura = document.getElementById("avisoSoloLectura");
const textoSoloLectura = document.getElementById("textoSoloLectura");
const listaDatosCentro = document.getElementById("listaDatosCentro");

const formCensal = document.getElementById("formCensal");
const camposFormulario = document.getElementById("camposFormulario");
const inputCantidadEstudiantes = document.getElementById("cantidadEstudiantes");
const grupoNiveles = document.getElementById("grupoNiveles");
const grupoInternet = document.getElementById("grupoInternet");
const inputObservaciones = document.getElementById("observaciones");
const textoContador = document.getElementById("contador-observaciones");
const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
const btnRemitir = document.getElementById("btnRemitir");


// 2. Datos de ejemplo (más adelante vendrán del servidor)
const MAXIMO_ESTUDIANTES = 5000;
const MAXIMO_OBSERVACIONES = 500;

// Centros que dirige esta persona (RF-014) con sus datos precargados (RF-015)
const centros = [
    {
        id: 4, nombre: "Escuela República de Chile", codigo: "1234", tipo: "Diurno",
        cantidadEstudiantes: 342, direccion: "San José, Central, Catedral", telefono: "2222-3344",
        correo: "esc.republicadechile@mep.go.cr", oferta: "Preescolar, I y II Ciclo"
    },
    {
        id: 5, nombre: "Escuela Buenaventura Corrales", codigo: "1187", tipo: "Diurno",
        cantidadEstudiantes: 518, direccion: "San José, Central, El Carmen", telefono: "2233-1020",
        correo: "esc.buenaventuracorrales@mep.go.cr", oferta: "I y II Ciclo"
    }
];

// Formularios de cada centro. idCenso apunta a censosEjemplo (datos-ejemplo.js);
// "respuestas" guarda lo que el director ya escribió.
const formulariosPorCentro = {
    4: [
        {
            id: 1, idCenso: 1, estado: "en_registro", motivo: "",
            respuestas: { cantidad: "342", niveles: ["Preescolar", "I y II Ciclo"], internet: "", observaciones: "" }
        },
        {
            id: 2, idCenso: 2, estado: "borrador", motivo: "",
            respuestas: { cantidad: "", niveles: [], internet: "", observaciones: "" }
        },
        {
            id: 3, idCenso: 3, estado: "en_subsane",
            motivo: "La cantidad de estudiantes no coincide con el histórico de traslados de la regional. Revise la matrícula de primer grado.",
            respuestas: { cantidad: "290", niveles: ["Preescolar", "I y II Ciclo"], internet: "Sí, acceso parcial", observaciones: "" }
        }
    ],
    5: [
        {
            id: 4, idCenso: 1, estado: "en_revision", motivo: "",
            respuestas: { cantidad: "518", niveles: ["I y II Ciclo"], internet: "Sí, acceso total institucional", observaciones: "" }
        },
        {
            id: 5, idCenso: 4, estado: "aceptado", motivo: "",
            respuestas: { cantidad: "520", niveles: ["I y II Ciclo"], internet: "Sí, acceso total institucional", observaciones: "Sin observaciones." }
        }
    ]
};

let centroActual = centros[0];
let formularioActual = null;


// 3. Utilidades

// Toma el nombre y la fecha de cierre de cada censo desde datos-ejemplo.js,
// así coinciden con lo que ven el administrador y el técnico
function completarDatosCensos() {
    for (const idCentro in formulariosPorCentro) {          // for...in recorre las claves del objeto (4 y 5)
        for (const formulario of formulariosPorCentro[idCentro]) {
            const censo = buscarPorId(censosEjemplo, formulario.idCenso);
            formulario.censo = censo.nombre;
            formulario.cierre = censo.cierre;
        }
    }
}

function buscarCentro(id) {
    for (const centro of centros) {
        if (centro.id === id) {
            return centro;
        }
    }
    return null;
}

// Porcentaje de preguntas obligatorias respondidas (son 3: cantidad, niveles e internet)
function calcularProgreso(respuestas) {
    let completas = 0;

    if (respuestas.cantidad !== "") {
        completas++;
    }
    if (respuestas.niveles.length > 0) {
        completas++;
    }
    if (respuestas.internet !== "") {
        completas++;
    }
    return Math.round(completas / 3 * 100);
}

// Un formulario remitido o aceptado ya no se puede modificar
function esSoloLectura(formulario) {
    return formulario.estado === "en_revision" || formulario.estado === "aceptado";
}


// 4. Selector de centro y tarjetas de censos (elementos creados con JS)
function llenarSelectCentros() {
    for (const centro of centros) {
        const opcion = document.createElement("option");
        opcion.value = centro.id;
        opcion.textContent = centro.nombre + " (código " + centro.codigo + ")";
        selectCentro.appendChild(opcion);
    }

    textoCantidadCentros.textContent = "Usted administra " + centros.length +
        " centros educativos. Puede cambiar de centro en el selector para completar su respectiva carga.";
}

function crearTarjetaCenso(formulario) {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-xl-4";

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-censo aparecer";
    if (formularioActual !== null && formulario.id === formularioActual.id) {
        tarjeta.classList.add("activa");
    }

    const titulo = document.createElement("h3");
    titulo.textContent = formulario.censo;

    // Progreso del formulario
    const progreso = calcularProgreso(formulario.respuestas);
    const idTexto = "progresoTarjeta" + formulario.id;

    const filaProgreso = document.createElement("div");
    filaProgreso.className = "d-flex justify-content-between small mb-1";
    filaProgreso.innerHTML = '<span id="' + idTexto + '">Progreso general</span><span aria-hidden="true">' + progreso + ' %</span>';

    const barra = document.createElement("div");
    barra.className = "progress";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-labelledby", idTexto);
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", "100");
    barra.setAttribute("aria-valuenow", progreso);
    const relleno = document.createElement("div");
    relleno.className = "progress-bar";
    relleno.style.width = progreso + "%";
    barra.appendChild(relleno);

    // Pie: fecha de cierre y botón según el estado
    const pie = document.createElement("div");
    pie.className = "pie-tarjeta";

    const vence = document.createElement("span");
    vence.className = "small texto-secundario";
    vence.textContent = "Vence: " + formatearFecha(formulario.cierre);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-sm";

    if (formulario.estado === "en_subsane") {
        boton.classList.add("btn-correccion");
        boton.textContent = "Ver observaciones";
    } else if (esSoloLectura(formulario)) {
        boton.classList.add("btn-outline-secondary");
        boton.textContent = "Ver envío";
    } else {
        boton.classList.add("btn-primary");
        boton.textContent = "Completar";
    }
    boton.setAttribute("aria-label", boton.textContent + ": " + formulario.censo);
    boton.addEventListener("click", function () {
        cargarFormulario(formulario, true);
    });

    pie.append(vence, boton);
    tarjeta.append(crearBadgeEstado(formulario.estado), titulo, filaProgreso, barra, pie);
    columna.appendChild(tarjeta);
    return columna;
}

function mostrarTarjetas() {
    contenedorTarjetas.innerHTML = "";

    for (const formulario of formulariosPorCentro[centroActual.id]) {
        contenedorTarjetas.appendChild(crearTarjetaCenso(formulario));
    }
}

function cambiarCentro() {
    centroActual = buscarCentro(Number(selectCentro.value));
    textoCentroUsuario.textContent = centroActual.nombre;
    mostrarDatosCentro();
    cargarFormulario(formulariosPorCentro[centroActual.id][0], false);
}


// 5. Datos precargados del centro (RF-015)
function mostrarDatosCentro() {
    const datos = [
        ["Nombre oficial", centroActual.nombre],
        ["Código presupuestario", centroActual.codigo],
        ["Tipo de centro", centroActual.tipo],
        ["Cantidad de estudiantes registrada", centroActual.cantidadEstudiantes],
        ["Dirección", centroActual.direccion],
        ["Teléfono", centroActual.telefono],
        ["Correo electrónico", centroActual.correo],
        ["Oferta educativa", centroActual.oferta]
    ];

    listaDatosCentro.innerHTML = "";

    for (const dato of datos) {
        const columna = document.createElement("div");
        columna.className = "col-12 col-sm-6 col-lg-3";

        const termino = document.createElement("dt");
        termino.textContent = dato[0];

        const valor = document.createElement("dd");
        valor.textContent = dato[1];

        columna.append(termino, valor);
        listaDatosCentro.appendChild(columna);
    }
}


// 6. Cargar el formulario seleccionado
function cargarFormulario(formulario, enfocar) {
    formularioActual = formulario;
    seIntentoEnviar = false;
    limpiarValidacion(formCensal);
    limpiarGrupo(grupoNiveles);
    limpiarGrupo(grupoInternet);

    tituloFormularioCensal.textContent = formulario.censo + " — " + centroActual.nombre;
    contenedorBadgeEstado.innerHTML = "";
    contenedorBadgeEstado.appendChild(crearBadgeEstado(formulario.estado));

    // Respuestas guardadas
    const respuestas = formulario.respuestas;
    inputCantidadEstudiantes.value = respuestas.cantidad;
    for (const casilla of grupoNiveles.querySelectorAll("input")) {
        casilla.checked = respuestas.niveles.includes(casilla.value);
    }
    for (const radio of grupoInternet.querySelectorAll("input")) {
        radio.checked = radio.value === respuestas.internet;
    }
    inputObservaciones.value = respuestas.observaciones;

    // Observaciones del técnico (solo en subsane)
    if (formulario.estado === "en_subsane") {
        textoMotivoSubsane.textContent = formulario.motivo;
        avisoSubsane.classList.remove("d-none");
    } else {
        avisoSubsane.classList.add("d-none");
    }

    // Formularios remitidos o aceptados: solo lectura
    const bloqueado = esSoloLectura(formulario);
    camposFormulario.disabled = bloqueado;
    btnGuardarBorrador.disabled = bloqueado;
    btnRemitir.disabled = bloqueado;

    if (bloqueado) {
        if (formulario.estado === "aceptado") {
            textoSoloLectura.textContent = "El técnico de la DAE aceptó este formulario. Ya no se puede modificar.";
        } else {
            textoSoloLectura.textContent = "Este formulario fue remitido y está en revisión por el técnico de la DAE.";
        }
        avisoSoloLectura.classList.remove("d-none");
    } else {
        avisoSoloLectura.classList.add("d-none");
    }

    actualizarContador();
    actualizarProgreso();
    mostrarTarjetas();

    if (enfocar) {
        tituloFormularioCensal.focus();     // el título tiene tabindex="-1" para recibir el foco
    }
}

function limpiarGrupo(grupo) {
    for (const campo of grupo.querySelectorAll("input")) {
        campo.classList.remove("is-invalid");
    }
}


// 7. Elementos que cambian con JS

// Lee lo que está escrito en el formulario
function obtenerRespuestas() {
    const niveles = [];
    for (const casilla of grupoNiveles.querySelectorAll("input:checked")) {
        niveles.push(casilla.value);
    }

    const radioMarcado = grupoInternet.querySelector("input:checked");
    let internet = "";
    if (radioMarcado !== null) {
        internet = radioMarcado.value;
    }

    return {
        cantidad: inputCantidadEstudiantes.value.trim(),
        niveles: niveles,
        internet: internet,
        observaciones: inputObservaciones.value.trim()
    };
}

function actualizarProgreso() {
    const porcentaje = calcularProgreso(obtenerRespuestas());

    barraProgreso.style.width = porcentaje + "%";
    textoPorcentaje.textContent = porcentaje + " %";
    contenedorProgreso.setAttribute("aria-valuenow", porcentaje);
}

function actualizarContador() {
    textoContador.textContent = inputObservaciones.value.length + " / " + MAXIMO_OBSERVACIONES;
}


// 8. Validación
function validarCantidad() {
    const texto = inputCantidadEstudiantes.value.trim();
    const cantidad = Number(texto);        // el valor de un input siempre es texto

    if (texto === "") {
        marcarError(inputCantidadEstudiantes, "Pregunta 1", "Indique la cantidad total de estudiantes matriculados.");
    } else if (Number.isInteger(cantidad) === false || cantidad < 1 || cantidad > MAXIMO_ESTUDIANTES) {
        marcarError(inputCantidadEstudiantes, "Pregunta 1", "Debe ser un número entero entre 1 y " + MAXIMO_ESTUDIANTES + ".");
    } else {
        marcarCorrecto(inputCantidadEstudiantes);
    }
}

// Los radio buttons se validan como grupo: debe haber uno marcado
function validarInternet() {
    const radios = grupoInternet.querySelectorAll("input");
    const divError = document.getElementById("error-grupoInternet");

    if (grupoInternet.querySelector("input:checked") === null) {
        for (const radio of radios) {
            radio.classList.add("is-invalid");
        }
        divError.textContent = "Seleccione si el centro cuenta con acceso a internet.";
        divError.classList.add("d-block");
        listaErrores.push({ campo: radios[0], etiqueta: "Pregunta 3", mensaje: "Seleccione una opción de acceso a internet." });
    } else {
        for (const radio of radios) {
            radio.classList.remove("is-invalid");
        }
        divError.textContent = "";
        divError.classList.remove("d-block");
    }
}

function validarFormulario() {
    listaErrores = [];

    validarCantidad();
    validarGrupo(grupoNiveles, "Pregunta 2", 1, 3, "Marque al menos un nivel educativo que se imparte en el centro.", "");
    validarInternet();

    return listaErrores.length === 0;
}


// 9. Guardar borrador y remitir (RF-009)
function guardarBorrador() {
    // El borrador no exige todas las respuestas, pero la cantidad debe ser válida si se escribió
    listaErrores = [];
    if (inputCantidadEstudiantes.value.trim() !== "") {
        validarCantidad();
        if (listaErrores.length > 0) {
            mostrarErrores();
            return;
        }
    }

    formularioActual.respuestas = obtenerRespuestas();
    if (formularioActual.estado === "borrador") {
        formularioActual.estado = "en_registro";
    }

    // Más adelante, aquí se enviarán los datos al servidor con fetch
    cargarFormulario(formularioActual, false);
    mostrarExito("Borrador guardado", "Puede continuar con el formulario más tarde. Avance: " +
        calcularProgreso(formularioActual.respuestas) + " %.");
}

function remitirFormulario(evento) {
    evento.preventDefault();
    seIntentoEnviar = true;

    if (validarFormulario() === false) {
        mostrarErrores();
        return;
    }

    confirmarAccion("¿Remitir el formulario?", "Se enviará al técnico de la DAE para su revisión y ya no podrá modificarlo.", "Sí, remitir")
        .then(function (resultado) {
            if (resultado.isConfirmed) {
                formularioActual.respuestas = obtenerRespuestas();
                formularioActual.estado = "en_revision";      // RF-012: pasa a revisión
                formularioActual.motivo = "";
                cargarFormulario(formularioActual, false);
                mostrarExito("Formulario remitido", "El técnico de la DAE revisará la información de " + centroActual.nombre + ".");
            }
        });
}


// 10. Mis centros (elementos creados con JS)
function mostrarMisCentros() {
    contenedorCentros.innerHTML = "";

    for (const centro of centros) {
        const columna = document.createElement("div");
        columna.className = "col-12 col-md-6";

        const tarjeta = document.createElement("article");
        tarjeta.className = "panel h-100";

        const titulo = document.createElement("h3");
        titulo.className = "h5";
        titulo.textContent = centro.nombre;

        const detalle = document.createElement("p");
        detalle.className = "texto-secundario small mb-3";
        detalle.textContent = "Código " + centro.codigo + " · " + centro.tipo + " · " + centro.oferta;

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn btn-outline-primary btn-sm";
        boton.textContent = "Ver censos de este centro";
        boton.setAttribute("aria-label", "Ver censos de " + centro.nombre);
        boton.addEventListener("click", function () {
            selectCentro.value = centro.id;
            cambiarCentro();
            selectCentro.focus();
        });

        tarjeta.append(titulo, detalle, boton);
        columna.appendChild(tarjeta);
        contenedorCentros.appendChild(columna);
    }
}


// 11. Validación mientras se escribe
function revalidar() {
    if (seIntentoEnviar === true) {
        validarFormulario();
    }
    actualizarProgreso();
}


// 12. Eventos
selectCentro.addEventListener("change", cambiarCentro);
inputObservaciones.addEventListener("input", actualizarContador);
btnGuardarBorrador.addEventListener("click", guardarBorrador);
formCensal.addEventListener("submit", remitirFormulario);
formCensal.addEventListener("input", revalidar);
formCensal.addEventListener("change", revalidar);


// 13. Estado inicial
completarDatosCensos();
llenarSelectCentros();
mostrarMisCentros();
cambiarCentro();
