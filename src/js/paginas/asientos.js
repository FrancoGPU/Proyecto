document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieTitle = localStorage.getItem('movieTitle');
    const selectedShowtime = localStorage.getItem('selectedShowtime');

    // Mostrar título de la película y horario seleccionado
    const movieTitleElement = document.getElementById('movie-title');
    if (movieTitleElement) {
        movieTitleElement.textContent = `${movieTitle || 'Película no especificada'} - ${selectedShowtime || 'Horario no especificado'}`;
    }

    // Precio por butaca
    const seatPrice = 15.00;
    let selectedSeats = [];

    // Generar mapa de butacas
    const seatsContainer = document.getElementById('seats-map');
    if (seatsContainer) {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        // Crear leyenda
        const legend = document.createElement('div');
        legend.className = 'seat-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background-color: var(--gray-light)"></div>
                <span>Disponible</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: var(--accent)"></div>
                <span>Seleccionada</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: var(--primary)"></div>
                <span>Ocupada</span>
            </div>
        `;
        seatsContainer.before(legend);

        // Generar butacas
        rows.forEach(row => {
            const rowLabel = document.createElement('div');
            rowLabel.className = 'seat space';
            rowLabel.textContent = row;
            seatsContainer.appendChild(rowLabel);

            for (let i = 1; i <= 10; i++) {
                const seat = document.createElement('div');
                seat.className = 'seat';
                seat.textContent = i;
                seat.dataset.seatNumber = `${row}${i}`;

                if (Math.random() < 0.2) {
                    seat.classList.add('reserved');
                } else {
                    seat.addEventListener('click', () => toggleSeatSelection(seat));
                }

                seatsContainer.appendChild(seat);
            }
        });
    }

    // Actualizar resumen de asientos seleccionados
    const updateSummary = () => {
        const selectedSeatsDisplay = document.getElementById('selected-seats-display');
        const totalPriceDisplay = document.getElementById('total-price');

        if (selectedSeatsDisplay && totalPriceDisplay) {
            if (selectedSeats.length === 0) {
                selectedSeatsDisplay.textContent = 'Ninguna';
                totalPriceDisplay.textContent = 'S/.0';
            } else {
                selectedSeatsDisplay.textContent = selectedSeats.join(', ');
                totalPriceDisplay.textContent = `S/.${(selectedSeats.length * seatPrice).toFixed(2)}`;
            }
        }
    };

    // Función para seleccionar/deseleccionar butacas
    function toggleSeatSelection(seat) {
        seat.classList.toggle('selected');
        const seatNumber = seat.dataset.seatNumber;

        if (seat.classList.contains('selected')) {
            selectedSeats.push(seatNumber);
        } else {
            selectedSeats = selectedSeats.filter(s => s !== seatNumber);
        }

        updateSummary();
    }

    // Confirmar reserva
    document.getElementById('confirm-booking').addEventListener('click', () => {
        if (selectedSeats.length === 0) {
            alert('Por favor selecciona al menos una butaca');
            return;
        }

        const totalPrice = selectedSeats.length * seatPrice;

        // Guardar los datos en localStorage
        localStorage.setItem('selectedSeats', selectedSeats.join(','));
        localStorage.setItem('totalPrice', totalPrice);

        // Redirigir a confirmacion.html
        window.location.href = '../paginas/confirmacion.html';
    });
});