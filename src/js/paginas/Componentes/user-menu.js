document.addEventListener('DOMContentLoaded', () => { // O 'gcHeaderLoaded' si prefieres una señal explícita
    const userButton = document.getElementById("user-button");
    const userIcon = userButton ? userButton.querySelector("i.fas.fa-user") : null;
    const userDropdownMenu = document.getElementById("user-dropdown-menu");

    if (!userButton || !userDropdownMenu) {
        console.warn("user-menu.js: User button or dropdown menu not found. User menu functionality will be disabled.");
        return;
    }
    if (!userIcon) {
        console.warn("user-menu.js: User icon (i.fas.fa-user) not found inside user-button.");
    }

    console.log("user-menu.js: Initializing user menu functionality.");

    async function checkLoginStatusAndUpdateUI() {
        if (!userIcon) { // userDropdownMenu ya está verificado arriba
            console.warn("user-menu.js: User icon not available for UI update.");
            // No actualizar si falta el ícono, pero el menú podría llenarse
        }
        console.log("user-menu.js: checkLoginStatusAndUpdateUI called");
        try {
            const response = await fetch('/api/session/status');
            if (!response.ok) {
                console.error('user-menu.js: Error al obtener estado de sesión:', response.status);
                updateUserMenuDisplay(false);
                return;
            }
            const data = await response.json();
            updateUserMenuDisplay(data.loggedIn, data.user);
        } catch (error) {
            console.error('user-menu.js: Error en checkLoginStatusAndUpdateUI:', error);
            updateUserMenuDisplay(false);
        }
    }

    function updateUserMenuDisplay(isLoggedIn, userData = null) {
        console.log("user-menu.js: updateUserMenuDisplay called. Logged in:", isLoggedIn);
        userDropdownMenu.innerHTML = ''; // Limpiar menú

        if (isLoggedIn && userData) {
            if (userIcon) userIcon.classList.add('logged-in');
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
                console.log("user-menu.js: Logout link clicked");
                userDropdownMenu.style.display = 'none';
                try {
                    const logoutResponse = await fetch('/api/logout', { method: 'POST' });
                    if (logoutResponse.ok) {
                        checkLoginStatusAndUpdateUI();
                    } else {
                        const errorData = await logoutResponse.json();
                        alert(`Error al cerrar sesión: ${errorData.message || 'Error desconocido'}`);
                    }
                } catch (err) {
                    console.error('user-menu.js: Error en la solicitud de logout:', err);
                    alert('Error al intentar cerrar sesión.');
                }
            });
            userDropdownMenu.appendChild(logoutLink);
        } else {
            if (userIcon) userIcon.classList.remove('logged-in');
            const loginLink = document.createElement('a');
            loginLink.href = '/paginas/Autenticacion/login.html';
            loginLink.textContent = 'Iniciar Sesión';
            userDropdownMenu.appendChild(loginLink);

            const registerLink = document.createElement('a');
            registerLink.href = '/paginas/Autenticacion/registro.html';
            registerLink.textContent = 'Registrarse';
            userDropdownMenu.appendChild(registerLink);
        }

        userDropdownMenu.querySelectorAll('a').forEach(link => {
            if (link.textContent !== 'Cerrar Sesión') {
                link.addEventListener('click', () => {
                    userDropdownMenu.style.display = 'none';
                });
            }
        });
    }

    checkLoginStatusAndUpdateUI();

    userButton.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("user-menu.js: User button clicked");
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
});