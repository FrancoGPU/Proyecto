document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieName = localStorage.getItem('movieTitle');
    const seats = localStorage.getItem('selectedSeats');
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')); // Convertir a número
    const showtime = localStorage.getItem('selectedShowtime'); // Recuperar el horario seleccionado

    // Mostrar los datos en el resumen
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) {
        movieNameElement.textContent = `${movieName || 'Película no especificada'} - ${showtime || 'Horario no especificado'}`;
    }

    document.getElementById('seats').textContent = seats || 'No seleccionadas';
    document.getElementById('total-price').textContent = !isNaN(totalPrice) ? `S/.${totalPrice.toFixed(2)}` : 'S/.0.00';

    document.getElementById('seats').textContent = seats || 'No seleccionadas';
    document.getElementById('total-price').textContent = !isNaN(totalPrice) ? `S/.${totalPrice.toFixed(2)}` : 'S/.0.00';

    // Manejar el formulario de pago
    const paymentForm = document.getElementById('payment-form');
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
});