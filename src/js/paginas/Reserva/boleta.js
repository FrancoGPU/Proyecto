document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado y parseado.");

    // --- Recuperar datos de localStorage ---
    const movieName = localStorage.getItem('movieTitle') || 'Película Desconocida';
    const seats = localStorage.getItem('selectedSeats') || 'Asientos no seleccionados';
    const totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0; // Este es el total final
    const purchaseDate = new Date().toLocaleString(); // Para la página visible
    const selectedCombo = JSON.parse(localStorage.getItem('selectedCombo'));

    // --- Mostrar datos en la página HTML principal (la que ve el usuario, no la plantilla PDF) ---
    const movieNameElement = document.getElementById('movie-name');
    if (movieNameElement) movieNameElement.textContent = movieName;

    const seatsElement = document.getElementById('seats');
    if (seatsElement) seatsElement.textContent = seats;

    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) totalPriceElement.textContent = `S/.${totalPrice.toFixed(2)}`;

    const purchaseDateElement = document.getElementById('purchase-date');
    if (purchaseDateElement) purchaseDateElement.textContent = purchaseDate;

    // --- Mostrar combos seleccionados desde el carrito (igual que confirmacion.js) ---
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
                return `<h4>${name}</h4>
                    <img src="${image}" alt="${name}" style="width: 100px; height: auto; border-radius: 4px; margin-bottom: 5px;">
                    <p>${description}</p>
                    <p class="price">S/.${parseFloat(price).toFixed(2)}</p>`;
            }).join('<hr>');
        } else {
            comboSummaryElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
        }
    }

    // --- Recuperar productos del carrito ---
    let cartTotal = 0;
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            cartTotal += parseFloat(item.precio);
        });
    }

    // --- Mostrar productos y butacas en la página ---
    const cartSummaryElement = document.getElementById('cart-summary');
    let cartHTML = '';
    if (seats && totalPrice > 0) {
        cartHTML += `<li class="boleta-list-item"><span class="boleta-item-label">Butacas</span><span class="boleta-item-price">S/.${totalPrice.toFixed(2)}</span></li>`;
    }
    if (cartItems.length > 0) {
        cartItems.forEach(item => {
            cartHTML += `<li class="boleta-list-item"><span class="boleta-item-label">${item.nombre}</span><span class="boleta-item-price">S/.${parseFloat(item.precio).toFixed(2)}</span></li>`;
        });
    } else {
        cartHTML += '<li class="boleta-list-item"><span class="boleta-item-label">No hay productos en el carrito.</span></li>';
    }
    // Mostrar combo seleccionado en el detalle de compra
    if (selectedCombo && selectedCombo.price) {
        cartHTML += `<li class="boleta-list-item"><span class="boleta-item-label">Combo: ${selectedCombo.name}</span><span class="boleta-item-price">S/.${parseFloat(selectedCombo.price).toFixed(2)}</span></li>`;
    }
    if (cartSummaryElement) cartSummaryElement.innerHTML = cartHTML;

    // --- Ajustar el total mostrado sumando butacas, carrito y combo ---
    let comboPrice = selectedCombo && selectedCombo.price ? parseFloat(selectedCombo.price) : 0;
    let entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
    let combinedTotal = entradasPrice + comboPrice + cartTotal;
    if (totalPriceElement) {
        totalPriceElement.textContent = `S/.${combinedTotal.toFixed(2)}`;
    }

    // --- Botón para regresar al inicio ---
    const backToHomeButton = document.getElementById('back-to-home');
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = '/paginas/prueba.html'; // O la página de inicio que corresponda
        });
    }

    // --- Botón para descargar PDF ---
    const downloadPdfButton = document.getElementById('download-pdf-button');
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', generarYDescargarBoletaPDF);
    } else {
        console.error("Botón de descarga PDF no encontrado.");
    }

    // --- Función para generar y descargar el PDF ---
    function generarYDescargarBoletaPDF() {
        console.log("Iniciando generarYDescargarBoletaPDF con nueva plantilla...");
        const idBoleta = `GOCINE-${Date.now()}`;

        // Rellenar la plantilla PDF con los datos correctos
        document.getElementById('pdf-new-movie-name').textContent = movieName;
        document.getElementById('pdf-new-seats').textContent = seats;
        document.getElementById('pdf-new-purchase-date').textContent = purchaseDate;
        document.getElementById('pdf-new-boleta-id').textContent = idBoleta;
        document.getElementById('pdf-new-boleta-year').textContent = new Date().getFullYear();

        // Llenar el detalle de compra (butacas y productos)
        const pdfCartSummary = document.getElementById('pdf-cart-summary');
        let pdfCartHTML = '';
        if (seats && totalPrice > 0) {
            pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>Butacas</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${totalPrice.toFixed(2)}</span></li>`;
        }
        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>${item.nombre}</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${parseFloat(item.precio).toFixed(2)}</span></li>`;
            });
        } else {
            pdfCartHTML += '<li><span style="color:#888">No hay productos en el carrito.</span></li>';
        }
        // Mostrar combo seleccionado en el PDF
        if (selectedCombo && selectedCombo.price) {
            pdfCartHTML += `<li style=\"display:flex;justify-content:space-between;align-items:center;padding:2px 0;\"><span>Combo: ${selectedCombo.name}</span><span style=\"font-weight:bold;min-width:60px;text-align:right;\">S/.${parseFloat(selectedCombo.price).toFixed(2)}</span></li>`;
        }
        if (pdfCartSummary) pdfCartSummary.innerHTML = pdfCartHTML;

        // --- Mostrar combos seleccionados en el PDF ---
        const pdfComboDetails = document.getElementById('pdf-new-combo-details');
        if (pdfComboDetails) {
            if (cartCombos.length > 0) {
                pdfComboDetails.innerHTML = cartCombos.map(c => {
                    const name = c.nombre || c.name || 'Combo';
                    const description = c.descripcion || c.description || '';
                    const price = c.precio || c.price || 0;
                    return `<div><strong>${name}</strong></div><div>${description}</div><div>S/.${parseFloat(price).toFixed(2)}</div>`;
                }).join('<hr>');
            } else {
                pdfComboDetails.innerHTML = '<div style="color:#888">Sin combo seleccionado.</div>';
            }
        }

        // Calcular el total pagado
        let comboPrice = selectedCombo && selectedCombo.price ? parseFloat(selectedCombo.price) : 0;
        let entradasPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
        let cartTotal = 0;
        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                cartTotal += parseFloat(item.precio);
            });
        }
        let combinedTotal = entradasPrice + comboPrice + cartTotal;
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

        downloadPdfButton.textContent = 'Generando PDF...';
        downloadPdfButton.disabled = true;

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
                downloadPdfButton.textContent = 'Descargar Boleta en PDF';
                downloadPdfButton.disabled = false;
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
});