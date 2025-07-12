// Funcionalidad para la página de facturación

let documentType = 'boleta'; // Por defecto boleta
let purchaseData = null;
let currentUser = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    loadPurchaseData();
    loadUserData();
    initializeEventListeners();
    populateUserData();
});

// Cargar datos de la compra desde localStorage
function loadPurchaseData() {
    // Primero verificar si hay datos del botón de factura en boleta
    let stored = localStorage.getItem('invoicePurchaseData');
    if (stored) {
        purchaseData = JSON.parse(stored);
        // Convertir formato de los datos para compatibilidad
        if (!purchaseData.items) {
            purchaseData.items = [
                {
                    type: 'movie',
                    name: purchaseData.movieTitle,
                    description: `Asientos: ${purchaseData.seats}`,
                    quantity: 1,
                    price: purchaseData.totalPrice
                }
            ];
        }
        displayPurchaseSummary();
        calculateTotals();
        // Limpiar datos después de cargar para evitar conflictos
        localStorage.removeItem('invoicePurchaseData');
        return;
    }
    
    // Si no, verificar sessionStorage (flujo original)
    stored = sessionStorage.getItem('purchaseData');
    if (stored) {
        purchaseData = JSON.parse(stored);
        displayPurchaseSummary();
        calculateTotals();
    } else {
        // Si no hay datos de compra, mostrar mensaje de error
        document.querySelector('.factura-container').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h2>No hay datos de compra</h2>
                <p>Redirigiendo al inicio...</p>
            </div>
        `;
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
            currentUser = await response.json();
            populateUserData();
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

// Poblar datos del usuario en el formulario
function populateUserData() {
    if (currentUser) {
        document.getElementById('buyerName').value = currentUser.username || '';
        document.getElementById('buyerEmail').value = currentUser.email || '';
        document.getElementById('buyerPhone').value = currentUser.phone || '';
    }
}

// Mostrar resumen de compra
function displayPurchaseSummary() {
    const summaryContainer = document.getElementById('purchaseSummary');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    if (!purchaseData || !purchaseData.items) return;
    
    purchaseData.items.forEach(item => {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        
        let itemDescription = '';
        if (item.type === 'movie') {
            itemDescription = item.description || `Película: ${item.name}`;
        } else if (item.type === 'combo') {
            itemDescription = item.description || item.name;
        }
        
        summaryItem.innerHTML = `
            <div class="item-info">
                <h4>
                    ${item.name}
                    ${item.quantity > 1 ? `<span class="item-quantity">x${item.quantity}</span>` : ''}
                </h4>
                <p>${itemDescription}</p>
            </div>
            <div class="item-price">S/. ${(item.price * item.quantity).toFixed(2)}</div>
        `;
        
        summaryContainer.appendChild(summaryItem);
    });
}

// Calcular totales
function calculateTotals() {
    if (!purchaseData || !purchaseData.items) return;
    
    let subtotal = 0;
    purchaseData.items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Aplicar descuento si el usuario tiene rango con descuento
    let discountPercent = 0;
    let discountAmount = 0;
    
    if (currentUser && currentUser.discount_percentage) {
        discountPercent = parseFloat(currentUser.discount_percentage);
        discountAmount = subtotal * (discountPercent / 100);
    }
    
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * 0.18; // IGV 18%
    const total = subtotalAfterDiscount + taxAmount;
    
    // Calcular puntos a ganar
    const pointsToEarn = currentUser && currentUser.points_multiplier 
        ? Math.floor(total * parseFloat(currentUser.points_multiplier))
        : Math.floor(total);
    
    // Actualizar UI
    document.getElementById('subtotalAmount').textContent = `S/. ${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `S/. ${taxAmount.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `S/. ${total.toFixed(2)}`;
    document.getElementById('pointsToEarn').textContent = pointsToEarn;
    
    // Mostrar/ocultar descuento
    const discountRow = document.getElementById('discountRow');
    if (discountAmount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('discountPercent').textContent = discountPercent;
        document.getElementById('discountAmount').textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    // Guardar totales para uso posterior
    purchaseData.totals = {
        subtotal,
        discountPercent,
        discountAmount,
        taxAmount,
        total,
        pointsToEarn
    };
}

// Seleccionar tipo de documento
function selectDocumentType(type) {
    documentType = type;
    
    // Actualizar botones
    document.querySelectorAll('.document-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Mostrar/ocultar datos de empresa
    const companyData = document.getElementById('companyData');
    if (type === 'factura') {
        companyData.style.display = 'block';
        // Hacer campos requeridos
        document.getElementById('companyName').required = true;
        document.getElementById('companyRuc').required = true;
        document.getElementById('companyAddress').required = true;
    } else {
        companyData.style.display = 'none';
        // Quitar requerimiento
        document.getElementById('companyName').required = false;
        document.getElementById('companyRuc').required = false;
        document.getElementById('companyAddress').required = false;
    }
    
    // Actualizar texto del botón
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Generar ${type === 'factura' ? 'Factura' : 'Boleta'}
    `;
}

// Inicializar event listeners
function initializeEventListeners() {
    document.getElementById('invoiceForm').addEventListener('submit', handleFormSubmit);
    
    // Validación de RUC en tiempo real
    document.getElementById('companyRuc').addEventListener('input', function() {
        const ruc = this.value;
        if (ruc.length === 11) {
            validateRUC(ruc);
        }
    });
    
    // Validación de DNI
    document.getElementById('buyerDocument').addEventListener('input', function() {
        const dni = this.value;
        if (dni.length === 8) {
            validateDNI(dni);
        }
    });
}

// Validar RUC (simulado)
function validateRUC(ruc) {
    // Aquí iría la validación real del RUC con SUNAT
    // Por ahora, solo validamos el formato
    if (!/^[0-9]{11}$/.test(ruc)) {
        showFieldError('companyRuc', 'RUC debe tener 11 dígitos');
        return false;
    }
    
    clearFieldError('companyRuc');
    return true;
}

// Validar DNI (simulado)
function validateDNI(dni) {
    // Aquí iría la validación real del DNI con RENIEC
    if (!/^[0-9]{8}$/.test(dni)) {
        showFieldError('buyerDocument', 'DNI debe tener 8 dígitos');
        return false;
    }
    
    clearFieldError('buyerDocument');
    return true;
}

// Mostrar error en campo
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '#F44336';
    
    // Remover mensaje de error anterior
    clearFieldError(fieldId);
    
    // Agregar mensaje de error
    const errorMsg = document.createElement('small');
    errorMsg.style.color = '#F44336';
    errorMsg.textContent = message;
    errorMsg.className = 'error-message';
    field.parentNode.appendChild(errorMsg);
}

// Limpiar error de campo
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '';
    
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Manejar envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const invoiceData = {
        documentType,
        buyerName: formData.get('buyerName'),
        buyerDocument: formData.get('buyerDocument'),
        buyerEmail: formData.get('buyerEmail'),
        buyerPhone: formData.get('buyerPhone'),
        paymentMethod: formData.get('paymentMethod'),
        purchaseData,
        totals: purchaseData.totals
    };
    
    // Agregar datos de empresa si es factura
    if (documentType === 'factura') {
        invoiceData.companyName = formData.get('companyName');
        invoiceData.companyRuc = formData.get('companyRuc');
        invoiceData.companyAddress = formData.get('companyAddress');
    }
    
    // Validar datos
    if (!validateInvoiceData(invoiceData)) {
        return;
    }
    
    try {
        // Generar documento
        const response = await fetch('/api/generate-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showDocumentPreview(result);
        } else {
            const error = await response.json();
            alert(error.message || 'Error al generar documento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar documento');
    }
}

// Validar datos de la factura
function validateInvoiceData(data) {
    // Validaciones básicas
    if (!data.buyerName.trim()) {
        alert('El nombre del comprador es requerido');
        return false;
    }
    
    if (!data.buyerDocument.trim()) {
        alert('El documento del comprador es requerido');
        return false;
    }
    
    if (!data.buyerEmail.trim()) {
        alert('El email del comprador es requerido');
        return false;
    }
    
    if (!data.paymentMethod) {
        alert('Debe seleccionar un método de pago');
        return false;
    }
    
    // Validaciones específicas para factura
    if (data.documentType === 'factura') {
        if (!data.companyName.trim()) {
            alert('La razón social es requerida para facturas');
            return false;
        }
        
        if (!validateRUC(data.companyRuc)) {
            alert('RUC inválido');
            return false;
        }
        
        if (!data.companyAddress.trim()) {
            alert('La dirección fiscal es requerida para facturas');
            return false;
        }
    }
    
    return true;
}

// Mostrar vista previa del documento
function showDocumentPreview(documentData) {
    const preview = document.getElementById('documentPreview');
    const content = document.getElementById('previewContent');
    
    content.innerHTML = generateDocumentHTML(documentData);
    preview.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Generar HTML del documento
function generateDocumentHTML(data) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const documentTitle = documentType === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA';
    
    return `
        <div class="generated-document">
            <div class="document-header">
                <div class="company-info">
                    <h1>GoCine</h1>
                    <p>Entretenimiento Cinematográfico S.A.C.</p>
                    <p>RUC: 20123456789</p>
                    <p>Av. Principal 123, Lima, Perú</p>
                    <p>Teléfono: (01) 123-4567</p>
                </div>
                <div class="document-info">
                    <h2>${documentTitle}</h2>
                    <div class="document-number">${data.documentNumber}</div>
                    <p>Fecha: ${currentDate}</p>
                </div>
            </div>
            
            <div class="client-info">
                <h3>${documentType === 'factura' ? 'Datos del Cliente' : 'Datos del Comprador'}</h3>
                <div class="client-details">
                    ${documentType === 'factura' ? `
                        <div class="detail-item">
                            <span class="detail-label">Razón Social:</span>
                            <span class="detail-value">${data.companyName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">RUC:</span>
                            <span class="detail-value">${data.companyRuc}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Dirección:</span>
                            <span class="detail-value">${data.companyAddress}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="detail-label">${documentType === 'factura' ? 'Contacto' : 'Nombre'}:</span>
                        <span class="detail-value">${data.buyerName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Documento:</span>
                        <span class="detail-value">${data.buyerDocument}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${data.buyerEmail}</span>
                    </div>
                    ${data.buyerPhone ? `
                        <div class="detail-item">
                            <span class="detail-label">Teléfono:</span>
                            <span class="detail-value">${data.buyerPhone}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                ${item.description ? `<br><small>${item.description}</small>` : ''}
                            </td>
                            <td>${item.quantity}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td>$${data.totals.subtotal.toFixed(2)}</td>
                </tr>
                ${data.totals.discountAmount > 0 ? `
                    <tr>
                        <td>Descuento (${data.totals.discountPercent}%):</td>
                        <td>-$${data.totals.discountAmount.toFixed(2)}</td>
                    </tr>
                ` : ''}
                <tr>
                    <td>IGV (18%):</td>
                    <td>$${data.totals.taxAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td>TOTAL:</td>
                    <td>$${data.totals.total.toFixed(2)}</td>
                </tr>
            </table>
            
            <div class="document-footer">
                <p>Método de Pago: ${getPaymentMethodName(data.paymentMethod)}</p>
                <p>Puntos ganados: ${data.totals.pointsToEarn}</p>
                <br>
                <p>Gracias por su preferencia - GoCine</p>
                <p>Este documento ha sido generado electrónicamente</p>
            </div>
        </div>
    `;
}

// Obtener nombre del método de pago
function getPaymentMethodName(method) {
    const methods = {
        'efectivo': 'Efectivo',
        'tarjeta_credito': 'Tarjeta de Crédito',
        'tarjeta_debito': 'Tarjeta de Débito',
        'transferencia': 'Transferencia Bancaria',
        'pago_movil': 'Pago Móvil'
    };
    return methods[method] || method;
}

// Cerrar vista previa
function closePreview() {
    document.getElementById('documentPreview').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Descargar documento como PDF
function downloadDocument() {
    // Aquí iría la funcionalidad para generar y descargar PDF
    // Por ahora, simularemos la descarga
    alert('Descarga iniciada. El documento se guardará en su carpeta de descargas.');
}

// Confirmar compra
async function confirmPurchase() {
    try {
        const response = await fetch('/api/confirm-purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                documentType,
                purchaseData,
                invoiceData: getCurrentInvoiceData()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('¡Compra confirmada exitosamente!');
            
            // Limpiar datos de sesión
            sessionStorage.removeItem('purchaseData');
            
            // Redirigir a página de confirmación
            window.location.href = 'confirmacion.html?purchaseId=' + result.purchaseId;
        } else {
            const error = await response.json();
            alert(error.message || 'Error al confirmar compra');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al confirmar compra');
    }
}

// Obtener datos actuales de la factura
function getCurrentInvoiceData() {
    const form = document.getElementById('invoiceForm');
    const formData = new FormData(form);
    
    const data = {
        documentType,
        buyerName: formData.get('buyerName'),
        buyerDocument: formData.get('buyerDocument'),
        buyerEmail: formData.get('buyerEmail'),
        buyerPhone: formData.get('buyerPhone'),
        paymentMethod: formData.get('paymentMethod')
    };
    
    if (documentType === 'factura') {
        data.companyName = formData.get('companyName');
        data.companyRuc = formData.get('companyRuc');
        data.companyAddress = formData.get('companyAddress');
    }
    
    return data;
}

// Volver a la página anterior
function goBack() {
    if (confirm('¿Está seguro que desea volver? Se perderán los datos ingresados.')) {
        window.history.back();
    }
}
