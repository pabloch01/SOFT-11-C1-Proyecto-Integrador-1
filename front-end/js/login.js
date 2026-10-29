// Inicio de sesión de técnicos y directores (RF-016 / HU-016)
// El perfil llega en la dirección de la página: login.html?rol=tecnico o login.html?rol=director
// Como todavía no hay back-end, si los datos tienen un formato válido se abre la pantalla del perfil.


// 1. Selección de elementos del DOM
const formLogin = document.getElementById("formLogin");
const textoDescripcionPerfil = document.getElementById("descripcionPerfil");
const grupoPerfil = document.getElementById("grupoPerfil");
const inputCorreo = document.getElementById("correo");
const inputContrasena = document.getElementById("contrasena");
const btnVerContrasena = document.getElementById("btnVerContrasena");


// 2. Variables generales
// URLSearchParams lee los parámetros que vienen después del "?" en la dirección
const parametros = new URLSearchParams(window.location.search);
const rolRecibido = parametros.get("rol");          // "tecnico", "director" o null

// Pantalla a la que se entra según el perfil
const paginasPorRol = {
    tecnico: "dashboard-tecnico.html",
    director: "dashboard-director.html"
};


// 3. Elementos que cambian con JS

// Ajusta el texto y el grupo de perfil según el rol recibido
function mostrarPerfil() {
    if (rolRecibido === "tecnico") {
        textoDescripcionPerfil.textContent = "Ingresa con las credenciales asignadas a tu perfil de Técnico de la DAE.";
    } else if (rolRecibido === "director") {
        textoDescripcionPerfil.textContent = "Ingresa con las credenciales asignadas a tu perfil de Director del centro educativo.";
    } else {
        // Si se entró sin pasar por index.html, la persona elige su perfil aquí
        grupoPerfil.classList.remove("d-none");
    }
}

// Muestra u oculta la contraseña
function alternarContrasena() {
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

// Devuelve el rol con el que se va a ingresar
function obtenerRolElegido() {
    if (rolRecibido === "tecnico" || rolRecibido === "director") {
        return rolRecibido;
    }

    const perfilMarcado = document.querySelector('input[name="perfil"]:checked');
    if (perfilMarcado === null) {
        return "";
    }
    return perfilMarcado.value;
}


// 4. Validación
function validarPerfil() {
    // Solo se valida cuando el grupo está visible
    if (grupoPerfil.classList.contains("d-none")) {
        return;
    }

    const divError = document.getElementById("error-grupoPerfil");
    const radiosPerfil = grupoPerfil.querySelectorAll('input[name="perfil"]');

    if (obtenerRolElegido() === "") {
        for (const radio of radiosPerfil) {
            radio.classList.add("is-invalid");
        }
        divError.textContent = "Elija si ingresa como Técnico de la DAE o como Director.";
        divError.classList.add("d-block");
        listaErrores.push({ campo: radiosPerfil[0], etiqueta: "Perfil", mensaje: "Elija su perfil." });
    } else {
        for (const radio of radiosPerfil) {
            radio.classList.remove("is-invalid");
        }
        divError.textContent = "";
        divError.classList.remove("d-block");
    }
}

function validarContrasena() {
    if (inputContrasena.value === "") {
        marcarError(inputContrasena, "Contraseña", "Escriba su contraseña.");
    } else {
        marcarCorrecto(inputContrasena);
    }
}

function validarFormulario() {
    listaErrores = [];

    validarPerfil();
    validarConRegex(inputCorreo, "Correo electrónico", regexCorreo,
        "Escriba su correo electrónico.",
        "Revise el correo: debe tener el formato nombre@dominio.com.");
    validarContrasena();

    return listaErrores.length === 0;
}


// 5. Envío del formulario
function iniciarSesion(evento) {
    evento.preventDefault();
    seIntentoEnviar = true;

    if (validarFormulario() === false) {
        mostrarErrores();
        return;
    }

    // Más adelante, aquí se enviarán las credenciales al servidor con fetch
    window.location.href = paginasPorRol[obtenerRolElegido()];
}


// 6. Validación mientras se escribe
function revalidar() {
    if (seIntentoEnviar === true) {
        validarFormulario();
    }
}


// 7. Eventos
formLogin.addEventListener("submit", iniciarSesion);
formLogin.addEventListener("input", revalidar);
formLogin.addEventListener("change", revalidar);
btnVerContrasena.addEventListener("click", alternarContrasena);


// 8. Estado inicial
mostrarPerfil();
