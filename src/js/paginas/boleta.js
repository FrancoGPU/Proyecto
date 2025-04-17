document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieName = localStorage.getItem('movieTitle');
    const seats = localStorage.getItem('selectedSeats');
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')); // Convertir a número
    const showtime = localStorage.getItem('selectedShowtime'); // Recuperar el horario seleccionado

    // Obtener la fecha actual
    const purchaseDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Mostrar los datos en la boleta
    document.getElementById('movie-name').textContent = `${movieName || 'No especificada'} - ${showtime || 'Sin horario'}`;
    document.getElementById('seats').textContent = seats || 'No seleccionadas';
    document.getElementById('total-price').textContent = !isNaN(totalPrice) ? `S/.${totalPrice.toFixed(2)}` : 'S/.0.00';
    document.getElementById('purchase-date').textContent = purchaseDate;

    // Manejar el botón para regresar al inicio
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.href = 'prueba.html';
    });
});