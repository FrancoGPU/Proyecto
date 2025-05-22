document.addEventListener('DOMContentLoaded', () => {
    const cabeceraElement = document.querySelector('header.cine-cabecera'); // Target the specific header

    if (cabeceraElement) {
        fetch('/paginas/components/cabecera.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el componente de cabecera');
                }
                return response.text();
            })
            .then(data => {
                cabeceraElement.innerHTML = data;

                // --- Initialize Header Elements (after HTML is loaded) ---
                const searchBarContainer = cabeceraElement.querySelector(".search-bar-container");
                const searchBar = cabeceraElement.querySelector("#search-bar");
                const searchSubmit = cabeceraElement.querySelector("#search-submit");
                
                const userButton = cabeceraElement.querySelector("#user-button");
                const userIcon = userButton ? userButton.querySelector("i.fas.fa-user") : null;
                const userDropdownMenu = cabeceraElement.querySelector("#user-dropdown-menu");

                // --- Cart Elements ---
                const cartButton = cabeceraElement.querySelector("#cart-button");
                const cartDropdownMenu = cabeceraElement.querySelector("#cart-dropdown-menu");
                const cartDropdownItemsContainer = cabeceraElement.querySelector("#cart-dropdown-items");
                const cartDropdownSubtotal = cabeceraElement.querySelector("#cart-dropdown-subtotal");
                const cartCheckoutButton = cabeceraElement.querySelector("#cart-checkout-button");
                // const cartItemCountBadge = cabeceraElement.querySelector("#cart-item-count"); // Already handled by cart.js's updateCartIconCount

                // --- Search Bar Logic (Conditional Display) ---
                if (searchBarContainer && searchBar && searchSubmit) {
                    // Show search bar only on prueba.html (or your main page)
                    if (window.location.pathname.endsWith('/prueba.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
                        searchBarContainer.style.display = 'flex'; // Or 'block' based on your CSS

                        searchSubmit.addEventListener("click", performSearch);
                        searchBar.addEventListener("keydown", (event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                performSearch();
                            }
                        });
                    }
                }

                function performSearch() {
                    const query = searchBar.value.trim().toLowerCase();
                    // Assuming movie list is in the main content, not header.
                    // This function might need to interact with elements outside the header,
                    // or dispatch an event that scripts.js listens to.
                    // For now, it will try to find #movie-list globally.
                    const movieList = document.getElementById("movie-list"); 
                    if (movieList) {
                        const movies = Array.from(movieList.children);
                        movies.forEach((movie) => {
                            const titleElement = movie.querySelector("h3.movie-title") || movie.querySelector("h3");
                            const title = titleElement?.textContent.toLowerCase() || "";
                            movie.style.display = title.includes(query) ? "flex" : "none"; // Assuming movie cards are flex items
                        });
                    }
                }

                // --- User Authentication and Menu Logic ---
                if (userButton && userDropdownMenu && userIcon) {
                    userButton.addEventListener("click", (event) => {
                        event.stopPropagation();
                        const isVisible = userDropdownMenu.style.display === "block";
                        userDropdownMenu.style.display = isVisible ? "none" : "block";
                    });

                    window.addEventListener("click", (event) => {
                        if (userDropdownMenu.style.display === "block" &&
                            !userButton.contains(event.target) &&
                            !userDropdownMenu.contains(event.target)) {
                            userDropdownMenu.style.display = "none";
                        }
                    });

                    window.addEventListener('keydown', (event) => {
                        if (event.key === 'Escape' && userDropdownMenu.style.display === 'block') {
                            userDropdownMenu.style.display = 'none';
                        }
                    });

                    checkLoginStatusAndUpdateUI();
                }

                // --- Cart Dropdown Logic ---
                if (cartButton && cartDropdownMenu && cartDropdownItemsContainer && cartDropdownSubtotal && cartCheckoutButton) {
                    cartButton.addEventListener("click", (event) => {
                        event.stopPropagation();
                        const isVisible = cartDropdownMenu.style.display === "block";
                        cartDropdownMenu.style.display = isVisible ? "none" : "block";
                        if (!isVisible) {
                            renderCartDropdown(); // Re-render cart when opening
                        }
                    });

                    cartCheckoutButton.addEventListener("click", () => {
                        window.location.href = '/paginas/Reserva/confirmacion.html';
                        cartDropdownMenu.style.display = "none";
                    });

                    // Close dropdown if clicked outside
                    window.addEventListener("click", (event) => {
                        if (cartDropdownMenu.style.display === "block" &&
                            !cartButton.contains(event.target) &&
                            !cartDropdownMenu.contains(event.target)) {
                            cartDropdownMenu.style.display = "none";
                        }
                    });
                     window.addEventListener('keydown', (event) => {
                        if (event.key === 'Escape' && cartDropdownMenu.style.display === 'block') {
                            cartDropdownMenu.style.display = 'none';
                        }
                    });
                }

                function renderCartDropdown() {
                    if (!cartDropdownItemsContainer || !cartDropdownSubtotal) return;

                    // Ensure cart.js functions are available
                    if (typeof getCart !== 'function' || typeof getCartTotal !== 'function' || typeof removeFromCart !== 'function' || typeof updateQuantity !== 'function') {
                        console.error("Funciones del carrito (getCart, getCartTotal, etc.) no están definidas. Asegúrate que cart.js esté cargado.");
                        cartDropdownItemsContainer.innerHTML = '<p class="cart-error-message">Error al cargar el carrito.</p>';
                        return;
                    }

                    const cartItems = getCart();
                    cartDropdownItemsContainer.innerHTML = ''; // Clear previous items

                    if (cartItems.length === 0) {
                        cartDropdownItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
                    } else {
                        const ul = document.createElement('ul');
                        ul.classList.add('cart-dropdown-list');
                        cartItems.forEach(item => {
                            const li = document.createElement('li');
                            li.classList.add('cart-dropdown-item');
                            li.innerHTML = `
                                <img src="${item.image}" alt="${item.name}" class="cart-dropdown-item-image">
                                <div class="cart-dropdown-item-details">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">S/.${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <div class="cart-dropdown-item-actions">
                                    <input type="number" value="${item.quantity}" min="1" class="item-quantity-input" data-id="${item.id}" data-type="${item.type || 'combo'}">
                                    <button class="btn-remove-item" data-id="${item.id}" data-type="${item.type || 'combo'}">&times;</button>
                                </div>
                            `;
                            ul.appendChild(li);
                        });
                        cartDropdownItemsContainer.appendChild(ul);

                        // Add event listeners for quantity changes and remove buttons
                        ul.querySelectorAll('.item-quantity-input').forEach(input => {
                            input.addEventListener('change', (event) => {
                                const itemId = event.target.dataset.id;
                                const itemType = event.target.dataset.type;
                                const newQuantity = parseInt(event.target.value, 10);
                                if (newQuantity >= 0) { // Allow 0 to remove
                                    updateQuantity(itemId, newQuantity, itemType);
                                    renderCartDropdown(); // Re-render to reflect changes (including removal if quantity is 0)
                                    updateCartIconCount(); // from cart.js
                                } else {
                                    event.target.value = getCart().find(i => i.id === itemId && i.type === itemType)?.quantity || 1; // Reset if invalid
                                }
                            });
                        });
                        ul.querySelectorAll('.btn-remove-item').forEach(button => {
                            button.addEventListener('click', (event) => {
                                const itemId = event.target.dataset.id;
                                const itemType = event.target.dataset.type;
                                removeFromCart(itemId, itemType);
                                renderCartDropdown(); // Re-render
                                updateCartIconCount(); // from cart.js
                            });
                        });
                    }
                    cartDropdownSubtotal.textContent = getCartTotal().toFixed(2);
                }
                // Initial call to set cart count on load (already done by cart.js, but good for consistency if cart.js changes)
                if (typeof updateCartIconCount === 'function') updateCartIconCount();

                async function checkLoginStatusAndUpdateUI() {
                    if (!userButton || !userDropdownMenu || !userIcon) {
                        console.warn("Elementos del menú de usuario no encontrados en cabecera. No se actualizará el estado de login.");
                        return;
                    }
                    try {
                        const response = await fetch('/api/session/status');
                        if (!response.ok) {
                            console.error('Error al obtener estado de sesión:', response.status);
                            updateUserMenu(false);
                            return;
                        }
                        const data = await response.json();
                        updateUserMenu(data.loggedIn, data.user);
                    } catch (error) {
                        console.error('Error en checkLoginStatusAndUpdateUI (cabecera):', error);
                        updateUserMenu(false);
                    }
                }

                function updateUserMenu(isLoggedIn, userData = null) {
                    if (!userDropdownMenu || !userIcon) return;
                    userDropdownMenu.innerHTML = ''; // Clear previous options

                    if (isLoggedIn && userData) {
                        userIcon.classList.add('logged-in');
                        const userEmailDisplay = document.createElement('div');
                        userEmailDisplay.classList.add('dropdown-user-email');
                        userEmailDisplay.textContent = userData.email;
                        userDropdownMenu.appendChild(userEmailDisplay);

                        if (userData.role === 'admin') {
                            const adminPanelLink = document.createElement('a');
                            adminPanelLink.href = '/paginas/Administracion/admin.html';
                            adminPanelLink.textContent = 'Panel Admin';
                            userDropdownMenu.appendChild(adminPanelLink);
                        }

                        const logoutLink = document.createElement('a');
                        logoutLink.href = '#';
                        logoutLink.textContent = 'Cerrar Sesión';
                        logoutLink.addEventListener('click', async (e) => {
                            e.preventDefault();
                            userDropdownMenu.style.display = 'none';
                            try {
                                const logoutResponse = await fetch('/api/logout', { method: 'POST' });
                                if (logoutResponse.ok) {
                                    checkLoginStatusAndUpdateUI();
                                    // Optional: Redirect if needed
                                    // if (window.location.pathname.includes('/admin.html')) {
                                    //    window.location.href = '/paginas/prueba.html';
                                    // }
                                } else {
                                    const errorData = await logoutResponse.json();
                                    alert(`Error al cerrar sesión: ${errorData.message || 'Error desconocido'}`);
                                }
                            } catch (err) {
                                console.error('Error en la solicitud de logout (cabecera):', err);
                                alert('Error al intentar cerrar sesión.');
                            }
                        });
                        userDropdownMenu.appendChild(logoutLink);
                    } else {
                        userIcon.classList.remove('logged-in');
                        const loginLink = document.createElement('a');
                        loginLink.href = '/paginas/Autenticacion/login.html';
                        loginLink.textContent = 'Iniciar Sesión';
                        userDropdownMenu.appendChild(loginLink);

                        const registerLink = document.createElement('a');
                        registerLink.href = '/paginas/Autenticacion/registro.html';
                        registerLink.textContent = 'Registrarse';
                        userDropdownMenu.appendChild(registerLink);
                    }
                    
                    // Re-assign listeners for closing menu on link click
                    userDropdownMenu.querySelectorAll('a').forEach(link => {
                        if (link.textContent !== 'Cerrar Sesión') {
                            link.addEventListener('click', () => {
                                userDropdownMenu.style.display = 'none';
                            });
                        }
                    });
                }
            })
            .catch(error => console.error('Error al procesar componente de cabecera:', error));
    } else {
        console.warn("Elemento <header class='cine-cabecera'> no encontrado. El script de cabecera dinámica no se ejecutará.");
    }
});