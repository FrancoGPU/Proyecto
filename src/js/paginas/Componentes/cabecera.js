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