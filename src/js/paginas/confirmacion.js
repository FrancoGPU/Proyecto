document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieName = localStorage.getItem('movieTitle');
    const seats = localStorage.getItem('selectedSeats');
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')); // Convertir a número
    const showtime = localStorage.getItem('selectedShowtime'); // Recuperar el horario seleccionado
    const selectedCombo = JSON.parse(localStorage.getItem('selectedCombo')); // Recuperar el combo seleccionado

    // Mostrar los datos en el resumen
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) {
        movieNameElement.textContent = `${movieName || 'Película no especificada'} - ${showtime || 'Horario no especificado'}`;
    }

    const seatsElement = document.getElementById('seats');
    if (seatsElement) {
        seatsElement.textContent = seats || 'No seleccionadas';
    }

    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = !isNaN(totalPrice) ? `S/.${totalPrice.toFixed(2)}` : 'S/.0.00';
    }

    // Mostrar los detalles del combo seleccionado
    const comboDetailsElement = document.getElementById('combo-details');
    if (comboDetailsElement && selectedCombo) {
        comboDetailsElement.innerHTML = `
            <h4>${selectedCombo.name}</h4>
            <img src="${selectedCombo.image}" alt="${selectedCombo.name}" style="width: 100px; height: auto;">
            <p>${selectedCombo.description}</p>
            <p class="price">S/.${parseFloat(selectedCombo.price).toFixed(2)}</p>
        `;
    } else if (comboDetailsElement) {
        comboDetailsElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
    }

    // Manejar el formulario de pago
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitar el envío del formulario por defecto

            // Validar los datos del formulario
            const cardName = document.getElementById('card-name').value.trim();
            const cardNumber = document.getElementById('card-number').value.trim();
            const expiryDate = document.getElementById('expiry-date').value.trim();
            const cvv = document.getElementById('cvv').value.trim();

            if (!cardName || !cardNumber || !expiryDate || !cvv) {
                alert('Por favor completa todos los campos de pago.');
                return;
            }

            // Simular el procesamiento del pago
            alert('Pago realizado con éxito. Redirigiendo a la boleta...');

            // Redirigir a la página de boleta
            window.location.href = 'boleta.html';
        });
    }
});