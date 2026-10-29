// Funciones compartidas de validación
// Las usan todas las pantallas que tienen formularios. Se carga ANTES del archivo
// propio de cada pantalla, por eso sus funciones y variables están disponibles allí.


// Expresiones regulares compartidas
// ^ = inicio del texto, $ = final del texto
// \d = un dígito, {n,m} = entre n y m veces, [ ] = caracteres permitidos

const regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,60}$/;     // letras (con tildes y ñ) y espacios, de 3 a 60
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;      // algo@algo.algo
const regexCorreoMep = /^[^\s@]+@mep\.go\.cr$/i;          // solo correos institucionales: nombre@mep.go.cr
const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;  // mínimo 8 caracteres, al menos una letra y un número


// Variables generales
let listaErrores = [];          // aquí se guardan los errores de la última validación
let seIntentoEnviar = false;    // después del primer intento, se valida mientras se escribe


// Funciones para marcar los campos

// Marca un campo con error: borde rojo, mensaje debajo y lo agrega a la lista
function marcarError(campo, etiqueta, mensaje) {
    campo.classList.add("is-invalid");        // clase de Bootstrap: borde rojo
    campo.classList.remove("is-valid");

    // Cada campo tiene un <div id="error-..."> para su mensaje
    const divError = document.getElementById("error-" + campo.id);
    divError.textContent = mensaje;
    divError.classList.add("d-block");        // d-block obliga a que el mensaje se vea

    listaErrores.push({ campo: campo, etiqueta: etiqueta, mensaje: mensaje });
}

// Marca un campo como correcto: borde verde y sin mensaje
function marcarCorrecto(campo) {
    campo.classList.remove("is-invalid");
    campo.classList.add("is-valid");          // clase de Bootstrap: borde verde

    const divError = document.getElementById("error-" + campo.id);
    divError.textContent = "";
    divError.classList.remove("d-block");
}

// Quita cualquier marca (se usa en campos que dejan de aplicar)
function quitarMarca(campo) {
    campo.classList.remove("is-invalid", "is-valid");

    const divError = document.getElementById("error-" + campo.id);
    if (divError !== null) {
        divError.textContent = "";
        divError.classList.remove("d-block");
    }
}


// Funciones de validación reutilizables
// Mensajes de error USABLES: dicen qué está mal y cómo corregirlo.

// Valida un campo de texto con una expresión regular
function validarConRegex(campo, etiqueta, regex, mensajeVacio, mensajeFormato) {
    const valor = campo.value.trim();          // trim() quita los espacios de los extremos

    if (valor === "") {
        marcarError(campo, etiqueta, mensajeVacio);
    } else if (regex.test(valor) === false) {  // test() devuelve true si el texto cumple el patrón
        marcarError(campo, etiqueta, mensajeFormato);
    } else {
        marcarCorrecto(campo);
    }
}

// Valida que un texto tenga una cantidad mínima de caracteres
function validarLargo(campo, etiqueta, minimo, mensajeVacio) {
    const largo = campo.value.trim().length;

    if (largo === 0) {
        marcarError(campo, etiqueta, mensajeVacio);
    } else if (largo < minimo) {
        marcarError(campo, etiqueta, "Debe tener al menos " + minimo + " caracteres (lleva " + largo + ").");
    } else {
        marcarCorrecto(campo);
    }
}

// Valida que se haya elegido una opción de un select
function validarSeleccion(select, etiqueta, mensaje) {
    if (select.value === "") {
        marcarError(select, etiqueta, mensaje);
    } else {
        marcarCorrecto(select);
    }
}

// Valida un grupo de checkboxes: cantidad mínima y máxima de opciones marcadas.
// El contenedor del grupo debe tener un id; su mensaje va en "error-" + ese id.
function validarGrupo(contenedor, etiqueta, minimo, maximo, mensajeMinimo, mensajeMaximo) {
    const casillas = contenedor.querySelectorAll('input[type="checkbox"]');
    const marcadas = contenedor.querySelectorAll('input[type="checkbox"]:checked');
    const divError = document.getElementById("error-" + contenedor.id);
    let mensaje = "";

    if (marcadas.length < minimo) {
        mensaje = mensajeMinimo;
    } else if (marcadas.length > maximo) {
        mensaje = mensajeMaximo;
    }

    if (mensaje !== "") {
        contenedor.classList.add("is-invalid");
        for (const casilla of casillas) {
            casilla.classList.add("is-invalid");
        }
        divError.textContent = mensaje;
        divError.classList.add("d-block");
        // Se guarda la primera casilla para poder llevarle el foco
        listaErrores.push({ campo: casillas[0], etiqueta: etiqueta, mensaje: mensaje });
    } else {
        contenedor.classList.remove("is-invalid");
        for (const casilla of casillas) {
            casilla.classList.remove("is-invalid");
        }
        divError.textContent = "";
        divError.classList.remove("d-block");
    }
}

// Deja un formulario sin marcas ni mensajes
function limpiarValidacion(formulario) {
    listaErrores = [];

    const camposMarcados = formulario.querySelectorAll(".is-invalid, .is-valid");
    for (const campo of camposMarcados) {
        campo.classList.remove("is-invalid", "is-valid");
    }

    const mensajes = formulario.querySelectorAll(".invalid-feedback");
    for (const mensaje of mensajes) {
        mensaje.textContent = "";
        mensaje.classList.remove("d-block");
    }
}


// Mensajes con SweetAlert2
// Los botones usan las clases de Bootstrap para respetar los colores del tema
const estiloBotonesAlerta = {
    confirmButton: "btn btn-primary mx-1",
    cancelButton: "btn btn-outline-secondary mx-1"
};

// Crea una lista <ul> con los errores encontrados
function crearListaErrores() {
    const lista = document.createElement("ul");
    lista.className = "text-start mb-0";

    for (const error of listaErrores) {
        const item = document.createElement("li");
        const negrita = document.createElement("strong");
        negrita.textContent = error.etiqueta + ": ";

        item.appendChild(negrita);
        item.append(error.mensaje);          // agrega el texto después de la negrita
        lista.appendChild(item);
    }
    return lista;
}

// Muestra el resumen de errores y lleva el foco al primer campo con error
function mostrarErrores() {
    Swal.fire({
        icon: "error",
        title: "Hay " + listaErrores.length + " campo(s) por corregir",
        html: crearListaErrores(),
        confirmButtonText: "Ir al primer error",
        buttonsStyling: false,
        customClass: estiloBotonesAlerta,
        returnFocus: false                   // el foco lo movemos nosotros
    }).then(function () {
        if (listaErrores.length > 0) {
            listaErrores[0].campo.focus();
        }
    });
}

// Mensaje de éxito; devuelve la promesa para hacer algo cuando se cierre
function mostrarExito(titulo, texto) {
    return Swal.fire({
        icon: "success",
        title: titulo,
        text: texto,
        confirmButtonText: "Aceptar",
        buttonsStyling: false,
        customClass: estiloBotonesAlerta
    });
}

// Pide confirmación antes de una acción; la opción segura queda seleccionada
function confirmarAccion(titulo, texto, textoConfirmar) {
    return Swal.fire({
        icon: "warning",
        title: titulo,
        text: texto,
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        cancelButtonText: "Cancelar",
        focusCancel: true,
        buttonsStyling: false,
        customClass: estiloBotonesAlerta
    });
}


// Utilidades

// Devuelve la fecha de hoy con el formato "AAAA-MM-DD" (el mismo de los input date)
function obtenerFechaHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");   // los meses empiezan en 0
    const dia = String(hoy.getDate()).padStart(2, "0");
    return anio + "-" + mes + "-" + dia;
}

// Convierte "2025-02-15" en "15/02/2025" para mostrarlo en pantalla
function formatearFecha(fechaIso) {
    const partes = fechaIso.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Crea un badge de estado con su clase de color
// Ej.: crearBadgeEstado("en_revision") → <span class="badge-estado badge-en-revision">En revisión</span>
const nombresEstados = {
    borrador: "Borrador",
    en_registro: "En registro",
    en_revision: "En revisión",
    en_subsane: "En subsane",
    aceptado: "Aceptado",
    abierto: "Abierto",
    pausado: "Pausado",
    cerrado: "Cerrado"
};

function crearBadgeEstado(estado) {
    const badge = document.createElement("span");
    // La clase usa guiones: "en_revision" → "badge-en-revision"
    badge.className = "badge-estado badge-" + estado.replaceAll("_", "-");
    badge.textContent = nombresEstados[estado];
    return badge;
}
