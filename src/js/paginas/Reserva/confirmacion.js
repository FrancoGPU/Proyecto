document.addEventListener('DOMContentLoaded', () => {
    // Utilidad para parsear JSON seguro
    function getParsedItem(key, fallback = null) {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }

    // Lógica para formatear el número de tarjeta (Nueva función)
    const cardNumberInput = document.getElementById('card-number');

    if (cardNumberInput) { // Asegúrate de que el elemento exista antes de añadir el listener
        cardNumberInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, ''); // Eliminar todo lo que no sea dígito
            let formattedValue = '';

            // Insertar un espacio cada 4 dígitos
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }

            event.target.value = formattedValue;

            // Limitar la longitud máxima a la del placeholder (19 caracteres incluyendo espacios)
            // Asegúrate de que la validación final del formulario también elimine los espacios
            if (formattedValue.length > 19) {
                event.target.value = formattedValue.substring(0, 19);
            }
        });
    }

    // 1. Mostrar película y horario
    const movieTitle = localStorage.getItem('movieTitle') || 'Película no especificada';
    const showtime = localStorage.getItem('selectedShowtime') || 'Horario no especificado';
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) {
        movieNameElement.textContent = `${movieTitle} - ${showtime}`;
    }

    // 2. Mostrar asientos seleccionados (siempre como lista legible)
    const seatsRaw = localStorage.getItem('selectedSeats');
    let seatsDisplay = 'No seleccionadas';
    if (seatsRaw) {
        // Permitir tanto array como string
        try {
            const seatsArr = JSON.parse(seatsRaw);
            if (Array.isArray(seatsArr) && seatsArr.length > 0) {
                seatsDisplay = seatsArr.join(', ');
            } else if (typeof seatsArr === 'string' && seatsArr.trim() !== '') {
                seatsDisplay = seatsArr;
            }
        } catch {
            if (seatsRaw.trim() !== '') {
                seatsDisplay = seatsRaw;
            }
        }
    }
    const seatsElement = document.getElementById('seats');
    if (seatsElement) {
        seatsElement.textContent = seatsDisplay;
    }

    // 3. Mostrar combos seleccionados desde el carrito (dulcería)
    // Solo mostrar combos que estén en el carrito y tengan id_combo
    const cartItems = getParsedItem('cart', []);
    const cartCombos = Array.isArray(cartItems)
        ? cartItems.filter(item => item.id_combo)
        : [];
    const comboDetailsElement = document.getElementById('combo-details');
    if (comboDetailsElement) {
        if (cartCombos.length > 0) {
            comboDetailsElement.innerHTML = cartCombos.map(c => {
                const name = c.nombre || c.name || 'Combo';
                const image = c.imagen || c.image || '';
                const description = c.descripcion || c.description || '';
                const price = c.precio || c.price || 0;
                return `<h4>${name}</h4>
                    <img src="${image}" alt="${name}">
                    <p>${description}</p>
                    <p class="price">S/.${parseFloat(price).toFixed(2)}</p>`;
            }).join('<hr>');
        } else {
            comboDetailsElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
        }
    }

    // 4. Mostrar productos del carrito (soporta propiedades en español/inglés)
    const cartDetailsElement = document.getElementById('cart-details');
    let cartTotal = 0;
    if (cartDetailsElement) {
        if (Array.isArray(cartItems) && cartItems.length > 0) {
            let cartHTML = '<ul>';
            cartItems.forEach(item => {
                const nombre = item.nombre || item.name || 'Producto';
                const precio = item.precio || item.price || 0;
                cartHTML += `<li>${nombre} - S/.${parseFloat(precio).toFixed(2)}</li>`;
                cartTotal += parseFloat(precio);
            });
            cartHTML += '</ul>';
            cartDetailsElement.innerHTML = cartHTML;
        } else {
            cartDetailsElement.innerHTML = '<p>No hay productos en el carrito.</p>';
        }
    }

    // 5. Calcular y mostrar el total combinado
    const entradasTotal = parseFloat(localStorage.getItem('totalPrice')) || 0;
    const combinedTotal = entradasTotal + cartTotal;
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `S/.${combinedTotal.toFixed(2)}`;
    }

    // 6. Manejar el formulario de pago
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const cardName = document.getElementById('card-name').value.trim();
            // IMPORTANTE: Eliminar los espacios del número de tarjeta antes de la validación y envío
            const cardNumber = document.getElementById('card-number').value.trim().replace(/\s/g, '');
            const expiryDate = document.getElementById('expiry-date').value.trim();
            const cvv = document.getElementById('cvv').value.trim();

            if (!cardName || !cardNumber || !expiryDate || !cvv) {
                alert('Por favor completa todos los campos de pago.');
                return;
            }

            // Validación básica de número de tarjeta y CVV
            // Ahora la validación se hace sobre el cardNumber sin espacios
            if (!/^\d{13,19}$/.test(cardNumber)) {
                alert('Número de tarjeta inválido. Debe contener entre 13 y 19 dígitos.');
                return;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                alert('CVV inválido.');
                return;
            }

            alert('Pago realizado con éxito. Redirigiendo a la boleta...');
            // Eliminar del storage SOLO en boleta.html, NO aquí
            window.location.href = 'boleta.html';
        });
    }
});