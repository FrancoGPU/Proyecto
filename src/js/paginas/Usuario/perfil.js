// Funcionalidad para la página de perfil - Versión simplificada

let currentUser = null;
let userRanks = [];

// Inicializar página de perfil
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserRanks();
    initializeEventListeners();
});

// Cargar información del perfil del usuario
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
            currentUser = await response.json();
            displayUserInfo();
            updateProgressBar();
        } else {
            console.error('Error al cargar perfil del usuario');
            // Redirigir al login si no está autenticado
            if (response.status === 401) {
                window.location.href = '../Autenticacion/login.html';
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar información del usuario
function displayUserInfo() {
    if (!currentUser) return;

    document.getElementById('username').textContent = currentUser.username || currentUser.email;
    document.getElementById('email').value = currentUser.email;
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('birthDate').value = currentUser.birth_date || '';
    
    // Actualizar rango
    const rankBadge = document.getElementById('userRank');
    rankBadge.textContent = currentUser.user_rank || 'Bronze';
    rankBadge.className = `rank-badge ${(currentUser.user_rank || 'bronze').toLowerCase()}`;
    
    // Actualizar puntos
    document.getElementById('userPoints').textContent = `${currentUser.points || 0} puntos`;
    
    // Estadísticas
    document.getElementById('totalPurchases').textContent = currentUser.total_purchases || 0;
    document.getElementById('totalSpent').textContent = `$${parseFloat(currentUser.total_spent || 0).toFixed(2)}`;
    document.getElementById('favoritesCount').textContent = currentUser.favorites_count || 0;
    
    // Fecha de registro
    if (currentUser.created_at) {
        const memberDate = new Date(currentUser.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
        document.getElementById('memberSince').textContent = `Miembro desde: ${memberDate}`;
    }
    
    // Imagen de perfil
    if (currentUser.profile_image) {
        document.getElementById('profileImage').src = currentUser.profile_image;
    }
}

// Cargar rangos disponibles
async function loadUserRanks() {
    try {
        const response = await fetch('/api/user/ranks');
        if (response.ok) {
            userRanks = await response.json();
            displayRanks();
            displayCurrentBenefits();
        }
    } catch (error) {
        console.error('Error al cargar rangos:', error);
    }
}

// Mostrar rangos en la interfaz
function displayRanks() {
    const ranksGrid = document.getElementById('ranksGrid');
    ranksGrid.innerHTML = '';
    
    userRanks.forEach(rank => {
        const rankCard = document.createElement('div');
        rankCard.className = 'rank-card';
        
        // Marcar rango actual
        if (currentUser && rank.rank_name === currentUser.user_rank) {
            rankCard.classList.add('current');
        }
        
        // Marcar rangos alcanzados
        if (currentUser && currentUser.points >= rank.min_points) {
            rankCard.classList.add('achieved');
        }
        
        const pointsRange = rank.max_points 
            ? `${rank.min_points} - ${rank.max_points} puntos`
            : `${rank.min_points}+ puntos`;
            
        rankCard.innerHTML = `
            <h4 style="color: ${rank.rank_color}">${rank.rank_name}</h4>
            <div class="rank-requirements">${pointsRange}</div>
            <p style="font-size: 0.9rem; margin-bottom: 1rem;">${rank.description}</p>
            <ul class="rank-benefits">
                <li>${rank.discount_percentage}% de descuento</li>
                <li>${rank.points_multiplier}x puntos por compra</li>
                ${rank.rank_name === 'VIP' ? '<li>Acceso prioritario</li><li>Ofertas exclusivas</li>' : ''}
            </ul>
        `;
        
        ranksGrid.appendChild(rankCard);
    });
}

// Mostrar beneficios del rango actual
function displayCurrentBenefits() {
    const benefitsContainer = document.getElementById('currentBenefits');
    benefitsContainer.innerHTML = '';
    
    if (!currentUser || !userRanks.length) return;
    
    const currentRank = userRanks.find(rank => rank.rank_name === currentUser.user_rank);
    if (!currentRank) return;
    
    const benefits = [
        {
            title: 'Descuento en Compras',
            description: `${currentRank.discount_percentage}% de descuento en todas tus compras`
        },
        {
            title: 'Multiplicador de Puntos',
            description: `Ganas ${currentRank.points_multiplier}x puntos por cada compra`
        },
        {
            title: 'Estatus de Miembro',
            description: `Miembro ${currentRank.rank_name} con beneficios especiales`
        }
    ];
    
    if (currentUser.user_rank === 'VIP') {
        benefits.push(
            {
                title: 'Acceso Prioritario',
                description: 'Reservas prioritarias y acceso temprano a estrenos'
            },
            {
                title: 'Ofertas Exclusivas',
                description: 'Descuentos y promociones exclusivas para miembros VIP'
            }
        );
    }
    
    benefits.forEach(benefit => {
        const benefitItem = document.createElement('div');
        benefitItem.className = 'benefit-item';
        benefitItem.innerHTML = `
            <h4>${benefit.title}</h4>
            <p>${benefit.description}</p>
        `;
        benefitsContainer.appendChild(benefitItem);
    });
}

// Actualizar barra de progreso
function updateProgressBar() {
    if (!currentUser || !userRanks.length) return;
    
    const currentPoints = currentUser.points || 0;
    const currentRankData = userRanks.find(rank => rank.rank_name === currentUser.user_rank);
    
    // Encontrar siguiente rango
    const nextRank = userRanks.find(rank => rank.min_points > currentPoints);
    
    if (nextRank) {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        const pointsNeeded = nextRank.min_points - currentPoints;
        const totalPoints = nextRank.min_points - (currentRankData ? currentRankData.min_points : 0);
        const progress = Math.max(0, (currentPoints - (currentRankData ? currentRankData.min_points : 0)) / totalPoints * 100);
        
        progressText.textContent = `${currentPoints} / ${nextRank.min_points} puntos`;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        
        // Mensaje de puntos faltantes
        const progressHeader = document.querySelector('.progress-header span:first-child');
        progressHeader.textContent = `Faltan ${pointsNeeded} puntos para ${nextRank.rank_name}`;
    } else {
        // Ya está en el rango máximo
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        progressText.textContent = `${currentPoints} puntos - Rango máximo alcanzado`;
        progressFill.style.width = '100%';
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    // Formulario de perfil
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Validación en tiempo real para contraseñas
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    newPasswordInput.addEventListener('input', validatePasswordStrength);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    
    // Validación de teléfono
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', validatePhoneNumber);
}

// Validar fortaleza de contraseña
function validatePasswordStrength(event) {
    const password = event.target.value;
    const input = event.target;
    
    // Remover clases anteriores
    input.classList.remove('weak', 'medium', 'strong');
    
    if (password.length === 0) return;
    
    if (password.length < 6) {
        input.classList.add('weak');
    } else if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
        input.classList.add('medium');
    } else {
        input.classList.add('strong');
    }
}

// Validar coincidencia de contraseñas
function validatePasswordMatch(event) {
    const confirmPassword = event.target.value;
    const newPassword = document.getElementById('newPassword').value;
    const input = event.target;
    
    input.classList.remove('match', 'no-match');
    
    if (confirmPassword.length === 0) return;
    
    if (confirmPassword === newPassword) {
        input.classList.add('match');
    } else {
        input.classList.add('no-match');
    }
}

// Validar número de teléfono
function validatePhoneNumber(event) {
    const phone = event.target.value;
    const input = event.target;
    
    input.classList.remove('valid-phone', 'invalid-phone');
    
    if (phone.length === 0) return;
    
    // Expresión regular para teléfono peruano
    const phoneRegex = /^(\+51|51)?[9][0-9]{8}$/;
    
    if (phoneRegex.test(phone.replace(/\s+/g, ''))) {
        input.classList.add('valid-phone');
    } else {
        input.classList.add('invalid-phone');
    }
}

// Función para ir al historial de compras
function goToHistory() {
    window.location.href = '/paginas/Usuario/historial-compras.html';
}

// Manejar actualización de perfil
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updateData = {
        phone: formData.get('phone'),
        birthDate: formData.get('birthDate'),
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    // Validar contraseñas si se quiere cambiar
    if (updateData.newPassword) {
        if (updateData.newPassword.length < 6) {
            showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (updateData.newPassword !== updateData.confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        if (!updateData.currentPassword) {
            showMessage('Debes ingresar tu contraseña actual para cambiarla', 'error');
            return;
        }
    }
    
    // Mostrar indicador de carga
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            showMessage('Perfil actualizado correctamente', 'success');
            loadUserProfile(); // Recargar datos
            resetForm();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Error al actualizar perfil', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión al actualizar perfil', 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Mostrar mensajes de estado
function showMessage(message, type = 'info') {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    // Insertar antes del formulario
    const profileSection = document.querySelector('.profile-settings-section');
    profileSection.insertBefore(messageDiv, profileSection.querySelector('.profile-form'));
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Resetear formulario
function resetForm() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Funciones para modal de imagen de perfil
function changeProfileImage() {
    document.getElementById('imageModal').style.display = 'block';
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.getElementById('imageInput').value = '';
    document.getElementById('previewImg').style.display = 'none';
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('previewImg');
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function selectPresetAvatar(src) {
    const previewImg = document.getElementById('previewImg');
    previewImg.src = src;
    previewImg.style.display = 'block';
    document.getElementById('imageInput').value = '';
}

async function saveProfileImage() {
    const imageInput = document.getElementById('imageInput');
    const previewImg = document.getElementById('previewImg');
    
    if (!previewImg.src || previewImg.style.display === 'none') {
        alert('Por favor selecciona una imagen');
        return;
    }
    
    try {
        let imageData;
        
        if (imageInput.files && imageInput.files[0]) {
            // Imagen subida por el usuario
            const formData = new FormData();
            formData.append('profileImage', imageInput.files[0]);
            
            const response = await fetch('/api/user/profile-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Error al subir imagen');
            }
            
            imageData = await response.json();
        } else {
            // Avatar predeterminado
            const response = await fetch('/api/user/profile-image', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageUrl: previewImg.src })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar imagen');
            }
            
            imageData = await response.json();
        }
        
        // Actualizar imagen en la interfaz
        document.getElementById('profileImage').src = imageData.imageUrl;
        closeImageModal();
        alert('Imagen de perfil actualizada');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar imagen de perfil');
    }
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeImageModal();
    }
}
