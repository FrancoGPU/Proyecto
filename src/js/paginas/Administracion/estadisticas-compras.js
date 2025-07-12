document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('stats-content');

    // Verificar si el usuario es administrador
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

        if (sessionData.user.role !== 'admin') {
            showNotAuthorized();
            return;
        }

        // Cargar las estadísticas
        await loadPurchaseStats();

    } catch (error) {
        console.error('Error al verificar sesión:', error);
        showError('Error de conexión');
    }

    async function loadPurchaseStats() {
        try {
            const response = await fetch('/api/admin/purchases/stats');
            if (!response.ok) {
                throw new Error('Error al cargar las estadísticas');
            }

            const result = await response.json();
            if (result.success) {
                displayStats(result.data);
            } else {
                showError(result.message || 'Error al cargar las estadísticas');
            }

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            showError('Error de conexión al cargar las estadísticas');
        }
    }

    function displayStats(data) {
        const { stats, recentPurchases } = data;

        const statsHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${parseInt(stats.total_purchases || 0)}</div>
                    <div class="stat-label">Compras Totales</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">S/.${parseFloat(stats.total_revenue || 0).toFixed(2)}</div>
                    <div class="stat-label">Ingresos Totales</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${parseInt(stats.vip_purchases || 0)}</div>
                    <div class="stat-label">Compras VIP</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">S/.${parseFloat(stats.average_purchase || 0).toFixed(2)}</div>
                    <div class="stat-label">Promedio por Compra</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${parseInt(stats.unique_customers || 0)}</div>
                    <div class="stat-label">Clientes Únicos</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${calculateVipPercentage(stats)}%</div>
                    <div class="stat-label">% Compras VIP</div>
                </div>
            </div>

            <div class="recent-purchases">
                <h3>Compras Recientes</h3>
                ${createPurchasesTable(recentPurchases)}
            </div>
        `;

        contentContainer.innerHTML = statsHTML;
    }

    function calculateVipPercentage(stats) {
        const total = parseInt(stats.total_purchases || 0);
        const vip = parseInt(stats.vip_purchases || 0);
        return total > 0 ? Math.round((vip / total) * 100) : 0;
    }

    function createPurchasesTable(purchases) {
        if (!purchases || purchases.length === 0) {
            return '<p style="color: #666; text-align: center; padding: 2rem;">No hay compras recientes</p>';
        }

        const tableRows = purchases.map(purchase => {
            const date = new Date(purchase.purchase_date).toLocaleString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const customerName = purchase.customer_name || 'Invitado';
            const vipBadge = purchase.is_vip_purchase ? '<span class="vip-indicator">VIP</span>' : '';

            return `
                <tr>
                    <td>${purchase.purchase_id}</td>
                    <td>${purchase.movie_title}</td>
                    <td>${customerName}</td>
                    <td>S/.${parseFloat(purchase.total_final).toFixed(2)} ${vipBadge}</td>
                    <td>${date}</td>
                </tr>
            `;
        }).join('');

        return `
            <div style="overflow-x: auto;">
                <table class="purchase-table">
                    <thead>
                        <tr>
                            <th>ID Compra</th>
                            <th>Película</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    function showNotLoggedIn() {
        contentContainer.innerHTML = `
            <div class="error">
                <h3>Acceso Restringido</h3>
                <p>Debes iniciar sesión para ver las estadísticas.</p>
                <p><a href="/paginas/Autenticacion/login.html" style="color: #ff6b35;">Iniciar Sesión</a></p>
            </div>
        `;
    }

    function showNotAuthorized() {
        contentContainer.innerHTML = `
            <div class="error">
                <h3>Acceso Denegado</h3>
                <p>Solo los administradores pueden ver las estadísticas de compras.</p>
                <p><a href="/paginas/prueba.html" style="color: #ff6b35;">Volver al Inicio</a></p>
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
