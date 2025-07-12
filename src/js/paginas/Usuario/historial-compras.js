document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('purchase-history-content');

    // Verificar si el usuario está autenticado
    try {
        const sessionResponse = await fetch('/api/session/status');
        if (!sessionResponse.ok) {
            showError('Error al verificar la sesión');
            return;
        }

        const sessionData = await sessionResponse.json();
        if (!sessionData.loggedIn) {
            showNotLoggedIn();
            return;
        }

        // Cargar el historial de compras
        await loadPurchaseHistory();

    } catch (error) {
        console.error('Error al verificar sesión:', error);
        showError('Error de conexión');
    }

    async function loadPurchaseHistory() {
        try {
            const response = await fetch('/api/purchases/history');
            if (!response.ok) {
                throw new Error('Error al cargar el historial');
            }

            const result = await response.json();
            if (result.success) {
                displayPurchases(result.data);
            } else {
                showError(result.message || 'Error al cargar el historial');
            }

        } catch (error) {
            console.error('Error al cargar historial:', error);
            showError('Error de conexión al cargar el historial');
        }
    }

    function displayPurchases(purchases) {
        if (!purchases || purchases.length === 0) {
            showEmptyState();
            return;
        }

        const purchasesHTML = purchases.map(purchase => createPurchaseCard(purchase)).join('');
        contentContainer.innerHTML = purchasesHTML;
    }

    function createPurchaseCard(purchase) {
        const purchaseDate = new Date(purchase.purchase_date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const cartItems = Array.isArray(purchase.cart_items) ? purchase.cart_items : 
                         (typeof purchase.cart_items === 'string' ? JSON.parse(purchase.cart_items || '[]') : []);

        const vipBadge = purchase.is_vip_purchase ? 
            `<span class="vip-badge">⭐ VIP -${purchase.discount_applied}%</span>` : '';

        const itemsHTML = cartItems.length > 0 ? 
            cartItems.map(item => {
                const name = item.nombre || item.name || 'Producto';
                const price = parseFloat(item.precio || item.price || 0);
                return `<li>${name} - S/.${price.toFixed(2)}</li>`;
            }).join('') : 
            '<li>No hay productos adicionales</li>';

        return `
            <div class="purchase-card">
                <div class="purchase-header">
                    <h3 class="purchase-title">${purchase.movie_title}</h3>
                    <div class="purchase-id">${purchase.purchase_id}</div>
                </div>

                <div class="purchase-info">
                    <div class="info-group">
                        <div class="info-label">Fecha de Compra</div>
                        <div class="info-value">${purchaseDate}</div>
                    </div>

                    <div class="info-group">
                        <div class="info-label">Función</div>
                        <div class="info-value">${purchase.showtime || 'No especificado'}</div>
                    </div>

                    <div class="info-group">
                        <div class="info-label">Asientos</div>
                        <div class="info-value">${purchase.selected_seats || 'No especificados'}</div>
                    </div>

                    <div class="info-group">
                        <div class="info-label">Método de Pago</div>
                        <div class="info-value">
                            ${getPaymentMethodText(purchase.payment_method)}
                            ${purchase.card_last_four ? ` •••• ${purchase.card_last_four}` : ''}
                        </div>
                    </div>
                </div>

                ${cartItems.length > 0 ? `
                    <div class="purchase-items">
                        <div class="items-title">Productos Adicionales</div>
                        <ul class="item-list">
                            ${itemsHTML}
                        </ul>
                    </div>
                ` : ''}

                <div class="purchase-totals">
                    <div class="total-row">
                        <span class="total-label">Precio Entradas:</span>
                        <span class="total-value">S/.${parseFloat(purchase.ticket_price || 0).toFixed(2)}</span>
                    </div>
                    
                    ${purchase.is_vip_purchase ? `
                        <div class="total-row">
                            <span class="total-label">Total Original:</span>
                            <span class="total-value">S/.${parseFloat(purchase.total_original).toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">Descuento VIP (${purchase.discount_applied}%):</span>
                            <span class="total-value">-S/.${(parseFloat(purchase.total_original) - parseFloat(purchase.total_final)).toFixed(2)}</span>
                        </div>
                    ` : ''}
                    
                    <div class="total-row">
                        <span class="total-label">Total Pagado: ${vipBadge}</span>
                        <span class="total-value final">S/.${parseFloat(purchase.total_final).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function getPaymentMethodText(method) {
        const methods = {
            'credit_card': 'Tarjeta de Crédito',
            'debit_card': 'Tarjeta de Débito',
            'cash': 'Efectivo'
        };
        return methods[method] || 'No especificado';
    }

    function showEmptyState() {
        contentContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">🎬</div>
                <h3>No hay compras realizadas</h3>
                <p>Aún no has realizado ninguna compra en GOCINE.</p>
                <p><a href="/paginas/prueba.html" style="color: #ff6b35;">¡Explora nuestro catálogo de películas!</a></p>
            </div>
        `;
    }

    function showNotLoggedIn() {
        contentContainer.innerHTML = `
            <div class="error">
                <h3>Acceso Restringido</h3>
                <p>Debes iniciar sesión para ver tu historial de compras.</p>
                <p><a href="/paginas/Autenticacion/login.html" style="color: #ff6b35;">Iniciar Sesión</a></p>
            </div>
        `;
    }

    function showError(message) {
        contentContainer.innerHTML = `
            <div class="error">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: #d32f2f; 
                    color: white; 
                    border: none; 
                    padding: 0.5rem 1rem; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    margin-top: 1rem;
                ">Reintentar</button>
            </div>
        `;
    }
});
