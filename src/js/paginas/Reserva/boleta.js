document.addEventListener('DOMContentLoaded', () => {
    const boletaMovieDiv = document.getElementById('boleta-movie-details');
    const boletaProductsDiv = document.getElementById('boleta-products-details');
    const boletaGrandTotalSpan = document.getElementById('boleta-grand-total');
    const qrCanvas = document.getElementById('qr-code');
    const downloadPdfButton = document.getElementById('download-pdf-button');

    const finalOrder = JSON.parse(localStorage.getItem('finalOrderDetails'));

    if (!finalOrder) {
        alert('No se encontraron detalles de la orden. Redirigiendo...');
        window.location.href = '/paginas/prueba.html';
        return;
    }

    // Display Movie Details
    if (finalOrder.booking && boletaMovieDiv) {
        boletaMovieDiv.innerHTML = `
            <p><strong>Película:</strong> ${finalOrder.booking.movieTitle || 'N/A'}</p>
            <p><strong>Horario:</strong> ${finalOrder.booking.showtime || 'N/A'}</p>
            <p><strong>Asientos:</strong> ${finalOrder.booking.selectedSeats ? finalOrder.booking.selectedSeats.join(', ') : 'N/A'}</p>
            <p><strong>Precio Película:</strong> S/.${(parseFloat(finalOrder.booking.moviePrice) || 0).toFixed(2)}</p>
        `;
    } else if (boletaMovieDiv) {
        boletaMovieDiv.innerHTML = '<p>No se seleccionó película.</p>';
    }

    // Display Product Details
    if (finalOrder.products && finalOrder.products.length > 0 && boletaProductsDiv) {
        let productsHtml = '<ul>';
        finalOrder.products.forEach(item => {
            productsHtml += `<li>${item.name} (x${item.quantity}) - S/.${(item.price * item.quantity).toFixed(2)}</li>`;
        });
        productsHtml += '</ul>';
        boletaProductsDiv.innerHTML = productsHtml;
    } else if (boletaProductsDiv) {
        boletaProductsDiv.innerHTML = '<p>No se añadieron productos adicionales.</p>';
    }

    // Display Grand Total
    if (boletaGrandTotalSpan) {
        boletaGrandTotalSpan.textContent = (parseFloat(finalOrder.totalAmount) || 0).toFixed(2);
    }

    // Generate QR Code
    if (qrCanvas) {
        const qrData = `GOCINE - Orden: ${Date.now()} - Total: S/.${(finalOrder.totalAmount || 0).toFixed(2)}`; // Example QR data
        new QRious({ // eslint-disable-line no-undef
            element: qrCanvas,
            value: qrData,
            size: 150,
            level: 'H'
        });
    }

    // PDF Download
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', () => {
            const element = document.getElementById('boleta-section');
            const opt = {
                margin:       0.5,
                filename:     `GOCINE_Boleta_${Date.now()}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true }, // useCORS if images are from other domains
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save(); // eslint-disable-line no-undef
        });
    }

    // Clear cart and final order details from localStorage after displaying boleta
    // clearCart(); // from cart.js - if you want to clear it now
    localStorage.removeItem('finalOrderDetails');
    localStorage.removeItem('bookingDetails'); // Also clear booking details
    // Consider calling clearCart() from cart.js if it's not cleared elsewhere
});