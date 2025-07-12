// Función para inicializar el user menu
function initializeUserMenu() {
    const userButton = document.getElementById("user-button");
    const userIcon = userButton ? userButton.querySelector("img.icon-img") : null;
    const userDropdownMenu = document.getElementById("user-dropdown-menu");

    if (!userButton || !userDropdownMenu) {
        console.warn("user-menu.js: User button or dropdown menu not found. User menu functionality will be disabled.");
        return;
    }
    if (!userIcon) {
        console.warn("user-menu.js: User icon (img.icon-img) not found inside user-button.");
    }

    console.log("user-menu.js: Initializing user menu functionality.");
    
    // Asegurar que el menú esté oculto inicialmente
    userDropdownMenu.classList.remove('active');
    console.log("user-menu.js: Menu initialized as hidden (removed 'active' class)");

    async function checkLoginStatusAndUpdateUI() {
        if (!userIcon) {
            console.warn("user-menu.js: User icon not available for UI update.");
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
        console.log("user-menu.js: User data:", userData);
        userDropdownMenu.innerHTML = ''; // Limpiar menú

        if (isLoggedIn && userData) {
            if (userIcon) userIcon.classList.add('logged-in');
            const userDisplayDiv = document.createElement('div');
            userDisplayDiv.classList.add('dropdown-user-info');
            userDisplayDiv.innerHTML = `
                <div class="user-display-name">${userData.username || userData.email}</div>
                <div class="user-role">${userData.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
            `;
            userDropdownMenu.appendChild(userDisplayDiv);

            // Enlace al perfil de usuario
            const profileLink = document.createElement('a');
            profileLink.href = '/paginas/Usuario/perfil.html';
            profileLink.innerHTML = '<i class="fas fa-user-circle"></i> Mi Perfil';
            profileLink.classList.add('dropdown-profile-link');
            userDropdownMenu.appendChild(profileLink);
            
            console.log("user-menu.js: Added profile link to menu");

            if (userData.role === 'admin') {
                const adminPanelLink = document.createElement('a');
                adminPanelLink.href = '/paginas/Administracion/admin.html';
                adminPanelLink.innerHTML = '<i class="fas fa-cog"></i> Panel Admin';
                userDropdownMenu.appendChild(adminPanelLink);
            }

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log("user-menu.js: Logout link clicked");
                userDropdownMenu.classList.remove('active');
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
            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            userDropdownMenu.appendChild(loginLink);

            const registerLink = document.createElement('a');
            registerLink.href = '/paginas/Autenticacion/registro.html';
            registerLink.innerHTML = '<i class="fas fa-user-plus"></i> Registrarse';
            userDropdownMenu.appendChild(registerLink);
        }

        userDropdownMenu.querySelectorAll('a').forEach(link => {
            if (link.textContent !== 'Cerrar Sesión') {
                link.addEventListener('click', () => {
                    userDropdownMenu.classList.remove('active');
                });
            }
        });
    }

    checkLoginStatusAndUpdateUI();

    userButton.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("user-menu.js: User button clicked");
        
        // Cerrar el carrito si está abierto
        const cartDropdown = document.getElementById("cartDropdown");
        if (cartDropdown && cartDropdown.classList.contains("active")) {
            cartDropdown.classList.remove("active");
        }
        
        // Verificar si el menú está visible usando la clase 'active'
        const isVisible = userDropdownMenu.classList.contains('active');
        
        console.log("user-menu.js: Menu has 'active' class:", isVisible);
        console.log("user-menu.js: Menu element:", userDropdownMenu);
        console.log("user-menu.js: Menu innerHTML:", userDropdownMenu.innerHTML);
        
        if (isVisible) {
            userDropdownMenu.classList.remove('active');
            console.log("user-menu.js: Hiding menu (removed 'active' class)");
        } else {
            userDropdownMenu.classList.add('active');
            console.log("user-menu.js: Showing menu (added 'active' class)");
        }
        
        console.log("user-menu.js: Menu classes:", userDropdownMenu.className);
    });

    window.addEventListener("click", (event) => {
        if (userDropdownMenu.classList.contains('active') &&
            !userButton.contains(event.target) &&
            !userDropdownMenu.contains(event.target)) {
            userDropdownMenu.classList.remove('active');
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && userDropdownMenu.classList.contains('active')) {
            userDropdownMenu.classList.remove('active');
        }
    });
}

// Intentar inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Función para verificar si los elementos están listos
    function checkAndInitialize() {
        if (document.getElementById("user-button") && document.getElementById("user-dropdown-menu")) {
            initializeUserMenu();
        } else {
            // Reintentar después de un breve delay
            setTimeout(checkAndInitialize, 50);
        }
    }
    
    // Comenzar verificación
    checkAndInitialize();
});