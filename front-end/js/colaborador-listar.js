// Gestión de colaboradores (RF-004, RF-008, RF-014 y RF-016)
// Registra colaboradores y les asigna un rol. La asignación cambia según el rol:
//   Técnico → provincias (RF-008)
//   Director → de 1 a 3 centros educativos (RF-014)
//   Administrador general → sin asignación; correo @mep.go.cr (RF-016)


// 1. Selección de elementos del DOM

// Lista
const inputBuscarColaborador = document.getElementById("buscarColaborador");
const selectFiltroRol = document.getElementById("filtroRol");
const btnRegistrar = document.getElementById("btnRegistrar");
const cuerpoTablaColaboradores = document.getElementById("cuerpoTablaColaboradores");
const textoResumenColaboradores = document.getElementById("resumenColaboradores");

// Formulario
const formColaborador = document.getElementById("formColaborador");
const tituloGestion = document.getElementById("tituloGestion");
const inputNombreColaborador = document.getElementById("nombreColaborador");
const inputCorreoColaborador = document.getElementById("correoColaborador");
const textoAyudaCorreo = document.getElementById("ayuda-correoColaborador");
const selectRolColaborador = document.getElementById("rolColaborador");
const contenedorAsignacion = document.getElementById("contenedorAsignacion");
const contenedorContrasena = document.getElementById("contenedorContrasena");
const textoNotaContrasena = document.getElementById("notaContrasena");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");


// 2. Datos de ejemplo (los centros vienen de datos-ejemplo.js; más adelante, del servidor)
const provincias = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];

// Los centros vienen de datos-ejemplo.js para que coincidan con las demás pantallas
const centros = centrosEjemplo;

const nombresRoles = {
    tecnico: "Técnico",
    director: "Director",
    administrador_general: "Administrador general"
};

const MAXIMO_CENTROS_DIRECTOR = 3;

let colaboradores = [
    { id: 1, nombre: "Ana Lucía Vargas", correo: "ana.vargas@mep.go.cr", rol: "tecnico", zonas: ["San José", "Cartago"], centrosAsignados: [] },
    { id: 2, nombre: "Carlos Mora Solís", correo: "carlos.mora@mep.go.cr", rol: "tecnico", zonas: ["Alajuela", "Heredia"], centrosAsignados: [] },
    { id: 3, nombre: "María Fernanda Rojas", correo: "mfrojas@gmail.com", rol: "director", zonas: [], centrosAsignados: [5, 4] },
    { id: 4, nombre: "José Pablo Solano", correo: "jose.solano@mep.go.cr", rol: "administrador_general", zonas: [], centrosAsignados: [] }
];

let siguienteId = 5;
let idEnEdicion = null;      // colaborador cargado en el formulario (null = registro nuevo)


// 3. Utilidades
function buscarColaborador(id) {
    for (const colaborador of colaboradores) {
        if (colaborador.id === id) {
            return colaborador;
        }
    }
    return null;
}

function nombreCentro(id) {
    for (const centro of centros) {
        if (centro.id === id) {
            return centro.nombre;
        }
    }
    return "";
}

// Texto de la columna "Provincias / centros educativos"
function describirAsignacion(colaborador) {
    if (colaborador.rol === "tecnico") {
        return {
            principal: colaborador.zonas.join(" · "),
            detalle: colaborador.zonas.length + " provincia(s) asignada(s)"
        };
    }

    if (colaborador.rol === "director") {
        const nombres = [];
        for (const id of colaborador.centrosAsignados) {
            nombres.push(nombreCentro(id));
        }
        return {
            principal: nombres.join(" · "),
            detalle: nombres.length + " centro(s) educativo(s)"
        };
    }

    return { principal: "Gestión general del sistema", detalle: "Sin asignación territorial" };
}


// 4. Tabla de colaboradores (elementos creados con JS)
function crearFilaColaborador(colaborador) {
    const fila = document.createElement("tr");
    if (colaborador.id === idEnEdicion) {
        fila.classList.add("fila-seleccionada");
    }

    const celdaNombre = document.createElement("th");
    celdaNombre.scope = "row";
    celdaNombre.textContent = colaborador.nombre;
    if (colaborador.id === idEnEdicion) {
        const marca = document.createElement("span");
        marca.className = "d-block small";
        marca.textContent = "En edición";
        celdaNombre.appendChild(marca);
    }

    const celdaCorreo = document.createElement("td");
    celdaCorreo.textContent = colaborador.correo;

    const celdaRol = document.createElement("td");
    const badgeRol = document.createElement("span");
    badgeRol.className = "badge-estado badge-rol";
    badgeRol.textContent = nombresRoles[colaborador.rol];
    celdaRol.appendChild(badgeRol);

    const asignacion = describirAsignacion(colaborador);
    const celdaAsignacion = document.createElement("td");
    celdaAsignacion.textContent = asignacion.principal;
    const detalle = document.createElement("span");
    detalle.className = "d-block small texto-secundario";
    detalle.textContent = asignacion.detalle;
    celdaAsignacion.appendChild(detalle);

    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "text-end text-nowrap";
    const btnGestionar = document.createElement("button");
    btnGestionar.type = "button";
    btnGestionar.className = "btn-enlace";
    btnGestionar.textContent = "Gestionar";
    btnGestionar.setAttribute("aria-label", "Gestionar a " + colaborador.nombre);
    btnGestionar.addEventListener("click", function () {
        cargarColaborador(colaborador.id, true);
    });
    celdaAcciones.appendChild(btnGestionar);

    fila.append(celdaNombre, celdaCorreo, celdaRol, celdaAsignacion, celdaAcciones);
    return fila;
}

// Muestra los colaboradores que cumplen la búsqueda y el filtro de rol
function mostrarColaboradores() {
    const textoBuscado = inputBuscarColaborador.value.trim().toLowerCase();
    const rolFiltrado = selectFiltroRol.value;
    let cantidadMostrada = 0;

    cuerpoTablaColaboradores.innerHTML = "";

    for (const colaborador of colaboradores) {
        const coincideTexto = colaborador.nombre.toLowerCase().includes(textoBuscado) ||
            colaborador.correo.toLowerCase().includes(textoBuscado);
        const coincideRol = rolFiltrado === "" || colaborador.rol === rolFiltrado;

        if (coincideTexto && coincideRol) {
            cuerpoTablaColaboradores.appendChild(crearFilaColaborador(colaborador));
            cantidadMostrada++;
        }
    }

    if (cantidadMostrada === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 5;
        celda.className = "text-center texto-secundario";
        celda.textContent = "No hay colaboradores que coincidan con la búsqueda.";
        fila.appendChild(celda);
        cuerpoTablaColaboradores.appendChild(fila);
    }

    textoResumenColaboradores.textContent = cantidadMostrada + " colaborador(es) en este listado";
}


// 5. Asignación según el rol (elementos creados con JS)

// Crea un grupo de checkboxes con su leyenda, contador, ayuda y mensaje de error
function crearGrupoCasillas(idGrupo, titulo, ayuda, opciones, marcadas) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "aparecer";
    fieldset.setAttribute("aria-describedby", "ayuda-" + idGrupo + " error-" + idGrupo);

    const leyenda = document.createElement("legend");
    leyenda.className = "form-label d-flex justify-content-between w-100";
    // El título va dentro de un <span> para que el espacio antes del asterisco se conserve
    leyenda.innerHTML = '<span>' + titulo + ' <span class="obligatorio" aria-hidden="true">*</span></span>';

    // Contador: aria-live anuncia cuántas opciones hay marcadas
    const contador = document.createElement("span");
    contador.className = "small texto-secundario fw-bold ms-auto";
    contador.id = "contador-" + idGrupo;
    contador.setAttribute("aria-live", "polite");
    leyenda.appendChild(contador);

    const grupo = document.createElement("div");
    grupo.className = "grupo-opciones row g-1";
    grupo.id = idGrupo;

    for (const opcion of opciones) {
        const columna = document.createElement("div");
        columna.className = "col-12 col-sm-6";

        const contenedor = document.createElement("div");
        contenedor.className = "form-check";

        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.className = "form-check-input";
        casilla.id = idGrupo + "-" + opcion.valor;
        casilla.value = opcion.valor;
        casilla.checked = marcadas.includes(opcion.valor);
        casilla.addEventListener("change", actualizarContador);

        const etiqueta = document.createElement("label");
        etiqueta.className = "form-check-label";
        etiqueta.htmlFor = casilla.id;
        etiqueta.textContent = opcion.texto;

        contenedor.append(casilla, etiqueta);
        columna.appendChild(contenedor);
        grupo.appendChild(columna);
    }

    const textoAyuda = document.createElement("div");
    textoAyuda.className = "form-text";
    textoAyuda.id = "ayuda-" + idGrupo;
    textoAyuda.textContent = ayuda;

    const divError = document.createElement("div");
    divError.className = "invalid-feedback";
    divError.id = "error-" + idGrupo;

    fieldset.append(leyenda, grupo, textoAyuda, divError);
    return fieldset;
}

// Muestra "N seleccionadas" sobre el grupo de casillas visible
function actualizarContador() {
    const grupo = contenedorAsignacion.querySelector(".grupo-opciones");
    if (grupo === null) {
        return;
    }

    const marcadas = grupo.querySelectorAll('input[type="checkbox"]:checked').length;
    const contador = document.getElementById("contador-" + grupo.id);
    contador.textContent = marcadas + " seleccionada(s)";
}

// Construye la sección de asignación que corresponde al rol elegido
function mostrarAsignacion(zonasMarcadas, centrosMarcados) {
    const rol = selectRolColaborador.value;
    contenedorAsignacion.innerHTML = "";

    if (rol === "tecnico") {
        const opciones = [];
        for (const provincia of provincias) {
            opciones.push({ valor: provincia, texto: provincia });
        }
        contenedorAsignacion.appendChild(crearGrupoCasillas("grupoProvincias", "Provincias asignadas",
            "Seleccione una o varias provincias según la cobertura requerida, no según la ubicación física del técnico.",
            opciones, zonasMarcadas));
        textoAyudaCorreo.textContent = "Técnicos y directores pueden usar cualquier correo.";

    } else if (rol === "director") {
        const opciones = [];
        const marcados = [];
        for (const centro of centros) {
            opciones.push({ valor: String(centro.id), texto: centro.nombre });
        }
        for (const id of centrosMarcados) {
            marcados.push(String(id));       // los value de los checkbox son texto
        }
        contenedorAsignacion.appendChild(crearGrupoCasillas("grupoCentros", "Centros educativos asociados",
            "Seleccione de 1 a " + MAXIMO_CENTROS_DIRECTOR + " centros educativos que dirige esta persona.",
            opciones, marcados));
        textoAyudaCorreo.textContent = "Técnicos y directores pueden usar cualquier correo.";

    } else if (rol === "administrador_general") {
        const aviso = document.createElement("div");
        aviso.className = "aviso-informativo aparecer";
        aviso.innerHTML = '<i class="fa-solid fa-shield-halved" aria-hidden="true"></i>' +
            '<p class="mb-0">El administrador general no tiene asignación territorial. Ingresa con su correo ' +
            '@mep.go.cr mediante el sistema de autenticación del MEP.</p>';
        contenedorAsignacion.appendChild(aviso);
        textoAyudaCorreo.textContent = "El administrador general debe usar un correo @mep.go.cr.";

    } else {
        const mensaje = document.createElement("p");
        mensaje.className = "texto-secundario mb-0";
        mensaje.textContent = "Seleccione un rol para ver las opciones de asignación.";
        contenedorAsignacion.appendChild(mensaje);
    }

    actualizarContador();
    mostrarCampoContrasena();
}

// La contraseña temporal se pide al registrar un técnico o director, o si un
// administrador general pasa a ser técnico o director (antes no tenía contraseña).
function necesitaContrasena() {
    const rol = selectRolColaborador.value;
    if (rol !== "tecnico" && rol !== "director") {
        return false;
    }
    if (idEnEdicion === null) {
        return true;
    }
    return buscarColaborador(idEnEdicion).rol === "administrador_general";
}

function mostrarCampoContrasena() {
    const campoExistente = document.getElementById("contrasenaTemporal");

    if (necesitaContrasena()) {
        textoNotaContrasena.textContent = "";
        if (campoExistente !== null) {
            return;                          // ya está creado
        }

        // innerHTML solo con texto escrito por nosotros, nunca con datos del usuario
        contenedorContrasena.innerHTML = `
            <div class="aparecer">
                <label for="contrasenaTemporal" class="form-label">
                    Contraseña temporal <span class="obligatorio" aria-hidden="true">*</span>
                </label>
                <div class="campo-contrasena">
                    <input type="password" id="contrasenaTemporal" class="form-control" autocomplete="new-password"
                        required aria-describedby="ayuda-contrasenaTemporal error-contrasenaTemporal">
                    <button type="button" class="btn-icono" id="btnVerContrasena" aria-label="Mostrar contraseña"
                        aria-pressed="false" aria-controls="contrasenaTemporal">
                        <i class="fa-regular fa-eye" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="form-text" id="ayuda-contrasenaTemporal">
                    Mínimo 8 caracteres, con al menos una letra y un número. Entréguela al colaborador para su primer ingreso.
                </div>
                <div class="invalid-feedback" id="error-contrasenaTemporal"></div>
            </div>`;

        document.getElementById("btnVerContrasena").addEventListener("click", alternarContrasena);
    } else {
        contenedorContrasena.innerHTML = "";
        if (idEnEdicion !== null && selectRolColaborador.value !== "administrador_general") {
            textoNotaContrasena.textContent = "La contraseña actual no se modifica.";
        } else {
            textoNotaContrasena.textContent = "";
        }
    }
}

function alternarContrasena() {
    // Se buscan aquí porque estos elementos se crean con JS
    const inputContrasena = document.getElementById("contrasenaTemporal");
    const btnVerContrasena = document.getElementById("btnVerContrasena");
    const icono = btnVerContrasena.querySelector("i");

    if (inputContrasena.type === "password") {
        inputContrasena.type = "text";
        icono.className = "fa-regular fa-eye-slash";
        btnVerContrasena.setAttribute("aria-label", "Ocultar contraseña");
        btnVerContrasena.setAttribute("aria-pressed", "true");
    } else {
        inputContrasena.type = "password";
        icono.className = "fa-regular fa-eye";
        btnVerContrasena.setAttribute("aria-label", "Mostrar contraseña");
        btnVerContrasena.setAttribute("aria-pressed", "false");
    }
}

// Al cambiar el rol se reconstruye la asignación sin opciones marcadas
function cambiarRol() {
    mostrarAsignacion([], []);
}


// 6. Validación
function validarCorreo() {
    const rol = selectRolColaborador.value;
    const correo = inputCorreoColaborador.value.trim().toLowerCase();

    if (rol === "administrador_general") {
        validarConRegex(inputCorreoColaborador, "Correo electrónico", regexCorreoMep,
            "Escriba el correo del colaborador.",
            "El administrador general debe usar un correo @mep.go.cr. Ej.: nombre@mep.go.cr.");
    } else {
        validarConRegex(inputCorreoColaborador, "Correo electrónico", regexCorreo,
            "Escriba el correo del colaborador.",
            "Revise el correo: debe tener el formato nombre@dominio.com.");
    }

    // El correo es único: no puede pertenecer a otro colaborador
    if (inputCorreoColaborador.classList.contains("is-valid")) {
        for (const colaborador of colaboradores) {
            if (colaborador.correo.toLowerCase() === correo && colaborador.id !== idEnEdicion) {
                marcarError(inputCorreoColaborador, "Correo electrónico",
                    "Este correo ya está registrado para " + colaborador.nombre + ". Use otro correo.");
            }
        }
    }
}

function validarAsignacion() {
    const rol = selectRolColaborador.value;

    // Los grupos se crean con JS: se buscan en el momento de validar.
    // Al cambiar el rol, el evento "input" llega antes de que el grupo nuevo exista;
    // por eso se revisa que el grupo no sea null.
    const grupoProvincias = document.getElementById("grupoProvincias");
    const grupoCentros = document.getElementById("grupoCentros");

    if (rol === "tecnico" && grupoProvincias !== null) {
        validarGrupo(grupoProvincias, "Provincias asignadas", 1, provincias.length,
            "Marque al menos una provincia para el técnico.", "");
    } else if (rol === "director" && grupoCentros !== null) {
        validarGrupo(grupoCentros, "Centros educativos", 1, MAXIMO_CENTROS_DIRECTOR,
            "Marque al menos un centro educativo para el director.",
            "Un director puede tener como máximo " + MAXIMO_CENTROS_DIRECTOR + " centros. Desmarque los que sobran.");
    }
}

function validarContrasenaTemporal() {
    const inputContrasena = document.getElementById("contrasenaTemporal");
    if (inputContrasena !== null) {
        validarConRegex(inputContrasena, "Contraseña temporal", regexContrasena,
            "Escriba una contraseña temporal.",
            "La contraseña necesita mínimo 8 caracteres, al menos una letra y un número.");
    }
}

function validarFormulario() {
    listaErrores = [];

    validarConRegex(inputNombreColaborador, "Nombre completo", regexNombre,
        "Escriba el nombre completo del colaborador.",
        "El nombre solo puede tener letras y espacios (de 3 a 60 caracteres).");
    validarSeleccion(selectRolColaborador, "Rol", "Seleccione el rol del colaborador.");
    validarCorreo();
    validarAsignacion();
    validarContrasenaTemporal();

    return listaErrores.length === 0;
}


// 7. Cargar, registrar y guardar
function cargarColaborador(id, enfocar) {
    const colaborador = buscarColaborador(id);
    const centrosMarcados = [];
    for (const idCentro of colaborador.centrosAsignados) {
        centrosMarcados.push(idCentro);
    }

    idEnEdicion = id;
    seIntentoEnviar = false;
    limpiarValidacion(formColaborador);

    inputNombreColaborador.value = colaborador.nombre;
    inputCorreoColaborador.value = colaborador.correo;
    selectRolColaborador.value = colaborador.rol;
    contenedorContrasena.innerHTML = "";

    tituloGestion.textContent = "Gestionar colaborador: " + colaborador.nombre;
    btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk me-1" aria-hidden="true"></i> Guardar cambios';

    mostrarAsignacion(colaborador.zonas, centrosMarcados);
    mostrarColaboradores();

    if (enfocar) {
        inputNombreColaborador.focus();
    }
}

function nuevoColaborador() {
    idEnEdicion = null;
    seIntentoEnviar = false;
    formColaborador.reset();
    limpiarValidacion(formColaborador);
    contenedorContrasena.innerHTML = "";

    tituloGestion.textContent = "Registrar colaborador";
    btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk me-1" aria-hidden="true"></i> Registrar colaborador';

    mostrarAsignacion([], []);
    mostrarColaboradores();
    inputNombreColaborador.focus();
}

// Devuelve los valores marcados del grupo de asignación visible
function obtenerValoresMarcados(idGrupo) {
    const grupo = document.getElementById(idGrupo);
    const valores = [];
    if (grupo === null) {
        return valores;
    }

    const marcadas = grupo.querySelectorAll('input[type="checkbox"]:checked');
    for (const casilla of marcadas) {
        valores.push(casilla.value);
    }
    return valores;
}

function guardarColaborador(evento) {
    evento.preventDefault();
    seIntentoEnviar = true;

    if (validarFormulario() === false) {
        mostrarErrores();
        return;
    }

    const rol = selectRolColaborador.value;
    const centrosElegidos = [];
    for (const valor of obtenerValoresMarcados("grupoCentros")) {
        centrosElegidos.push(Number(valor));
    }

    const datos = {
        nombre: inputNombreColaborador.value.trim(),
        correo: inputCorreoColaborador.value.trim().toLowerCase(),
        rol: rol,
        zonas: obtenerValoresMarcados("grupoProvincias"),
        centrosAsignados: centrosElegidos
    };

    // Más adelante, aquí se enviarán los datos al servidor con fetch
    // (la contraseña temporal se envía al servidor y nunca se guarda en el navegador)
    let titulo = "Colaborador registrado";
    if (idEnEdicion === null) {
        datos.id = siguienteId;
        siguienteId++;
        colaboradores.push(datos);
    } else {
        titulo = "Cambios guardados";
        const colaborador = buscarColaborador(idEnEdicion);
        colaborador.nombre = datos.nombre;
        colaborador.correo = datos.correo;
        colaborador.rol = datos.rol;
        colaborador.zonas = datos.zonas;
        colaborador.centrosAsignados = datos.centrosAsignados;
        datos.id = idEnEdicion;
    }

    mostrarExito(titulo, datos.nombre + " quedó registrado(a) como " + nombresRoles[rol].toLowerCase() + ".")
        .then(function () {
            cargarColaborador(datos.id, true);
        });
}

function cancelar() {
    if (idEnEdicion === null) {
        nuevoColaborador();
    } else {
        cargarColaborador(idEnEdicion, true);    // vuelve a los datos guardados
    }
}


// 8. Validación mientras se escribe
function revalidar() {
    if (seIntentoEnviar === true) {
        validarFormulario();
    }
}


// 9. Eventos
inputBuscarColaborador.addEventListener("input", mostrarColaboradores);
selectFiltroRol.addEventListener("change", mostrarColaboradores);
btnRegistrar.addEventListener("click", nuevoColaborador);
selectRolColaborador.addEventListener("change", cambiarRol);
btnCancelar.addEventListener("click", cancelar);

formColaborador.addEventListener("submit", guardarColaborador);
formColaborador.addEventListener("input", revalidar);
formColaborador.addEventListener("change", revalidar);


// 10. Estado inicial: se muestra la gestión del primer colaborador, como en el prototipo
cargarColaborador(1, false);
