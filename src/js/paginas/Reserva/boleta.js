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

    const comboSummaryElement = document.getElementById('combo-summary');
    if (comboSummaryElement && selectedCombo) {
        comboSummaryElement.innerHTML = `
            <h4>${selectedCombo.name}</h4>
            <img src="${selectedCombo.image}" alt="${selectedCombo.name}" style="width: 100px; height: auto; border-radius: 4px; margin-bottom: 5px;">
            <p>${selectedCombo.description}</p>
            <p class="price">S/.${parseFloat(selectedCombo.price).toFixed(2)}</p>
        `;
    } else if (comboSummaryElement) {
        comboSummaryElement.innerHTML = '<p>No seleccionaste ningún combo.</p>';
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

        // 1. Rellenar la NUEVA plantilla PDF
        console.log("Rellenando nueva plantilla PDF...");
        document.getElementById('pdf-new-movie-name').textContent = movieName;
        document.getElementById('pdf-new-seats').textContent = seats;
        // El total price se rellena más abajo después del desglose
        document.getElementById('pdf-new-boleta-id').textContent = idBoleta;
        document.getElementById('pdf-new-boleta-year').textContent = new Date().getFullYear();

        // --- NUEVO: Calcular y mostrar desglose de precios ---
        const comboPrice = selectedCombo ? parseFloat(selectedCombo.price) : 0;
        const ticketPrice = totalPrice - comboPrice;

        document.getElementById('pdf-ticket-cost-value').textContent = ticketPrice.toFixed(2);
        
        const comboCostLineElement = document.getElementById('pdf-combo-cost-line');
        if (selectedCombo && comboCostLineElement) {
            comboCostLineElement.innerHTML = `<p style="margin: 3px 0;">Costo Combo: <span style="float:right;">S/. <span id="pdf-combo-cost-value">${comboPrice.toFixed(2)}</span></span></p>`;
        } else if (comboCostLineElement) {
            comboCostLineElement.innerHTML = ''; // Limpiar si no hay combo
        }
        
        // Rellenar el total pagado final (este ID ya existía y se usa para el total)
        document.getElementById('pdf-new-total-price').textContent = totalPrice.toFixed(2); // Esto actualiza el primer "Total Pagado" en la info general
        document.getElementById('pdf-summary-total-amount').textContent = totalPrice.toFixed(2); // Esto actualiza el "Total Pagado" en el resumen del desglose

        const pdfComboDetails = document.getElementById('pdf-new-combo-details');
        if (pdfComboDetails) {
            if (selectedCombo) {
                pdfComboDetails.innerHTML = `
                    <p style="margin: 5px 0; font-weight: bold;">Combo Seleccionado:</p>
                    <p style="margin: 2px 0; font-size: 9pt;">${selectedCombo.name} - S/.${parseFloat(selectedCombo.price).toFixed(2)}</p>
                `;
                 pdfComboDetails.style.borderTop = "1px dashed #666";
                 pdfComboDetails.style.paddingTop = "8px";
                 pdfComboDetails.style.marginTop = "10px";
            } else {
                pdfComboDetails.innerHTML = '<p style="margin: 5px 0; font-size: 9pt;">Sin combo seleccionado.</p>';
                // Ajustar estilos si no hay combo para que no ocupe espacio innecesario
                pdfComboDetails.style.borderTop = "none";
                pdfComboDetails.style.paddingTop = "0";
                pdfComboDetails.style.marginTop = "5px"; // Menos margen si no hay combo
            }
        } else {
            console.error("Elemento 'pdf-new-combo-details' no encontrado en la plantilla.");
        }

        // 2. Generar QR en el NUEVO canvas
        console.log("Generando QR para nueva plantilla...");
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
                console.log("QR generado para nueva plantilla.");
            } catch (e) {
                console.error("Error generando QR para nueva plantilla:", e);
                qrCanvas.parentElement.innerHTML = "<p style='color:red; font-size:8pt;'>Error al generar QR</p>";
            }
        } else {
            console.error("Canvas 'pdf-new-qr-canvas' para QR no encontrado.");
        }

        // 3. Configurar y generar PDF
        const elementoBoletaPDF = document.getElementById('boleta-pdf-template');
        if (!elementoBoletaPDF) {
            console.error("Elemento de plantilla PDF '#boleta-pdf-template' no encontrado.");
            alert("Error crítico: No se encontró la plantilla para el PDF.");
            downloadPdfButton.disabled = false;
            downloadPdfButton.textContent = 'Descargar Boleta en PDF';
            return;
        }
        
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
            console.log("Antes de captura (nueva plantilla) - offsetTop:", elementoBoletaPDF.offsetTop);
            
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
                console.log("PDF procesado, número de páginas:", pdf.internal.getNumberOfPages());
                if (pdf.internal.getNumberOfPages() === 0) {
                    console.error("¡ALERTA! El PDF generado no tiene páginas.");
                }
            }).save().then(() => {
                console.log("PDF guardado exitosamente.");
            }).catch(err => {
                console.error("Error al generar o guardar el PDF:", err);
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
});