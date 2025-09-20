/*Simulador Interactivo de Conversión de Dinero*/

//SELECCIÓN DE ELEMENTOS DEL DOM
const conversionForm = document.getElementById('conversionForm');
const montoARSInput = document.getElementById('montoARS');
const monedaDestinoSelect = document.getElementById('monedaDestino');
const resultadoDiv = document.getElementById('resultado');
const historialLista = document.getElementById('historialLista');
const limpiarHistorialBtn = document.getElementById('limpiarHistorialBtn');

let tasasDeCambio = []; //Almacenamos las tasas obtenidas del JSON
let historialConversiones = JSON.parse(localStorage.getItem('historialDeConversiones')) || [];

//FUNCIONES
/**
 * aca cargamos las tasas de cambio desde un archivo JSON local de forma asíncrona
 */
const cargarTasasDeCambio = async () => {
    try {
        const response = await fetch('./db.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        tasasDeCambio = data.monedas;
        popularSelectorDeMonedas();
    } catch (error) {
        console.error("Error al cargar las tasas de cambio:", error);
        mostrarError('No se pudieron cargar las cotizaciones. Intente más tarde.');
    }
};

/**
 * Rellenamos el <select> del HTML con las monedas cargadas desde el JSON
 */
const popularSelectorDeMonedas = () => {
    monedaDestinoSelect.innerHTML = ''; //Limpiamos opciones anteriores
    tasasDeCambio.forEach(moneda => {
        const option = document.createElement('option');
        option.value = moneda.id;
        option.textContent = moneda.nombre;
        monedaDestinoSelect.appendChild(option);
    });
};

/**
 * aca mostramos el resultado de la conversión en el DOM
 * @param {object} conversion - objeto de la conversión
 */
const mostrarResultadoEnHTML = (conversion) => {
    const { montoARS, montoConvertido, monedaNombre, tasa, monedaCodigo } = conversion; 
    resultadoDiv.innerHTML = `
        <p><strong>$${montoARS.toLocaleString('es-AR')} ARS</strong> equivalen a:</p>
        <h2>${montoConvertido.toLocaleString('es-AR', { 
            style: 'currency', 
            currency: monedaCodigo, 
            minimumFractionDigits: 2 
        })}</h2>
        <small>Tasa de cambio utilizada: ${tasa.toLocaleString('es-AR')} ARS/${monedaCodigo}</small> 
    `;
};

/**
 * Muestramos un mensaje de error utilizando la librería SweetAlert2
 * @param {string} mensaje - Mensaje de error
 */
const mostrarError = (mensaje) => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: mensaje,
        confirmButtonColor: '#007bff'
    });
};

/**
 * aca Renderizamos el historial completo de conversiones en la lista del HTML
 */
const renderizarHistorial = () => {
    if (historialConversiones.length === 0) {
        historialLista.innerHTML = '<li>Aún no se han realizado conversiones.</li>';
        return;
    }

    const historialInvertido = [...historialConversiones].reverse();
    const listaHTML = historialInvertido.map(conv => `
        <li>
            <strong>Fecha:</strong> ${conv.fecha}<br>
            <strong>Convertido:</strong> $${conv.montoARS.toLocaleString('es-AR')} ARS a 
            $${conv.montoConvertido.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${conv.monedaNombre}
        </li>
    `).join('');

    historialLista.innerHTML = listaHTML;
};

/**
 * Guardamos el array del historial en localStorage
 */
const guardarHistorialEnStorage = () => {
    localStorage.setItem('historialDeConversiones', JSON.stringify(historialConversiones));
};

// ESTOS SON LOS MANEJADORES DE EVENTOS

conversionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const montoIngresado = parseFloat(montoARSInput.value);
    const monedaSeleccionadaId = monedaDestinoSelect.value;

    if (isNaN(montoIngresado) || montoIngresado <= 0) {
        mostrarError("Por favor, ingrese un número válido y mayor a cero.");
        return;
    }

    const moneda = tasasDeCambio.find(m => m.id === monedaSeleccionadaId);
    if (!moneda) {
        mostrarError("Moneda no válida. Por favor, recargue la página.");
        return;
    }

    const montoConvertido = montoIngresado / moneda.tasaVenta;
    
    const conversionActual = {
        fecha: new Date().toLocaleString('es-AR'),
        montoARS: montoIngresado,
        montoConvertido: montoConvertido,
        monedaId: moneda.id,
        monedaNombre: moneda.nombre,
        monedaCodigo: moneda.codigo,
        tasa: moneda.tasaVenta
    };

    mostrarResultadoEnHTML(conversionActual);
    historialConversiones.push(conversionActual);
    guardarHistorialEnStorage();
    renderizarHistorial();

    conversionForm.reset();
});

limpiarHistorialBtn.addEventListener('click', () => {
    // Usamos SweetAlert2 para confirmar la acción
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ¡bórralo!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            historialConversiones = [];
            guardarHistorialEnStorage();
            renderizarHistorial();
            Swal.fire(
                '¡Borrado!',
                'El historial de conversiones ha sido eliminado.',
                'success'
            );
        }
    });
});

// INICIALIZACIÓN
// Al cargar la página cargamos las tasas y renderizamos el historial guardado
document.addEventListener('DOMContentLoaded', () => {
    cargarTasasDeCambio();
    renderizarHistorial();
});