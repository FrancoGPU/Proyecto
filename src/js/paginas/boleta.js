document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieName = localStorage.getItem('movieTitle');
    const seats = localStorage.getItem('selectedSeats');
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')); // Convertir a número
    const purchaseDate = new Date().toLocaleString(); // Fecha y hora actual
    const selectedCombo = JSON.parse(localStorage.getItem('selectedCombo')); // Recuperar el combo seleccionado

    // Mostrar los datos en la boleta
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) {
        movieNameElement.textContent = movieName || 'Película no especificada';
    }

    const seatsElement = document.getElementById('seats');
    if (seatsElement) {
        seatsElement.textContent = seats || 'No seleccionadas';
    }

    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = !isNaN(totalPrice) ? `S/.${totalPrice.toFixed(2)}` : 'S/.0.00';
    }

    const purchaseDateElement = document.getElementById('purchase-date');
    if (purchaseDateElement) {
        purchaseDateElement.textContent = purchaseDate;
    }

    // Mostrar los detalles del combo seleccionado
    const comboSummaryElement = document.getElementById('combo-summary');
    if (comboSummaryElement && selectedCombo) {
        comboSummaryElement.innerHTML = `
            <h4>${selectedCombo.name}</h4>
            <img src="${selectedCombo.image}" alt="${selectedCombo.name}" style="width: 100px; height: auto;">
            <p>${selectedCombo.description}</p>
            <p class="price">S/.${parseFloat(selectedCombo.price).toFixed(2)}</p>
        `;
    } else if (comboSummaryElement) {
        comboSummaryElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
    }

    // Manejar el botón para regresar al inicio
    const backToHomeButton = document.getElementById('back-to-home');
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = 'prueba.html'; // Redirigir al inicio
        });
    }
});