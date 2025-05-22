document.addEventListener('DOMContentLoaded', () => {
    const cartItemsListElement = document.getElementById('cart-items-list');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const grandTotalElement = document.getElementById('grand-total');

    // Movie booking details (assuming these are passed via localStorage or URL params from seat selection)
    const confirmMovieTitle = document.getElementById('confirm-movie-title');
    const confirmMovieTime = document.getElementById('confirm-movie-time');
    const confirmSelectedSeats = document.getElementById('confirm-selected-seats');
    const confirmMovieTotal = document.getElementById('confirm-movie-total');
    
    const bookingData = JSON.parse(localStorage.getItem('bookingDetails')); // Example: { movieTitle, showtime, selectedSeats, moviePrice }
    let movieTotal = 0;

    if (bookingData) {
        if (confirmMovieTitle) confirmMovieTitle.textContent = bookingData.movieTitle || 'N/A';
        if (confirmMovieTime) confirmMovieTime.textContent = bookingData.showtime || 'N/A';
        if (confirmSelectedSeats) confirmSelectedSeats.textContent = bookingData.selectedSeats ? bookingData.selectedSeats.join(', ') : 'N/A';
        if (confirmMovieTotal) {
            movieTotal = parseFloat(bookingData.moviePrice) || 0;
            confirmMovieTotal.textContent = movieTotal.toFixed(2);
        }
    } else {
        // Hide or adjust movie details section if no booking data
        const bookingDetailsSummary = document.getElementById('booking-details-summary');
        if (bookingDetailsSummary) bookingDetailsSummary.style.display = 'none';
    }

    function displayCartItems() {
        if (!cartItemsListElement || !cartSubtotalElement || !grandTotalElement) {
            console.error('Elementos del DOM para el resumen del carrito no encontrados.');
            return;
        }

        const cartItems = getCart(); // From cart.js
        cartItemsListElement.innerHTML = ''; // Clear previous items

        if (cartItems.length === 0) {
            cartItemsListElement.innerHTML = '<p>No hay productos adicionales en tu carrito.</p>';
        } else {
            const ul = document.createElement('ul');
            ul.classList.add('cart-summary-list');
            cartItems.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image-small">
                    <span class="cart-item-name">${item.name} (x${item.quantity})</span>
                    <span class="cart-item-price">S/.${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn-remove-from-cart-confirm" data-id="${item.id}" data-type="${item.type || 'combo'}">Eliminar</button>
                `;
                ul.appendChild(li);
            });
            cartItemsListElement.appendChild(ul);

            // Add event listeners for remove buttons
            cartItemsListElement.querySelectorAll('.btn-remove-from-cart-confirm').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.target.dataset.id;
                    const productType = event.target.dataset.type;
                    removeFromCart(productId, productType); // from cart.js
                    displayCartItems(); // Refresh the list and totals
                });
            });
        }

        const productsSubtotal = getCartTotal(); // from cart.js
        cartSubtotalElement.textContent = productsSubtotal.toFixed(2);
        grandTotalElement.textContent = (movieTotal + productsSubtotal).toFixed(2);
    }

    displayCartItems();

    const proceedButton = document.getElementById('proceed-to-payment-button');
    if (proceedButton) {
        proceedButton.addEventListener('click', () => {
            // Logic to proceed to payment
            // For now, let's assume it saves the final cart and booking details for the boleta
            const finalOrder = {
                booking: bookingData,
                products: getCart(), // from cart.js
                totalAmount: movieTotal + getCartTotal() // from cart.js
            };
            localStorage.setItem('finalOrderDetails', JSON.stringify(finalOrder));
            
            // Clear the cart after saving the final order
            if (typeof clearCart === 'function') {
                clearCart(); // from cart.js
            } else {
                console.error('clearCart function not defined.');
            }
            
            window.location.href = '/paginas/Reserva/boleta.html';
        });
    }

    const cancelButton = document.getElementById('cancel-booking-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            // Logic to cancel: clear relevant localStorage and redirect
            localStorage.removeItem('bookingDetails');
            // clearCart(); // Decide if cancelling booking also clears product cart
            alert('Reserva cancelada.');
            window.location.href = '/paginas/prueba.html';
        });
    }
});