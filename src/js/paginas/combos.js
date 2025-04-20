document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieName = localStorage.getItem('movieTitle');
    const seats = localStorage.getItem('selectedSeats');
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0; // Convertir a número o inicializar en 0
    const showtime = localStorage.getItem('selectedShowtime'); // Recuperar el horario seleccionado
    const comboList = document.getElementById('combo-list');
    const continueButton = document.getElementById('continue-button');

    // Mostrar los datos recuperados (opcional, si necesitas mostrarlos en el HTML)
    console.log('Película:', movieName);
    console.log('Butacas:', seats);
    console.log('Precio acumulado:', totalPrice);
    console.log('Horario:', showtime);

    // Función para cargar los combos dinámicamente
    async function loadCombos() {
        if (!comboList) return;

        try {
            const response = await fetch('/api/combos');
            if (!response.ok) throw new Error('Error al cargar los combos');

            let combos = await response.json();

            // Ordenar los combos por id para garantizar el orden correcto
            combos.sort((a, b) => a.id - b.id);

            comboList.innerHTML = ''; // Limpiar la lista de combos
            combos.forEach((combo) => {
                const comboCard = document.createElement('div');
                comboCard.classList.add('combo-card');

                comboCard.innerHTML = `
                    <img src="${combo.image}" alt="${combo.name}">
                    <h3>${combo.name}</h3>
                    <p>${combo.description}</p>
                    <p class="price">S/.${parseFloat(combo.price).toFixed(2)}</p>
                    <button class="select-combo" data-combo='${JSON.stringify(combo)}'>Seleccionar</button>
                `;

                comboList.appendChild(comboCard);
            });

            // Agregar eventos a los botones de selección
            document.querySelectorAll('.select-combo').forEach((button) => {
                button.addEventListener('click', (e) => {
                    const selectedCombo = JSON.parse(e.target.dataset.combo);
                    const updatedTotalPrice = totalPrice + parseFloat(selectedCombo.price);

                    // Guardar el combo seleccionado y el precio actualizado en localStorage
                    localStorage.setItem('selectedCombo', JSON.stringify(selectedCombo));
                    localStorage.setItem('totalPrice', updatedTotalPrice.toFixed(2));

                    // Redirigir a confirmacion.html
                    window.location.href = 'confirmacion.html';
                });
            });
        } catch (error) {
            console.error('Error al cargar los combos:', error);
            comboList.innerHTML = '<p>Error al cargar los combos. Intenta nuevamente más tarde.</p>';
        }
    }

    // Cargar los combos al cargar la página
    loadCombos();

    // Manejar el botón para continuar sin seleccionar un combo
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            // Redirigir a confirmacion.html sin guardar un combo
            window.location.href = 'confirmacion.html';
        });
    }
});