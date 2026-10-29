// Datos de ejemplo compartidos por las pantallas
// Mientras no exista el back-end, todas las pantallas usan estos mismos datos para que
// los nombres, fechas, estados e identificadores coincidan entre una pantalla y otra.
// Más adelante, estas listas se reemplazarán por consultas al servidor con fetch.
// Se carga ANTES del archivo propio de cada pantalla.


// 1. Centros educativos (colección CentroEducativo)
const centrosEjemplo = [
    { id: 1, nombre: "Liceo de Costa Rica", provincia: "San José", canton: "Central", oferta: "III Ciclo y Diversificada" },
    { id: 2, nombre: "Escuela Ermida Blanco González", provincia: "Cartago", canton: "Central", oferta: "I y II Ciclo" },
    { id: 3, nombre: "Liceo Experimental Bilingüe de Palmares", provincia: "Alajuela", canton: "Palmares", oferta: "III Ciclo y Diversificada" },
    { id: 4, nombre: "Escuela República de Chile", provincia: "San José", canton: "Central", oferta: "Preescolar, I y II Ciclo" },
    { id: 5, nombre: "Escuela Buenaventura Corrales", provincia: "San José", canton: "Central", oferta: "I y II Ciclo" },
    { id: 6, nombre: "CINDEA Santa Ana", provincia: "San José", canton: "Santa Ana", oferta: "Educación de adultos" },
    { id: 7, nombre: "Escuela La Paz", provincia: "Alajuela", canton: "San Carlos", oferta: "I y II Ciclo" },
    { id: 8, nombre: "Liceo de Heredia", provincia: "Heredia", canton: "Central", oferta: "III Ciclo y Diversificada" },
    { id: 9, nombre: "CINDEA Santo Domingo", provincia: "Heredia", canton: "Santo Domingo", oferta: "Educación de adultos" }
];


// 2. Formularios censales (colección Formulario)
const formulariosEjemplo = [
    { id: 1, nombre: "Matrícula Primaria" },
    { id: 2, nombre: "Matrícula Secundaria" },
    { id: 3, nombre: "Infraestructura Física" },
    { id: 4, nombre: "Recursos Tecnológicos" },
    { id: 5, nombre: "Comedores Escolares" },
    { id: 6, nombre: "Personal Docente" },
    { id: 7, nombre: "Matrícula Educación de Adultos" }
];

// Plantillas base disponibles en el constructor de formularios
const CANTIDAD_PLANTILLAS = 2;


// 3. Censos (colección Censo)
// formularios y centros guardan los id de las listas anteriores.
// respuestas = cantidad de centros que ya remitieron su formulario.
const censosEjemplo = [
    {
        id: 1, nombre: "Censo de Matrícula Inicial 2027", estado: "abierto", apertura: "2026-10-15", cierre: "2026-11-30",
        formularios: [1, 2, 7], centros: [1, 2, 4, 5, 7, 9], respuestas: 4
    },
    {
        id: 2, nombre: "Infraestructura Física Escolar II Semestre", estado: "abierto", apertura: "2026-10-01", cierre: "2026-11-15",
        formularios: [3], centros: [3, 4, 6], respuestas: 1
    },
    {
        id: 3, nombre: "Disponibilidad de Recursos Tecnológicos", estado: "abierto", apertura: "2026-10-20", cierre: "2026-11-03",
        formularios: [4], centros: [2, 4, 8], respuestas: 2
    },
    {
        id: 4, nombre: "Censo de Alimentación y Comedores 2026", estado: "cerrado", apertura: "2026-08-01", cierre: "2026-09-15",
        formularios: [5], centros: [2, 5, 6], respuestas: 3
    },
    {
        id: 5, nombre: "Censo de Personal Docente 2026", estado: "pausado", apertura: "2026-10-05", cierre: "2026-11-20",
        formularios: [6], centros: [1, 3, 7], respuestas: 1
    },
    {
        id: 6, nombre: "Censo de Matrícula Final 2027", estado: "borrador", apertura: "2026-12-01", cierre: "2026-12-20",
        formularios: [1, 2], centros: [], respuestas: 0
    }
];


// 4. Utilidades
// Busca un elemento por su id en cualquiera de las listas. Devuelve null si no existe.
function buscarPorId(lista, id) {
    for (const elemento of lista) {
        if (elemento.id === id) {
            return elemento;
        }
    }
    return null;
}
