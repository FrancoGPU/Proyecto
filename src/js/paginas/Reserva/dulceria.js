// Dulcería GOCINE - Carga productos individuales y combos

// IMPORTANTE: Asegúrate de que cart.js esté cargado antes que este archivo en el HTML.
// Ejemplo en combos.html:
// <script src="/js/paginas/Reserva/cart.js"></script>
// <script src="/js/paginas/Reserva/dulceria.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    const dulceriaList = document.getElementById('dulceria-list');
    const comboList = document.getElementById('combo-list');
    const continueButton = document.getElementById('continue-to-confirmation-button');

    // Reemplazar la función addToCart local para usar la del carrito global
    // Asegurarse de que cart.js esté cargado antes de este archivo en el HTML
    function addToCart(item) {
        if (typeof window.addToCart === 'function' && window.addToCart !== addToCart) {
            window.addToCart(item); // Usa la función global de cart.js
        } else if (typeof window.addToCart === 'undefined' && typeof window["addToCart"] === 'function') {
            window["addToCart"](item);
        } else {
            console.warn('No se encontró la función global addToCart. ¿cart.js está cargado antes que dulceria.js?');
        }
    }

    // Cargar productos individuales de dulcería
    async function loadDulceria() {
        if (!dulceriaList) return;
        try {
            const response = await fetch('/api/dulceria');
            if (!response.ok) throw new Error('Error al cargar dulcería');
            const productos = await response.json();
            dulceriaList.innerHTML = '';
            if (productos.length === 0) {
                dulceriaList.innerHTML = '<p>No hay productos disponibles.</p>';
                return;
            }
            productos.forEach((prod) => {
                const card = document.createElement('div');
                card.classList.add('combo-card');
                card.innerHTML = `
                    <img src="${prod.imagen || ''}" alt="${prod.nombre}">
                    <h3>${prod.nombre}</h3>
                    <p>${prod.descripcion}</p>
                    <p class="price">S/.${parseFloat(prod.precio).toFixed(2)}</p>
                    <button class="add-dulceria" data-prod='${JSON.stringify(prod)}'>Agregar</button>
                `;
                dulceriaList.appendChild(card);
            });
        } catch (error) {
            dulceriaList.innerHTML = '<p>Error al cargar dulcería.</p>';
        }
    }

    // Cargar combos/promociones
    async function loadCombos() {
        if (!comboList) return;
        try {
            const response = await fetch('/api/combos');
            if (!response.ok) throw new Error('Error al cargar combos');
            const combos = await response.json();
            comboList.innerHTML = '';
            if (combos.length === 0) {
                comboList.innerHTML = '<p>No hay combos disponibles.</p>';
                return;
            }
            combos.forEach((combo) => {
                const card = document.createElement('div');
                card.classList.add('combo-card');
                card.innerHTML = `
                    <img src="${combo.image || ''}" alt="${combo.name}">
                    <h3>${combo.name}</h3>
                    <p>${combo.description}</p>
                    <p class="price">S/.${parseFloat(combo.price).toFixed(2)}</p>
                    <button class="add-combo" data-combo='${JSON.stringify(combo)}'>Agregar Combo</button>
                `;
                comboList.appendChild(card);
            });
        } catch (error) {
            comboList.innerHTML = '<p>Error al cargar combos.</p>';
        }
    }
    // Inicializar
    loadDulceria();
    loadCombos();

    // Listeners para agregar productos y combos al carrito
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-dulceria')) {
            const prod = JSON.parse(e.target.getAttribute('data-prod'));
            // Adaptar el objeto para el carrito
            addToCart({
                id_producto: prod.id_producto || prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                imagen: prod.imagen
            });
        }
        if (e.target.classList.contains('add-combo')) {
            const combo = JSON.parse(e.target.getAttribute('data-combo'));
            addToCart({
                id_combo: combo.id_combo || combo.id,
                nombre: combo.name || combo.nombre,
                precio: combo.price || combo.precio,
                imagen: combo.image || combo.imagen
            });
        }
    });

    // TODO: Lógica de carrito y continuar
    continueButton.addEventListener('click', () => {
        // Redirigir a confirmación o siguiente paso
        window.location.href = '/paginas/Reserva/confirmacion.html';
    });
});
