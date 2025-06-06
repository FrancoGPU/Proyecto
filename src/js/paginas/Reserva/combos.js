document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos desde localStorage
    const movieName = localStorage.getItem('movieTitle');
    const seats = localStorage.getItem('selectedSeats');
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0; // Convertir a número o inicializar en 0
    const showtime = localStorage.getItem('selectedShowtime'); // Recuperar el horario seleccionado
    const comboList = document.getElementById('combo-list');
    const continueButton = document.getElementById('continue-button');
    const dulceriaList = document.getElementById('dulceria-list'); // Nueva línea para la lista de dulcería

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
                    // Guardar combos seleccionados (array)
                    let selectedCombos = [];
                    try {
                        selectedCombos = JSON.parse(localStorage.getItem('selectedCombo')) || [];
                        if (!Array.isArray(selectedCombos)) selectedCombos = [selectedCombos];
                    } catch { selectedCombos = []; }
                    // Evitar duplicados por id
                    if (!selectedCombos.some(c => c.id === selectedCombo.id)) {
                        selectedCombos.push(selectedCombo);
                        localStorage.setItem('selectedCombo', JSON.stringify(selectedCombos));
                        // Guardar también en el carrito (array)
                        let cart = [];
                        try {
                            cart = JSON.parse(localStorage.getItem('cart')) || [];
                            if (!Array.isArray(cart)) cart = [cart];
                        } catch { cart = []; }
                        cart.push({ nombre: selectedCombo.name, precio: selectedCombo.price });
                        localStorage.setItem('cart', JSON.stringify(cart));
                        // Mensaje visual
                        button.textContent = 'Agregado';
                        button.disabled = true;
                        setTimeout(() => {
                            button.textContent = 'Seleccionar';
                            button.disabled = false;
                        }, 1000);
                    } else {
                        button.textContent = 'Ya agregado';
                        button.disabled = true;
                        setTimeout(() => {
                            button.textContent = 'Seleccionar';
                            button.disabled = false;
                        }, 1000);
                    }
                });
            });
        } catch (error) {
            console.error('Error al cargar los combos:', error);
            comboList.innerHTML = '<p>Error al cargar los combos. Intenta nuevamente más tarde.</p>';
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
            // Evento para agregar productos de dulcería al carrito
            document.querySelectorAll('.add-dulceria').forEach((button) => {
                button.addEventListener('click', (e) => {
                    const prod = JSON.parse(e.target.dataset.prod);
                    let cart = [];
                    try {
                        cart = JSON.parse(localStorage.getItem('cart')) || [];
                        if (!Array.isArray(cart)) cart = [cart];
                    } catch { cart = []; }
                    cart.push({ nombre: prod.nombre, precio: prod.precio });
                    localStorage.setItem('cart', JSON.stringify(cart));
                    button.textContent = 'Agregado';
                    button.disabled = true;
                    setTimeout(() => {
                        button.textContent = 'Agregar';
                        button.disabled = false;
                    }, 1000);
                });
            });
        } catch (error) {
            dulceriaList.innerHTML = '<p>Error al cargar dulcería.</p>';
        }
    }

    // Cargar combos al cargar la página
    loadCombos();
    // Cargar dulcería al cargar la página
    loadDulceria();

    // Manejar el botón para continuar sin seleccionar un combo
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            // Redirigir a confirmacion.html sin guardar un combo
            window.location.href = 'confirmacion.html';
        });
    }
});