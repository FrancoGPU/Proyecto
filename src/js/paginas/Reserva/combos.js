document.addEventListener('DOMContentLoaded', () => {
    const combosListContainer = document.getElementById('combos-list-container');

    if (!combosListContainer) {
        console.error('El contenedor para la lista de combos no fue encontrado.');
        return;
    }

    fetch('/api/combos')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar los combos: ${response.statusText}`);
            }
            return response.json();
        })
        .then(combos => {
            if (combos.length === 0) {
                combosListContainer.innerHTML = '<p>No hay combos disponibles en este momento.</p>';
                return;
            }
            displayCombos(combos);
        })
        .catch(error => {
            console.error('Error en fetch /api/combos:', error);
            combosListContainer.innerHTML = '<p>Hubo un error al cargar los combos. Intente más tarde.</p>';
        });

    function displayCombos(combos) {
        combosListContainer.innerHTML = ''; // Clear previous content
        combos.forEach(combo => {
            const comboCard = document.createElement('div');
            comboCard.classList.add('movie-card'); // Re-use movie-card styling or create combo-card styles

            comboCard.innerHTML = `
                <div class="movie-image-container">
                    <img src="${combo.image}" alt="${combo.name}" class="movie-image">
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${combo.name}</h3>
                    <p class="movie-description">${combo.description}</p>
                    <p class="price">S/.${parseFloat(combo.price).toFixed(2)}</p>
                    <button class="btn-add-to-cart btn-primary" data-id="${combo.id}" data-name="${combo.name}" data-price="${combo.price}" data-image="${combo.image}">Añadir al Carrito</button>
                </div>
            `;
            combosListContainer.appendChild(comboCard);
        });

        // Add event listeners to new buttons
                combosListContainer.querySelectorAll('.btn-add-to-cart').forEach(button => {            button.addEventListener('click', (event) => {
                const product = {
                    id: event.target.dataset.id,
                    name: event.target.dataset.name,
                    price: parseFloat(event.target.dataset.price),
                    image: event.target.dataset.image,
                    type: 'combo' // Explicitly set type
                };
                // Ensure cart.js's addToCart is accessible, or import it if using modules
                if (typeof addToCart === "function") {
                    addToCart(product);
                } else {
                    console.error('addToCart function is not defined. Make sure cart.js is loaded.');
                }
            });
        });
    }

    // Add navigation button listener
    const goToConfirmationButton = document.getElementById('go-to-confirmation-btn');
    if (goToConfirmationButton) {
        goToConfirmationButton.addEventListener('click', () => {
            window.location.href = '/paginas/Reserva/confirmacion.html';
        });
    }
});