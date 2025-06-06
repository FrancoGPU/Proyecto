// cart.js

// Funciones para manejar el carrito de compras

// Inicializar el carrito desde localStorage o como un array vacío
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para renderizar los items del carrito en el dropdown
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartItemCountElement = document.getElementById('cartItemCount');

    // Si alguno de los elementos principales del carrito no está en la página, no hacer nada.
    if (!cartItemsContainer || !cartTotalElement || !cartItemCountElement) {
        // console.warn('Elementos del DOM del carrito no encontrados. El renderizado del carrito se omitirá.');
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
    let itemCount = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
            <div class="cart-item-details">
                <p class="cart-item-name">${item.nombre}</p>
                <p class="cart-item-price">S/. ${parseFloat(item.precio).toFixed(2)}</p>
            </div>
            <button class="remove-from-cart-btn" data-id="${item.id_producto || item.id_combo}" title="Eliminar item">&times;</button> 
        `;
        cartItemsContainer.appendChild(itemElement);
        total += parseFloat(item.precio);
        itemCount++;
    });

    cartTotalElement.textContent = total.toFixed(2);
    cartItemCountElement.textContent = itemCount;

    // Añadir event listeners a los botones de eliminar
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.id;
            removeFromCart(itemId);
        });
    });
}

// Función para añadir un item al carrito
// item debe ser un objeto con id_producto/id_combo, nombre, precio, imagen
function addToCart(item) {
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


// Event Listeners para el carrito
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    // Forzar selector global por si el botón está fuera del scope
    const clearCartButton = document.getElementById('clearCartButton') || document.querySelector('#clearCartButton');
    if (clearCartButton) {
        clearCartButton.onclick = function() {
            cart = [];
            saveCart();
            localStorage.removeItem('cart');
            if (typeof renderCartItems === 'function') {
                renderCartItems();
            }
            // También actualizar el contador si existe
            const cartItemCountElement = document.getElementById('cartItemCount');
            if (cartItemCountElement) cartItemCountElement.textContent = '0';
        };
    }

    // Mostrar u ocultar el carrito al hacer clic en el icono
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            // Alternar clase 'active' para mostrar/ocultar
            const isActive = cartDropdown.classList.toggle('active');
            if (isActive) {
                renderCartItems(); // Renderizar items solo al abrir
            }
        });
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
});


// Observador de cambios en el localStorage (para detectar cambios en otras pestañas)
window.addEventListener('storage', (event) => {
    if (event.key === 'cart') {
        cart = JSON.parse(event.newValue) || [];
        renderCartItems();
        updateCartIcon();
    }
});
