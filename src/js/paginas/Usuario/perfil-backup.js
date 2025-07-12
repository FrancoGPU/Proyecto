// Funcionalidad para la página de perfil

let currentUser = null;
let userRanks = [];
let pointsHistory = [];

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

// Cargar historial de puntos
async function loadPointsHistory() {
    try {
        const response = await fetch('/api/user/points-history');
        if (response.ok) {
            pointsHistory = await response.json();
            displayPointsHistory();
        }
    } catch (error) {
        console.error('Error al cargar historial de puntos:', error);
    }
}

// Mostrar historial de puntos
function displayPointsHistory(filter = 'all') {
    const historyContainer = document.getElementById('pointsHistory');
    historyContainer.innerHTML = '';
    
    let filteredHistory = pointsHistory;
    if (filter !== 'all') {
        filteredHistory = pointsHistory.filter(item => item.points_type === filter);
    }
    
    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = '<p>No hay actividad de puntos para mostrar.</p>';
        return;
    }
    
    filteredHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(item.created_at).toLocaleDateString('es-ES');
        const pointsClass = item.points_earned >= 0 ? 'positive' : 'negative';
        const pointsSign = item.points_earned >= 0 ? '+' : '';
        
        let title = '';
        let description = item.description || '';
        
        switch (item.points_type) {
            case 'purchase':
                title = 'Compra realizada';
                break;
            case 'bonus':
                title = 'Bonificación';
                break;
            case 'rank_upgrade':
                title = 'Promoción de rango';
                break;
            default:
                title = 'Actividad de puntos';
        }
        
        historyItem.innerHTML = `
            <div class="history-info">
                <h4>${title}</h4>
                <p>${description}</p>
                <small>${date}</small>
            </div>
            <div class="history-points ${pointsClass}">
                ${pointsSign}${item.points_earned}
            </div>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

// Cargar historial de compras
async function loadPurchaseHistory() {
    try {
        const response = await fetch('/api/user/purchases');
        if (response.ok) {
            const purchases = await response.json();
            displayPurchaseHistory(purchases);
        } else {
            console.error('Error al cargar historial de compras');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar historial de compras
function displayPurchaseHistory(purchases) {
    const container = document.getElementById('purchasesList');
    if (!container) return;

    if (purchases.length === 0) {
        container.innerHTML = '<p class="no-data">No tienes compras registradas aún.</p>';
        return;
    }

    container.innerHTML = purchases.map(purchase => `
        <div class="purchase-item">
            <div class="purchase-header">
                <div class="purchase-movie">
                    ${purchase.movie_image ? 
                        `<img src="${purchase.movie_image}" alt="${purchase.movie_title}" class="purchase-movie-image">` : 
                        '<div class="purchase-movie-placeholder"></div>'
                    }
                    <div class="purchase-movie-info">
                        <h4>${purchase.movie_title || 'Compra de productos'}</h4>
                        <p>${purchase.room_name ? `Sala: ${purchase.room_name}` : ''}</p>
                        <p>${purchase.room_type ? `Tipo: ${purchase.room_type.toUpperCase()}` : ''}</p>
                    </div>
                </div>
                <div class="purchase-details">
                    <p class="purchase-total">S/. ${parseFloat(purchase.total).toFixed(2)}</p>
                    <p class="purchase-date">${formatDate(purchase.created_at)}</p>
                </div>
            </div>
            <div class="purchase-body">
                <div class="purchase-info-item">
                    <span class="purchase-info-label">Método de Pago</span>
                    <span class="purchase-info-value">${purchase.payment_method || 'Tarjeta'}</span>
                </div>
                <div class="purchase-info-item">
                    <span class="purchase-info-label">Estado</span>
                    <span class="purchase-info-value">${purchase.status || 'Completado'}</span>
                </div>
                <div class="purchase-info-item">
                    <span class="purchase-info-label">Subtotal</span>
                    <span class="purchase-info-value">S/. ${parseFloat(purchase.subtotal || purchase.total).toFixed(2)}</span>
                </div>
                <div class="purchase-info-item">
                    <span class="purchase-info-label">Puntos Ganados</span>
                    <span class="purchase-info-value purchase-points">${Math.floor(purchase.total * 0.1)} puntos</span>
                </div>
                ${purchase.showtime ? `
                <div class="purchase-info-item">
                    <span class="purchase-info-label">Función</span>
                    <span class="purchase-info-value">${formatDateTime(purchase.showtime)}</span>
                </div>
                ` : ''}
                ${purchase.seats ? `
                <div class="purchase-info-item">
                    <span class="purchase-info-label">Asientos</span>
                    <span class="purchase-info-value">${JSON.parse(purchase.seats).join(', ')}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Mostrar historial de compras
function displayPurchases(purchases) {
    const purchasesList = document.getElementById('purchasesList');
    if (!purchasesList) return;

    if (!purchases || purchases.length === 0) {
        purchasesList.innerHTML = `
            <div class="no-purchases" style="text-align: center; padding: 2rem; color: #cccccc;">
                <p>No tienes compras registradas aún.</p>
            </div>
        `;
        return;
    }

    purchasesList.innerHTML = purchases.map(purchase => {
        const date = new Date(purchase.purchase_date || purchase.created_at);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="purchase-item">
                <div class="purchase-header">
                    <div class="purchase-movie">
                        <div class="purchase-movie-info">
                            <h4>Compra #${purchase.id}</h4>
                            <p>Fecha: ${formattedDate}</p>
                            ${purchase.movie_title ? `<p>Película: ${purchase.movie_title}</p>` : ''}
                        </div>
                    </div>
                    <div class="purchase-details">
                        <p class="purchase-total">S/. ${(purchase.total_final || purchase.total || 0).toFixed(2)}</p>
                        <p class="purchase-date">Puntos: +${purchase.points_earned || Math.floor((purchase.total_final || purchase.total || 0) * 0.1)}</p>
                        <span class="purchase-status completed">Completada</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Formatear fecha y hora
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Inicializar event listeners
function initializeEventListeners() {
    // Filtro de historial de puntos
    document.getElementById('historyFilter').addEventListener('change', function() {
        displayPointsHistory(this.value);
    });
    
    // Formulario de perfil
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Filtros de compras
    document.getElementById('purchaseTypeFilter').addEventListener('change', filterPurchases);
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
        if (updateData.newPassword !== updateData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (!updateData.currentPassword) {
            alert('Debes ingresar tu contraseña actual');
            return;
        }
    }
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            alert('Perfil actualizado correctamente');
            loadUserProfile(); // Recargar datos
            resetForm();
        } else {
            const error = await response.json();
            alert(error.message || 'Error al actualizar perfil');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar perfil');
    }
}

// Resetear formulario
function resetForm() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Filtrar compras
function filterPurchases() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const type = document.getElementById('purchaseTypeFilter').value;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type !== 'all') params.append('type', type);
    
    fetch(`/api/user/purchases?${params.toString()}`)
        .then(response => response.json())
        .then(purchases => displayPurchases(purchases))
        .catch(error => console.error('Error:', error));
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
