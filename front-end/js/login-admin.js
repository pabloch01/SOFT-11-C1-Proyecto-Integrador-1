// Acceso de la Jefatura de la DAE (RF-016 / HU-016)
// La Jefatura no usa contraseña de SICEN: se valida que el correo sea @mep.go.cr
// y se "redirige" al sistema del MEP. Como todavía no hay back-end, la redirección
// se simula y se abre directamente el panel de administración.


// 1. Selección de elementos del DOM
const formAccesoMep = document.getElementById("formAccesoMep");
const inputCorreoInstitucional = document.getElementById("correoInstitucional");


// 2. Validación
// regexCorreoMep viene de validaciones.js: solo acepta nombre@mep.go.cr
function validarFormulario() {
    listaErrores = [];     // se vacía la lista antes de validar otra vez

    validarConRegex(inputCorreoInstitucional, "Correo institucional", regexCorreoMep,
        "Escriba su correo institucional.",
        "El correo debe terminar en @mep.go.cr. Ej.: nombre.apellido@mep.go.cr.");

    return listaErrores.length === 0;
}


// 3. Envío del formulario
function continuarAlMep(evento) {
    evento.preventDefault();               // evita que la página se recargue
    seIntentoEnviar = true;

    if (validarFormulario() === false) {
        inputCorreoInstitucional.focus();  // con un solo campo no hace falta un resumen
        return;
    }

    // Simulación de la redirección al sistema del MEP
    Swal.fire({
        icon: "info",
        title: "Redirigiendo al sistema del MEP",
        text: "Cuando se conecte el back-end, aquí se abrirá la autenticación del MEP.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
    }).then(function () {
        window.location.href = "dashboard-admin.html";
    });
}


// 4. Validación mientras se escribe (solo después del primer intento)
function revalidar() {
    if (seIntentoEnviar === true) {
        validarFormulario();
    }
}


// 5. Eventos
formAccesoMep.addEventListener("submit", continuarAlMep);
inputCorreoInstitucional.addEventListener("input", revalidar);
