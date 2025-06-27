// cart.js

// Funciones para manejar el carrito de compras

// Inicializar el carrito desde localStorage o como un array vacío
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Variables para usuario VIP
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isVipUser = false;
let vipDiscountPercentage = 0;

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para verificar estado VIP del usuario
async function checkVipStatus() {
    try {
        // Primero intentar con el endpoint de sesión
        const response = await fetch('/api/user/vip-status');
        if (response.ok) {
            const vipData = await response.json();
            isVipUser = vipData.isVip;
            vipDiscountPercentage = vipData.discountPercentage || 0;
            
            console.log('Estado VIP verificado:', { isVipUser, vipDiscountPercentage });
            return;
        }
    } catch (error) {
        console.error('Error al verificar estado VIP via sesión:', error);
    }

    // Fallback: obtener usuario del localStorage y usar endpoint específico
    let user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user) {
        // Si no hay usuario en localStorage, intentar obtenerlo de la sesión
        try {
            const sessionResponse = await fetch('/api/session/status');
            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                if (sessionData.loggedIn && sessionData.user) {
                    user = sessionData.user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
            }
        } catch (error) {
            console.error('Error al obtener sesión:', error);
        }
    }

    if (!user || !user.id) {
        isVipUser = false;
        vipDiscountPercentage = 0;
        currentUser = null;
        return;
    }

    currentUser = user;

    try {
        const response = await fetch(`/api/users/${user.id}/vip-status`);
        if (response.ok) {
            const vipData = await response.json();
            isVipUser = vipData.isVip;
            vipDiscountPercentage = vipData.discountPercentage || 0;
            
            console.log('Estado VIP verificado (fallback):', { isVipUser, vipDiscountPercentage });
        } else {
            console.warn('No se pudo verificar el estado VIP');
            isVipUser = false;
            vipDiscountPercentage = 0;
        }
    } catch (error) {
        console.error('Error al verificar estado VIP:', error);
        isVipUser = false;
        vipDiscountPercentage = 0;
    }
}

// Función para calcular el precio con descuento VIP
function calculateVipPrice(originalPrice) {
    if (!isVipUser || vipDiscountPercentage <= 0) {
        return parseFloat(originalPrice);
    }
    const price = parseFloat(originalPrice);
    const discount = (price * vipDiscountPercentage) / 100;
    const finalPrice = price - discount;
    
    console.log(`Precio VIP calculado: ${price} - ${discount} = ${finalPrice}`);
    return finalPrice;
}

// Función para renderizar los items del carrito en el dropdown
function renderCartItems() {
    console.log('renderCartItems called'); // Debug log
    
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartItemCountElement = document.getElementById('cartItemCount');

    console.log('Cart elements found:', {
        cartItemsContainer: !!cartItemsContainer,
        cartTotalElement: !!cartTotalElement,
        cartItemCountElement: !!cartItemCountElement
    }); // Debug log

    // Si alguno de los elementos principales del carrito no está en la página, no hacer nada.
    if (!cartItemsContainer || !cartTotalElement || !cartItemCountElement) {
        console.warn('Elementos del DOM del carrito no encontrados. El renderizado del carrito se omitirá.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar items actuales

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío.</p>'; // Added class for styling
        cartTotalElement.textContent = '0.00';
        cartItemCountElement.textContent = '0';
        return;
    }

    let total = 0;
    let originalTotal = 0;
    let itemCount = 0;

    cart.forEach(item => {
        const originalPrice = parseFloat(item.precio);
        const vipPrice = calculateVipPrice(originalPrice);
        const hasDiscount = isVipUser && vipPrice < originalPrice;

        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        
        // Mostrar precio original tachado si hay descuento VIP
        const priceHTML = hasDiscount ? 
            `<p class="cart-item-price">
                <span class="original-price">S/. ${originalPrice.toFixed(2)}</span>
                <span class="vip-price">S/. ${vipPrice.toFixed(2)}</span>
            </p>` :
            `<p class="cart-item-price">S/. ${vipPrice.toFixed(2)}</p>`;

        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
            <div class="cart-item-details">
                <p class="cart-item-name">${item.nombre}</p>
                ${priceHTML}
            </div>
            <button class="remove-from-cart-btn" data-id="${item.id_producto || item.id_combo}" title="Eliminar item">&times;</button> 
        `;
        cartItemsContainer.appendChild(itemElement);
        
        total += vipPrice;
        originalTotal += originalPrice;
        itemCount++;
    });

    // Mostrar información de descuento VIP si aplica
    if (isVipUser && originalTotal > total) {
        const discountAmount = originalTotal - total;
        const vipInfoElement = document.createElement('div');
        vipInfoElement.classList.add('vip-discount-info');
        vipInfoElement.innerHTML = `
            <div class="vip-discount-badge">
                <span class="vip-icon">👑</span>
                <span class="vip-text">Descuento VIP (${vipDiscountPercentage}%): -S/. ${discountAmount.toFixed(2)}</span>
            </div>
        `;
        cartItemsContainer.appendChild(vipInfoElement);
    }

    cartTotalElement.textContent = total.toFixed(2);
    cartItemCountElement.textContent = itemCount;

    // Añadir event listeners a los botones de eliminar
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.id;
            removeFromCart(itemId);
        });
    });
    // Disparar evento personalizado para re-asociar el botón de vaciar
    document.dispatchEvent(new CustomEvent('cart:rendered'));
}

// Función para añadir un item al carrito
// item debe ser un objeto con id_producto/id_combo, nombre, precio, imagen
async function addToCart(item) {
    // Verificar estado VIP antes de agregar
    await checkVipStatus();
    
    // Verificar si el item ya está en el carrito (opcional, depende de la lógica deseada)
    // Por ahora, simplemente añadimos, permitiendo duplicados si se añade el mismo item varias veces.
    // Para evitar duplicados y solo aumentar cantidad, se necesitaría una lógica más compleja.
    
    const productToAdd = {
        id_producto: item.id_producto, // Usar id_producto para dulcería
        id_combo: item.id_combo,       // Usar id_combo para combos
        nombre: item.nombre,
        precio: item.precio,
        imagen: item.imagen,
        // Asegurarse de que el ID sea único y consistente
        // Si es un producto individual, id_producto tendrá valor, si es combo, id_combo tendrá valor.
        // Creamos un 'id' unificado para simplificar la eliminación.
        id: item.id_producto || item.id_combo 
    };

    cart.push(productToAdd);
    saveCart();
    renderCartItems();
    updateCartIcon(); // Para mostrar el dropdown o actualizar estado
    console.log('Item añadido al carrito:', productToAdd);
    
    // Mostrar notificación VIP si aplica
    if (isVipUser) {
        showVipNotification(vipDiscountPercentage);
    }
}

// Función para eliminar un item del carrito por su id_producto o id_combo
function removeFromCart(itemId) {
    // Encuentra el índice del primer item que coincida con el itemId.
    // Esto eliminará solo una instancia si hay duplicados.
    // Si se quiere eliminar todas las instancias, se usaría filter.
    const itemIndex = cart.findIndex(item => (item.id_producto && item.id_producto.toString() === itemId) || (item.id_combo && item.id_combo.toString() === itemId));

    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        saveCart();
        renderCartItems();
        updateCartIcon();
        console.log('Item eliminado del carrito, ID:', itemId);
    } else {
        console.log('No se encontró el item a eliminar, ID:', itemId);
    }
}

// Función para vaciar el carrito completamente
function clearCart() {
    cart = [];
    saveCart();
    renderCartItems();
    updateCartIcon();
    console.log('Carrito vaciado.');
}

// Función para actualizar el estado del icono del carrito (ej. mostrar/ocultar dropdown)
function updateCartIcon() {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartIcon && cartDropdown) {
        // Lógica para mostrar el dropdown si se hace clic o si hay items, etc.
        // Por ahora, solo nos aseguramos de que se renderice.
        renderCartItems(); // Asegura que el contenido del dropdown esté actualizado
    }
}


// Función para mostrar notificación VIP
function showVipNotification(discountPercentage) {
    // Crear o obtener contenedor de notificaciones
    let notificationContainer = document.getElementById('vip-notifications');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'vip-notifications';
        notificationContainer.className = 'vip-notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'vip-notification';
    notification.innerHTML = `
        <div class="vip-notification-content">
            <span class="vip-crown">👑</span>
            <span class="vip-message">¡Descuento VIP ${discountPercentage}% aplicado!</span>
        </div>
    `;

    notificationContainer.appendChild(notification);

    // Remover la notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para refrescar el carrito cuando cambie el estado del usuario
async function refreshCartForUser() {
    await checkVipStatus();
    renderCartItems();
}

// Event listener para cambios en el localStorage (cuando el usuario inicia/cierra sesión)
window.addEventListener('storage', (event) => {
    if (event.key === 'currentUser') {
        refreshCartForUser();
    } else if (event.key === 'cart') {
        cart = JSON.parse(event.newValue) || [];
        renderCartItems();
        updateCartIcon();
    }
});

// Función global para que otros scripts puedan actualizar el carrito
window.refreshCartForUser = refreshCartForUser;

// Event Listeners para el carrito
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar estado VIP al cargar la página
    await checkVipStatus();
    
    try {
        // Esperar a que se cargue la cabecera antes de configurar el carrito
        await waitForElement('#cartIcon', '#cartDropdown');
        
        // Renderizar carrito inicial con descuentos VIP si aplican
        renderCartItems();
        
        setupCartEventListeners();
    } catch (error) {
        console.log('Cart elements not available on this page, skipping cart setup');
        // Página sin carrito, continuar normal
    }
});

// Función para esperar a que los elementos del carrito estén disponibles
function waitForElement(...selectors) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo (50 * 100ms)
        
        const checkElements = () => {
            attempts++;
            const elements = selectors.map(selector => document.querySelector(selector));
            if (elements.every(el => el !== null)) {
                console.log('Cart elements found, setting up cart...'); // Debug log
                resolve(elements);
            } else if (attempts >= maxAttempts) {
                console.log('Cart elements not found after timeout, skipping cart setup'); // Debug log
                reject(new Error('Cart elements not found'));
            } else {
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    });
}

// Función para configurar los event listeners del carrito
function setupCartEventListeners() {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    // Forzar selector global por si el botón está fuera del scope
    function setupClearCartButton() {
        const clearCartButton = document.getElementById('clearCartButton') || document.querySelector('#clearCartButton');
        if (clearCartButton) {
            clearCartButton.onclick = function() {
                cart = [];
                saveCart();
                if (typeof renderCartItems === 'function') {
                    renderCartItems();
                }
                updateCartIcon();
                // También actualizar el contador si existe
                const cartItemCountElement = document.getElementById('cartItemCount');
                if (cartItemCountElement) cartItemCountElement.textContent = '0';
            };
        }
    }
    setupClearCartButton();

    // Mostrar u ocultar el carrito al hacer clic en el icono
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cart icon clicked'); // Debug log
            
            if (!cartDropdown) {
                console.error('Cart dropdown not found');
                return;
            }

            // Close user dropdown if open
            const userDropdownMenu = document.querySelector('.user-dropdown-menu');
            if (userDropdownMenu && userDropdownMenu.style.display === "block") {
                userDropdownMenu.style.display = "none";
            }
            
            // Alternar clase 'active' para mostrar/ocultar
            const isActive = cartDropdown.classList.toggle('active');
            console.log('Cart dropdown active:', isActive); // Debug log
            
            if (isActive) {
                renderCartItems(); // Renderizar items solo al abrir
            }
        });
    } else {
        console.error('Cart icon not found');
    }

    // Cerrar el dropdown si se hace clic fuera de él
    document.addEventListener('click', function(event) {
        const cartDropdown = document.getElementById('cartDropdown');
        const cartIcon = document.getElementById('cartIcon');
        if (
            cartDropdown &&
            cartDropdown.classList.contains('active') &&
            (!cartIcon || (!cartIcon.contains(event.target) && !cartDropdown.contains(event.target)))
        ) {
            cartDropdown.classList.remove('active');
        }
    });

    // También volver a asociar el botón cuando se renderiza el carrito (por si el DOM cambia)
    document.addEventListener('cart:rendered', setupClearCartButton);
}

// Función de debug para verificar estado VIP (temporal)
function debugVipStatus() {
    console.log('=== DEBUG VIP STATUS ===');
    console.log('currentUser:', currentUser);
    console.log('isVipUser:', isVipUser);
    console.log('vipDiscountPercentage:', vipDiscountPercentage);
    console.log('cart items:', cart.length);
    
    if (cart.length > 0) {
        console.log('Ejemplo de cálculo VIP:');
        const testPrice = 20.00;
        const vipPrice = calculateVipPrice(testPrice);
        console.log(`Precio original: ${testPrice}, Precio VIP: ${vipPrice}`);
    }
    console.log('========================');
}

// Función de debug para el carrito
function debugCart() {
    console.log('=== DEBUG CART ===');
    console.log('Cart icon:', document.getElementById('cartIcon'));
    console.log('Cart dropdown:', document.getElementById('cartDropdown'));
    console.log('Cart items container:', document.getElementById('cartItems'));
    console.log('Cart total element:', document.getElementById('cartTotal'));
    console.log('Cart count element:', document.getElementById('cartItemCount'));
    console.log('Cart items:', cart);
    console.log('VIP status:', { isVipUser, vipDiscountPercentage });
    console.log('==================');
}

// Hacer disponible globalmente para debug
window.debugCart = debugCart;

// Hacer disponible globalmente para debug
window.debugVipStatus = debugVipStatus;
