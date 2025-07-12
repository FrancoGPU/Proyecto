// JavaScript para la gestión de usuarios VIP

let allUsers = [];
let currentFilter = 'all';

// Función de verificación de autenticación simplificada
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/session/status');
        if (!response.ok) {
            throw new Error('No autenticado');
        }
        
        const sessionData = await response.json();
        if (sessionData.loggedIn && sessionData.user && sessionData.user.role === 'admin') {
            return true;
        } else {
            // Redirigir al login si no es admin
            window.location.href = '/src/paginas/Autenticacion/login.html';
            return false;
        }
    } catch (error) {
        console.error('Error de autenticación:', error);
        window.location.href = '/src/paginas/Autenticacion/login.html';
        return false;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await verificarAutenticacion();
    if (isAuthenticated) {
        await loadUsers();
        setupEventListeners();
    }
});

// Configurar event listeners
function setupEventListeners() {
    const userFilter = document.getElementById('userFilter');
    const vipModal = document.getElementById('vipModal');
    const closeModal = document.getElementById('closeModal');
    const cancelModal = document.getElementById('cancelModal');
    const vipForm = document.getElementById('vipForm');

    userFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderUsers();
    });

    closeModal.addEventListener('click', closeVipModal);
    cancelModal.addEventListener('click', closeVipModal);
    
    vipModal.addEventListener('click', (e) => {
        if (e.target === vipModal) {
            closeVipModal();
        }
    });

    vipForm.addEventListener('submit', handleVipFormSubmit);
}

// Cargar usuarios desde el servidor
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        allUsers = await response.json();
        await loadVipStatuses();
        updateStats();
        renderUsers();
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Cargar estados VIP de todos los usuarios
async function loadVipStatuses() {
    const vipPromises = allUsers.map(async (user) => {
        try {
            const response = await fetch(`/api/users/${user.id}/vip-status`);
            if (response.ok) {
                const vipData = await response.json();
                user.isVip = vipData.isVip;
                user.vipDiscountPercentage = vipData.discountPercentage;
            } else {
                user.isVip = false;
                user.vipDiscountPercentage = 0;
            }
        } catch (error) {
            console.error(`Error al verificar VIP para usuario ${user.id}:`, error);
            user.isVip = false;
            user.vipDiscountPercentage = 0;
        }
    });

    await Promise.all(vipPromises);
}

// Actualizar estadísticas
function updateStats() {
    const vipUsers = allUsers.filter(user => user.isVip);
    const totalUsers = allUsers.length;

    // Filtrar descuentos válidos y calcular promedio
    const validDiscounts = vipUsers
        .map(user => parseFloat(user.vipDiscountPercentage) || 0) // Asegurarse de que sea un número válido
        .filter(discount => discount > 0); // Filtrar valores mayores a 0

    const avgDiscount = validDiscounts.length > 0 
        ? (validDiscounts.reduce((sum, discount) => sum + discount, 0) / validDiscounts.length).toFixed(1) 
        : 0;

    document.getElementById('vipActiveCount').textContent = vipUsers.length;
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('avgDiscountPercent').textContent = `${avgDiscount}%`;
}

// Renderizar tabla de usuarios
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    let filteredUsers = allUsers;

    // Aplicar filtro
    if (currentFilter === 'vip') {
        filteredUsers = allUsers.filter(user => user.isVip);
    } else if (currentFilter === 'regular') {
        filteredUsers = allUsers.filter(user => !user.isVip);
    }

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay usuarios que mostrar</td></tr>';
        return;
    }

    tbody.innerHTML = filteredUsers.map(user => {
        const vipBadge = user.isVip ? 
            `<span class="vip-badge"><span class="vip-crown-small">👑</span> VIP</span>` : 
            `<span class="regular-badge">Regular</span>`;
        
        const discount = user.isVip ? `${user.vipDiscountPercentage}%` : '-';
        const expiration = user.vip_membership_end ? 
            new Date(user.vip_membership_end).toLocaleDateString('es-ES') : 
            (user.isVip ? 'Permanente' : '-');

        const actions = user.isVip ? 
            `<button class="btn-vip-remove" onclick="removeVipStatus(${user.id})">Remover VIP</button>` :
            `<button class="btn-vip-upgrade" onclick="upgradeToVip(${user.id})">Hacer VIP</button>`;

        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${vipBadge}</td>
                <td>${discount}</td>
                <td>${expiration}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

// Abrir modal para hacer usuario VIP
function upgradeToVip(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modalTitle').textContent = `Hacer VIP: ${user.username}`;
    document.getElementById('modalUserId').value = userId;
    document.getElementById('discountPercentage').value = 15;
    document.getElementById('membershipDuration').value = 12;
    
    document.getElementById('vipModal').classList.add('active');
}

// Remover estado VIP
async function removeVipStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`¿Estás seguro de que quieres remover el estado VIP de ${user.username}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}/remove-vip`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al remover estado VIP');
        }

        showNotification('Estado VIP removido exitosamente', 'success');
        await loadUsers();
    } catch (error) {
        console.error('Error al remover VIP:', error);
        showNotification('Error al remover estado VIP', 'error');
    }
}

// Cerrar modal VIP
function closeVipModal() {
    document.getElementById('vipModal').classList.remove('active');
}

// Manejar envío del formulario VIP
async function handleVipFormSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('modalUserId').value;
    const discountPercentage = parseFloat(document.getElementById('discountPercentage').value);
    const membershipDuration = parseInt(document.getElementById('membershipDuration').value);

    try {
        const response = await fetch(`/api/admin/users/${userId}/upgrade-vip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discountPercentage,
                membershipDurationMonths: membershipDuration || null
            })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar usuario VIP');
        }

        showNotification('Usuario actualizado a VIP exitosamente', 'success');
        closeVipModal();
        await loadUsers();
    } catch (error) {
        console.error('Error al actualizar VIP:', error);
        showNotification('Error al actualizar usuario VIP', 'error');
    }
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear o obtener contenedor de notificaciones
    let notificationContainer = document.getElementById('admin-notifications');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'admin-notifications';
        notificationContainer.className = 'admin-notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    notificationContainer.appendChild(notification);

    // Event listener para cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
