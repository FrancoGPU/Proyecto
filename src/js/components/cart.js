const CART_KEY = 'gocineCart';

function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartIconCount(); // Update icon whenever cart changes
}

function addToCart(product) {
    const cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id && item.type === (product.type || 'combo')); // Differentiate by type if needed

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    alert(`${product.name} ha sido añadido al carrito.`); // Simple feedback
}

function removeFromCart(productId, productType = 'combo') {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === productId && item.type === productType));
    saveCart(cart);
}

function updateQuantity(productId, quantity, productType = 'combo') {
    const cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId && item.type === productType);

    if (productIndex > -1) {
        if (quantity <= 0) {
            cart.splice(productIndex, 1); // Remove if quantity is 0 or less
        } else {
            cart[productIndex].quantity = quantity;
        }
        saveCart(cart);
    }
}

function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartIconCount();
}

// This function is a placeholder for updating a visual cart icon in the header.
// You'll need to integrate this with your cabecera.js if you add a cart icon there.
function updateCartIconCount() {
    const cartCountElement = document.getElementById('cart-item-count'); // This ID is in cabecera.html
    if (cartCountElement) {
        const count = getCartItemCount();
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'inline-block' : 'none'; // Show badge only if items > 0
    }
}

// Initialize cart icon on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartIconCount();
});