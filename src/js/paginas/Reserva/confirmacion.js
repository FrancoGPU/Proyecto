document.addEventListener('DOMContentLoaded', async () => {
    // Verificar estado VIP del usuario
    let userVipStatus = { isVip: false, discountPercentage: 0 };
    try {
        const sessionResponse = await fetch('/api/session/status');
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            if (sessionData.loggedIn && sessionData.user) {
                const vipResponse = await fetch('/api/user/vip-status');
                if (vipResponse.ok) {
                    userVipStatus = await vipResponse.json();
                    console.log('Estado VIP en confirmación:', userVipStatus);
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar estado VIP:', error);
    }

    // Función para calcular precio con descuento VIP
    function getVipPrice(originalPrice, vipStatus) {
        const price = parseFloat(originalPrice) || 0;
        if (!vipStatus.isVip || price === 0 || !vipStatus.discountPercentage) {
            return price;
        }
        const discount = (price * parseFloat(vipStatus.discountPercentage)) / 100;
        const finalPrice = price - discount;
        return isNaN(finalPrice) ? price : finalPrice;
    }

    // Función para crear elemento de precio con descuento VIP
    function createPriceDisplay(originalPrice, vipStatus) {
        const price = parseFloat(originalPrice) || 0;
        if (!vipStatus.isVip) {
            return `S/.${price.toFixed(2)}`;
        }
        
        const vipPrice = getVipPrice(price, vipStatus);
        return `
            <span class="vip-price-container">
                <span class="original-price">S/.${price.toFixed(2)}</span>
                <span class="vip-price">S/.${vipPrice.toFixed(2)} ⭐VIP</span>
            </span>
        `;
    }
    
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

    // Lógica para formatear el número de tarjeta
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            let formattedValue = '';

            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }

            event.target.value = formattedValue;

            if (formattedValue.length > 19) {
                event.target.value = formattedValue.substring(0, 19);
            }
        });
    }

    // 1. Mostrar película, horario y precio de entradas con descuento VIP
    const movieTitle = localStorage.getItem('movieTitle') || 'Película no especificada';
    const showtime = localStorage.getItem('selectedShowtime') || 'Horario no especificado';
    const entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    const finalEntradasPrice = getVipPrice(entradasPrice, userVipStatus);
    const entradasPriceDisplay = createPriceDisplay(entradasPrice, userVipStatus);
    
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) {
        movieNameElement.innerHTML = `${movieTitle} - ${showtime}<br><strong>Precio entradas:</strong> ${entradasPriceDisplay}`;
    }

    // 2. Mostrar asientos seleccionados
    const seatsRaw = localStorage.getItem('selectedSeats');
    let seatsDisplay = 'No seleccionadas';
    if (seatsRaw) {
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

    // 3. Mostrar combos seleccionados desde el carrito con descuentos VIP
    const cartItems = getParsedItem('cart', []);
    const cartCombos = Array.isArray(cartItems) ? cartItems.filter(item => item.id_combo) : [];
    const comboDetailsElement = document.getElementById('combo-details');
    if (comboDetailsElement) {
        if (cartCombos.length > 0) {
            comboDetailsElement.innerHTML = cartCombos.map(c => {
                const name = c.nombre || c.name || 'Combo';
                const image = c.imagen || c.image || '';
                const description = c.descripcion || c.description || '';
                const price = c.precio || c.price || 0;
                const priceDisplay = createPriceDisplay(price, userVipStatus);
                return `<h4>${name}</h4>
                    <img src="${image}" alt="${name}">
                    <p>${description}</p>
                    <p class="price">${priceDisplay}</p>`;
            }).join('<hr>');
        } else {
            comboDetailsElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
        }
    }

    // 4. Mostrar productos del carrito con descuentos VIP
    const cartDetailsElement = document.getElementById('cart-details');
    let cartTotal = 0;
    let originalCartTotal = 0;
    if (cartDetailsElement) {
        if (Array.isArray(cartItems) && cartItems.length > 0) {
            let cartHTML = '<ul>';
            cartItems.forEach(item => {
                const nombre = item.nombre || item.name || 'Producto';
                const precio = parseFloat(item.precio || item.price || 0);
                const finalPrice = getVipPrice(precio, userVipStatus);
                const priceDisplay = createPriceDisplay(precio, userVipStatus);
                cartHTML += `<li>${nombre} - ${priceDisplay}</li>`;
                cartTotal += finalPrice;
                originalCartTotal += precio;
            });
            cartHTML += '</ul>';
            cartDetailsElement.innerHTML = cartHTML;
        } else {
            cartDetailsElement.innerHTML = '<p>No hay productos en el carrito.</p>';
        }
    }

    // 5. Calcular y mostrar el total combinado con descuentos VIP
    const combinedTotal = (isNaN(finalEntradasPrice) ? 0 : finalEntradasPrice) + (isNaN(cartTotal) ? 0 : cartTotal);
    
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        if (userVipStatus.isVip) {
            const originalCombinedTotal = (isNaN(entradasPrice) ? 0 : entradasPrice) + (isNaN(originalCartTotal) ? 0 : originalCartTotal);
            totalPriceElement.innerHTML = `
                <span class="vip-price-container">
                    <span class="original-price">S/.${originalCombinedTotal.toFixed(2)}</span>
                    <span class="vip-price">S/.${combinedTotal.toFixed(2)} ⭐VIP (-${userVipStatus.discountPercentage}%)</span>
                </span>
            `;
        } else {
            totalPriceElement.textContent = `S/.${combinedTotal.toFixed(2)}`;
        }
    }

    // Guardar el total final con descuentos para la boleta
    localStorage.setItem('finalTotalPrice', combinedTotal.toString());

    // 6. Manejar el formulario de pago
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const cardName = document.getElementById('card-name').value.trim();
            const cardNumber = document.getElementById('card-number').value.trim().replace(/\s/g, '');
            const expiryDate = document.getElementById('expiry-date').value.trim();
            const cvv = document.getElementById('cvv').value.trim();

            if (!cardName || !cardNumber || !expiryDate || !cvv) {
                alert('Por favor completa todos los campos de pago.');
                return;
            }

            if (!/^\d{13,19}$/.test(cardNumber)) {
                alert('Número de tarjeta inválido. Debe contener entre 13 y 19 dígitos.');
                return;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                alert('CVV inválido.');
                return;
            }

            // Procesar el pago y registrar la compra
            procesarPago(cardName, cardNumber, expiryDate, cvv);
        });
    }

    // Función para procesar el pago y registrar la compra
    async function procesarPago(cardName, cardNumber, expiryDate, cvv) {
        try {
            // Generar ID único para la compra
            const purchaseId = `GOCINE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Obtener datos para la compra
            const selectedSeats = localStorage.getItem('selectedSeats') || 'No especificados';
            const ticketPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
            const totalOriginal = (isNaN(entradasPrice) ? 0 : entradasPrice) + (isNaN(originalCartTotal) ? 0 : originalCartTotal);
            const totalFinal = combinedTotal;
            const discountApplied = userVipStatus.isVip ? userVipStatus.discountPercentage : 0;
            const cardLastFour = cardNumber.slice(-4);

            // Datos de la compra
            const purchaseData = {
                movieTitle,
                showtime,
                selectedSeats,
                ticketPrice,
                cartItems,
                totalOriginal,
                totalFinal,
                discountApplied,
                isVipPurchase: userVipStatus.isVip,
                paymentMethod: 'credit_card',
                cardLastFour,
                purchaseId
            };

            console.log('Registrando compra:', purchaseData);

            // Registrar la compra en la base de datos
            const response = await fetch('/api/purchases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(purchaseData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Compra registrada exitosamente:', result.data);
                
                // Guardar el ID de compra para la boleta
                localStorage.setItem('purchaseId', purchaseId);
                localStorage.setItem('purchaseDate', new Date().toISOString());
                
                alert('Pago realizado con éxito. Redirigiendo a la boleta...');
                window.location.href = 'boleta.html';
            } else {
                console.error('Error al registrar la compra:', result.message);
                // Aunque falle el registro, permitir continuar con la boleta
                alert('Pago procesado. Generando boleta...');
                localStorage.setItem('purchaseId', purchaseId);
                localStorage.setItem('purchaseDate', new Date().toISOString());
                window.location.href = 'boleta.html';
            }

        } catch (error) {
            console.error('Error al procesar el pago:', error);
            // En caso de error, permitir continuar con la boleta
            alert('Pago procesado. Generando boleta...');
            const fallbackPurchaseId = `GOCINE-${Date.now()}`;
            localStorage.setItem('purchaseId', fallbackPurchaseId);
            localStorage.setItem('purchaseDate', new Date().toISOString());
            window.location.href = 'boleta.html';
        }
    }
});
