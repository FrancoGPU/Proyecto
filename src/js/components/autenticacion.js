// Sistema de autenticación y gestión de usuarios

// Variables globales
let currentUser = null;
let userVipStatus = { isVip: false, discountPercentage: 0 };

// Verificar si el usuario ha iniciado sesión
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const promotionsButton = document.getElementById("promotions-button");

if (isLoggedIn && promotionsButton) {
    promotionsButton.style.display = "flex"; // Mostrar el botón de promociones
}

// Función para verificar autenticación
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/session/status');
        if (!response.ok) {
            throw new Error('No autenticado');
        }
        
        const sessionData = await response.json();
        if (sessionData.authenticated && sessionData.loggedIn) {
            currentUser = sessionData.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Verificar estado VIP
            await checkUserVipStatus();
            
            // Actualizar interfaz
            updateUserInterface();
            
            return true;
        } else {
            // Usuario no autenticado
            redirectToLogin();
            return false;
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        redirectToLogin();
        return false;
    }
}

// Verificar estado VIP del usuario actual
async function checkUserVipStatus() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/users/${currentUser.id}/vip-status`);
        if (response.ok) {
            userVipStatus = await response.json();
        }
    } catch (error) {
        console.error('Error al verificar estado VIP:', error);
        userVipStatus = { isVip: false, discountPercentage: 0 };
    }
}

// Actualizar interfaz de usuario
function updateUserInterface() {
    const userDropdown = document.getElementById('userDropdown');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (userDropdown && userEmailDisplay && currentUser) {
        // Mostrar email del usuario
        let userDisplayText = currentUser.email;
        
        // Agregar badge VIP si aplica
        if (userVipStatus.isVip) {
            userDisplayText += ' <span class="vip-badge"><span class="vip-crown-small">👑</span> VIP</span>';
        }
        
        userEmailDisplay.innerHTML = userDisplayText;
        
        // Agregar información VIP al menú
        if (userVipStatus.isVip) {
            const existingVipInfo = userDropdown.querySelector('.vip-info');
            if (!existingVipInfo) {
                const vipInfo = document.createElement('div');
                vipInfo.className = 'vip-info';
                vipInfo.innerHTML = `Descuento VIP: ${userVipStatus.discountPercentage}%`;
                
                // Insertar después del email
                userEmailDisplay.parentNode.insertBefore(vipInfo, userEmailDisplay.nextSibling);
            }
        }
    }
    
    // Actualizar carrito si la función está disponible
    if (typeof window.refreshCartForUser === 'function') {
        window.refreshCartForUser();
    }
}

// Redireccionar al login
function redirectToLogin() {
    if (!window.location.pathname.includes('login.html')) {
        window.location.href = '/src/paginas/Autenticacion/login.html';
    }
}

// Función para cerrar sesión
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        currentUser = null;
        userVipStatus = { isVip: false, discountPercentage: 0 };
        redirectToLogin();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Forzar logout local
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        redirectToLogin();
    }
}

// Configurar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para botón de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Event listener para toggle del menú de usuario
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Si hay usuario en localStorage, verificar autenticación
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        checkUserVipStatus().then(() => {
            updateUserInterface();
        });
    }
});

// Exportar funciones para uso en otros archivos
window.verificarAutenticacion = verificarAutenticacion;
window.currentUser = currentUser;
window.userVipStatus = userVipStatus;
window.logout = logout;
