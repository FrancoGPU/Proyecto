document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM completamente cargado y parseado.");

    // Verificar estado VIP del usuario
    let userVipStatus = { isVip: false, discountPercentage: 0 };
    try {
        const sessionResponse = await fetch('/api/session/status');
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            if (sessionData.loggedIn && sessionData.user) {
                const vipResponse = await fetch('/api/user/vip-status');
                if (vipResponse.ok) {
                    userVipStatus = await vipResponse.json();
                    console.log('Estado VIP en boleta:', userVipStatus);
                }
            }
        }
    } catch (error) {
        console.error('Error al verificar estado VIP en boleta:', error);
    }

    // Función para calcular precio con descuento VIP
    function getVipPrice(originalPrice, vipStatus) {
        if (!vipStatus.isVip || !originalPrice) return originalPrice;
        const discount = (originalPrice * vipStatus.discountPercentage) / 100;
        return originalPrice - discount;
    }

    // Función para crear elemento de precio con descuento VIP
    function createPriceDisplay(originalPrice, vipStatus) {
        if (!vipStatus.isVip) {
            return `S/.${parseFloat(originalPrice).toFixed(2)}`;
        }
        
        const vipPrice = getVipPrice(originalPrice, vipStatus);
        return `
            <span class="vip-price-container">
                <span class="original-price">S/.${parseFloat(originalPrice).toFixed(2)}</span>
                <span class="vip-price">S/.${vipPrice.toFixed(2)} ⭐VIP</span>
            </span>
        `;
    }

    // --- Recuperar datos de localStorage ---
    const movieName = localStorage.getItem('movieTitle') || 'Película Desconocida';
    const seats = localStorage.getItem('selectedSeats') || 'Asientos no seleccionados';
    // Usar el total final con descuentos si está disponible, sino el original
    const finalTotalPrice = parseFloat(localStorage.getItem('finalTotalPrice'));
    const originalTotalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    const totalPrice = finalTotalPrice || originalTotalPrice;
    // Usar la fecha de compra registrada o la actual como fallback
    const purchaseDate = localStorage.getItem('purchaseDate') ? 
        new Date(localStorage.getItem('purchaseDate')).toLocaleString() : 
        new Date().toLocaleString();
    const selectedCombo = JSON.parse(localStorage.getItem('selectedCombo'));

    // --- Mostrar datos en la página HTML principal con descuentos VIP ---
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) {
        const entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
        const entradasPriceDisplay = createPriceDisplay(entradasPrice, userVipStatus);
        movieNameElement.innerHTML = `${movieName}<br><small><strong>Precio entradas:</strong> ${entradasPriceDisplay}</small>`;
    }

    const seatsElement = document.getElementById('seats');
    if (seatsElement) seatsElement.textContent = seats;

    const purchaseDateElement = document.getElementById('purchase-date');
    if (purchaseDateElement) purchaseDateElement.textContent = purchaseDate;

    // Seleccionar elemento del precio total
    const totalPriceElement = document.getElementById('total-price');

    // --- Mostrar combos seleccionados desde el carrito con descuentos VIP ---
    // Filtrar combos del carrito (id_combo)
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCombos = Array.isArray(cartItems) ? cartItems.filter(item => item.id_combo) : [];
    const comboSummaryElement = document.getElementById('combo-summary');
    if (comboSummaryElement) {
        if (cartCombos.length > 0) {
            comboSummaryElement.innerHTML = cartCombos.map(c => {
                const name = c.nombre || c.name || 'Combo';
                const image = c.imagen || c.image || '';
                const description = c.descripcion || c.description || '';
                const price = c.precio || c.price || 0;
                const priceDisplay = createPriceDisplay(price, userVipStatus);
                return `<h4>${name}</h4>
                    <img src="${image}" alt="${name}" style="width: 100px; height: auto; border-radius: 4px; margin-bottom: 5px;">
                    <p>${description}</p>
                    <p class="price">${priceDisplay}</p>`;
            }).join('<hr>');
        } else {
            comboSummaryElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
        }
    }

    // --- Recuperar productos del carrito con descuentos VIP ---
    let cartTotal = 0;
    let originalCartTotal = 0;
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            const originalPrice = parseFloat(item.precio || item.price || 0);
            const finalPrice = getVipPrice(originalPrice, userVipStatus);
            originalCartTotal += originalPrice;
            cartTotal += finalPrice;
        });
    }

    // --- Mostrar productos y butacas en la página con descuentos VIP ---
    const cartSummaryElement = document.getElementById('cart-summary');
    let cartHTML = '';
    
    // Mostrar butacas con descuento VIP si aplica
    if (seats && totalPrice > 0) {
        const entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
        const finalEntradasPrice = getVipPrice(entradasPrice, userVipStatus);
        const priceDisplay = createPriceDisplay(entradasPrice, userVipStatus);
        cartHTML += `<li class="boleta-list-item"><span class="boleta-item-label">Butacas</span><span class="boleta-item-price">${priceDisplay}</span></li>`;
    }
    
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            const nombre = item.nombre || item.name || 'Producto';
            const precio = item.precio || item.price || 0;
            const priceDisplay = createPriceDisplay(precio, userVipStatus);
            cartHTML += `<li class="boleta-list-item"><span class="boleta-item-label">${nombre}</span><span class="boleta-item-price">${priceDisplay}</span></li>`;
        });
    } else {
        cartHTML += '<li class="boleta-list-item"><span class="boleta-item-label">No hay productos en el carrito.</span></li>';
    }
    
    // Mostrar combo seleccionado en el detalle de compra con descuento VIP
    if (selectedCombo && selectedCombo.price) {
        const priceDisplay = createPriceDisplay(selectedCombo.price, userVipStatus);
        cartHTML += `<li class="boleta-list-item"><span class="boleta-item-label">Combo: ${selectedCombo.name}</span><span class="boleta-item-price">${priceDisplay}</span></li>`;
    }
    
    if (cartSummaryElement) cartSummaryElement.innerHTML = cartHTML;

    // --- Ajustar el total mostrado sumando butacas, carrito y combo con descuentos VIP ---
    let comboPrice = selectedCombo && selectedCombo.price ? parseFloat(selectedCombo.price) : 0;
    let finalComboPrice = getVipPrice(comboPrice, userVipStatus);
    let entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    let finalEntradasPrice = getVipPrice(entradasPrice, userVipStatus);
    let combinedTotal = finalEntradasPrice + finalComboPrice + cartTotal;
    
    if (totalPriceElement) {
        if (userVipStatus.isVip) {
            let originalCombinedTotal = entradasPrice + comboPrice + originalCartTotal;
            totalPriceElement.innerHTML = `
                <span class="vip-price-container">
                    <span class="original-price">S/.${originalCombinedTotal.toFixed(2)}</span>
                    <span class="vip-price">S/.${combinedTotal.toFixed(2)} ⭐VIP (-${userVipStatus.discountPercentage}%)</span>
                </span>
            `;
        } else {
            totalPriceElement.textContent = `S/.${combinedTotal.toFixed(2)}`;
        }
    }

    // --- Botón para regresar al inicio ---
    function setupButtons() {
        const backToHomeButton = document.getElementById('back-to-home');
        if (backToHomeButton) {
            console.log('Botón "Regresar al Inicio" encontrado, configurando evento...');
            backToHomeButton.addEventListener('click', () => {
                console.log('Botón "Regresar al Inicio" clickeado');
                window.location.href = '/paginas/prueba.html'; // Ruta corregida
            });
        } else {
            console.error("Botón 'back-to-home' no encontrado.");
        }

        // --- Botón para descargar PDF ---
        const downloadPdfButton = document.getElementById('download-pdf-button');
        if (downloadPdfButton) {
            console.log('Botón "Descargar PDF" encontrado, configurando evento...');
            downloadPdfButton.addEventListener('click', generarYDescargarBoletaPDF);
        } else {
            console.error("Botón 'download-pdf-button' no encontrado.");
        }
    }

    // Configurar botones después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(setupButtons, 100);

    // --- Función para generar y descargar el PDF ---
    function generarYDescargarBoletaPDF() {
        console.log("Iniciando generarYDescargarBoletaPDF con nueva plantilla...");
        
        // Verificar que html2pdf esté disponible
        if (typeof html2pdf === 'undefined') {
            console.error('html2pdf no está disponible');
            alert('Error: No se puede generar el PDF. Biblioteca no cargada.');
            return;
        }
        
        // Usar el ID de compra registrado o generar uno nuevo como fallback
        const idBoleta = localStorage.getItem('purchaseId') || `GOCINE-${Date.now()}`;
        const purchaseDate = localStorage.getItem('purchaseDate') ? 
            new Date(localStorage.getItem('purchaseDate')).toLocaleString() : 
            new Date().toLocaleString();

        // Rellenar la plantilla PDF con los datos correctos
        document.getElementById('pdf-new-movie-name').textContent = movieName;
        document.getElementById('pdf-new-seats').textContent = seats;
        document.getElementById('pdf-new-purchase-date').textContent = purchaseDate;
        document.getElementById('pdf-new-boleta-id').textContent = idBoleta;
        document.getElementById('pdf-new-boleta-year').textContent = new Date().getFullYear();

        // Llenar el detalle de compra (butacas y productos) con descuentos VIP
        const pdfCartSummary = document.getElementById('pdf-cart-summary');
        let pdfCartHTML = '';
        
        // Mostrar butacas con descuento VIP si aplica
        if (seats && totalPrice > 0) {
            const entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
            const finalEntradasPrice = getVipPrice(entradasPrice, userVipStatus);
            if (userVipStatus.isVip) {
                pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>Butacas (VIP -${userVipStatus.discountPercentage}%)</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${finalEntradasPrice.toFixed(2)}</span></li>`;
            } else {
                pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>Butacas</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${totalPrice.toFixed(2)}</span></li>`;
            }
        }
        
        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                const nombre = item.nombre || item.name || 'Producto';
                const precio = item.precio || item.price || 0;
                const finalPrice = getVipPrice(precio, userVipStatus);
                if (userVipStatus.isVip) {
                    pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>${nombre} (VIP -${userVipStatus.discountPercentage}%)</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${finalPrice.toFixed(2)}</span></li>`;
                } else {
                    pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>${nombre}</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${parseFloat(precio).toFixed(2)}</span></li>`;
                }
            });
        } else {
            pdfCartHTML += '<li><span style="color:#888">No hay productos en el carrito.</span></li>';
        }
        
        // Mostrar combo seleccionado en el PDF con descuento VIP
        if (selectedCombo && selectedCombo.price) {
            const finalComboPrice = getVipPrice(selectedCombo.price, userVipStatus);
            if (userVipStatus.isVip) {
                pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>Combo: ${selectedCombo.name} (VIP -${userVipStatus.discountPercentage}%)</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${finalComboPrice.toFixed(2)}</span></li>`;
            } else {
                pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>Combo: ${selectedCombo.name}</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${parseFloat(selectedCombo.price).toFixed(2)}</span></li>`;
            }
        }
        if (pdfCartSummary) pdfCartSummary.innerHTML = pdfCartHTML;

        // --- Mostrar combos seleccionados en el PDF con descuentos VIP ---
        const pdfComboDetails = document.getElementById('pdf-new-combo-details');
        if (pdfComboDetails) {
            if (cartCombos.length > 0) {
                pdfComboDetails.innerHTML = cartCombos.map(c => {
                    const name = c.nombre || c.name || 'Combo';
                    const description = c.descripcion || c.description || '';
                    const price = c.precio || c.price || 0;
                    const finalPrice = getVipPrice(price, userVipStatus);
                    const priceText = userVipStatus.isVip ? 
                        `S/.${finalPrice.toFixed(2)} (VIP -${userVipStatus.discountPercentage}%)` : 
                        `S/.${parseFloat(price).toFixed(2)}`;
                    return `<div><strong>${name}</strong></div><div>${description}</div><div>${priceText}</div>`;
                }).join('<hr>');
            } else {
                pdfComboDetails.innerHTML = '<div style="color:#888">Sin combo seleccionado.</div>';
            }
        }

        // Calcular el total pagado con descuentos VIP
        let comboPrice = selectedCombo && selectedCombo.price ? parseFloat(selectedCombo.price) : 0;
        let finalComboPrice = getVipPrice(comboPrice, userVipStatus);
        let entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
        let finalEntradasPrice = getVipPrice(entradasPrice, userVipStatus);
        let combinedTotal = finalEntradasPrice + finalComboPrice + cartTotal;
        
        const pdfSummaryTotalAmount = document.getElementById('pdf-summary-total-amount');
        const pdfNewTotalPrice = document.getElementById('pdf-new-total-price');
        if (pdfSummaryTotalAmount) pdfSummaryTotalAmount.textContent = `S/. ${combinedTotal.toFixed(2)}`;
        if (pdfNewTotalPrice) pdfNewTotalPrice.textContent = `S/.${combinedTotal.toFixed(2)}`;

        // Generar QR
        const qrCanvas = document.getElementById('pdf-new-qr-canvas');
        if (qrCanvas) {
            try {
                new QRious({
                    element: qrCanvas,
                    value: `ID Boleta: ${idBoleta}, Película: ${movieName}, Asientos: ${seats}`,
                    size: 80,
                    level: 'M',
                    background: 'white',
                    foreground: 'black'
                });
            } catch (e) {
                qrCanvas.parentElement.innerHTML = "<p style='color:red; font-size:8pt;'>Error al generar QR</p>";
            }
        }

        // Mostrar y generar PDF
        const elementoBoletaPDF = document.getElementById('boleta-pdf-template');
        if (!elementoBoletaPDF) return;
        const originalStyle = {
            display: elementoBoletaPDF.style.display,
            margin: elementoBoletaPDF.style.margin,
            padding: elementoBoletaPDF.style.padding,
            position: elementoBoletaPDF.style.position,
            top: elementoBoletaPDF.style.top,
            left: elementoBoletaPDF.style.left,
            zIndex: elementoBoletaPDF.style.zIndex,
            border: elementoBoletaPDF.style.border
        };
        elementoBoletaPDF.style.position = 'fixed';
        elementoBoletaPDF.style.top = '0px';
        elementoBoletaPDF.style.left = '0px';
        elementoBoletaPDF.style.margin = '0';
        elementoBoletaPDF.style.border = 'none';
        elementoBoletaPDF.style.zIndex = '10000';
        elementoBoletaPDF.style.display = 'block';

        // Get the download button reference within this function scope
        const downloadPdfButton = document.getElementById('download-pdf-button');
        if (downloadPdfButton) {
            downloadPdfButton.textContent = 'Generando PDF...';
            downloadPdfButton.disabled = true;
        }

        setTimeout(() => {
            const opt = {
                margin: 0,
                filename: `boleta_gocine_${idBoleta}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2.5,
                    useCORS: true,
                    logging: true,
                    width: elementoBoletaPDF.offsetWidth,
                    height: elementoBoletaPDF.offsetHeight,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: elementoBoletaPDF.offsetWidth,
                    windowHeight: elementoBoletaPDF.offsetHeight
                },
                jsPDF: {
                    unit: 'in',
                    format: [4.2, 7.5],
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().from(elementoBoletaPDF).set(opt).toPdf().get('pdf').then(function (pdf) {
                if (pdf.internal.getNumberOfPages() === 0) {
                    console.error("¡ALERTA! El PDF generado no tiene páginas.");
                }
            }).save().then(() => {
                // PDF guardado
            }).catch(err => {
                alert("Hubo un error al generar el PDF. Revisa la consola.");
            }).finally(() => {
                elementoBoletaPDF.style.display = originalStyle.display;
                elementoBoletaPDF.style.margin = originalStyle.margin;
                elementoBoletaPDF.style.padding = originalStyle.padding;
                elementoBoletaPDF.style.position = originalStyle.position;
                elementoBoletaPDF.style.top = originalStyle.top;
                elementoBoletaPDF.style.left = originalStyle.left;
                elementoBoletaPDF.style.zIndex = originalStyle.zIndex;
                elementoBoletaPDF.style.border = originalStyle.border;
                if (downloadPdfButton) {
                    downloadPdfButton.textContent = 'Descargar Boleta en PDF';
                    downloadPdfButton.disabled = false;
                }
            });
        }, 500);
    }

    // --- Vaciar el carrito automáticamente al cargar la boleta (compra completada) ---
    localStorage.removeItem('cart');
    if (typeof window.cart !== 'undefined') window.cart = [];
    // Si hay renderCartItems disponible, actualizar el header si está presente
    if (typeof window.renderCartItems === 'function') {
        window.renderCartItems();
    }
    
    // Funcionalidad para generar factura
    const generateInvoiceButton = document.getElementById('generate-invoice-button');
    if (generateInvoiceButton) {
        generateInvoiceButton.addEventListener('click', function() {
            // Recopilar datos de la compra actual
            const purchaseData = {
                movieTitle: movieName,
                seats: seats,
                totalPrice: totalPrice,
                originalTotal: originalTotalPrice,
                purchaseDate: new Date().toISOString(),
                vipDiscount: userVipStatus.isVip ? userVipStatus.discountPercentage : 0
            };

            // Guardar datos para la factura
            localStorage.setItem('invoicePurchaseData', JSON.stringify(purchaseData));
            
            // Redirigir a la página de factura
            window.location.href = '/paginas/Reserva/factura.html';
        });
    }
});