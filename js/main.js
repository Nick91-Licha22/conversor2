/* Simulador de Conversión de Dinero */

// TASA DE CAMBIO FIJA (constante).
const TASA_DE_CAMBIO_DOLAR = 1350.50;

// SELECCIÓN DE ELEMENTOS DEL DOM
const conversionForm = document.getElementById('conversionForm');
const montoARSInput = document.getElementById('montoARS');
const resultadoDiv = document.getElementById('resultado');
const historialLista = document.getElementById('historialLista');
const limpiarHistorialBtn = document.getElementById('limpiarHistorialBtn');

// CARGA INICIAL DEL HISTORIAL
let historialConversiones = JSON.parse(localStorage.getItem('historialDeConversiones')) || [];

/**
* con esto realizamos el cálculo de conversión
* @param {number} montoARS - dinero en pesos argentinos
* @returns {number} - dinero equivalente en dólares
*/
function convertirADolares(montoARS) {
    return montoARS / TASA_DE_CAMBIO_DOLAR;
}

/**
* Mostramos el resultado de la conversión en el DOM
* @param {number} montoARS - dinero original en pesos.
* @param {number} montoUSD - dinero convertido a dólares.
*/
function mostrarResultadoEnHTML(montoARS, montoUSD) {
    resultadoDiv.classList.remove('error');
    resultadoDiv.innerHTML = `
        <p><strong>$${montoARS.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ARS</strong> equivalen a:</p>
        <h2>$${montoUSD.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</h2>
        <small>Tasa de cambio: ${TASA_DE_CAMBIO_DOLAR.toLocaleString('es-AR')} ARS/USD</small>
    `;
}

/**
* aca mostramos un msj de error en el DOM
* @param {string} mensaje - msj de error a mostrar
*/
function mostrarError(mensaje) {
    resultadoDiv.classList.add('error');
    resultadoDiv.innerHTML = `<p><strong>Error:</strong> ${mensaje}</p>`;
}

/**
* FUNCION
* Renderizamos el historial completo de conversiones en la lista del HTML de forma optimizada
*/
function renderizarHistorial() {
    if (historialConversiones.length === 0) {
        historialLista.innerHTML = '<li>Aún no se han realizado conversiones.</li>';
        return;
    }

    //Hacemos una copia e invertimos el array para mostrar lo más nuevo primero
    const historialInvertido = [...historialConversiones].reverse();

    //Uso map() para transformar cada objeto de conversión en un string de HTML (un <li>)
    const listaHTML = historialInvertido.map(conversion => {
        return `
            <li>
                <strong>Fecha:</strong> ${conversion.fecha}<br>
                <strong>Convertido:</strong> $${conversion.montoARS.toLocaleString('es-AR')} ARS a $${conversion.montoUSD.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD
            </li>
        `;
    }).join(''); //aca Unimos todos los strings <li> en uno solo

    //Actualizamos el DOM una sola vez, lo que es más eficiente
    historialLista.innerHTML = listaHTML;
}

/**
* Guardamos el array del historial en localStorage
*/
function guardarHistorialEnStorage() {
    localStorage.setItem('historialDeConversiones', JSON.stringify(historialConversiones));
}

// Evento para el envío del formulario
conversionForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenimos la recarga de la página

    const montoIngresado = parseFloat(montoARSInput.value);

    if (isNaN(montoIngresado) || montoIngresado <= 0) {
        mostrarError("Por favor, ingrese un número válido y mayor a cero.");
        return;
    }

    const montoConvertido = convertirADolares(montoIngresado);
    mostrarResultadoEnHTML(montoIngresado, montoConvertido);

    const conversionActual = {
        fecha: new Date().toLocaleString('es-AR'),
        montoARS: montoIngresado,
        montoUSD: montoConvertido,
        tasaDeCambio: TASA_DE_CAMBIO_DOLAR
    };

    historialConversiones.push(conversionActual);
    guardarHistorialEnStorage();
    renderizarHistorial();

    conversionForm.reset();
});

// Evento para el botón de limpiar historial
limpiarHistorialBtn.addEventListener('click', function() {
    historialConversiones = [];
    guardarHistorialEnStorage();
    renderizarHistorial();
});

// INICIALIZACIÓN
// Al cargar la página, renderizamos el historial guardado
renderizarHistorial();